import pyttsx3

def speak_warning(text):
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()
