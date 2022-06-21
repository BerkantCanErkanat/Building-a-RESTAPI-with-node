const Answer = require("../models/Answer");
const Question = require("../models/Question");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");


const addNewAnswerToQuestion = asyncErrorWrapper(async(req,res,next) => {
    const {question_id} = req.params;
    const user_id = req.user.id;
    const information = req.body;

    const answer = await Answer.create({
        ...information,
        userID: user_id,
        questionID: question_id
    });

    res
    .status(200)
    .json({
        success:true,
        message:answer
    })

});

const getAllAnswersByQuestion = asyncErrorWrapper(async(req,res,next) => {
    const {question_id} = req.params;

    const question = await Question.findById(question_id).populate("answers");
    const answers = question.answers; 

    //question.answers dedigimizde aslında bize answerların ID leri donuyor 
    //ama biz findById() ile populate kullanırsak answers icin bu o questionun answers alanında bulunan tum answer idleri ile
    //bize oradaki answerların tum fieldlarını getırır
    //yoksa biz teker teker tum idleri dolasıp answer fieldlarına bakmak zorunda kalırdık

    res
    .status(200)
    .json({
        success:true,
        length:answers.length,
        data:answers
    })

});

const getSingleAnswer = asyncErrorWrapper(async(req,res,next) => {
    const answer_id = req.params.answer_id;

    const answer = await Answer.findById(answer_id)
    .populate({ // spesifik alanlar gelsın islemi
        path:"userID", //neyi populate edelım
        select:"name role"
    })
    .populate("questionID"); // questionun her fieldı gelır (neyi populate edelım)

    res
    .status(200)
    .json({
        success:true,
        data:answer
    })

});
const updateAnswer = asyncErrorWrapper(async(req,res,next) => {
    const answer_id = req.params.answer_id;
    const {content} = req.body;

    const answer = await Answer.findById(answer_id);

    answer.content = content;

    await answer.save();

    res
    .status(200)
    .json({
        success:true,
        data:answer
    })

});

const deleteAnswer = asyncErrorWrapper(async(req,res,next) => {
    const answer_id = req.params.answer_id;
    const question_id = req.params.question_id;

    await Answer.findByIdAndRemove(answer_id);

    const question = await Question.findById(question_id);

    question.answers.splice(question.answers.indexOf(answer_id),1);
    question.answerCount = question.answers.length;

    await question.save();

    res
    .status(200)
    .json({
        success:true,
        message: "Answer deleted successfully"
    })

});

const likeOrRemoveLike = asyncErrorWrapper(async(req,res,next) => {
    const {answer_id} = req.params;
    
    const answer = await Answer.findById(answer_id); 

    if(answer.likes.includes(req.user.id)){ // kullanıcı like etmis ise like sil
        answer.likes.splice(answer.likes.indexOf(req.user.id),1);
    }else{ // kullanıcı like edıyor
        answer.likes.push(req.user.id);
    }

    await answer.save();


    res
    .status(200)
    .json({
        success:true,
        data:answer
    })


}); 

module.exports = {
    addNewAnswerToQuestion,
    getAllAnswersByQuestion,
    getSingleAnswer,
    updateAnswer,
    deleteAnswer,
    likeOrRemoveLike
}