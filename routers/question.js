const express = require("express");
const router = express.Router();
const answer = require("./answer");
const Question = require("../models/Question");
const {getAccessToRoute,getQuestionOwnerAccess} = require("../middlewares/authorization/auth");
const {checkQuestionExist} = require("../middlewares/database/databaseErrorHelpers");
const {askNewQuestion,getAllQuestions,getSingleQuestion,editQuestion,deleteQuestion,likeOrRemoveLike} = require("../controllers/question");
const questionQueryMiddleware = require("../middlewares/query/questionQueryMiddleware");
const answerQueryMiddleware = require("../middlewares/query/answerQueryMiddleware");

router.post("/ask",getAccessToRoute,askNewQuestion);
router.get("/",questionQueryMiddleware(Question,{
    population : { 
    path:"userID",
    select:"name profile_image"}
}),getAllQuestions);
router.get("/:id",checkQuestionExist,answerQueryMiddleware(Question,{
    population : [
        {
            path:"userID",
            select:"name profile_image"
        },
        {
            path:"answers",
            select:"content"
        }
    ]
}),getSingleQuestion);
router.put("/:id/edit",[getAccessToRoute,checkQuestionExist,getQuestionOwnerAccess],editQuestion);
router.delete("/:id/delete",[getAccessToRoute,checkQuestionExist,getQuestionOwnerAccess],deleteQuestion);
router.get("/:id/likeOrremoveLike",[getAccessToRoute,checkQuestionExist],likeOrRemoveLike);

//answer
router.use("/:question_id/answers",checkQuestionExist,answer);
//burada use atıp answer routeruna gectıgımız ıcın bir onceki params (question_id falan) artık answer routunda bulunamaz
//middlewarede alabılıyorum ama parametreyi
//yani yukarıda ornegin paramsları alıyoruz ama orada baska bir routea gecmıyoruz artık request ile controllera gecıyoruz
//burada ise tekrar routera gectıgımız ıcın params kayboluyor ve bizim onu merge ederek almamız lazım
//bunun ıcın answer router ıcınde mergeParams:true optionu verıyoruz yani gectigimiz yerde merge yapıyoruz burda degıl


//use kullanırsan bir sonraki route da use atarkenki params alamazsın. request atarasn post get delete gibi
//attıgın paramsı alabılırsın
//use atıp params almak ıcın gıttıgın yerdeki routeda mergeParams:true vermen lazım
module.exports = router;