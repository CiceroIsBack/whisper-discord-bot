const logError = require("./utils/logError");
const fs = require("fs");

require("dotenv").config();
const gptResponse = require("./utils/gpt");
const anthropicResponse = require("./utils/anthropic");
const geminiResponse = require("./utils/gemini");

const chat = async (message) => {
  try {
    const channel = message.channel;
    let chatMessages = [];
    await channel.messages.fetch({ limit: 100 }).then(async (messages) => {
      //Iterate through the messages here with the variable "messages".
      messages.forEach((message) => {
        const role = message.author.bot ? "assistant" : "user";
        chatMessages.push({ role, content: message.content });
      });
    });
    chatMessages = chatMessages.reverse();

    const infoMessage = await message.channel.send("Loading...");

    let { chatbotToUse } = JSON.parse(fs.readFileSync("preferences.json"));

    let newMessage;
    if (chatbotToUse === "gpt") {
      newMessage = await gptResponse(chatMessages);
    } else if (chatbotToUse === "claude") {
      newMessage = await anthropicResponse(chatMessages);
    } else if (chatbotToUse === "gemini") {
      newMessage = await geminiResponse(chatMessages);
    } else {
      throw new Error(
        "Invalid chatbot to use. Please set the CHATBOT_TO_USE environment variable to 'gpt' or 'anthropic'"
      );
    }

    // split newMessage after 1900 characters, if newMessage is more than 2000 long
    if (newMessage.length > 1900) {
      const newMessage1 = newMessage.substring(0, 1900);
      const newMessage2 = newMessage.substring(1900, newMessage.length);
      message.channel.send(newMessage1);
      message.channel.send(newMessage2);
    } else {
      message.channel.send(newMessage);
    }

    infoMessage.delete();
    // message.channel.send(newMessage);
  } catch (err) {
    logError(err, message);
  }
};

module.exports = chat;
