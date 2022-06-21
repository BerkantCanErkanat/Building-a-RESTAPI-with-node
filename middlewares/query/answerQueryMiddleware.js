//bura icin kullancaz router.get("/:id",checkQuestionExist,getSingleQuestion);
const { populateHelper, paginationHelper } = require("./queryMiddlewareHelpers");
const asyncErrorWrapper = require("express-async-handler");

const answerQueryMiddleware = function(model,options) { 
    //aslında bir id li questionın answerlarını burada paginate ediyoruz

    return asyncErrorWrapper(async function(req,res,next){
        const {id} = req.params;

        const arrayName = "answers";

        const total = (await model.findById(id))["answerCount"];
        
        const paginationResult = await paginationHelper(total,undefined,req); // bu fonk ıcınde await var diye bizde await ile alıyoz
        const startIndex = paginationResult.startIndex;
        const limit = paginationResult.limit;
        const pagination = paginationResult.pagination;
        
        let queryObject = {};

        //array icin paginate islemi normalde bunu skip() ve limit() fonkları ıle yapardık
        queryObject[arrayName] = {$slice : [startIndex,limit]};

        let query = model.find({_id : id},queryObject);

        if(options && options.population){
            query =  populateHelper(query,options.population);
        }

        const queryResults = await query;
        //buradaki querynin controllerda kullanılabilmesi icin rese koyuyoruz
        res.queryResults = {
            success : true,
            count : queryResults.length,
            pagination : pagination,
            data : queryResults
        };
        next();

    });
}

module.exports = answerQueryMiddleware;