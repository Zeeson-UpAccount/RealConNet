const mongoose  = require("mongoose");
const passportLocalMongoose =  require("passport-local-mongoose");

let UserSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    admin: Boolean
});

UserSchema.plugin(passportLocalMongoose);

let User = mongoose.model("User", UserSchema);

module.exports = User;
