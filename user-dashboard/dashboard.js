document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (!token) {
        window.location.href = '/account/account.html';
        return;
    }
    
    document.getElementById('user-name').textContent = username || 'User';
    
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
            
            if (targetPage === 'overview') {
                loadOverviewData();
            } else if (targetPage === 'orders') {
                loadOrders();
            } else if (targetPage === 'maintenance') {
            } else if (targetPage === 'profile') {
                loadUserProfile();
            } else if (targetPage === 'newsletter') {
                checkNewsletterStatus();
                loadNewsletterArchive();
            }
        });
    });
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            tabContents.forEach(content => {
                if (content.id === targetTab + '-tab') {
                    content.classList.add('active');
                    
                    if (targetTab === 'history') {
                        loadMaintenanceHistory();
                    }
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
    
    setupMaintenanceForm();
    setupProfileForms();
    setupNewsletterButtons();
    
    loadOverviewData();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointment-date').min = today;
});

const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    const token = localStorage.getItem('token');
    
    if (!options.headers) {
        options.headers = {};
    }
    
    if (!(options.body instanceof FormData)) {
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    }
    
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return originalFetch(url, options);
};

function loadOverviewData() {
    Promise.all([
        fetch('/api/orders/count'),
        fetch('/api/maintenance/count'),
        fetch('/api/user/activity')
    ])
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(([orderData, maintenanceData, activityData]) => {
        document.getElementById('order-count').textContent = orderData.count || 0;
        document.getElementById('maintenance-count').textContent = maintenanceData.count || 0;
        
        if (activityData.success && activityData.activities.length > 0) {
            renderActivityFeed(activityData.activities);
        } else {
            document.getElementById('activity-feed').innerHTML = '<p class="no-data">No recent activity.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading overview data:', error);
        document.getElementById('activity-feed').innerHTML = '<p class="error">Failed to load activity data.</p>';
    });
}

function renderActivityFeed(activities) {
    const activityFeed = document.getElementById('activity-feed');
    activityFeed.innerHTML = '';
    
    activities.forEach(activity => {
        const activityDate = new Date(activity.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <p>${activity.description}</p>
            <div class="activity-date">${activityDate}</div>
        `;
        
        activityFeed.appendChild(item);
    });
}

// Orders page functions
function loadOrders() {
    const orderContainer = document.getElementById('order-container');
    orderContainer.innerHTML = '<div class="loading">Loading your orders...</div>';
    
    fetch('/api/orders')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.orders.length > 0) {
            renderOrders(data.orders);
        } else {
            orderContainer.innerHTML = '<div class="no-data">You haven\'t placed any orders yet.</div>';
        }
    })
    .catch(error => {
        console.error('Error loading orders:', error);
        orderContainer.innerHTML = '<div class="error">Failed to load orders. Please try again.</div>';
    });
}

function renderOrders(orders) {
    const orderContainer = document.getElementById('order-container');
    orderContainer.innerHTML = '';
    
    orders.forEach(order => {
        const orderDate = new Date(order.order_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <strong>Order #${order.order_id}</strong>
                    <div>${orderDate}</div>
                </div>
                <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <div class="order-total">
                <strong>Total:</strong> $${order.total.toFixed(2)}
            </div>
            <div class="order-items">
                ${renderOrderItems(order.items)}
            </div>
        `;
        
        orderContainer.appendChild(orderCard);
    });
}

function renderOrderItems(items) {
    let html = '';
    items.forEach(item => {
        html += `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <div>${item.name}</div>
                    <div>Quantity: ${item.quantity}</div>
                </div>
                <div class="item-price">$${item.price.toFixed(2)}</div>
            </div>
        `;
    });
    return html;
}

function setupMaintenanceForm() {
    const maintenanceForm = document.getElementById('maintenance-form');
    if (maintenanceForm) {
        maintenanceForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const serviceType = document.getElementById('service-type').value;
            const vehicleInfo = document.getElementById('vehicle-info').value;
            const appointmentDate = document.getElementById('appointment-date').value;
            const appointmentTime = document.getElementById('appointment-time').value;
            const notes = document.getElementById('notes').value;
            
            if (!serviceType || !vehicleInfo || !appointmentDate || !appointmentTime) {
                showMessage('Please fill in all required fields.', 'error');
                return;
            }
            
            const appointmentDatetime = `${appointmentDate}T${appointmentTime}:00`;
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Scheduling...';
            
            fetch('/api/maintenance/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    service_type: serviceType,
                    vehicle_info: vehicleInfo,
                    appointment_date: appointmentDatetime,
                    notes: notes
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('Service scheduled successfully!', 'success');
                    maintenanceForm.reset();
                    
                    setTimeout(() => {
                        document.querySelector('[data-tab="history"]').click();
                    }, 2000);
                } else {
                    throw new Error(data.message || 'Failed to schedule maintenance');
                }
            })
            .catch(error => {
                console.error('Error scheduling maintenance:', error);
                showMessage(error.message || 'An error occurred. Please try again.', 'error');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            });
        });
    }
}

