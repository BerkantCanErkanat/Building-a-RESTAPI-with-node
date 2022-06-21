const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");
const QuestionSchema = new Schema({
    //required alanları document create ederken koyman gerek
    title: {
        type:String,
        required:[true,"Please provide a title"],
        minlength:[5,"Please provide a title with at least 5 characters"],
        unique:[true,"There is already a question with this title"]
    },
    content : {
        type:String,
        required:[true,"Please provide a full detailed content"],
        minlength:[10,"Please provide a content with at least 10 characters"]
    },
    slug : String,
    createdAt : {
        type:String,
        default:Date.now
    },
    //ref kullanma amacımız ılerıde populate dedıgımız an buradaki id leri kullanarak o documentin tum fieldlarlarını verıcek bize
    userID : { // questionu yazan user id si olucak ve referansta User collectionu olucak 
        type:mongoose.Schema.ObjectId,
        required:true,
        ref:"User"
    },
    likes : [ // array oldugunu ve string olarak user object id leri tutacagını soyledık
        {
            type:mongoose.Schema.ObjectId,
            ref:"User"
        }
    ],
    likeCount : {
        type : Number,
        default : 0
    },
    answerCount : {
        type : Number,
        default : 0
    },
    answers : [
        {
            type:mongoose.Schema.ObjectId,
            ref:"Answer" // hangı collectiona referans verıyor. Hangı collectionun dokumentlerının ID sini tutuyor
        }
    ]
});

//db ye yazmadan once burası calısıcak
QuestionSchema.pre("save",function(next){ // this : question documentini isaret eder 
    if(!this.isModified(this.title)){ //question title modify edilmemis ise slug olusturma 
        next(); // pre islem tmm devam et
    }
    this.slug = this.makeSlug(); // this question documentı demek 
    next() // pre islem tamam devam et
});

QuestionSchema.methods.makeSlug = function() {
    return slugify(this.title, {
        replacement: '-',  // replace spaces with replacement character, defaults to `-`
        remove: /[*+~.()'"!:@]/g, // title icinde kaldırılmasını ıstedıgın sey 
        lower: false,      // convert to lower case, defaults to `false`
      });
}

module.exports = mongoose.model("Question",QuestionSchema); // bu schemayı mongoose a kaydetmek ıcın