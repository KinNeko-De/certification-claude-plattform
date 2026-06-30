// this example has limited usage. the idea was to demonstrate server tools ( server_tool_use ) but for claude sdk there is no server
// The example only uses local tools

import { query, type SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";

async function* makePrompt(text: string): AsyncGenerator<SDKUserMessage> {
  yield {
    type: "user",
    parent_tool_use_id: null,
    session_id: "",
    message: { role: "user", content: text },
  };
}

async function runScenario(
  label: string,
  userText: string,
  tools: string[],
): Promise<void> {
  console.log(`\n=== ${label} ===`);

  const response = query({
    prompt: makePrompt(userText),
    options: {
      model: "claude-sonnet-4-6",
      tools,
      allowedTools: tools,
    },
  });

  for await (const message of response) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          console.log(block.text);
        } else if (block.type === "tool_use") {
          console.log(`Tool call: ${block.name} — ${JSON.stringify(block.input)}`);
        }
      }
    }

    if (message.type === "result" && message.subtype === "success") {
      console.log(`Result: ${message.result}`);
    }
  }
}

// Scenario 1: web search — agent uses the built-in WebSearch tool
await runScenario(
  "Web Search",
  "What is Anthropic's latest model release? Answer in one sentence.",
  ["WebSearch"],
);

// Scenario 2: code execution — agent writes and runs code via the Bash tool
// Note: the example in the video is different from the python code provided in the tutorial
await runScenario(
  "Code Execution",
  "Calculate the mean and standard deviation of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
  ["Bash"],
);
