const CustomError = require("../../helpers/error/CustomError");
const {isTokenIncluded,getAccessTokenFromHeader} = require("../../helpers/authorization/tokenHelpers");
const asyncErrorWrapper = require("express-async-handler");
const User = require("../../models/User");
const Question = require("../../models/Question");
const jwt = require("jsonwebtoken");
const Answer = require("../../models/Answer");

const getAccessToRoute = (req,res,next) => { //kullanıcı login mi yeni mi register oldu token suresi ne alemde bakmak ıcın  
    const {JWT_SECRET_KEY} = process.env;
    //Token Control
    //401 : unauthorized
    //403: forbidden
    if (!isTokenIncluded(req)){ //Token headera eklenmemıs
       return next(new CustomError("you are not authorized to access this route (Token headerda yok)",401));
    }else {
        const access_token = getAccessTokenFromHeader(req);
        jwt.verify(access_token,JWT_SECRET_KEY, (err,decoded) => {
            if(err) { // Ya login register olmadı ya da token suresi doldu (suan 10 dk)
                return next(new CustomError("you are not authorized to access this route",401));
            }else {
                req.user = { // gidilen route'ta alıcaz bu bilgileri
                    id : decoded.id,
                    name : decoded.name
                }
                next(); // token controlu sonrası ok ise o route erisimine izin ver
            }
        })
    }
}
const getAdminAccess = asyncErrorWrapper(async(req,res,next) => {
    //buraya gelmeden once getAccessToRoute dan gecicek o yuzden req.user.id ve req.user.name alanları olmus olucak
    //id yi alarak db den sorgulatıp role admin mi ona bakıcaz

    const {id} = req.user;
    const user = await User.findById(id);


    if(user.role !== "admin"){ // admin degil
        return next(new CustomError("Only admins can access this route",403));
    }
    next(); //admin 


});

const getQuestionOwnerAccess = asyncErrorWrapper(async(req,res,next) => {
    //buraya gelmeden once getAccessToRoute dan gecicek o yuzden req.user.id ve req.user.name alanları olmus olucak
    //user id sini alıcaz 
    const userID = req.user.id;

    //questiona erisirken question ID params olarak gelıcek /questionID
    const questionID = req.params.id;

    const question = await Question.findById(questionID);

    if(question.userID != userID){ // baskasının sorusunu edilemeye calısıyor
        return next(new CustomError("Only Question owner can handle this operation",403));
    }
    next(); //question owner buraya erismis 


});

const getAnswerOwnerAccess = asyncErrorWrapper(async(req,res,next) => {
    //buraya gelmeden once getAccessToRoute dan gecicek o yuzden req.user.id ve req.user.name alanları olmus olucak
    //user id sini alıcaz 
    const userID = req.user.id; //login - register olan kisi

    //answer erisirken question ID params olarak gelıcek /questionID
    const answer_id = req.params.answer_id;

    const answer = await Answer.findById(answer_id);

    if(answer.userID != userID){ // baskasının sorusunu edilemeye calısıyor
        return next(new CustomError("Only Answer owner can handle this operation",403));
    }
    next(); //question owner buraya erismis 


});

module.exports = {
    getAccessToRoute, // middleware olarak routers altında auth.js de kullancaz cunku token kontrol etmek ıstedıgımız route orda (tokentest)
    getAdminAccess,
    getQuestionOwnerAccess,
    getAnswerOwnerAccess
}