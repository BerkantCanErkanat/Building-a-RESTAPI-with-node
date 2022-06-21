const bcrypt = require("bcryptjs");
const validateUserInput = (email,password) => {
    return email && password; //eger email ya da password bodyye verilmemis ise undefined gelir burası false doner
}
const comparePasswords = (password,hashedPassword) => {
    return bcrypt.compareSync(password,hashedPassword);

}
module.exports = {
    validateUserInput,
    comparePasswords
}