function loadMaintenanceHistory() {
    const historyContainer = document.getElementById('maintenance-history');
    historyContainer.innerHTML = '<div class="loading">Loading your service history...</div>';
    
    fetch('/api/maintenance/history')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.history.length > 0) {
            renderMaintenanceHistory(data.history);
        } else {
            historyContainer.innerHTML = '<div class="no-data">No maintenance history found.</div>';
        }
    })
    .catch(error => {
        console.error('Error loading maintenance history:', error);
        historyContainer.innerHTML = '<div class="error">Failed to load history. Please try again.</div>';
    });
}

function renderMaintenanceHistory(history) {
    const historyContainer = document.getElementById('maintenance-history');
    historyContainer.innerHTML = '';
    
    history.forEach(item => {
        const appointmentDate = new Date(item.appointment_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const appointmentTime = new Date(item.appointment_date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const historyCard = document.createElement('div');
        historyCard.className = `order-card`;
        historyCard.innerHTML = `
            <div class="order-header">
                <h3>${item.service_type}</h3>
                <span class="order-status status-${item.status.toLowerCase()}">${item.status}</span>
            </div>
            <p><strong>Scheduled for:</strong> ${appointmentDate} at ${appointmentTime}</p>
            <p><strong>Vehicle:</strong> ${item.vehicle_info}</p>
            ${item.notes ? `<p><strong>Notes:</strong> ${item.notes}</p>` : ''}
            ${item.admin_notes ? `<p><strong>Admin Notes:</strong> ${item.admin_notes}</p>` : ''}
        `;
        
        historyContainer.appendChild(historyCard);
    });
}

function loadUserProfile() {
    fetch('/api/user/profile')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('username').value = data.profile.username || '';
            document.getElementById('email').value = data.profile.email || '';
            document.getElementById('full-name').value = data.profile.full_name || '';
            document.getElementById('phone').value = data.profile.phone || '';
        } else {
            throw new Error(data.message || 'Failed to load profile');
        }
    })
    .catch(error => {
        console.error('Error loading user profile:', error);
        showMessage('Failed to load your profile. Please try again.', 'error');
    });
}

function setupProfileForms() {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const email = document.getElementById('email').value;
            const fullName = document.getElementById('full-name').value;
            const phone = document.getElementById('phone').value;
            
            if (!email) {
                showMessage('Email is required.', 'error');
                return;
            }
            
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Updating...';
            
            fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    email: email,
                    full_name: fullName,
                    phone: phone
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('Profile updated successfully!', 'success');
                } else {
                    throw new Error(data.message || 'Failed to update profile');
                }
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                showMessage(error.message || 'An error occurred while updating your profile.', 'error');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Update Profile';
            });
        });
    }
    
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                showMessage('All password fields are required.', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showMessage('New passwords do not match.', 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                showMessage('Password must be at least 8 characters long.', 'error');
                return;
            }
            
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Changing...';
            
            fetch('/api/user/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('Password changed successfully!', 'success');
                    passwordForm.reset();
                } else {
                    throw new Error(data.message || 'Failed to change password');
                }
            })
            .catch(error => {
                console.error('Error changing password:', error);
                showMessage(error.message || 'An error occurred while changing your password.', 'error');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Change Password';
            });
        });
    }
}

function checkNewsletterStatus() {
    const statusElement = document.getElementById('subscription-status');
    statusElement.textContent = 'Checking status...';
    statusElement.className = '';
    
    fetch('/api/newsletter/status')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (data.subscribed) {
                statusElement.textContent = 'You are currently subscribed to our newsletter.';
                statusElement.className = 'subscribed';
                document.getElementById('subscribe-btn').style.display = 'none';
                document.getElementById('unsubscribe-btn').style.display = 'block';
            } else {
                statusElement.textContent = 'You are not subscribed to our newsletter.';
                statusElement.className = 'not-subscribed';
                document.getElementById('subscribe-btn').style.display = 'block';
                document.getElementById('unsubscribe-btn').style.display = 'none';
            }
        } else {
            throw new Error(data.message || 'Failed to check subscription status');
        }
    })
    .catch(error => {
        console.error('Error checking newsletter status:', error);
        statusElement.textContent = 'Could not determine your subscription status.';
        statusElement.className = 'error';
    });
}

