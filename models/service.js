const mongoose = require('mongoose');

const service = mongoose.model('services',{
    name: String,
    type:[],
    description:String,
    price:Number,
    areas:[],
    tags:[],
    execID:String
})
module.exports = service;