const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../Database/db_connect");
const statusCodes = require("../constants/statusCodes.js");
const errorCodes = require("../constants/errorCodes.js");

function generateUniqueID() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);

  return `${timestamp}-${randomStr}`;
}

const predictController = {
  async predict(req, res, next) {
    try {
      console.log("Fetching");
      const { text } = req.body;
      const savePrediction = (data) => {
        const predictionID = generateUniqueID();

        // Store the prediction in the database
        const insertQuery = `
            INSERT INTO Prediction (ID, Text, Prediction)
            VALUES ("${predictionID}", "${text}", "${data.predicted_emotion}")
        `;

        pool.query(
          insertQuery,
          //   [predictionID, text, sentiment],
          (err, result) => {
            if (err) {
              console.error("Error storing prediction:", err);
              return res.status(statusCodes[1]).json({
                success: false,
                errorCode: 1,
                message: errorCodes[1],
              });
            }

            return res.json({
              success: true,
              sentiment: data.predicted_emotion,
              ID: predictionID,
            });
          }
        );
      };
      const data = {
        text: text,
      };

      fetch("http://127.0.0.1:8080/prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((res) => {
          console.log(res);
          savePrediction(res);
        })
        .catch((error) => {
          console.error("Error:", error);
          resultText.textContent = "Error occurred.";
        });

      // Here you would send a request to your model API to get the sentiment prediction
      // For now, let's assume the prediction is "joy" for demonstration purposes
      // const sentiment = "joy";

      // Generate a random ID for the prediction
    } catch (error) {
      console.error('Error in "/predict" endpoint:', error);
      return res.status(statusCodes[3]).json({
        success: false,
        errorCode: 3,
        message: errorCodes[3],
      });
    }
  },

  // // Middleware to verify JWT token
  // async verifyToken (req, res, next) {
  // const bearerHeader = req.headers['authorization'];

  // if (typeof bearerHeader !== 'undefined') {
  //     const bearer = bearerHeader.split(' ');
  //     const token = bearer[1];

  //     jwt.verify(token, 'your_jwt_secret', (err, authData) => {
  //         if (err) {
  //             res.sendStatus(403);
  //         } else {
  //             req.user = authData;
  //             next();
  //         }
  //     });
  // } else {
  //     res.sendStatus(403);
  // }
  // }
};

// Function to generate a random ID (you can use a more robust method)
// function generateRandomID() {
//   return (
//     Math.random().toString(36).substring(2, 15) +
//     Math.random().toString(36).substring(2, 15)
//   );
// }

module.exports = predictController;
