from flask import Flask, render_template, Response, request, jsonify
import cv2
from pyzbar.pyzbar import decode
import base64
import numpy as np


app = Flask(__name__)

# Initialize Firebase with your Firebase Admin SDK credentials
def decode_qr_code(image_data):
    # Convert base64 image data to OpenCV format
    image_data = base64.b64decode(image_data.split(',')[1])
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)  # Convert to grayscale

    # Improve image quality using histogram equalization
    img = cv2.equalizeHist(img)

    # Decode QR codes in the image
    decoded_objects = decode(img)
    qr_code_data = [obj.data.decode('utf-8') for obj in decoded_objects]
    return qr_code_data

@app.route('/')
def index():
    return render_template('index.html')

def generate_frames():
    camera = cv2.VideoCapture(0)  # Use the default camera (you may need to change this value)

    while True:
        success, frame = camera.read()
        if not success:
            break

        # Convert the frame to JPEG format
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    camera.release()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/capture', methods=['POST'])
def capture():
    data = request.get_json()
    image_data = data.get('imageData', '')

    qr_code_data = decode_qr_code(image_data)

    

    return jsonify({'qrCodeData': qr_code_data[0] if qr_code_data else 'No QR code found'})

if __name__ == "__main__":
    app.run(debug=True)
