require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function geminiResponse(chatMessages) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  //pull off the most recent message to send separately
  const msg = chatMessages.pop().content;

  // Convert the chatMessages to the format expected by the model
  chatMessages.forEach((message) => {
    message.parts = [{ text: message.content }];
    delete message.content;
    if (message.role === "assistant") {
        message.role = "model"
    }
  });

  const chat = model.startChat({
    history: chatMessages,
    generationConfig: {
      maxOutputTokens: 4000,
    },
  });

  const result = await chat.sendMessage(msg);
  const response = await result.response;
  const text = response.text();
  return text;
}

module.exports = geminiResponse;
