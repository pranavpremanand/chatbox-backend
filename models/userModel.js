const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    },
    followers:[{
        type:mongoose.Schema.Types.ObjectId,ref:'users',
        default:null
    }],
    following:[{
        type:mongoose.Schema.Types.ObjectId,ref:'users',
        default:null
    }],
    isAdmin:{
        type:Boolean,
        default:false
    },
    profilePic:{
        type:String
    },
    coverPic:{
        type:String
    },
    about:{
        type:String
    },
    livesIn:{
        type:String
    },
    worksAt:{
        type:String
    },
    relationship:{
        type:String
    },
    unseenNotifications:[{
        content:String,
        date: Date,
        userId:{
            type:mongoose.Schema.Types.ObjectId,ref:'users',
        },
        postId:{
            type:mongoose.Schema.Types.ObjectId,ref:'posts',
        },
    }],
    seenNotifications:[{
        content:String,
        date: Date,
        userId:{
            type:mongoose.Schema.Types.ObjectId,ref:'users',
        },
        postId:{
            type:mongoose.Schema.Types.ObjectId,ref:'posts',
        },
    }],
    verificationRequest:{
        type:Boolean,
        default:false
    },
    verifiedUser:{
        type:Boolean,
        default:false
    },
},{timestamps:true})

const user = mongoose.model('users',userSchema)
module.exports = user;
