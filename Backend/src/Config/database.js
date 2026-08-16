const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false; 

exports.dbConnect = async () => {
    if (isConnected) {
        console.log('Using existing DB connection ✅');
        return;
    }

    const URL = process.env.MONGO_URL;

    if (!URL) {
        console.error("❌ Mongoose Error: MONGO_URL is missing in Vercel Env Variables!");
        return;
    }

    try {
        const db = await mongoose.connect(URL);
        
        isConnected = db.connections[0].readyState === 1;
        console.log('DB Connected Successfully on Vercel ✅'); 
        
    } catch (error) {
        console.error('Error in DB Connection:', error.message); 
    }
}