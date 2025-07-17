from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import cv2
from flask_sqlalchemy import SQLAlchemy
import numpy as np
from face_detection import verify_face
from monitor_movements import run_cheating_detection
from model import db, User, Quiz, Question, Response, CheatingLog, Answer, TestAccess
import uuid
from collections import defaultdict
from datetime import datetime
from sqlalchemy.orm import joinedload
import os


app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydb.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

session_states = defaultdict(lambda: {
    "phone_seen": 0,
    "multi_person": 0,
    "distracted": 0,
    "face_missing": 0,
    "last_warning": 0,
    "warning_count": 0
})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    build_dir = os.path.join(os.path.dirname(__file__), 'build')
    if path != "" and os.path.exists(os.path.join(build_dir, path)):
        return send_from_directory(build_dir, path)
    else:
        return send_from_directory(build_dir, 'index.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400

    new_user = User(
        name=data['name'],
        email=data['email'],
        password=data['password'],
        role=data.get("role", "student")
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Registered successfully!"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email'], password=data['password']).first()
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "role": user.role
        }
    })

@app.route("/verify-face", methods=["POST"])
def verify_face_route():
    if 'frame' not in request.files:
        return jsonify({"error": "Missing frame"}), 400

    file = request.files['frame']
    npimg = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    is_verified = verify_face(frame)
    return jsonify({"verified": is_verified})

@app.route("/process-frame", methods=["POST"])
def process_frame():
    if 'frame' not in request.files or 'response_id' not in request.form:
        return jsonify({"error": "Missing frame or response_id"}), 400

    file = request.files['frame']
    response_id = request.form.get('response_id')

    npimg = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    resp = Response.query.get(response_id)
    if not resp:
        return jsonify({"error": "Invalid response ID"}), 400

    if resp.locked:
        return jsonify({
            "status": "locked",
            "message": "Test already locked",
            "warnings": 3
        })

    state = session_states[response_id]
    result = run_cheating_detection(frame, state)

    if result["warnings"] >= 3:
        resp.cheated = True

    if result["status"] == "locked":
        resp.locked = True
        resp.cheated = True
        for reason in result.get('reasons', []):
            db.session.add(CheatingLog(response_id=response_id, reason=reason))

    db.session.commit()

    return jsonify({
        "status": result["status"],
        "warnings": result["warnings"],
        "locked": resp.locked,
        "cheated": resp.cheated,
        "reasons": result.get("reasons", [])
    })

@app.route('/api/quiz', methods=['GET', 'POST'])
def handle_quiz():
    if request.method == 'POST':
        data = request.json
        new_quiz = Quiz(
            title=data['title'],
            creator_id=data['creator_id'],
            is_public=data.get('is_public', True),
            uuid=str(uuid.uuid4())
        )
        db.session.add(new_quiz)
        db.session.commit()
        return jsonify({"quiz_id": new_quiz.id, "uuid": new_quiz.uuid}), 201
    else:
        quizzes = Quiz.query.all()
        user_id = request.args.get("user_id", type=int)
        quiz_list = []

        for q in quizzes:
            response = Response.query.filter_by(user_id=user_id, quiz_id=q.id).first() if user_id else None
            quiz_list.append({
                "id": q.id,
                "title": q.title,
                "uuid": q.uuid,
                "attempted": bool(response),
                "locked": bool(response.locked) if response else False,
                "cheated": bool(response.cheated) if response else False,
                "score": response.score if response else None,
                "review_available": bool(response) and bool(response.locked),
                "response_id": response.id if response else None
            })
        return jsonify(quiz_list)

@app.route('/api/questions', methods=['POST'])
def add_questions():
    questions = request.json.get('questions', [])
    for q in questions:
        question = Question(
            quiz_id=q["quiz_id"],
            question_text=q["question_text"],
            option1=q['option1'],
            option2=q['option2'],
            option3=q['option3'],
            option4=q['option4'],
            correct_option=q['correct_option'],
        )
        db.session.add(question)
    db.session.commit()
    return jsonify({"message": "Question Added Successfully"}), 201

