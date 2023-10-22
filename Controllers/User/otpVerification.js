require("dotenv").config();
const nodemailer = require("nodemailer");
const pool = require("../../Database/db_connect");
const statusCodes = require("../../constants/statusCodes.js");
const jwt = require("jsonwebtoken");
const errorCodes = require("../../constants/errorCodes.js");
function generateOTP() {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "shanneeahirwar20174@acropolis.in",
    pass: process.env.EMAIL_PASSWORD,
  },
});

const mailController = {
  async sendOTP(email) {
    const otp = generateOTP();

    const content = `
Your OTP for verification: ${otp}

If you didn't request this OTP, please ignore this message.

Thank you for using our service!

Regards,
Sentiment Analysis
`;

    const mailOptions = {
      from: "zainabakkadwala20713@acropolis.in",
      to: email,
      subject: "OTP Verification",
      text: content,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    const query = `
            UPDATE Users
            SET OTP = ${otp}
            WHERE Email="${email}"
        `;
    pool.query(query, (err, result, fields) => {
      if (err) {
        console.error("Error updating OTP:", err);
        return;
      }
      console.log(result);
    });
  },

  async verifyOTP(req, res, next) {
    try {
      const email = req.body.email;
      const otp = req.body.otp;
      if (!email || !otp) {
        return res.status(statusCodes[2]).json({
          success: false,
          errorCode: 2,
          message: errorCodes[2],
        });
      }
      const query = `
                select * from Users where Email= "${req.body.email}"
            `;
      pool.query(query, async (err, result, fields) => {
        if (err) {
          console.log(err);
          return res.status(statusCodes[1]).json({
            success: false,
            erroCode: 1,
            message: errorCodes[1],
          });
        }
        const user = result;
        console.log(result);
        if (result.length == 0) {
          res.status(statusCodes[7]).json({
            success: false,
            erroCode: 7,
            message: errorCodes[7],
          });
          return res.end();
        }
        const otp = result[0].OTP;
        const email = req.body.email;
        if (otp == req.body.otp) {
          const token = jwt.sign({ email }, process.env.JWTSECRETKEY, {
            expiresIn: "300h",
          });
          const query = `
            UPDATE Users
            SET IsVerified=1,jwt="${token}"
            WHERE Email="${req.body.email}";
          `;
          pool.query(query, (err, result, fields) => {
            if (err) {
              console.log(err);
              return res.status(statusCodes[1]).json({
                success: false,
                erroCode: 1,
                message: errorCodes[1],
              });
            }
            return res.status(200).json({
              success: true,
              JWT: token,
              
            });
          });
        } else {
          res.json({
            success: false,
            errorCode: 8,
            message: errorCodes[8],
          });
        }
      });
    } catch (error) {
      return res.json.status(statusCodes[3])({
        success: false,
        errorCode: 3,
        message: errorCodes[3],
      });
    }
  },
};

module.exports = mailController;
