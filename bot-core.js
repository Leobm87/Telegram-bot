/**
 * Bot Core Module
 * Extracted core functionality for testing purposes
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

class BotCore {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.firmIds = {
      apex: '8b5e7a35-66a2-4713-a559-4e68c4b4f123',
      bulenox: '7567df00-7cf8-4afc-990f-6f8da04e36a4',
      takeprofit: '50e55e3f-c6e5-493f-931f-ebad96c973f4',
      myfundedfutures: '79cc9c97-bb15-4b27-a5f7-dc2a7aeeb52f',
      alpha: '2ff70297-718d-42b0-ba70-cde70d5627b5',
      tradeify: '32b45a19-d9fe-4b0f-b40f-b8f09b9b8b95',
      vision: 'e1a10fdc-b8c0-4bc3-b738-0f87b8c3d195'
    };

    this.firmAliases = {
      'mff': 'myfundedfutures',
      'my funded futures': 'myfundedfutures',
      'alpha futures': 'alpha',
      'vision trade': 'vision'
    };

    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async initialize() {
    // Verify database connection
    const { data, error } = await this.supabase
      .from('prop_firms')
      .select('id, name')
      .limit(1);

    if (error) {
      throw new Error(`Database initialization failed: ${error.message}`);
    }

    console.log('✅ Bot core initialized successfully');
    return this;
  }

  detectFirmFromQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Check aliases first
    for (const [alias, firmKey] of Object.entries(this.firmAliases)) {
      if (lowerQuestion.includes(alias)) {
        return { firmKey, firmId: this.firmIds[firmKey] };
      }
    }
    
    // Check main firm names
    for (const [firmKey, firmId] of Object.entries(this.firmIds)) {
      if (lowerQuestion.includes(firmKey)) {
        return { firmKey, firmId };
      }
    }
    
    return null;
  }

  extractKeywords(question) {
    const lowerQuestion = question.toLowerCase();
    const keywords = [];
    
    // Category keywords
    const categoryKeywords = {
      pricing: ['precio', 'price', 'costo', 'cost', 'cuanto', 'how much', 'tarifa', 'fee'],
      accounts: ['cuenta', 'account', 'plan', 'size', 'tamaño', 'evaluacion', 'evaluation', 'fase', 'phase'],
      payouts: ['pago', 'payout', 'retiro', 'withdrawal', 'profit', 'split', 'ganancia'],
      rules: ['regla', 'rule', 'drawdown', 'perdida', 'loss', 'horario', 'schedule', 'noticia', 'news'],
      platforms: ['plataforma', 'platform', 'mt4', 'mt5', 'ninjatrader', 'tradingview', 'ctrader']
    };
    
    for (const [category, terms] of Object.entries(categoryKeywords)) {
      for (const term of terms) {
        if (lowerQuestion.includes(term)) {
          keywords.push(term);
        }
      }
    }
    
    return keywords;
  }

  async searchFAQs(firmId, keywords) {
    let query = this.supabase
      .from('faqs')
      .select('*')
      .eq('prop_firm_id', firmId);
    
    if (keywords.length > 0) {
      const searchConditions = keywords.map(keyword => 
        `question.ilike.%${keyword}%,answer.ilike.%${keyword}%`
      ).join(',');
      
      query = query.or(searchConditions);
    }
    
    query = query.limit(5);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('FAQ search error:', error);
      return [];
    }
    
    return data || [];
  }

  async getStructuredData(firmId, category) {
    const tableMap = {
      pricing: 'account_plans',
      accounts: 'account_plans',
      payouts: 'payout_policies',
      rules: 'trading_rules',
      platforms: 'platforms'
    };
    
    const table = tableMap[category];
    if (!table) return null;
    
    if (table === 'platforms') {
      const { data, error } = await this.supabase
        .from('firm_platforms')
        .select(`
          platforms (
            name,
            type,
            description
          )
        `)
        .eq('prop_firm_id', firmId);
      
      return error ? null : data;
    } else {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq('prop_firm_id', firmId);
      
      return error ? null : data;
    }
  }

  formatResponse(data, category, firmName) {
    let response = `<b>Información sobre ${firmName}:</b>\n\n`;
    
    switch (category) {
      case 'pricing':
      case 'accounts':
        if (data && data.length > 0) {
          response += '<b>Planes de Cuenta Disponibles:</b>\n';
          data.forEach(plan => {
            response += `\n• <b>${plan.name}</b>\n`;
            response += `  Tamaño: $${plan.account_size?.toLocaleString()}\n`;
            response += `  Precio: $${plan.price}\n`;
            if (plan.profit_target_phase1) {
              response += `  Objetivo Fase 1: ${plan.profit_target_phase1}%\n`;
            }
            if (plan.profit_target_phase2) {
              response += `  Objetivo Fase 2: ${plan.profit_target_phase2}%\n`;
            }
          });
        }
        break;
        
      case 'payouts':
        if (data && data.length > 0) {
          const policy = data[0];
          response += '<b>Política de Pagos:</b>\n\n';
          response += `• Profit Split: ${policy.profit_split_percentage}%\n`;
          response += `• Frecuencia: ${policy.payout_frequency}\n`;
          response += `• Monto mínimo: $${policy.minimum_payout || 'Sin mínimo'}\n`;
          if (policy.payout_methods) {
            response += `• Métodos: ${policy.payout_methods}\n`;
          }
        }
        break;
        
      case 'rules':
        if (data && data.length > 0) {
          response += '<b>Reglas de Trading:</b>\n';
          data.forEach(rule => {
            response += `\n• <b>${rule.rule_type}</b>: ${rule.description}\n`;
            if (rule.value) {
              response += `  Valor: ${rule.value}\n`;
            }
          });
        }
        break;
        
      case 'platforms':
        if (data && data.length > 0) {
          response += '<b>Plataformas Disponibles:</b>\n';
          data.forEach(item => {
            if (item.platforms) {
              response += `\n• ${item.platforms.name} (${item.platforms.type})\n`;
              if (item.platforms.description) {
                response += `  ${item.platforms.description}\n`;
              }
            }
          });
        }
        break;
    }
    
    return response;
  }

  async processMessage(message) {
    // Check cache first
    const cacheKey = message.toLowerCase().trim();
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.response;
    }

    try {
      // Detect firm
      const firmInfo = this.detectFirmFromQuestion(message);
      if (!firmInfo) {
        return "Por favor, especifica sobre qué firma deseas información. Trabajo con: Apex, Bulenox, TakeProfit, MyFundedFutures, Alpha Futures, Tradeify y Vision Trade.";
      }

      // Extract keywords
      const keywords = this.extractKeywords(message);
      
      // Search FAQs first
      const faqs = await this.searchFAQs(firmInfo.firmId, keywords);
      
      if (faqs.length > 0) {
        // Use AI to generate response from FAQs
        const response = await this.generateAIResponse(message, faqs, firmInfo.firmKey);
        
        // Cache the response
        this.cache.set(cacheKey, {
          response,
          timestamp: Date.now()
        });
        
        return response;
      }

      // Fallback to structured data
      const category = this.detectCategory(keywords);
      if (category) {
        const structuredData = await this.getStructuredData(firmInfo.firmId, category);
        if (structuredData) {
          const response = this.formatResponse(structuredData, category, firmInfo.firmKey);
          
          // Cache the response
          this.cache.set(cacheKey, {
            response,
            timestamp: Date.now()
          });
          
          return response;
        }
      }

      // Final fallback
      return `Información sobre ${firmInfo.firmKey} está disponible. Por favor, especifica qué aspecto te interesa: precios, cuentas, pagos, reglas o plataformas.`;

    } catch (error) {
      console.error('Error processing message:', error);
      return "Disculpa, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.";
    }
  }

  detectCategory(keywords) {
    const categoryMap = {
      pricing: ['precio', 'price', 'costo', 'cost', 'cuanto', 'how much'],
      accounts: ['cuenta', 'account', 'plan', 'size', 'tamaño'],
      payouts: ['pago', 'payout', 'retiro', 'withdrawal', 'profit', 'split'],
      rules: ['regla', 'rule', 'drawdown', 'perdida', 'loss'],
      platforms: ['plataforma', 'platform', 'mt4', 'mt5', 'ninjatrader']
    };

    for (const [category, terms] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => terms.includes(keyword))) {
        return category;
      }
    }

    return null;
  }

  async generateAIResponse(question, faqs, firmName) {
    try {
      const context = faqs.map(faq => 
        `Q: ${faq.question}\nA: ${faq.answer}`
      ).join('\n\n');

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Eres un asistente especializado en proporcionar información sobre ${firmName}. 
            Responde SOLO con información de la base de datos proporcionada. 
            Usa formato HTML para resaltar información importante.
            Asegúrate de que los montos monetarios se muestren correctamente (ej: $1,500 no 1500%).`
          },
          {
            role: "user",
            content: `Pregunta: ${question}\n\nInformación disponible:\n${context}`
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('AI generation error:', error);
      throw error;
    }
  }
}

module.exports = { BotCore };