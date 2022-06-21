const express = require("express");
const router = express.Router();
const {getAccessToRoute,getAdminAccess} = require("../middlewares/authorization/auth")
const {blockUser,deleteUser} = require("../controllers/admin");
const {checkUserExist} = require("../middlewares/database/databaseErrorHelpers");
//block user 
//delete user 
//once login-register olmus kullanıcı kontrolu yapılcak getAccessToRoute ile sonra adminlik kontrolu yapılcak

//router.get() gibi fonklar ıcıne normalde middleware yazardık ve bu routea ulasmadan once bazı kontroller yapardık
//simdi bu middleware kontrolleri buradaki her route icin gerceklesecegınden sadece router.use() diyerek icine yazıyoruz
//buradaki her route icin once o kontroller yapılıyor 
router.use([getAccessToRoute,getAdminAccess]);

//burada block ve delete islemi yapılacak ve bu islemlerde URL ye id verilcek params olarak verilen idye karsılık gelen bir 
//user var mı onun kontrolu her route oncesi yapılabılır 
//bunu use ile kullanamazsın cunku use once okunur ve params kısmında id yi goremez o yuzden params olayı varsa request fonkunun ıcıne yaz

router.get("/block/:id",checkUserExist,blockUser);

router.delete("/delete/:id",checkUserExist,deleteUser);

module.exports = router;