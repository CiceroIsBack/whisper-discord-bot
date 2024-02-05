const fs = require("fs");
const fuzzysort = require("fuzzysort");

const logError = require("./utils/logError");

require("dotenv").config();

// read dict.cc database into memroy
const dictionaryFilePath = "src/data/dict.txt";
const dictionaryFileContent = fs.readFileSync(dictionaryFilePath, "utf-8");
const dictionaryLines = dictionaryFileContent.split("\n");

// read conjugation page into memory
const conjugationFilePath = "src/data/verbs.csv";
const conjugationFileContent = fs.readFileSync(conjugationFilePath, "utf-8");
const conjugationLines = conjugationFileContent.split("\n");
let conjugatedVerbs = {};

// convert conjugations into an easily accessible object
for (let i = 0; i < conjugationLines.length; i++) {
  const conjugatedVerb = conjugationLines[i].split(",");
  const infinitive = conjugatedVerb[0];
  const prasens = conjugatedVerb[3];
  const praeteritum = conjugatedVerb[4];
  let helpingVerb = "";
  if (conjugatedVerb[9] === "haben") {
    helpingVerb = "hat";
  } else if (conjugatedVerb[9] === "sein") {
    helpingVerb = "ist";
  } else {
    console.log(
      `Error:${infinitive} doesn't have a helping verb? (${conjugatedVerb[7]})`
    );
  }

  const perfekt = `${helpingVerb} ${conjugatedVerb[5]}`;
  conjugatedVerbs[infinitive] = {
    prasens,
    praeteritum,
    perfekt,
  };
}

console.log("targets prepared");

const dictionary = async (message) => {
  // the elements of the response
  let wordForLookup = "";
  let gptDefinition = "Loading...";
  let dictCCDefinitions = `Loading...\n\n\n\n\n\n\n\n\n\n`;
  let conjugation = "\n";
  let reversoConjugation = "";

  const updateDefinition = (message) => {
    message.edit(
      `${gptDefinition}\n${conjugation}${reversoConjugation}\n**Related words from dict.cc:**\n\`\`\`${dictCCDefinitions}\`\`\``
    );
  };

  // the word to look up
  wordForLookup = message.content;

  // send initial template message
  const dictionaryResponse = await message.channel.send(`${gptDefinition}\n\n**Conjugation:** ${conjugation}\n\n${reversoConjugation}\n\n**Related words from dict.cc:**\n\`\`\`${dictCCDefinitions}\`\`\``);
  updateDefinition(dictionaryResponse);

  // find fuzzy matches in the dict.cc database
  const fuzzySearchOptions = {
    limit: 10,
    threshold: -10000,
  };
  let results = fuzzysort.go(
    message.content,
    dictionaryLines,
    fuzzySearchOptions
  );
  let fileSearchResult = "";
  results.forEach((result) => {
    fileSearchResult += `${result.target}\n`;
  });
  dictCCDefinitions = fileSearchResult;
  updateDefinition(dictionaryResponse);

  // get definition message from gpt
  const gptMessages = [
    {
      role: "system",
      content:
        "You are a german dictionary bot that helps English speakers. Respond in the format:\n\n<german word>:<english definition> <part of speech> - short explanation\n\ne.g.: \nDinge: things (noun) - refers to various objects or items.\n\nAnd if the word the user gives you is a verb, respond with the infinitive form.",
    },
    {
      role: "user",
      content: message.content,
    },
  ];

  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: gptMessages,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      gptDefinition = data.choices[0].message.content;
      updateDefinition(dictionaryResponse);

      // if it's a verb, grab the conjugation
      const partOfSpeech = gptDefinition.match(/\((.*?)\)/g)[0];
      if (partOfSpeech === "(verb)") {
        const infinitiveVerb = gptDefinition.match(/^(\w*?):/)[1];
        if (conjugatedVerbs[infinitiveVerb]) {
          const verb = conjugatedVerbs[infinitiveVerb];
          conjugation = `**Conjugation:** ${verb.prasens}, ${verb.praeteritum}, ${verb.perfekt}\n`;
        }
        reversoConjugation = `See a full conjugation here:\n<https://conjugator.reverso.net/conjugation-german-verb-${message.content}.html>`;
      }
      updateDefinition(dictionaryResponse);
    })
    .catch((err) => logError(err));
};

// TODO: should auto-delete message after 2 minutes

module.exports = dictionary;
