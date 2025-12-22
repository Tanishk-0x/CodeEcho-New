const express = require('express'); 
const router = express.Router();
const GenerateResponse = require('./llama.controller'); 
const authMiddleware = require('../Middlewares/authMiddleware'); 
const checkApiLimit = require('../Middlewares/checkApiLimit'); 

router.post('/gen-response-groq' , authMiddleware , checkApiLimit , GenerateResponse); 

module.exports = router ; 