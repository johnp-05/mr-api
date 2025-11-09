# 📱 Marvel Rivals - Guía Completa de la App

## 🎮 Descripción General

**Marvel Rivals** es una aplicación móvil completa para fanáticos del juego competitivo 6v6 de Marvel. La app integra IA conversacional (Gemini) con datos en tiempo real de la API oficial de Marvel Rivals para ofrecer una experiencia de entrenamiento personalizada.

---

## 🌟 Características Principales

### 1. **🦸‍♂️ Catálogo de Héroes** (`app/(tabs)/index.tsx`)

- **Visualización completa** de todos los héroes del juego
- **Filtros avanzados:**
  - Por rol (Duelist ⚔️, Vanguard 🛡️, Strategist ✨)
  - Búsqueda por nombre/alias
- **Sistema de favoritos** con persistencia local
- **Cards interactivas** con:
  - Imagen oficial del héroe
  - Rol con badge de color
  - Nombre y alias
  - Indicador de favorito (❤️/🤍)

**Navegación:** Tap en cualquier héroe → detalles completos

---

### 2. **💜 Galacta - Entrenadora IA** (`app/(tabs)/ai.tsx`)

Tu asistente personal impulsado por **Google Gemini AI**.

#### Capacidades:

- **Análisis de héroes:** "Dame tips para jugar Spider-Man"
- **Composiciones de equipo:** "¿Cuál es la mejor comp 2-2-2?"
- **Recomendaciones personalizadas** basadas en tus favoritos
- **Comparador IA** (nuevo): Compara 2 héroes con análisis detallado
- **Historial contextual** que recuerda la conversación

#### Comandos especiales:

- `"Compara Spider-Man vs Iron Man"` → Abre comparador automáticamente
- Sugerencias rápidas pre-definidas
- Guardado de consejos favoritos (⭐)

#### Interfaz:

- Chat estilo mensajería moderna
- Burbujas diferenciadas (usuario/IA)
- Animaciones de carga con feedback visual
- Botones de acceso rápido: ⚖️ Comparar, ⭐ Favoritos, 🔄 Limpiar

---

### 3. **⚖️ Comparador de Héroes con IA** (`components/HeroComparator.tsx`)

Modal especializado para comparaciones detalladas.

#### Análisis incluye:

- **Pros y Contras** de cada héroe (3 puntos c/u)
- **Dificultad** (estrellas 1-5)
- **Veredicto imparcial** de Galacta
- **Recomendación personalizada** considerando:
  - Nivel de habilidad
  - Héroes favoritos del usuario
  - Estilo de juego

#### Formato visual:

- Imágenes lado a lado (Hero1 vs Hero2)
- Cards categorizados (✅ Ventajas, ❌ Desventajas)
- Veredicto final con gradiente morado
- Botón para nueva comparación

---

### 4. **📊 Detalles de Héroe** (`app/hero/[id].tsx`)

Vista completa al hacer tap en un héroe.

#### Información mostrada:

- **Header visual:**
  - Imagen a pantalla completa con gradiente
  - Nombre y alias superpuestos
  - Botón de favorito flotante
  
- **Badges:**
  - Rol con color distintivo
  - Dificultad en estrellas (⭐⭐⭐)
  - Estado de favorito

- **Secciones:**
  - 📖 **Descripción** biográfica
  - ⚡ **Habilidades** (nombre, cooldown, descripción)
  - 📊 **Información** (rol, dificultad, alias)
  
- **Tip de Galacta** (si es favorito):
  - Nota personalizada sobre consideración en recomendaciones

---

### 5. **🔍 Búsqueda de Jugadores** (`app/(tabs)/explore.tsx`)

Consulta estadísticas de cualquier jugador.

#### Datos disponibles:

- **Perfil:**
  - Username
  - Rango (🏆)
  - Nivel de cuenta
  
- **Héroes más jugados:**
  - Nombre del héroe
  - Partidas jugadas
  - Win Rate (%) con código de color:
    - 🟢 Verde: ≥50%
    - 🔴 Rojo: <50%

**Nota:** Datos obtenidos de la API oficial de Marvel Rivals

---

### 6. **⭐ Favoritos** (`app/favorites.tsx`)

