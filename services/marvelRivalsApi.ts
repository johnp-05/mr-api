// services/marvelRivalsApi.ts
const BASE_URL = 'https://marvelrivalsapi.com/api/v1';
const IMAGE_BASE_URL = 'https://marvelrivalsapi.com';

// ⚠️ IMPORTANTE: Pon tu API Key aquí
const API_KEY = '45ed824889841759684ebee8de89ebdf2a4885a4ae346621131ba2c70dc21fb6';

export interface Hero {
  id: string;
  name: string;
  alias?: string;
  role: string;
  difficulty?: string;
  difficultyStars?: number;
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
   */
  private cleanHtml(text?: string | null): string {
    if (!text) return '';
    
    let cleaned = text.replace(/<[^>]*>/g, '');
    
    cleaned = cleaned
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
    
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  /**
   * Capitalizar nombre
   */
  private capitalizeName(name?: string | null): string | undefined {
    if (!name) return undefined;
    
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Convertir dificultad a número de estrellas (1-5)
   */
  private getDifficultyStars(difficulty?: string | null): number {
    if (!difficulty) return 3;
    
    const diff = difficulty.toLowerCase();
    
    if (diff.includes('very easy') || diff.includes('beginner')) return 1;
    if (diff.includes('easy')) return 2;
    if (diff.includes('medium') || diff.includes('moderate') || diff.includes('normal')) return 3;
    if (diff.includes('hard') || diff.includes('challenging')) return 4;
    if (diff.includes('very hard') || diff.includes('expert')) return 5;
    
    const num = parseInt(diff);
    if (!isNaN(num) && num >= 1 && num <= 5) return num;
    
    return 3;
  }

  /**
   * Construir URL completa de imagen
   */
  private buildImageUrl(imagePath?: string | null): string | undefined {
    if (!imagePath) return undefined;
    
    // Si ya es una URL completa, devolverla
    if (imagePath.startsWith('http')) return imagePath;
    
    // Asegurarse de que empiece con /
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    // Construir URL completa
    return `${IMAGE_BASE_URL}${cleanPath}`;
  }

  /**
   * Procesar héroe desde la API
   */
  private processHero(hero: any): Hero {
    // La API devuelve imageUrl directamente
    const imageUrl = this.buildImageUrl(hero.imageUrl);

    // Procesar habilidades
    const abilities = (hero.abilities || []).map((ability: any) => ({
      ability_name: this.cleanHtml(ability.name || ability.ability_name),
      description: this.cleanHtml(ability.description),
      cooldown: ability.cooldown,
    }));

    return {
      id: hero.id || hero.name,
      name: this.cleanHtml(hero.name),
      alias: this.capitalizeName(this.cleanHtml(hero.alias || hero.real_name)),
      role: hero.role,
      difficulty: hero.difficulty,
      difficultyStars: this.getDifficultyStars(hero.difficulty),
      description: this.cleanHtml(hero.bio || hero.description),
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
    const heroesData = await this.request<any[]>('/heroes');
    
    if (!Array.isArray(heroesData)) {
      console.error('⚠️ Respuesta no es un array:', heroesData);
      return [];
    }
    
    const processedHeroes = heroesData.map(hero => this.processHero(hero));
    console.log('🦸‍♂️ Héroes procesados:', processedHeroes.length);
    
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
    
    const heroData = await this.request<any>(`/heroes/hero/${encodedName}`);
    
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