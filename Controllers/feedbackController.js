const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../Database/db_connect");
const statusCodes = require("../constants/statusCodes.js");
const errorCodes = require("../constants/errorCodes.js");

function generateUniqueID() {
  const timestamp = Date.now().toString(36); // Convert current timestamp to base36
  const randomStr = Math.random().toString(36).substring(2, 15); // Generate a random string

  return `${timestamp}-${randomStr}`;
}

const feedbackController = {
  async feedback(req, res, next) {
    try {
      const {  correctFeedback, predictionId, feedback } = req.body;
      const ID = req.user.Email;
      const thisID = generateUniqueID();
      //   const thisID = Math.random().toString(36).substring(2, 15);
      if (correctFeedback) {
        // Store correct feedback in the Correct_Feedback table
        const correctFeedbackQuery = `
                    INSERT INTO Correct_Feedback (Email, Prediction_ID)
                    VALUES ("${ID}", "${predictionId}")
                `;

        pool.query(
          correctFeedbackQuery,
          [thisID, ID, correctFeedback],
          (err, result) => {
            if (err) {
              console.error("Error storing correct feedback:", err);
              return res.status(statusCodes[1]).json({
                success: false,
                errorCode: 1,
                message: errorCodes[1],
              });
            }

            return res.json({
              success: true,
            });
          }
        );
      } else {
        // Store incorrect feedback in the Incorrect_Feedback table
        const incorrectFeedbackQuery = `
                    INSERT INTO Incorrect_Feedback (Email, Prediction_ID, Feedback)
                    VALUES ("${ID}", "${predictionId}", "${feedback}")
                `;
        pool.query(
          incorrectFeedbackQuery,
          [thisID, ID, feedback],
          (err, result) => {
            if (err) {
              console.error("Error storing incorrect feedback:", err);
              return res.status(statusCodes[1]).json({
                success: false,
                errorCode: 1,
                message: errorCodes[1],
              });
            }

            return res.json({
              success: true,
            });
          }
        );
      }
    } catch (error) {
      console.error('Error in "/correctFeedback" endpoint:', error);
      return res.status(statusCodes[3]).json({
        success: false,
        errorCode: 3,
        message: errorCodes[3],
      });
    }
  },
};

module.exports = feedbackController;
