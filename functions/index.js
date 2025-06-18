/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");

// Import the OpenAI library
const OpenAI = require("openai");

// Get the OpenAI API key from Firebase Environment Configuration

// Learn more: https://firebase.google.com/docs/functions/config-env

// Define an HTTP callable function for the chatbot
// This function will receive POST requests from your frontend
exports.askAI = onRequest(async (request, response) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Content-Type");
  response.header("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  // Initialize OpenAI client inside the function handler
  const openaiKey = process.env.OPENAI_API_KEY || (functions.config().openai && functions.config().openai.key);
  const openai = new OpenAI({
    apiKey: openaiKey,
  });

  logger.info(
      "Received request for askAI function",
      {structuredData: true},
  );

  // Ensure the request is a POST request
  if (request.method !== "POST") {
    response.status(405).send("Method Not Allowed");
    return;
  }

  const userMessage = request.body.message;

  if (!userMessage) {
    logger.warn("Missing 'message' in request body.");
    response.status(400).send("Missing 'message' parameter.");
    return;
  }

  logger.info(`User message: "${userMessage}"`);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const aiResponse = completion.choices[0].message.content;
    logger.info(`AI response: "${aiResponse}"`);

    response.status(200).json({reply: aiResponse});
  } catch (error) {
    logger.error("Error calling OpenAI API:", error);
    response.status(500).json({error: "Error processing your request."});
  }
});
