const express = require("express");
const dotenv = require("dotenv");
const routers = require("./routers/index");
const connectDb = require("./helpers/database/connectDatabase");
const customErrorHandler = require("./middlewares/errors/customErrorHandler") // fonku export etmıstık
const path = require("path");
const fs = require('fs');
const app = express();
//environment
dotenv.config({
    path : "./config/env/config.env"
});

//mongoose db connection
connectDb();

//Express body middleware
app.use(express.json());

const PORT = process.env.PORT; //ya 5000 portu ya da ortamın uygun portu(yayınlama zamanı falan)

//router middleware : once /api ile routersa git oradan da question ve autha dagıl 
app.use("/api",routers);


//Error handling
app.use(customErrorHandler);


app.listen(PORT,() => {
    console.log(`App started on ${PORT}: ${process.env.NODE_ENV}`);
})

