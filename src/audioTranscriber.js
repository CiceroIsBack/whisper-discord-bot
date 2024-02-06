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
      // const messages = splitMessage(text)
      // message.forEach(partialMessage => {
      //   message.author.send({
      //     content: partialMessage
      //   })
      // })
      console.log(text);
      await processText(text, (processedText) => {
        // DM transcription to the author
        const messages = splitMessage(processedText);
        messages.forEach((partialMessage) => {
          message.author.send({
            content: partialMessage
          })
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



// /**
// * 
// * @param {string} text 
// */
// const processText = async (text, callback) => {
//   const response = await openai.edits.create({
//     model: "text-davinci-edit-001",
//     input: text,
//     instruction: "Split text into paragraphs at logical breaking points",
//     temperature: 1,
//     top_p: 1,
//   });
//   console.log(response);

//   callback(response.choices[0].text);
// };

const processText = async (text, callback) => {
  const systemPrompt = "You are a helpful assistant. Your task is to correct any spelling discrepancies in the transcribed text. Only add necessary punctuation such as periods, commas, and capitalization, and use only the context provided."

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        "role": "system",
        "content": systemPrompt,
      },{
        "role": "user",
        "content": text
      }
    ],
    temperature: 1,
    max_tokens: 3256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  callback(response.choices[0].message.content);
}



module.exports = audioTranscriber;