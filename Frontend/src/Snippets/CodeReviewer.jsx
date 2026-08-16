import React, { useEffect, useState } from 'react'
import '../Style/CodeExplain.css'
import Editor from 'react-simple-code-editor';
import prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import MermaidChart from '../Others/Items/MermaidChart'
import { PROMPTS } from '../Others/Instructions/Prompt';
import axios from 'axios';
import Spinner from '../Others/Loader/Spinner';
import toast from 'react-hot-toast';

const CodeReviewer = () => {

  // ----------- UseState ----------------
  const [code, setCode] = useState(`
    int calc ( int n ){
      int sum = 0 ; 
      for(int i=0 ; i<n ; i++ ){
        sum += i ; 
      }
     return sum ; 
    }  
  `);

  const [response, setResponse] = useState(null);
  
  const [pie, setPie] = useState(`
    pie
    "Readable Code" : 16
    "Efficient Logic" : 16
    "Well-Commented" : 16
    "Needs Improvement" : 16
    "Error Handling Present" : 16
    "Modular/Reusable Functions" : 16
  `);
  
  const [loading, setLoading] = useState(false);

  // ------------ Handlers ---------------

  const handleAnalyze = async () => {
    setLoading(true);
    await Promise.allSettled([fetchReviewData(), fetchPieData()]);
    setLoading(false);
  };

  const fetchReviewData = async () => {
    try {
      const PROMPT = PROMPTS.CodeReviews;
      const res = await axios.post("https://codeecho-backend-three.vercel.app/llama/gen-response-groq",
        { code, instruction: PROMPT, title: "NULL" },
        { withCredentials: true });

      let rawData = res.data;
      if (typeof rawData === 'object') {
        rawData = JSON.stringify(rawData);
      }

      const firstCurly = rawData.indexOf('{');
      const lastCurly = rawData.lastIndexOf('}');

      if (firstCurly === -1 || lastCurly === -1) {
        throw new Error("Valid JSON not found");
      }

      let cleaned = rawData.substring(firstCurly, lastCurly + 1);

      cleaned = cleaned.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, "");

      cleaned = cleaned.replace(/\n/g, "\\n");

      let parsedJSON;
      try {
        parsedJSON = JSON.parse(cleaned);
      }
      catch (e) {
        cleaned = cleaned.replace(/\\n/g, "\\n").replace(/\\'/g, "\\'").replace(/\\"/g, '\\"');
        parsedJSON = JSON.parse(cleaned);
      }

      setResponse(parsedJSON);

    } catch (error) {
      console.error("Review Data Error:", error);
      toast.error("Failed to fetch review data");
    }
  }


  const fetchPieData = async () => {
    try {

      const PROMPT = PROMPTS.PieChart;
      const res = await axios.post("https://codeecho-backend-three.vercel.app/llama/gen-response-groq",
        { code, instruction: PROMPT, title: "Code_Reviewer" },
        { withCredentials: true });

      let rawData = res.data;
      
      if (typeof rawData === 'object') {
        rawData = JSON.stringify(rawData);
      }

      const cleanedPie = rawData.replace(/```mermaid|```json|```/g, '').trim();

      setPie(cleanedPie);

    } catch (error) {
      console.error("Pie Chart Error:", error);
      toast.error("Failed to generate chart");
    }
  };


  // --------------------------------------

  return (
    <div className="review-main">

      <header className="review-header">
        <div className="ex-title rev-title">
          <p className='ex-p rev-p'>Code Reviewer</p>
          <p className='ex-by rev-by'>By CodeEcho</p>
        </div>
        <div className="review-controls">
          {
            loading ? <Spinner /> : (
              <div className="score">
                {response ? response.score : 0} <span> /10</span>
              </div>
            )
          }
          <button className='rev-btn' onClick={handleAnalyze}>
            {loading ? "Analyzing..." : "Review"}
          </button>
        </div>
      </header>

      <div className="review-contents">

        <div className="rev-cr">

          <div className="rev-code">
            <div className="rev-usercode">
              <Editor
                value={code}
                onValueChange={code => setCode(code)}
                highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira mono", monospace',
                  borderRadius: "5px",
                  height: "100%",
                  width: "100%",
                  overflow: "auto", 
                }}
              />
            </div>

            <div className="rev-section">
              <p>Performance : <span>{response ? response.performance : "Pending Review..."}</span></p>
            </div>

          </div>

          <div className="rev-pie">
            <MermaidChart chart={pie} />
          </div>

        </div>

        <div className="rev-others">

          <div className="review-scenes">

            <div className="rev-one potential">
              <p>Potential bugs : <span>{response ? response.potential_bugs : "..."}</span></p>
            </div>

            <div className="rev-one smell">
              <p>Smell : <span>{response ? response.smell : "..."}</span></p>
            </div>

            <div className="rev-one suggestion">
              <p>Suggestion : <span>{response ? response.suggestion : "..."}</span></p>
            </div>

          </div>

          <div className="rev-final">
            <p>Final Verdict : <span>{response ? response.final_verdict : "Click Review to analyze"}</span></p>
          </div>

        </div>

      </div>

    </div>

  )
}

export default CodeReviewer