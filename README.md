# Cheating-Detection-Quiz

A full-stack web application to conduct online tests with real-time AI-based cheating detection using YOLOv8, MediaPipe, and face monitoring.

---

## 🚀 Features

### 👀 Cheating Detection
- Real-time webcam monitoring using **YOLOv8** and **MediaPipe**
- Detects:
  - Phone presence
  - Multiple people
  - Face orientation
  - Face missing or turned
  - Eye movements (optional)
- Face verification before test starts

### 📋 Quiz System
- React-based frontend
- Fullscreen enforced quiz panel
- Auto-submit or lock if cheating is detected
- Manual test submission option

---

## 🧱 Project Structure

MY-CHEATING-DETECTION-APP/
├── Backend-Cheating-detection/ # Flask + YOLOv8 backend
├── Frontend-Cheating-detection/ # React + Vite frontend

---

## ⚙️ Technologies Used

- **Frontend:** React, Vite, HTML, CSS, JS
- **Backend:** Flask, OpenCV, YOLOv8, MediaPipe
- **Others:** Socket.IO, Fullscreen API, WebRTC

---
