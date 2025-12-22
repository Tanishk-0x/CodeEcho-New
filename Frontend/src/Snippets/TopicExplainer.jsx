import React, { useState } from 'react'
import '../Style/TopicExplainer.css';
import Spinner from '../Others/Loader/Spinner'; 
import MermaidChart from '../Others/Items/MermaidChart'
import {PROMPTS} from '../Others/Instructions/Prompt';
import axios from 'axios' ; 
import TypingEffect from '../Others/Typing/typing';
import toast from 'react-hot-toast';

const TopicExplainer = () => {

    // ------------- UseStates -------------------
    const[topic , setTopic] = useState('jsonwebtoken') ; 
    const[response , setResponse] = useState('') ; 
    const[loading , setLoading] = useState(false) ; 

    const[flowChart , setFlowChart] = useState(`
      flowchart TD
        A[Start] --> B(User Inputs a Technical Topic)
        B --> C(Check Topic Validity)
        C -->|Valid| D(Generate Definition)
        D --> E(Create Real-life Example)
        E --> F(Explain Working & Use-Cases)
        F --> G(Generate Mermaid Flowchart)
        G --> H(Assemble Final Explanation Block)
        H --> I[Display Complete Topic Explanation]
    `);

    const[defination , setDefination] = useState('') ; 
    const[description , setDescription] = useState('') ; 
    const[example , setExample] = useState('') ; 

    // -------------- Scale ------------------

    const [scale, setScale] = useState(1);

    const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

    // -------------- Handlers ------------------

    const fetchChartData = async () => {
      try {
        setLoading(true) ; 
        
        setDefination('');
        setDescription('');
        setExample('');

        const Prompt = PROMPTS.FlowChartData ; 
        const resChart = await axios.post("http://localhost:5000/llama/gen-response-groq" , 
          {code : topic , instruction : Prompt , title:"Topic_Explainer" }, 
          {withCredentials : true}
        ); 

        let chartRaw = resChart.data; 
        if(typeof chartRaw === 'object') chartRaw = JSON.stringify(chartRaw);
        const cleanedChart = chartRaw.replace(/```mermaid|```json|```/g, '').trim();
        setFlowChart(cleanedChart) ; 

        const Prompt0 = PROMPTS.TopicExplain ; 
        const resExplain = await axios.post("http://localhost:5000/llama/gen-response-groq" , 
          {code : topic , instruction : Prompt0 , title:"NULL"}, 
          {withCredentials : true}
        ); 

        let explainRaw = resExplain.data ; 
        
        if (typeof explainRaw === 'object') {
            explainRaw = JSON.stringify(explainRaw);
        }

        const firstCurly = explainRaw.indexOf('{');
        const lastCurly = explainRaw.lastIndexOf('}');

        if (firstCurly === -1 || lastCurly === -1) {
            throw new Error("Valid JSON structure not found in response");
        }

        let cleanedJson = explainRaw.substring(firstCurly, lastCurly + 1);

        cleanedJson = cleanedJson.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, "")
                                 .replace(/\n/g, "\\n");

        try {
            // Parse
            const parsedJSON = JSON.parse(cleanedJson);
            
            setResponse(parsedJSON) ;
            setDefination(parsedJSON.definition) ; 
            setDescription(parsedJSON.description) ; 
            setExample(parsedJSON.example) ; 
            
        } catch (parseError) {
            console.error("JSON Parse Failed:", parseError);
            toast.error("Failed to parse explanation data");
        }
        
        setLoading(false) ; 
      }
      catch (error) {
        console.error(error);
        const msg = error.response?.data?.message || "An error occurred during fetch";
        toast.error(msg) ; 
        setLoading(false) ; 
      }
    }


    // ------------------------------------------

  return (


    <div className="top-main">

      <header className="top-header">
        <div className="top-title">
          <p className='top-p'>Topic Explainer</p>
          <p className='top-by'>By CodeEcho</p>
        </div>
        <div className="top-controls">
          {
            loading ? <Spinner/> : <input type="text" placeholder='enter topic' onChange={(event) => setTopic(event.target.value)}/>
          }
          <button className='ex-btn' onClick={fetchChartData}>Explain</button>
          
        </div>
      </header>

      <div className="top-contents">
        
        <div className="top-left">

          <div className="top-defin">
            <span className='df df1'>#Defination : <span className='dfe'><TypingEffect text={defination} speed={30}/></span></span>
          </div>

          <div className="top-desc">
            <span className='df df2'>#Description : <span className='dfe'><TypingEffect text={description} speed={30}/></span></span>
          </div>

          <div className="top-example">
            <span className='df df3'>#Example : <span className='dfe'><TypingEffect text={example} speed={30}/></span></span>
          </div>

        </div>

        
        <div className="top-upper-right">
          <div className="tur">
            <div className="ps">
              <button onClick={zoomIn} className='qu-btn'>+</button>
              <button onClick={zoomOut} className='qu-btn'>-</button>
            </div>
          </div>

          <div className="top-right">

            <div className="top-chart" style={{ transform: `scale(${scale})` }}>
              <MermaidChart chart={flowChart} />
            </div>

          </div>
        </div>

      </div>


    </div>


  )
}

export default TopicExplainer