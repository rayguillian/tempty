// ---------------------------------------------
// Stress Assessment Questions (PSS-10)
// ---------------------------------------------
export const STRESS_QUESTIONS = [
    {
      question: "Hvor ofte inden for den sidste måned er du blevet oprørt over noget, der skete uventet?",
      conversationalPrompts: [
        "Kan du huske en situation for nylig, hvor noget uventet virkelig påvirkede dig?",
        "Hvordan håndterede du det, da det skete?"
      ]
    },
    {
      question: "Hvor ofte inden for den sidste måned har du følt, at du var ude af stand til at kontrollere de betydningsfulde ting i dit liv?",
      conversationalPrompts: [
        "Kan du give et eksempel på noget, du gerne ville kontrollere men ikke kunne?",
        "Hvordan føles det, når du mangler kontrol?"
      ]
    },
    {
      question: "Hvor ofte inden for den sidste måned har du følt dig nervøs og stresset?",
      conversationalPrompts: [
        "Kan du beskrive en situation for nylig, hvor du følte dig stresset?",
        "Hvordan reagerede din krop eller dit sind i den situation?"
      ]
    },
    {
      question: "Hvor ofte inden for den sidste måned har du følt dig sikker på dine evner til at klare dine personlige problemer?",
      conversationalPrompts: [
        "Har du et eksempel på et personligt problem, du har løst for nylig?",
        "Hvad hjælper dig med at føle dig selvsikker, når tingene bliver svære?"
      ]
    },
    {
      question: "Hvor ofte inden for den sidste måned har du følt, at tingene gik, som du ønskede det?",
      conversationalPrompts: [
        "Kan du fortælle om noget, der for nylig gik præcis, som du ønskede det?",
        "Hvordan påvirker det dig, når alt glider let?"
      ]
    },
    {
      question: "Hvor ofte inden for den sidste måned har du oplevet, at du ikke kunne overkomme alt det, du skulle?",
      conversationalPrompts: [
        "Hvornår følte du senest, at opgaverne hobede sig op?",
        "Hvad gør du for at håndtere følelsen af at være overvældet?"
      ]
    },
    {
      question: "Hvor ofte inden for den sidste måned har du været i stand til at håndtere ting, som irriterer dig?",
      conversationalPrompts: [
        "Kan du nævne en irriterende situation, du har haft for nylig, og hvordan du håndterede den?",
        "Hvad hjælper dig med at bevare roen i frustrerende øjeblikke?"
      ]
    },
    {
      question: "Hvor ofte inden for den sidste måned har du følt, at du havde styr på tingene?",
      conversationalPrompts: [
        "Kan du huske en situation, hvor du følte dig helt i kontrol?",
        "Hvad tror du gjorde forskellen i lige netop den situation?"
      ]
    },
    {
      question: "Hvor ofte inden for den sidste måned er du blevet vred over ting, du ikke havde indflydelse på?",
      conversationalPrompts: [
        "Har du oplevet situationer, hvor du følte en stærk vrede eller frustration uden at kunne ændre noget?",
        "Hvordan håndterede du den følelse?"
      ]
    },
    {
      question: "Hvor ofte inden for den sidste måned har du følt, at vanskelighederne hobede sig så meget op, at du ikke kunne klare dem?",
      conversationalPrompts: [
        "Kan du dele en oplevelse, hvor du følte, at problemerne blev for mange?",
        "Hvad plejer du at gøre, når du føler dig helt overvældet?"
      ]
    }
  ];
  
  // ---------------------------------------------
  // API Configuration
  // ---------------------------------------------
  const API_CONFIG = {
    OPENAI: {
      BASE_URL: 'https://api.openai.com/v1',
      MODEL: 'gpt-4',
      TIMEOUT: 30000
    },
    GROK: {
      BASE_URL: 'https://api.x.ai/v1',
      MODEL: 'grok-2-latest',
      TIMEOUT: 30000
    },
    GEMINI: {
      BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
      MODEL: 'gemini-pro',
      TIMEOUT: 30000
    }
  };
  
  // ---------------------------------------------
  // System Prompt
  // ---------------------------------------------
  const SYSTEM_PROMPT = `
  Du er en empatisk psykolog og stress-ekspert, der hjælper med at gennemføre et stress-spørgeskema. Din primære opgave er at guide brugeren gennem spørgsmålene på en naturlig og samtalebaseret måde, mens du stiller uddybende spørgsmål for at sikre præcise svar. Følg disse retningslinjer:
  
  1. **Struktureret Dialog**:
     - Start altid med at stille det næste spørgsmål fra spørgeskemaet
     - Omformuler spørgsmålene til naturlig samtale
     - Stil ALTID mindst ét uddybende spørgsmål for at forstå konteksten
     - Sørg for, at hvert svar leder til en yderligere opfølgning, hvis relevant
     - Få konkrete svar der kan bruges i spørgeskemaet (0-4 skala)
  
  2. **Håndtering af Svar**:
     - Anerkend brugerens svar med empati uden at overdrive (1-2 sætninger)
     - Følg altid op med en uddybende eller konkretiserende bemærkning
     - Hvis svaret ikke er på 0-4 skalaen, spørg specifikt: "På en skala fra 0-4, hvor 0 er aldrig og 4 er meget ofte, hvordan vil du rate det?"
     - Bekræft altid det endelige tal på skalaen før du går videre
     - Led derefter videre til næste spørgsmål med en naturlig overgang
  
  3. **Hold Fokus og Progression**:
     - Hold styr på hvilke spørgsmål der er besvaret
     - Sikr at hvert spørgsmål har et klart svar på 0-4 skalaen
     - Marker tydeligt når alle spørgsmål er besvaret med "{shouldAnalyze: true}"
  
  4. **Undgå Tidlig Afslutning**:
     - Vent med at indsætte "{shouldAnalyze: true}" indtil du har set tydelige svar (0-4) på alle 10 spørgsmål.
     - Hvis brugeren indtaster noget irrelevant, bed om et konkret tal (0-4) på en høflig måde.
  
  Håndter alle input professionelt, også dem der er upassende. Bevar fokus på formålet med stresstesten.
  `;
  
  // ---------------------------------------------
  // Constants and Utility Functions
  // ---------------------------------------------
  const MAX_CHUNK_SIZE = 1000;
  const MAX_RECENT_MESSAGES = 10;
  
  const validateAnswer = (answer) => {
    const num = parseInt(answer);
    return !isNaN(num) && num >= 0 && num <= 4;
  };
  
  async function retryWithBackoff(fn, retries = 3, initialDelay = 1000) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i === retries - 1) break;
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retry attempt ${i + 1} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }
  
  function chunkMessage(content) {
    if (content.length <= MAX_CHUNK_SIZE) {
      return [content];
    }
  
    const chunks = [];
    let currentChunk = '';
    const sentences = content.split(/(?<=[.!?])\s+/);
  
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > MAX_CHUNK_SIZE) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        if (sentence.length > MAX_CHUNK_SIZE) {
          const words = sentence.split(/\s+/);
          let tempChunk = '';
          for (const word of words) {
            if ((tempChunk + ' ' + word).length > MAX_CHUNK_SIZE) {
              chunks.push(tempChunk.trim());
              tempChunk = word;
            } else {
              tempChunk += (tempChunk ? ' ' : '') + word;
            }
          }
          if (tempChunk) {
            currentChunk = tempChunk;
          }
        } else {
          currentChunk = sentence;
        }
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
  
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
  
    return chunks;
  }
  
  // ---------------------------------------------
