const nodemailer = require("nodemailer");


const sendEmail = async(mailOptions) => { //mail kime gidicek icerik ne : mailOptions
    const transporter = await nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port : process.env.SMTP_PORT,
        secure : false,
        auth : {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        // tls: { // avastın mail protection kapat buna ihtiyac yokmus :d yine olmazsa reject false yap ama guvensız bu konıları ogren
        //dev ortamı ıcın sıkıntı yokta prod ıcın ogren
        //     //rejectUnauthorized: false
        //     //ca: [ fs.readFileSync('CA.pem') ]
        // }
    });
    try{
        let info = await transporter.sendMail(mailOptions); // mail gonderımı basarılı
        console.log(`Message sent: ${info.messageId}`);
    }catch(e){
          console.log(e);
    }
}

module.exports = sendEmail;