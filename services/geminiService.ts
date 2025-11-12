// services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import MarvelRivalsAPI, { Hero } from './marvelRivalsApi';
import FavoritesService from './favoritesService';

// 🔑 API KEY ACTUALIZADA - NUEVA CUENTA
const GEMINI_API_KEY = 'AIzaSyD1jjCej8zayxJ20jyuPxrLP8iH3f2coKM';

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
  private genAI: GoogleGenerativeAI;
  private model: any;
  private heroes: Hero[] = [];
  private chatHistory: ChatMessage[] = [];
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 4000; // 4 segundos entre requests

  constructor() {
    console.log('🔑 Inicializando Gemini con API Key:', GEMINI_API_KEY.substring(0, 20) + '...');
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
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
   * Rate limiting para evitar exceder cuota
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ Esperando ${waitTime}ms para evitar rate limit...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
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
    try {
      console.log('📤 Enviando mensaje a Gemini...');
      
      // Rate limiting
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
          enhancedMessage = `${userMessage}\n\n[CONTEXTO]: ${heroInfo.name} es ${heroInfo.role} (${heroInfo.difficultyStars}⭐). ${heroInfo.description?.substring(0, 100)}... Habilidades: ${abilities}`;
        }
      }

      const recentHistory = this.chatHistory.slice(-2).map(msg => 
        `${msg.role === 'user' ? 'Usuario' : 'Galacta'}: ${msg.content}`
      ).join('\n');

      const systemContext = await this.getSystemContext();
      const fullPrompt = `${systemContext}\n\nHistorial:\n${recentHistory}\n\nUsuario: ${enhancedMessage}\n\nGalacta:`;

      const result = await this.model.generateContent(fullPrompt);
      const aiMessage = result.response.text();

      this.chatHistory.push({
        role: 'assistant',
        content: aiMessage,
        timestamp: new Date(),
      });

      console.log('✅ Respuesta recibida de Gemini');
      return aiMessage;
    } catch (error: any) {
      console.error('❌ Error con Gemini:', error);
      
      if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
        throw new Error('⚠️ API Key inválida. Obtén una nueva en https://aistudio.google.com/app/apikey');
      }
      
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        throw new Error('⚠️ Límite de cuota alcanzado.\n\n💡 Soluciones:\n1. Espera 60 segundos\n2. Verifica tu cuota en https://aistudio.google.com\n3. Considera usar Gemini Flash (más económico)');
      }

      if (error.message?.includes('SAFETY')) {
        throw new Error('⚠️ Contenido bloqueado por filtros. Reformula tu pregunta.');
      }
      
      throw new Error(`❌ ${error.message || 'Error desconocido. Intenta de nuevo.'}`);
    }
  }

  /**
   * ✅ NUEVO: Comparar dos héroes con análisis IA detallado
   */
  async compareHeroes(hero1: Hero, hero2: Hero): Promise<AIComparison> {
    try {
      console.log('📤 Comparando héroes con Gemini...');

      // Rate limiting
      await this.waitForRateLimit();

      const userContext = await this.getUserContext();
      
      const prompt = `Como Galacta 💜, compara estos dos héroes de Marvel Rivals:

**${hero1.alias || hero1.name}**
- Rol: ${hero1.role}
- Dificultad: ${hero1.difficultyStars}/5⭐
- Descripción: ${hero1.description?.substring(0, 150)}
- Habilidades: ${hero1.abilities?.slice(0, 2).map(a => a.ability_name).join(', ')}

**${hero2.alias || hero2.name}**
- Rol: ${hero2.role}
- Dificultad: ${hero2.difficultyStars}/5⭐
- Descripción: ${hero2.description?.substring(0, 150)}
- Habilidades: ${hero2.abilities?.slice(0, 2).map(a => a.ability_name).join(', ')}
${userContext}

Responde en FORMATO JSON:
{
  "hero1Pros": ["pro1", "pro2", "pro3"],
  "hero1Cons": ["con1", "con2", "con3"],
  "hero2Pros": ["pro1", "pro2", "pro3"],
  "hero2Cons": ["con1", "con2", "con3"],
  "verdict": "Análisis breve de 1-2 oraciones",
  "recommendation": "Recomendación breve de 1-2 oraciones"
}

REGLAS:
- 3 pros y 3 cons por héroe
- Específicos y únicos
- Usa emojis en verdict y recommendation
- SOLO JSON, sin markdown

SOLO JSON válido.`;

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
        throw new Error('Respuesta inválida de IA');
      }

      console.log('✅ Comparación recibida de Gemini');
      return comparison;
    } catch (error: any) {
      console.error('❌ Error comparando héroes:', error);
      
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        throw new Error('⚠️ Límite de cuota alcanzado. Espera 60 segundos.');
      }
      
      // Fallback: análisis básico
      return {
        hero1Pros: [
          `${hero1.role} con dificultad ${hero1.difficultyStars}⭐`,
          'Habilidades únicas',
          'Buen potencial'
        ],
        hero1Cons: [
          'Requiere práctica',
          'Depende del equipo',
          'Vulnerable en situaciones específicas'
        ],
        hero2Pros: [
          `${hero2.role} con dificultad ${hero2.difficultyStars}⭐`,
          'Estilo de juego distinto',
          'Opciones tácticas variadas'
        ],
        hero2Cons: [
          'Curva de aprendizaje',
          'Necesita coordinación',
          'No siempre óptimo'
        ],
        verdict: `Ambos son excelentes! ${hero1.alias || hero1.name} es ${hero1.difficultyStars && hero1.difficultyStars <= 3 ? 'más accesible' : 'más desafiante'} 🎮`,
        recommendation: `Te recomiendo empezar con ${(hero1.difficultyStars || 3) <= (hero2.difficultyStars || 3) ? hero1.alias || hero1.name : hero2.alias || hero2.name}. ¡Ambos te harán mejor jugador! 💪✨`
      };
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

export default new GeminiService();h => h.role === 'Vanguard').slice(0, 5);
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