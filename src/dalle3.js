const logError = require("./utils/logError");

require("dotenv").config();

const generateImage = async (message) => {
  try {
    prompt = message.content.replace("!imagine", "");
    console.log(prompt);
    const infoMessage = await message.channel.send("Starting image generation...")
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
        }),
      }
    );
    const data = await response.json();
    const { revised_prompt, url} = data.data[0];

    infoMessage.delete();
    message.channel.send(`**Revised prompt:** ${revised_prompt}\n**Cost:** $0.04`);

    message.channel.send(url);
    
  } catch (err) {
    logError(err, message);
  }
};

module.exports = generateImage;
