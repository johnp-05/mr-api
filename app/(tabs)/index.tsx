// services/marvelRivalsApi.ts
const BASE_URL = 'https://marvelrivalsapi.com/api/v1';
const IMAGE_BASE_URL = 'https://marvelrivalsapi.com/rivals';

// ⚠️ IMPORTANTE: Pon tu API Key aquí
const API_KEY = '45ed824889841759684ebee8de89ebdf2a4885a4ae346621131ba2c70dc21fb6'; // <- REEMPLAZAR

export interface Hero {
  id: string;
  name: string;
  alias?: string;
  role: string;
  difficulty?: string;
  description?: string;
  abilities?: Ability[];
  imageUrl?: string;
}

export interface Ability {
  ability_name: string;
  description: string;
  cooldown?: number | string;
}

export interface PlayerStats {
  username: string;
  rank?: string;
  level?: number;
  heroes?: HeroStat[];
}

export interface HeroStat {
  name: string;
  gamesPlayed: number;
  winRate: number;
}

class MarvelRivalsAPI {
  
  /**
   * Limpiar HTML de un texto
   * Convierte: "<p>Hola <strong>mundo</strong></p>" -> "Hola mundo"
   */
  private cleanHtml(text?: string | null): string {
    if (!text) return '';
    
    // Remover todas las etiquetas HTML
    let cleaned = text.replace(/<[^>]*>/g, '');
    
    // Decodificar entidades HTML comunes
    cleaned = cleaned
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
    
    // Limpiar espacios múltiples
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  /**
   * Construir URL completa de imagen
   */
  private buildImageUrl(partialPath?: string | null): string | undefined {
    if (!partialPath) return undefined;
    if (partialPath.startsWith('http')) return partialPath;
    const path = partialPath.startsWith('/') ? partialPath : `/${partialPath}`;
    return `${IMAGE_BASE_URL}${path}`;
  }

  /**
   * Procesar héroe y limpiar HTML
   */
  private processHero(hero: any): Hero {
    const imageUrl = this.buildImageUrl(
      hero.image_square || 
      hero.image_transverse || 
      hero.portrait || 
      hero.icon
    );

    // Procesar habilidades y limpiar HTML
    const abilities = (hero.abilities || []).map((ability: any) => ({
      ability_name: this.cleanHtml(ability.ability_name || ability.name),
      description: this.cleanHtml(ability.description),
      cooldown: ability.cooldown,
    }));

    return {
      id: hero.id || hero.name,
      name: this.cleanHtml(hero.name),
      alias: this.cleanHtml(hero.alias || hero.real_name),
      role: hero.role,
      difficulty: hero.difficulty,
      description: this.cleanHtml(hero.description),
      abilities,
      imageUrl,
    };
  }

  /**
   * Petición genérica
   */
  private async request<T>(endpoint: string): Promise<T> {
    try {
      console.log('🔍 Llamando a:', `${BASE_URL}${endpoint}`);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('⚠️ API Key inválida. Obtén una en https://marvelrivalsapi.com/dashboard');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('❌ Error API:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los héroes
   */
  async getHeroes(): Promise<Hero[]> {
    const response = await this.request<any>('/heroes');
    const heroesData = response.heroes || response.data || response;
    
    if (!Array.isArray(heroesData)) {
      console.error('⚠️ Respuesta no es un array:', response);
      return [];
    }
    
    const processedHeroes = heroesData.map(hero => this.processHero(hero));
    console.log('🦸‍♂️ Héroes procesados:', processedHeroes.length);
    
    // Mostrar ejemplo de un héroe procesado
    if (processedHeroes.length > 0) {
      console.log('📝 Ejemplo héroe:', processedHeroes[0]);
    }
    
    return processedHeroes;
  }

  /**
   * Obtener héroe específico
   */
  async getHero(heroName: string): Promise<Hero> {
    const cleanName = heroName.toLowerCase().trim();
    const encodedName = encodeURIComponent(cleanName);
    
    console.log('🔍 Buscando héroe:', cleanName);
    
    const response = await this.request<any>(`/heroes/hero/${encodedName}`);
    const heroData = response.hero || response.data || response;
    
    return this.processHero(heroData);
  }

  /**
   * Obtener stats de jugador
   */
  async getPlayerStats(username: string): Promise<PlayerStats> {
    const response = await this.request<any>(`/player/${encodeURIComponent(username)}`);
    const playerData = response.player || response.data || response;
    
    return {
      username: playerData.username || username,
      rank: playerData.rank,
      level: playerData.level,
      heroes: playerData.heroes || [],
    };
  }
}

export default new MarvelRivalsAPI();