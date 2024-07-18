const Anthropic = require("@anthropic-ai/sdk")

require("dotenv").config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const anthropicResponse = async (chatMessages) => {
  const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1000,
    temperature: 0.7,
    messages: chatMessages
  });
  return msg.content[0].text;
};

module.exports = anthropicResponse;