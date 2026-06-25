import { query, SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";

const models = [
    "claude-haiku-4-5",
    "claude-sonnet-4-6",
    "claude-opus-4-8"
]

const prompt = "Explain prompt caching in two sentences.";

async function* messages(): AsyncGenerator<SDKUserMessage> {
    yield {
        type: "user",
        parent_tool_use_id: null,
        session_id: "",
        message: {
            role: "user",
            content: prompt,
        },
    };
}

for (const model of models) {
    const response = query({
        prompt: messages(),
        options: { model },
    });

    for await (const message of response) {
        if (message.type === "result" && message.subtype === "success") {
            console.log(`\n[${model}] ${message.duration_api_ms}ms in=${message.usage.input_tokens} out=${message.usage.output_tokens}`);
            console.log(message.result);
        }
    }
}
