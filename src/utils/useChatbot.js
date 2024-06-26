const logError = require("./logError");
const fs = require("fs");

const useChatbot = async (message) => {
  try {
    let preferences = JSON.parse(fs.readFileSync("preferences.json"));

    chatbotToUse = message.content.replace("!use ", "");
    console.log(`switching to ${chatbotToUse}`);
    preferences.chatbotToUse = chatbotToUse;
    fs.writeFileSync('preferences.json', JSON.stringify(preferences, null, 2));
    
    message.channel.edit({name:`chat-${chatbotToUse}`, topic: `Directly talk w/ ${chatbotToUse}. Use !clear to reset, and !use gpt|claude|gemini to set model.`});

    const infoMessage = await message.channel.send(`Switched to ${chatbotToUse}`);
    message.delete();

    setTimeout(() => {
      infoMessage.delete();
    }, 1000);
  } catch (err) {
    logError(err, message);
  }
};

module.exports = useChatbot;