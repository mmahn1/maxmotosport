document.addEventListener("DOMContentLoaded", function () {
    const newsletterPlaceholder = document.getElementById('newsletter-placeholder');
    if (newsletterPlaceholder) {
        fetch('/Newsletter/index.html') 
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

    document.addEventListener('submit', function (event) {
        const form = event.target;
        if (form.id === 'newsletter-form') {
            event.preventDefault(); 

            const emailInput = form.querySelector('#email');
            const email = emailInput.value.trim();

            if (!email || !isValidEmail(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
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
                    if (!data.error) {
                        showMessage(data.message || 'Thank you for subscribing to our newsletter!', 'success');
                        emailInput.value = '';
                    } else {
                        throw new Error(data.error || data.message || 'Failed to subscribe');
                    }
                })
                .catch(error => {
                    console.error('Newsletter subscription error:', error);
                    showMessage(error.message || 'An error occurred while subscribing. Please try again later.', 'error');
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Subscribe';
                });
        }
    });

    function showMessage(message, type) {
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageContainer = document.createElement('div');
        messageContainer.className = `message message-${type}`;
        messageContainer.textContent = message;

        const form = document.getElementById('newsletter-form');
        form.parentNode.insertBefore(messageContainer, form.nextSibling);
        messageContainer.style.padding = '10px';
        messageContainer.style.marginTop = '10px';
        messageContainer.style.borderRadius = '5px';
        messageContainer.style.color = '#fff';
        messageContainer.style.fontWeight = 'bold';
        messageContainer.style.textAlign = 'center';
        messageContainer.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';

        setTimeout(() => {
            messageContainer.remove();
        }, 5000);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});