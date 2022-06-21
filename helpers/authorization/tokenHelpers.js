const sendJwtToClient = (user,res) => {
    //JWT olustur
    const token = user.generateJwtFromUser();

    //response zamanı JWT yi cookiye ver ve res dondur
    const { JWT_COOKIE,NODE_ENV } = process.env; 
    // cookie option tarafında eger development ortamdaysak sadece http request olsun diye secure: false
    //eger productionda isek sadece https request olsun diye secure:true yapıcaz

    res
    .status(200)
    .cookie("access_token",token,{
        httpOnly:true, 
        expires: new Date(Date.now() + parseInt(JWT_COOKIE) * 1000*60), //JWT_COOKIE ms cinsinden olması ıcın. Boylelikle 10dk gecerli olur
        secure: NODE_ENV === "development" ? false:true
    })
    .json({
        success:"True",
        access_token : token,
        data : {
            name:user.name,
            email:user.email
        }
    })

}
const isTokenIncluded = (req) => { //token headera eklenmis mi ve (Bearer ile mi baslıyor)
    return req.headers.authorization && req.headers.authorization.startsWith("Bearer:");
}
const getAccessTokenFromHeader = (req) => {
    const authorization = req.headers.authorization;
    const access_token = authorization.split(" ")[1]; //Bearer: qrqweqweqwe
    return access_token;
}

module.exports = {
    sendJwtToClient,
    isTokenIncluded,
    getAccessTokenFromHeader
}