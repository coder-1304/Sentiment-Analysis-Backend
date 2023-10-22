require("../../services/customErrorHandler");
const bcrypt = require("bcrypt");
const pool = require("../../Database/db_connect");
const mailController = require("./otpVerification.js");
const validator = require("validator");
const errorCodes = require("../../constants/errorCodes.js");
const statusCodes = require("../../constants/statusCodes.js");

function validate(email, password, confirmPassword, fullName) {
  let validationErrors = [];

  if (password !== confirmPassword) {
    validationErrors.push("Passwords don't match");
  }

  if (!validator.isEmail(email)) {
    validationErrors.push("Invalid Email Address");
  }

  if (fullName.length < 3 || fullName.length > 100) {
    validationErrors.push("Full Name is not valid");
  }

  return validationErrors;
}

const registerController = {
  async register(req, res, next) {
    try {
      const fullName = req.body.fullName;
      const email = req.body.email;
      let password = req.body.password;
      const confirmPassword = req.body.confirmPassword;

      // 1) Checking for null fields
      if (!fullName || !email || !password || !confirmPassword) {
        return res.status(statusCodes[2]).json({
          success: false,
          errorCode: 2,
          message: errorCodes[2],
        });
      }

      // 2) Validation
      const validationErrors = validate(
        email,
        password,
        confirmPassword,
        fullName
      );

      if (validationErrors.length !== 0) {
        return res.status(statusCodes[5]).json({
          success: false,
          errorCode: 5,
          message: errorCodes[5],
          errors: validationErrors,
        });
      }

      // Hash the password
      password = await bcrypt.hash(password, 10);

      // 3) Check if user is already in the database
      const countQuery = `
                SELECT COUNT(*) AS user_count
                FROM users
                WHERE Email = "${email}";
            `;

      pool.query(countQuery, (err, result, fields) => {
        if (err) {
          console.log(result);
          console.error(err);
          return res.status(statusCodes[1]).json({
            success: false,
            errorCode: 1,
            message: errorCodes[1],
          });
        }

        const count = result[0].user_count;

        if (count > 0) {
          return res.status(statusCodes[6]).json({
            success: false,
            errorCode: 6,
            message: errorCodes[6],
          });
        }

        // 4) Storing to MySQL
        const insertQuery = `
                    INSERT INTO Users (FullName, Email, Password, IsVerified, OTP, JWT)
                    VALUES ('${fullName}', '${email}', '${password}' , false, null, null)
                `;

        pool.query(insertQuery, (err, result, fields) => {
          if (err) {
            console.log(err);
            return res.status(statusCodes[1]).json({
              success: false,
              errorCode: 1,
              message: errorCodes[1],
            });
          }

          // 7) Send OTP
          mailController.sendOTP(email);

          res.json({
            success: true,
          });
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(statusCodes[3]).json({
        success: false,
        errorCode: 3,
        message: errorCodes[3],
      });
    }
  },
};

module.exports = registerController;
