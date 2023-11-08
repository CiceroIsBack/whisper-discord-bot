const logError = require("./utils/logError");

require("dotenv").config();

const ask = async (message) => {
  try {
    const infoMessage = await message.channel.send("Loading...")
    const response = await fetch(
      "https://api.openai.com/v1/chat/completionss",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4-1106-preview",
          messages: {
            "role": "user",
            content: message.content
          }
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

module.exports = ask;
