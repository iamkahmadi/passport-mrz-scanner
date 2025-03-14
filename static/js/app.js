$(document).ready(function() {
    let cropper;
    let imageFile;

    // Handle image upload and preview
    $("#imageUpload").change(function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                $("#imagePreview").attr("src", imageUrl).show();
                $("#cropperContainer").show();
                $("#submitBtn").show();
                if (cropper) cropper.destroy();
                cropper = new Cropper(document.getElementById("imagePreview"), {
                    viewMode: 1,
                    autoCropArea: 0.5,
                    movable: true,
                    zoomable: true,
                    rotatable: true,
                    scalable: true,
                    aspectRatio: NaN,
                    cropBoxResizable: true,
                    dragMode: 'move',
                    background: true
                });
            };
            reader.readAsDataURL(file);
            imageFile = file;
        }
    });

    // Handle the submit button click
    $("#submitBtn").click(function() {
        const canvas = cropper.getCroppedCanvas();
        canvas.toBlob(function(blob) {
            const formData = new FormData();
            formData.append("file", blob, "cropped_image.png");

            // Show loading spinner while waiting for the server response
            $("#ocrResult").text("");
            $("#loadingSpinner").show();

            $.ajax({
                url: '/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
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
                error: function() {
                    $("#loadingSpinner").hide();
                    alert('Error processing image');
                }
            });
        });
    });
});
