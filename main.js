document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });
    // Form submission
    const form = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');
    const closeSuccessBtn = document.getElementById('close-success');
    const submitBtn = document.getElementById('submitBtn');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Basic validation is handled by HTML5 attributes
            // Gather data
            const data = {
                full_name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                college_name: document.getElementById('college').value,
                current_year: document.getElementById('year').value,
                target_company: document.getElementById('targetCompany').value,
                message: document.getElementById('message').value
            };
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
                const response = await fetch('/api/contact/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (response.ok) {
                    // Show success message
                    successMessage.classList.remove('d-none');
                    form.reset();
                } else {
                    const errorData = await response.json();
                    alert('Error submitting form: ' + (errorData.detail || 'Please try again later.'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('A network error occurred. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit Inquiry';
            }
        });
    }
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            successMessage.classList.add('d-none');
        });
    }
});
