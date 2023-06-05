const express = require('express')
const app = express();
const path = require('path')

const router = express.Router();

const auth = require('./routes/auth')

const service = require('./routes/services');
const cors = require('cors')

app.use(cors())
app.use(express.json())

const db = require('./db');
const PORT = 4000;

app.use(express.static(path.join(__dirname+'/public/build')));

app.use('/auth',auth);
app.use('/services',service)

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname+'/public/build/index.html'))
})


app.listen(PORT,()=>{
    console.log(`Server listening on http://localhost:${PORT}`)
})
