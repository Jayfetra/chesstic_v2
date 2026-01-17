// Analytics Dashboard JavaScript
// Handles form submission, data fetching, and visualization rendering

// Global variables
let charts = {};
let analysisData = null;

// Configure Chart.js defaults - disable datalabels plugin by default
Chart.register(ChartDataLabels);
Chart.defaults.set('plugins.datalabels', {
    display: false  // Disable by default, enable only for specific charts
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

function initializeDashboard() {
    // Set up form handlers
    const form = document.getElementById('analyticsForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Set up date presets
    const presetButtons = document.querySelectorAll('.btn-preset');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', handleDatePreset);
    });

    // PRD v2.2: Add real-time date range validation
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', validateDateRange);
        endDateInput.addEventListener('change', validateDateRange);
    }

    // Auto-detect and set timezone
    detectAndSetTimezone();

    // Set default dates
    setDefaultDates();

    // Show empty state initially
    showEmptyState();
}

// Timezone Detection
function detectAndSetTimezone() {
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const timezoneSelect = document.getElementById('timezone');
        
        // Check if detected timezone is in the list
        const option = Array.from(timezoneSelect.options).find(opt => opt.value === timezone);
        
        if (option) {
            timezoneSelect.value = timezone;
        } else {
            // Add detected timezone as an option
            const newOption = new Option(`${timezone} (Auto-detected)`, timezone);
            timezoneSelect.insertBefore(newOption, timezoneSelect.firstChild);
            timezoneSelect.value = timezone;
        }
    } catch (error) {
        console.error('Error detecting timezone:', error);
    }
}

// Set Default Dates (Last 30 days)
function setDefaultDates() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    document.getElementById('endDate').valueAsDate = today;
    document.getElementById('startDate').valueAsDate = thirtyDaysAgo;
    
    // Set max date to today
    document.getElementById('endDate').max = today.toISOString().split('T')[0];
    document.getElementById('startDate').max = today.toISOString().split('T')[0];
}

// Handle Date Presets
function handleDatePreset(e) {
    const days = parseInt(e.target.dataset.days);
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);
    
    document.getElementById('endDate').valueAsDate = today;
    document.getElementById('startDate').valueAsDate = startDate;
    
    // PRD v2.2: Validate after preset selection
    validateDateRange();
}

// PRD v2.2: Validate date range (30-day maximum)
function validateDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const errorDiv = document.getElementById('dateRangeError');
    const submitBtn = document.getElementById('analyzeBtn');
    
    if (!startDate || !endDate) {
        errorDiv.style.display = 'none';
        submitBtn.disabled = false;
        return true;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // Check if start is after end
    if (start > end) {
        errorDiv.textContent = 'Start date must be before end date';
        errorDiv.style.display = 'block';
        submitBtn.disabled = true;
        return false;
    }
    
    // Check if end date is in the future
    if (end > today) {
        errorDiv.textContent = 'End date cannot be in the future';
        errorDiv.style.display = 'block';
        submitBtn.disabled = true;
        return false;
    }
    
    // Check if range exceeds 30 days
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
        errorDiv.textContent = "Please select a date range of 30 days or less. For best results, use 'Last 7 days' or 'Last 30 days'.";
        errorDiv.style.display = 'block';
        submitBtn.disabled = true;
        return false;
    }
    
    // Valid range
    errorDiv.style.display = 'none';
    submitBtn.disabled = false;
    return true;
}

// Form Submission Handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    let timezone = document.getElementById('timezone').value;
    
    // PRD v2.2: Validate date range before submission
    if (!validateDateRange()) {
        return;
    }
    
    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
        showError('Start date must be before end date');
        return;
    }
    
    // Check date range (max 1 year)
    const daysDiff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
        showError('Date range cannot exceed 1 year');
        return;
    }
    
    // Handle auto-detect timezone
    if (timezone === 'auto') {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    
    // Hide error and empty state
    hideError();
    hideEmptyState();
    hideDashboard();
    
    // Show loading state
    showLoading();
    
    try {
        // Simulate progress updates
        updateProgress(20, 'Fetching game data...');
        
        const response = await fetch('/api/analyze/detailed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                start_date: startDate,
                end_date: endDate,
                timezone: timezone,
                include_mistake_analysis: true,  // Enable Stockfish analysis
                include_ai_advice: true  // Enable AI coaching recommendations
            })
        });
        
        updateProgress(60, 'Processing analytics...');
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze games');
        }
        
        updateProgress(90, 'Rendering visualizations...');
        
        // Store data globally
        analysisData = data;
        
        // Render dashboard
        await renderDashboard(data);
        
        updateProgress(100, 'Complete!');
        
        // Hide loading and show dashboard
        setTimeout(() => {
            hideLoading();
            showDashboard();
            scrollToDashboard();
        }, 500);
        
    } catch (error) {
        hideLoading();
        showError(error.message);
        showEmptyState();
    }
}

