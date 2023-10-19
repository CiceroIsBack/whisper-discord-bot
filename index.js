const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const Whisper = require("whisper-nodejs");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

const tableOfContentsParser = require('./tableOfContentsParser');

const OpenAI = require("openai").OpenAI;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const whisper = new Whisper(process.env.OPENAI_API_KEY);

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
  // Wait for a second to give the file time to upload
  // await new Promise(resolve => setTimeout(resolve, 1000));
  if (message.author.bot) return;
  if (message.channel.id === process.env.WHISPER_CHANNEL_ID) {
    if (message.attachments.size > 0) {
      // get the file's URL
      const file = message.attachments.first()?.url;
      if (!file) return logError("No file found", message);

      try {
        const statusMessage = await message.channel.send(
          "Reading the file! Fetching data..."
        );

        // fetch the file from the external URL
        const response = await fetch(file);

        // if there was an error send a message with the status
        if (!response.ok)
          return message.channel.send(
            "There was an error with fetching the file:",
            response.statusText
          );

        // get the original filename from the Content-Disposition header
        const contentDisposition = response.headers.get("Content-Disposition");
        const filenameMatch = contentDisposition.match(/filename=["]*(.+\..{3})/);
        const filename = filenameMatch ? filenameMatch[1] : "audio.m4a";



        // take the response stream and read it to completion
        const audio = await response.arrayBuffer();
        fs.writeFile(filename, Buffer.from(audio), async (err) => {
          if (err) throw err;
          console.log("The file has been saved!");

          statusMessage.edit("Converting the file to mp3...");
          // convert to mp3
          const mp3Filename = convertFilenameToMp3(filename);
          await ffmpeg()
            .input(filename)
            .output(mp3Filename)
            .on("end", async () => {
              console.log("Conversion complete");
              statusMessage.edit("Transcribing the file...")
              const text = await transcribe(mp3Filename, message);

              console.log(`text has been transcribed`);
              statusMessage.edit("Summarizing the file...")
              await summarize(text, (summary) => {
                // DM transcription to the author
                message.author.send({
                  content: summary,
                })
              });


              message.delete();
              statusMessage.edit("Done! Find the transcription in your DMs.")
              await new Promise(resolve => setTimeout(resolve, 5000));
              statusMessage.delete();

              deleteFiles([filename, mp3Filename]);
            })
            .on("error", (err) => {
              logError(err, message);
            })
            .run();
        });
      } catch (err) {
        logError(err, message);
      }
    } else {
      logError("Please attach an audio file to your message", message);
    }


  } else if (message.channel.id === process.env.TOC_CHANNEL_ID) {
      const cleanedTOC = tableOfContentsParser(message.content)
      message.delete();
      const newMessage = await message.channel.send(cleanedTOC);
      await new Promise(resolve => setTimeout(resolve, 10000));
      newMessage.delete();
    } else {
    return;
  }
});

/**
 *
 * @param {string} audioFilePath
 * @param {object} message message object returned from discord
 * @returns
 */
const transcribe = async (audioFilePath, message) => {
  try {
    console.log("start transcription");
    const text = await whisper.transcribe(audioFilePath, "whisper-1");
    return text;
  } catch (err) {
    logError(err, message);
  }
};

/**
 *
 * @param {array} filenames
 */
const deleteFiles = (filenames) => {
  filenames.forEach((filename) => {
    fs.unlink(filename, (err) => {
      if (err) logError(err);
      console.log(`${filename} was deleted`);
    });
  });
};

/**
 *
 * @param {string} filename
 * @returns string
 */
const convertFilenameToMp3 = (filename) => {
  const r = /(.+\.).{3}/;
  return filename.replace(r, "$1mp3").toUpperCase(); //make it uppercase to avoid naming conflicts
};

/**
 * 
 * @param {string} text 
 */
const summarize = async (text, callback) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that outlines transcipts of audio messages sent between friends. You only write outlines; you do not offer commentary or help. Also, a bit of background: both conversants are young Christians, and basically siblings. Start your outline with 'Here are the main points from the audio message:' and end it with 'I am still in prototype mode, so I may have missed something or completely misrepresented what was said.'",
      },
      {
        role: "user",
        content:
          "I will give you an audio transcript of a message I received from my friend. I want to reply to it, but I don't remember everything they said. Write a brief bullet point list of their main points. Respond with 'OK' when you are ready to hear the audio transcript.",
      },
      {
        role: "assistant",
        content: "OK",
      },
      {
        role: "user",
        content: "Here is the audio transcript: " + text,
      },
    ],
    temperature: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  callback(response.choices[0].message.content);
};

const logError = async (err, message) => {
  console.log(err);
  if (message) {
    const statusMessage = await message.channel.send("Please only send audio files in this channel!")
    message.delete();
    await new Promise(resolve => setTimeout(resolve, 5000));
    statusMessage.delete();
  }
  //call the webhook url
  fetch(process.env.LOGGING_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: err })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
    })
    .catch(error => {
      console.error(`Error sending message to webhook`);
      console.error(error);
    });
}

client.login(process.env.TOKEN);
