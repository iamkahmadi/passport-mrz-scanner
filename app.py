from flask import Flask, render_template, request, jsonify
import os
import easyocr
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configure upload folder and allowed file extensions
UPLOAD_FOLDER = 'static/images/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create an EasyOCR reader instance
reader = easyocr.Reader(['en'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/capture')
def capture():
    return render_template('capture.html')

@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)


        #     data =  {
        #     'document_type': "doc_type",
        #     'country_code': "country_code",
        #     'surname': "surname",
        #     'given_names': "ahmad ",
        #     'passport_number': "passport_number",
        #     'nationality': "AFG",
        #     'date_of_birth': "dob",
        #     'gender': "gender",
        #     'expiration_date': "expiration_date",
        #     'checksum': "checksum"
        # }
        #     return jsonify({'status': 'success', 'data': data}), 200
            
            
            # Perform OCR processing
            result = reader.readtext(filepath)

            if not result:
                return jsonify({'error': 'No text found in the image'}), 400

            processed_data = process_passport(result)

            return jsonify({'status': 'success', 'data': processed_data}), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    except Exception as e:
        # Generic exception handling
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


def process_passport(result):
    try:
        (bbox, text, prob) = result[0]
        line_1 = text.replace(" ", "")
        (bbox, text, prob) = result[1]
        line_2 = text.replace(" ", "")

        # Document Type and Country Code
        doc_type = line_1[0:2].upper()  # Make it uppercase
        country_code = line_1[2:5].upper()  # Make it uppercase

        # Extracting the surname and given names
        surname = line_1[5:].split("<<")[0].upper()  # Make surname uppercase
        if "<" in surname:
            surname = surname.split("<")
            surname = " ".join(surname)

        given_names_raw = line_1[5:].split("<<")[1] if "<<<<" in line_1 else ""
        given_names = [name.upper() for name in given_names_raw.split("<") if name]  # Make given names uppercase

        # Extract Passport Number
        passport_number = line_2[0:9].upper()  # Make passport number uppercase

        # Extract Nationality (always 3 characters after passport number)
        nationality = line_2[10:13].upper()  # Make nationality uppercase

        # Date of Birth (YYMMDD format, 6 characters)
        dob = line_2[13:19]
        try:
            # If the year is greater than the current year, it must be in the 1900s
            dob_year = int(dob[:2])
            current_year = datetime.now().year
            full_year = dob_year + 2000 if dob_year <= (current_year % 100) else dob_year + 1900

            dob = datetime.strptime(f"{full_year}{dob[2:]}", "%Y%m%d").strftime("%Y-%m-%d")
        except ValueError:
            dob = "INVALID DATE"  # Return in uppercase for error message

        # Gender (M or F)
        gender = line_2[20].upper()  # Make gender uppercase

        # Expiration Date (YYMMDD format, 6 characters)
        expiration_date = line_2[21:27]
        try:
            expiration_date = datetime.strptime(expiration_date, "%y%m%d").strftime("%Y-%m-%d")
        except ValueError:
            expiration_date = "INVALID EXPIRY"  # Return in uppercase for error message

        # Checksum (single digit at the end of the line)
        checksum = line_2[27].upper()  # Make checksum uppercase

        return {
            'document_type': doc_type,
            'country_code': country_code,
            'surname': surname,
            'given_names': " ".join(given_names),
            'passport_number': passport_number,
            # 'nationality': nationality,
            'nationality': "AFG",
            'date_of_birth': dob,
            'gender': gender,
            'expiration_date': expiration_date,
            'checksum': checksum
        }
    except IndexError:
        # Handle case where the result doesn't have the expected structure
        raise ValueError("OCR result is not in the expected format.")
    except Exception as e:
        # Handle other unexpected errors in processing
        raise ValueError(f"Error processing passport: {str(e)}")


if __name__ == '__main__':
    app.run(debug=True)
