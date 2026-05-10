// ========== DASHBOARD.JS - Dashboard Logic ==========

let pnlChart = null;

// ========== INIT DASHBOARD ==========
function initDashboard() {
    document.getElementById('dashboardSessionFilter').addEventListener('change', refreshDashboard);
    document.getElementById('dashboardDateFrom').addEventListener('change', refreshDashboard);
    document.getElementById('dashboardDateTo').addEventListener('change', refreshDashboard);
    document.getElementById('dashboardInstrumentFilter').addEventListener('change', refreshDashboard);
    document.getElementById('dashboardAccountFilter').addEventListener('change', refreshDashboard);
}

// ========== REFRESH DASHBOARD ==========
async function refreshDashboard() {
    const filters = getDashboardFilters();
    const trades = await getFilteredTrades(filters);
    
    updateSummaryCards(trades);
    updateWinLossCards(trades);
    updatePnLChart(trades);
}

// ========== GET FILTERS ==========
function getDashboardFilters() {
    return {
        session: document.getElementById('dashboardSessionFilter').value,
        dateFrom: document.getElementById('dashboardDateFrom').value,
        dateTo: document.getElementById('dashboardDateTo').value,
        category: document.getElementById('dashboardInstrumentFilter').value,
        account: document.getElementById('dashboardAccountFilter').value
    };
}

// ========== UPDATE SUMMARY CARDS ==========
function updateSummaryCards(trades) {
    const totalTrades = trades.length;
    const wins = trades.filter(t => parseFloat(t.profit || 0) > 0);
    const losses = trades.filter(t => parseFloat(t.profit || 0) < 0);
    const totalPnL = trades.reduce((sum, t) => sum + parseFloat(t.profit || 0), 0);
    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    
    const grossProfit = wins.reduce((sum, t) => sum + parseFloat(t.profit || 0), 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + parseFloat(t.profit || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    
    document.getElementById('totalPnL').textContent = formatCurrency(totalPnL);
    document.getElementById('totalPnL').className = `stat-value ${totalPnL >= 0 ? 'win' : 'loss'}`;
    
    document.getElementById('totalWins').textContent = wins.length;
    document.getElementById('totalLosses').textContent = losses.length;
    document.getElementById('winRate').textContent = `${winRate.toFixed(1)}%`;
    document.getElementById('profitFactor').textContent = profitFactor === Infinity ? '∞' : profitFactor.toFixed(2);
    document.getElementById('totalTrades').textContent = totalTrades;
}

// ========== UPDATE WIN/LOSS CARDS ==========
function updateWinLossCards(trades) {
    const wins = trades.filter(t => parseFloat(t.profit || 0) > 0);
    const losses = trades.filter(t => parseFloat(t.profit || 0) < 0);
    
    if (wins.length > 0) {
        const biggestWin = Math.max(...wins.map(t => parseFloat(t.profit || 0)));
        document.getElementById('biggestWin').textContent = formatCurrency(biggestWin);
    } else {
        document.getElementById('biggestWin').textContent = '$0.00';
    }
    
    if (losses.length > 0) {
        const biggestLoss = Math.min(...losses.map(t => parseFloat(t.profit || 0)));
        document.getElementById('biggestLoss').textContent = formatCurrency(biggestLoss);
    } else {
        document.getElementById('biggestLoss').textContent = '$0.00';
    }
    
    if (wins.length > 0) {
        const avgWin = wins.reduce((sum, t) => sum + parseFloat(t.profit || 0), 0) / wins.length;
        document.getElementById('avgWin').textContent = formatCurrency(avgWin);
    } else {
        document.getElementById('avgWin').textContent = '$0.00';
    }
    
    if (losses.length > 0) {
        const avgLoss = losses.reduce((sum, t) => sum + parseFloat(t.profit || 0), 0) / losses.length;
        document.getElementById('avgLoss').textContent = formatCurrency(avgLoss);
    } else {
        document.getElementById('avgLoss').textContent = '$0.00';
    }
}

// ========== UPDATE P&L CHART ==========
function updatePnLChart(trades) {
    const ctx = document.getElementById('pnlChart').getContext('2d');
    
    if (pnlChart) {
        pnlChart.destroy();
    }
    
    if (trades.length === 0) {
        pnlChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['No data'],
                datasets: [{
                    label: 'Cumulative P&L',
                    data: [0],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    borderWidth: 2
                }]
            },
            options: getChartOptions()
        });
        return;
    }
    
    const sortedTrades = [...trades].sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));
    
    let cumulative = 0;
    const labels = [];
    const data = [];
    
    sortedTrades.forEach(trade => {
        cumulative += parseFloat(trade.profit || 0);
        labels.push(formatDateShort(trade.entryDate));
        data.push(cumulative);
    });
    
    const finalPnL = data[data.length - 1];
    const lineColor = finalPnL >= 0 ? '#22c55e' : '#ef4444';
    const fillColor = finalPnL >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    
    pnlChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative P&L',
                data: data,
                borderColor: lineColor,
                backgroundColor: fillColor,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: getChartOptions()
    });
}

// ========== CHART OPTIONS ==========
function getChartOptions() {
    const isDark = !document.body.classList.contains('light');
    const textColor = isDark ? '#9a9da8' : '#4b5563';
    const gridColor = isDark ? '#2a2d37' : '#d1d5db';
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return formatCurrency(context.parsed.y);
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: textColor, maxTicksLimit: 20, font: { size: 11 } },
                grid: { color: gridColor, drawBorder: false }
            },
            y: {
                ticks: { color: textColor, callback: v => formatCurrency(v), font: { size: 11 } },
                grid: { color: gridColor, drawBorder: false }
            }
        }
    };
}