const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const OpenAI = require("openai").OpenAI;

const transcribe = require('./utils/transcribe');
const logError = require('./utils/logError');
const downloadAttachedAudioFile = require('./utils/downloadAttachedAudioFile');


require("dotenv").config();



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



const voiceMessageSummarizer = async (message) => {
  if (message.attachments.size > 0) {
    try {

      const statusMessage = await message.channel.send(
        "Reading the file! Fetching data..."
      );
      const mp3Filename = await downloadAttachedAudioFile(message)

      statusMessage.edit("Transcribing the file...")
      console.log(`mp3Filename: ${mp3Filename}`);
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
    } catch (err) {
      logError(err)
    }
  }
}




////////////////////////////////////////////////////
/// UTILITIES
////////////////////////////////////////////////////
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



module.exports = voiceMessageSummarizer;