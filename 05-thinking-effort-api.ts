import Anthropic from "@anthropic-ai/sdk";

// thinking + output_config.effort are not exposed by the agent SDK,
// so we use the direct SDK here (new Anthropic() still resolves auth
// from ant auth login / ANTHROPIC_AUTH_TOKEN — no API key needed).
const client = new Anthropic();

const weatherTool: Anthropic.Tool = {
  name: "get_weather",
  description: "Get the current weather for a city.",
  input_schema: {
    type: "object",
    properties: {
      city: { type: "string", description: "City name" },
    },
    required: ["city"],
  },
};

const response = await client.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 16000,
  thinking: { type: "adaptive" },
  output_config: { effort: "high" }, // low | medium | high | xhigh | max
  tools: [weatherTool],
  messages: [
    {
      role: "user",
      content:
        "Plan a road trip out of San Francisco with two stops, " +
        "weighing weather and drive time.",
    },
  ],
});

for (const block of response.content) {
  if (block.type === "thinking") {
    console.log(`[thinking]\n${block.thinking}`);
  } else if (block.type === "text") {
    console.log(block.text);
  }
}
