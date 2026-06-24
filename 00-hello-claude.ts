import { query } from "@anthropic-ai/claude-agent-sdk";

const response = query({
  prompt: "Hello, Claude",
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
