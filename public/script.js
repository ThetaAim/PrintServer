document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.getElementById('sendToPrint');
    const fileInput = document.getElementById('fileUpload');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const colorOption = document.getElementById('colorOption');
    const fieryOption = document.getElementById('fieryOption');
    const colorCategorySection = document.getElementById('colorCategorySection');
    const fieryCategorySection = document.getElementById('fieryCategorySection');
    const colorCategory = document.getElementById('colorCategory');
    const fieryCategory = document.getElementById('fieryCategory');
    const fileNameDiv = document.getElementById('fileName');
    const messageDiv = document.getElementById('message');

    // Function to toggle visibility based on selected print option (color or fiery)
    function toggleCategorySections() {
        if (colorOption.checked) {
            colorCategorySection.style.display = 'block';
            fieryCategorySection.style.display = 'none';
            fieryCategory.value = '';  // Clear Fiery selection when Color is selected
        } else if (fieryOption.checked) {
            fieryCategorySection.style.display = 'block';
            colorCategorySection.style.display = 'none';
            colorCategory.value = '';  // Clear Color selection when Fiery is selected
        }
        checkFormValidity();
    }

    // Function to check form validity
    function checkFormValidity() {
        const fileSelected = fileInput.files.length > 0;
        const usernameFilled = usernameInput.value.trim() !== '';
        const passwordFilled = passwordInput.value.trim() !== '';
        const categorySelected = (colorOption.checked && colorCategory.value !== '') || (fieryOption.checked && fieryCategory.value !== '');

        if (fileSelected && usernameFilled && passwordFilled && categorySelected) {
            uploadButton.disabled = false;
            uploadButton.textContent = 'Send to Print';
        } else {
            uploadButton.disabled = true;
            uploadButton.textContent = 'Upload';
        }
    }

    // Event listeners for form fields
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            fileNameDiv.textContent = `Selected file: ${fileInput.files[0].name}`;
        } else {
            fileNameDiv.textContent = 'No file selected';
        }
        checkFormValidity();
    });

    usernameInput.addEventListener('input', checkFormValidity);
    passwordInput.addEventListener('input', checkFormValidity);
    colorOption.addEventListener('change', toggleCategorySections); // When the Color option is selected
    fieryOption.addEventListener('change', toggleCategorySections); // When the Fiery option is selected
    colorCategory.addEventListener('change', checkFormValidity); // Check validity when color category changes
    fieryCategory.addEventListener('change', checkFormValidity); // Check validity when fiery category changes

    // Button click handler for submitting the form
    uploadButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('fileUpload', fileInput.files[0]);
        formData.append('username', usernameInput.value);
        formData.append('password', passwordInput.value);

        // Send selected category and option as form data
        const selectedCategory = colorOption.checked ? colorCategory.value : fieryCategory.value;
        formData.append('printCategory', selectedCategory);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                messageDiv.textContent = result.message;
                uploadButton.disabled = false;
                uploadButton.textContent = 'Send to Print';
                passwordInput.textContent = '';
            } else {
                messageDiv.textContent = 'Upload failed.';
                uploadButton.disabled = true;
                passwordInput.textContent = '';
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            messageDiv.textContent = 'Error uploading file.';
            uploadButton.disabled = true;
            passwordInput.textContent = '';
        }
    });

    // Initialize on page load
    toggleCategorySections();  // Set initial visibility based on default radio button selection
});
