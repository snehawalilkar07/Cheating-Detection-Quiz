import cv2
from ultralytics import YOLO
import mediapipe as mp
import time
from utils.warning import speak_warning

# Constants
MAX_WARNINGS = 3
PHONE_TRIGGER_TIME = 0.3  # Reduced to 0.3s
COOLDOWN_TIME = 5
DISTRACTED_TIME = 2
FACE_MISSING_TRIGGER_TIME = 3

# State tracki
state = {
    "phone_seen": 0,
    "multi_person": 0,
    "distracted": 0,
    "face_missing": 0,
    "last_warning": 0,
    "warning_count": 0
}

# Load models
yolo = YOLO('yolov8s.pt')
class_names = yolo.model.names

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)

suspicious_objects = {'cell phone', 'mobile phone', 'phone', 'earbuds', 'headphone', 'remote'}

frame_counter = 0

def is_looking_forward(frame):
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            nose = face_landmarks.landmark[1]
            left_eye = face_landmarks.landmark[33]
            right_eye = face_landmarks.landmark[263]
            chin = face_landmarks.landmark[152]

            if not (0.30 < nose.x < 0.70):
                return False

            eye_avg_y = (left_eye.y + right_eye.y) / 2
            chin_eye_diff = chin.y - eye_avg_y

            if chin_eye_diff < 0.10:
                return False

            return True
    return None

def run_cheating_detection(frame, state):
    global frame_counter
    now = time.time()
    warning = None
    reasons = []

    # Already locked
    if state["warning_count"] >= MAX_WARNINGS:
        return {
            "status": "locked",
            "warnings": state["warning_count"],
            "reasons": ["Locked due to repeated cheating"]
        }

    # Resize early
    resized = cv2.resize(frame, (800, 600))  # instead of (640, 480)


    # Skip every 2nd frame
    frame_counter += 1
    # if frame_counter % 2 == 1:
        # return {"status": "ok", "warnings": state["warning_count"], "reasons": []}

    # YOLO detection
    results = yolo.predict(resized, conf=0.4, iou=0.45, verbose=False)
    person_count = 0
    phone_detected = False

    for result in results:
        if result.boxes is None:
            continue

        for box in result.boxes:
            if box.conf[0] < 0.4:
                continue
            cls_id = int(box.cls[0])
            name = class_names[cls_id]

            if name == "person":
                person_count += 1
            if name in suspicious_objects:
                phone_detected = True

    # PHONE Detection — Trigger immediately (no waiting)
    if phone_detected and now - state["last_warning"] > COOLDOWN_TIME:
        warning = "Phone usage detected"
        reasons.append(warning)
        state["warning_count"] += 1
        state["last_warning"] = now
        speak_warning(warning)  # Optional audio warning
        state["phone_seen"] = 0
    else:
        state["phone_seen"] = 0

    # MULTIPLE PERSONS
    if person_count > 1:
        if state["multi_person"] == 0:
            state["multi_person"] = now
        elif now - state["multi_person"] > 0.3 and now - state["last_warning"] > COOLDOWN_TIME:
            warning = "Multiple people detected"
            reasons.append(warning)
            state["warning_count"] += 1
            state["last_warning"] = now
            speak_warning(warning)
            state["multi_person"] = 0
    else:
        state["multi_person"] = 0

    # DISTRACTED
    face_status = is_looking_forward(resized)
    if face_status is False:
        if state["distracted"] == 0:
            state["distracted"] = now
        elif now - state["distracted"] > DISTRACTED_TIME and now - state["last_warning"] > COOLDOWN_TIME:
            warning = "Not looking at screen"
            reasons.append(warning)
            state["warning_count"] += 1
            state["last_warning"] = now
            speak_warning(warning)
            state["distracted"] = 0
    else:
        state["distracted"] = 0

    # FACE MISSING
    if face_status is None:
        if state["face_missing"] == 0:
            state["face_missing"] = now
        elif now - state["face_missing"] > FACE_MISSING_TRIGGER_TIME and now - state["last_warning"] > COOLDOWN_TIME:
            warning = "Face missing"
            reasons.append(warning)
            state["warning_count"] += 1
            state["last_warning"] = now
            speak_warning(warning)
            state["face_missing"] = 0
    else:
        state["face_missing"] = 0

    # Final Lock Check
    if state["warning_count"] >= MAX_WARNINGS:
        return {
            "status": "locked",
            "warnings": state["warning_count"],
            "reasons": reasons or ["Cheating threshold exceeded"]
        }

    return {
        "status": "ok" if not reasons else reasons[0],
        "warnings": state["warning_count"],
        "reasons": reasons
    }
