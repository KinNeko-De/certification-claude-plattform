import { query, SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";

const buggyCode = `
function add(a, b) {
  return a - b;
}
`;

async function* messages(): AsyncGenerator<SDKUserMessage> {
  yield {
    type: "user",
    parent_tool_use_id: null,
    session_id: "",
    message: {
      role: "user",
      content: `Review this code:\n${buggyCode}`,
    },
  };
}

const response = query({
  prompt: messages(),
  options: {
    model: "claude-haiku-4-5",
    systemPrompt: "You are a terse senior code reviewer. Give feedback in one paragraph."
  },
});

for await (const message of response) {
  if (message.type === "assistant") { // exclude system prompt
    for (const block of message.message.content) {

      if (block.type === "text") { // exclude thinking
        console.log(block.text);
      }
    }
  }
}