// Abstract Base Class for AI Providers
// ---------------------------------------------
class AIProvider {
    async sendMessage(messages) {
      throw new Error('Method not implemented');
    }
  
    async generateAnalysis(analysisPrompt, userPrompt) {
      throw new Error('Method not implemented');
    }
  
    sanitizeInput(input) {
      return input.trim();
    }
  }
  
  // ---------------------------------------------
// OpenAI Provider Updates
// ---------------------------------------------
class OpenAIProvider extends AIProvider {
    constructor() {
      super();
      this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      this.lastRequestTime = 0;
      this.minRequestInterval = 1000; // 1 second minimum between requests
    }
  
    async sendMessage(messages) {
      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
        );
      }
      this.lastRequestTime = Date.now();
  
      const sanitizedMessages = messages.map(msg => ({
        ...msg,
        content: this.sanitizeInput(msg.content)
      }));
  
      try {
        const response = await this.makeRequest('/chat/completions', {
          model: 'gpt-3.5-turbo', // Changed from gpt-4 to gpt-3.5-turbo
          messages: [
            { 
              role: 'system', 
              content: `${SYSTEM_PROMPT}\n\nFokuser på at få et konkret svar på 0-4 skalaen til hvert spørgsmål.
              Ignorer upassende eller irrelevante svar og vend venligt men bestemt tilbage til spørgsmålene.`
            },
            ...sanitizedMessages
          ],
          max_tokens: 300,
          temperature: 1.2,  // Reduced for more focused responses
          top_p: 0.9
        });
  
        const content = response.choices[0]?.message?.content?.trim() || '';
        return {
          role: 'assistant',
          content: content.replace('{shouldAnalyze: true}', '').trim(),
          shouldAnalyze: content.includes('{shouldAnalyze: true}')
        };
      } catch (error) {
        if (error.message.includes('not exist') || error.message.includes('access')) {
          throw new Error('OpenAI model access error. Will try alternate provider.');
        }
        throw error;
      }
    }
  
    async generateAnalysis(analysisPrompt, userPrompt) {
      const specializedSystemPrompt = {
        role: 'system',
        content: `Du er en professionel psykologisk rådgiver. 
        Du skal levere en **Markdown-formatteret** rapport med:
        - "## Kort Opsummering" (2-3 sætninger)
        - "## Anbefalinger" (3-4 konkrete tips)
        Hold det kortfattet og professionelt.`
      };
  
      try {
        const response = await this.makeRequest('/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [specializedSystemPrompt, analysisPrompt, userPrompt],
          max_tokens: 500,
          temperature: 0.7
        });
  
        return response.choices[0]?.message?.content?.trim() || '';
      } catch (error) {
        console.error('OpenAI Analysis Error:', error);
        throw error;
      }
    }
  
    async makeRequest(endpoint, body) {
      if (!this.apiKey) {
        throw new Error('OpenAI API key is not configured');
      }
  
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.OPENAI.TIMEOUT);
  
      try {
        const response = await fetch(`${API_CONFIG.OPENAI.BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
  
        clearTimeout(timeoutId);
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    }
  }
  
  // ---------------------------------------------
  // Grok Provider Updates
  // ---------------------------------------------
  class GrokProvider extends AIProvider {
    constructor() {
      super();
      this.apiKey = import.meta.env.VITE_X_AI_GROK_API_KEY;
      this.baseUrl = 'https://api.x.ai/v1';
      this.consecutiveFailures = 0;
      this.lastRequestTime = 0;
      this.minRequestInterval = 2000; // 2 seconds minimum between requests
      this.questionsAnswered = 0;
    }
  
    async sendMessage(messages) {
      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
        );
      }
      this.lastRequestTime = Date.now();
  
      const recentMessages = messages.slice(-3);
      
      // Count answered questions from the message history
      this.questionsAnswered = messages.reduce((count, msg) => {
        if (msg.role === 'user') {
          const answer = msg.content.match(/\b[0-4]\b/);
          if (answer) count++;
        }
        return count;
      }, 0);
  
      const processedMessages = recentMessages.map(msg => ({
        ...msg,
        content: this.sanitizeInput(msg.content)
      }));
  
      try {
        const response = await this.makeRequest('/chat/completions', {
          messages: [
            { 
              role: 'system', 
              content: `Du er en professionel psykolog der hjælper med et stress-spørgeskema. 
              Hold fokus på spørgsmålene og ignorer irrelevante svar.
              Der er besvaret ${this.questionsAnswered} spørgsmål.
              Marker {shouldAnalyze: true} når PRÆCIS 10 spørgsmål er besvaret.
              Bed venligt men bestemt om et tal mellem 0-4 for hvert spørgsmål.`
            },
            ...processedMessages
          ],
          model: API_CONFIG.GROK.MODEL,
          stream: false,
          temperature: 0.4, // Lower temperature for more focused responses
          max_tokens: 150,
          top_p: 0.7
        });
  
        this.consecutiveFailures = 0;
  
        let rawContent = response.choices[0]?.message?.content?.trim() || '';
        
        // Force analysis mode if 10 questions are answered
        if (this.questionsAnswered >= 10) {
          rawContent = '{shouldAnalyze: true}';
        }
  
        return {
          role: 'assistant',
          content: rawContent.replace('{shouldAnalyze: true}', '').trim(),
          shouldAnalyze: rawContent.includes('{shouldAnalyze: true}') || this.questionsAnswered >= 10
        };
  
      } catch (error) {
        this.consecutiveFailures++;
        
        if (error.message.includes('429')) {
          // If rate limited, wait and retry once
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.sendMessage(messages);
        }
        
        throw error;
      }
    }
  
    async makeRequest(endpoint, body) {
      if (!this.apiKey) {
        throw new Error('X.AI Grok API key is not configured');
      }
  
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.GROK.TIMEOUT);
  
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
  
        clearTimeout(timeoutId);
  
        if (!response.ok) {
          let errorMessage = `HTTP error ${response.status}`;
          try {
            const errorText = await response.text();
            console.error('X.AI Grok API Error Response:', errorText);
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error?.message || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
          }
          throw new Error(errorMessage);
        }
  
        return await response.json();
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    }
  
    async generateAnalysis(analysisPrompt, userPrompt) {
      const specializedSystemPrompt = {
        role: 'system',
        content: `Lav en kort **Markdown** stress-rapport med:
  - "## Kort Opsummering" (2-3 sætninger)
  - "## Anbefalinger" (3-4 konkrete tips)
  Hold det kortfattet og professionelt.`
      };
  
      try {
        const response = await this.makeRequest('/chat/completions', {
          messages: [specializedSystemPrompt, analysisPrompt, userPrompt],
          model: API_CONFIG.GROK.MODEL,
          stream: false,
          temperature: 0.6,
          max_tokens: 200,
          top_p: 0.7
        });
  
        return response.choices[0]?.message?.content?.trim() || '';
      } catch (error) {
        console.error('Grok Analysis Error:', error);
        throw error;
      }
    }
  }
  
  // ---------------------------------------------
  // Gemini Provider Updates
  // ---------------------------------------------
  class GeminiProvider extends AIProvider {
    constructor() {
      super();
      this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      this.lastRequestTime = 0;
      this.minRequestInterval = 1000;
    }
  
    async sendMessage(messages) {
      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
        );
      }
      this.lastRequestTime = Date.now();
  
      const processedMessages = this.processMessages(messages);
      
      // Add stronger focus on professional assessment
      const systemMessage = {
        role: 'user',
        parts: [{
          text: `Du er en professionel psykolog der gennemfører et stress-spørgeskema.
          Hold fokus på spørgsmålene og vend altid tilbage til dem.
          Bevar en professionel distance.
          Få konkrete svar på 0-4 skalaen til hvert spørgsmål.
          Ignorer upassende svar og fortsæt venligt men bestemt med spørgsmålene.`
        }]
      };
  
      const response = await this.makeRequest([systemMessage, ...processedMessages]);
  
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return {
        role: 'assistant',
        content: text.replace('{shouldAnalyze: true}', '').trim(),
        shouldAnalyze: text.includes('{shouldAnalyze: true}')
      };
    }
  
    processMessages(messages) {
      // Keep only the most recent messages to maintain context
      const recentMessages = messages
        .filter(msg => msg.role !== 'system')
        .slice(-3)
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ 
            text: this.sanitizeForGemini(msg.content)
          }]
        }));
  
      return recentMessages;
    }
  
    sanitizeForGemini(input) {
      // Remove or replace potentially problematic content
      return input
        .replace(/[^\w\s,.?!-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  
    async makeRequest(messages) {
      if (!this.apiKey) {
        throw new Error('Gemini API key is not configured');
      }
  
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.GEMINI.TIMEOUT);
  
      try {
        const response = await fetch(
          `${API_CONFIG.GEMINI.BASE_URL}/models/${API_CONFIG.GEMINI.MODEL}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: messages,
              generationConfig: {
                temperature: 0.7, // Reduced for more focused responses
                topP: 0.9,
                maxOutputTokens: 300,
              }
            }),
            signal: controller.signal
          }
        );
  
        clearTimeout(timeoutId);
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    }
  
    async generateAnalysis(analysisPrompt, userPrompt) {
      const specializedSystemPrompt = {
        role: 'user',
        parts: [{
          text: `Lav en kort **Markdown** stress-rapport med:
  - "## Kort Opsummering" (2-3 sætninger)
  - "## Anbefalinger" (3-4 konkrete tips)
  Hold det kortfattet og professionelt.`
        }]
      };
  
      try {
        const messages = [specializedSystemPrompt, {
          role: 'user',
          parts: [{ text: analysisPrompt.content }]
        }, {
          role: 'user',
          parts: [{ text: userPrompt.content }]
        }];
  
        const response = await this.makeRequest(messages);
        return response.candidates?.[0]?.content?.parts?.[0]?.text.trim() || '';
      } catch (error) {
        console.error('Gemini Analysis Error:', error);
        throw error;
      }
    }
  }
  
  // ---------------------------------------------
  // AI Service Manager Updates
  // ---------------------------------------------
  class AIServiceManager {
    constructor() {
      this.providers = {
        openai: new OpenAIProvider(),
        grok: new GrokProvider(),
        gemini: new GeminiProvider()
      };
      
      // Change default provider order to start with Grok
      this.currentProvider = 'grok';
      this.fallbackOrder = ['grok', 'openai', 'gemini'];
      
      this.providerFailureThresholds = {
        openai: 3,
        grok: 3,
        gemini: 3
      };
      
      this.providerFailureCounts = {
        openai: 0,
        grok: 0,
        gemini: 0
      };
  
      this.answers = new Array(10).fill(null);
      this.currentQuestionIndex = -1;
      this.questionsStarted = false;
      this.lastAssistantMessage = null;
    }
  
    setProvider(providerName) {
      if (!this.providers[providerName]) {
        throw new Error(`Provider ${providerName} not found`);
      }
      this.currentProvider = providerName;
    }
  
    extractQuestionIndex(text) {
      const match = text.match(/Spørgsmål\s*(\d+)/i);
      return match ? parseInt(match[1]) - 1 : -1;
    }
  
    extractAnswer(text) {
      const match = text.match(/\b[0-4]\b/);
      return match ? parseInt(match[0]) : null;
    }
  
    isValidAnswer(answer) {
      return typeof answer === 'number' && answer >= 0 && answer <= 4;
    }
  
    updateQuestionIndex(assistantMessage) {
      const index = this.extractQuestionIndex(assistantMessage);
      if (index >= 0) {
        this.currentQuestionIndex = index;
        this.questionsStarted = true;
        this.lastAssistantMessage = assistantMessage;
      }
    }
  
    processUserAnswer(userMessage) {
      if (!this.questionsStarted || this.currentQuestionIndex < 0) {
        return;
      }
  
      const answer = this.extractAnswer(userMessage);
      if (this.isValidAnswer(answer)) {
        this.answers[this.currentQuestionIndex] = answer;
      }
    }
  
    getAnsweredCount() {
      return this.answers.filter(a => this.isValidAnswer(a)).length;
    }
  
    areAllQuestionsAnswered() {
      return this.getAnsweredCount() === 10;
    }
  
    shouldProceedToNextQuestion() {
      return this.questionsStarted && this.getAnsweredCount() < 10;
    }
  
    async sendMessage(messages) {
      // Process message history for question tracking
      messages.forEach(msg => {
        if (msg.role === 'assistant') {
          this.updateQuestionIndex(msg.content);
        } else if (msg.role === 'user') {
          this.processUserAnswer(msg.content);
        }
      });
  
      // Add professional focus to system messages
      const enhancedMessages = messages.map(msg => {
        if (msg.role === 'system') {
          return {
            ...msg,
            content: `${msg.content}\nHold fokus på spørgsmålene og få konkrete svar på 0-4 skalaen.`
          };
        }
        return msg;
      });
  
      const currentIndex = this.fallbackOrder.indexOf(this.currentProvider);
      for (let i = currentIndex; i < this.fallbackOrder.length; i++) {
        const provider = this.fallbackOrder[i];
        try {
          let result = await this.providers[provider].sendMessage(enhancedMessages);
  
          if (this.areAllQuestionsAnswered()) {
            result = {
              ...result,
              shouldAnalyze: true,
              content: result.content.includes('Din Stressanalyse') 
                ? result.content 
                : `${result.content}\n{shouldAnalyze: true}`
            };
          } else if (this.shouldProceedToNextQuestion()) {
            result = {
              ...result,
              shouldAnalyze: false,
              content: result.content
                .replace('{shouldAnalyze: true}', '')
                .replace(/\*\*Din Stressanalyse\*\*[\s\S]*$/, '')
                .trim()
            };
          }
  
          this.providerFailureCounts[provider] = 0;
  
          if (i > currentIndex) {
            this.setProvider(provider);
            console.log(`Switched to ${provider} as primary provider`);
          }
  
          return result;
  
        } catch (error) {
          this.providerFailureCounts[provider]++;
          console.error(`${provider} failed:`, error);
  
          if (this.providerFailureCounts[provider] >= this.providerFailureThresholds[provider]) {
            console.log(`${provider} has exceeded failure threshold`);
          }
  
          if (i === this.fallbackOrder.length - 1) {
            throw error;
          }
          continue;
        }
      }
    }
  
    async generateAnalysis() {
      if (!this.areAllQuestionsAnswered()) {
        console.error('Analysis attempted before all questions were answered:', {
          questionsAnswered: this.getAnsweredCount()
        });
        return null;
      }
  
      const score = this.calculatePSS10Score(this.answers);
  
      const analysisPrompt = {
        role: 'system',
        content: `
  Score-fortolkning:
  - Gennemsnit: ~11.0
  - Let bekymrende: 17-18
  - Behandlingskrævende: Over 25
  - For unge: 22-23
        `
      };
  
      const userPrompt = {
        role: 'user',
        content: `Samlet stressscore: ${score}\n\nSvar:\n${
          STRESS_QUESTIONS.map((q, i) => `${i + 1}. ${q.question}: ${this.answers[i]}`).join('\n')
        }`
      };
  
      const currentIndex = this.fallbackOrder.indexOf(this.currentProvider);
      for (let i = currentIndex; i < this.fallbackOrder.length; i++) {
        const provider = this.fallbackOrder[i];
        try {
          const analysis = await this.providers[provider].generateAnalysis(analysisPrompt, userPrompt);
          
          this.providerFailureCounts[provider] = 0;
  
          if (i > currentIndex) {
            this.setProvider(provider);
            console.log(`Switched to ${provider} as primary provider`);
          }
  
          return { score, analysis };
        } catch (error) {
          this.providerFailureCounts[provider]++;
          console.error(`${provider} failed:`, error);
  
          if (this.providerFailureCounts[provider] >= this.providerFailureThresholds[provider]) {
            console.log(`${provider} has exceeded failure threshold`);
          }
  
          if (i === this.fallbackOrder.length - 1) {
            throw error;
          }
          continue;
        }
      }
    }
  
    calculatePSS10Score(answers) {
      const REVERSED_INDICES = [3, 4, 6, 7];
      return answers.reduce((total, answer, index) => {
        if (!this.isValidAnswer(answer)) return total;
  
        return REVERSED_INDICES.includes(index)
          ? total + (4 - answer)
          : total + answer;
      }, 0);
    }
  
    getProgress() {
      return {
        answeredCount: this.getAnsweredCount(),
        currentQuestion: this.currentQuestionIndex,
        answers: [...this.answers],
        isComplete: this.areAllQuestionsAnswered(),
        canAnalyze: this.areAllQuestionsAnswered()
      };
    }
  
    resetProgress() {
      this.answers = new Array(10).fill(null);
      this.currentQuestionIndex = -1;
      this.questionsStarted = false;
      this.lastAssistantMessage = null;
    }
  }
  
  // ---------------------------------------------
  // Exported Service and Functions
  // ---------------------------------------------
  const aiService = new AIServiceManager();
  
  export const sendChatMessage = (messages) => aiService.sendMessage(messages);
  export const generateStressAnalysis = () => aiService.generateAnalysis();
  export const getStressAssessmentQuestions = () => STRESS_QUESTIONS;
  export const getProgress = () => aiService.getProgress();
  export const clearConversation = () => {
    aiService.resetProgress();
    return undefined;
  };