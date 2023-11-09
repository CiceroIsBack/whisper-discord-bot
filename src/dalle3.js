const logError = require("./utils/logError");
const fs = require("fs");

require("dotenv").config();

const generateImage = async (message) => {
  try {
    prompt = message.content.replace("!imagine ", "");
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

    //download the imagine in the url
    const imageResponse = await fetch(url);
    const imageBuffer = await imageResponse.arrayBuffer();
    const filename = "image.png";
    await new Promise((resolve, reject) => {
      fs.writeFile(filename, Buffer.from(imageBuffer), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    
    await message.channel.send({content: `**Revised prompt:** ${revised_prompt}`, files: [{ attachment: filename }]});
    infoMessage.delete();
    
  } catch (err) {
    logError(err, message);
  }
};

module.exports = generateImage;
