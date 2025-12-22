import React, { useState } from 'react'
import '../Style/CodeQuizzer.css'; 
import {PROMPTS} from '../Others/Instructions/Prompt';
import axios from 'axios'; 
import prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import Editor from 'react-simple-code-editor';
import Markdown from 'react-markdown';
import { VscDebugStart } from "react-icons/vsc";
import Spinner from '../Others/Loader/Spinner'; 
import { TbPlayerTrackNextFilled } from "react-icons/tb";
import { TbSend } from "react-icons/tb";
import toast from 'react-hot-toast';


const CodeQuizzer = () => {

  // ------------- UseState Hook ---------------------
  const[code , setCode] = useState(`
    int calc( int n ){
      int sum = 0 ; 
        for(int i=0 ; i<=n ; i++ ){
          sum += i ; 
        }
      return sum ; 
    }  
  `); 
  const[response , setResponse] = useState('') ; 
  const[loading , setLoading] = useState(false) ; 
  const[questions , setQuestions] = useState([]) ; 
  const[index , setIndex] = useState(0) ; 
  
  const[count , setCount] = useState(0) ; 
  
  //---------- Submit Usestates ------------
  const[correctAnswer , setCorrectAnswer] = useState(0) ; 
  const[wrongAnswer , setWrongAnswer] = useState(0) ; 

  // -------------- Handlers -------------------------

  const FetchQuiz = async () => {

    try {
      setLoading(true) ; 
      
      // Reset states for a new quiz
      setQuestions([]);
      setIndex(0);
      setCount(0);
      setCorrectAnswer(0);
      setWrongAnswer(0);

      const Prompt = PROMPTS.CodeQuizzer ; 
      const res = await axios.post("http://localhost:5000/llama/gen-response-groq" , 
        { code , instruction : Prompt , title:"CodeQuizzer" }, 
        {withCredentials : true}
      ); 

      let rawData = res.data;
      
      if (typeof rawData === 'object') {
        rawData = JSON.stringify(rawData);
      }

      const firstCurly = rawData.indexOf('{');
      const lastCurly = rawData.lastIndexOf('}');

      if (firstCurly === -1 || lastCurly === -1) {
        throw new Error("Valid JSON structure not found");
      }

      let cleaned = rawData.substring(firstCurly, lastCurly + 1);

      cleaned = cleaned.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, "")
                       .replace(/\n/g, "\\n");

      try {
        const parsedJSON = JSON.parse(cleaned);
         
        if (parsedJSON.questions && Array.isArray(parsedJSON.questions)) {
            setResponse(parsedJSON);
            setQuestions(parsedJSON.questions);
            setIndex(0);
            toast.success("Test Started!");
        } else {
            toast.error("Invalid question format received");
        }
        
      } catch (error) {
        console.error("Parsing Error:", error);
        toast.error("Failed to parse quiz data");
      }
      setLoading(false);

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "An error occurred";
      toast.error(msg);
      setLoading(false);
    }
  }


  const currentQ = questions[index] || {
    question: 'Click the start button to generate questions.', 
    options: ['Option A', 'Option B', 'Option C', 'Option D']
  }; 

  const next = (selectedAnswer) => {
    if( selectedAnswer === currentQ.correct ){
      setCount(prev => prev + 1);
    }
  
    if(index < questions.length - 1 ){
      setIndex(prev => prev + 1); 
    } else {
      toast("You have reached the last question. Submit now!");
    }
  }

  const submitQuiz = () => {
    if (questions.length === 0) {
        toast.error("Start the test first!");
        return;
    }

    setCorrectAnswer(count); 
    setWrongAnswer(questions.length - count); 
    toast.success("Test Submitted Successfully"); 
  }
  


  // -------------------------------------------------


  return (


    <div className="q-main">

      <header className="q-header">
        <div className="q-title">
          <p className="q-p">Code Quizzer</p>
          <p className="q-by">By CodeEcho</p>
        </div>
        <div className="q-controls">

          <div className="loader">
            {
              loading ? <Spinner/> : ''
            }
          </div>

          {/* <button onClick={next} className='qu-btn'><TbPlayerTrackNextFilled /></button> */}
          <button onClick={FetchQuiz} className='qu-btn'><VscDebugStart /></button>
          <button onClick={submitQuiz} className='qu-btn'><TbSend /></button>
        </div>
      </header>

      <div className="q-contents">
        
        <div className="q-left">
          <div className="q-code">
            <Editor 
              value={code}
              onValueChange={code => setCode(code)}
              highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
              padding={10}
              className='code'
              style={{
                fontFamily: '"Fira code", "Fira mono", monospace',
                height: "100%",
                width: "100%",
                overflow: "scroll",
              }}
            />
          </div>
          <div className="q-bar">
            <p>CodeQuizzer transforms your code into a playground of questions, sparking curiosity with every line.
              It’s not just analysis — it’s an elegant dance between logic and learning.  </p>
          </div>
        </div>

        <div className="q-right">
          
          <div className="q-question">
              <p> <span>Question.{index+1} :</span>  {currentQ.question} </p>
          </div>

          <div className="optsec-1">
            <div className="q-option q-a" onClick={() => next(currentQ.options[0])}> <p><span>A : </span>  {currentQ.options[0]}</p> </div>
            <div className="q-option q-b" onClick={() => next(currentQ.options[1])} > <p><span>B : </span> {currentQ.options[1]}</p> </div>
          </div>

          <div className="optsec-2">
            <div className="q-option q-c" onClick={() => next(currentQ.options[2])} > <p><span>C : </span> {currentQ.options[2]}</p> </div>
            <div className="q-option q-d" onClick={() => next(currentQ.options[3])} > <p><span>D : </span> {currentQ.options[3]}</p> </div>
          </div>

          {/* <div className="q-solvedbar">
            Bars!
          </div> */}

          <div className="q-result">
            <div className="q-r">
              <div className="r1">
                <p>Total Questions </p>
                <p>20</p>
              </div>
              <div className="r2">
                <p>Correct Answer</p>
                <p>{correctAnswer}</p>
              </div>
              <div className="r3">
                <p>Wrong Answer</p>
                <p>{wrongAnswer}</p>
              </div>
            </div>
            <div className="q-w">
              <p className='rules'>Directives : </p>
              <div className='ru'>
                <p>Input must be a valid code snippet (C++, Python, Java, etc.).</p>
                <p>System will generate 20 MCQ-based questions.</p>
                <p>Questions cover logic, output, syntax, complexity, etc.</p>
                <p>Each question has 4 options, only one is correct.</p>
                <p>Submit to track your score (correct , incorrect) </p>
                <p>Questions are randomly ordered for fairness.</p>
                <p>One question is visible at a time for better focus.</p>
              </div>
            </div>
          </div>

        

        </div>

      </div>

    </div>


  )

}

export default CodeQuizzer
