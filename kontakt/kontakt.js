document.addEventListener('DOMContentLoaded', function() {

    const departmentEmails = document.querySelectorAll('.department-card a[href^="mailto:"]');
    
    departmentEmails.forEach(email => {
        email.addEventListener('click', function() {
            const emailAddress = email.getAttribute('href').replace('mailto:', '');
            copyToClipboard(emailAddress);
            
            showTooltip(email, 'Email kopiran!');
        });
    });
    
    
    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
        } else {
            legacyCopy(text);
        }
    }

    function legacyCopy(text) {
        const temp = document.createElement('input');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
    }
    
    
    function showTooltip(element, message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip tooltip-visible';
    tooltip.innerText = message;
        
    const rect = element.getBoundingClientRect();
    tooltip.style.position = 'absolute';
    tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
    tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
    tooltip.style.transform = 'translateX(-50%)';
    document.body.appendChild(tooltip);
        
        setTimeout(() => {
            document.body.removeChild(tooltip);
        }, 2000);
    }
});
