const mongoose= require('mongoose')

const userSchema= new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String,
        default:null
    }

})
const questionSchema= new mongoose.Schema({
    title:{ type:String,
     required:true,
    },
    description:{
        type:String,
        required:true
    },
    postedBy:{
       type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
        },
        datePosted:{
            type:Date,
            default:Date.now
        }
    
        
    })
    const answerSchema= new mongoose.Schema({
        question:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Question',
            required:true
        },
        answerText:{
            type:String,
            required:true
        },
        postedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true

        },
        datePosted:{
            type:Date,
            default:Date.now
        }
    })
   const User= mongoose.model("User",userSchema);
   const Question = mongoose.model("Question",questionSchema)
   const Answer= mongoose.model("Answer",answerSchema)


    module.exports={
        User,Question,Answer
    }