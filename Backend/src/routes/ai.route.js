// Defining Routes ...
const express = require('express') ; 
const router = express.Router() ; 
const getResponse = require('../controllers/ai.controller') ; 
const checkApiLimit = require('../Middlewares/checkApiLimit') ; 
const authMiddleware = require('../Middlewares/authMiddleware') ; 

router.post("/get-response"  , authMiddleware , checkApiLimit , getResponse ) ; 

module.exports = router ;  