const logError = require("./utils/logError");

require("dotenv").config();

const fast = async (message) => {
  const prompt = message.content.replace("!fast ", "");
  console.log(prompt);
  try {
    const infoMessage = await message.channel.send("Loading...")
    const response = await fetch(
      "https://kagi.com/api/v0/fastgpt",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${process.env.KAGI_API_KEY}`,
        },
        body: JSON.stringify({
          query: prompt
        }),
      }
    );
    const data = await response.json();
    let newMessage = data.data.output;
    console.log(data.data.references[0].url);
    const references = data.data.references;
    for (let i=0;i<references.length;i++) {
        newMessage += `\n[${i+1}]<${references[i].url}>`;
    }

    infoMessage.delete();
    message.channel.send(newMessage);
    
  } catch (err) {
    logError(err, message);
  }
};

module.exports = fast;
