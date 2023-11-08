const removeCommandPrefix = require('./utils/removeCommandPrefix');
const tableOfContentsParser = async (message) => {
    let text = removeCommandPrefix(message.content);
    let arrayOfStrings = text.split('\n')
    const regex = /([A-Z \[\]\d.]+[A-Z]+)\d*$/
    arrayOfStrings = arrayOfStrings.map(string => {
        const found = string.match(regex)
	if (found) return found[1];
	else return string;
    })
    console.log(arrayOfStrings);
    text = arrayOfStrings.join('\n');
    const cleanedTOC = `\nTABLE OF CONTENTS\n===\n${text}\n===\n\n`;

    message.delete();

    const newMessage = await message.channel.send(cleanedTOC);
    await new Promise(resolve => setTimeout(resolve, 10000));
    newMessage.delete();
}

module.exports = tableOfContentsParser;
