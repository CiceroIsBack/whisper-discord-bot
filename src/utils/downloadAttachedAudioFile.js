const logError = require("./logError");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

/**
 * downloads audio file attached to discord message and saves it as an MP3
 * @param {*} message discord.js message object
 */
const downloadAttachedAudioFile = async (message) => {
  // get the file's URL
  const file = message.attachments.first()?.url;
  if (!file) return logError("No file found", message);

  try {
    // fetch the file from the external URL
    const response = await fetch(file);
    if (!response.ok) throw new Error("error fetching the file");

    // get the original filename from the Content-Disposition header
    const contentDisposition = response.headers.get("Content-Disposition");
    const filenameMatch = contentDisposition.match(/filename=["]*(.+\..{3})/);
    const filename = filenameMatch ? filenameMatch[1] : "audio.m4a";

    // take the response stream and read it to completion
    const audio = await response.arrayBuffer();

    let returnedFilename = "test";
    // save the file to the local filesystem
    await new Promise((resolve, reject) => {
      fs.writeFile(filename, Buffer.from(audio), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("file saved!");
    const mp3Filename = convertFilenameToMp3(filename);
    console.log('new filename: ', mp3Filename);
    await new Promise((resolve, reject) => {
        ffmpeg()
          .input(filename)
          .output(mp3Filename)
          .on("end", async () => {
            console.log("Conversion to mp3 complete");
            resolve();
          })
          .on("error", (err) => {
            console.log("error converting to mp3", err);
            reject(err);
          })
          .run();
      });

    console.log("returnedFilename: ", returnedFilename);
    return { mp3Filename, filename };
  } catch (err) {
    logError(err);
  }
};

/**
 *
 * @param {string} filename
 * @returns string
 */
const convertFilenameToMp3 = (filename) => {
  console.log("converting filename to mp3");
  const r = /(.+\.).{3}/;
  return filename.replace(r, "$1mp3").toUpperCase(); //make it uppercase to avoid naming conflicts
};

module.exports = downloadAttachedAudioFile;
