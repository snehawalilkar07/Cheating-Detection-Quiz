import cv2

face_cap = cv2.CascadeClassifier(
        "D:/Python Projects/Cheating_detection/env/Lib/site-packages/cv2/data/haarcascade_frontalface_default.xml"
    )

def verify_face(video_data):
    
    # video_cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # Use CAP_DSHOW for Windows

    # detected = False

    # for _ in range(100):  # check for ~100 frames (~3-5 seconds)
    #     ret, video_data = video_cap.read()
    #     if not ret:
    #         continue

    col = cv2.cvtColor(video_data, cv2.COLOR_BGR2GRAY)
    faces = face_cap.detectMultiScale(
            col,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )

        # for (x, y, w, h) in faces:
        #     cv2.rectangle(video_data, (x, y), (x + w, y + h), (0, 255, 0), 2)

        # cv2.imshow("video_live", video_data)

    #     if len(faces) == 1:
    #         detected = True
    #         break

    #     if cv2.waitKey(1) & 0xFF == ord('q'):  # press q to quit manually
    #         break

    # video_cap.release()
    # cv2.destroyAllWindows()
    return len(faces) == 1
