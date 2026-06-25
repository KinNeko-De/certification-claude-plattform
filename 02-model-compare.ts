import { query, SDKMessage, SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";

type AssistantContent = { type: string; text: string };

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

    let text: string | undefined;
    let stats: string | undefined;

    for await (const message of response) {
        text = getOutput(message) ?? text;
        stats = getStats(model, message) ?? stats;
    }


    console.log(stats)
    console.log(text);
}

function getOutput(message: SDKMessage): string | undefined {
    if (message.type === "assistant") {
        return message.message.content
            .filter((b: AssistantContent) => b.type === "text")
            .map((b: AssistantContent) => b.text)
            .join("");
    }
}

function getStats(model: string, message: SDKMessage): string | undefined {
    if (message.type === "result") {
        return `\n[${model}] ${message.duration_api_ms}ms in=${message.usage.input_tokens} out=${message.usage.output_tokens}`;
    }
}
