const Question = require("../models/Question"); //Question : collection
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const askNewQuestion = asyncErrorWrapper(async(req,res,next) => {
    const information = req.body; // req.body de gonderilen objeyi alıyoru

    const question = await Question.create({ // db ye yazmadan once pre hook save calısır 
        ...information, // gonderılen objenin icerigini almak ıcın spread operator kullanıyoruz
        userID : req.user.id
    });

    res
    .status(200)
    .json({
        success:"True",
        data:question
    });
});

const getAllQuestions = asyncErrorWrapper(async(req,res,next) => {
    
    //api/questions?search=mongo bu tarz bir path oldugunda ? ve sonrası query params olarak gecer
    //yine aynı pathtten alırsın ve ? sonrası kullandıgın kelime olan 'search' burada req.query.search ile alıp degerine 
    //ulasabilirsin
    //console.log(req.query.search);
    res
    .status(200)
    .json(res.queryResults);
}); 

const likeOrRemoveLike = asyncErrorWrapper(async(req,res,next) => {
    const {id} = req.params;
    
    const question = await Question.findById(id); 

    if(question.likes.includes(req.user.id)){ // kullanıcı like etmis ise like sil
        question.likes.splice(question.likes.indexOf(req.user.id),1);
    }else{ // kullanıcı like edıyor
        question.likes.push(req.user.id);
    }
    question.likeCount = question.likes.length;

    await question.save();


    res
    .status(200)
    .json({
        success:true,
        data:question
    })


}); 

const getSingleQuestion = asyncErrorWrapper(async(req,res,next) => {
    res
    .status(200)
    .json(res.queryResults);
}); 

const editQuestion = asyncErrorWrapper(async(req,res,next) => {
    const id = req.params.id;

    const {title,content} = req.body;
    
    let question = await Question.findById(id); 

    question.title = title;
    question.content = content;

    question = await question.save();
    res
    .status(200)
    .json({
        success:true,
        data:question
    })


}); 

const deleteQuestion = asyncErrorWrapper(async(req,res,next) => {
    const id = req.params.id;
    
    await Question.findByIdAndDelete(id);  // question delete sonrası post hook yok o yuzden dırekt sılıyoruz

    res
    .status(200)
    .json({
        success:true,
        message:"Question deleted"
    });


}); 

module.exports = {
    askNewQuestion,
    getAllQuestions,
    getSingleQuestion,
    editQuestion,
    deleteQuestion,
    likeOrRemoveLike,
}