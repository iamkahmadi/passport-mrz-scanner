# Afghan Passports MRZ Scanner

A Flask web application to scan Machine Readable Zones (MRZ) in passports using image uploads or capturing directly from a browser camera.

## Features

*   **Upload Image:** Allows users to upload passport images from their local machine.
*   **Camera Capture:**  Enables users to capture passport images directly using their browser's camera.
*   **MRZ Scanning:**  Detects and extracts MRZ data from uploaded or captured images.
*   **User-Friendly Interface:** Provides a simple and intuitive web interface.

## Installation

1.  **Clone the repository:**

    ```
    git clone https://github.com/iamkahmadi/passport-mrz-scanner.git
    cd passport-mrz-scanner
    ```

2.  **Create a virtual environment (recommended):**

    ```
    python3 -m venv venv
    source venv/bin/activate  # On Linux/macOS
    venv\Scripts\activate.bat  # On Windows
    ```

3.  **Install dependencies:**

    ```
    pip install -r requirements.txt
    ```

## Usage

1.  **Run the Flask application:**

    ```
    python app.py
    ```

2.  **Open the application in your browser:**

    Navigate to `http://127.0.0.1:5000` (or the address shown in your terminal).

3.  **Upload or Capture:** Choose to either upload a passport image or use your camera to capture one.

4.  **Scan MRZ:** The application will process the image and display the extracted MRZ data.

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvement, please open an issue or submit a pull request.

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes.
4.  Commit your changes with descriptive messages.
5.  Push your changes to your fork.
6.  Submit a pull request.