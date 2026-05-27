const mongoose = require("mongoose");
const passportLocalMongoose =
  require("passport-local-mongoose").default ||
  require("passport-local-mongoose");
const registrationSchema = new mongoose.Schema({
fullname :{
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/]
},
phone:{
    type: String,
    required: true,
    match: /^\+2567\d{8}$/
}
})

registrationSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});

  module.exports = mongoose.model("Registration", registrationSchema);