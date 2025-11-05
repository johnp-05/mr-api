import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  View,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MarvelRivalsAPI, { Hero } from '@/services/marvelRivalsApi';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

export default function HeroDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');

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

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'Duelist': 
        return { 
          color: '#e23636', 
          gradient: ['#e23636', '#ff6b6b'],
          icon: '⚔️'
        };
      case 'Vanguard': 
        return { 
          color: '#3b82f6', 
          gradient: ['#3b82f6', '#60a5fa'],
          icon: '🛡️'
        };
      case 'Strategist': 
        return { 
          color: '#10b981', 
          gradient: ['#10b981', '#34d399'],
          icon: '✨'
        };
      default: 
        return { 
          color: '#666', 
          gradient: ['#666', '#888'],
          icon: '⭐'
        };
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Cargando...' }} />
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#e23636" />
          <ThemedText style={styles.loadingText}>Cargando héroe...</ThemedText>
        </ThemedView>
      </>
    );
  }

  if (error || !hero) {
    return (
      <>
        <Stack.Screen options={{ title: 'Error' }} />
        <ThemedView style={styles.centerContainer}>
          <ThemedText style={styles.errorIcon}>❌</ThemedText>
          <ThemedText style={styles.errorText}>
            {error || 'Héroe no encontrado'}
          </ThemedText>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>← Volver</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </>
    );
  }

  const heroImage = hero.image_transverse || hero.image_square || hero.portrait || hero.icon;
  const roleConfig = getRoleConfig(hero.role);

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: hero.name,
          headerBackTitle: 'Atrás',
          headerTransparent: true,
          headerTintColor: '#fff'
        }} 
      />
      <ScrollView 
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header Image */}
        <View style={styles.heroHeader}>
          {heroImage ? (
            <>
              <Image
                source={{ uri: heroImage }}
                style={styles.heroImage}
                contentFit="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)', backgroundColor]}
                style={styles.imageGradient}
              />
            </>
          ) : (
            <View style={[styles.heroImagePlaceholder, { backgroundColor: roleConfig.color }]}>
              <ThemedText style={styles.placeholderEmoji}>
                {roleConfig.icon}
              </ThemedText>
              <ThemedText style={styles.placeholderText}>
                {hero.name}
              </ThemedText>
            </View>
          )}

          {/* Hero Name Overlay */}
          <View style={styles.heroNameOverlay}>
            <ThemedText style={styles.heroNameLarge}>
              {hero.name}
            </ThemedText>
            {hero.alias && (
              <ThemedText style={styles.heroAlias}>
                "{hero.alias}"
              </ThemedText>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Role & Difficulty Badges */}
          <View style={styles.badgesContainer}>
            <View style={[styles.roleBadge, { backgroundColor: roleConfig.color }]}>
              <ThemedText style={styles.roleIcon}>{roleConfig.icon}</ThemedText>
              <ThemedText style={styles.roleBadgeText}>{hero.role}</ThemedText>
            </View>
            {hero.difficulty && (
              <View style={styles.difficultyBadge}>
                <ThemedText style={styles.difficultyText}>
                  Dificultad: {hero.difficulty}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Description Card */}
          {hero.description && (
            <View style={[styles.card, { backgroundColor: cardColor }]}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardIcon}>📖</ThemedText>
                <ThemedText style={styles.cardTitle}>Descripción</ThemedText>
              </View>
              <ThemedText style={styles.description}>
                {hero.description}
              </ThemedText>
            </View>
          )}

          {/* Abilities Section */}
          {hero.abilities && hero.abilities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionIcon}>⚡</ThemedText>
                <ThemedText style={styles.sectionTitle}>
                  Habilidades
                </ThemedText>
                <View style={styles.countBadge}>
                  <ThemedText style={styles.countText}>
                    {hero.abilities.length}
                  </ThemedText>
                </View>
              </View>

              {hero.abilities.map((ability, index) => (
                <View 
                  key={index}
                  style={[styles.abilityCard, { backgroundColor: cardColor }]}
                >
                  <View style={styles.abilityHeader}>
                    <View style={styles.abilityNumber}>
                      <ThemedText style={styles.abilityNumberText}>
                        {index + 1}
                      </ThemedText>
                    </View>
                    <View style={styles.abilityHeaderContent}>
                      <ThemedText style={styles.abilityName}>
                        {ability.ability_name}
                      </ThemedText>
                      {ability.cooldown && (
                        <View style={styles.cooldownBadge}>
                          <ThemedText style={styles.cooldownIcon}>⏱️</ThemedText>
                          <ThemedText style={styles.cooldownText}>
                            {ability.cooldown}s
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                  {ability.description && (
                    <ThemedText style={styles.abilityDescription}>
                      {ability.description}
                    </ThemedText>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Stats Card */}
          <View style={[styles.card, { backgroundColor: cardColor }]}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.cardIcon}>📊</ThemedText>
              <ThemedText style={styles.cardTitle}>Información</ThemedText>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Nombre</ThemedText>
                <ThemedText style={styles.statValue}>{hero.name}</ThemedText>
              </View>
              
              {hero.alias && (
                <View style={styles.statItem}>
                  <ThemedText style={styles.statLabel}>Alias</ThemedText>
                  <ThemedText style={styles.statValue}>{hero.alias}</ThemedText>
                </View>
              )}
              
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Rol</ThemedText>
                <ThemedText style={[styles.statValue, { color: roleConfig.color }]}>
                  {roleConfig.icon} {hero.role}
                </ThemedText>
              </View>
              
              {hero.difficulty && (
                <View style={styles.statItem}>
                  <ThemedText style={styles.statLabel}>Dificultad</ThemedText>
                  <ThemedText style={styles.statValue}>{hero.difficulty}</ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Back Button */}
          <TouchableOpacity 
            style={[styles.fullBackButton, { backgroundColor: roleConfig.color }]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.fullBackButtonText}>
              ← Volver a Héroes
            </ThemedText>
          </TouchableOpacity>
        </View>
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
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  backButton: {
    backgroundColor: '#e23636',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  heroHeader: {
    width: '100%',
    height: 500,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  heroImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  placeholderEmoji: {
    fontSize: 100,
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  heroNameOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  heroNameLarge: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    marginBottom: 4,
  },
  heroAlias: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  roleIcon: {
    fontSize: 18,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  difficultyBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 28,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#e23636',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  abilityCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  abilityHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  abilityNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e23636',
    justifyContent: 'center',
    alignItems: 'center',
  },
  abilityNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  abilityHeaderContent: {
    flex: 1,
  },
  abilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cooldownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cooldownIcon: {
    fontSize: 14,
  },
  cooldownText: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: '600',
  },
  abilityDescription: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
    paddingLeft: 48,
  },
  statsGrid: {
    gap: 16,
  },
  statItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  fullBackButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  fullBackButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});