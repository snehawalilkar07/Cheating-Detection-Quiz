import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './Dashboard.css';

const AdminCreateQuiz = () => {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], answer: '' }
  ]);
  const [createdQuizId, setCreatedQuizId] = useState(null);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'question') newQuestions[index].question = value;
    else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('-')[1]);
      newQuestions[index].options[optionIndex] = value;
    } else if (field === 'answer') newQuestions[index].answer = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const adminId = storedUser?.id;

    if (!adminId) {
      alert("Unauthorized: Admin not logged in.");
      return;
    }

    try {
      const quizPayload = {
        title: quizTitle,
        creator_id: adminId,
        is_public: false
      };

      const quizRes = await axios.post('http://localhost:5000/api/quiz', quizPayload);
      const quizId = quizRes.data.quiz_id;
      setCreatedQuizId(quizId);

      const questionPayload = {
        questions: questions.map((q) => ({
          quiz_id: quizId,
          question_text: q.question,
          option1: q.options[0],
          option2: q.options[1],
          option3: q.options[2],
          option4: q.options[3],
          correct_option: q.answer
        }))
      };

      await axios.post('http://localhost:5000/api/questions', questionPayload);

      alert('Quiz created successfully!');
    } catch (err) {
      console.error('Error creating quiz:', err);
      alert('Failed to create quiz.');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <div className="main-content">
        <Topbar />
        <div className="quiz-form-container">
          <br/><br/>
          <h2 className="dashboard-title">Create a New Quiz</h2>

          <form onSubmit={handleSubmit} className="quiz-form">
            <div className="form-group">
              <label>Quiz Title</label>
              <input
                type="text"
                placeholder="Enter Quiz Title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                required
              />
            </div>

            <h3 className="section-title">Questions</h3>
            {questions.map((q, index) => (
              <div key={index} className="question-card">
                <label>Question {index + 1}</label>
                <input
                  type="text"
                  placeholder="Enter question"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                  required
                />
                <div className="options-row">
                  {q.options.map((opt, i) => (
                    <div key={i} className="option-input">
                      <label>Option {i + 1}</label>
                      <input
                        type="text"
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) =>
                          handleQuestionChange(index, `option-${i}`, e.target.value)
                        }
                        required
                      />
                    </div>
                  ))}
                </div>
                <label>Correct Answer</label>
                <input
                  type="text"
                  placeholder="Enter correct answer"
                  value={q.answer}
                  onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                  required
                />
                <hr />
              </div>
            ))}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              <button type="button" onClick={addQuestion} className="btn-add">
                + Add Another Question
              </button>
              <button type="submit" className="btn-submit">
                Submit Quiz
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateQuiz;
