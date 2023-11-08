const logError = require("./utils/logError");

require("dotenv").config();

const chat = async (message) => {
  try {
    const infoMessage = await message.channel.send("Loading...")
    const channel = message.channel;
    let chatMessages = [];
    await channel.messages.fetch({ limit: 100 }).then(async (messages) => {
        //Iterate through the messages here with the variable "messages".
        messages.forEach(message => {
            const role = message.author.bot ? "assistant" : "user";
            chatMessages.push({role, content: message.content});
        })
      })
    chatMessages = chatMessages.reverse();

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4-1106-preview",
          messages: chatMessages
        }),
      }
    );
    const data = await response.json();
    const newMessage = data.choices[0].message.content;

    infoMessage.delete();
    message.channel.send(newMessage);
    
  } catch (err) {
    logError(err, message);
  }
};

module.exports = chat;
