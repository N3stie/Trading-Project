// ========== TRADES.JS - Trade History Logic ==========

// ========== INIT TRADES ==========
function initTrades() {
    // Filter change listeners
    document.getElementById('tradesSessionFilter').addEventListener('change', refreshTrades);
    document.getElementById('tradesDateFrom').addEventListener('change', refreshTrades);
    document.getElementById('tradesDateTo').addEventListener('change', refreshTrades);
    document.getElementById('tradesInstrumentFilter').addEventListener('change', refreshTrades);
    document.getElementById('tradesAccountFilter').addEventListener('change', refreshTrades);
    document.getElementById('tradesTypeFilter').addEventListener('change', refreshTrades);
    document.getElementById('tradesSearch').addEventListener('input', refreshTrades);
}

// ========== REFRESH TRADES ==========
function refreshTrades() {
    const filters = getTradesFilters();
    const trades = getFilteredTrades(filters);
    renderTradesTable(trades);
}

// ========== GET FILTERS ==========
function getTradesFilters() {
    return {
        session: document.getElementById('tradesSessionFilter').value,
        dateFrom: document.getElementById('tradesDateFrom').value,
        dateTo: document.getElementById('tradesDateTo').value,
        category: document.getElementById('tradesInstrumentFilter').value,
        account: document.getElementById('tradesAccountFilter').value,
        type: document.getElementById('tradesTypeFilter').value,
        search: document.getElementById('tradesSearch').value
    };
}

// ========== RENDER TRADES TABLE ==========
function renderTradesTable(trades) {
    const tbody = document.getElementById('tradesTableBody');
    
    if (trades.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-row">
                <td colspan="14">No trades found</td>
            </tr>
        `;
        return;
    }
    
    // Sort trades by entry date (most recent first)
    const sortedTrades = [...trades].sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
    
    tbody.innerHTML = sortedTrades.map(trade => createTradeRow(trade)).join('');
    
    // Add event listeners to action buttons
    tbody.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tradeId = e.target.dataset.id;
            deleteTradeAndRefresh(tradeId);
        });
    });
    
    tbody.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tradeId = e.target.dataset.id;
            editTrade(tradeId);
        });
    });
}

// ========== CREATE TRADE ROW ==========
function createTradeRow(trade) {
    const profit = parseFloat(trade.profit || 0);
    const profitClass = profit > 0 ? 'profit-positive' : profit < 0 ? 'profit-negative' : '';
    const profitFormatted = formatCurrency(profit);
    
    const entryDate = formatDate(trade.entryDate);
    
    const resultClass = trade.result === 'Win' ? 'result-win' : trade.result === 'Loss' ? 'result-loss' : 'result-breakeven';
    
    const screenshotCell = trade.screenshot && trade.screenshot.startsWith('data:')
        ? `<a href="${trade.screenshot}" target="_blank" class="screenshot-link">📸 View</a>`
        : trade.screenshot
            ? `<a href="screenshots/${trade.screenshot}" target="_blank" class="screenshot-link">📸 View</a>`
            : '-';
    
    return `
        <tr>
            <td>${entryDate}</td>
            <td><strong>${trade.instrument || '-'}</strong></td>
            <td>${trade.size || '-'}</td>
            <td>${formatCurrency(trade.entryPrice)}</td>
            <td>${formatCurrency(trade.exitPrice)}</td>
            <td><span class="type-badge type-${trade.type?.toLowerCase()}">${trade.type || '-'}</span></td>
            <td>${trade.session || '-'}</td>
            <td>${trade.account || '-'}</td>
            <td class="${profitClass}">${profitFormatted}</td>
            <td><span class="result-badge ${resultClass}">${trade.result || '-'}</span></td>
            <td class="note-cell" title="${trade.note || ''}">${truncateText(trade.note, 30)}</td>
            <td>${screenshotCell}</td>
            <td class="actions-cell">
                <button class="action-btn edit" data-id="${trade.id}" title="Edit">✏️</button>
                <button class="action-btn delete" data-id="${trade.id}" title="Delete">🗑️</button>
            </td>
        </tr>
    `;
}

// ========== DELETE TRADE ==========
function deleteTradeAndRefresh(tradeId) {
    if (confirm('Are you sure you want to delete this trade? This cannot be undone.')) {
        deleteTrade(tradeId);
        refreshTrades();
        if (currentPage === 'dashboard') refreshDashboard();
    }
}

// ========== EDIT TRADE ==========
function editTrade(tradeId) {
    const trades = getTrades();
    const trade = trades.find(t => t.id === tradeId);
    
    if (!trade) return;
    
    // Switch to Add Trade page
    navigateTo('addTrade');
    
    // Populate form with trade data
    setTimeout(() => {
        document.getElementById('entryDate').value = trade.entryDate || '';
        document.getElementById('instrument').value = trade.instrument || '';
        document.getElementById('size').value = trade.size || '';
        document.getElementById('entryPrice').value = trade.entryPrice || '';
        document.getElementById('exitPrice').value = trade.exitPrice || '';
        document.getElementById('type').value = trade.type || 'Buy';
        document.getElementById('session').value = trade.session || '';
        document.getElementById('account').value = trade.account || '';
        document.getElementById('pnl').value = trade.profit || 0;
        document.getElementById('result').value = trade.result || '';
        document.getElementById('note').value = trade.note || '';
        
        // Store editing ID
        document.getElementById('addTradeForm').dataset.editId = tradeId;
        
        // Change button text
        const submitBtn = document.querySelector('#addTradeForm .btn-primary');
        submitBtn.textContent = 'Update Trade';
        
        // Show current screenshot if exists
        if (trade.screenshot) {
            const preview = document.getElementById('screenshotPreview');
            if (trade.screenshot.startsWith('data:')) {
                preview.innerHTML = `<p>Current screenshot:</p><img src="${trade.screenshot}" alt="Current screenshot" style="max-width: 200px;">`;
            } else {
                preview.innerHTML = `<p>Current: <a href="screenshots/${trade.screenshot}" target="_blank">${trade.screenshot}</a></p>`;
            }
        }
    }, 100);
}

// ========== TRUNCATE TEXT ==========
function truncateText(text, maxLength) {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}