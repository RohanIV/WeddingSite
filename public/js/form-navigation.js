document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('rsvpForm');
    const stages = document.querySelectorAll('.form-stage');
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const addAttendeeBtn = document.getElementById('add-attendee-btn');
    let currentStage = 1;
    let attendeeCount = 1;
    const maxAttendees = 3;

    // Show initial stage
    showStage(1);

    // Next button handlers
    nextButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const stage = this.closest('.form-stage');
            const stageData = stage.dataset.stage;
            const stageNumber = parseInt(stageData);
            
            // Only validate if it's a numeric stage
            if (!isNaN(stageNumber) && validateStage(stageNumber)) {
                // Special handling for stage 1 - check if "No" is selected
                if (stageNumber === 1) {
                    const attendingRadio = document.querySelector('input[name="attending"]:checked');
                    if (attendingRadio && attendingRadio.value === 'No') {
                        showStage('not-attending');
                    } else {
                        showStage(2);
                    }
                } else {
                    // Get the next numeric stage
                    const numericStages = Array.from(stages)
                        .map(s => parseInt(s.dataset.stage))
                        .filter(n => !isNaN(n))
                        .sort((a, b) => a - b);
                    const currentIndex = numericStages.indexOf(stageNumber);
                    if (currentIndex < numericStages.length - 1) {
                        showStage(numericStages[currentIndex + 1]);
                    }
                }
            }
        });
    });

    // Previous button handlers
    prevButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const stage = this.closest('.form-stage');
            const stageData = stage.dataset.stage;
            
            // Don't allow going back from not-attending screen
            if (stageData === 'not-attending') {
                return;
            }
            
            const stageNumber = parseInt(stageData);
            if (!isNaN(stageNumber) && stageNumber > 1) {
                showStage(stageNumber - 1);
            }
        });
    });

    // Show/hide attendee form based on yes/no selection
    const hasAttendeesRadios = document.querySelectorAll('input[name="has-additional-attendees"]');
    const attendeesForm = document.getElementById('attendees-form');
    
    hasAttendeesRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Yes') {
                attendeesForm.style.display = 'block';
            } else {
                attendeesForm.style.display = 'none';
                // Reset attendee count and clear additional attendees
                attendeeCount = 1;
                const container = document.getElementById('additional-attendees');
                container.innerHTML = `
                    <div class="attendee-entry" data-attendee-id="1">
                        <input type="text" name="attendee-first-name-1" placeholder="Attendee 1 First Name" class="attendee-first-name">
                        <input type="text" name="attendee-last-name-1" placeholder="Attendee 1 Last Name" class="attendee-last-name">
                        <button type="button" class="remove-attendee-btn">Remove</button>
                    </div>
                `;
                if (addAttendeeBtn) {
                    addAttendeeBtn.style.display = 'block';
                }
            }
        });
    });

    // Use event delegation for remove buttons
    const additionalAttendeesContainer = document.getElementById('additional-attendees');
    if (additionalAttendeesContainer) {
        additionalAttendeesContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-attendee-btn')) {
                const entry = e.target.closest('.attendee-entry');
                const container = document.getElementById('additional-attendees');
                
                // Only remove if there's more than one attendee
                if (container && container.children.length > 1) {
                    entry.remove();
                    attendeeCount--;
                    renumberAttendees();
                    
                    // Show add button if we're below max
                    if (addAttendeeBtn && attendeeCount < maxAttendees) {
                        addAttendeeBtn.style.display = 'block';
                    }
                }
            }
        });
    }

    // Function to renumber attendees after removal
    function renumberAttendees() {
        const container = document.getElementById('additional-attendees');
        const entries = container.querySelectorAll('.attendee-entry');
        
        entries.forEach((entry, index) => {
            const newNumber = index + 1;
            entry.setAttribute('data-attendee-id', newNumber);
            
            const firstNameInput = entry.querySelector('.attendee-first-name');
            const lastNameInput = entry.querySelector('.attendee-last-name');
            
            if (firstNameInput) {
                firstNameInput.name = `attendee-first-name-${newNumber}`;
                firstNameInput.placeholder = `Attendee ${newNumber} First Name`;
            }
            
            if (lastNameInput) {
                lastNameInput.name = `attendee-last-name-${newNumber}`;
                lastNameInput.placeholder = `Attendee ${newNumber} Last Name`;
            }
        });
    }

    // Add attendee button handler
    if (addAttendeeBtn) {
        addAttendeeBtn.addEventListener('click', function() {
            if (attendeeCount < maxAttendees) {
                attendeeCount++;
                addAttendeeField(attendeeCount);
                
                if (attendeeCount >= maxAttendees) {
                    this.style.display = 'none';
                }
            }
        });
    }

    function showStage(stageNumber) {
        const introText = document.querySelector('p');
        const title = document.querySelector('h1');
        
        stages.forEach((stage) => {
            const stageData = stage.dataset.stage;
            if (stageData === stageNumber.toString() || stageData === stageNumber) {
                stage.classList.add('active');
                currentStage = stageNumber;
                
                // Hide intro text and title on not-attending stage
                if (stageData === 'not-attending') {
                    if (introText) {
                        introText.style.display = 'none';
                    }
                    if (title) {
                        title.style.display = 'none';
                    }
                } else {
                    if (introText) {
                        introText.style.display = 'block';
                    }
                    if (title) {
                        title.style.display = 'block';
                    }
                }
            } else {
                stage.classList.remove('active');
            }
        });
    }

    function validateStage(stageNumber) {
        const stage = document.querySelector(`.form-stage[data-stage="${stageNumber}"]`);
        if (!stage) return false;
        
        const requiredInputs = stage.querySelectorAll('[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (input.type === 'radio') {
                const radioGroup = stage.querySelectorAll(`input[name="${input.name}"]`);
                const isRadioChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isRadioChecked) {
                    isValid = false;
                    input.closest('fieldset').style.borderColor = '#ff0000';
                } else {
                    input.closest('fieldset').style.borderColor = '#ccc';
                }
            } else {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ff0000';
                } else {
                    input.style.borderColor = '#ccc';
                }
            }
        });

        // For stage 5, if "Yes" is selected, validate attendee fields
        if (stageNumber === 5) {
            const hasAttendees = document.querySelector('input[name="has-additional-attendees"]:checked');
            if (hasAttendees && hasAttendees.value === 'Yes') {
                const attendeeInputs = stage.querySelectorAll('.attendee-first-name, .attendee-last-name');
                attendeeInputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.style.borderColor = '#ff0000';
                    } else {
                        input.style.borderColor = '#ccc';
                    }
                });
            }
        }

        return isValid;
    }

    function addAttendeeField(count) {
        const container = document.getElementById('additional-attendees');
        const newEntry = document.createElement('div');
        newEntry.className = 'attendee-entry';
        newEntry.setAttribute('data-attendee-id', count);
        newEntry.innerHTML = `
            <input type="text" name="attendee-first-name-${count}" placeholder="Attendee ${count} First Name" class="attendee-first-name">
            <input type="text" name="attendee-last-name-${count}" placeholder="Attendee ${count} Last Name" class="attendee-last-name">
            <button type="button" class="remove-attendee-btn">Remove</button>
        `;
        container.appendChild(newEntry);
    }

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateStage(5)) {
            // Form is valid, you can submit it here
            console.log('Form submitted!');
            // You can add your form submission logic here
            alert('Thank you for your RSVP!');
        }
    });
});

