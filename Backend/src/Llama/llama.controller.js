const GroqGenerate = require('./llama.service'); 
const User = require('../Models/UserModel'); 

const GenerateResponse = async ( req , res ) => {
    try {
        const { code , instruction , title } = req.body ; 
    
        // -------------------------------------------

        if(!code){
            res.status(401).json({
                success : false , 
                message : "Code Can Not Be Empty"
            }); 
        }

        const response = await GroqGenerate( code , instruction ) ; 

        // -------------------------------------------

        const user = await User.findById(req.user.id) ;

        if( title === "Comment_Generator" || title === "Complexity_Analyzer" || title === "Language_Converter" || 
            title === "Code_Explainer" || title === "Code_Optimizer" || title === "CodeQuizzer" ||
            title === "Code_Reviewer" || title === "Code_Summarizer" || title === "Topic_Explainer" ||
            title === "ChatEase" 
        ){

            user.history.push({
                featuredUsed : title , 
                codeSnippet : code.slice(0,300) , 
            }); 
        }

        await user.save() ;

        res.send(response) ; 
    }
    
    catch (error) {
        res.status(500).json({
            success : false ,
            message : "Error In Llama Controller" , 
            error : error 
        });    
    }
}

module.exports = GenerateResponse ; 