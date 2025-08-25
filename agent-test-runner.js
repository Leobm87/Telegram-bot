/**
 * Focused Agent Test Runner
 * Run targeted tests with specialized agents
 */

require('dotenv').config();
const readline = require('readline');
const chalk = require('chalk');
const { BotCore } = require('./bot-core');
const { generateFirmTests, validationRules } = require('./test-questions');

class AgentTestRunner {
  constructor(options = {}) {
    this.options = {
      focus: options.focus || 'all',
      firms: options.firms ? options.firms.split(',') : ['apex', 'bulenox', 'takeprofit', 'myfundedfutures', 'alpha', 'tradeify', 'vision'],
      agents: parseInt(options.agents) || 5,
      verbose: options.verbose || false,
      ...options
    };

    this.bot = null;
    this.agents = [];
    this.results = [];
    this.startTime = Date.now();
  }

  async initialize() {
    console.log(chalk.cyan('🚀 Initializing Focused Agent Test Runner...'));
    console.log(chalk.gray(`Focus: ${this.options.focus}`));
    console.log(chalk.gray(`Firms: ${this.options.firms.join(', ')}`));
    console.log(chalk.gray(`Agents: ${this.options.agents}`));

    // Initialize bot
    this.bot = new BotCore();
    await this.bot.initialize();

    // Create specialized agents
    this.createAgents();

    return this;
  }

  createAgents() {
    const agentTypes = {
      pricing: PricingTestAgent,
      quality: QualityAssuranceAgent,
      performance: PerformanceTestAgent,
      edge: EdgeCaseTestAgent,
      firm: FirmSpecificTestAgent
    };

    for (let i = 0; i < this.options.agents; i++) {
      const type = this.options.focus === 'all' 
        ? Object.keys(agentTypes)[i % Object.keys(agentTypes).length]
        : this.options.focus;

      const AgentClass = agentTypes[type] || agentTypes.firm;
      const agent = new AgentClass({
        id: i,
        firms: this.options.firms,
        bot: this.bot
      });

      this.agents.push(agent);
    }

    console.log(chalk.green(`✅ Created ${this.agents.length} specialized agents`));
  }

  async run() {
    console.log(chalk.cyan('\n🎯 Starting focused test execution...\n'));

    // Generate test cases based on focus
    const testCases = this.generateTestCases();
    console.log(chalk.gray(`📋 Generated ${testCases.length} test cases\n`));

    // Distribute tests among agents
    const testsPerAgent = Math.ceil(testCases.length / this.agents.length);
    const agentPromises = [];

    this.agents.forEach((agent, index) => {
      const start = index * testsPerAgent;
      const end = Math.min(start + testsPerAgent, testCases.length);
      const agentTests = testCases.slice(start, end);

      if (agentTests.length > 0) {
        agentPromises.push(this.runAgentTests(agent, agentTests));
      }
    });

    // Execute all agents in parallel
    const agentResults = await Promise.all(agentPromises);
    
    // Aggregate results
    agentResults.forEach(results => {
      this.results.push(...results);
    });

    // Generate report
    return this.generateReport();
  }

  generateTestCases() {
    const testCases = [];

    switch (this.options.focus) {
      case 'pricing':
        this.options.firms.forEach(firm => {
          testCases.push(
            { question: `cuanto cuesta ${firm}?`, firm, category: 'pricing' },
            { question: `what are ${firm} prices?`, firm, category: 'pricing' },
            { question: `${firm} pricing`, firm, category: 'pricing' },
            { question: `precio de cuenta 10k en ${firm}`, firm, category: 'pricing' },
            { question: `${firm} 100k account cost`, firm, category: 'pricing' }
          );
        });
        break;

      case 'quality':
        this.options.firms.forEach(firm => {
          testCases.push(
            { question: `complete info about ${firm}`, firm, category: 'quality' },
            { question: `${firm} vs ftmo comparison`, firm, category: 'quality' },
            { question: `why choose ${firm}?`, firm, category: 'quality' },
            { question: `${firm} pros and cons`, firm, category: 'quality' }
          );
        });
        break;

      case 'edge':
        // Edge cases that should work with any firm
        const edgeCases = [
          'precio', 'cost', 'how much',
          'apx', 'bulnox', 'takprofit',
          'best firm?', 'cheapest option?',
          'puedo tradear noticias?', 'scalping allowed?'
        ];
        
        edgeCases.forEach(question => {
          testCases.push({ question, firm: 'unknown', category: 'edge' });
        });
        break;

      case 'performance':
        // Rapid-fire simple questions
        this.options.firms.forEach(firm => {
          testCases.push(
            { question: firm, firm, category: 'performance' },
            { question: `${firm} mt4`, firm, category: 'performance' },
            { question: `${firm} payout`, firm, category: 'performance' }
          );
        });
        break;

      default:
        // Generate comprehensive tests for all categories
        this.options.firms.forEach(firm => {
          const firmTests = generateFirmTests(firm);
          testCases.push(...firmTests.slice(0, 10)); // Limit to 10 per firm for focused testing
        });
    }

    return testCases;
  }

