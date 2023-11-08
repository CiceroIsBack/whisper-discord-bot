require("dotenv").config();

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

  module.exports = logError;