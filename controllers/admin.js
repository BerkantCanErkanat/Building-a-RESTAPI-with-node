const User = require("../models/User");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const blockUser = asyncErrorWrapper(async(req,res,next) => {
    const {id} = req.params;

    const user = await User.findById(id);

    user.blocked = !user.blocked; // blocked ise blocku ac block degılse blokla 

    await user.save();

    res
    .status(200)
    .json({
        success:true,
        message:"Block-unblock is done"
    })

});
const deleteUser = asyncErrorWrapper(async(req,res,next) => {
    const {id} = req.params;

    const user = await User.findById(id);

    await user.remove(); // bunun ıcın post hooks yazılacak user sılındıkten sonra userin soruları cevapları da sılınecek

    res
    .status(200)
    .json({
        success:true,
        message:"user deleted successfully"
    })

});

module.exports = {
    blockUser,
    deleteUser
}