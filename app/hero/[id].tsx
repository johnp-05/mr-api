// app/hero/[id].tsx
import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  View,
  TouchableOpacity
} from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MarvelRivalsAPI, { Hero } from '@/services/marvelRivalsApi';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function HeroDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({ light: '#f5f5f5', dark: '#1a1a1a' }, 'background');

  useEffect(() => {
    if (id) {
      loadHero();
    }
  }, [id]);

  const loadHero = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MarvelRivalsAPI.getHero(id);
      setHero(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el héroe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      <>
        <Stack.Screen options={{ title: 'Cargando...' }} />
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#e23636" />
        </ThemedView>
      </>
    );
  }

  if (error || !hero) {
    return (
      <>
        <Stack.Screen options={{ title: 'Error' }} />
        <ThemedView style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>
            {error || 'Héroe no encontrado'}
          </ThemedText>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>Volver</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </>
    );
  }

  const heroImage = hero.imageUrl || hero.portrait || hero.icon;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: hero.name,
          headerBackTitle: 'Atrás'
        }} 
      />
      <ScrollView style={[styles.container, { backgroundColor }]}>
        {/* Header con imagen */}
        <View style={styles.imageContainer}>
          {heroImage ? (
            <Image
              source={{ uri: heroImage }}
              style={styles.heroImage}
              contentFit="cover"
            />
          ) : (
            <ThemedView style={styles.heroImagePlaceholder}>
              <ThemedText style={styles.placeholderText}>
                {hero.name.charAt(0)}
              </ThemedText>
            </ThemedView>
          )}
          <View style={styles.gradientOverlay} />
        </View>

        {/* Info principal */}
        <ThemedView style={styles.content}>
          <ThemedView style={styles.headerInfo}>
            <ThemedText type="title" style={styles.heroName}>
              {hero.name}
            </ThemedText>
            {hero.alias && (
              <ThemedText style={styles.alias}>{hero.alias}</ThemedText>
            )}
            <View style={styles.badges}>
              <View 
                style={[
                  styles.badge,
                  { backgroundColor: getRoleColor(hero.role) }
                ]}
              >
                <ThemedText style={styles.badgeText}>{hero.role}</ThemedText>
              </View>
              {hero.difficulty && (
                <View style={[styles.badge, styles.difficultyBadge]}>
                  <ThemedText style={styles.badgeText}>
                    {hero.difficulty}
                  </ThemedText>
                </View>
              )}
            </View>
          </ThemedView>

          {/* Descripción */}
          {hero.description && (
            <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
              <ThemedText style={styles.sectionTitle}>Descripción</ThemedText>
              <ThemedText style={styles.description}>
                {hero.description}
              </ThemedText>
            </ThemedView>
          )}

          {/* Habilidades */}
          {hero.abilities && hero.abilities.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Habilidades ({hero.abilities.length})
              </ThemedText>
              {hero.abilities.map((ability, index) => (
                <ThemedView 
                  key={index}
                  style={[styles.abilityCard, { backgroundColor: cardColor }]}
                >
                  <View style={styles.abilityHeader}>
                    <ThemedText style={styles.abilityName}>
                      {ability.ability_name}
                    </ThemedText>
                    {ability.cooldown && (
                      <ThemedText style={styles.cooldown}>
                        ⏱️ {ability.cooldown}s
                      </ThemedText>
                    )}
                  </View>
                  {ability.description && (
                    <ThemedText style={styles.abilityDescription}>
                      {ability.description}
                    </ThemedText>
                  )}
                </ThemedView>
              ))}
            </ThemedView>
          )}

          {/* Stats adicionales */}
          <ThemedView style={[styles.statsContainer, { backgroundColor: cardColor }]}>
            <ThemedText style={styles.sectionTitle}>Información</ThemedText>
            <View style={styles.statRow}>
              <ThemedText style={styles.statLabel}>Nombre:</ThemedText>
              <ThemedText style={styles.statValue}>{hero.name}</ThemedText>
            </View>
            {hero.alias && (
              <View style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Alias:</ThemedText>
                <ThemedText style={styles.statValue}>{hero.alias}</ThemedText>
              </View>
            )}
            <View style={styles.statRow}>
              <ThemedText style={styles.statLabel}>Rol:</ThemedText>
              <ThemedText 
                style={[
                  styles.statValue,
                  { color: getRoleColor(hero.role) }
                ]}
              >
                {hero.role}
              </ThemedText>
            </View>
            {hero.difficulty && (
              <View style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Dificultad:</ThemedText>
                <ThemedText style={styles.statValue}>
                  {hero.difficulty}
                </ThemedText>
              </View>
            )}
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </>
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
  imageContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e23636',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#fff',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    padding: 20,
  },
  headerInfo: {
    marginBottom: 20,
  },
  heroName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alias: {
    fontSize: 18,
    opacity: 0.7,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyBadge: {
    backgroundColor: '#666',
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  abilityCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  abilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  abilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  cooldown: {
    fontSize: 14,
    opacity: 0.7,
  },
  abilityDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  statsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#e23636',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});