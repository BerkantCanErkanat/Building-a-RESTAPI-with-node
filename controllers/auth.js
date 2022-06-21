const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");
const {sendJwtToClient} = require("../helpers/authorization/tokenHelpers");
const {validateUserInput, comparePasswords} = require("../helpers/input/inputHelpers");
const sendEmail = require("../helpers/libraries/sendEmail");

const register = asyncErrorWrapper(async(req,res,next) => {
   //POST DATA
   const {name,email,password,role} = req.body;

    const user = await User.create({ // burası sayesınde mongo db ye kaydedıyoruz
        name,
        email:email, // ES6 ile beraber eger degisken isimleri aynı ise : ile vermene gerek yok
        password,
        role
    });

    sendJwtToClient(user,res);
});
const login = asyncErrorWrapper(async(req,res,next) => {
    const {email,password} = req.body;
    if(!validateUserInput(email,password)){ //email veya password verilmemis bodyye
        return next(new CustomError("please check your input",400));
    }
    //const user = await User.findOne({email}); // bu sekilde arattıgımızda biz User schemasında password alanını select:false
    //yaptıgımız ıcın suan password gelmez. Ama bizim password kontrolu yapmamız lazım o yuzden alacagız
    const user = await User.findOne({email}).select("+password");
    
    if(user === null) { // req.body de gonderılen email db de yok
        return next(new CustomError("This email has never been used",400));
    }

    if(!comparePasswords(password,user.password)){ //bodyye konulan password ile hash li password kontrolu
        return next(new CustomError("Password wrong",400));
    }
    sendJwtToClient(user,res); //password da dogru ise yine tokeni olusturup browser cookiesine veriyoruz

}); 
// .cookie({ 
//     httpOnly:true, 
//     expires: new Date(Date.now()),
//     secure: NODE_ENV === "development" ? false:true
//     })
const logout = asyncErrorWrapper(async(req,res,next) => {
    const { NODE_ENV } = process.env; 
    res
    .status(200)
    .clearCookie("access_token")
    .json({
        success:"True",
        message:"Log out successful",
    })
});
const forgotPassword = asyncErrorWrapper(async(req,res,next) => {
    const resetEmail = req.body.email;
 
    const user = await User.findOne({email:resetEmail});
    //bu emaile sahip kullanıcı yok ise
    if(!user){
        return next(new CustomError("There is no user with this email",400))
    }
    //email bir kullanıcı ile eslesiyorsa token ver ve onu userin fieldlarına da ver 
    const resetPasswordToken = user.sendResetPasswordTokenToUser();

    await user.save();//reset password token tarafında user in reset password alanlarını guncelledık onları kaydetmek ıcın

    const resetPasswordURL = `${process.env.DOMAIN}/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;
    const emailTemplate = `
    <h3>Reset Your Password</h3>
    <p>This <a href=${resetPasswordURL} target = 'blank'>Link</a>will expire in 1 hour</p>
    `
    try {
        await sendEmail({
            from : process.env.SMTP_USER,
            to : resetEmail,
            subject : "Reset Your Password",
            html : emailTemplate,
            text : emailTemplate
        });
        return res
        .status(200)
        .send({
            success:"true",
            message:"token sent to your email"
        });
    }catch(e){ //email gonderılemedı demektır. O zaman user da resetPassword alanlarını undefined yapmamız gerekır
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        next(new CustomError("Email could not be sent",500));
    }    

});
const resetpassword = asyncErrorWrapper(async(req,res,next) => {
    const {resetPasswordToken} = req.query;
    const password = req.body.password;
    if(!resetPasswordToken) { // query de token var mı 
        return next(new CustomError("Please provide a valid reset token",400));
    }
    //token varsa devam
    let user = await User.findOne({
        resetPasswordToken : resetPasswordToken,
        resetPasswordExpire : {$gt : Date.now()}
    });

    if(!user) {
        next(new CustomError("Invalid Token or Token expired",404));
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save(); // pre save methodu calısır password degıstıgı ıcın yıne hashlenerek konur 

    res
    .status(200)
    .json({
        success:"true",
        message:"Reset password process successfull"
    })

});
const editProfile = asyncErrorWrapper(async(req,res,next) => {
    const editInfo = req.body;

    const user = await User.findByIdAndUpdate(req.user.id,editInfo,{
        new:true,
        runValidators:true
    });

    return res
    .status(200)
    .json({
        success:"true",
        data:user
    })

});
const getUserProfile = (req,res,next) => {
    res.json({
        success: "True",
        data : {
            id : req.user.id,
            name : req.user.name
        }
    })

}
const imageUpload = asyncErrorWrapper(async(req,res,next) => {

    //eger file konmamıs ıse buraya undefined geldigini gordum o yuzden yazdım
    //sanırım upload file middlewarini direkt gecıyor eger body ye file koymazsak cunku orada yakalayamadım. orada console hic yazmıyor
    //token check sonrası eger file konmamıs ıse dırekt buraya gelıyor. Biz de req.savedProfileImage file konmussa assign ettigimiz ıcın
    //bu undefined ise file konmadıgını anlıyoruz
    if(typeof req.savedProfileImage === "undefined"){
        return next(new CustomError("There is no file selected to upload (body ye file konmamıs)"));
    }
    const user = await User.findByIdAndUpdate(req.user.id,{
        "profile_image":req.savedProfileImage
    },{
        new:true,
        runValidators:true
    })
    
    res
    .status(200)
    .json({
        success:"True",
        message:"Image uploaded succsesfully",
        data:user
    })
});
module.exports = {
    register,
    getUserProfile,
    login,
    logout,
    imageUpload,
    forgotPassword,
    resetpassword,
    editProfile
}