  async runAgentTests(agent, tests) {
    const results = [];
    
    console.log(chalk.blue(`🤖 Agent ${agent.id} starting ${tests.length} tests...`));

    for (const test of tests) {
      try {
        const result = await agent.runTest(test);
        results.push(result);

        // Show progress
        if (this.options.verbose) {
          this.displayTestResult(result);
        }
      } catch (error) {
        results.push({
          ...test,
          success: false,
          error: error.message,
          agentId: agent.id
        });
      }
    }

    console.log(chalk.green(`✅ Agent ${agent.id} completed ${tests.length} tests`));
    return results;
  }

  displayTestResult(result) {
    const status = result.success ? chalk.green('✓') : chalk.red('✗');
    const time = chalk.gray(`${result.responseTime}ms`);
    
    console.log(`${status} ${result.question} ${time}`);
    
    if (!result.success && result.error) {
      console.log(chalk.red(`  Error: ${result.error}`));
    }
    
    if (result.issues && result.issues.length > 0) {
      console.log(chalk.yellow(`  Issues: ${result.issues.join(', ')}`));
    }
  }

  generateReport() {
    const duration = (Date.now() - this.startTime) / 1000;
    const totalTests = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = totalTests - passed;
    const successRate = ((passed / totalTests) * 100).toFixed(2);

    // Group results by firm
    const byFirm = {};
    this.results.forEach(result => {
      const firm = result.firm || 'unknown';
      if (!byFirm[firm]) {
        byFirm[firm] = { total: 0, passed: 0, failed: 0, avgTime: 0, issues: [] };
      }
      byFirm[firm].total++;
      if (result.success) byFirm[firm].passed++;
      else byFirm[firm].failed++;
      
      if (result.responseTime) {
        byFirm[firm].avgTime += result.responseTime;
      }
      
      if (result.issues) {
        byFirm[firm].issues.push(...result.issues);
      }
    });

    // Calculate averages
    Object.values(byFirm).forEach(stats => {
      if (stats.total > 0) {
        stats.avgTime = Math.round(stats.avgTime / stats.total);
        stats.successRate = ((stats.passed / stats.total) * 100).toFixed(1) + '%';
      }
    });

    const report = {
      summary: {
        focus: this.options.focus,
        duration: duration.toFixed(2) + 's',
        totalTests,
        passed,
        failed,
        successRate: successRate + '%',
        agents: this.agents.length,
        testsPerSecond: (totalTests / duration).toFixed(2)
      },
      byFirm,
      timestamp: new Date().toISOString()
    };

    // Display report
    console.log(chalk.cyan('\n📊 TEST REPORT'));
    console.log(chalk.cyan('==============\n'));
    
    console.log(chalk.white('Summary:'));
    console.log(`  Focus: ${report.summary.focus}`);
    console.log(`  Duration: ${report.summary.duration}`);
    console.log(`  Tests: ${report.summary.totalTests}`);
    console.log(`  Success Rate: ${report.summary.successRate}`);
    console.log(`  Tests/Second: ${report.summary.testsPerSecond}`);

    console.log(chalk.white('\nResults by Firm:'));
    Object.entries(byFirm).forEach(([firm, stats]) => {
      console.log(`  ${firm}:`);
      console.log(`    Success Rate: ${stats.successRate}`);
      console.log(`    Avg Response: ${stats.avgTime}ms`);
      if (stats.issues.length > 0) {
        const uniqueIssues = [...new Set(stats.issues)];
        console.log(`    Issues: ${uniqueIssues.slice(0, 3).join(', ')}`);
      }
    });

    return report;
  }
}

// Base Agent Class
class TestAgent {
  constructor(options) {
    this.id = options.id;
    this.firms = options.firms;
    this.bot = options.bot;
    this.type = 'generic';
  }

  async runTest(test) {
    const startTime = Date.now();
    
    try {
      const response = await this.bot.processMessage(test.question);
      const responseTime = Date.now() - startTime;
      
      const validation = this.validateResponse(response, test);
      
      return {
        ...test,
        response,
        responseTime,
        success: validation.success,
        issues: validation.issues,
        agentId: this.id,
        agentType: this.type
      };
    } catch (error) {
      return {
        ...test,
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime,
        agentId: this.id,
        agentType: this.type
      };
    }
  }

