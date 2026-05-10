// ========== ADDTRADE.JS - Add/Edit Trade Form Logic ==========

function initAddTrade() {
    const form = document.getElementById('addTradeForm');
    if (!form) return;
    
    form.addEventListener('submit', handleTradeSubmit);
    form.addEventListener('reset', handleFormReset);
    
    const screenshotInput = document.getElementById('screenshot');
    if (screenshotInput) {
        screenshotInput.addEventListener('change', handleScreenshotPreview);
    }
}

function refreshAddTradeForm() {
    const form = document.getElementById('addTradeForm');
    if (!form) return;
    
    delete form.dataset.editId;
    form.querySelector('.btn-primary').textContent = 'Add Trade';
    
    const preview = document.getElementById('screenshotPreview');
    if (preview) preview.innerHTML = '';
    
    populateFilterDropdowns();
}

function handleTradeSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('addTradeForm');
    const editId = form.dataset.editId;
    
    const tradeData = {
        entryDate: document.getElementById('entryDate').value,
        exitDate: document.getElementById('entryDate').value,
        instrument: document.getElementById('instrument').value.trim(),
        category: '',
        size: parseFloat(document.getElementById('size').value) || 0,
        entryPrice: parseFloat(document.getElementById('entryPrice').value) || 0,
        exitPrice: parseFloat(document.getElementById('exitPrice').value) || 0,
        type: document.getElementById('type').value,
        session: document.getElementById('session').value,
        account: document.getElementById('account').value,
        profit: parseFloat(document.getElementById('pnl').value) || 0,
        result: document.getElementById('result').value,
        mfe: 0,
        mae: 0,
        note: document.getElementById('note').value.trim(),
        screenshot: ''
    };
    
    const screenshotInput = document.getElementById('screenshot');
    const screenshotFile = screenshotInput ? screenshotInput.files[0] : null;
    
    if (screenshotFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            tradeData.screenshot = event.target.result;
            saveTradeData(tradeData, editId);
        };
        reader.readAsDataURL(screenshotFile);
    } else {
        if (editId) {
            const trades = getTrades();
            const existing = trades.find(t => t.id === editId);
            if (existing && existing.screenshot) {
                tradeData.screenshot = existing.screenshot;
            }
        }
        saveTradeData(tradeData, editId);
    }
}

function saveTradeData(tradeData, editId) {
    if (editId) {
        updateTrade(editId, tradeData);
        showNotification('Trade updated!', 'success');
    } else {
        addTrade(tradeData);
        showNotification('Trade added!', 'success');
    }
    
    const form = document.getElementById('addTradeForm');
    form.reset();
    
    const preview = document.getElementById('screenshotPreview');
    if (preview) preview.innerHTML = '';
    
    delete form.dataset.editId;
    form.querySelector('.btn-primary').textContent = 'Add Trade';
    
    populateFilterDropdowns();
    if (currentPage === 'dashboard') refreshDashboard();
    if (currentPage === 'trades') refreshTrades();
}

function handleFormReset() {
    const form = document.getElementById('addTradeForm');
    delete form.dataset.editId;
    form.querySelector('.btn-primary').textContent = 'Add Trade';
    
    const preview = document.getElementById('screenshotPreview');
    if (preview) preview.innerHTML = '';
}

function handleScreenshotPreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('screenshotPreview');
    if (!preview) return;
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            preview.innerHTML = `
                <img src="${event.target.result}" alt="Preview">
                <p>${file.name} (${formatFileSize(file.size)})</p>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 12px 20px;
        border-radius: 8px; font-size: 14px; font-weight: 600;
        z-index: 9999; animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: #ffffff;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}