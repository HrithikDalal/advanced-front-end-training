// Replace 'no-js' class on the HTML element if JavaScript is enabled
document.documentElement.className = 'js-active';

window.addEventListener("load", () => {
	setupFieldValidationListeners();
	setupNavigationAndFormSubmissionListeners();
	setupDragAndDropListeners();
	setDobMinMax();
	handleCustomSelectFields();
});

/**
 * Validates an individual form field.
 * @param {HTMLElement} field - The form field to validate.
 * @returns {boolean} - True if the field is valid, false otherwise.
 */
function validateField(field) {

	let customMessage = '';

	// Custom validation for social media fields
	const urlPatterns = {
		'linkedin': /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/,
		'twitter': /^(https?:\/\/)?(www\.)?twitter\.com\/.*$/,
		'facebook': /^(https?:\/\/)?(www\.)?facebook\.com\/.*$/
	};

	// Custom messages for empty fields
	switch (field.name) {
		case 'firstName':
			customMessage = field.value.trim() ? '' : 'Please enter your first name.';
			break;
		case 'lastName':
			customMessage = field.value.trim() ? '' : 'Please enter your last name.';
			break;
		case 'email':
			customMessage = field.value.trim() ? '' : 'Please enter your email address.';
			break;
		case 'dob':
			customMessage = field.value.trim() ? '' : 'Please enter your date of birth.';
			break;
		case 'briefDescription':
			customMessage = field.files.length > 0 ? '' : 'Please upload a brief description.';
			break;
		case 'linkedin':
		case 'twitter':
		case 'facebook':
			if (!field.value.trim()) {
				customMessage = `Please enter your ${field.name} profile link.`;
			} else if (!urlPatterns[field.name].test(field.value)) {
				customMessage = `Please enter a valid ${field.name} profile link.`;
			}
			break;
	}

	// Field-specific validations when not empty
	if (field.value.trim()) {
		if (field.name === 'firstName' || field.name === 'lastName') {
			const alphaRegex = /^[A-Za-z]+$/;
			customMessage = alphaRegex.test(field.value) ? '' : 'Please use alphabet characters only.';
		} else if (field.name === 'email') {
			customMessage = field.validity.typeMismatch ? 'Please enter a valid email address.' : '';
		} else if (field.name === 'briefDescription') {
			customMessage = (field.files[0] && field.files[0].size > 10 * 1024 * 1024 * 1024) ? 'Please select a file that is 10 GB or smaller.' : '';
		}
	}

	field.setCustomValidity(customMessage);

	const formGroup = field.closest('.form-group');
	const errorMessageSpan = formGroup.querySelector('.error-message');

	if (!field.checkValidity()) {
		errorMessageSpan.textContent = field.validationMessage;
		formGroup.classList.add('error');
		field.classList.add('error');
		return false;
	} else {
		errorMessageSpan.textContent = '';
		formGroup.classList.remove('error');
		field.classList.remove('error');
		return true;
	}
}

/**
 * Updates the file name display and clears any error message.
 * @param {File} file - The file that was chosen or dropped.
 */
function updateFileNameAndClearError(file) {
	const fileNameDisplay = document.getElementById('file-name-display');
	fileNameDisplay.textContent = `File: ${file.name}`;
}

/**
 * Advances the form to the next step if all fields are valid.
 */
function goToNextStep() {
	const currentStep = document.querySelector('.form-step.active');
	const nextStep = currentStep.nextElementSibling;
	const fields = [...currentStep.querySelectorAll('.form-group input, .form-group select')];
	let allValid = true;

	fields.forEach(field => {
		if (!validateField(field)) {
			allValid = false;
		}
	});

	if (allValid && nextStep) {
		currentStep.classList.remove('active');
		nextStep.classList.add('active');
	}
}

/**
 * Handles the form submission process.
 */
function submitForm() {
	const fields = [...document.querySelectorAll('.form-step .form-group input, .form-step .form-group select')];
	let allValid = true;

	fields.forEach(field => {
		if (!validateField(field)) {
			allValid = false;
		}
	});

	if (allValid) {

		// After successful submission, show the success message
		document.getElementById('multiStepForm').style.display = 'none';
		document.getElementById('successMessage').style.display = 'block';
	}
}

/**
 * Sets up event listeners for form field validation on blur and change events.
 */
function setupFieldValidationListeners() {
	 // Add blur and change event listeners to all fields for validation
	 document.querySelectorAll('#multiStepForm input, #multiStepForm select').forEach(function(input) {
		  input.addEventListener('blur', function() {
				validateField(input);
		  });
		  input.addEventListener('change', function() {
				validateField(input);
		  });
	 });

	// Add change event listener for radio buttons and checkboxes
	document.getElementById('multiStepForm').addEventListener('change', function(event) {
		if (event.target.type === 'radio' || event.target.type === 'checkbox') {
			validateField(event.target);
		}
	});
}

/**
 * Sets up event listeners for navigation buttons and form submission.
 */
