const logError = require("./utils/logError");


const clear = async (message) => {
  try {
    const channel = message.channel;
    channel.messages.fetch({ limit: 100 }).then(async (messages) =>{
        const deleteMessage = await message.channel.send(`Deleting ${messages.size} messages`)
        //Iterate through the messages here with the variable "messages".
        await messages.forEach(message => message.delete());
        deleteMessage.delete();
      })
    
    
    
  } catch (err) {
    logError(err, message);
  }
};

module.exports = clear;
