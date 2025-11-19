// app/(tabs)/explore.tsx
import { useState } from 'react';
import { 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  View
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import MarvelRivalsAPI, { PlayerStats } from '@/services/marvelRivalsApi';

export default function ExploreScreen() {
  const [username, setUsername] = useState('');
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({ light: '#f5f5f5', dark: '#1a1a1a' }, 'background');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'background');
  const textColor = useThemeColor({}, 'text');

  const searchPlayer = async () => {
    if (!username.trim()) {
      setError('Ingresa un nombre de usuario');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await MarvelRivalsAPI.getPlayerStats(username.trim());
      setPlayerStats(data);
    } catch (err) {
      setError('No se pudo encontrar el jugador. Verifica el nombre.');
      setPlayerStats(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Buscar Jugador
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Encuentra estadísticas de cualquier jugador
        </ThemedText>
      </ThemedView>

      {/* Buscador */}
      <ThemedView style={styles.searchSection}>
        <View style={[styles.searchContainer, { borderColor }]}>
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Nombre de usuario..."
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            onSubmitEditing={searchPlayer}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Campo de nombre de usuario"
            accessibilityHint="Ingresa el nombre del jugador a buscar"
          />
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={searchPlayer}
          disabled={loading}
          accessibilityLabel="Buscar jugador"
          accessibilityRole="button"
          accessibilityState={{ disabled: loading }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.searchButtonText}>Buscar</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>

      {/* Error */}
      {error && (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </ThemedView>
      )}

      {/* Resultados */}
      {playerStats && (
        <ThemedView style={styles.resultsContainer}>
          {/* Card de jugador */}
          <ThemedView style={[styles.playerCard, { backgroundColor: cardColor }]}>
            <View style={styles.playerHeader}>
              <View style={styles.avatarPlaceholder}>
                <ThemedText style={styles.avatarText}>
                  {playerStats.username.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.playerInfo}>
                <ThemedText style={styles.playerName}>
                  {playerStats.username}
                </ThemedText>
                {playerStats.rank && (
                  <ThemedText style={styles.playerRank}>
                    🏆 {playerStats.rank}
                  </ThemedText>
                )}
                {playerStats.level && (
                  <ThemedText style={styles.playerLevel}>
                    Nivel {playerStats.level}
                  </ThemedText>
                )}
              </View>
            </View>
          </ThemedView>

          {/* Stats de héroes */}
          {playerStats.heroes && playerStats.heroes.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Héroes más jugados
              </ThemedText>
              {playerStats.heroes.map((heroStat, index) => (
                <ThemedView
                  key={index}
                  style={[styles.heroStatCard, { backgroundColor: cardColor }]}
                >
                  <View style={styles.heroStatInfo}>
                    <ThemedText style={styles.heroStatName}>
                      {heroStat.name}
                    </ThemedText>
                    <ThemedText style={styles.heroStatGames}>
                      {heroStat.gamesPlayed} partidas
                    </ThemedText>
                  </View>
                  <View style={styles.winRateContainer}>
                    <ThemedText style={[
                      styles.winRate,
                      { color: heroStat.winRate >= 50 ? '#10b981' : '#ef4444' }
                    ]}>
                      {heroStat.winRate.toFixed(1)}%
                    </ThemedText>
                    <ThemedText style={styles.winRateLabel}>
                      Win Rate
                    </ThemedText>
                  </View>
                </ThemedView>
              ))}
            </ThemedView>
          )}

          {/* Nota sobre datos */}
          <ThemedView style={styles.noteContainer}>
            <ThemedText style={styles.noteText}>
              ℹ️ Los datos provienen de la API oficial de Marvel Rivals
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      {/* Estado inicial */}
      {!playerStats && !error && !loading && (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyStateIcon}>🔍</ThemedText>
          <ThemedText style={styles.emptyStateText}>
            Busca un jugador para ver sus estadísticas
          </ThemedText>
          <ThemedText style={styles.emptyStateHint}>
            Ejemplo: Sypeh
          </ThemedText>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  searchSection: {
    padding: 20,
    gap: 12,
  },
  searchContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchInput: {
    padding: 16,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#e23636',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ff6b6b22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
  resultsContainer: {
    padding: 20,
  },
  playerCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e23636',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playerRank: {
    fontSize: 16,
    marginBottom: 2,
  },
  playerLevel: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  heroStatCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  heroStatInfo: {
    flex: 1,
  },
  heroStatName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  heroStatGames: {
    fontSize: 14,
    opacity: 0.7,
  },
  winRateContainer: {
    alignItems: 'flex-end',
  },
  winRate: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  winRateLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  noteContainer: {
    padding: 12,
    backgroundColor: '#3b82f622',
    borderRadius: 8,
    marginTop: 12,
  },
  noteText: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.8,
  },
  emptyStateHint: {
    fontSize: 14,
    opacity: 0.6,
  },
});