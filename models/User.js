const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const crypto = require("crypto");
const Question = require("./Question");
const UserSchema = new Schema({ //userdaki fieldları verıyoruz

    name: {
        type : String,
        required : [true,"Please provide a name"] // gerekli eger girilmezse bu mesaj doner
    },
    email: {
        type : String,
        required :  [true,"Please provide a valid email"], 
        unique :  true, //aynı emaile sahip 2 user olamaz
        match : [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, //berkant@gmail.com formatında olması ıcın regex kullanıyoruz eger olmazsa
            "Please provide a valid email"
        ]
    },
    role : {
        type : String,
        enum : ["user","admin"], //role fieldı sadece 2 farklı deger alabılır bunlardan baska alamaz
        default : "user" // bu da varsayılan olarak aldıgı deger (verilmezse user)
    },
    password : {
        type : String,
        required : [true,"Please provide a password"],
        minlength : [6,"Please provide a password with min length 6"], // min uzunluk
        select : false //bu userları db den cektigimiz zaman password alanı gozukmesın diyoruz.
    },
    createdAt : {
        type : Date,
        default : Date.now // kullanıcı kaydoldugu zamanı varsayılan olarak al
    },
    title : {
        type : String
    },
    about : {
        type : String
    },
    place : {
        type : String
    },
    website : {
        type: String
    },
    profile_image : { //kullanıcının pp si
        type : String,
        default : "default.jpg"
    },
    blocked : { //kullanıcı ılerde bloklanabılır
        type : Boolean,
        default : false
    },
    resetPasswordToken : {
        type: String
    },
    resetPasswordExpire : {
        type: String
    }
});
UserSchema.methods.sendResetPasswordTokenToUser = function() {
    const randomHexString = crypto.randomBytes(15).toString("hex");
    const {RESET_PASSWORD_EXPIRE} = process.env;

    const resetPasswordToken = crypto //tokeni olusturduk
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");

    //tokeni resetPasswordToken fieldına esle
    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpire = Date.now() + parseInt(RESET_PASSWORD_EXPIRE);
    return resetPasswordToken;

    //bu yeni degerler ile user modelini kaydetmek ıcın controllerda user.save() diyoruz

}
//UserSchema methods
UserSchema.methods.generateJwtFromUser = function() { // bu methoda user objesi ile ulasabılırsın
    const {JWT_SECRET_KEY,JWT_EXPIRE} = process.env;//process.env bir obje bu objenın o ozelliklerini vericek
    //secret key ile expireIn env de verıldı

    const payload = { // token ile gonderılecek bilgi
        id : this._id,
        name : this.name
    }

    const token = jwt.sign(payload,JWT_SECRET_KEY,{ // tokenı olusturma methodu
        expiresIn : JWT_EXPIRE
    });

    return token;
    

}

UserSchema.pre("save",function(next){ // create islemi save() methodunda db ye giris oncesi cagrılır
    //bu fonk veritabanına bir sey kaydetmeden hemen once calısıcak. Asagıda password icin hash islemi var ama. Ornegin
    //update isleminde password degısmemıs ıse db ye kaydetmeden hemen once tekrar hash atmanın manası yok
    if(!this.isModified("password")){ // User modeline bır ıslem yaptıgında password alanı degısmemıs ıse tekrar hash yapma
        next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if(err) next(err); // error customErrorHandlera gider
        bcrypt.hash(this.password, salt,(err, hash) => {//this.password hashlenecek password
            if(err) next(err);
            this.password = hash; //hash : verdigimiz passwordun hash li hali onu da tekrardan passworda verip pre fonku bıtıyor
            //bir user documentinin password alanı hashlendi
            next();
        });
    });

});

UserSchema.post("remove",async function(){ // User schema uzerinde remove() methodu cagrıldıktan sonrası burası calısır
    //kullanıcıları delete ederken remove() ile ettik yani silme sonrası diyoruz ki this(kullanıcı) id si eger herhangi bir 
    //sorunun da userID sine esitse yani kullanıcının her sorusunu sıl

    await Question.deleteMany({ 
        userID:this._id
    });

});

module.exports = mongoose.model("User",UserSchema); // bu schemayı mongoose a kaydetmek ıcın