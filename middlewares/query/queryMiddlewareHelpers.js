const searchHelper = (searchKey,query,req) => {
    if(req.query.search){
        const searchObject = {};

        //simdi kullanıcı search parametresi ile MonGoDB yazmıs olabilir veya mongodb yazmıs olabilir yani kucuk buyuk harf
        //farklı yazarak aratmıs olabilir ama hepsinin aynı sonuca cıkmasını ıstıyoruz bu sebeble regex kullanıyoruz ve
        //i flag'ini veriyoruz i flagi verilen stringi case-insensitive hale getırıyor
        //aynı zamanda bu flag sayesinde 
        const regex = new RegExp(req.query.search,"i");

        searchObject[searchKey] = regex; //searchObject'in title fieldı regex oldu (bu questionun diger fieldlarına gore
        //degısebılır)
        //searchKey bizim question documentlerinde bulunan bir field

        //artık title fieldı o regexi iceren her document karsımıza gelıcek. Yani aynı olmasına gerek yok 
        //req.query.search ile alınan stringi iceren her title document olarak karsımıza gelır
        // yani title ornegin How to find the max element in an array olsun ve biz req.query.search icine 'the' verelim
        //bu title a sahip olan documentte artık karsımıza gelıcek
        return query.where(searchObject);
    }
    //eger queryde search yoksa direkt return et
    return query; 
}
const populateHelper = (query,population) => {
    console.log(query.populate);
    return query.populate(population);
}
const questionSortHelper = (query,req) => {
    const sortKey = req.query.sortBy;

    if(sortKey === 'most-answered'){
        return query.sort('-answerCount'); // ondeki - buyukten kucuge yapar ilki aynı ise ikinciye gore demek
    }
    if(sortKey === 'most-liked'){
        return query.sort('-likeCount');
    }
    return query.sort('-createdAt');
}
const paginationHelper = async (totalDocuments,query,req) => {
    //pagination (db den her sey bir anda cekilmez. performans acısından sayfa ve limit verilir)
    //skip(2) yazarsak baslangıctan 2 document atlar ve gelenden almaya baslar
    //limit(2) 2 tane al demektir ornegin skip(2) limit(2) kullanırsak 3 ve 4 . document alır
    ///api/questions?page=2&limit=3
    const page = parseInt(req.query.page || 1); //kullanıcı hangı page gosterılsın ıstıyor default 1
    const limit = parseInt(req.query.limit || 5); //kullanıcı bir sayfada kac document ıstıyor default 5
    const startIndex = (page - 1) * limit; //ornegin page = 3 ise startIndex = 10 olur yani skipte 10 verirsek 10 atlar
    //startIndex > 0 ise page > 1 dir yani hep onceki sayfa var demektir
    const endIndex = page * limit; //page = 3 ise endIndex = 15 olur yani start 10 end 15 bu sayede 10-15 arasını gostermıs oluruz
    //aynı zamanda endIndexe gore sonraki sayfanın olup olmadıgını kontrol edıcez

    const pagination = {};
    const total = totalDocuments

    //pageination objesi front end taraf icin gerekli. Kullanıcı hangi sayfada oldugunu ve previous next sayfa var mı gormesı icin
    if(startIndex > 0){
        pagination.previous = {
            page : page - 1,
            limit : limit
        }
    }
    if(endIndex < total){
        pagination.next = {
            page : page + 1,
            limit : limit
        }
    }
    return {
        query : query === undefined ? undefined : query.skip(startIndex).limit(limit),
        pagination : pagination,
        startIndex,
        limit
    }
}
module.exports = {
    searchHelper,
    populateHelper,
    questionSortHelper,
    paginationHelper
}