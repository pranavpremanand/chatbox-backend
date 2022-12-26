const adminHelper = require('../helpers/adminHelper')

// Do admin login
exports.doAdminLogin = (req,res)=>{
    adminHelper.doAdminLogin(req.body).then((response)=>{
        if(response.admin){
            // res.cookie('jwt',response.refreshToken,{httpOnly:true,maxAge:24*60*60*1000})
              res.status(200).send({data:response.admin,accessToken:response.accessToken,success:true})
          }else{
              res.status(200).send({message:response.message,success:false})
          }
      }).catch(err=>{
          res.status(500).send({message:'Something went wrong. Try again.',err})
      })
}