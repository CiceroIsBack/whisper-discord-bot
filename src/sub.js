const https = require("https");
const logError = require("./utils/logError");

const sub = (message) => {
  const channelName = message.content.replace("!sub ", "");
  console.log(`finding channel id for ${channelName}`);

  const url = `https://www.youtube.com/@${channelName}`;
  try {
    https
      .get(url, function (res) {
        let data = "";
        res.on("data", function (chunk) {
          data += chunk;
        });
        res.on("end", function () {
          if (data.includes("channel_id=") == false) {
            message.channel.send(`Channel "${channelName}" not found`);
            return;
          }

          let arr = data.split("channel_id=");
          const channelID = arr[1].slice(0, 24);
          message.channel.send(
            `${channelName} yt channel: <https://www.youtube.com/feeds/videos.xml?channel_id=${channelID}>`
          );
        });
      })
      .on("error", function (e) {
        logError(e.message);
      });
  } catch (err) {
    logError(err);
  }
};

module.exports = sub;
