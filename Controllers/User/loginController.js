const bcrypt = require("bcryptjs") ;
const pool = require("../../Database/db_connect") ;
const jwt = require("jsonwebtoken") ;
const errorCodes = require("../../constants/errorCodes.js") ;
const statusCodes = require("../../constants/statusCodes.js") ;

const loginController = {
  async login(req, res, next) {
    try {
      console.log("Logging In");
      const email = req.body.email;
      const password = req.body.password;
      if (!email || !password) {
        return res.status(statusCodes[2]).json({
          success: false,
          errorCode: 2,
          message: errorCodes[2],
        });
      }
      let query = `
                SELECT * FROM Users
                WHERE Email = "${email}";
            `;

      pool.query(query, async (err, result, fields) => {
        if (err) {
          console.log(err);
          return res.status(statusCodes[1]).json({
            success: false,
            errorCode: 1,
            message: errorCodes[1],
          });
        }
        if (result.length == 0) {
          return res.status(statusCodes[7]).json({
            success: false,
            errorCode: 7,
            message: errorCodes[7],
          });
        }
        if(result[0].IsVerified==0){
            console.log("User OTP not verified");
            return res.status(200).json({
                success: false,
                errorCode: 16,
                message: errorCodes[16],
            });
        }
        console.log(result);

        // Verify Password:
        const isMatch = await bcrypt.compare(password, result[0].Password);
        if (!isMatch) {
          return res.status(statusCodes[14]).json({
            success: false,
            errorCode: 14,
            message: errorCodes[14],
          });
        }
        // Set token
        const token = jwt.sign({ email }, process.env.JWTSECRETKEY, {
          expiresIn: "300h",
        });
        query = `
                    UPDATE Users 
                    SET jwt="${token}"
                    WHERE Email="${email}"
                `;

        pool.query(query, (err, result, fields) => {
          if (err) {
            console.log(err);
            return res.status(statusCodes[1]).json({
              success: false,
              errorCode: 1,
              message: errorCodes[1],
            });
          }
          return res.status(200).json({
            success: true,
            jwt: token
          });
        });
      });
    } catch (error) {
      console.log(error);
      return res.status(statusCodes[3]).json({
        success: false,
        errorCode: 3,
        message: errorCodes[3],
      });
    }
  },
};

module.exports = loginController;