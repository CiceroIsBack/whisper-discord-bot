const tableOfContentsParser = text => {
    let arrayOfStrings = text.split('\n')
    const regex = /([A-Z .]+)\d*$/
    arrayOfStrings.map(string => {
        const found = string.match(regex)
        return found[1];
    })
    text = arrayOfStrings.join('\n');
    return `\nTABLE OF CONTENTS\n===\n${text}\n===\n\n`
}

module.exports.default = tableOfContentsParser;