function setupNewsletterButtons() {
    const subscribeBtn = document.getElementById('subscribe-btn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function() {
            this.disabled = true;
            this.textContent = 'Subscribing...';
            
            fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('You have been subscribed to our newsletter!', 'success');
                    checkNewsletterStatus();
                } else {
                    throw new Error(data.message || 'Failed to subscribe');
                }
            })
            .catch(error => {
                console.error('Error subscribing to newsletter:', error);
                showMessage(error.message || 'An error occurred. Please try again.', 'error');
            })
            .finally(() => {
                this.disabled = false;
                this.textContent = 'Subscribe';
            });
        });
    }
    
    const unsubscribeBtn = document.getElementById('unsubscribe-btn');
    if (unsubscribeBtn) {
        unsubscribeBtn.addEventListener('click', function() {
            if (!confirm('Are you sure you want to unsubscribe from our newsletter?')) {
                return;
            }
            
            this.disabled = true;
            this.textContent = 'Unsubscribing...';
            
            fetch('/api/newsletter/unsubscribe', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('You have been unsubscribed from our newsletter.', 'success');
                    checkNewsletterStatus();
                } else {
                    throw new Error(data.message || 'Failed to unsubscribe');
                }
            })
            .catch(error => {
                console.error('Error unsubscribing from newsletter:', error);
                showMessage(error.message || 'An error occurred. Please try again.', 'error');
            })
            .finally(() => {
                this.disabled = false;
                this.textContent = 'Unsubscribe';
            });
        });
    }
}

function loadNewsletterArchive() {
    const newsletterList = document.getElementById('newsletter-list');
    newsletterList.innerHTML = '<div class="loading">Loading newsletters...</div>';
    
    fetch('/api/newsletter/archive')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.newsletters.length > 0) {
            renderNewsletterArchive(data.newsletters);
        } else {
            newsletterList.innerHTML = '<div class="no-data">No newsletters found.</div>';
        }
    })
    .catch(error => {
        console.error('Error loading newsletter archive:', error);
        newsletterList.innerHTML = '<div class="error">Failed to load newsletters. Please try again.</div>';
    });
}

function renderNewsletterArchive(newsletters) {
    const newsletterList = document.getElementById('newsletter-list');
    newsletterList.innerHTML = '';
    
    newsletters.forEach(newsletter => {
        const newsletterDate = new Date(newsletter.sent_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const item = document.createElement('div');
        item.className = 'newsletter-item';
        item.innerHTML = `
            <h3>${newsletter.subject}</h3>
            <div class="newsletter-date">Sent on ${newsletterDate}</div>
            <div class="newsletter-actions">
                <a href="/newsletter/view/${newsletter.id}" target="_blank" class="view-link">View</a>
            </div>
        `;
        
        newsletterList.appendChild(item);
    });
}

function showMessage(message, type) {
    let messageContainer = document.querySelector('.message-container');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        document.querySelector('.main-content').insertBefore(
            messageContainer, 
            document.querySelector('.main-content').firstChild
        );
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    

    const closeButton = document.createElement('button');
    closeButton.className = 'close-message';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', function() {
        messageElement.remove();
    });
    
    messageElement.appendChild(closeButton);
    messageContainer.appendChild(messageElement);
    
    
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 5000);
}

(function addMessageStyles() {
    if (!document.getElementById('message-styles')) {
        const style = document.createElement('style');
        style.id = 'message-styles';
        style.textContent = `
            .message-container {
                position: fixed;
                top: 75px;
                right: 20px;
                max-width: 350px;
                z-index: 1000;
            }
            .message {
                padding: 15px 35px 15px 15px;
                margin-bottom: 10px;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                position: relative;
                animation: slideIn 0.3s ease-out;
            }
            .message.success {
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .message.error {
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            .close-message {
                position: absolute;
                top: 5px;
                right: 5px;
                background: transparent;
                border: none;
                font-size: 18px;
                cursor: pointer;
                opacity: 0.5;
                width: auto;
                padding: 0;
                margin: 0;
                color: inherit;
            }
            .close-message:hover {
                opacity: 1;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
})();