// Progress Updates
function updateProgress(percentage, message) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const loadingMessage = document.getElementById('loadingMessage');
    
    if (progressFill) progressFill.style.width = percentage + '%';
    if (progressText) progressText.textContent = percentage + '%';
    if (loadingMessage) loadingMessage.textContent = message;
}

// UI State Management
function showLoading() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('analyzeBtn').disabled = true;
}

function hideLoading() {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('analyzeBtn').disabled = false;
    updateProgress(0, 'Fetching game data...');
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = '❌ ' + message;
    errorDiv.classList.remove('hidden');
    
    // Auto-hide after 10 seconds
    setTimeout(() => hideError(), 10000);
}

function hideError() {
    document.getElementById('error').classList.add('hidden');
}

function showEmptyState() {
    document.getElementById('emptyState').classList.remove('hidden');
}

function hideEmptyState() {
    document.getElementById('emptyState').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('dashboardResults').classList.remove('hidden');
}

function hideDashboard() {
    document.getElementById('dashboardResults').classList.add('hidden');
}

function scrollToDashboard() {
    const dashboard = document.getElementById('dashboardResults');
    if (dashboard) {
        dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Main Dashboard Renderer
async function renderDashboard(data) {
    // Destroy existing charts
    destroyAllCharts();
    
    // Render header
    renderAnalysisHeader(data);
    
    // Render each section
    await renderOverallPerformance(data.sections.overall_performance);
    await renderColorPerformance(data.sections.color_performance);
    await renderEloProgression(data.sections.elo_progression);
    await renderTerminations(data.sections.termination_wins, data.sections.termination_losses);
    await renderOpeningPerformance(data.sections.opening_performance);
    await renderOpponentStrength(data.sections.opponent_strength);
    await renderTimeOfDay(data.sections.time_of_day);
    
    // Milestone 8: Mistake Analysis (if available)
    if (data.sections.mistake_analysis) {
        await renderMistakeAnalysis(data.sections.mistake_analysis);
    }
    
    // Milestone 9: AI Chess Advisor (if available)
    if (data.sections.ai_advice) {
        await renderAIAdvisor(data.sections.ai_advice, data);
    }
}

// Render Analysis Header
function renderAnalysisHeader(data) {
    document.getElementById('displayUsername').textContent = data.username;
    document.getElementById('displayPeriod').textContent = 
        `${formatDate(data.start_date)} - ${formatDate(data.end_date)}`;
    document.getElementById('displayTimezone').textContent = data.timezone;
    document.getElementById('displayTotalGames').textContent = 
        `${data.total_games} games analyzed`;
}

// Section 1: Overall Performance Over Time (Win Rate %)
async function renderOverallPerformance(data) {
    if (!data || !data.daily_stats || data.daily_stats.length === 0) {
        return;
    }
    
    const dates = data.daily_stats.map(d => d.date);
    const wins = data.daily_stats.map(d => d.wins);
    const losses = data.daily_stats.map(d => d.losses);
    const draws = data.daily_stats.map(d => d.draws);
    
    // Calculate win rate percentage for each day
    const winRates = data.daily_stats.map(d => {
        const total = d.wins + d.losses + d.draws;
        return total > 0 ? ((d.wins / total) * 100).toFixed(1) : 0;
    });
    
    const ctx = document.getElementById('overallPerformanceChart');
    charts.overall = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Win Rate %',
                    data: winRates,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: (context) => formatDate(context[0].label),
                        label: (context) => {
                            const index = context.dataIndex;
                            return [
                                `Win Rate: ${context.parsed.y}%`,
                                `Wins: ${wins[index]}`,
                                `Losses: ${losses[index]}`,
                                `Draws: ${draws[index]}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Win Rate %'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

// Section 2: Color Performance (Unified Chart)
async function renderColorPerformance(data) {
    if (!data) return;
    
    // Render summary cards
    if (data.white) {
        renderColorSummary('whiteSummary', data.white, 'white');
    }
    if (data.black) {
        renderColorSummary('blackSummary', data.black, 'black');
    }
    
    // Render unified chart with both colors
    if (data.white && data.black && data.white.daily_stats && data.black.daily_stats) {
        renderUnifiedColorChart(data);
    }
}

function renderColorSummary(elementId, colorData, color) {
    const element = document.getElementById(elementId);
    const winRate = colorData.win_rate || 0;
    const total = (colorData.daily_stats || []).reduce((sum, d) => 
        sum + d.wins + d.losses + d.draws, 0);
    
    const textColor = color === 'black' ? '#ffffff' : '#2c3e50';
    
    element.innerHTML = `
        <div class="color-stat-item">
            <span class="color-stat-label" style="color: ${textColor};">Total Games</span>
            <span class="color-stat-value" style="color: ${textColor};">${total}</span>
        </div>
        <div class="color-stat-item">
            <span class="color-stat-label" style="color: ${textColor};">Win Rate</span>
            <span class="color-stat-value" style="color: ${color === 'white' ? '#27ae60' : '#2ecc71'};">${winRate.toFixed(1)}%</span>
        </div>
    `;
}

function renderUnifiedColorChart(data) {
    // Get all unique dates from both colors
    const whiteDates = data.white.daily_stats.map(d => d.date);
    const blackDates = data.black.daily_stats.map(d => d.date);
    const allDates = [...new Set([...whiteDates, ...blackDates])].sort();
    
    // Calculate win rates for each color by date
    const whiteWinRates = allDates.map(date => {
        const stat = data.white.daily_stats.find(d => d.date === date);
        if (!stat) return null;
        const total = stat.wins + stat.losses + stat.draws;
        return total > 0 ? ((stat.wins / total) * 100).toFixed(1) : 0;
    });
    
    const blackWinRates = allDates.map(date => {
        const stat = data.black.daily_stats.find(d => d.date === date);
        if (!stat) return null;
        const total = stat.wins + stat.losses + stat.draws;
        return total > 0 ? ((stat.wins / total) * 100).toFixed(1) : 0;
    });
    
    // Store detailed data for tooltips
    const whiteDetails = allDates.map(date => {
        const stat = data.white.daily_stats.find(d => d.date === date);
        return stat || { wins: 0, losses: 0, draws: 0 };
    });
    
    const blackDetails = allDates.map(date => {
        const stat = data.black.daily_stats.find(d => d.date === date);
        return stat || { wins: 0, losses: 0, draws: 0 };
    });
    
    const ctx = document.getElementById('colorPerformanceChart');
    charts.colorPerformance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allDates,
            datasets: [
                {
                    label: 'White Win Rate',
                    data: whiteWinRates,
                    borderColor: '#95a5a6',
                    backgroundColor: 'rgba(149, 165, 166, 0.1)',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#ecf0f1',
                    pointBorderColor: '#95a5a6',
                    pointBorderWidth: 2
                },
                {
                    label: 'Black Win Rate',
                    data: blackWinRates,
                    borderColor: '#34495e',
                    backgroundColor: 'rgba(52, 73, 94, 0.1)',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#2c3e50',
                    pointBorderColor: '#34495e',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        title: (context) => formatDate(context[0].label),
                        label: (context) => {
                            const index = context.dataIndex;
                            const isWhite = context.datasetIndex === 0;
                            const details = isWhite ? whiteDetails[index] : blackDetails[index];
                            const color = isWhite ? 'White' : 'Black';
                            
                            return [
                                `${color} Win Rate: ${context.parsed.y}%`,
                                `Wins: ${details.wins}`,
                                `Losses: ${details.losses}`,
                                `Draws: ${details.draws}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Win Rate %'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

// Section 3: Elo Progression
async function renderEloProgression(data) {
    if (!data || !data.data_points || data.data_points.length === 0) {
        return;
    }
    
    const dates = data.data_points.map(d => d.date);
    const ratings = data.data_points.map(d => d.rating);
    
    const ctx = document.getElementById('eloProgressionChart');
    charts.elo = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Elo Rating',
                data: ratings,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.3,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: (context) => formatDate(context[0].label),
                        label: (context) => `Rating: ${context.parsed.y}`
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Rating'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
    
    // Render stats
    const statsElement = document.getElementById('eloStats');
    const change = data.rating_change || 0;
    const changeColor = change >= 0 ? '#27ae60' : '#e74c3c';
    const changeSign = change >= 0 ? '+' : '';
    
    statsElement.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Rating Change</span>
            <span class="stat-number" style="color: ${changeColor};">
                ${changeSign}${change}
            </span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Start Rating</span>
            <span class="stat-number">${ratings[0]}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">End Rating</span>
            <span class="stat-number">${ratings[ratings.length - 1]}</span>
        </div>
    `;
}

// Section 4 & 5: Terminations
async function renderTerminations(winsData, lossesData) {
    if (winsData) {
        renderTerminationChart('terminationWinsChart', winsData, 'wins');
        renderTerminationLegend('terminationWinsLegend', winsData);
    }
    
    if (lossesData) {
        renderTerminationChart('terminationLossesChart', lossesData, 'losses');
        renderTerminationLegend('terminationLossesLegend', lossesData);
    }
}

function renderTerminationChart(canvasId, data, type) {
    const labels = Object.keys(data).map(key => capitalizeFirst(key));
    const values = Object.values(data).map(v => v.count);
    const colors = [
        '#3498db',
        '#e74c3c',
        '#f39c12',
        '#9b59b6',
        '#1abc9c',
        '#34495e'
    ];
    
    const ctx = document.getElementById(canvasId);
    charts[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: (value, context) => {
                        // Show label and count inside segment
                        const label = context.chart.data.labels[context.dataIndex];
                        return `${label}\n${value}`;
                    },
                    // Only show label if segment is large enough
                    display: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const value = context.dataset.data[context.dataIndex];
                        const percentage = (value / total) * 100;
                        return percentage > 5; // Show label if > 5% of total
                    }
                }
            }
        }
    });
}

function renderTerminationLegend(elementId, data) {
    const element = document.getElementById(elementId);
    const colors = ['#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];
    
    let html = '';
    Object.entries(data).forEach(([key, value], index) => {
        html += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${colors[index]};"></div>
                <span>${capitalizeFirst(key)}: ${value.count} (${value.percentage.toFixed(1)}%)</span>
            </div>
        `;
    });
    
    element.innerHTML = html;
}

// Section 6: Opening Performance
async function renderOpeningPerformance(data) {
    if (!data) return;
    
    // PRD v2.2: Render top 10 most common openings (frequency-based)
    if (data.top_common_openings && data.top_common_openings.length > 0) {
        const count = data.top_common_openings.length;
        const title = document.getElementById('commonOpeningsTitle');
        if (title) {
            title.textContent = `📊 Top ${count} Most Common Opening${count > 1 ? 's' : ''}`;
        }
        
        renderCommonOpeningsChart('commonOpeningsChart', data.top_common_openings);
        renderCommonOpeningsTable('commonOpeningsTable', data.top_common_openings);
    }
}

function renderCommonOpeningsChart(canvasId, openings) {
    const labels = openings.map(o => o.name);
    const gamesPlayed = openings.map(o => o.games);
    
    const ctx = document.getElementById(canvasId);
    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Games Played',
                data: gamesPlayed,
                backgroundColor: '#3498db'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Games Played'
                    }
                }
            }
        }
    });
}

