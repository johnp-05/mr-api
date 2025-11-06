// services/favoritesService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteMessage {
  id: string;
  content: string;
  timestamp: Date;
  category?: string;
}

const FAVORITES_KEY = '@galacta_favorites';
const FAVORITE_HEROES_KEY = '@galacta_favorite_heroes';

class FavoritesService {
  /**
   * ===== FAVORITOS DE MENSAJES =====
   */
  
  async saveFavorite(content: string, category?: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      
      const newFavorite: FavoriteMessage = {
        id: Date.now().toString(),
        content,
        timestamp: new Date(),
        category: category || this.detectCategory(content),
      };

      favorites.unshift(newFavorite);
      
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      console.log('✅ Favorito guardado');
    } catch (error) {
      console.error('❌ Error guardando favorito:', error);
      throw error;
    }
  }

  async getFavorites(): Promise<FavoriteMessage[]> {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      
      if (!data) return [];
      
      const favorites = JSON.parse(data);
      
      return favorites.map((fav: any) => ({
        ...fav,
        timestamp: new Date(fav.timestamp),
      }));
    } catch (error) {
      console.error('❌ Error obteniendo favoritos:', error);
      return [];
    }
  }

  async deleteFavorite(id: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter(fav => fav.id !== id);
      
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
      console.log('✅ Favorito eliminado');
    } catch (error) {
      console.error('❌ Error eliminando favorito:', error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
      console.log('✅ Favoritos limpiados');
    } catch (error) {
      console.error('❌ Error limpiando favoritos:', error);
      throw error;
    }
  }

  /**
   * ===== HÉROES FAVORITOS =====
   */
  
  /**
   * Agregar un héroe a favoritos
   */
  async addFavoriteHero(heroName: string): Promise<void> {
    try {
      const favorites = await this.getFavoriteHeroes();
      
      // Evitar duplicados
      if (favorites.includes(heroName)) {
        console.log('⚠️ Héroe ya está en favoritos');
        return;
      }
      
      favorites.push(heroName);
      
      await AsyncStorage.setItem(FAVORITE_HEROES_KEY, JSON.stringify(favorites));
      console.log('✅ Héroe agregado a favoritos:', heroName);
    } catch (error) {
      console.error('❌ Error agregando héroe favorito:', error);
      throw error;
    }
  }

  /**
   * Toggle favorito (agregar/quitar)
   */
  async toggleFavoriteHero(heroName: string): Promise<boolean> {
    const isFavorite = await this.isHeroFavorite(heroName);
    
    if (isFavorite) {
      await this.removeFavoriteHero(heroName);
      return false;
    } else {
      await this.addFavoriteHero(heroName);
      return true;
    }
  }

  /**
   * Obtener todos los héroes favoritos
   */
  async getFavoriteHeroes(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(FAVORITE_HEROES_KEY);
      
      if (!data) return [];
      
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error obteniendo héroes favoritos:', error);
      return [];
    }
  }

  /**
   * Eliminar un héroe de favoritos
   */
  async removeFavoriteHero(heroName: string): Promise<void> {
    try {
      const favorites = await this.getFavoriteHeroes();
      const filtered = favorites.filter(name => name !== heroName);
      
      await AsyncStorage.setItem(FAVORITE_HEROES_KEY, JSON.stringify(filtered));
      console.log('✅ Héroe eliminado de favoritos:', heroName);
    } catch (error) {
      console.error('❌ Error eliminando héroe favorito:', error);
      throw error;
    }
  }

  /**
   * Verificar si un héroe está en favoritos
   */
  async isHeroFavorite(heroName: string): Promise<boolean> {
    const favorites = await this.getFavoriteHeroes();
    return favorites.includes(heroName);
  }

  /**
   * Limpiar todos los héroes favoritos
   */
  async clearFavoriteHeroes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAVORITE_HEROES_KEY);
      console.log('✅ Héroes favoritos limpiados');
    } catch (error) {
      console.error('❌ Error limpiando héroes favoritos:', error);
      throw error;
    }
  }

  /**
   * ===== UTILIDADES =====
   */
  
  private detectCategory(content: string): string {
    const lower = content.toLowerCase();
    
    if (lower.includes('spider') || lower.includes('iron man') || lower.includes('hulk') || 
        lower.includes('héroe') || lower.includes('hero') || lower.includes('jugar con')) {
      return 'hero-tips';
    }
    
    if (lower.includes('composición') || lower.includes('comp') || lower.includes('equipo') || 
        lower.includes('team')) {
      return 'composition';
    }
    
    if (lower.includes('estrategia') || lower.includes('tips') || lower.includes('consejo') ||
        lower.includes('cómo') || lower.includes('ganar')) {
      return 'strategy';
    }
    
    return 'other';
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'hero-tips': return '🦸‍♂️';
      case 'composition': return '🎯';
      case 'strategy': return '💡';
      default: return '⭐';
    }
  }

  getCategoryName(category: string): string {
    switch (category) {
      case 'hero-tips': return 'Tips de Héroe';
      case 'composition': return 'Composición';
      case 'strategy': return 'Estrategia';
      default: return 'General';
    }
  }

  /**
   * Obtener estadísticas de uso
   */
  async getStats(): Promise<{
    totalFavorites: number;
    totalHeroes: number;
    categories: Record<string, number>;
  }> {
    const favorites = await this.getFavorites();
    const heroes = await this.getFavoriteHeroes();
    
    const categories = favorites.reduce((acc, fav) => {
      const cat = fav.category || 'other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFavorites: favorites.length,
      totalHeroes: heroes.length,
      categories,
    };
  }
}

export default new FavoritesService();