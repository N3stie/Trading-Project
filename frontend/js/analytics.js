// ========== ANALYTICS.JS - Analytics Page Logic ==========

let winRateBySessionChart = null;
let pnlByCategoryChart = null;
let pnlByAccountChart = null;
let winRateOverTimeChart = null;

// ========== INIT ANALYTICS ==========
function initAnalytics() {
    document.getElementById('analyticsSessionFilter').addEventListener('change', refreshAnalytics);
    document.getElementById('analyticsDateFrom').addEventListener('change', refreshAnalytics);
    document.getElementById('analyticsDateTo').addEventListener('change', refreshAnalytics);
    document.getElementById('analyticsInstrumentFilter').addEventListener('change', refreshAnalytics);
    document.getElementById('analyticsAccountFilter').addEventListener('change', refreshAnalytics);
}

// ========== REFRESH ANALYTICS ==========
async function refreshAnalytics() {
    const filters = getAnalyticsFilters();
    const trades = await getFilteredTrades(filters);
    const accounts = await getAccounts();
    const sessions = await getSessions();
    
    updateWinRateBySession(trades, sessions);
    updatePnLByCategory(trades);
    updatePnLByAccount(trades, accounts);
    updateWinRateOverTime(trades);
}

// ========== GET FILTERS ==========
function getAnalyticsFilters() {
    return {
        session: document.getElementById('analyticsSessionFilter').value,
        dateFrom: document.getElementById('analyticsDateFrom').value,
        dateTo: document.getElementById('analyticsDateTo').value,
        category: document.getElementById('analyticsInstrumentFilter').value,
        account: document.getElementById('analyticsAccountFilter').value
    };
}

// ========== WIN RATE BY SESSION ==========
function updateWinRateBySession(trades, sessions) {
    const ctx = document.getElementById('winRateBySessionChart').getContext('2d');
    if (winRateBySessionChart) winRateBySessionChart.destroy();
    
    const sessionData = {};
    sessions.forEach(session => {
        const sessionTrades = trades.filter(t => t.session === session);
        const wins = sessionTrades.filter(t => parseFloat(t.profit || 0) > 0).length;
        const total = sessionTrades.length;
        sessionData[session] = {
            winRate: total > 0 ? (wins / total) * 100 : 0,
            total: total
        };
    });
    
    const labels = Object.keys(sessionData);
    const data = labels.map(label => sessionData[label].winRate);
    const totals = labels.map(label => sessionData[label].total);
    
    winRateBySessionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Win Rate %',
                data: data,
                backgroundColor: data.map(rate => rate >= 50 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                borderColor: data.map(rate => rate >= 50 ? '#22c55e' : '#ef4444'),
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            ...getAnalyticsChartOptions(),
            plugins: {
                ...getAnalyticsChartOptions().plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return [
                                `Win Rate: ${context.parsed.y.toFixed(1)}%`,
                                `Trades: ${totals[context.dataIndex]}`
                            ];
                        }
                    }
                }
            },
            scales: {
                ...getAnalyticsChartOptions().scales,
                y: {
                    ...getAnalyticsChartOptions().scales.y,
                    max: 100,
                    ticks: {
                        ...getAnalyticsChartOptions().scales.y.ticks,
                        callback: function(value) { return value + '%'; }
                    }
                }
            }
        }
    });
}

// ========== P&L BY CATEGORY ==========
function updatePnLByCategory(trades) {
    const ctx = document.getElementById('pnlByCategoryChart').getContext('2d');
    if (pnlByCategoryChart) pnlByCategoryChart.destroy();
    
    const categories = getCategories();
    const categoryPnL = {};
    
    categories.forEach(cat => {
        const catTrades = trades.filter(t => t.category === cat);
        const totalPnL = catTrades.reduce((sum, t) => sum + parseFloat(t.profit || 0), 0);
        categoryPnL[cat] = totalPnL;
    });
    
    const labels = Object.keys(categoryPnL);
    const data = labels.map(label => categoryPnL[label]);
    
    pnlByCategoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total P&L',
                data: data,
                backgroundColor: data.map(pnl => pnl >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                borderColor: data.map(pnl => pnl >= 0 ? '#22c55e' : '#ef4444'),
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            ...getAnalyticsChartOptions(),
            plugins: {
                ...getAnalyticsChartOptions().plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                ...getAnalyticsChartOptions().scales,
                y: {
                    ...getAnalyticsChartOptions().scales.y,
                    ticks: {
                        ...getAnalyticsChartOptions().scales.y.ticks,
                        callback: function(value) { return formatCurrency(value); }
                    }
                }
            }
        }
    });
}