function renderCommonOpeningsTable(elementId, openings) {
    const element = document.getElementById(elementId);
    let html = '';
    
    openings.forEach(opening => {
        html += `
            <div class="opening-row">
                <div class="opening-name">${opening.name}</div>
                <div class="opening-games">${opening.games} games</div>
                <div class="opening-stats">
                    <div class="opening-stat">
                        <span class="opening-stat-label">W</span>
                        <span class="opening-stat-value" style="color: #27ae60;">${opening.wins}</span>
                    </div>
                    <div class="opening-stat">
                        <span class="opening-stat-label">L</span>
                        <span class="opening-stat-value" style="color: #e74c3c;">${opening.losses}</span>
                    </div>
                    <div class="opening-stat">
                        <span class="opening-stat-label">D</span>
                        <span class="opening-stat-value" style="color: #95a5a6;">${opening.draws}</span>
                    </div>
                    <div class="opening-stat">
                        <span class="opening-stat-label">Win Rate</span>
                        <span class="opening-stat-value">${opening.win_rate.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    element.innerHTML = html;
}

// Section 7: Opponent Strength
async function renderOpponentStrength(data) {
    if (!data) return;
    
    // Render cards only (no bar chart per Milestone 7)
    if (data.lower_rated) renderStrengthCard('lowerRatedCard', data.lower_rated, 'lower');
    if (data.similar_rated) renderStrengthCard('similarRatedCard', data.similar_rated, 'similar');
    if (data.higher_rated) renderStrengthCard('higherRatedCard', data.higher_rated, 'higher');
}

function renderStrengthCard(elementId, data, type) {
    const card = document.getElementById(elementId);
    const statsDiv = card.querySelector('.strength-stats');
    
    const winRate = data.win_rate || 0;
    const color = winRate >= 50 ? '#27ae60' : '#e74c3c';
    
    statsDiv.innerHTML = `
        <div class="strength-win-rate" style="color: ${color};">
            ${winRate.toFixed(1)}%
        </div>
        <div class="strength-stat-row">
            <span>Games:</span>
            <strong>${data.games}</strong>
        </div>
        <div class="strength-stat-row">
            <span>Wins:</span>
            <strong style="color: #27ae60;">${data.wins}</strong>
        </div>
        <div class="strength-stat-row">
            <span>Losses:</span>
            <strong style="color: #e74c3c;">${data.losses}</strong>
        </div>
        <div class="strength-stat-row">
            <span>Draws:</span>
            <strong style="color: #95a5a6;">${data.draws}</strong>
        </div>
    `;
}

// Note: Bar chart removed for Section 7 per Milestone 7 requirements
// Only card-based display is used

// Section 8: Time of Day Performance
async function renderTimeOfDay(data) {
    if (!data) return;
    
    // PRD v2.1: Display timezone in Section 8 header
    const timezoneSelect = document.getElementById('timezone');
    let timezone = timezoneSelect ? timezoneSelect.value : 'auto';
    
    if (timezone === 'auto') {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    
    // Display timezone abbreviation
    const timezoneDisplay = document.getElementById('timezoneDisplay');
    if (timezoneDisplay) {
        // Get timezone abbreviation (e.g., EST, PST, GMT+8)
        const date = new Date();
        const shortTz = date.toLocaleString('en-US', { 
            timeZone: timezone, 
            timeZoneName: 'short' 
        }).split(' ').pop();
        
        timezoneDisplay.textContent = `(${shortTz})`;
    }
    
    // Render cards only (no bar chart per Milestone 7)
    if (data.morning) renderTimeCard('morningCard', data.morning);
    if (data.afternoon) renderTimeCard('afternoonCard', data.afternoon);
    if (data.night) renderTimeCard('nightCard', data.night);
}

function renderTimeCard(elementId, data) {
    const card = document.getElementById(elementId);
    const statsDiv = card.querySelector('.time-stats');
    
    const winRate = data.win_rate || 0;
    const color = winRate >= 50 ? '#27ae60' : '#e74c3c';
    
    statsDiv.innerHTML = `
        <div class="time-win-rate" style="color: ${color};">
            ${winRate.toFixed(1)}%
        </div>
        <div class="time-stat-row">
            <span>Games:</span>
            <strong>${data.games}</strong>
        </div>
        <div class="time-stat-row">
            <span>Wins:</span>
            <strong style="color: #27ae60;">${data.wins}</strong>
        </div>
        <div class="time-stat-row">
            <span>Losses:</span>
            <strong style="color: #e74c3c;">${data.losses}</strong>
        </div>
        <div class="time-stat-row">
            <span>Draws:</span>
            <strong style="color: #95a5a6;">${data.draws}</strong>
        </div>
    `;
}

// Note: Bar chart removed for Section 8 per Milestone 7 requirements
// Only card-based display is used

// ==================== MILESTONE 8: MISTAKE ANALYSIS RENDERING ====================

async function renderMistakeAnalysis(data) {
    const section = document.getElementById('mistakeAnalysisSection');
    if (!section) return;
    
    // Show section
    section.style.display = 'block';
    
    // Render summary cards
    renderMistakeSummary(data);
    
    // Render mistake table
    renderMistakeTable(data);
}

function renderMistakeSummary(data) {
    // Weakest stage
    const weakestStage = document.getElementById('weakestStage');
    if (weakestStage) {
        weakestStage.textContent = data.weakest_stage || 'N/A';
    }
    
    // Most common error
    const mostCommonError = document.getElementById('mostCommonError');
    if (mostCommonError) {
        const errorText = identifyMostCommonError(data);
        mostCommonError.textContent = errorText;
    }
    
    // Total mistakes
    const totalMistakes = document.getElementById('totalMistakes');
    if (totalMistakes) {
        const total = (data.early?.inaccuracies || 0) + (data.early?.mistakes || 0) + (data.early?.blunders || 0) +
                      (data.middle?.inaccuracies || 0) + (data.middle?.mistakes || 0) + (data.middle?.blunders || 0) +
                      (data.endgame?.inaccuracies || 0) + (data.endgame?.mistakes || 0) + (data.endgame?.blunders || 0);
        totalMistakes.textContent = total;
    }
}

function identifyMostCommonError(data) {
    let maxCount = 0;
    let maxError = 'None detected';
    
    const stages = [
        { name: 'early', display: 'early game' },
        { name: 'middle', display: 'middlegame' },
        { name: 'endgame', display: 'endgame' }
    ];
    
    const errorTypes = [
        { key: 'blunders', display: 'blunders' },
        { key: 'mistakes', display: 'mistakes' },
        { key: 'inaccuracies', display: 'inaccuracies' }
    ];
    
    stages.forEach(stage => {
        errorTypes.forEach(error => {
            const count = data[stage.name]?.[error.key] || 0;
            if (count > maxCount) {
                maxCount = count;
                maxError = `${error.display} in ${stage.display}`;
            }
        });
    });
    
    return maxError;
}

function renderMistakeTable(data) {
    const tbody = document.getElementById('mistakeTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const stages = [
        { key: 'early', display: 'Early (1-7)', class: 'stage-early' },
        { key: 'middle', display: 'Middlegame (8-20)', class: 'stage-middle' },
        { key: 'endgame', display: 'Endgame (21+)', class: 'stage-endgame' }
    ];
    
    stages.forEach(stage => {
        const stageData = data[stage.key] || {};
        const row = document.createElement('tr');
        
        // Game Stage
        const stageCell = document.createElement('td');
        stageCell.innerHTML = `<span class="stage-name ${stage.class}">${stage.display}</span>`;
        row.appendChild(stageCell);
        
        // Total Moves
        const movesCell = document.createElement('td');
        movesCell.textContent = stageData.total_moves || 0;
        row.appendChild(movesCell);
        
        // Inaccuracies
        const inaccCell = document.createElement('td');
        inaccCell.innerHTML = getMistakeCountHTML(stageData.inaccuracies || 0);
        row.appendChild(inaccCell);
        
        // Mistakes
        const mistakeCell = document.createElement('td');
        mistakeCell.innerHTML = getMistakeCountHTML(stageData.mistakes || 0);
        row.appendChild(mistakeCell);
        
        // Blunders
        const blunderCell = document.createElement('td');
        blunderCell.innerHTML = getMistakeCountHTML(stageData.blunders || 0, true);
        row.appendChild(blunderCell);
        
        // Missed Opportunities
        const missedCell = document.createElement('td');
        missedCell.innerHTML = getMistakeCountHTML(stageData.missed_opps || 0);
        row.appendChild(missedCell);
        
        // Avg CP Loss
        const cpLossCell = document.createElement('td');
        const cpLoss = Math.abs(stageData.avg_cp_loss || 0);
        cpLossCell.innerHTML = getCPLossHTML(cpLoss);
        row.appendChild(cpLossCell);
        
        // Critical Mistake
        const criticalCell = document.createElement('td');
        const worstGame = stageData.worst_game;
        if (worstGame && worstGame.game_url) {
            criticalCell.innerHTML = `<a href="${worstGame.game_url}" target="_blank" class="critical-mistake-link">Move ${worstGame.move_number} (-${worstGame.cp_loss}cp)</a>`;
        } else {
            criticalCell.textContent = 'N/A';
        }
        row.appendChild(criticalCell);
        
        tbody.appendChild(row);
    });
}

function getMistakeCountHTML(count, isBlunder = false) {
    if (count === 0) {
        return `<span class="mistake-count mistake-count-low">${count}</span>`;
    } else if (isBlunder || count >= 10) {
        return `<span class="mistake-count mistake-count-high">${count}</span>`;
    } else if (count >= 5) {
        return `<span class="mistake-count mistake-count-medium">${count}</span>`;
    } else {
        return `<span class="mistake-count">${count}</span>`;
    }
}

function getCPLossHTML(cpLoss) {
    let className = 'cp-loss';
    if (cpLoss >= 80) {
        className += ' cp-loss-high';
    } else if (cpLoss >= 50) {
        className += ' cp-loss-medium';
    } else {
        className += ' cp-loss-low';
    }
    
    return `<span class="${className}">-${cpLoss.toFixed(1)}</span>`;
}

// ==================== MILESTONE 9: AI ADVISOR RENDERING ====================

async function renderAIAdvisor(aiData, fullData) {
    const section = document.getElementById('aiAdvisorSection');
    if (!section) return;
    
    // Show section
    section.style.display = 'block';
    
    // Update context description
    const contextElement = document.getElementById('aiAdvisorContext');
    if (contextElement && fullData.total_games) {
        contextElement.textContent = `Based on your ${fullData.total_games} games from ${fullData.start_date} to ${fullData.end_date}`;
    }
    
    // Hide loading, show content
    const loading = document.getElementById('aiLoading');
    const content = document.getElementById('aiContent');
    const error = document.getElementById('aiError');
    
    if (loading) loading.style.display = 'none';
    if (error) error.style.display = 'none';
    
    if (content) {
        content.style.display = 'block';
        
        // Render suggestions
        renderAISuggestions(aiData.section_suggestions || []);
        
        // Render overall recommendation
        renderAIOverall(aiData.overall_recommendation || '');
        
        // Show token/cost info if available (development mode)
        if (aiData.tokens_used) {
            renderAICostInfo(aiData.tokens_used, aiData.estimated_cost);
        }
        
        // Set up regenerate button
        setupRegenerateButton();
    }
}

function renderAISuggestions(suggestions) {
    const list = document.getElementById('aiSuggestionsList');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (!suggestions || suggestions.length === 0) {
        list.innerHTML = '<li>No specific suggestions available at this time.</li>';
        return;
    }
    
    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        
        // Handle both structured format (new) and plain string format (fallback)
        if (typeof suggestion === 'object' && suggestion.advice) {
            // Structured format: {section_number, section_name, advice}
            const sectionLabel = `<strong>Section ${suggestion.section_number} (${suggestion.section_name}):</strong> `;
            li.innerHTML = sectionLabel + suggestion.advice;
        } else {
            // Plain string format (legacy)
            li.textContent = suggestion;
        }
        
        list.appendChild(li);
    });
}

function renderAIOverall(recommendation) {
    const element = document.getElementById('aiOverallRecommendation');
    if (!element) return;
    
    element.textContent = recommendation || 'Continue analyzing your games and focus on consistent improvement.';
}

function renderAICostInfo(tokens, cost) {
    const costInfo = document.getElementById('aiCostInfo');
    if (!costInfo) return;
    
    // Only show in development mode (you can add a config flag)
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDev) {
        document.getElementById('tokensUsed').textContent = tokens;
        document.getElementById('estimatedCost').textContent = cost.toFixed(4);
        costInfo.style.display = 'block';
    }
}

function setupRegenerateButton() {
    const btn = document.getElementById('btnRegenerateAdvice');
    if (!btn) return;
    
    // Show button
    btn.style.display = 'block';
    
    // Remove existing listeners
    btn.replaceWith(btn.cloneNode(true));
    const newBtn = document.getElementById('btnRegenerateAdvice');
    
    // Add click handler
    newBtn.addEventListener('click', async () => {
        // Show loading state
        const content = document.getElementById('aiContent');
        const loading = document.getElementById('aiLoading');
        
        if (content) content.style.display = 'none';
        if (loading) loading.style.display = 'block';
        
        // Re-fetch analysis
        const username = document.getElementById('username').value.trim();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        let timezone = document.getElementById('timezone').value;
        
        if (timezone === 'auto') {
            timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        
        try {
            const response = await fetch('/api/analyze/detailed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    start_date: startDate,
                    end_date: endDate,
                    timezone,
                    include_mistake_analysis: true,
                    include_ai_advice: true
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                // Re-render AI advisor section only
                await renderAIAdvisor(data.sections.ai_advice, data);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
            
        } catch (error) {
            console.error('Error regenerating AI advice:', error);
            showAIError();
        }
    });
}

function showAIError() {
    const loading = document.getElementById('aiLoading');
    const content = document.getElementById('aiContent');
    const error = document.getElementById('aiError');
    
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'none';
    if (error) error.style.display = 'block';
}

// Utility Functions
function destroyAllCharts() {
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    charts = {};
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
