const User = require("../../models/User");
const Question = require("../../models/Question");
const CustomError = require("../../helpers/error/CustomError");
const Answer =require("../../models/Answer");
const asyncErrorWrapper = require("express-async-handler");

const checkUserExist = asyncErrorWrapper(async(req,res,next) => {
    const {id} = req.params;
    //console.log(id);
    const user = await User.findById(id);

    if(!user) { // user yok controllera gitmeden hata fırlat
        return next(new CustomError("There is no user with this id",400));
    }
    next();//user varsa controller a git 
});
const checkQuestionExist = asyncErrorWrapper(async(req,res,next) => {
    const question_id = req.params.id || req.params.question_id; 
    // params.id = /:id dedigin alan router da o yuzden o alan adını degısırsen burayı da degıs
    //console.log(id);
    const question = await Question.findById(question_id);

    if(!question) { // question yok controllera gitmeden hata fırlat
        return next(new CustomError("There is no question with this id",400));
    }
    next();//question varsa controller a git 
}); 

const checkQuestionAndAnswerExist = asyncErrorWrapper(async(req,res,next) => {
    const question_id = req.params.question_id; 
    const answer_id = req.params.answer_id;

    const answer = await Answer.findOne({
        _id : answer_id,
        questionID : question_id
    });

    if(!answer) { // answer yok veya answer veya question baglantılı degıl
        return next(new CustomError("There is no questipn-answer pair with these ids",400));
    }
    next();//question-answer uyusuyor
}); 

module.exports = {
    checkUserExist,
    checkQuestionExist,
    checkQuestionAndAnswerExist
}