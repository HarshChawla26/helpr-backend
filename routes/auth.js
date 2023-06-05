const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const userDB = require('../models/user');
const serviceDB = require('../models/service');
const user = require('../models/user');

/**
 * @param {Date} date
 */

function getSlot(){
    return Math.floor(Math.random()*10)
}

function getTimeSlot(){
    return Math.floor(Math.random()*9)+9;
}

async function f(){
    
}

//Signing up
router.post('/signup',async (req,res)=>{
    const {name,email,pwd,phone,address,role,service} = req.body;
    // let user = null
    try {
        const user = await userDB.find({email});
        // if(user) return res.json({msg:'user already registered'});

        const emailString = '^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$';
        const secpwd = await bcrypt.hash(pwd,10);
        // if(!email.match(emailString)) return res.json({msg:'invalid credentials'});
        if(role==='technician'){
            const serviceObj = await serviceDB.findOne({name:service})
            const newUser = new userDB({
                name,
                email,
                pwd:secpwd,
                phone,
                address,
                services:[],
                cart:[],
                role
            });
            serviceObj.execID = await newUser._id.toString();
            await newUser.save()
            await serviceObj.save();
            return res.json({msg:'Technician registered',user: newUser,serviceObj})
        }else{
            const newUser = new userDB({
                name,
                email,
                pwd:secpwd,
                phone,
                address,
                services:[],
                role
            });
            newUser.save()
            res.json({msg:'user registered',user: newUser});
        }

    } catch (error) {
        console.log(error)
        return res.json({"msg":"something went wrong"});
    }
})

//ALl users
router.get('/allusers',async(req,res)=>{
    const users = await userDB.find();
    res.send(users);
})

//adding to cart
router.post('/:_id/addtocart',async(req,res)=>{
    const {_id} = req.params;
    const {cart} = req.body
    const user = await userDB.findOne({_id});
    if(user){
        let a = user.cart;
        a = a.filter((e)=>{
            return e.id !== cart.id;
        })
        user.cart = [...a,cart]
        user.save();
    }
    res.send({msg:'added to cart'})
})

//Display ids cart
router.get('/:_id/cart',async (req,res)=>{
    const {_id} = req.params;
    const user = await userDB.findOne({_id},{cart:1})
    res.send(user)
})

//Delete from cart
router.delete('/:id/cart/:service',async (req,res)=>{
    const {id,service} = req.params;
    const user = await userDB.findOne({_id:id})
    if(user){
        let arr = user.cart;
        user.cart = arr.filter((e)=>{
            return e.id !== service;
        })
        user.save()
        // return res.send(user)
    }
    res.json({msg:'service deleted'})
})

router.post('/:_id/addServices',async(req,res)=>{
    const {_id} = req.params;
    const {cart} = req.body
    const user = await userDB.findOne({_id});
    if(user){
        user.cart = cart
        user.save();
    }
    res.send(user)
})

//Purchase API
router.patch('/:id/purchase',async(req,res)=>{
    const {id} = req.params;
    try{
        //finding user from to to place order
    const user = await userDB.findOne({_id:id});
    if(user){

        //getting services array
        let arr = user.services;

        // Traversing cart and adding essential info and adding to array
        user.cart.map(async(e,index)=>{
            let date = new Date()
            date.setDate(date.getDate()+getSlot())
            
            date.setHours(getTimeSlot())
            e.date = date.toDateString();
            e.time = `${date.getHours()}:00 ${(date.getHours()<12)?'AM':'PM'}`
            e.status = 'Booked'
            e.user = id;
            arr.push(e)
        })
        //traversing array then for every service searching the services in serviceDB getting service
        await arr.map(async (e)=>{
            const service = await serviceDB.findOne({name:e.name})
            // return res.send(service)
            if(service){
                const serviceMan = await userDB.findOne({_id:service.execID})
                serviceMan.services = arr;
                serviceMan.save()
            }
        })
        
        // These save changes in user profile permanently

        user.services = arr;
        user.cart = [];
        user.save()
        res.json({msg:'purchase done'})
    }}catch(err){
        console.log(err);
        return res.send({err});
    }
})

