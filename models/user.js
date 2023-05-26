const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name     :  String,
    email    :  String,
    pwd      :  String,
    phone    :  String,
    address  :  String,
    services :  Array,
    cart     :  Array,
    role     :  String
})

const user = mongoose.model('user',userSchema)
module.exports = user;