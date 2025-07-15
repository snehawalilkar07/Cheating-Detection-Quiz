from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    role = db.Column(db.String(20), default="student")  # can be 'student' or 'admin'
    password = db.Column(db.String(200), nullable=False)
    quizzes = db.relationship('Quiz', backref='creator', lazy=True)
    responses = db.relationship('Response', backref='user', lazy=True)


class Quiz(db.Model):
    __tablename__ = 'quiz'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_public = db.Column(db.Boolean, default=True)
    uuid = db.Column(db.String(100), unique=True, nullable=False)  # for link-based sharing
    questions = db.relationship('Question', backref='quiz', lazy=True)
    responses = db.relationship('Response', backref='quiz', lazy=True)
    test_accesses = db.relationship('TestAccess', backref='quiz', lazy=True)


class Question(db.Model):
    __tablename__ = 'question'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    question_text = db.Column(db.String(500), nullable=False)
    option1 = db.Column(db.String(300), nullable=False)
    option2 = db.Column(db.String(300), nullable=False)
    option3 = db.Column(db.String(300), nullable=False)
    option4 = db.Column(db.String(300), nullable=False)
    correct_option = db.Column(db.String(10), nullable=False)
    # explanation = db.Column(db.String(1000), nullable=True)
    answers = db.relationship('Answer', backref='question', lazy=True)


class Response(db.Model):
    __tablename__ = 'response'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'))
    score = db.Column(db.Integer)
    cheated = db.Column(db.Boolean, default=False)
    locked = db.Column(db.Boolean, default=False)  # locked due to cheating
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

    status = db.Column(db.String(20), default="pending")  # "testing" if active
    start_time = db.Column(db.DateTime)
    
    answers = db.relationship('Answer', backref='response', lazy=True)
    cheating_logs = db.relationship('CheatingLog', backref='response', lazy=True)


class Answer(db.Model):
    __tablename__ = 'answer'
    id = db.Column(db.Integer, primary_key=True)
    response_id = db.Column(db.Integer, db.ForeignKey('response.id'))
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'))
    selected_option = db.Column(db.String(10))


class TestAccess(db.Model):
    __tablename__ = 'test_access'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))


class CheatingLog(db.Model):
    __tablename__ = 'cheating_log'
    id = db.Column(db.Integer, primary_key=True)
    response_id = db.Column(db.Integer, db.ForeignKey('response.id'))
    reason = db.Column(db.String(200))  # e.g., 'Face missing', 'Phone detected'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
