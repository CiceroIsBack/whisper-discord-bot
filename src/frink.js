const logError = require("./utils/logError");
const dataFile = "./src/utils/frink-data-file.txt";

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

      const regex = /Warning: undefined symbol "(\w+)"/
      // search stdout for error regex, and if found, search the match group in datafile
      const match = stdout.match(regex);
      if (match) {
        console.log('yes match')
        const fs = require("fs");
        const data = fs.readFileSync(dataFile, "utf8");
        console.log(match);
        const dataRegex = new RegExp(`.*${match[1]}.*`, "gm");
        const dataMatch = data.match(dataRegex);
        console.log(dataMatch);
        if (dataMatch) {
          const lookupURL = `https://frinklang.org/fsp/frink.fsp?lookup=${match[1]}`;
          infoMessage.edit(`${stdout}\n**Potentially Helpful Lines from the Data File**\n${dataMatch.join("\n")}\n\n**More Info:** ${lookupURL}\nGeneral Docs: <https://frinklang.org>`);
        }
      }


    });
    
  } catch (err) {
    logError(err, message);
  }
};

module.exports = frink;
