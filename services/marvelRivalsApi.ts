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
  // Imágenes
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
   * Construir URL completa de imagen
   */
  private buildImageUrl(partialPath?: string | null): string | undefined {
    if (!partialPath) return undefined;
    if (partialPath.startsWith('http')) return partialPath;
    // Asegurarse de que la ruta empiece con /
    const path = partialPath.startsWith('/') ? partialPath : `/${partialPath}`;
    return `${IMAGE_BASE_URL}${path}`;
  }

  /**
   * Procesar héroe y obtener la mejor imagen disponible
   */
  private processHero(hero: any): Hero {
    // Priorizar imágenes: image_square > image_transverse > portrait > icon
    const imageUrl = this.buildImageUrl(
      hero.image_square || 
      hero.image_transverse || 
      hero.portrait || 
      hero.icon
    );

    return {
      id: hero.id || hero.name,
      name: hero.name,
      alias: hero.alias || hero.real_name,
      role: hero.role,
      difficulty: hero.difficulty,
      description: hero.description,
      abilities: hero.abilities || [],
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
      console.log('✅ Respuesta recibida:', data);
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
    
    return processedHeroes;
  }

  /**
   * Obtener héroe específico
   */
  async getHero(heroName: string): Promise<Hero> {
    // Limpiar y formatear el nombre
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