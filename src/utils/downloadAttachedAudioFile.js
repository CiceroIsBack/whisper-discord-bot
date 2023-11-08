const logError = require('./logError');
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
        if (!response.ok) throw new Error('error fetching the file');

        // get the original filename from the Content-Disposition header
        const contentDisposition = response.headers.get("Content-Disposition");
        const filenameMatch = contentDisposition.match(/filename=["]*(.+\..{3})/);
        const filename = filenameMatch ? filenameMatch[1] : "audio.m4a";

        // take the response stream and read it to completion
        const audio = await response.arrayBuffer();
        const mp3Filename = await new Promise((resolve, reject) => {
            fs.writeFile(filename, Buffer.from(audio), async (err) => {
                if (err) return reject(err);
                
                console.log("The file has been saved!");

                
                // convert to mp3
                const mp3Filename = convertFilenameToMp3(filename);
                await ffmpeg()
                    .input(filename)
                    .output(mp3Filename)
                    .on("end", async () => {
                        console.log("Conversion to mp3 complete");
                        resolve(mp3Filename);
                    })
                    .on("error", (err) => {
                        console.log("error converting to mp3", err);
                        reject(err);
                    })
            });
        });
        console.log('testing');
        return mp3Filename;
    } catch (err) {
        logError(err)
    }
}

/**
*
* @param {string} filename
* @returns string
*/
const convertFilenameToMp3 = (filename) => {
    const r = /(.+\.).{3}/;
    return filename.replace(r, "$1mp3").toUpperCase(); //make it uppercase to avoid naming conflicts
};

module.exports = downloadAttachedAudioFile;