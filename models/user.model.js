const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fName: {
    type: String,
    required: true,
  },
  lName: String,
  username: {
    type: String,
    required: true,
    unique:true
  },
  role: {
    type: String,
    default: "user",
  },
  password: String,
});


const User = mongoose.model("User", userSchema);

module.exports = User;