@app.route('/api/quiz/<uuid>/questions', methods=['GET'])
def get_quiz_questions(uuid):
    quiz = Quiz.query.filter_by(uuid=uuid).first()
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    questions = Question.query.filter_by(quiz_id=quiz.id).all()
    return jsonify([{
        "id": q.id,
        "question_text": q.question_text,
        "option1": q.option1,
        "option2": q.option2,
        "option3": q.option3,
        "option4": q.option4
    } for q in questions])

@app.route('/api/submit', methods=['POST'])
def submit_test():
    data = request.json
    response = Response.query.get(data.get("response_id"))
    if not response:
        return jsonify({"error": "Invalid response ID"}), 400

    response.locked = True
    response.cheated = data.get("cheated", False) or response.cheated
    score = 0
    for a in data['answers']:
        ans = Answer(
            response_id=response.id,
            question_id=a['question_id'],
            selected_option=a['selected_option']
        )
        db.session.add(ans)
        q = Question.query.get(a['question_id'])
        if q and q.correct_option == a['selected_option']:
            score += 1

    response.score = score
    db.session.commit()

    return jsonify({
        "message": "Submitted",
        "score": score,
        "cheated": response.cheated,
        "locked": response.locked
    })

@app.route('/api/start-response', methods=['POST'])
def start_response():
    data = request.json
    user_id = data['user_id']
    quiz_id = data['quiz_id']

    existing = Response.query.filter_by(user_id=user_id, quiz_id=quiz_id).first()
    if existing:
        return jsonify({"response_id": existing.id, "locked": existing.locked}), 200

    response = Response(
        user_id=user_id,
        quiz_id=quiz_id,
        status="testing",
        start_time=datetime.utcnow()
    )
    db.session.add(response)
    db.session.commit()
    return jsonify({"response_id": response.id})

@app.route('/api/review/<int:response_id>', methods=['GET'])
def review_response(response_id):
    response = Response.query.get(response_id)
    if not response:
        return jsonify({"error": "Invalid response ID"}), 404
    answers = Answer.query.filter_by(response_id=response_id).all()
    review = []
    for a in answers:
        q = Question.query.get(a.question_id)
        review.append({
            "question": q.question_text,
            "option1": q.option1,
            "option2": q.option2,
            "option3": q.option3,
            "option4": q.option4,
            "selected": a.selected_option,
            "correct": q.correct_option,
            "is_correct": a.selected_option == q.correct_option
        })
    return jsonify({"score": response.score, "cheated": response.cheated, "review": review})



# @app.route('/admin/student-status-summary', methods=['GET'])
# def student_status_summary():
#     students = User.query.filter_by(role="student").all()

#     # Load responses with related quiz and user objects
#     responses = Response.query.options(
#         joinedload(Response.quiz),
#         joinedload(Response.user)
#     ).all()

#     submitted = []
#     pending = []

#     for student in students:
#         response = next((r for r in responses if r.user_id == student.id), None)

#         if response:
#             submitted.append({
#                 "name": student.name,
#                 "email": student.email,
#                 "quiz_title": response.quiz.title if response.quiz else "Unknown",
#                 "score": response.score,
#                 "status": "submitted",
#                 "cheated": "Violated" if response.cheated else "Clean",
#                 "submitted_at": response.submitted_at.strftime("%Y-%m-%d %H:%M:%S") if response.submitted_at else "N/A"
#             })
#         else:
#             pending.append({
#                 "name": student.name,
#                 "email": student.email,
#                 "quiz_title": "N/A",
#                 "score": "N/A",
#                 "status": "pending",
#                 "cheated": "N/A",
#                 "submitted_at": "N/A"
#             })

#     return jsonify({
#         "submitted_count": len(submitted),
#         "pending_count": len(pending),
#         "submitted_students": submitted,
#         "pending_students": pending
#     }), 200

