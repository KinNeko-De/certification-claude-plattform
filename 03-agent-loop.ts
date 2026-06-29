import {
  query,
  tool,
  createSdkMcpServer,
  type SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const WEATHER: Record<string, { temp_f: number; conditions: string }> = {
  "san francisco": { temp_f: 62, conditions: "foggy" },
  austin: { temp_f: 88, conditions: "sunny" },
};

// The Agent SDK runs the agent loop for us. We expose get_weather as an
// in-process MCP tool instead of executing it by hand in a while-loop.
const weatherServer = createSdkMcpServer({
  name: "weather",
  tools: [
    tool(
      "get_weather",
      "Get the current weather for a city.",
      { city: z.string() },
      async ({ city }) => {
        const out = WEATHER[city.toLowerCase()] ?? { error: `unknown city: ${city}` };
        console.log(`  tool: get_weather(${JSON.stringify({ city })}) -> ${JSON.stringify(out)}`);
        return { content: [{ type: "text", text: JSON.stringify(out) }] };
      },
    ),
  ],
});

// SDK MCP tools are addressed as mcp__<server>__<tool>.
const WEATHER_TOOL = "mcp__weather__get_weather";

async function* prompt(): AsyncGenerator<SDKUserMessage> {
  yield {
    type: "user",
    parent_tool_use_id: null,
    session_id: "",
    message: {
      role: "user",
      content: "What should I wear in Austin today?",
    },
  };
}

const response = query({
  prompt: prompt(),
  options: {
    model: "claude-haiku-4-5",
    mcpServers: { weather: weatherServer },
    tools: [], // no built-in Claude Code tools — only our weather tool
    allowedTools: [WEATHER_TOOL], // auto-allow, no permission prompt
  },
});

// The SDK streams every step of the loop to us; we just observe it.
let turn = 0;

for await (const message of response) {
  turn++;
  console.log(`\n--- turn ${turn} (${message.type}) ---`);

  if (message.type === "system" && message.subtype === "init") {
    console.log(`  model: ${message.model}, tools: ${message.tools.join(", ") || "(none)"}`);
  }

  if (message.type === "assistant") {
    for (const block of message.message.content) {
      if (block.type === "text") {
        console.log(`  text: ${block.text}`);
      } else if (block.type === "tool_use") {
        console.log(`  tool_use: ${block.name}(${JSON.stringify(block.input)})`);
      }
    }
  }

  if (message.type === "user") {
    // The SDK injects the tool_result back into the conversation as a user turn.
    const content = message.message.content;
    if (typeof content === "string") {
      console.log(`  ${content}`);
    } else {
      for (const block of content) {
        if (block.type === "tool_result") {
          console.log(`  tool_result: ${JSON.stringify(block.content)}`);
        }
      }
    }
  }

  if (message.type === "result" && message.subtype === "success") {
    console.log(`  FINAL: ${message.result}`);
  }
}
