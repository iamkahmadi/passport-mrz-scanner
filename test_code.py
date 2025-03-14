import easyocr
from datetime import datetime

reader = easyocr.Reader(['en'])  # specify the language  
result = reader.readtext('static/images/uploads/cropped_image.png')

(bbox, text, prob) = result[0]
line_1 = text.replace(" ", "")
(bbox, text, prob) = result[1]
line_2 = text.replace(" ", "")

print(line_1)
print(line_2)

# Document Type and Country Code
doc_type = line_1[0:2]
country_code = line_1[2:5]

# Extracting the surname and given names
# Surname is located between country code and the first occurrence of <<
surname = line_1[5:].split("<<")[0]
if "<" in surname:
    surname = surname.split("<")
    surname = " ".join(surname)

# Given Names: We capture everything between the surname and the << following it
given_names_raw = line_1[5:].split("<<")[1] if "<<<<" in line_1 else ""
# Split the names by the `<` separator and strip empty strings
given_names = [name for name in given_names_raw.split("<") if name]

# Extract Passport Number
passport_number = line_2[0:9]

# Extract Nationality (always 3 characters after passport number)
nationality = line_2[10:13]

# Date of Birth (YYMMDD format, 6 characters)
dob = line_2[13:19]
# Try converting YYMMDD to YYYY-MM-DD
try:
    dob = datetime.strptime(dob, "%y%m%d").strftime("%Y-%m-%d")
except ValueError as e:
    print(f"Error processing Date of Birth: {e}")
    print(f"Invalid Date of Birth extracted: {dob}")

# Gender (M or F)
gender = line_2[20]

# Expiration Date (YYMMDD format, 6 characters)
expiration_date = line_2[21:27]
try:
    # Try to convert YYMMDD to YYYY-MM-DD
    expiration_date = datetime.strptime(expiration_date, "%y%m%d").strftime("%Y-%m-%d")
except ValueError as e:
    print(f"Invalid expiration date extracted: {expiration_date}")

# Checksum (single digit at the end of the line)
checksum = line_2[27]

# Print the extracted fields
print(f"Document Type: {doc_type}")
print(f"Country Code: {country_code}")
print(f"Surname: {surname}")
print(f"Given Names: {" ".join(given_names)}")
print(f"Passport Number: {passport_number}")
# print(f"Nationality: {nationality}")
print(f"Nationality: AFG")
print(f"Date of Birth: {dob}")
print(f"Gender: {gender}")
print(f"Expiration Date: {expiration_date}")
print(f"Checksum: {checksum}")
