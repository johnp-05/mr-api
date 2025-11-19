// services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import MarvelRivalsAPI, { Hero } from './marvelRivalsApi';
import FavoritesService from './favoritesService';

// 🔑 API KEY CONFIGURADA
// Obtén una gratis en: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = 'AIzaSyD5BJqxnS0b8Vm3U7jeqe9G-jWVXitNmIo';

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
  private readonly MIN_REQUEST_INTERVAL = 8000; // 8 segundos entre requests
  private requestCount: number = 0;
  private readonly MAX_REQUESTS_PER_MINUTE = 10;

  constructor() {
    this.initializeAPI();
  }

  /**
   * Inicializar API de Gemini
   */
  private async initializeAPI() {
    try {
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyD5BJqxnS0b8Vm3U7jeqe9G-jWVXitNmIo') {
        console.error('⚠️ GEMINI_API_KEY no configurada');
        return;
      }

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

      // Cargar héroes
      this.heroes = await MarvelRivalsAPI.getHeroes();
      console.log('✅ Gemini inicializado con', this.heroes.length, 'héroes');
    } catch (error) {
      console.error('❌ Error inicializando Gemini:', error);
    }
  }

  /**
   * Verificar rate limiting
   */
  private async waitIfNeeded() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ Esperando ${waitTime}ms para evitar rate limit...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Crear contexto del sistema
   */
  private async getSystemContext(): Promise<string> {
    const favoriteHeroes = await FavoritesService.getFavoriteHeroes();
    
    let context = `Eres Galacta 💜, la entrenadora personal de IA para Marvel Rivals.

PERSONALIDAD:
- Amigable, motivadora y experta en el juego
- Usas emojis estratégicamente (🦸‍♂️⚔️🎯💡🔥✨)
- Respuestas claras, concisas y útiles
- Animas al jugador a mejorar

REGLAS:
1. Responde SOLO sobre Marvel Rivals (héroes, estrategias, composiciones)
2. Si te preguntan otra cosa, redirige al tema del juego
3. Usa markdown para listas y énfasis
4. Máximo 3-4 párrafos por respuesta

HÉROES DISPONIBLES (${this.heroes.length}):
${this.heroes.slice(0, 10).map(h => `- ${h.alias || h.name} (${h.role})`).join('\n')}
... y ${this.heroes.length - 10} más.`;

    if (favoriteHeroes.length > 0) {
      context += `\n\n🎯 HÉROES FAVORITOS DEL USUARIO: ${favoriteHeroes.join(', ')}
- Considera estos héroes en tus recomendaciones
- El usuario tiene interés especial en ellos`;
    }

    return context;
  }

  /**
   * Enviar mensaje a Gemini
   */
  async sendMessage(userMessage: string): Promise<string> {
    try {
      if (!this.model) {
        await this.initializeAPI();
        if (!this.model) {
          return '⚠️ No puedo conectar con la IA. Verifica tu API Key de Gemini.';
        }
      }

      // Rate limiting
      await this.waitIfNeeded();

      // Contexto del sistema
      const systemContext = await this.getSystemContext();

      // Construir historial
      const history = this.chatHistory.slice(-4).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Crear chat
      const chat = this.model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 1024,
        },
      });

      // Enviar mensaje con contexto
      const fullPrompt = this.chatHistory.length === 0 
        ? `${systemContext}\n\nUsuario: ${userMessage}`
        : userMessage;

      const result = await chat.sendMessage(fullPrompt);
      const response = result.response.text();

      // Guardar en historial
      this.chatHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      });

      this.chatHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });

      // Limitar historial a 10 mensajes
      if (this.chatHistory.length > 10) {
        this.chatHistory = this.chatHistory.slice(-10);
      }

      return response;

    } catch (error: any) {
      console.error('❌ Error Gemini:', error);
      
      if (error.message?.includes('429')) {
        return '⏳ Demasiadas peticiones. Espera unos segundos e intenta de nuevo.';
      }
      
      if (error.message?.includes('quota')) {
        return '⚠️ Límite de cuota alcanzado. Intenta más tarde o verifica tu API Key.';
      }
      
      return '❌ Error procesando tu mensaje. Intenta de nuevo.';
    }
  }

  /**
   * Comparar dos héroes con IA
   */
  async compareHeroes(hero1: Hero, hero2: Hero): Promise<AIComparison> {
    try {
      if (!this.model) {
        await this.initializeAPI();
      }

      await this.waitIfNeeded();

      const prompt = `Como Galacta, analiza estos 2 héroes de Marvel Rivals:

HÉROE 1: ${hero1.alias || hero1.name}
- Rol: ${hero1.role}
- Dificultad: ${'⭐'.repeat(hero1.difficultyStars || 3)}
- Descripción: ${hero1.description || 'N/A'}

HÉROE 2: ${hero2.alias || hero2.name}
- Rol: ${hero2.role}
- Dificultad: ${'⭐'.repeat(hero2.difficultyStars || 3)}
- Descripción: ${hero2.description || 'N/A'}

Responde SOLO en este formato JSON:
{
  "hero1Pros": ["pro1", "pro2", "pro3"],
  "hero1Cons": ["con1", "con2"],
  "hero2Pros": ["pro1", "pro2", "pro3"],
  "hero2Cons": ["con1", "con2"],
  "verdict": "Resumen de 2-3 líneas sobre cuál es mejor y por qué",
  "recommendation": "Recomendación personalizada de 2-3 líneas"
}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Limpiar respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Respuesta inválida de la IA');
      }

      const comparison: AIComparison = JSON.parse(jsonMatch[0]);
      return comparison;

    } catch (error) {
      console.error('❌ Error comparando héroes:', error);
      
      // Fallback
      return {
        hero1Pros: [
          'Héroe versátil y efectivo',
          'Buen daño en su rol',
          'Habilidades útiles para el equipo',
        ],
        hero1Cons: [
          'Requiere práctica para dominar',
          'Vulnerable sin apoyo',
        ],
        hero2Pros: [
          'Excelente en su rol específico',
          'Alto impacto en partidas',
          'Mecánicas interesantes',
        ],
        hero2Cons: [
          'Curva de aprendizaje',
          'Depende de la composición',
        ],
        verdict: `${hero1.alias || hero1.name} y ${hero2.alias || hero2.name} son excelentes opciones. ${hero1.alias || hero1.name} destaca por su versatilidad mientras que ${hero2.alias || hero2.name} sobresale en situaciones específicas.`,
        recommendation: `Te recomiendo probar ambos héroes y elegir según tu estilo de juego. ${hero1.alias || hero1.name} para mayor flexibilidad, ${hero2.alias || hero2.name} para máximo impacto en tu rol.`,
      };
    }
  }

  /**
   * Obtener sugerencias rápidas
   */
  getQuickSuggestions(): string[] {
    return [
      '¿Qué héroe me recomiendas para empezar?',
      'Dame tips para jugar mejor',
      '¿Cuál es la mejor composición 2-2-2?',
      'Compara Spider-Man vs Iron Man',
      '¿Cómo counterar a Hela?',
      'Estrategias para ganar más partidas',
    ];
  }

  /**
   * Limpiar historial
   */
  clearHistory() {
    this.chatHistory = [];
    console.log('🧹 Historial limpiado');
  }

  /**
   * Obtener información de un héroe
   */
  getHeroInfo(heroName: string): Hero | undefined {
    const searchName = heroName.toLowerCase();
    return this.heroes.find(
      h => 
        h.name.toLowerCase().includes(searchName) ||
        h.alias?.toLowerCase().includes(searchName)
    );
  }
}

export default new GeminiService();