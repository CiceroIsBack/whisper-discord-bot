const logError = require("./utils/logError");

const frink = async (message) => {
  try {
    const infoMessage = await message.channel.send("Loading...")
    prompt = message.content.replace("!frink ", "");
    // run frink.jar with the contents of the message to get the response
    const { exec } = require("child_process");
    exec(`java -cp src/utils/frink.jar frink.parser.Frink -e "${prompt}"`, (err, stdout, stderr) => {
      if (err) {
        logError(err, message);
        return;
      }
      if (stderr) {
        logError(stderr, message);
        return;
      }
      infoMessage.edit(stdout);
    });
    
  } catch (err) {
    logError(err, message);
  }
};

module.exports = frink;
