const Whisper = require("whisper-nodejs");

const whisper = new Whisper(process.env.OPENAI_API_KEY);

const logError = require('./logError');

require("dotenv").config();

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


module.exports = transcribe;