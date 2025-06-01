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

// Import the OpenAI library
const OpenAI = require("openai");

// Get the OpenAI API key from Firebase Environment Configuration

// Learn more: https://firebase.google.com/docs/functions/config-env

// Define an HTTP callable function for the chatbot
// This function will receive POST requests from your frontend
exports.askAI = onRequest(async (request, response) => {
  // Initialize OpenAI client inside the function handler
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  logger.info(
      "Received request for askAI function",
      {structuredData: true},
  );

  // Set CORS headers for cross-origin requests
  // In production, restrict this to your frontend's domain
  response.set("Access-Control-Allow-Origin", "*");

  // Handle preflight requests (OPTIONS method)
  if (request.method === "OPTIONS") {
    response.set("Access-Control-Allow-Methods", "POST");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    response.status(204).send("");
    return;
  }

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
