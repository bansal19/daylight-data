const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Ensure the 'public' directory exists
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Load knowledge base content
const knowledgeBasePath = path.join(__dirname, "data", "entities.json");
let knowledgeBaseContent = "";

if (
  fs.existsSync(knowledgeBasePath) &&
  fs.lstatSync(knowledgeBasePath).isFile()
) {
  knowledgeBaseContent = fs.readFileSync(knowledgeBasePath, "utf-8");
} else {
  console.error("Knowledge base file does not exist or is not a file.");
}

// Serve static files from the "public" directory
app.use(express.static(publicDir));

const openai = new OpenAI(process.env.OPENAI_API_KEY);

app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  try {
    // Combine user prompt with knowledge base content and specific instructions
    const combinedPrompt = `
      Using the knowledge base provided below,
      tell to the user all the stakeholders they would need to consider reach
      only based off the data in the knowledge base.
      Start your first reply with "Hi, I'm Dai". Mention that it's based on historical data
      ${prompt}\n\nKnowledge Base:\n${knowledgeBaseContent}\n\n
      User Request: ${prompt}\nAI:`;

    // Get response from OpenAI GPT-4
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [{ role: "user", content: combinedPrompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (
      response.data &&
      response.data.choices &&
      response.data.choices[0] &&
      response.data.choices[0].message
    ) {
      const responseText = response.data.choices[0].message.content;

      // Generate speech from the response text using OpenAI Text-to-Speech API
      const speechResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: responseText,
      });

      const mp3FileName = `speech-${Date.now()}.mp3`;
      const mp3FilePath = path.join(publicDir, mp3FileName);
      const buffer = Buffer.from(await speechResponse.arrayBuffer());

      // Save the generated speech to a file
      await fs.promises.writeFile(mp3FilePath, buffer);
      res.json({ responseText, audioUrl: `/${mp3FileName}` });
    } else {
      res
        .status(500)
        .send(
          "Error processing request: Invalid response structure from OpenAI",
        );
    }
  } catch (error) {
    res.status(500).send(`Error processing request: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
