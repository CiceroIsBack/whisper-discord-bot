const removeCommandPrefix = (message) => {
    return message.split(" ").slice(1).join(" ");
  };


module.exports = removeCommandPrefix;