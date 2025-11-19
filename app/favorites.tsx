// app/favorites.tsx
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import FavoritesService, { FavoriteMessage } from '@/services/favoritesService';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteMessage[]>([]);

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const data = await FavoritesService.getFavorites();
    setFavorites(data);
  };

  const deleteFavorite = async (id: string) => {
    Alert.alert(
      '🗑️ Eliminar Favorito',
      '¿Seguro que quieres eliminar este consejo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await FavoritesService.deleteFavorite(id);
            loadFavorites();
          },
        },
      ]
    );
  };

  const shareFavorite = async (content: string) => {
    try {
      await Share.share({
        message: `💜 Consejo de Galacta:\n\n${content}`,
      });
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  const clearAll = () => {
    Alert.alert(
      '🧹 Limpiar Todo',
      '¿Quieres eliminar TODOS los favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todo',
          style: 'destructive',
          onPress: async () => {
            await FavoritesService.clearAll();
            loadFavorites();
          },
        },
      ]
    );
  };

  const renderFavorite = ({ item }: { item: FavoriteMessage }) => {
    const categoryIcon = FavoritesService.getCategoryIcon(item.category || 'other');
    const categoryName = FavoritesService.getCategoryName(item.category || 'other');

    return (
      <View style={[styles.favoriteCard, { backgroundColor: cardColor }]}>
        <View style={styles.favoriteHeader}>
          <View style={styles.categoryBadge}>
            <ThemedText style={styles.categoryIcon}>{categoryIcon}</ThemedText>
            <ThemedText style={styles.categoryText}>{categoryName}</ThemedText>
          </View>
          <ThemedText style={styles.favoriteDate}>
            {new Date(item.timestamp).toLocaleDateString()}
          </ThemedText>
        </View>

        <ThemedText style={styles.favoriteContent}>
          {item.content}
        </ThemedText>

        <View style={styles.favoriteActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => shareFavorite(item.content)}
          >
            <ThemedText style={styles.actionButtonText}>📤 Compartir</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteFavorite(item.id)}
          >
            <ThemedText style={[styles.actionButtonText, styles.deleteButtonText]}>
              🗑️ Eliminar
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <LinearGradient
        colors={['#fbbf24', '#f59e0b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>⭐ Favoritos</ThemedText>
          {favorites.length > 0 && (
            <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
              <ThemedText style={styles.clearButtonText}>🧹 Limpiar</ThemedText>
            </TouchableOpacity>
          )}
        </View>
        <ThemedText style={styles.headerSubtitle}>
          {favorites.length} {favorites.length === 1 ? 'consejo guardado' : 'consejos guardados'}
        </ThemedText>
      </LinearGradient>

      {/* Lista de favoritos */}
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.favoritesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyStateIcon}>⭐</ThemedText>
          <ThemedText style={styles.emptyStateTitle}>Sin favoritos</ThemedText>
          <ThemedText style={styles.emptyStateText}>
            Guarda consejos útiles de Galacta presionando el botón ⭐ Guardar
          </ThemedText>
          <TouchableOpacity
            style={styles.backButtonWrapper}
            onPress={() => router.back()}
          >
            <LinearGradient
              colors={['#9333ea', '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.backButton}
            >
              <ThemedText style={styles.backButtonText}>← Volver al Chat</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  clearButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  favoritesList: {
    padding: 20,
  },
  favoriteCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  favoriteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9333ea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryIcon: {
    fontSize: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  favoriteDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  favoriteContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  favoriteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  backButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});