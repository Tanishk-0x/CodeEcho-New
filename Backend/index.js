require('dotenv').config() ; 
const express = require('express') ; 
const aiRoutes = require('./src/routes/ai.route')  ; 
const cors = require('cors') ; 
const app = express() ; 
const AuthRoutes = require('./src/routes/authRoutes') ; 
const authMiddleware = require('./src/Middlewares/authMiddleware');
const UserRoutes = require('./src/routes/user') ; 
const cookieParser = require('cookie-parser') ; 
const meRoutes = require('./src/routes/meRoutes') ; 
const userProfileRoutes = require('./src/routes/userProfileRoute') ; 
require('./src/Config/database').dbConnect() ; 
const GroqRoutes = require('./src/Llama/llama.routes'); 

const PORT = 5000 ; 

app.set('trust proxy', 1);


// MiddleWares 
app.use(express.json()) ; 

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// cookie parser 
app.use(cookieParser()) ; 


// default route 
app.get('/' , (req , res) => {
    res.send('Hello World!')
}) ; 


// -- mounting -- 
app.use('/ai' , aiRoutes) ; 
app.use('/auth' , AuthRoutes) ;
app.use('/user' , UserRoutes) ; 
app.use('/check' , meRoutes) ; 
app.use('/profile' , userProfileRoutes) ; 

app.use('/llama' , GroqRoutes) ; 


if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server Started SuccessFully At Port No : ${PORT} ✅`); 
    });
}

module.exports = app;


