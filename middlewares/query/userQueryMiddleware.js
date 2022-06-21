const { searchHelper, paginationHelper } = require("./queryMiddlewareHelpers");
const asyncErrorWrapper = require("express-async-handler");
const userQueryMiddleware = function(model,options) { //bu fonk bir middleware fakat icine parametre alıyor
    //parametre verdigimiz ilk middleware fonku bu boyle yazılıyor. return kısmında fonk donduruyoruz

    return asyncErrorWrapper(async function(req,res,next){

        let query =  model.find();

        query = searchHelper("name",query,req);
        const total = model.countDocuments();
        const paginationResult = await paginationHelper(total,query,req); // bu fonk ıcınde await var diye bizde await ile alıyoz
        query = paginationResult.query;
        const pagination = paginationResult.pagination;

        const queryResults = await query.find();
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

module.exports = userQueryMiddleware;