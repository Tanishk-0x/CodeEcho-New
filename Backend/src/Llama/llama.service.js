const Groq = require('groq-sdk'); 
require('dotenv').config(); 

const Llama_Api_Key = process.env.LLAMA_API_KEY ; 

const groq = new Groq({
    apiKey : Llama_Api_Key 
}); 

const GroqGenerate = async ( code , instruction ) => {
    try {
        const ChatCompletion = await groq.chat.completions.create({
            model : "openai/gpt-oss-120b" , 

            messages : [
                {
                    role : "system" , 
                    content : instruction 
                }, 
                {
                    role : "user" , 
                    content : code 
                }
            ]
        }); 

        const result = (ChatCompletion.choices[0].message.content) ; 

        return result ; 

    }
    
    catch (error) {
        console.log("Error In Groq Generation : " , error); 
        return error ; 
    }
}

module.exports = GroqGenerate ; 