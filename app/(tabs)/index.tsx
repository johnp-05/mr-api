// app/(tabs)/index.tsx
import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  TouchableOpacity,
  View,
  TextInput
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import MarvelRivalsAPI, { Hero } from '@/services/marvelRivalsApi';

export default function HomeScreen() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [filteredHeroes, setFilteredHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    loadHeroes();
  }, []);

  useEffect(() => {
    filterHeroes();
  }, [searchQuery, selectedRole, heroes]);

  const loadHeroes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MarvelRivalsAPI.getHeroes();
      setHeroes(data);
      setFilteredHeroes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los héroes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterHeroes = () => {
    let filtered = heroes;

    // Filtrar por rol
    if (selectedRole) {
      filtered = filtered.filter(hero => hero.role === selectedRole);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(hero => 
        hero.name.toLowerCase().includes(query) ||
        hero.alias?.toLowerCase().includes(query)
      );
    }

    setFilteredHeroes(filtered);
  };

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'Duelist': 
        return { color: '#e23636', icon: '⚔️' };
      case 'Vanguard': 
        return { color: '#3b82f6', icon: '🛡️' };
      case 'Strategist': 
        return { color: '#10b981', icon: '✨' };
      default: 
        return { color: '#666', icon: '⭐' };
    }
  };

  // Construir URL completa de imagen
  const getImageUrl = (hero: Hero) => {
    if (!hero.imageUrl) return null;
    
    // Si ya es una URL completa, retornarla
    if (hero.imageUrl.startsWith('http')) {
      return hero.imageUrl;
    }
    
    // Construir URL completa
    const cleanPath = hero.imageUrl.startsWith('/') 
      ? hero.imageUrl 
      : `/${hero.imageUrl}`;
    
    return `https://marvelrivalsapi.com${cleanPath}`;
  };

  const roles = ['Duelist', 'Vanguard', 'Strategist'];

  const renderHeroCard = ({ item: hero }: { item: Hero }) => {
    const roleConfig = getRoleConfig(hero.role);
    
    return (
      <TouchableOpacity
        style={[styles.heroCard, { backgroundColor: cardColor }]}
        onPress={() => router.push(`/hero/${hero.id}`)}
        activeOpacity={0.7}
      >
        {hero.imageUrl ? (
          <Image
            source={{ uri: hero.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.heroImagePlaceholder, { backgroundColor: roleConfig.color }]}>
            <ThemedText style={styles.heroPlaceholderIcon}>
              {roleConfig.icon}
            </ThemedText>
          </View>
        )}
        
        <View style={styles.heroInfo}>
          <ThemedText style={styles.heroName} numberOfLines={1}>
            {hero.name}
          </ThemedText>
          {hero.alias && (
            <ThemedText style={styles.heroAlias} numberOfLines={1}>
              {hero.alias}
            </ThemedText>
          )}
          <View style={[styles.roleBadge, { backgroundColor: roleConfig.color }]}>
            <ThemedText style={styles.roleIcon}>{roleConfig.icon}</ThemedText>
            <ThemedText style={styles.roleText}>{hero.role}</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e23636" />
        <ThemedText style={styles.loadingText}>Cargando héroes...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorIcon}>❌</ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={loadHeroes}>
          <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Marvel Rivals
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {filteredHeroes.length} héroes disponibles
        </ThemedText>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, { borderColor }]}>
          <ThemedText style={styles.searchIcon}>🔍</ThemedText>
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Buscar héroe..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <ThemedText style={styles.clearIcon}>✕</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros de rol */}
      <View style={styles.roleFilters}>
        <TouchableOpacity
          style={[
            styles.roleFilterButton,
            !selectedRole && styles.roleFilterButtonActive
          ]}
          onPress={() => setSelectedRole(null)}
        >
          <ThemedText style={[
            styles.roleFilterText,
            !selectedRole && styles.roleFilterTextActive
          ]}>
            Todos
          </ThemedText>
        </TouchableOpacity>
        
        {roles.map(role => {
          const config = getRoleConfig(role);
          const isActive = selectedRole === role;
          
          return (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleFilterButton,
                isActive && { backgroundColor: config.color }
              ]}
              onPress={() => setSelectedRole(isActive ? null : role)}
            >
              <ThemedText style={styles.roleFilterIcon}>
                {config.icon}
              </ThemedText>
              <ThemedText style={[
                styles.roleFilterText,
                isActive && styles.roleFilterTextActive
              ]}>
                {role}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Lista de héroes */}
      <FlatList
        data={filteredHeroes}
        renderItem={renderHeroCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.heroList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateIcon}>🔍</ThemedText>
            <ThemedText style={styles.emptyStateText}>
              No se encontraron héroes
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#e23636',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  roleFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  roleFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#333',
    gap: 6,
  },
  roleFilterButtonActive: {
    backgroundColor: '#e23636',
  },
  roleFilterIcon: {
    fontSize: 16,
  },
  roleFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.7,
  },
  roleFilterTextActive: {
    opacity: 1,
  },
  heroList: {
    padding: 16,
  },
  heroCard: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  heroImagePlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderIcon: {
    fontSize: 64,
  },
  heroInfo: {
    padding: 12,
  },
  heroName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  heroAlias: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  roleIcon: {
    fontSize: 14,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    opacity: 0.7,
  },
});