Sistema completo de gestión de favoritos.

#### Tipos de favoritos:

1. **Consejos de Galacta:**
   - Guardados desde el chat
   - Categorizados automáticamente:
     - 🦸‍♂️ Tips de Héroe
     - 🎯 Composición
     - 💡 Estrategia
   - Compartibles (📤)
   - Eliminables individualmente

2. **Héroes favoritos:**
   - Acceso rápido desde home y detalles
   - Toggle ❤️/🤍
   - Considerados por Galacta en recomendaciones

#### Funciones:

- Ver todos los favoritos con fecha
- Compartir consejos vía sistema nativo
- Limpiar todo con confirmación
- Contador de favoritos en header

---

## 🛠️ Arquitectura Técnica

### Stack Tecnológico:

- **Frontend:** React Native + Expo Router
- **Navegación:** Expo Router (tabs + stack)
- **IA:** Google Gemini 2.0 Flash Exp
- **API:** Marvel Rivals API v1
- **Persistencia:** AsyncStorage
- **UI:** Gradientes (expo-linear-gradient), imágenes (expo-image)
- **Animaciones:** React Native Animated

### Servicios (`/services`):

#### 1. **marvelRivalsApi.ts**
```typescript
- getHeroes(): Hero[]
- getHero(name: string): Hero
- getPlayerStats(username: string): PlayerStats
- Limpieza automática de HTML
- Procesamiento de imágenes
- Manejo de errores robusto
```

#### 2. **geminiService.ts**
```typescript
- sendMessage(message: string): string
- compareHeroes(hero1, hero2): AIComparison
- analyzeHero(name: string): string
- suggestComposition(): string
- Contexto de usuario (favoritos)
- Historial de conversación
- Detección de menciones de héroes
```

#### 3. **favoritesService.ts**
```typescript
- saveFavorite(content: string)
- getFavorites(): FavoriteMessage[]
- addFavoriteHero(name: string)
- getFavoriteHeroes(): string[]
- toggleFavoriteHero(name: string): boolean
- Categorización automática
- Estadísticas de uso
```

---

## 🎨 Diseño y UX

### Tema:

- **Soporte dual:** Light/Dark mode automático
- **Colores de roles:**
  - 🔴 Duelist: `#e23636`
  - 🔵 Vanguard: `#3b82f6`
  - 🟢 Strategist: `#10b981`
  - 💜 Galacta: `#9333ea`

### Características visuales:

- Gradientes vibrantes en botones y headers
- Cards con sombras y elevación
- Animaciones suaves (pulso en avatar de Galacta)
- Emojis estratégicos para mejor legibilidad
- Feedback háptico en iOS

---

## 🔐 Configuración Requerida

### APIs necesarias:

1. **Marvel Rivals API:**
   - Obtener en: https://marvelrivalsapi.com/dashboard
   - Ubicación: `services/marvelRivalsApi.ts` → `API_KEY`

2. **Google Gemini:**
   - Obtener en: https://aistudio.google.com/app/apikey
   - Ubicación: `services/geminiService.ts` → `GEMINI_API_KEY`

---

## 📱 Navegación
```
Root Layout (_layout.tsx)
├── (tabs) [TabLayout]
│   ├── index.tsx (🏠 Héroes)
│   ├── ai.tsx (💜 Galacta)
│   └── explore.tsx (🔍 Buscar)
├── hero/[id].tsx (📄 Detalles de héroe)
└── favorites.tsx (⭐ Modal de favoritos)
```

---

## 🚀 Flujo de Usuario Típico

### 1. **Inicio:**
- Explorar catálogo de héroes
- Filtrar por rol o buscar por nombre
- Marcar favoritos (❤️)

### 2. **Consultar a Galacta:**
- "¿Qué héroe me recomiendas?" → Respuesta contextual
- "Compara Spider-Man vs Iron Man" → Comparador IA
- Guardar consejos útiles (⭐)

### 3. **Profundizar:**
- Ver detalles completos de un héroe
- Analizar habilidades y estadísticas
- Buscar jugadores para ver meta

### 4. **Gestionar favoritos:**
- Revisar consejos guardados
- Compartir estrategias
- Acceso rápido a héroes preferidos