function setupNavigationAndFormSubmissionListeners() {
	// Back button logic
	document.getElementById('backBtn').addEventListener('click', function() {
		const currentStep = document.querySelector('.form-step.active');
		const previousStep = currentStep.previousElementSibling;
		if (previousStep) {
			currentStep.classList.remove('active');
			previousStep.classList.add('active');
		}
	});

	// Submit form logic
	document.getElementById('multiStepForm').addEventListener('submit', function(event) {
		event.preventDefault();
		submitForm();
	});
}

/**
 * Sets up drag and drop functionality for file upload.
 */
function setupDragAndDropListeners() {
	// Elements related to the file upload
	var dropZone = document.getElementById('dropZone');
	var fileInput = document.getElementById('briefDescription');
	const fileFormGroup = fileInput.closest('.form-group');
	var errorMessage = fileFormGroup.querySelector('.error-message');

	// Drag over the drop zone
	dropZone.addEventListener('dragover', function(e) {
		e.preventDefault();
		dropZone.classList.add('active');
	});

	// Drag leaving the drop zone
	dropZone.addEventListener('dragleave', function(e) {
		e.preventDefault();
		dropZone.classList.remove('active');
	});

	// Drop file on the drop zone
	dropZone.addEventListener('drop', function(e) {
		e.preventDefault();
		dropZone.classList.remove('active');

		if (e.dataTransfer.files.length) {
		let file = e.dataTransfer.files[0];
		if (file.type === 'application/pdf' && file.size <= 1 * 1024 * 1024 * 1024) {
			var dataTransfer = new DataTransfer();
			dataTransfer.items.add(file);
			fileInput.files = dataTransfer.files;
			errorMessage.textContent = '';
			updateFileNameAndClearError(file);
		} else {
			errorMessage.textContent = 'Please provide a PDF file up to 1GB.';
		}
		}
	});

	// Validate file on input change
	fileInput.addEventListener('change', function(e) {
		let file = fileInput.files[0];
		updateFileNameAndClearError(file);
		if (file && file.type !== 'application/pdf') {
			errorMessage.textContent = 'Please provide a PDF file.';
			fileInput.value = ''; // Clear the file input
		} else if (file && file.size > 1 * 1024 * 1024 * 1024) {
			errorMessage.textContent = 'The file must be less than 1GB.';
			fileInput.value = ''; // Clear the file input
		} else {
			errorMessage.textContent = '';
		}
	});
}

function setDobMinMax() {
	var dobInput = document.getElementById('dob');
	var today = new Date();
	var hundredYearsAgo = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
	dobInput.max = today.toISOString().split('T')[0];
	dobInput.min = hundredYearsAgo.toISOString().split('T')[0];
}

// ------------------------- //
// Custom Select Field Logic //
// ------------------------- //

function handleCustomSelectFields() {
	const selectList = document.querySelectorAll(".contact-form .select");

	selectList.forEach((select) => {
		const optionList = select.querySelectorAll(".contact-form .option");
		const selectedIndex = getIndex(select);

		select.tabIndex = 0;
		select.previousElementSibling.tabIndex = -1;

		// updateValue(select, selectedIndex);

		optionList.forEach((option, index) => {
			option.addEventListener("mouseover", () => {
				highlightOption(select, option);
			});

			option.addEventListener("click", (event) => {
				updateValue(select, index);
			});
		});

		select.addEventListener("click", (event) => {
			toggleOptList(select);
		});

		select.addEventListener("focus", (event) => {
			activeSelect(select, selectList);
		});

		select.addEventListener("blur", (event) => {
			deactivateSelect(select);
		});

		select.addEventListener("keyup", (event) => {
			let index = getIndex(select);

			if (event.key === "Escape") {
				deactivateSelect(select);
			}
			if (event.key === "ArrowDown" && index < optionList.length - 1) {
				index++;
			}
			if (event.key === "ArrowUp" && index > 0) {
				index--;
			}

			updateValue(select, index);
		});
	});
}

function deactivateSelect(select) {
	if (!select.classList.contains("active")) return;

	const optList = select.querySelector(".optList");

	optList.classList.add("hidden");
	select.classList.remove("active");
}

function activeSelect(select, selectList) {
	if (select.classList.contains("active")) return;

	selectList.forEach(deactivateSelect);
	select.classList.add("active");
}

function toggleOptList(select, show) {
	const optList = select.querySelector(".optList");
	optList.classList.toggle("hidden");
}

function highlightOption(select, option) {
	const optionList = select.querySelectorAll(".option");

	optionList.forEach((other) => {
		other.classList.remove("highlight");
	});

	option.classList.add("highlight");
}

function updateValue(select, index) {
	const nativeSelectField = select.previousElementSibling;
	const value = select.querySelector(".value");
	const optionList = select.querySelectorAll(".option");

	optionList.forEach((other) => {
		other.setAttribute("aria-selected", "false");
	});

	optionList[index].setAttribute("aria-selected", "true");

	nativeSelectField.selectedIndex = index;
	value.innerHTML = optionList[index].innerHTML;
	value.classList.add('value--selected');
	highlightOption(select, optionList[index]);
}

function getIndex(select) {
	const nativeSelectField = select.previousElementSibling;

	return nativeSelectField.selectedIndex;
}
