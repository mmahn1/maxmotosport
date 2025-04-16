document.addEventListener("DOMContentLoaded", function () {
    const newsletterPlaceholder = document.getElementById('newsletter-placeholder');
    if (newsletterPlaceholder) {
        fetch('/Newsletter/index.html') // Use an absolute path
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load newsletter content');
                }
                return response.text();
            })
            .then(html => {
                newsletterPlaceholder.innerHTML = html;
            })
            .catch(error => {
                console.error('Error loading newsletter:', error);
            });
    }

    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const emailInput = document.getElementById('email');
            const email = emailInput.value.trim();
            
            if (!email || !isValidEmail(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';
            
            fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('Thank you for subscribing to our newsletter!', 'success');
                    emailInput.value = '';
                } else {
                    throw new Error(data.message || 'Failed to subscribe');
                }
            })
            .catch(error => {
                console.error('Newsletter subscription error:', error);
                showMessage('An error occurred while subscribing. Please try again later.', 'error');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Subscribe';
            });
        });
    }

    function showMessage(message, type) {
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageContainer = document.createElement('div');
        messageContainer.className = `message message-${type}`;
        messageContainer.textContent = message;
        
        const form = document.getElementById('newsletter-form');
        form.parentNode.insertBefore(messageContainer, form.nextSibling);
        
        setTimeout(() => {
            messageContainer.remove();
        }, 5000);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});