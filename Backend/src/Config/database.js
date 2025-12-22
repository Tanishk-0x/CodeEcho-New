const mongoose = require('mongoose') ; 
require('dotenv').config() ; 

exports.dbConnect = () => {

    const URL = "mongodb+srv://spiritualguruji007:5MAS6wEv7Fnq43uQ@trybyown.dravmm4.mongodb.net/?retryWrites=true&w=majority&appName=Cloudinary" ;

    mongoose.connect(URL)
    .then( () => {
        console.log('DB Connected Successfully ✅') ; 
    })
    .catch( (error) => {
        console.log('Error in DB Connection' , error) ; 
    })
    
}

