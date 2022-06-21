const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Question = require("./Question");

const Answerchema = new Schema({
    content : {
        type:String,
        required:[true,"Please provide a full detailed content"],
        minlength:[10,"Please provide a content with at least 10 characters"]
    },
    createdAt : {
        type:String,
        default:Date.now
    },
    likes : [ // array oldugunu ve string olarak object id leri tutacagını soyledık
    {
        type:mongoose.Schema.ObjectId,
        ref:"User"
    }
    ],
    userID : { // Answerı yazan user id si olucak ve referansta User collectionu olucak 
        type:mongoose.Schema.ObjectId,
        required:true,
        ref:"User"
    },
    questionID : { // bu answer hangi questiona ait
        type:mongoose.Schema.ObjectId,
        ref:"Question",
        required:true
    }


});

Answerchema.pre("save",async function(next){
    if(!this.isModified("userID")) return next(); // answer update edılırse dırekt cık bu fonktan 
    //bence burada o question.answers() icinde o userID var mı ona da bakılabılırdı
    
    try{ // ilk defa answer olusturulmus
        const question = await Question.findById(this.questionID);
        question.answers.push(this._id);
        question.answerCount = question.answers.length;
        await question.save();
        next();
    }catch(e){
        return next(e);
    }

});

module.exports = mongoose.model("Answer",Answerchema); // bu schemayı mongoose a kaydetmek ıcın