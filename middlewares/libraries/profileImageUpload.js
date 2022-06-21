const multer = require("multer");
const path = require("path");
const CustomError = require("../../helpers/error/CustomError");


const storage = multer.diskStorage({
    destination:function(req,file,cb){
        const rootDir = path.dirname(require.main.filename);//server.js in bulundugu klasor (ana klasore gıttık question-answer-api)
        //bunu once buluyoruz ki burdan /public/uploads a gidelim
        cb(null,path.join(rootDir,"/public/uploads"))//callback icin error varsa ilk parametre hep o error olur ama simdilik null veriyoruz
        //dosyamızı nereye yuklucez onu verdık yukarıda
    },
    filename: function(req,file,cb) {
        //file mimetype : image/jpg gibi bir sey yani dosyanın front end tarafından verdigi original isim degil
        //mimetype hep image/jpeg, image/jpg gibi olur
        //extensionu boyle alıcaz ornegin : image/png olarak gelıcek biz bu png yi alıcaz
        const extension = file.mimetype.split("/")[1]; // mimetype kullanarak gonderılen dosyanın uzantısını aldık
         req.savedProfileImage = "image_" + req.user.id + "." + extension; // hem mongodb ye hem de uploads'a image'ı bu adla kaydedıcez
        cb(null,req.savedProfileImage);
    }
});

const fileFilter = function(req,file,cb){
    let allowedMimeTypes = ["image/jpg","image/gif","image/jpeg","image/png"];
    //file.mimetype : image/jpeg gibi bir sey verir bize o yuzden bunu kullanarak uygun uzantıları kontrol edıyoruz
    //dosya original adından onemsız bunu verıyor

    if(!allowedMimeTypes.includes(file.mimetype)){
        return cb(new CustomError("Please provide a valid image file",400),false); 
        //hata aldıgımız ıcın upload islemine devam etmesin false verdik bu yuzden
    }
    return cb(null,true);
}

const profileImageUpload = multer({storage,fileFilter});


module.exports = profileImageUpload;