/**
 * Real-Time Test Monitoring Dashboard
 * Provides live insights into test execution
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const EventEmitter = require('events');

class TestMonitoringDashboard extends EventEmitter {
  constructor(options = {}) {
    super();
    this.port = options.port || 3001;
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIO(this.server);
    
    this.metrics = {
      startTime: Date.now(),
      totalTests: 0,
      completedTests: 0,
      passedTests: 0,
      failedTests: 0,
      activeAgents: 0,
      testsByFirm: new Map(),
      testsByCategory: new Map(),
      recentTests: [],
      errors: [],
      performanceData: []
    };

    this.setupRoutes();
    this.setupSocketHandlers();
  }

  setupRoutes() {
    // Serve static files
    this.app.use(express.static(path.join(__dirname, 'dashboard-public')));

    // API endpoints
    this.app.get('/api/metrics', (req, res) => {
      res.json(this.getMetricsSummary());
    });

    this.app.get('/api/tests/recent', (req, res) => {
      res.json(this.metrics.recentTests.slice(-50));
    });

    this.app.get('/api/agents', (req, res) => {
      res.json({
        active: this.metrics.activeAgents,
        performance: this.getAgentPerformance()
      });
    });

    // Dashboard HTML
    this.app.get('/dashboard', (req, res) => {
      res.send(this.getDashboardHTML());
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', uptime: Date.now() - this.metrics.startTime });
    });
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Dashboard client connected');
      
      // Send initial data
      socket.emit('metrics', this.getMetricsSummary());
      
      // Handle client requests
      socket.on('get-recent-tests', () => {
        socket.emit('recent-tests', this.metrics.recentTests.slice(-50));
      });
      
      socket.on('get-errors', () => {
        socket.emit('errors', this.metrics.errors);
      });
      
      socket.on('disconnect', () => {
        console.log('Dashboard client disconnected');
      });
    });
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`📊 Monitoring Dashboard running at http://localhost:${this.port}/dashboard`);
    });
  }

  // Update methods called by test orchestrator
  updateMetrics(data) {
    switch (data.type) {
      case 'test-started':
        this.metrics.totalTests = data.totalTests;
        this.metrics.activeAgents = data.activeAgents;
        this.broadcastUpdate('test-started', data);
        break;
        
      case 'test-completed':
        this.handleTestCompleted(data);
        break;
        
      case 'agent-status':
        this.updateAgentStatus(data);
        break;
        
      case 'error':
        this.handleError(data);
        break;
    }
  }

  handleTestCompleted(data) {
    this.metrics.completedTests++;
    
    if (data.success) {
      this.metrics.passedTests++;
    } else {
      this.metrics.failedTests++;
    }
    
    // Update firm metrics
    const firm = data.firm || 'unknown';
    if (!this.metrics.testsByFirm.has(firm)) {
      this.metrics.testsByFirm.set(firm, { total: 0, passed: 0, failed: 0 });
    }
    const firmMetrics = this.metrics.testsByFirm.get(firm);
    firmMetrics.total++;
    if (data.success) firmMetrics.passed++;
    else firmMetrics.failed++;
    
    // Update category metrics
    const category = data.category || 'other';
    if (!this.metrics.testsByCategory.has(category)) {
      this.metrics.testsByCategory.set(category, { total: 0, passed: 0, failed: 0 });
    }
    const categoryMetrics = this.metrics.testsByCategory.get(category);
    categoryMetrics.total++;
    if (data.success) categoryMetrics.passed++;
    else categoryMetrics.failed++;
    
    // Add to recent tests
    this.metrics.recentTests.push({
      ...data,
      timestamp: Date.now()
    });
    
    // Keep only last 100 tests
    if (this.metrics.recentTests.length > 100) {
      this.metrics.recentTests.shift();
    }
    
    // Track performance
    if (data.responseTime) {
      this.metrics.performanceData.push({
        time: Date.now(),
        responseTime: data.responseTime,
        firm: data.firm
      });
    }
    
    // Broadcast update
    this.broadcastUpdate('test-completed', data);
    this.broadcastUpdate('metrics', this.getMetricsSummary());
  }

  handleError(data) {
    this.metrics.errors.push({
      ...data,
      timestamp: Date.now()
    });
    
    // Keep only last 50 errors
    if (this.metrics.errors.length > 50) {
      this.metrics.errors.shift();
    }
    
    this.broadcastUpdate('error', data);
  }

  updateAgentStatus(data) {
    this.metrics.activeAgents = data.activeCount || 0;
    this.broadcastUpdate('agent-status', data);
  }

  broadcastUpdate(event, data) {
    this.io.emit(event, data);
  }

  getMetricsSummary() {
    const elapsed = Date.now() - this.metrics.startTime;
    const progress = this.metrics.totalTests > 0 
      ? (this.metrics.completedTests / this.metrics.totalTests * 100).toFixed(1)
      : 0;
    
    const successRate = this.metrics.completedTests > 0
      ? (this.metrics.passedTests / this.metrics.completedTests * 100).toFixed(1)
      : 0;
    
    const testsPerSecond = elapsed > 0
      ? (this.metrics.completedTests / (elapsed / 1000)).toFixed(2)
      : 0;
    
    return {
      elapsed,
      progress,
      successRate,
      testsPerSecond,
      totalTests: this.metrics.totalTests,
      completedTests: this.metrics.completedTests,
      passedTests: this.metrics.passedTests,
      failedTests: this.metrics.failedTests,
      activeAgents: this.metrics.activeAgents,
      testsByFirm: Object.fromEntries(this.metrics.testsByFirm),
      testsByCategory: Object.fromEntries(this.metrics.testsByCategory),
      errorCount: this.metrics.errors.length
    };
  }

  getAgentPerformance() {
    // Calculate agent performance metrics
    const agentStats = {};
    
    this.metrics.recentTests.forEach(test => {
      if (test.agentId !== undefined) {
        if (!agentStats[test.agentId]) {
          agentStats[test.agentId] = {
            testsCompleted: 0,
            avgResponseTime: 0,
            successRate: 0,
            passed: 0
          };
        }
        
        const stats = agentStats[test.agentId];
        stats.testsCompleted++;
        if (test.success) stats.passed++;
        if (test.responseTime) {
          stats.avgResponseTime += test.responseTime;
        }
      }
    });
    
    // Calculate averages
    Object.values(agentStats).forEach(stats => {
      if (stats.testsCompleted > 0) {
        stats.avgResponseTime = Math.round(stats.avgResponseTime / stats.testsCompleted);
        stats.successRate = ((stats.passed / stats.testsCompleted) * 100).toFixed(1);
      }
    });
    
    return agentStats;
  }

  getDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Monitoring Dashboard</title>
    <script src="/socket.io/socket.io.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f1419;
            color: #e7e9ea;
            padding: 20px;
        }
        
        .dashboard {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        h1 {
            margin-bottom: 30px;
            color: #1d9bf0;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: #16181c;
            border: 1px solid #2f3336;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }
        
        .metric-value {
            font-size: 36px;
            font-weight: bold;
            color: #1d9bf0;
            margin: 10px 0;
        }
        
        .metric-label {
            color: #71767b;
            font-size: 14px;
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #2f3336;
            border-radius: 10px;
            overflow: hidden;
            margin: 20px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #1d9bf0, #1da1f2);
            transition: width 0.3s ease;
        }
        
        .charts-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .chart-container {
            background: #16181c;
            border: 1px solid #2f3336;
            border-radius: 12px;
            padding: 20px;
            height: 300px;
        }
        
        .recent-tests {
            background: #16181c;
            border: 1px solid #2f3336;
            border-radius: 12px;
            padding: 20px;
        }
        
        .test-item {
            padding: 10px;
            border-bottom: 1px solid #2f3336;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .test-item:last-child {
            border-bottom: none;
        }
        
        .success {
            color: #00ba7c;
        }
        
        .failed {
            color: #f91880;
        }
        
        .agent-status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 10px;
        }
        
        .agent-active {
            background: #1d9bf0;
            color: white;
        }
        
        .agent-idle {
            background: #71767b;
            color: white;
        }
        
        .error-alert {
            background: #f91880;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }
        
        canvas {
            width: 100% !important;
            height: 250px !important;
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <h1>🚀 Multi-Agent Test Monitoring Dashboard</h1>
        
        <div class="error-alert" id="errorAlert"></div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Progress</div>
                <div class="metric-value" id="progress">0%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Success Rate</div>
                <div class="metric-value" id="successRate">0%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Tests/Second</div>
                <div class="metric-value" id="testsPerSecond">0</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Active Agents</div>
                <div class="metric-value" id="activeAgents">0</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Total Tests</div>
                <div class="metric-value" id="totalTests">0</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Failed Tests</div>
                <div class="metric-value" id="failedTests" style="color: #f91880;">0</div>
            </div>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" id="progressBar" style="width: 0%"></div>
        </div>
        
        <div class="charts-section">
            <div class="chart-container">
                <h3>Tests by Firm</h3>
                <canvas id="firmChart"></canvas>
            </div>
            <div class="chart-container">
                <h3>Response Times</h3>
                <canvas id="performanceChart"></canvas>
            </div>
        </div>
        
        <div class="recent-tests">
            <h3>Recent Tests</h3>
            <div id="recentTestsList"></div>
        </div>
    </div>
    
    <script>
        const socket = io();
        let firmChartData = {};
        let performanceData = [];
        
        // Update metrics
        socket.on('metrics', (data) => {
            document.getElementById('progress').textContent = data.progress + '%';
            document.getElementById('progressBar').style.width = data.progress + '%';
            document.getElementById('successRate').textContent = data.successRate + '%';
            document.getElementById('testsPerSecond').textContent = data.testsPerSecond;
            document.getElementById('activeAgents').textContent = data.activeAgents;
            document.getElementById('totalTests').textContent = data.totalTests;
            document.getElementById('failedTests').textContent = data.failedTests;
            
            // Update firm chart data
            firmChartData = data.testsByFirm;
            updateFirmChart();
        });
        
        // Handle test completion
        socket.on('test-completed', (data) => {
            addRecentTest(data);
        });
        
        // Handle errors
        socket.on('error', (data) => {
            showError(data.message || 'Test error occurred');
        });
        
        function addRecentTest(test) {
            const testsList = document.getElementById('recentTestsList');
            const testItem = document.createElement('div');
            testItem.className = 'test-item';
            
            const statusClass = test.success ? 'success' : 'failed';
            const statusIcon = test.success ? '✓' : '✗';
            
            testItem.innerHTML = \`
                <div>
                    <span class="\${statusClass}">\${statusIcon}</span>
                    <span>\${test.question || 'Test'}</span>
                    <span class="agent-status agent-active">Agent \${test.agentId}</span>
                </div>
                <div>
                    <span style="color: #71767b;">\${test.responseTime}ms</span>
                </div>
            \`;
            
            testsList.insertBefore(testItem, testsList.firstChild);
            
            // Keep only last 20 items
            while (testsList.children.length > 20) {
                testsList.removeChild(testsList.lastChild);
            }
        }
        
        function showError(message) {
            const errorAlert = document.getElementById('errorAlert');
            errorAlert.textContent = '⚠️ ' + message;
            errorAlert.style.display = 'block';
            
            setTimeout(() => {
                errorAlert.style.display = 'none';
            }, 5000);
        }
        
        function updateFirmChart() {
            // Simple text-based chart for now
            const canvas = document.getElementById('firmChart');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw simple bars
            ctx.fillStyle = '#1d9bf0';
            ctx.font = '12px sans-serif';
            
            let y = 30;
            Object.entries(firmChartData).forEach(([firm, data]) => {
                const successRate = data.total > 0 ? (data.passed / data.total * 100) : 0;
                const barWidth = (successRate / 100) * (canvas.width - 100);
                
                ctx.fillText(firm, 10, y);
                ctx.fillRect(80, y - 12, barWidth, 15);
                ctx.fillText(successRate.toFixed(1) + '%', 85 + barWidth, y);
                
                y += 30;
            });
        }
        
        // Request initial data
        socket.emit('get-recent-tests');
    </script>
</body>
</html>
    `;
  }
}

// Export for use in orchestrator
module.exports = TestMonitoringDashboard;

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const port = args.includes('--port') ? parseInt(args[args.indexOf('--port') + 1]) : 3001;
  
  const dashboard = new TestMonitoringDashboard({ port });
  dashboard.start();
  
  console.log('📊 Dashboard ready for incoming test data');
  console.log('🔗 Connect your test orchestrator to send metrics');
}