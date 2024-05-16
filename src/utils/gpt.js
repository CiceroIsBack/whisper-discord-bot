require("dotenv").config();

const gptResponse = async (chatMessages) => {
    const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: chatMessages
          }),
        }
      );
      const data = await response.json();
      return data.choices[0].message.content;
  
}

module.exports = gptResponse;