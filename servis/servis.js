document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            item.classList.toggle('active');
        });
    });
    
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        
        const formattedToday = `${yyyy}-${mm}-${dd}`;
        dateInput.setAttribute('min', formattedToday);
    }
    
    const serviceForm = document.getElementById('service-form');
    const submissionStatus = document.getElementById('submission-status');
    
    if (serviceForm) {
        serviceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitButton = serviceForm.querySelector('.btn-submit');
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            
            const formData = new FormData(serviceForm);
            
            fetch('/api/service-booking', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Server error');
                }
                return response.json();
            })
            .then(data => {
                submissionStatus.innerHTML = `
                    <div class="success-message">
                        <h3>Booking sent successfully!</h3>
                        <p>Thank you for your request. We'll contact you shortly to confirm your appointment.</p>
                    </div>
                `;
                
                
                serviceForm.reset();
            })
            .catch(error => {
                
                submissionStatus.innerHTML = `
                    <div class="error-message">
                        <h3>Error</h3>
                        <p>There was an error submitting your booking. Please try again or contact us by phone.</p>
                    </div>
                `;
                console.error('Error:', error);
            })
            .finally(() => {
                
                submitButton.disabled = false;
                submitButton.textContent = 'Send an inquiry';
                
               
                submissionStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }
});
