// services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import MarvelRivalsAPI, { Hero } from './marvelRivalsApi';
import FavoritesService from './favoritesService';

const GEMINI_API_KEY = 'AIzaSyDSvtTiyWdxA9fAoXEWDt-4ngTlMqQZzqw';

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

  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
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
      .slice(0, 30)
      .map(h => `${h.name} (${h.role}, ${h.difficultyStars}⭐)`)
      .join(', ');

    const userContext = await this.getUserContext();

    return `Eres Galacta 💜, entrenadora experta de Marvel Rivals (juego 6v6 de héroes).

**PERSONALIDAD:** Amigable, motivadora, usa emojis, fresca y moderna.

**ROLES:**
- Duelist ⚔️: Daño alto
- Vanguard 🛡️: Tanque
- Strategist ✨: Soporte

**HÉROES DISPONIBLES (${this.heroes.length} total):**
${heroSummary}${this.heroes.length > 30 ? '...' : ''}
${userContext}

**INSTRUCCIONES:**
1. Responde en 3-5 párrafos MAX
2. Usa emojis estratégicamente
3. Menciona rol del héroe con emoji
4. Para principiantes: héroes de 1-2⭐
5. Composición ideal: 2 Duelist, 2 Vanguard, 2 Strategist
6. Sé entusiasta y motivadora
7. Considera los héroes favoritos del usuario en tus recomendaciones

Responde en español, claro y directo.`;
  }

  async sendMessage(userMessage: string): Promise<string> {
    try {
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
          const abilities = heroInfo.abilities?.slice(0, 3).map(a => a.ability_name).join(', ') || 'N/A';
          enhancedMessage = `${userMessage}\n\n[CONTEXTO]: ${heroInfo.name} es ${heroInfo.role} (${heroInfo.difficultyStars}⭐). ${heroInfo.description?.substring(0, 150)}... Habilidades: ${abilities}`;
        }
      }

      const recentHistory = this.chatHistory.slice(-4).map(msg => 
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

      return aiMessage;
    } catch (error: any) {
      console.error('❌ Error con Gemini:', error);
      
      if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
        throw new Error('⚠️ API Key inválida. Obtén una en https://aistudio.google.com/app/apikey');
      }
      
      if (error.message?.includes('quota') || error.message?.includes('limit')) {
        throw new Error('⚠️ Has alcanzado el límite de la API. Espera unos minutos.');
      }

      if (error.message?.includes('SAFETY')) {
        throw new Error('⚠️ Contenido bloqueado por filtros de seguridad. Reformula tu pregunta.');
      }
      
      throw new Error('No pude procesar tu mensaje. Intenta de nuevo.');
    }
  }

  /**
   * ✅ NUEVO: Comparar dos héroes con análisis IA detallado
   */
  async compareHeroes(hero1: Hero, hero2: Hero): Promise<AIComparison> {
    try {
      const userContext = await this.getUserContext();
      
      const prompt = `Como Galacta 💜, compara estos dos héroes de Marvel Rivals:

**${hero1.alias || hero1.name}**
- Rol: ${hero1.role}
- Dificultad: ${hero1.difficultyStars}/5⭐
- Descripción: ${hero1.description}
- Habilidades: ${hero1.abilities?.map(a => a.ability_name).join(', ')}

**${hero2.alias || hero2.name}**
- Rol: ${hero2.role}
- Dificultad: ${hero2.difficultyStars}/5⭐
- Descripción: ${hero2.description}
- Habilidades: ${hero2.abilities?.map(a => a.ability_name).join(', ')}
${userContext}

Debes responder en FORMATO JSON ESTRICTO:
{
  "hero1Pros": ["pro1", "pro2", "pro3"],
  "hero1Cons": ["con1", "con2", "con3"],
  "hero2Pros": ["pro1", "pro2", "pro3"],
  "hero2Cons": ["con1", "con2", "con3"],
  "verdict": "Análisis comparativo de 2-3 oraciones sobre cuál es mejor y por qué",
  "recommendation": "Recomendación personalizada de 2-3 oraciones sobre cuál debería jugar el usuario"
}

REGLAS:
1. Cada héroe DEBE tener EXACTAMENTE 3 pros y 3 cons
2. Los pros/cons deben ser específicos y únicos (NO genéricos)
3. El veredicto debe ser imparcial pero claro
4. La recomendación debe considerar el nivel de habilidad del usuario
5. USA EMOJIS en el veredicto y recomendación
6. Si el usuario tiene favoritos, menciónalo en la recomendación

SOLO devuelve JSON válido, sin explicaciones adicionales.`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Limpiar respuesta (remover markdown code blocks si existen)
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

      return comparison;
    } catch (error: any) {
      console.error('❌ Error comparando héroes:', error);
      
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
          'Vulnerable en algunas situaciones'
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
        verdict: `Ambos héroes son excelentes! ${hero1.alias || hero1.name} es ${hero1.difficultyStars && hero1.difficultyStars <= 3 ? 'más accesible' : 'más desafiante'}, mientras que ${hero2.alias || hero2.name} ${hero2.difficultyStars && hero2.difficultyStars <= 3 ? 'es ideal para empezar' : 'requiere más experiencia'} 🎮`,
        recommendation: `Te recomendaría empezar con ${(hero1.difficultyStars || 3) <= (hero2.difficultyStars || 3) ? hero1.alias || hero1.name : hero2.alias || hero2.name} y luego practicar con el otro. ¡Ambos te harán mejor jugador! 💪✨`
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

    const abilities = hero.abilities?.map(a => `- ${a.ability_name}`).join('\n') || 'N/A';
    const userContext = await this.getUserContext();
    
    const prompt = `Como Galacta 💜, analiza al héroe ${hero.name} (${hero.alias}):

**Datos:**
- Rol: ${hero.role}
- Dificultad: ${hero.difficultyStars}/5⭐
- Descripción: ${hero.description}
- Habilidades:
${abilities}
${userContext}

Da un análisis completo (5 párrafos) sobre:
1. ¿Para qué tipo de jugador es ideal?
2. Pros y contras principales
3. Cómo jugarlo efectivamente
4. Synergias con otros héroes
5. Tips avanzados

Usa emojis y sé entusiasta.`;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async suggestComposition(context?: string): Promise<string> {
    const duelists = this.heroes.filter(h => h.role === 'Duelist').slice(0, 10);
    const vanguards = this.heroes.filter(h => h.role === 'Vanguard').slice(0, 10);
    const strategists = this.heroes.filter(h => h.role === 'Strategist').slice(0, 10);
    const userContext = await this.getUserContext();

    const prompt = `Como Galacta 💜, sugiere una composición de equipo balanceada para Marvel Rivals.

**Héroes disponibles:**
- Duelists: ${duelists.map(h => h.name).join(', ')}
- Vanguards: ${vanguards.map(h => h.name).join(', ')}
- Strategists: ${strategists.map(h => h.name).join(', ')}

${context ? `**Contexto:** ${context}` : ''}
${userContext}

Sugiere una comp 6v6 ideal (2-2-2) explicando:
1. Por qué elegiste cada héroe
2. Synergias del equipo
3. Estrategia general
4. Tips para ejecutarla

Responde en 4-5 párrafos con emojis.`;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}

export default new GeminiService();