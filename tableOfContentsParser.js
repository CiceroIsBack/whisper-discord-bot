const tableOfContentsParser = text => {
    let arrayOfStrings = text.split('\n')
    const regex = /([A-Z .]+)\d*$/
    arrayOfStrings = arrayOfStrings.map(string => {
        const found = string.match(regex)
	if (found) return found[1];
	else return string;
    })
    console.log(arrayOfStrings);
    text = arrayOfStrings.join('\n');
    return `\nTABLE OF CONTENTS\n===\n${text}\n===\n\n`
}

module.exports = tableOfContentsParser;
