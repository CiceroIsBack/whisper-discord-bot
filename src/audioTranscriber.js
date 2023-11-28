const fs = require("fs");
const OpenAI = require("openai").OpenAI;

const transcribe = require('./utils/transcribe');
const logError = require('./utils/logError');
const downloadAttachedAudioFile = require('./utils/downloadAttachedAudioFile');
const splitMessage = require('./utils/splitMessage');


require("dotenv").config();



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



const audioTranscriber = async (message) => {
  if (message.attachments.size > 0) {
    try {

      const statusMessage = await message.channel.send(
        "Reading the file! Fetching data..."
      );
      const { mp3Filename, filename } = await downloadAttachedAudioFile(message)

      statusMessage.edit("Transcribing the file...")
      console.log(`mp3Filename: ${mp3Filename}`);
      const text = await transcribe(mp3Filename, message);

      console.log(`text has been transcribed`);
      statusMessage.edit("Processing the text...")
      await processText(text, (processedText) => {
        // DM transcription to the author
        const messages = splitMessage(processedText);
        messages.forEach((partialMessage) => {
          message.channel.send(partialMessage);
        });
      });


      message.delete();
      statusMessage.delete();

      
      
      await new Promise(resolve => setTimeout(resolve, 5000));

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
* @param {string} text 
*/
const processText = async (text, callback) => {
  const response = await openai.edits.create({
    model: "text-davinci-edit-001",
    input: text,
    instruction: "Split text into short paragraphs at logical breaking points",
    temperature: 1,
    top_p: 1,
  });
  console.log(response);

  callback(response.choices[0].text);
};



module.exports = audioTranscriber;