---

## 💡 Casos de Uso Avanzados

### Para principiantes:
- "Soy nuevo, ¿por dónde empiezo?"
- Filtrar héroes con ⭐⭐ (baja dificultad)
- Galacta recomienda héroes accesibles

### Para competitivos:
- Comparar héroes del meta actual
- Consultar composiciones 2-2-2
- Analizar win rates de jugadores top

### Para creadores de contenido:
- Compartir builds desde favoritos
- Capturar análisis de Galacta
- Estadísticas de jugadores pro

---

## 🛡️ Manejo de Errores

- **API Key inválida** → Mensaje con link a obtención
- **Límite de cuota** → Sugerencia de espera
- **Héroe no encontrado** → Búsqueda alternativa
- **Sin conexión** → Retry manual
- **Respuesta IA inválida** → Fallback con datos básicos

---

## 📦 Dependencias Clave
```json
{
  "@google/generative-ai": "IA conversacional",
  "@react-native-async-storage/async-storage": "Persistencia",
  "expo-linear-gradient": "Gradientes",
  "expo-image": "Optimización de imágenes",
  "expo-router": "Navegación file-based",
  "react-native-reanimated": "Animaciones"
}
```

---

## 🎯 Próximas Mejoras (Roadmap)

- [ ] Comparador múltiple (3+ héroes)
- [ ] Modo offline con caché
- [ ] Notificaciones de meta updates
- [ ] Perfil de usuario con estadísticas
- [ ] Integración con Discord/Twitter
- [ ] Modo entrenamiento con IA

---

## 📊 Estructura del Proyecto
```
mr-api/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Navegación de tabs
│   │   ├── index.tsx             # 🏠 Catálogo de héroes
│   │   ├── ai.tsx                # 💜 Chat con Galacta
│   │   └── explore.tsx           # 🔍 Búsqueda de jugadores
│   ├── hero/
│   │   └── [id].tsx              # 📄 Detalles de héroe
│   ├── favorites.tsx             # ⭐ Gestión de favoritos
│   └── _layout.tsx               # Layout principal
├── components/
│   ├── HeroComparator.tsx        # ⚖️ Comparador IA
│   ├── themed-text.tsx           # Texto con tema
│   └── themed-view.tsx           # Contenedor con tema
├── services/
│   ├── marvelRivalsApi.ts        # API de Marvel Rivals
│   ├── geminiService.ts          # Integración con Gemini AI
│   └── favoritesService.ts       # Gestión de favoritos
├── constants/
│   └── theme.ts                  # Colores y temas
└── hooks/
    ├── use-color-scheme.ts       # Hook de tema
    └── use-theme-color.ts        # Hook de colores
```

---

## 🚀 Instalación y Ejecución

### Requisitos previos:
```bash
- Node.js 18+
- npm o yarn
- Expo CLI
- Cuenta Google (para Gemini API)
- Cuenta Marvel Rivals API
```

### Pasos:

1. **Clonar repositorio:**
```bash
git clone <tu-repo>
cd mr-api
```

2. **Instalar dependencias:**
```bash
npm install
# o
yarn install
```

3. **Configurar API Keys:**

Editar `services/marvelRivalsApi.ts`:
```typescript
const API_KEY = 'TU_MARVEL_RIVALS_API_KEY';
```

Editar `services/geminiService.ts`:
```typescript
const GEMINI_API_KEY = 'TU_GEMINI_API_KEY';
```

4. **Ejecutar app:**
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web

# Desarrollo
npm start
```

---

## 🔑 Obtención de API Keys

### Marvel Rivals API:

1. Visitar: https://marvelrivalsapi.com/dashboard
2. Registrarse con email
3. Crear nueva API Key
4. Copiar y pegar en `marvelRivalsApi.ts`

### Google Gemini:

1. Visitar: https://aistudio.google.com/app/apikey
2. Iniciar sesión con Google
3. Crear nueva API Key
4. Copiar y pegar en `geminiService.ts`

**Nota:** Ambas APIs tienen tier gratuito con límites de requests.

---


// Probar IA
describe('GeminiService', () => {
  test('sendMessage() retorna resp
