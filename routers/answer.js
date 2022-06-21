const express = require("express");
const router = express.Router({mergeParams:true}); // bir onceki router olan question dan gelirken orada req.params ları almak ıcın yazılır
const {getAccessToRoute,getAnswerOwnerAccess} = require("../middlewares/authorization/auth");
const {checkQuestionAndAnswerExist} = require("../middlewares/database/databaseErrorHelpers");
const {addNewAnswerToQuestion,getAllAnswersByQuestion, getSingleAnswer,updateAnswer,deleteAnswer,likeOrRemoveLike} = require("../controllers/answer");

router.post("/",getAccessToRoute,addNewAnswerToQuestion);
router.get("/",getAllAnswersByQuestion);
router.get("/:answer_id",checkQuestionAndAnswerExist,getSingleAnswer);
router.put("/:answer_id/edit",[getAccessToRoute,checkQuestionAndAnswerExist,getAnswerOwnerAccess],updateAnswer);
router.delete("/:answer_id/delete",[getAccessToRoute,checkQuestionAndAnswerExist,getAnswerOwnerAccess],deleteAnswer);
router.get("/:answer_id/likeOrremoveLike",[getAccessToRoute,checkQuestionAndAnswerExist],likeOrRemoveLike);

module.exports = router;