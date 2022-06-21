const express = require("express");
const router = express.Router();
const {register,getUserProfile,login,logout,imageUpload, forgotPassword,resetpassword,editProfile} = require("../controllers/auth");
const {getAccessToRoute} = require("../middlewares/authorization/auth")
const profileImageUpload = require("../middlewares/libraries/profileImageUpload");
router.post("/register",register);
router.get("/profile",getAccessToRoute,getUserProfile);//korumak ıstedıgımız route a verdik token control fonkunu
router.post("/login",login);
router.get("/logout",getAccessToRoute,logout); //log out olmak ıcın yıne log in olmamız lazım token kontrolu yapılması lazım
router.post("/upload",[getAccessToRoute,profileImageUpload.single("profile_image")],imageUpload);
//profile_image bizim frontend tarafta yukledıgımız dosyanın keyi body icinden gonderılıyor
//2 tane middleware var once route access kontrol edıyoruz kullanıcı login veya register olup oturum suresi dolmamalı 
//sonra profileImageUpload.js deki storage,file name, file uzantısı kontrol falan kontrol edıyoruz
//tahminime gore profileImageUpload.single("profile_image") calısırken, bizim arkada yazdıgımız fonklar iste cb olarak donuyor
//en sonunda eger sıkıntı yoksa next() ile controllera gecıyoruz. Ama eger error donmussek onu next() ile arka tarafta kendi yapıyor gıbı
//yani tahminime gore o dosyada yazdıgımız cb() ler arkada yakalanıp islem goruyor her sey oksa sonunda next() ile controller gecerız
//controller tarafında sadece db ye image ın bulundugu alanı verıcez. Cunku uzantımıza yukleme ıslemı falan yapıldı middleware de zaten
router.post("/forgotpassword",forgotPassword);
router.put("/resetpassword",resetpassword);
router.put("/editProfile",getAccessToRoute,editProfile);
module.exports = router;