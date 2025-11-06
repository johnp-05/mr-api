// app/(tabs)/ai.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import GeminiService from '@/services/geminiService';
import FavoritesService from '@/services/favoritesService';
import HeroComparator from '@/components/HeroComparator';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { router } from 'expo-router';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTION_ICONS = ['🎮', '🦸‍♂️', '🎯', '💡', '🌟', '⚡'];

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showComparator, setShowComparator] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({ light: '#f5f5f5', dark: '#1a1a1a' }, 'background');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'background');
  const textColor = useThemeColor({}, 'text');

  // Animación de pulso para el avatar
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: '¡Hola! Soy Galacta 💜, tu entrenadora personal de Marvel Rivals.\n\n¿Listo para dominar el campo de batalla? Puedo ayudarte a:\n\n⚔️ Encontrar el héroe perfecto para tu estilo\n📊 Analizar cualquier héroe en detalle\n🎯 Crear composiciones ganadoras\n💡 Darte tips y estrategias pro\n\n¡Pregúntame lo que necesites y vamos a ganar juntos! 🚀',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    // Detectar comandos especiales SIN usar IA
    const lowerInput = inputText.toLowerCase().trim();
    
    // Comando: Comparar héroes
    if (lowerInput.includes('compar') && (lowerInput.includes('vs') || lowerInput.includes('y'))) {
      setShowComparator(true);
      setInputText('');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setShowSuggestions(false);

    try {
      const response = await GeminiService.sendMessage(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ ${error.message || 'Ocurrió un error. Intenta de nuevo.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInputText(suggestion);
    setShowSuggestions(false);
  };

  const clearChat = () => {
    GeminiService.clearHistory();
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: '¡Chat reiniciado! 🔄\n\nSoy Galacta 💜 y estoy lista para ayudarte de nuevo.\n\n¿Qué quieres saber ahora?',
      timestamp: new Date(),
    }]);
    setShowSuggestions(true);
  };

  const saveFavorite = async (message: Message) => {
    try {
      await FavoritesService.saveFavorite(message.content);
      Alert.alert(
        '⭐ Guardado',
        'Consejo guardado en favoritos',
        [{ text: 'Ver Favoritos', onPress: () => router.push('/favorites' as any) }, { text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el favorito');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {isUser ? (
          // Mensaje del usuario con gradiente
          <LinearGradient
            colors={['#e23636', '#ff4444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.messageBubble, styles.userBubble]}
          >
            <ThemedText style={styles.messageText}>
              {item.content}
            </ThemedText>
          </LinearGradient>
        ) : (
          // Mensaje de Galacta
          <View>
            <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: cardColor }]}>
              <LinearGradient
                colors={['#9333ea', '#a855f7', '#9333ea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.galactaIconContainer}
              >
                <ThemedText style={styles.galactaIconText}>💜</ThemedText>
              </LinearGradient>
              <ThemedText style={styles.messageText}>
                {item.content}
              </ThemedText>
            </View>
            {/* Botón de favorito */}
            {item.id !== 'welcome' && (
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => saveFavorite(item)}
              >
                <ThemedText style={styles.favoriteButtonText}>⭐ Guardar</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header con gradiente */}
      <LinearGradient
        colors={['#9333ea', '#7c3aed', '#6b21a8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Animated.View
              style={[
                styles.galactaAvatar,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['#fbbf24', '#f59e0b', '#fbbf24']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <ThemedText style={styles.galactaAvatarText}>💜</ThemedText>
              </LinearGradient>
            </Animated.View>
            <View>
              <ThemedText style={styles.title}>
                Galacta
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                ✨ Tu entrenadora IA
              </ThemedText>
            </View>
          </View>
          <View style={styles.headerButtons}>
            {/* Botón Comparador */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowComparator(true)}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerButtonGradient}
              >
                <ThemedText style={styles.headerButtonText}>⚖️</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
            {/* Botón Favoritos */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push('/favorites' as any)}
            >
              <LinearGradient
                colors={['#fbbf24', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerButtonGradient}
              >
                <ThemedText style={styles.headerButtonText}>⭐</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
            {/* Botón Limpiar */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={clearChat}
            >
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerButtonGradient}
              >
                <ThemedText style={styles.headerButtonText}>🔄</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <LinearGradient
                colors={['#9333ea', '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loadingBubble}
              >
                <ActivityIndicator color="#fff" />
                <ThemedText style={styles.loadingText}>
                  Galacta está pensando...
                </ThemedText>
              </LinearGradient>
            </View>
          ) : null
        }
      />

      {/* Quick Suggestions */}
      {showSuggestions && messages.length <= 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsContainer}
          contentContainerStyle={styles.suggestionsContent}
        >
          {GeminiService.getQuickSuggestions().map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChipWrapper}
              onPress={() => handleSuggestion(suggestion)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#9333ea', '#7c3aed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.suggestionChip}
              >
                <ThemedText style={styles.suggestionIcon}>
                  {SUGGESTION_ICONS[index % SUGGESTION_ICONS.length]}
                </ThemedText>
                <ThemedText style={styles.suggestionText}>
                  {suggestion}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input mejorado */}
      <View style={[styles.inputContainer, { borderColor }]}>
        <View style={[styles.inputWrapper, { backgroundColor: cardColor }]}>
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Pregúntale a Galacta..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!loading}
          />
        </View>
        <TouchableOpacity
          style={styles.sendButtonWrapper}
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              !inputText.trim() || loading
                ? ['#666', '#555']
                : ['#e23636', '#dc2626']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendButton}
          >
            <ThemedText style={styles.sendIcon}>
              {loading ? '⏳' : '➤'}
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Comparador Modal */}
      <HeroComparator
        visible={showComparator}
        onClose={() => setShowComparator(false)}
      />
    </KeyboardAvoidingView>
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
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  headerButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerButtonText: {
    fontSize: 20,
  },
  galactaAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galactaAvatarText: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#e9d5ff',
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 4,
    shadowColor: '#e23636',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  galactaIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  galactaIconText: {
    fontSize: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#fff',
  },
  favoriteButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  favoriteButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#fff',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 90,
  },
  suggestionsContent: {
    gap: 10,
    paddingRight: 16,
  },
  suggestionChipWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  suggestionIcon: {
    fontSize: 18,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  input: {
    fontSize: 16,
    paddingVertical: 4,
  },
  sendButtonWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 22,
    color: '#fff',
  },
});