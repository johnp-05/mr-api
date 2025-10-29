// services/marvelRivalsApi.ts
const BASE_URL = 'https://marvelrivalsapi.com/api/v1';
const IMAGE_BASE_URL = 'https://marvelrivalsapi.com/rivals';

// ⚠️ IMPORTANTE: Obtén tu API Key GRATIS en https://marvelrivalsapi.com/dashboard
const API_KEY = 'c46b6afd5fb8761a18ebf43f0113aa859b1f84fc55f8225feadad33c89ab2de3'; // <- REEMPLAZAR

export interface Hero {
  id: string;
  name: string;
  alias?: string;
  role: string;
  difficulty?: string;
  description?: string;
  abilities?: Ability[];
  // Imágenes
  image_square?: string;
  image_transverse?: string;
  icon?: string;
  portrait?: string;
}

export interface Ability {
  ability_name: string;
  description: string;
  cooldown?: number | string;
  icon?: string;
}

export interface PlayerStats {
  username: string;
  rank?: string;
  level?: number;
  mmr?: number;
  heroes?: HeroStat[];
}

export interface HeroStat {
  name: string;
  gamesPlayed: number;
  winRate: number;
}

class MarvelRivalsAPI {
  
  /**
   * Construir URL completa de imagen
   * La API devuelve rutas parciales como /costumes/hero.png
   * Necesitamos agregar https://marvelrivalsapi.com/rivals
   */
  private buildImageUrl(partialPath: string | null | undefined): string | undefined {
    if (!partialPath) return undefined;
    // Si ya es una URL completa, retornarla
    if (partialPath.startsWith('http')) return partialPath;
    // Si empieza con /, agregar el base URL
    return `${IMAGE_BASE_URL}${partialPath}`;
  }

  /**
   * Procesar héroe para construir URLs de imágenes
   */
  private processHero(hero: any): Hero {
    return {
      id: hero.id || hero.name,
      name: hero.name,
      alias: hero.alias || hero.real_name,
      role: hero.role,
      difficulty: hero.difficulty,
      description: hero.description,
      abilities: hero.abilities || [],
      // Construir URLs completas de imágenes
      image_square: this.buildImageUrl(hero.image_square),
      image_transverse: this.buildImageUrl(hero.image_transverse),
      icon: this.buildImageUrl(hero.icon),
      portrait: this.buildImageUrl(hero.portrait),
    };
  }

  /**
   * Método genérico para hacer peticiones
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('⚠️ API Key inválida o no configurada. Obtén una en https://marvelrivalsapi.com/dashboard');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los héroes CON IMÁGENES
   */
  async getHeroes(): Promise<Hero[]> {
    const response = await this.request<any>('/heroes');
    const heroesData = response.heroes || response.data || response;
    
    if (!Array.isArray(heroesData)) {
      console.error('Respuesta inesperada:', response);
      return [];
    }
    
    return heroesData.map(hero => this.processHero(hero));
  }

  /**
   * Obtener un héroe específico CON IMÁGENES
   */
  async getHero(heroName: string): Promise<Hero> {
    // Encode el nombre para URLs (ej: "Spider-Man" -> "Spider-Man")
    const encodedName = encodeURIComponent(heroName);
    const response = await this.request<any>(`/heroes/hero/${encodedName}`);
    const heroData = response.hero || response.data || response;
    
    return this.processHero(heroData);
  }

  /**
   * Obtener estadísticas de un jugador
   */
  async getPlayerStats(username: string): Promise<PlayerStats> {
    const encodedUsername = encodeURIComponent(username);
    const response = await this.request<any>(`/player/${encodedUsername}`);
    const playerData = response.player || response.data || response;
    
    return {
      username: playerData.username || username,
      rank: playerData.rank,
      level: playerData.level,
      mmr: playerData.mmr,
      heroes: playerData.heroes || [],
    };
  }

  /**
   * Obtener noticias
   */
  async getNews(): Promise<any[]> {
    const response = await this.request<any>('/news');
    return response.news || response.data || response || [];
  }

  /**
   * Obtener eventos
   */
  async getEvents(): Promise<any[]> {
    const response = await this.request<any>('/events');
    return response.events || response.data || response || [];
  }
}

export default new MarvelRivalsAPI();