
const express = require('express');
const serviceDB = require('../models/service');
const router = express.Router();

// router.get('/',(req,res)=>{
//     res.json('service API')
// })

router.get('/allservices',async (req,res)=>{
    try{

        let list = await serviceDB.find()
        let arr = []
        list.map((obj)=>{
            // console.log(obj.name)
            arr.push(obj.name);
        })
        res.send({msg:"Services recieved",arr})
    }catch(err){
        console.log(err)
        res.json({msg:'something went wrong'})
    }
})

router.get('/allcities',async (req,res)=>{
    let list = await serviceDB.find()
    let arr = []
    list.map((obj)=>{
        obj.areas.map((city=>{
            if(!arr.includes(city)){
                arr.push(city);
            }
        }))
    })
    res.send(arr)
})
router.get('/city',async (req,res)=>{

    const {city} = req.query;
    let services =  await serviceDB.find();
    services = await services.map(e=>{
        const f = e.areas.map(el=>{
            return el.toLowerCase();
        })
        e.areas = f;
        return e;
    });
    let fil = await services.filter(e=>{
        if(e.areas.includes(city)) return true;
        return false;x
    })
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
    
            // Swap
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    };
    shuffle(fil)
    res.send(fil);
})
router.post('/data',async(req,res)=>{
    const {name,type,description,price,areas,tags,execID} = req.body;
    const service = new serviceDB({name,type,description,price,areas,tags,execID});
    await service.save();
    res.json({msg:"data posted"});
})

router.get('/data',async (req,res)=>{
    let data = await serviceDB.find();
    res.send(data);
})

//get 
router.get('/:_id',async(req,res)=>{
    const {_id} = req.params;
    try {
        
        const service = await serviceDB.findOne({_id});
        if(!service){
            return res.status(404).json({'msg':'no id found'});
        }
        res.json({service});
    } catch (error) {
        console.log(error)
        res.send('error occured'+error)
    }
})

module.exports = router;