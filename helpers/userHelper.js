const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateEmail } = require("./validation");

//Do signup
exports.doSignup = (data) => {
  // console.log(data);
  const response = {};
  return new Promise(async (res, rej) => {
    try {
      const emailExist = await userModel.findOne({ email: data.email });
      const usernameExist = await userModel.findOne({
        username: data.username,
      });
      if (!usernameExist && !emailExist) {
        data.password = await bcrypt.hash(data.password, 10);
        const user = {
          fullName: data.fullName,
          username: data.username,
          email: data.email,
          password: data.password,
        };
        const newUser = new userModel(user);
        await newUser.save();
        response.created = true;
        response.message = "Account created successfully.";
        res(response);
      } else if (usernameExist) {
        response.userExist = true;
        response.message = "Username already exist.";
        res(response);
      } else if (emailExist) {
        response.userExist = true;
        response.message = "Email already exist.";
        res(response);
      }
    } catch (err) {
      response.error = true;
      response.message = "Something went wrong. Try again.";
      rej(response);
    }
  });
};

//Do login
exports.doLogin = (data) => {
  console.log(data)
  if (data.loginWithOtp) {
    data.usernameOrEmail = data.email;
  }
  const response = {};
  return new Promise(async (res, rej) => {
    try {
      console.log('user check')
      const email = await userModel.findOne({ email: data.usernameOrEmail });
      const username = await userModel.findOne({
        username: data.usernameOrEmail,
      });
      if (email || username) {
        // console.log(email, "email user", username, "username user");
        let user;
        email ? (user = email) : (user = username);
        // console.log(user,'USER Data')
        if (user) {
          // Create JWT
          // console.log("USERID HERE",user._id)
          // const refreshToken = jwt.sign(
          //   {'id':user.id},
          //   process.env.REFRESH_TOKEN_SECRET,
          //   {expiresIn:'1d'}
          // )
          const accessToken = jwt.sign(
            { id: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
          );

          if (data.loginWithOtp) {
            response.user = user;
            response.accessToken = accessToken;
            // response.refreshToken = refreshToken
            response.success = true;
            response.otpLoginSuccess = true;
            res(response);
          }
          await bcrypt
            .compare(data.password, user.password)
            .then(async (status) => {
              if (status) {
                response.user = user;
                response.accessToken = accessToken;
                // response.refreshToken = refreshToken
                response.success = status;
                res(response);
              } else {
                console.log('entered password is incorrect')
                response.message = "Entered password is incorrect.";
                res(response);
              }
            });
        } else {
          console.log("no user");
          response.message = "User does not exist.";
          res(response);
        }
      } else {
        console.log('no user exist')
        response.message = "User does not exist.";
        res(response);
      }
    } catch (err) {
      rej(err);
    }
  });
};