// ========== P&L BY ACCOUNT ==========
function updatePnLByAccount(trades, accounts) {
    const ctx = document.getElementById('pnlByAccountChart').getContext('2d');
    if (pnlByAccountChart) pnlByAccountChart.destroy();
    
    const accountPnL = {};
    accounts.forEach(acc => {
        const accTrades = trades.filter(t => t.account === acc);
        const totalPnL = accTrades.reduce((sum, t) => sum + parseFloat(t.profit || 0), 0);
        accountPnL[acc] = totalPnL;
    });
    
    const labels = Object.keys(accountPnL);
    const data = labels.map(label => accountPnL[label]);
    
    pnlByAccountChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data.map(Math.abs),
                backgroundColor: [
                    '#3b82f6',
                    '#22c55e',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6',
                    '#06b6d4',
                    '#ec4899'
                ],
                borderColor: 'var(--bg-secondary)',
                borderWidth: 2
            }]
        },
        options: {
            ...getAnalyticsChartOptions(),
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getChartTextColor(),
                        padding: 16,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = data[context.dataIndex];
                            return `${context.label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });
}

// ========== WIN RATE OVER TIME (MONTHLY) ==========
function updateWinRateOverTime(trades) {
    const ctx = document.getElementById('winRateOverTimeChart').getContext('2d');
    if (winRateOverTimeChart) winRateOverTimeChart.destroy();
    
    if (trades.length === 0) {
        winRateOverTimeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['No data'],
                datasets: [{
                    label: 'Win Rate %',
                    data: [0],
                    borderColor: '#3b82f6',
                    tension: 0.3,
                    pointRadius: 4
                }]
            },
            options: getAnalyticsChartOptions()
        });
        return;
    }
    
    const monthlyData = {};
    trades.forEach(trade => {
        const date = new Date(trade.entryDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                label: monthLabel,
                wins: 0,
                total: 0,
                date: date
            };
        }
        
        monthlyData[monthKey].total++;
        if (parseFloat(trade.profit || 0) > 0) {
            monthlyData[monthKey].wins++;
        }
    });
    
    const sortedMonths = Object.values(monthlyData).sort((a, b) => a.date - b.date);
    const labels = sortedMonths.map(m => m.label);
    const winRates = sortedMonths.map(m => m.total > 0 ? (m.wins / m.total) * 100 : 0);
    const totals = sortedMonths.map(m => m.total);
    
    winRateOverTimeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Win Rate %',
                data: winRates,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#3b82f6',
                borderWidth: 2
            }]
        },
        options: {
            ...getAnalyticsChartOptions(),
            plugins: {
                ...getAnalyticsChartOptions().plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return [
                                `Win Rate: ${context.parsed.y.toFixed(1)}%`,
                                `Trades: ${totals[context.dataIndex]}`
                            ];
                        }
                    }
                }
            },
            scales: {
                ...getAnalyticsChartOptions().scales,
                y: {
                    ...getAnalyticsChartOptions().scales.y,
                    max: 100,
                    ticks: {
                        ...getAnalyticsChartOptions().scales.y.ticks,
                        callback: function(value) { return value + '%'; }
                    }
                }
            }
        }
    });
}

// ========== ANALYTICS CHART OPTIONS ==========
function getAnalyticsChartOptions() {
    const textColor = getChartTextColor();
    const gridColor = getChartGridColor();
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                ticks: { color: textColor, font: { size: 11 } },
                grid: { color: gridColor, drawBorder: false }
            },
            y: {
                ticks: { color: textColor, font: { size: 11 } },
                grid: { color: gridColor, drawBorder: false }
            }
        }
    };
}

// ========== CHART COLOR HELPERS ==========
function getChartTextColor() {
    return document.body.classList.contains('light') ? '#4b5563' : '#9a9da8';
}

function getChartGridColor() {
    return document.body.classList.contains('light') ? '#d1d5db' : '#2a2d37';
}