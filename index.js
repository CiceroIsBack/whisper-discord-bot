const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();


const tableOfContentsParser = require('./src/tableOfContentsParser');

// channels
const voiceMessageSummarizer = require('./src/voiceMessageSummarizer');
const dalle3 = require('./src/dalle3');
const clear = require('./src/clear');





const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log("Bot is ready!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content == "!clear") {
    clear(message);
  } else if (message.channel.id === process.env.VOICE_MESSAGE_SUMMARIZER_CHANNEL_ID || 
      message.channel.id === process.env.PRIVATE_VOICE_MESSAGE_SUMMARIZER_CHANNEL_ID) {
        voiceMessageSummarizer(message);
  } else if (message.channel.id === process.env.TABLE_OF_CONTENTS_PARSER_CHANNEL_ID) {
      tableOfContentsParser(message)
  } else if (message.channel.id === process.env.DALLE3_CHANNEL_ID) {
      dalle3(message);
  } else {
    return;
  }
});

client.login(process.env.DISCORD_TOKEN);
