// app/(tabs)/index.tsx
import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl,
  View,
  TextInput
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MarvelRivalsAPI, { Hero } from '@/services/marvelRivalsApi';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function HeroesScreen() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [filteredHeroes, setFilteredHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Obtener colores FUERA del render
  const backgroundColor = useThemeColor({}, 'background');
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
      setError(err.message || 'Error al cargar los héroes. Intenta nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHeroes();
    setRefreshing(false);
  };

  const filterHeroes = () => {
    let filtered = heroes;

    if (searchQuery) {
      filtered = filtered.filter(hero =>
        hero.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRole) {
      filtered = filtered.filter(hero => hero.role === selectedRole);
    }

    setFilteredHeroes(filtered);
  };

  const roles = ['Duelist', 'Vanguard', 'Strategist'];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Duelist': return '#e23636';
      case 'Vanguard': return '#3b82f6';
      case 'Strategist': return '#10b981';
      default: return '#666';
    }
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
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={loadHeroes}>
          <ThemedText style={styles.retryText}>Reintentar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>Marvel Rivals</ThemedText>
        <ThemedText style={styles.subtitle}>{filteredHeroes.length} Héroes</ThemedText>
      </ThemedView>

      {/* Buscador */}
      <ThemedView style={[styles.searchContainer, { borderColor }]}>
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Buscar héroe..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </ThemedView>

      {/* Filtros por rol */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedRole && styles.filterChipActive
          ]}
          onPress={() => setSelectedRole(null)}
        >
          <ThemedText style={[
            styles.filterText,
            !selectedRole && styles.filterTextActive
          ]}>
            Todos
          </ThemedText>
        </TouchableOpacity>
        {roles.map(role => (
          <TouchableOpacity
            key={role}
            style={[
              styles.filterChip,
              selectedRole === role && styles.filterChipActive,
              { borderColor: getRoleColor(role) }
            ]}
            onPress={() => setSelectedRole(selectedRole === role ? null : role)}
          >
            <ThemedText style={[
              styles.filterText,
              selectedRole === role && styles.filterTextActive
            ]}>
              {role}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de héroes */}
      <FlatList
        data={filteredHeroes}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          const heroImage = item.imageUrl || item.portrait || item.icon;
          
          return (
            <TouchableOpacity
              style={[styles.heroCard, { backgroundColor, borderColor }]}
              onPress={() => router.push(`/hero/${item.name}`)}
            >
              {heroImage ? (
                <Image
                  source={{ uri: heroImage }}
                  style={styles.heroImage}
                  contentFit="cover"
                />
              ) : (
                <ThemedView style={styles.heroImagePlaceholder}>
                  <ThemedText style={styles.placeholderText}>
                    {item.name.charAt(0)}
                  </ThemedText>
                </ThemedView>
              )}
              <ThemedView style={styles.heroInfo}>
                <ThemedText 
                  style={styles.heroName}
                  numberOfLines={1}
                >
                  {item.name}
                </ThemedText>
                <ThemedText 
                  style={[
                    styles.heroRole,
                    { color: getRoleColor(item.role) }
                  ]}
                >
                  {item.role}
                </ThemedText>
                {item.difficulty && (
                  <ThemedText style={styles.heroDifficulty}>
                    {item.difficulty}
                  </ThemedText>
                )}
              </ThemedView>
            </TouchableOpacity>
          );
        }}
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
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 10,
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
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchInput: {
    padding: 12,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#666',
  },
  filterChipActive: {
    backgroundColor: '#e23636',
    borderColor: '#e23636',
  },
  filterText: {
    fontSize: 14,
    color: '#999',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#e23636',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  heroImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#222',
  },
  heroImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#e23636',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  heroInfo: {
    padding: 12,
  },
  heroName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  heroRole: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  heroDifficulty: {
    fontSize: 12,
    opacity: 0.6,
  },
});