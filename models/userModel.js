const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    // firstName:{
    //     type:String,
    //     required:true,
    // },
    // lastName:{
    //     type:String,
    //     required:true
    // },
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
    // requests:[{
    //     type:mongoose.Schema.Types.ObjectId,ref:'users',
    //     default:null
    // }],
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
},{timestamps:true})

const user = mongoose.model('users',userSchema)
module.exports = user;
