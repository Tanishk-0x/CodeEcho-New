import React, { useState, useEffect } from 'react'
import '../Style/CodeComplexity.css'
import Editor from 'react-simple-code-editor';
import prism from "prismjs";
import { PROMPTS } from '../Others/Instructions/Prompt';
import axios from 'axios';
import ComplexityChart from '../Others/Items/ComplexityChart';
import Spinner from '../Others/Loader/Spinner';
import Markdown from 'react-markdown';
import toast from 'react-hot-toast';

const CodeComplexity = () => {

  // --------------- useStates -------------------
  const [code, setCode] = useState(`
  int sum ( int a , int b ){
    int c = a + b ; 
    return c ; 
  }
  `);
  
  const [complexity, setComplexity] = useState('');
  const [pieceofcode, setPieceofcode] = useState('');
  const [whythis, setWhythis] = useState('');
  const [howtoimprove, setHowtoimprove] = useState('');
  const [loading, setLoading] = useState(false); 
  const [time, setTime] = useState('O(1)');
  const [space, setSpace] = useState('O(1)');

  // -------------- Handlers --------------------

  useEffect(() => {
    if (complexity && typeof complexity === 'string') {
      const parts = complexity.trim().split(' ');
      if (parts.length >= 2) {
        setTime(parts[0]);
        setSpace(parts[1]);
      } else {
        setTime(parts[0] || 'Not Found');
        setSpace('Not Found');
      }
    }
  }, [complexity]);

  const ComplexityFetch = async () => {
    try {
      setLoading(true);
      
      setComplexity('');
      setPieceofcode('');
      setWhythis('');
      setHowtoimprove('');

      const Prompt = PROMPTS.ComplexityAnalyzer;
      
      const res = await axios.post("https://codeecho-backend-three.vercel.app/llama/gen-response-groq",
        { code, instruction: Prompt, title: "Complexity_Analyzer" },
        { withCredentials: true }
      );

      let rawData = res.data;
      if (typeof rawData === 'object') {
        rawData = JSON.stringify(rawData);
      }
      console.log("RAW DATA --> ", rawData);

      const firstCurly = rawData.indexOf('{');
      const lastCurly = rawData.lastIndexOf('}');

      if (firstCurly === -1 || lastCurly === -1) {
        throw new Error("Valid JSON not found in response");
      }

      let cleaned = rawData.substring(firstCurly, lastCurly + 1);
      cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, (char) => {
         return ""; 
      });

      console.log("CLEANED STRING -->", cleaned);

      let parsedJSON;
      try {
        parsedJSON = JSON.parse(cleaned);
      } catch (e) {
        const superCleaned = cleaned.replace(/\n/g, "\\n"); 
        parsedJSON = JSON.parse(superCleaned);
      }
      
      console.log("PARSED OBJECT -->", parsedJSON);

      if (parsedJSON.Complexity) setComplexity(parsedJSON.Complexity);
      if (parsedJSON.PieceOfCode) setPieceofcode(parsedJSON.PieceOfCode);
      
      const whyData = parsedJSON.WhyThisComplexity || parsedJSON[" WhyThisComplexity"];
      if (whyData) setWhythis(whyData);

      if (parsedJSON.HowToImprove) setHowtoimprove(parsedJSON.HowToImprove);

      setLoading(false);

    } catch (error) {
      console.error("FULL ERROR DETAILS:", error);
      
      let message = "An error occurred";
      
      if (error.response) {
        // Server error
        message = error.response.data?.message || "Server Error";
      } else if (error instanceof SyntaxError) {
        // JSON Parsing error
        message = "JSON Parsing Failed: AI format incorrect";
      } else {
        // Other JS errors
        message = error.message;
      }
      
      toast.error(message);
      setLoading(false);
    }
  }

  // ---------------------------------------------

  return (

    <div className="comp-main">

      <header className="comp-header">
        <div className="by">
          <h1>Complexity Analyzer</h1>
          <p>By CodeEcho</p>
        </div>
        <div className="comp-btn">
          <div className="comp-loader">
            {loading ? <Spinner/> : ''}
          </div>
          <button onClick={ComplexityFetch} className='ex-btn'> 
            {loading ? 'Analyzing...' : 'Analyze'} 
          </button>
        </div>
      </header>

      <header className="comp-suggest">
        <div className="suggest">
          <p className='ct'> How to improve : </p>
          <Markdown>{String(howtoimprove)}</Markdown>
        </div>
      </header>

      <section className="comp-section">
        <div className="comp-outer">
          <div className="comp-left">
            <div className="comp-code">
              <Editor 
                value={code}
                onValueChange={code => setCode(code)}
                highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
                padding={10}
                className='comp-cc'
                style={{
                  fontFamily: '"Fira code", "Fira mono", monospace',
                  fontSize: 14,
                  borderRadius: "5px",
                  height: "100%",
                  width: "100%",
                  overflow: "auto",
                }}
              />
            </div>
            <div className="comp-piece">
              <div className="pieceofcode">
                <p className='ct'> Piece of code : </p>
                <Markdown>{String(pieceofcode)}</Markdown>
              </div>
            </div>
          </div>

          <div className="comp-right">
            <div className="comp-chart">
              <div className="chart-text">
                  <div className="time">
                    <p>Time : <span>{time}</span></p>
                  </div>
                  <div className="space">
                    <p>Space : <span>{space}</span></p>
                  </div>
              </div>
              <div className="chart-chart">
                <ComplexityChart time={time} space={space} />
              </div>
            </div>

            <div className="comp-why">
              <div className="why">
                <p className='ct'> Why this complexity : </p>
                <Markdown>{String(whythis)}</Markdown>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>

  )
}

export default CodeComplexity