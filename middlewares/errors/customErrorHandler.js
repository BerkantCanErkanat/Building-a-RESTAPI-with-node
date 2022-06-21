const CustomError = require("../../helpers/error/CustomError")
const customErrorHandler = (err,req,res,next) => {
    // next() icine yazdıgın sey err ile alınır
    //console.log(err.name);
    let customError = err;

    if(err.name === "SyntaxError") { // bu tip errorlerin statusu yok biz vericez
        customError = new CustomError("Unexpected Syntax",400);
    }
    if(err.code === 11000){ //var olan email girilmisse. Bunu yakalamak ıcın once erroru yazdırdık koduna baktık kodundan anladık
        customError = new CustomError("Duplicate key error",400);
    }
    if(err.name === "ValidationError"){ //mesela password icin min length altı gırılırse, required alanlar gırılmezse
        customError = new CustomError(err.message,400);
    }
    if(err.name === "CastError"){ //mesela password icin min length altı gırılırse, required alanlar gırılmezse
        customError = new CustomError("Please provide a valid ID",400);
    }

    res
    .status(customError.status || 500)
    .json({
        success : "False",
        message : customError.message
    })

}

module.exports = customErrorHandler