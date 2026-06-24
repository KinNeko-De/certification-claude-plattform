import { query, SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";

async function* messages(): AsyncGenerator<SDKUserMessage> {
  yield {
    type: "user",
    parent_tool_use_id: null,
    session_id: "",
    message: {
      role: "user",
      content: "Hello, Claude",
    },
  };
}

const response = query({
  prompt:  messages(),
  options: {
    model: "claude-haiku-4-5",
    maxThinkingTokens: 1024 // original maxToken
  },
});

for await (const message of response) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}
