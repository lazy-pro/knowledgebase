const mongoose = require('mongoose')

//user schema
const UserSchema =mongoose.Schema({
  name:{
    type: String,
    reuired: true
  },
  email:{
    type: String,
    reuired: true
  },
  username:{
    type: String,
    reuired: true
  },
  password:{
    type: String,
    reuired: true
  }
});


const User = module.exports = mongoose.model('User',UserSchema);
