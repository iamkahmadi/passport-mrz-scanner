let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let startBtn = document.getElementById('startBtn');
let stopBtn = document.getElementById('stopBtn');
let captureBtn = document.getElementById('captureBtn');
let submitBtn = document.getElementById('submitBtn');
let startOverBtn = document.getElementById('startOverBtn');
let imagePreview = document.getElementById('imagePreview');
let capturedImage = document.getElementById('capturedImage');
let resultContainer = document.getElementById('result');

var stream;
var imageCaptured = false;
var cropper;  // Cropper.js instance

// Start the camera
startBtn.addEventListener('click', function () {
    startCamera();
});

// Stop the camera
stopBtn.addEventListener('click', function () {
    stopCamera();
});

// Capture the image
captureBtn.addEventListener('click', function () {
    captureImage();
});

// Submit the image for processing
submitBtn.addEventListener('click', function () {
    submitImage();
});

// Start over (reset the canvas and buttons)
startOverBtn.addEventListener('click', function () {
    // Reset the video stream and display the video again
    if (stream) {
        // Stop current video stream if it exists
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
    
    // Hide the image preview and show the video stream
    video.style.display = 'block';
    canvas.style.display = 'none';
    imagePreview.style.display = 'none';

    // Reset the buttons
    captureBtn.disabled = false;
    submitBtn.disabled = true;
    startOverBtn.disabled = true;

    // Restart the camera
    startCamera();
});



// Start the camera
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (mediaStream) {
            video.srcObject = mediaStream;  // Set the new stream as the video source
            video.play();  // Start video playback
            stream = mediaStream;  // Store the stream for later
            startBtn.disabled = true;
            stopBtn.disabled = false;
            captureBtn.disabled = false;
        })
        .catch(function (err) {
            alert('Error accessing the camera: ' + err);
        });
}



// Stop the camera
function stopCamera() {
    if (stream) {
        // Stop each track (video and audio) in the stream
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Stop each track individually

        // Clear the video source
        video.srcObject = null;
        stream = null;

        // Disable relevant buttons when camera is stopped
        startBtn.disabled = false;
        stopBtn.disabled = true;
        captureBtn.disabled = true;
        submitBtn.disabled = true;
        startOverBtn.disabled = true;

    } else {
        console.log("No stream found to stop.");
    }
}


// Capture the image
function captureImage() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    imageCaptured = true;

    // Show the captured image for cropping
    let imageUrl = canvas.toDataURL('image/jpeg');
    capturedImage.src = imageUrl;

    // Switch from video to image preview for cropping
    video.style.display = 'none';
    canvas.style.display = 'none';
    imagePreview.style.display = 'block';

    captureBtn.disabled = true;
    submitBtn.disabled = false;
    startOverBtn.disabled = false;
    

    // Initialize Cropper.js
    if (cropper) {
        cropper.destroy();  // Destroy previous instance
    }
    cropper = new Cropper(capturedImage, {
        viewMode: 1,
        autoCropArea: 0.5,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: true,
        aspectRatio: NaN,
        cropBoxResizable: true,
        dragMode: 'move',
        background: true,
    });
}

// Submit the image to the server
function submitImage() {
    if (!imageCaptured) return;

    // Show loading spinner while waiting for the server response
    $("#ocrResult").empty();  // Clear previous result
    $("#loadingSpinner").show();

    // Get the cropped image
    let canvas = cropper.getCroppedCanvas();
    canvas.toBlob(function (blob) {
        let formData = new FormData();
        formData.append('file', blob, 'image.jpg');

        $.ajax({
            url: '/upload',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                // Hide loading spinner after receiving response
                $("#loadingSpinner").hide();

                if (response.status === 'success') {
                    const data = response.data;
                    // Generate HTML for table display
                    let tableHTML = `
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Data Type</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Document Type</td>
                                    <td>${data.document_type}</td>
                                </tr>
                                <tr>
                                    <td>Country Code</td>
                                    <td>${data.country_code}</td>
                                </tr>
                                <tr>
                                    <td>Surname</td>
                                    <td>${data.surname}</td>
                                </tr>
                                <tr>
                                    <td>Given Names</td>
                                    <td>${data.given_names}</td>
                                </tr>
                                <tr>
                                    <td>Passport Number</td>
                                    <td>${data.passport_number}</td>
                                </tr>
                                <tr>
                                    <td>Nationality</td>
                                    <td>${data.nationality}</td>
                                </tr>
                                <tr>
                                    <td>Date of Birth</td>
                                    <td>${data.date_of_birth}</td>
                                </tr>
                                <tr>
                                    <td>Gender</td>
                                    <td>${data.gender}</td>
                                </tr>
                                <tr>
                                    <td>Expiration Date</td>
                                    <td>${data.expiration_date}</td>
                                </tr>
                                <tr>
                                    <td>Checksum</td>
                                    <td>${data.checksum}</td>
                                </tr>
                            </tbody>
                        </table>
                    `;

                    // Append the generated table HTML to the result container
                    $("#ocrResult").html(tableHTML);
                    $("#resultContainer").show();
                } else {
                    alert('Error: ' + response.error);
                }
            },
            error: function (response) {
                $("#loadingSpinner").hide();
                alert('Error processing image');
            }
        });
    });
}