@app.route('/admin/quizzes/<int:admin_id>', methods=['GET'])
def get_admin_quizzes(admin_id):
    quizzes = Quiz.query.filter_by(creator_id=admin_id).all()
    quiz_list = [{"id": q.id, "title": q.title, "uuid": q.uuid} for q in quizzes]

    return jsonify(quiz_list), 200


@app.route('/admin/quiz-student-status/<int:quiz_id>', methods=['GET'])
def quiz_student_status(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    all_students = User.query.filter_by(role='student').all()

    responses = Response.query.filter_by(quiz_id=quiz_id).options(
        joinedload(Response.user)
    ).all()

    submitted = []
    pending = []

    submitted_ids = set()

    for r in responses:
        submitted.append({
            "name": r.user.name,
            "email": r.user.email,
            "quiz_title": quiz.title,
            "score": r.score,
            "status": "submitted",
            "cheated": "Violated" if r.cheated else "Clean",
            "submitted_at": r.submitted_at.strftime("%Y-%m-%d %H:%M:%S") if r.submitted_at else "N/A"
        })
        submitted_ids.add(r.user_id)

    for student in all_students:
        if student.id not in submitted_ids:
            pending.append({
                "name": student.name,
                "email": student.email,
                "quiz_title": quiz.title,
                "score": "N/A",
                "status": "pending",
                "cheated": "N/A",
                "submitted_at": "N/A"
            })

    return jsonify({
        "quiz_title": quiz.title,
        "submitted_count": len(submitted),
        "pending_count": len(pending),
        "submitted_students": submitted,
        "pending_students": pending
    }), 200


@app.route('/admin/quiz-performance-summary/<int:admin_id>', methods=['GET'])
def quiz_performance_summary(admin_id):
    quizzes = Quiz.query.filter_by(creator_id=admin_id).all()
    overall_attempts = 0
    overall_scores = 0
    total_clean = 0
    total_cheated = 0

    quiz_stats = []

    for quiz in quizzes:
        responses = Response.query.filter_by(quiz_id=quiz.id).all()
        attempts = len(responses)
        cheated = sum(1 for r in responses if r.cheated)
        clean = attempts - cheated
        score_sum = sum(r.score or 0 for r in responses)
        avg_score = score_sum / attempts if attempts > 0 else 0

        quiz_stats.append({
            "title": quiz.title,
            "total_attempts": attempts,
            "cheated": cheated,
            "clean": clean,
            "avg_score": round(avg_score, 2)
        })

        overall_attempts += attempts
        overall_scores += score_sum
        total_clean += clean
        total_cheated += cheated

    overall = {
        "total_quizzes": len(quizzes),
        "total_attempts": overall_attempts,
        "avg_score": round(overall_scores / overall_attempts, 2) if overall_attempts else 0,
        "clean_percent": round((total_clean / overall_attempts) * 100, 2) if overall_attempts else 0,
        "cheated_percent": round((total_cheated / overall_attempts) * 100, 2) if overall_attempts else 0,
    }

    return jsonify({
        "quiz_stats": quiz_stats,
        "overall": overall
    })

@app.route('/student/performance-summary/<int:user_id>', methods=['GET'])
def student_performance_summary(user_id):
    responses = Response.query.filter_by(user_id=user_id).all()

    summary = {
        "total_quizzes": len(responses),
        "clean": 0,
        "cheated": 0,
        "average_score": 0,
        "tests": []
    }

    total_score = 0
    for r in responses:
        summary["tests"].append({
            "quiz_title": r.quiz.title if r.quiz else "N/A",
            "score": r.score,
            "cheated": r.cheated,
            "submitted_at": r.submitted_at,
        })

        if r.cheated:
            summary["cheated"] += 1
        else:
            summary["clean"] += 1

        total_score += r.score or 0

    summary["average_score"] = round(total_score / len(responses), 2) if responses else 0

    return jsonify(summary), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)