  validateResponse(response, test) {
    const issues = [];
    
    // Basic validation
    if (!response || response.length < 10) {
      issues.push('Response too short');
    }
    
    // Check for forbidden phrases
    validationRules.forbidden_phrases.forEach(phrase => {
      if (response.toLowerCase().includes(phrase)) {
        issues.push(`Contains forbidden phrase: "${phrase}"`);
      }
    });
    
    return {
      success: issues.length === 0,
      issues
    };
  }
}

// Specialized Agent Classes
class PricingTestAgent extends TestAgent {
  constructor(options) {
    super(options);
    this.type = 'pricing';
  }

  validateResponse(response, test) {
    const validation = super.validateResponse(response, test);
    
    // Pricing-specific validation
    if (!response.includes('$') && !response.includes('€')) {
      validation.issues.push('No currency symbol found');
    }
    
    // Check for incorrect percentage formatting (e.g., 1500% instead of $1,500)
    const incorrectPercentage = response.match(/\d{3,}%/);
    if (incorrectPercentage) {
      validation.issues.push(`Incorrect percentage formatting: ${incorrectPercentage[0]}`);
    }
    
    // Ensure proper monetary formatting
    const hasProperMoneyFormat = response.match(/\$[\d,]+(\.\d{2})?/) || response.match(/€[\d,]+(\.\d{2})?/);
    if (!hasProperMoneyFormat && test.category === 'pricing') {
      validation.issues.push('Improper monetary formatting');
    }
    
    validation.success = validation.issues.length === 0;
    return validation;
  }
}

class QualityAssuranceAgent extends TestAgent {
  constructor(options) {
    super(options);
    this.type = 'quality';
  }

  validateResponse(response, test) {
    const validation = super.validateResponse(response, test);
    
    // Check response structure
    if (response.length < 100) {
      validation.issues.push('Response lacks detail');
    }
    
    // Check for proper formatting (HTML or Markdown)
    const hasFormatting = response.includes('<b>') || response.includes('**') || response.includes('\n•');
    if (!hasFormatting) {
      validation.issues.push('Response lacks proper formatting');
    }
    
    // Check firm detection accuracy
    if (test.firm !== 'unknown') {
      const firmMentioned = response.toLowerCase().includes(test.firm.toLowerCase());
      if (!firmMentioned) {
        validation.issues.push('Incorrect firm detection');
      }
    }
    
    validation.success = validation.issues.length === 0;
    return validation;
  }
}

class PerformanceTestAgent extends TestAgent {
  constructor(options) {
    super(options);
    this.type = 'performance';
    this.performanceThreshold = 3000; // 3 seconds
  }

  validateResponse(response, test) {
    const validation = super.validateResponse(response, test);
    
    // Performance-specific checks
    if (test.responseTime > this.performanceThreshold) {
      validation.issues.push(`Slow response: ${test.responseTime}ms`);
    }
    
    validation.success = validation.issues.length === 0;
    return validation;
  }
}

class EdgeCaseTestAgent extends TestAgent {
  constructor(options) {
    super(options);
    this.type = 'edge';
  }

  validateResponse(response, test) {
    const validation = super.validateResponse(response, test);
    
    // Edge case specific validation
    if (test.question.length < 10) {
      // For minimal queries, should still provide helpful response
      if (response.includes('Could you please provide more context')) {
        validation.issues.push('Failed to handle minimal query gracefully');
      }
    }
    
    validation.success = validation.issues.length === 0;
    return validation;
  }
}

class FirmSpecificTestAgent extends TestAgent {
  constructor(options) {
    super(options);
    this.type = 'firm';
  }

  validateResponse(response, test) {
    const validation = super.validateResponse(response, test);
    
    // Firm-specific validation
    if (test.expectedFirm && test.expectedFirm !== 'unknown') {
      const correctFirmDetected = response.toLowerCase().includes(test.expectedFirm);
      if (!correctFirmDetected) {
        validation.issues.push(`Expected ${test.expectedFirm} but not found in response`);
      }
    }
    
    validation.success = validation.issues.length === 0;
    return validation;
  }
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse arguments
  args.forEach((arg, index) => {
    if (arg === '--focus' && args[index + 1]) {
      options.focus = args[index + 1];
    }
    if (arg === '--firms' && args[index + 1]) {
      options.firms = args[index + 1];
    }
    if (arg === '--agents' && args[index + 1]) {
      options.agents = args[index + 1];
    }
    if (arg === '--verbose') {
      options.verbose = true;
    }
  });

  console.log(chalk.cyan('🎯 FOCUSED AGENT TEST RUNNER'));
  console.log(chalk.cyan('===========================\n'));

  const runner = new AgentTestRunner(options);
  
  runner.initialize()
    .then(() => runner.run())
    .then(report => {
      process.exit(report.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error(chalk.red('\n❌ Test runner error:'), error);
      process.exit(1);
    });
}

module.exports = AgentTestRunner;