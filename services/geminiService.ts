// services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import MarvelRivalsAPI, { Hero } from './marvelRivalsApi';
import FavoritesService from './favoritesService';

// 🔑 API KEY CONFIGURADA
// Obtén una gratis en: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = 'AIzaSyAGZaBt3q4UgnhosgSiI7skyrxWMhGZuc4';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIComparison {
  hero1Pros: string[];
  hero1Cons: string[];
  hero2Pros: string[];
  hero2Cons: string[];
  verdict: string;
  recommendation: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private heroes: Hero[] = [];
  private chatHistory: ChatMessage[] = [];
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  
  // Configuración de rate limiting
  private MIN_REQUEST_INTERVAL = 8000; // 8 segundos entre requests
  private MAX_REQUESTS_PER_MINUTE = 10; // Máximo 10 requests por minuto

  constructor() {
    // Validar API Key
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyAGZaBt3q4UgnhosgSiI7skyrxWMhGZuc4') {
      console.warn('⚠️ API Key no configurada. Gemini funcionará en modo offline.');
      this.loadHeroes();
      return;
    }

    try {
      console.log('🔑 Inicializando Gemini...');
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 512,
        }
      });
      console.log('✅ Gemini inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Gemini:', error);
      this.genAI = null;
      this.model = null;
    }
    
    this.loadHeroes();
  }

  private async loadHeroes() {
    try {
      this.heroes = await MarvelRivalsAPI.getHeroes();
      console.log('✅ Héroes cargados para IA:', this.heroes.length);
    } catch (error) {
      console.error('❌ Error cargando héroes:', error);
    }
  }

  private getHeroInfo(heroName: string): Hero | null {
    const searchName = heroName.toLowerCase().trim();
    return this.heroes.find(h => 
      h.name.toLowerCase().includes(searchName) ||
      (h.alias && h.alias.toLowerCase().includes(searchName))
    ) || null;
  }

  /**
   * Rate limiting más estricto + contador de requests
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Resetear contador cada minuto
    if (timeSinceLastRequest > 60000) {
      this.requestCount = 0;
    }

    // Verificar límite de requests por minuto
    if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      const waitTime = 60000 - timeSinceLastRequest;
      console.log(`⏳ Límite alcanzado. Esperando ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
    }
    
    // Rate limit entre requests
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ Esperando ${Math.ceil(waitTime / 1000)}s para siguiente request...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  /**
   * Respuesta offline cuando no hay API Key o hay error
   */
  private getOfflineResponse(type: 'chat' | 'comparison' | 'analysis', context?: any): any {
    console.log('📴 Modo offline activado');
    
    if (type === 'chat') {
      const responses = [
        "¡Hola! 💜 Soy Galacta, tu entrenadora de Marvel Rivals.\n\n⚠️ Actualmente estoy en modo offline (sin conexión a IA), pero puedo ayudarte con información básica sobre los héroes.\n\n¿Quieres que te cuente sobre algún héroe específico?",
        "💜 ¡Hey! Por ahora funciono en modo básico.\n\nPuedo darte información sobre:\n⚔️ Roles de héroes\n🎯 Dificultades\n📊 Estadísticas generales\n\n¿Sobre qué héroe quieres saber?",
        "¡Hola, campeón! 💜\n\n⚠️ Estoy en modo offline pero sigo aquí para ayudarte.\n\nPregúntame sobre cualquier héroe y te daré su información básica. 🦸‍♂️"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (type === 'comparison' && context) {
      const { hero1, hero2 } = context;
      return {
        hero1Pros: [
          `${hero1.role} con ${hero1.difficultyStars}⭐ de dificultad`,
          `Excelente en su rol de ${hero1.role}`,
          `Múltiples habilidades tácticas`
        ],
        hero1Cons: [
          `Requiere ${hero1.difficultyStars <= 2 ? 'algo de' : 'mucha'} práctica`,
          `Vulnerable a counters específicos`,
          `Depende de la composición del equipo`
        ],
        hero2Pros: [
          `${hero2.role} con ${hero2.difficultyStars}⭐ de dificultad`,
          `Gran versatilidad en combate`,
          `Buen potencial de impacto`
        ],
        hero2Cons: [
          `Curva de aprendizaje ${hero2.difficultyStars <= 2 ? 'moderada' : 'pronunciada'}`,
          `Requiere coordinación con el equipo`,
          `Situacional en algunos mapas`
        ],
        verdict: `⚠️ Modo offline: Ambos son excelentes opciones. ${hero1.alias || hero1.name} (${hero1.difficultyStars}⭐) vs ${hero2.alias || hero2.name} (${hero2.difficultyStars}⭐). 💜`,
        recommendation: `${(hero1.difficultyStars || 3) <= (hero2.difficultyStars || 3) ? `Te recomiendo empezar con ${hero1.alias || hero1.name} por su dificultad más accesible.` : `${hero2.alias || hero2.name} puede ser más fácil de aprender.`} ¡Ambos son geniales! 🎮✨`
      };
    }

    return "⚠️ Modo offline activo. Configura tu API Key de Gemini para activar todas las funciones IA.";
  }

  /**
   * Obtener contexto del usuario (favoritos, historial)
   */
  private async getUserContext(): Promise<string> {
    const favoriteHeroes = await FavoritesService.getFavoriteHeroes();
    
    if (favoriteHeroes.length === 0) {
      return '';
    }

    return `\n\n**HÉROES FAVORITOS DEL USUARIO:** ${favoriteHeroes.join(', ')}\n(Considera estos al hacer recomendaciones)`;
  }

  private async getSystemContext(): Promise<string> {
    const heroSummary = this.heroes
      .slice(0, 20)
      .map(h => `${h.name} (${h.role}, ${h.difficultyStars}⭐)`)
      .join(', ');

    const userContext = await this.getUserContext();

    return `Eres Galacta 💜, entrenadora experta de Marvel Rivals.

**ROLES:**
- Duelist ⚔️: Daño
- Vanguard 🛡️: Tanque
- Strategist ✨: Soporte

**HÉROES:** ${heroSummary}...
${userContext}

**INSTRUCCIONES:**
1. Responde en 2-3 párrafos MAX
2. Usa emojis
3. Menciona rol con emoji
4. Sé directa y clara

Responde en español.`;
  }

  async sendMessage(userMessage: string): Promise<string> {
    // Modo offline si no hay modelo
    if (!this.model || !this.genAI) {
      const offlineResponse = this.getOfflineResponse('chat');
      
      this.chatHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      });
      
      this.chatHistory.push({
        role: 'assistant',
        content: offlineResponse,
        timestamp: new Date(),
      });
      
      return offlineResponse;
    }

    try {
      console.log('📤 Enviando mensaje a Gemini...');
      
      // Rate limiting estricto
      await this.waitForRateLimit();

      this.chatHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      });

      const mentionedHero = this.detectHeroMention(userMessage);
      let enhancedMessage = userMessage;

      if (mentionedHero) {
        const heroInfo = this.getHeroInfo(mentionedHero);
        if (heroInfo) {
          const abilities = heroInfo.abilities?.slice(0, 2).map(a => a.ability_name).join(', ') || 'N/A';
          enhancedMessage = `${userMessage}\n\n[CONTEXTO]: ${heroInfo.name} es ${heroInfo.role} (${heroInfo.difficultyStars}⭐). ${heroInfo.description?.substring(0, 80)}. Habilidades: ${abilities}`;
        }
      }

      const recentHistory = this.chatHistory.slice(-2).map(msg => 
        `${msg.role === 'user' ? 'Usuario' : 'Galacta'}: ${msg.content}`
      ).join('\n');

      const systemContext = await this.getSystemContext();
      const fullPrompt = `${systemContext}\n\nHistorial:\n${recentHistory}\n\nUsuario: ${enhancedMessage}\n\nGalacta (responde en 2 párrafos MAX):`;

      const result = await this.model.generateContent(fullPrompt);
      const aiMessage = result.response.text();

      this.chatHistory.push({
        role: 'assistant',
        content: aiMessage,
        timestamp: new Date(),
      });

      console.log('✅ Respuesta recibida');
      return aiMessage;
      
    } catch (error: any) {
      console.error('❌ Error con Gemini:', error);
      
      // Respuesta offline si hay error
      let fallbackMessage = '';
      
      if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
        fallbackMessage = '⚠️ Error con la API Key.\n\n💡 Para activar Gemini:\n1. Ve a https://aistudio.google.com/app/apikey\n2. Crea una API Key gratuita\n3. Pégala en services/geminiService.ts\n\nPor ahora funciono en modo básico. 💜';
      } else if (error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        fallbackMessage = '⚠️ ¡Ups! He alcanzado mi límite de uso.\n\n💡 Soluciones:\n\n1️⃣ **Espera 1-2 minutos** y vuelve a intentar\n2️⃣ **Crea una nueva API Key** en https://aistudio.google.com/app/apikey\n3️⃣ **Modo offline**: Puedo darte info básica de héroes sin IA\n\nEl límite gratuito de Gemini es de 15 requests/minuto. 💜';
      } else if (error.message?.includes('SAFETY')) {
        fallbackMessage = '⚠️ Mi filtro de seguridad bloqueó esa respuesta.\n\n¿Podrías reformular tu pregunta? 💜';
      } else {
        fallbackMessage = `⚠️ Error temporal: ${error.message}\n\nIntenta de nuevo en unos segundos. 💜`;
      }

      this.chatHistory.push({
        role: 'assistant',
        content: fallbackMessage,
        timestamp: new Date(),
      });

      return fallbackMessage;
    }
  }

  /**
   * ✅ NUEVO: Comparar dos héroes con análisis IA detallado
   */
  async compareHeroes(hero1: Hero, hero2: Hero): Promise<AIComparison> {
    // Modo offline si no hay modelo
    if (!this.model || !this.genAI) {
      return this.getOfflineResponse('comparison', { hero1, hero2 });
    }

    try {
      console.log('📤 Comparando héroes...');

      // Rate limiting estricto
      await this.waitForRateLimit();

      const userContext = await this.getUserContext();
      
      // Prompt más corto para ahorrar tokens
      const prompt = `Compara ${hero1.name} (${hero1.role}, ${hero1.difficultyStars}⭐) vs ${hero2.name} (${hero2.role}, ${hero2.difficultyStars}⭐).

JSON con 3 pros/cons cada uno + veredicto breve:
{
  "hero1Pros": ["pro1", "pro2", "pro3"],
  "hero1Cons": ["con1", "con2", "con3"],
  "hero2Pros": ["pro1", "pro2", "pro3"],
  "hero2Cons": ["con1", "con2", "con3"],
  "verdict": "1 oración con emoji",
  "recommendation": "1 oración con emoji"
}

SOLO JSON.`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Limpiar respuesta
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      }
      
      const comparison = JSON.parse(cleanedResponse);
      
      // Validar estructura
      if (!comparison.hero1Pros || !comparison.hero1Cons || 
          !comparison.hero2Pros || !comparison.hero2Cons ||
          !comparison.verdict || !comparison.recommendation) {
        throw new Error('Respuesta inválida');
      }

      console.log('✅ Comparación completada');
      return comparison;
      
    } catch (error: any) {
      console.error('❌ Error comparando:', error);
      
      // Fallback a respuesta offline
      return this.getOfflineResponse('comparison', { hero1, hero2 });
    }
  }

  private detectHeroMention(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    for (const hero of this.heroes) {
      if (lowerMessage.includes(hero.name.toLowerCase()) ||
          (hero.alias && lowerMessage.includes(hero.alias.toLowerCase()))) {
        return hero.name;
      }
    }
    
    return null;
  }

  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  clearHistory() {
    this.chatHistory = [];
    console.log('🧹 Historial limpiado');
  }

  getQuickSuggestions(): string[] {
    return [
      "¡Hola Galacta! ¿Qué héroe me recomiendas?",
      "Quiero jugar con Spider-Man",
      "¿Cuál es la mejor composición?",
      "Dame tips para Strategist",
      "Soy principiante, ¿por dónde empiezo?",
      "¿Cómo mejoro con los Duelists?",
    ];
  }

  async analyzeHero(heroName: string): Promise<string> {
    const hero = this.getHeroInfo(heroName);
    
    if (!hero) {
      return `No encontré a "${heroName}". ¿Podrías verificar el nombre?`;
    }

    await this.waitForRateLimit();

    const abilities = hero.abilities?.slice(0, 2).map(a => `- ${a.ability_name}`).join('\n') || 'N/A';
    const userContext = await this.getUserContext();
    
    const prompt = `Como Galacta 💜, analiza al héroe ${hero.name}:

**Datos:**
- Rol: ${hero.role}
- Dificultad: ${hero.difficultyStars}/5⭐
- Descripción: ${hero.description?.substring(0, 200)}
- Habilidades:
${abilities}
${userContext}

Da un análisis (3 párrafos) sobre:
1. ¿Para qué jugador es ideal?
2. Pros y contras
3. Tips de juego

Usa emojis.`;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async suggestComposition(context?: string): Promise<string> {
    await this.waitForRateLimit();

    const duelists = this.heroes.filter(h => h.role === 'Duelist').slice(0, 5);
    const vanguards = this.heroes.filter(h => h.role === 'Vanguard').slice(0, 5);
    const strategists = this.heroes.filter(h => h.role === 'Strategist').slice(0, 5);
    const userContext = await this.getUserContext();

    const prompt = `Como Galacta 💜, sugiere una comp balanceada.

**Héroes:**
- Duelists: ${duelists.map(h => h.name).join(', ')}
- Vanguards: ${vanguards.map(h => h.name).join(', ')}
- Strategists: ${strategists.map(h => h.name).join(', ')}

${context ? `**Contexto:** ${context}` : ''}
${userContext}

Sugiere comp 2-2-2 explicando:
1. Por qué cada héroe
2. Synergias
3. Estrategia

3 párrafos con emojis.`;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}

export default new GeminiService();