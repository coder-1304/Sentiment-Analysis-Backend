const express = require('express') ;
const registerController = require('../Controllers/User/registerController') ;
const verifyOtp = require('../Controllers/User/otpVerification');
const loginController = require("../Controllers/User/loginController");
const predictController = require("../Controllers/predictionController");
const auth = require('../middlewares/auth.js') ;
const feedback = require("../Controllers/feedbackController");
const feedbackController = require('../Controllers/feedbackController');

const router = express.Router();

// Define your routes
router.post('/register', registerController.register);
router.post('/verifyOtp', verifyOtp.verifyOTP);
router.post('/login', loginController.login);
router.post("/predict",auth, predictController.predict);
router.post("/feedback",auth, feedbackController.feedback);

module.exports = router;