// Login API
router.post('/login',async (req,res)=>{
    const {email,pwd} = req.body;
    if(!email||!pwd) return res.status(400).json({"msg":"invalid credentials"})

    const user = await userDB.findOne({email});

    if(!user) return res.status(404).json({"msg":"Invalid credentials"});
    const isMatch = await bcrypt.compare(pwd,user.pwd);
    if(!isMatch){
        return res.json({msg:'Invalid credentials'})
    }
    res.status(200).json({user:user});
})

//display personal info of users
router.get('/:_id',async (req,res)=>{
    const {_id} = req.params
    const user = await userDB.findOne({_id},{
        _id:1,name:1,
        email:1,
        phone:1,
        address:1,
        role:1
    });
    if(!user){
        return res.send({msg:'No user exist'})
    }
    res.send(user)
})

// Display services of user
router.get('/:_id/services',async (req,res)=>{
    try{

        const {_id} = req.params
        const user = await userDB.findOne({_id},{services:1});
        if(!user){
            return res.send({msg:'No user exist'})
        }
        res.send(user)
    }catch(error){
        console.log(error)
        return res.json({msg:'something went wrong'})
    }
})

//Cancel order
router.delete('/:_id/service/:serId',async (req,res)=>{
    const {_id,serId} = req.params;
    try {
        const service = await serviceDB.findOne({_id:serId});
        const servMan  = await userDB.findOne({_id:service.execID})
        if(servMan){
            let arr = servMan.services;
            arr.filter(async()=>{
                
            })
        }
        const user = await userDB.findOne({_id},{services:1});
        if(user){
        let arr = await user.services;
        arr = await arr.filter((e)=>{
            return e.id !==serId;
        })
        user.services = arr;
        user.save()
    }
    res.json({msg:'service deleted'})
    } catch (error) {
     console.log(error)
     return res.json({msg:'something went wrong'})   
    }
})

//delete account of an user
router.delete('/:_id/delete',async (req,res)=>{
    const {_id} = req.params
    const user = await userDB.findByIdAndDelete({_id});
    if(!user){
        return res.send({msg:'No user exist'})
    }
    res.send({msg:'User deleted!'});
})

//updating services of an user
router.patch('/:id',async (req,res)=>{
    const {practices} = req.body;
    const {id} = req.params;
    try{
        const user = await userDB.findOne({_id:id});
        
        practices.forEach(element => {
            user.services.push(element);
        });
        user.save();
        res.json({msg:'Service added'});
    }catch(err){
        console.log(err);
        res.send({msg:"something went wrong"})
    }
})

router.patch('/:_id/changepwd',async (req,res)=>{
    const {_id} = req.params;
    const {oldPass,newPass} = req.body;
    try {
        const user = await userDB.findOne({_id});
        const oldCheckHash = await bcrypt.compare(oldPass,user.pwd);
        if(!oldCheckHash){
            return res.send({msg:'incorrect old Password'})
        }
        const secPass = await bcrypt.hash(newPass,10);
        user.pwd = secPass;
        user.save();
        res.json({msg:'Password changed'})
    } catch (error) {
        console.log(error)
        return res.json({msg:"something went wrong"})
    }
})

// updating user Info
router.patch('/:_id/editinfo',async(req,res)=>{
    const body = req.body;
    try{
    const user = await userDB.findOne({_id:req.params._id});
        if(user){
            if(body.name){
                user.name = body.name;
            }
            if(body.email){
                user.email = body.email;
                
            }
            if(body.phone){
                user.phone = body.phone;
            }
            if(body.address){
                user.address = body.address;
            }
            user.save()
        }
        res.status(200).send({msg:'Profile updated'})
    }catch(err){
        console.log(err)
        return res.json({msg:'something went wrong'})
    }
})

router.get('/services/:servid',async(req,res)=>{
    const {_id,servid} = req.params;
    try {
        
        const users = await userDB.find({});
        let arr = []
        const service = await serviceDB.findOne({_id:servid})
    if(users){
        await users.map((user)=>{
            user.services.map((e)=>{
                arr.push(e);
            })  
        })
        let filteredArr = await arr.filter((service)=>{
            return service.id === servid;
        })
        const us = await userDB.findOne({_id:service.execID})
        us.services = filteredArr;
        us.save();
    }
    res.send({msg:'done'})
    } catch (error) {
        console.log(error);
        res.send({msg:'something went wrong'})   
    }
})

module.exports = router;