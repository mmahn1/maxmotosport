document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/check-admin', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.isAdmin) {
            window.location.href = '/'; 
            return;
        }
        
        loadSubscribers();
        
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', sendNewsletter);
        }
    })
    .catch(err => {
        console.error('Error checking admin status:', err);
        window.location.href = '/'; 
    });
    
    function loadSubscribers() {
        fetch('/api/newsletter/subscribers', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateSubscribersList(data.subscribers);
            } else {
                showError('Failed to load subscribers: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error loading subscribers:', error);
            showError('An error occurred while loading subscribers.');
        });
    }
    
    function updateSubscribersList(subscribers) {
        const tableBody = document.getElementById('subscribers-table-body');
        const subscriberCount = document.querySelector('.subscriber-count');
        
        subscriberCount.textContent = `Total Subscribers: ${subscribers.length}`;

        tableBody.innerHTML = '';
        
        if (subscribers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="2">No subscribers found</td>
                </tr>
            `;
            return;
        }
        
        subscribers.forEach(subscriber => {
            const row = document.createElement('tr');
            
            const subscribedDate = new Date(subscriber.subscribed_at);
            const formattedDate = subscribedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            row.innerHTML = `
                <td>${subscriber.email}</td>
                <td>${formattedDate}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    function sendNewsletter(event) {
        event.preventDefault();
        
        const subject = document.getElementById('subject').value.trim();
        const content = document.getElementById('content').value.trim();
        
        if (!subject || !content) {
            showSendStatus('Please fill in both subject and content fields.', 'error');
            return;
        }
        
        
        const formattedContent = formatContentAsHTML(content);
        

        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        fetch('/api/newsletter/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ subject, content: formattedContent })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSendStatus(data.message, 'success');
                document.getElementById('subject').value = '';
                document.getElementById('content').value = '';
            } else {
                throw new Error(data.message || 'Failed to send newsletter');
            }
        })
        .catch(error => {
            console.error('Error sending newsletter:', error);
            showSendStatus(error.message || 'An error occurred while sending the newsletter.', 'error');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Newsletter';
        });
    }
    
    function formatContentAsHTML(content) {

        let html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">';
        

        const paragraphs = content.split('\n\n');
        
        paragraphs.forEach(paragraph => {
            if (paragraph.trim().startsWith('# ')) {
                const headingText = paragraph.replace('# ', '').trim();
                html += `<h2 style="color: #ff0000; margin-top: 20px;">${headingText}</h2>`;
            } else {
                html += `<p style="margin-bottom: 16px; line-height: 1.6;">${paragraph}</p>`;
            }
        });
        
        html += `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
                <p>This email was sent to you because you subscribed to the MaX Motosport newsletter.</p>
                <p>© ${new Date().getFullYear()} MaX Motosport, All Rights Reserved.</p>
            </div>
        `;
        
        html += '</div>';
        return html;
    }
    
    function showSendStatus(message, type) {
        const statusElement = document.getElementById('send-status');
        statusElement.textContent = message;
        statusElement.className = type;
        
        
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
    
    function showError(message) {
        console.error(message);

    }
});

function formatText(format) {
    const textarea = document.getElementById('content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = '';
    
    switch(format) {
        case 'bold':
            replacement = `**${selectedText}**`;
            break;
        case 'italic':
            replacement = `*${selectedText}*`;
            break;
        case 'link':
            const url = prompt('Enter the URL:', 'https://');
            if (url) {
                replacement = `[${selectedText}](${url})`;
            } else {
                return;
            }
            break;
        case 'h2':
            replacement = `# ${selectedText}`;
            break;
    }
    
    textarea.value = 
        textarea.value.substring(0, start) + 
        replacement + 
        textarea.value.substring(end);
    
    textarea.focus();
    textarea.setSelectionRange(start + replacement.length, start + replacement.length);
}
