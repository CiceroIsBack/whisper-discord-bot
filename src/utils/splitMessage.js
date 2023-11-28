const splitMessage = (text) => {
    // if message is over 1950 characters, split it into as many messages as we need, but each no more than 1950 chars
    const splitText = [];
    const splitTextLength = Math.ceil(text.length / 1950);
    for (let i = 0; i < splitTextLength; i++) {
      splitText.push(text.substring(0, 1950));
      text = text.substring(1950, text.length);
    }
    return splitText;


}

module.exports = splitMessage;