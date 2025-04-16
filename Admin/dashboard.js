document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
        window.location.href = '/account/account.html';
        return;
    }
    
    document.getElementById('admin-name').textContent = username;
    
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        window.location.href = '/account/account.html';
    });
    
    const navItems = document.querySelectorAll('.nav-menu li');
    const pages = document.querySelectorAll('.dashboard-page');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            pages.forEach(page => {
                if (page.id === targetPage + '-page') {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
            
            if (targetPage === 'orders') {
                loadOrders();
            } else if (targetPage === 'products') {
                loadProducts();
            } else if (targetPage === 'newsletter') {
                loadSubscribers();
            } else if (targetPage === 'users') {
                loadUsers();
            }
        });
    });
    
    loadOrders();
    
    setupFilters();
    setupNewsletterForm();
    
    if (window.location.hash === '#newsletter') {
        document.querySelector('[data-page="newsletter"]').click();
    }
});

function loadOrders() {
    const orderContainer = document.getElementById('order-container');
    orderContainer.innerHTML = '<div class="loading">Loading orders...</div>';
    
    fetch('/api/maintenance/orders', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderOrders(data.orders);
        } else {
            throw new Error(data.message || 'Failed to load orders');
        }
    })
    .catch(error => {
        console.error('Error loading orders:', error);
        orderContainer.innerHTML = '<div class="error">Failed to load orders. Please try again.</div>';
    });
}

function renderOrders(orders) {
    const orderContainer = document.getElementById('order-container');
    
    if (orders.length === 0) {
        orderContainer.innerHTML = '<div class="no-data">No maintenance orders found.</div>';
        return;
    }
    
    orderContainer.innerHTML = '';
    
    orders.forEach(order => {
        const orderDate = new Date(order.appointment_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const orderTime = new Date(order.appointment_date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
                <span class="order-date">${orderDate} at ${orderTime}</span>
            </div>
            <h3>${order.service_type}</h3>
            <p><strong>Customer:</strong> ${order.customer_name}</p>
            <p><strong>Phone:</strong> ${order.phone}</p>
            <p><strong>Vehicle:</strong> ${order.vehicle_info}</p>
            <p><strong>Notes:</strong> ${order.notes || 'None'}</p>
            <div class="order-actions">
                ${getActionButtons(order)}
            </div>
        `;
        
        orderContainer.appendChild(orderCard);
    });
    

    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleOrderAction);
    });
}

function getActionButtons(order) {
    switch (order.status.toLowerCase()) {
        case 'pending':
            return `
                <button class="action-btn approve-btn" data-action="approve" data-id="${order.id}">Approve</button>
                <button class="action-btn reject-btn" data-action="reject" data-id="${order.id}">Reject</button>
                <button class="action-btn reschedule-btn" data-action="reschedule" data-id="${order.id}">Reschedule</button>
            `;
        case 'approved':
            return `
                <button class="action-btn complete-btn" data-action="complete" data-id="${order.id}">Mark Completed</button>
                <button class="action-btn reschedule-btn" data-action="reschedule" data-id="${order.id}">Reschedule</button>
            `;
        default:
            return '';
    }
}

function handleOrderAction(event) {
    const action = event.target.getAttribute('data-action');
    const orderId = event.target.getAttribute('data-id');
    
    if (action === 'reschedule') {
        const newDate = prompt('Enter new date (YYYY-MM-DD):', '');
        if (!newDate) return;
        
        const newTime = prompt('Enter new time (HH:MM):', '');
        if (!newTime) return;
        
        updateOrderStatus(orderId, action, { date: newDate, time: newTime });
    } else {
        updateOrderStatus(orderId, action);
    }
}

function updateOrderStatus(orderId, action, additionalData = {}) {
    fetch(`/api/maintenance/orders/${orderId}/${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(additionalData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadOrders();
        } else {
            throw new Error(data.message || `Failed to ${action} order`);
        }
    })
    .catch(error => {
        console.error(`Error updating order status:`, error);
        alert(`Failed to ${action} order: ${error.message}`);
    });
}

function setupFilters() {
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    if (statusFilter && dateFilter && clearFiltersBtn) {
        statusFilter.addEventListener('change', applyFilters);
        dateFilter.addEventListener('change', applyFilters);
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
}

function applyFilters() {
    const status = document.getElementById('status-filter').value;
    const date = document.getElementById('date-filter').value;
    
    fetch(`/api/maintenance/orders?status=${status}&date=${date}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderOrders(data.orders);
        } else {
            throw new Error(data.message || 'Failed to load filtered orders');
        }
    })
    .catch(error => {
        console.error('Error applying filters:', error);
    });
}

function clearFilters() {
    document.getElementById('status-filter').value = 'all';
    document.getElementById('date-filter').value = '';
    loadOrders();
}

function loadSubscribers() {
    fetch('/api/newsletter/subscribers', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateSubscribersList(data.subscribers);
        } else {
            throw new Error(data.message || 'Failed to load subscribers');
        }
    })
    .catch(error => {
        console.error('Error loading subscribers:', error);
        document.getElementById('subscribers-table-body').innerHTML = 
            '<tr><td colspan="2">Failed to load subscribers. Please try again.</td></tr>';
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
            day: 'numeric'
        });
        
        row.innerHTML = `
            <td>${subscriber.email}</td>
            <td>${formattedDate}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function setupNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', sendNewsletter);
    }
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
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
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
        } else if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {

            const boldText = paragraph.replace(/^\*\*|\*\*$/g, '').trim();
            html += `<p style="margin-bottom: 16px; line-height: 1.6; font-weight: bold;">${boldText}</p>`;
        } else if (paragraph.trim().startsWith('*') && paragraph.trim().endsWith('*')) {

            const italicText = paragraph.replace(/^\*|\*$/g, '').trim();
            html += `<p style="margin-bottom: 16px; line-height: 1.6; font-style: italic;">${italicText}</p>`;
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
    statusElement.style.display = 'block';
    

    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 5000);
}

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


function loadProducts() {
    
    
}


function loadUsers() {
    const usersContainer = document.getElementById('users-container');
    usersContainer.innerHTML = '<div class="loading">Loading users...</div>';
    
    fetch('/api/users', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderUsers(data.users);
        } else {
            throw new Error(data.message || 'Failed to load users');
        }
    })
    .catch(error => {
        console.error('Error loading users:', error);
        usersContainer.innerHTML = '<div class="error">Failed to load users. Please try again.</div>';
    });
}

function renderUsers(users) {
    const usersContainer = document.getElementById('users-container');
    
    if (users.length === 0) {
        usersContainer.innerHTML = '<div class="no-data">No users found.</div>';
        return;
    }
    
    usersContainer.innerHTML = '';
    
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.innerHTML = `
            <h3>${user.username}</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role}</p>
            <p><strong>Joined:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
        `;
        
        usersContainer.appendChild(userCard);
    });
}
