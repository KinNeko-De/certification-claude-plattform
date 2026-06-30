// converted from the python code in the tutorial
// differs from the typescript code in the video
// change also model to sonnet

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Call 1: web search — Anthropic runs the search server-side
const searchResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    tools: [{ type: "web_search_20260209", name: "web_search" }],
    messages: [
        {
            role: "user",
            content:
                "What is Anthropic's latest model release? Answer in one sentence.",
        },
    ],
});

for (const block of searchResponse.content) {
    if (block.type === "server_tool_use") {
        console.log(`Tool call: ${block.name} — ${JSON.stringify(block.input)}`);
    } else if (block.type === "text") {
        console.log(block.text);
    }
}

// Call 2: code execution — Claude writes and runs Python in a sandbox
const codeResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    tools: [{ type: "code_execution_20260120", name: "code_execution" }],
    messages: [
        {
            role: "user",
            content:
                "Calculate the mean and standard deviation of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
        },
    ],
});

for (const block of codeResponse.content) {
    if (block.type === "server_tool_use") {
        console.log(`Tool call: ${block.name} — ${JSON.stringify(block.input)}`);
    } else if (block.type === "bash_code_execution_tool_result") {
        const result = block.content;
        if (result.type === "bash_code_execution_result") {
            console.log(`stdout: ${result.stdout}`);
        }
    } else if (block.type === "text") {
        console.log(block.text);
    }
}
