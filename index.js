const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const tableOfContentsParser = require("./src/tableOfContentsParser");

// channels / commands
const voiceMessageSummarizer = require("./src/voiceMessageSummarizer");
const dalle3 = require("./src/dalle3");
const clear = require("./src/clear");
const ask = require("./src/ask");
const chat = require('./src/chat')

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
    clear(message); //clear all messages in channel
  } else if (message.content.startsWith("!ask")) {
    ask(message); // call GPT-4
  } else if (message.content.startsWith("!toc")) {
    tableOfContentsParser(message); // table of contents parser
  } else if (message.content.startsWith("!imagine")) {
    dalle3(message); //dalle3 imagine generation
  } else if (
    message.channel.id === process.env.VOICE_MESSAGE_SUMMARIZER_CHANNEL_ID || // voice message summarizer
    message.channel.id ===
      process.env.PRIVATE_VOICE_MESSAGE_SUMMARIZER_CHANNEL_ID
  ) {
    voiceMessageSummarizer(message);
  }  else if (message.channel.id === process.env.CHAT_CHANNEL_ID) {
    chat(message);
  } else {
    return;
  }
});

client.login(process.env.DISCORD_TOKEN);
