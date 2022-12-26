const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

// Do admin login
exports.doAdminLogin = (data)=>{
    const response = {};
  return new Promise(async (res, rej) => {
    try{
        const email = await userModel.findOne({ email: data.usernameOrEmail });
        const username = await userModel.findOne({
          username: data.usernameOrEmail,
        });
        if (email || username) {
          let user;
          email ? (user = email) : (user = username);
          if(user.isAdmin){
          await bcrypt
            .compare(data.password, user.password)
            .then(async(status) => {
                if(status){
                  // Create JWT
                  const accessToken = jwt.sign(
                    {'id':user.id},
                    process.env.ACCESS_TOKEN_SECRET,
                    {expiresIn:'1d'}
                  )
                  const refreshToken = jwt.sign(
                    {'id':user.id},
                    process.env.REFRESH_TOKEN_SECRET,
                    {expiresIn:'1d'}
                  )
                  const users = await userModel.find()
                    const otherUsers = users.filter(person => person.id !== user.id)
                    const currentUser = {...user,refreshToken}
                    response.admin = user;
                    response.accessToken = accessToken
                    response.refreshToken = refreshToken
                    response.status = status;
                    res(response)
                }else{
                    response.message = 'Entered password is incorrect.'
                    res(response)
                }
            })
        }else{
            response.message = 'You are not an admin of Chatbox.'
            res(response)
        }
    }else{
        response.message = 'You are not an admin of Chatbox.'
        res(response)
    }
    }catch(err){
        rej(err)
    }
  });
}