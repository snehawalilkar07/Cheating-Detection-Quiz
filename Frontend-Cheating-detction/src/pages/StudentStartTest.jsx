import React, { useEffect, useRef, useState } from "react";
import './Dashboard.css';
import './StudentTest.css'; 
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const StudentStartTest = () => {
  const videoRef = useRef();
  const intervalRef = useRef();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [review, setReview] = useState(null);
  const [phase, setPhase] = useState("quiz-selection");
  const [status, setStatus] = useState("Idle");
  const [warnings, setWarnings] = useState(0);
  const [responseId, setResponseId] = useState(null);
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const userRole = user?.role;

  useEffect(() => {
    if (userRole !== "student") {
      alert("Only students are allowed to attempt tests.");
      return;
    }
    fetch(`http://localhost:5000/api/quiz?user_id=${userId}`)
      .then(res => res.json())
      .then(setQuizzes);
  }, [phase]);

  useEffect(() => {
    if (selectedQuiz) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        videoRef.current.srcObject = stream;
      });
    }
  }, [selectedQuiz]);

  const verifyFace = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.9));
    const formData = new FormData();
    formData.append("frame", blob);
    const res = await fetch("http://localhost:5000/verify-face", { method: "POST", body: formData });
    const data = await res.json();
    if (data.verified) setPhase("ready");
  };

  useEffect(() => {
    if (phase === "verifying") {
      const interval = setInterval(() => {
        if (videoRef.current?.readyState === 4) verifyFace();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const sendFrame = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.9));
    const formData = new FormData();
    formData.append("frame", blob);
    formData.append("response_id", responseId);
    const res = await fetch("http://localhost:5000/process-frame", { method: "POST", body: formData });
    const data = await res.json();
    setStatus(data.status);
    setWarnings(data.warnings);
    if (data.status === "locked") {
      clearInterval(intervalRef.current);
      setPhase("locked");
      handleSubmit(true);
    }
  };

  const startTest = () => {
    setPhase("testing");
    intervalRef.current = setInterval(() => {
      if (videoRef.current?.readyState === 4) sendFrame();
    }, 2000);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const handleSubmit = async (forceLocked = false) => {
    if (submitted) return;
    setSubmitted(true);
    clearInterval(intervalRef.current);

    // Stop camera stream
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    const cheated = forceLocked || phase === "locked";
    const res = await fetch("http://localhost:5000/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, quiz_id: selectedQuiz.id, response_id: responseId, answers, cheated, locked: cheated }),
    });
    const data = await res.json();
    setScore(data.score);
    setPhase("submitted");
  };

  const handleQuizSelect = async quiz => {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
    setSelectedQuiz(quiz);
    const res = await fetch(`http://localhost:5000/api/quiz/${quiz.uuid}/questions`);
    const data = await res.json();
    setQuestions(data);
    setPhase("verifying");
    const response = await fetch("http://localhost:5000/api/start-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, quiz_id: quiz.id }),
    });
    const resData = await response.json();
    setResponseId(resData.response_id);
  };

  useEffect(() => {
    const handleEscape = async (e) => {
      if (e.key === "Escape" && (phase === "testing" || phase === "ready" || phase === "verifying")) {
        const confirmExit = window.confirm("⚠ Pressing ESC will auto-submit your test. Do you want to proceed?");
        if (confirmExit) {
          clearInterval(intervalRef.current);
          await handleSubmit(true);
        } else {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          }
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [phase]);

  const handleReview = async (responseId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/review/${responseId}`);
      const data = await res.json();
      setReview(data);
      setPhase("review");
    } catch (err) {
      console.error("Failed to fetch review", err);
    }
  };

  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers(prevAnswers => {
      const updated = [...prevAnswers];
      const index = updated.findIndex(ans => ans.question_id === questionId);
      if (index !== -1) {
        updated[index].selected_option = selectedOption;
      } else {
        updated.push({ question_id: questionId, selected_option: selectedOption });
      }
      return updated;
    });
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-panel flex-grow-1">
        <Topbar />
        <div className="main-content p-4">
          <div className="quiz-wrapper">
            <h2>📋 Cheating Detection Quiz System</h2>

            {phase === "quiz-selection" && (
              <div className="quiz-scroll-wrapper">
                <div className="quiz-form-container">
                  <h3>Select a Quiz</h3>
                  <div className="dashboard-grid">
                    {quizzes.map((q) => (
                      <div className="webcam-container" key={q.uuid}>
                        <div className="quiz-card-header">
                          <h4>{q.title}</h4>
                          {q.attempted && q.locked && (
                            <span className={`badge ${q.cheated ? "bg-danger" : "bg-success"}`}>
                              {q.cheated ? "Cheating Detected" : "Clean Attempt"}
                            </span>
                          )}
                        </div>
                        <div className="quiz-card-actions">
                          {q.attempted && q.locked ? (
                            <>
                              <button className="quiz-form-button" disabled style={{ marginRight: "12px" }}>
  Already Attempted
</button>

                              {q.review_available && (
                                <button className="quiz-form-button" onClick={() => handleReview(q.response_id)}>
                                  Review
                                </button>
                              )}
                            </>
                          ) : (
                            <button className="quiz-form-button" onClick={() => handleQuizSelect(q)}>
                              Start Test
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(phase === "verifying" || phase === "ready" || phase === "testing" || phase === "locked") && (
              <div className="test-layout d-flex">
                {/* LEFT: Questions or Instructions */}
                <div className="question-panel flex-grow-1">
                  {phase === "verifying" && <p>Verifying face... please look at the camera.</p>}
                  {phase === "ready" && (
                    <div>
                      <p>Face verified. Click below to begin the test.</p>
                      <button className="btn btn-primary" onClick={startTest}>Start Test</button>
                    </div>
                  )}
                  {(phase === "testing" || phase === "locked") && questions.length > 0 && (
                    <div className="question-block">
                      {/* <h5>Status: {status}</h5>
                      <p>Warnings: {warnings}</p> */}
                      <div className="question-text">
                        {currentQuestionIndex + 1}. {questions[currentQuestionIndex].question_text}
                      </div>
                      <div className="options-wrapper">
                        {[questions[currentQuestionIndex].option1, questions[currentQuestionIndex].option2, questions[currentQuestionIndex].option3, questions[currentQuestionIndex].option4].map((opt, i) => (
                          <label key={i} className="option-label">
                            <input
                              type="radio"
                              name={`question-${questions[currentQuestionIndex].id}`}
                              disabled={phase === "locked"}
                              onChange={() => handleOptionChange(questions[currentQuestionIndex].id, opt)}
                              checked={answers.find(a => a.question_id === questions[currentQuestionIndex].id)?.selected_option === opt}
                            />
                            {" "}{opt}
                          </label>
                        ))}
                      </div>
                      <div className="navigation-buttons mt-3">
                        <button className="btn btn-secondary me-2" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)}>⬅ Previous</button>
                        <button className="btn btn-secondary me-2" disabled={currentQuestionIndex === questions.length - 1} onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>Next ➡</button>
                        {currentQuestionIndex === questions.length - 1 && (
                          <button className="btn-submit ms-3" onClick={() => handleSubmit(false)}>Submit Test</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT: Camera */}
                {!submitted && (
                  <div className="camera-panel">
                    <video ref={videoRef} autoPlay muted className="camera-video" />
                    <div className="camera-status mt-2">
                      <p><strong>Status:</strong> {status}</p>
                      <p><strong>Warnings:</strong> {warnings}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {phase === "submitted" && (
              <div className="mt-4">
                <h2>Test Submitted</h2>
                <p>Score: {score} / {questions.length}</p>
                <p>Status: {warnings >= 3 ? "Cheating Detected ❌" : "Clean Attempt ✅"}</p>
              </div>
            )}

            {phase === "review" && review && (
              <div className="review-section mt-4">
                <h2>📝 Test Review</h2>
                <p><strong>Score:</strong> {review.score}</p>
                <p><strong>Status:</strong>{" "}
                  <span className={`review-status ${review.cheated ? "cheated" : "clean"}`}>
                    {review.cheated ? "Cheating Detected ❌" : "Clean Attempt ✅"}
                  </span>
                </p>
                <hr />
                {review.review.map((item, i) => (
                  <div className="review-box" key={i}>
                    <p><strong>Q{i + 1}:</strong> {item.question}</p>
                    <ul className="option-list">
                      {[item.option1, item.option2, item.option3, item.option4].map((opt, idx) => {
                        const isSelected = opt === item.selected;
                        const isCorrect = opt === item.correct;
                        return (
                          <li key={idx} className={isCorrect ? "correct-option" : isSelected && !isCorrect ? "wrong-option" : "neutral-option"}>
                            {opt}
                            {isCorrect && <span className="correct-label">✔ Correct</span>}
                            {isSelected && !isCorrect && <span className="wrong-label">✘ Your Answer</span>}
                            {isSelected && isCorrect && <span className="your-correct-label">✔ Your Answer</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
                <button className="btn btn-outline-secondary mt-3" onClick={() => setPhase("quiz-selection")}>⬅ Back to Quizzes</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentStartTest;
