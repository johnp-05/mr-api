// components/HeroComparator.tsx
import { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import MarvelRivalsAPI, { Hero } from '@/services/marvelRivalsApi';
import GeminiService from '@/services/geminiService';

interface HeroComparatorProps {
  visible: boolean;
  onClose: () => void;
  initialHero1?: string;
  initialHero2?: string;
}

interface AIComparison {
  hero1Pros: string[];
  hero1Cons: string[];
  hero2Pros: string[];
  hero2Cons: string[];
  verdict: string;
  recommendation: string;
}

export default function HeroComparator({
  visible,
  onClose,
  initialHero1,
  initialHero2,
}: HeroComparatorProps) {
  const [hero1Name, setHero1Name] = useState(initialHero1 || '');
  const [hero2Name, setHero2Name] = useState(initialHero2 || '');
  const [hero1, setHero1] = useState<Hero | null>(null);
  const [hero2, setHero2] = useState<Hero | null>(null);
  const [aiComparison, setAiComparison] = useState<AIComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
  const textColor = useThemeColor({}, 'text');

  const getRoleConfig = (role: string): {
    color: string;
    icon: string;
    gradient: readonly [string, string, ...string[]];
  } => {
    switch (role) {
      case 'Duelist':
        return { 
          color: '#e23636', 
          icon: '⚔️', 
          gradient: ['#e23636', '#ff4444'] as const 
        };
      case 'Vanguard':
        return { 
          color: '#3b82f6', 
          icon: '🛡️', 
          gradient: ['#3b82f6', '#60a5fa'] as const 
        };
      case 'Strategist':
        return { 
          color: '#10b981', 
          icon: '✨', 
          gradient: ['#10b981', '#34d399'] as const 
        };
      default:
        return { 
          color: '#666', 
          icon: '⭐', 
          gradient: ['#666', '#888'] as const 
        };
    }
  };

  const compareHeroes = async () => {
    if (!hero1Name.trim() || !hero2Name.trim()) {
      setError('Ingresa ambos héroes');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Cargar datos de héroes
      const [h1, h2] = await Promise.all([
        MarvelRivalsAPI.getHero(hero1Name.trim()),
        MarvelRivalsAPI.getHero(hero2Name.trim()),
      ]);

      setHero1(h1);
      setHero2(h2);

      // Pedir análisis a Galacta
      const comparison = await GeminiService.compareHeroes(h1, h2);
      setAiComparison(comparison);

    } catch {
      setError('No se encontró uno o ambos héroes');
      setHero1(null);
      setHero2(null);
      setAiComparison(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setHero1(null);
    setHero2(null);
    setHero1Name('');
    setHero2Name('');
    setError('');
    setAiComparison(null);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ThemedView style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <LinearGradient
          colors={['#9333ea', '#7c3aed'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <ThemedText style={styles.headerTitle}>⚖️ Comparador IA</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Análisis con Galacta 💜
              </ThemedText>
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
              accessibilityLabel="Cerrar comparador"
              accessibilityRole="button"
            >
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Input Section */}
          {!hero1 && !hero2 && (
            <View style={styles.inputSection}>
              <ThemedText style={styles.inputLabel}>
                Ingresa 2 héroes para comparar con IA:
              </ThemedText>

              <View style={[styles.inputWrapper, { backgroundColor: cardColor }]}>
                <ThemedText style={styles.inputIcon}>🦸‍♂️</ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Héroe 1 (ej: Spider-Man)"
                  placeholderTextColor="#999"
                  value={hero1Name}
                  onChangeText={setHero1Name}
                  accessibilityLabel="Nombre del primer héroe"
                  accessibilityHint="Ingresa el nombre del primer héroe a comparar"
                />
              </View>

              <ThemedText style={styles.vsText}>VS</ThemedText>

              <View style={[styles.inputWrapper, { backgroundColor: cardColor }]}>
                <ThemedText style={styles.inputIcon}>🦸‍♀️</ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Héroe 2 (ej: Iron Man)"
                  placeholderTextColor="#999"
                  value={hero2Name}
                  onChangeText={setHero2Name}
                  accessibilityLabel="Nombre del segundo héroe"
                  accessibilityHint="Ingresa el nombre del segundo héroe a comparar"
                />
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <ThemedText style={styles.errorText}>{error}</ThemedText>
                </View>
              )}

              <TouchableOpacity
                style={styles.compareButtonWrapper}
                onPress={compareHeroes}
                disabled={loading}
                accessibilityLabel="Comparar héroes con inteligencia artificial"
                accessibilityRole="button"
                accessibilityState={{ disabled: loading }}
              >
                <LinearGradient
                  colors={['#e23636', '#dc2626'] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.compareButton}
                >
                  {loading ? (
                    <View style={styles.loadingContent}>
                      <ActivityIndicator color="#fff" />
                      <ThemedText style={styles.loadingText}>
                        Galacta analizando...
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText style={styles.compareButtonText}>
                      🤖 Comparar con IA
                    </ThemedText>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Comparison Results */}
          {hero1 && hero2 && aiComparison && (
            <View style={styles.comparisonSection}>
              {/* Heroes Row */}
              <View style={styles.heroesRow}>
                {/* Hero 1 */}
                <View style={styles.heroColumn}>
                  {hero1.imageUrl ? (
                    <Image
                      source={{ uri: hero1.imageUrl }}
                      style={styles.heroImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.heroImagePlaceholder,
                        { backgroundColor: getRoleConfig(hero1.role).color },
                      ]}
                    >
                      <ThemedText style={styles.placeholderIcon}>
                        {getRoleConfig(hero1.role).icon}
                      </ThemedText>
                    </View>
                  )}
                  <ThemedText style={styles.heroName}>{hero1.alias || hero1.name}</ThemedText>
                  <LinearGradient
                    colors={getRoleConfig(hero1.role).gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleBadge}
                  >
                    <ThemedText style={styles.roleText}>
                      {getRoleConfig(hero1.role).icon} {hero1.role}
                    </ThemedText>
                  </LinearGradient>
                </View>

                {/* VS */}
                <View style={styles.vsContainer}>
                  <ThemedText style={styles.vsLarge}>VS</ThemedText>
                </View>

                {/* Hero 2 */}
                <View style={styles.heroColumn}>
                  {hero2.imageUrl ? (
                    <Image
                      source={{ uri: hero2.imageUrl }}
                      style={styles.heroImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.heroImagePlaceholder,
                        { backgroundColor: getRoleConfig(hero2.role).color },
                      ]}
                    >
                      <ThemedText style={styles.placeholderIcon}>
                        {getRoleConfig(hero2.role).icon}
                      </ThemedText>
                    </View>
                  )}
                  <ThemedText style={styles.heroName}>{hero2.alias || hero2.name}</ThemedText>
                  <LinearGradient
                    colors={getRoleConfig(hero2.role).gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.roleBadge}
                  >
                    <ThemedText style={styles.roleText}>
                      {getRoleConfig(hero2.role).icon} {hero2.role}
                    </ThemedText>
                  </LinearGradient>
                </View>
              </View>

              {/* AI Analysis */}
              <View style={styles.aiAnalysisSection}>
                <LinearGradient
                  colors={['#9333ea', '#7c3aed'] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.aiHeader}
                >
                  <ThemedText style={styles.aiHeaderText}>
                    💜 Análisis de Galacta
                  </ThemedText>
                </LinearGradient>

                {/* Pros */}
                <View style={[styles.statCard, { backgroundColor: cardColor }]}>
                  <ThemedText style={styles.statTitle}>✅ VENTAJAS</ThemedText>
                  <View style={styles.prosConsRow}>
                    <View style={styles.prosConsColumn}>
                      <ThemedText style={styles.heroSubtitle}>
                        {hero1.alias || hero1.name}
                      </ThemedText>
                      {aiComparison.hero1Pros.map((pro, i) => (
                        <ThemedText key={i} style={styles.proConItem}>
                          • {pro}
                        </ThemedText>
                      ))}
                    </View>
                    <View style={styles.prosConsColumn}>
                      <ThemedText style={styles.heroSubtitle}>
                        {hero2.alias || hero2.name}
                      </ThemedText>
                      {aiComparison.hero2Pros.map((pro, i) => (
                        <ThemedText key={i} style={styles.proConItem}>
                          • {pro}
                        </ThemedText>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Cons */}
                <View style={[styles.statCard, { backgroundColor: cardColor }]}>
                  <ThemedText style={styles.statTitle}>❌ DESVENTAJAS</ThemedText>
                  <View style={styles.prosConsRow}>
                    <View style={styles.prosConsColumn}>
                      <ThemedText style={styles.heroSubtitle}>
                        {hero1.alias || hero1.name}
                      </ThemedText>
                      {aiComparison.hero1Cons.map((con, i) => (
                        <ThemedText key={i} style={styles.proConItem}>
                          • {con}
                        </ThemedText>
                      ))}
                    </View>
                    <View style={styles.prosConsColumn}>
                      <ThemedText style={styles.heroSubtitle}>
                        {hero2.alias || hero2.name}
                      </ThemedText>
                      {aiComparison.hero2Cons.map((con, i) => (
                        <ThemedText key={i} style={styles.proConItem}>
                          • {con}
                        </ThemedText>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Difficulty */}
                <View style={[styles.statCard, { backgroundColor: cardColor }]}>
                  <ThemedText style={styles.statTitle}>⭐ Dificultad</ThemedText>
                  <View style={styles.statRow}>
                    <View style={styles.difficultyItem}>
                      <ThemedText style={styles.heroSubtitle}>
                        {hero1.alias || hero1.name}
                      </ThemedText>
                      <ThemedText style={styles.statValue}>
                        {'⭐'.repeat(hero1.difficultyStars || 3)}
                      </ThemedText>
                    </View>
                    <View style={styles.difficultyItem}>
                      <ThemedText style={styles.heroSubtitle}>
                        {hero2.alias || hero2.name}
                      </ThemedText>
                      <ThemedText style={styles.statValue}>
                        {'⭐'.repeat(hero2.difficultyStars || 3)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>

              {/* Galacta Verdict */}
              <LinearGradient
                colors={['#9333ea', '#7c3aed'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.verdictCard}
              >
                <ThemedText style={styles.verdictTitle}>🏆 Veredicto Final</ThemedText>
                <ThemedText style={styles.verdictText}>
                  {aiComparison.verdict}
                </ThemedText>
              </LinearGradient>

              {/* Recommendation */}
              <View style={[styles.recommendationCard, { backgroundColor: cardColor }]}>
                <ThemedText style={styles.recommendationTitle}>
                  💡 Recomendación de Galacta
                </ThemedText>
                <ThemedText style={styles.recommendationText}>
                  {aiComparison.recommendation}
                </ThemedText>
              </View>

              {/* Reset Button */}
              <TouchableOpacity 
                style={styles.resetButtonWrapper} 
                onPress={reset}
                accessibilityLabel="Comparar otros héroes"
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={['#ef4444', '#dc2626'] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.resetButton}
                >
                  <ThemedText style={styles.resetButtonText}>
                    🔄 Comparar Otros Héroes
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </Modal>
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
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e9d5ff',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  inputIcon: {
    fontSize: 24,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  vsText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#ff6b6b22',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
  },
  compareButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  compareButton: {
    padding: 16,
    alignItems: 'center',
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
  },
  comparisonSection: {
    gap: 20,
  },
  heroesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  heroImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  heroImagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
  },
  heroName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vsContainer: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  vsLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    opacity: 0.3,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  aiAnalysisSection: {
    gap: 12,
  },
  aiHeader: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  aiHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  prosConsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  prosConsColumn: {
    flex: 1,
    gap: 8,
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.6,
    marginBottom: 4,
  },
  proConItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  difficultyItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  verdictCard: {
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  verdictTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  verdictText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#fff',
  },
  recommendationCard: {
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recommendationText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  resetButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  resetButton: {
    padding: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});