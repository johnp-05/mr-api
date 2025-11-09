<div align="center">

# 🦸‍♂️ Marvel Rivals - Entrenador IA

### Tu asistente personal impulsado por Gemini AI 💜

![Demo Principal](./assets/demo.gif)

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## 🌟 Características Principales

### 1. 🦸‍♂️ Catálogo de Héroes

<details>
<summary>Ver demo</summary>

![Catálogo de Héroes](./assets/hero-catalog.gif)

</details>

- ✅ Visualización completa de todos los héroes
- ✅ Filtros por rol (Duelist, Vanguard, Strategist)
- ✅ Búsqueda inteligente por nombre/alias
- ✅ Sistema de favoritos con persistencia

---

### 2. 💜 Galacta - Tu Entrenadora IA

<table>
<tr>
<td width="50%">

**Capacidades:**

- 🤖 Análisis de héroes con IA
- 🎯 Composiciones de equipo optimizadas
- 💡 Recomendaciones personalizadas
- ⚖️ Comparador avanzado de héroes
- 📚 Historial contextual

</td>
<td width="50%">

![Galacta Chat](./assets/galacta-chat.gif)

</td>
</tr>
</table>

**Comandos especiales:**
```
"Compara Spider-Man vs Iron Man"  → Abre comparador
"Dame tips para [héroe]"          → Análisis detallado
"¿Cuál es la mejor comp 2-2-2?"   → Sugerencia de equipo
```

---

### 3. ⚖️ Comparador de Héroes con IA

<p align="center">
  <img src="./assets/comparator.gif" width="300" alt="Comparador"/>
</p>

**Análisis incluye:**
- ✅ Pros y Contras detallados
- ⭐ Dificultad en estrellas
- 🏆 Veredicto imparcial de Galacta
- 💡 Recomendación personalizada

---

### 4. 📊 Detalles de Héroe

| Vista | Características |
|-------|-----------------|
| ![Hero Details](./assets/hero-catalog.gif) | • Header visual a pantalla completa<br>• Badges de rol y dificultad<br>• Secciones: Bio, Habilidades, Stats<br>• Integración con favoritos |

---

### 5. 🔍 Búsqueda de Jugadores
```
┌─────────────────────────────────┐
│  🔍 Buscar Jugador              │
├─────────────────────────────────┤
│  Username: _____________        │
│         [Buscar]                │
├─────────────────────────────────┤
│  📊 Estadísticas:               │
│  • Rango: Diamante 🏆           │
│  • Nivel: 42                    │
│  • Win Rate: 58% 🟢             │
│                                 │
│  🦸‍♂️ Héroes más jugados:       │
│  1. Spider-Man - 156 partidas   │
│  2. Iron Man - 89 partidas      │
└─────────────────────────────────┘
```

---

## 🎬 Demos por Funcionalidad

<table>
<tr>
<td align="center" width="33%">

**Navegación**

![Navegación](./assets/navigation.gif)

Tabs fluidos con háptica

</td>
<td align="center" width="33%">

**Favoritos**

![Favoritos](./assets/favorites.gif)

Guarda y comparte consejos

</td>
<td align="center" width="33%">

**Búsqueda**

![Búsqueda](./assets/search.gif)

Filtros en tiempo real

</td>
</tr>
</table>

---

## 🛠️ Instalación Rápida
```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/marvel-rivals-app.git
cd marvel-rivals-app

# 2. Instalar dependencias
npm install

# 3. Configurar API Keys (ver sección abajo)
# Editar services/marvelRivalsApi.ts y services/geminiService.ts

# 4. Ejecutar app
npm start
```

### 📱 Ejecutar en dispositivo:

<p align="center">
  <img src="./assets/qr-code-demo.gif" width="200" alt="Escanea con Expo Go"/>
</p>

**Opciones:**
- 📱 iOS: Escanea QR con Cámara
- 🤖 Android: Escanea QR con Expo Go
- 💻 Web: Abre en navegador

---

## 🔑 Configuración de APIs

### 1. Marvel Rivals API
```typescript
// services/marvelRivalsApi.ts
const API_KEY = 'TU_API_KEY_AQUI'; // 👈 Cambiar
```

**Obtener API Key:**
1. 🌐 Visitar: https://marvelrivalsapi.com/dashboard
2. 📧 Registrarse con email
3. 🔑 Crear nueva API Key
4. 📋 Copiar y pegar

---

### 2. Google Gemini AI
```typescript
// services/geminiService.ts
const GEMINI_API_KEY = 'TU_GEMINI_KEY_AQUI'; // 👈 Cambiar
```

**Obtener API Key:**
1. 🌐 Visitar: https://aistudio.google.com/app/apikey
2. 🔐 Iniciar sesión con Google
3. ➕ Crear nueva API Key
4. 📋 Copiar y pegar

---

## 🎨 Stack Tecnológico
```typescript
const tech = {
  frontend: ['React Native', 'Expo Router', 'TypeScript'],
  ai: ['Google Gemini 2.0 Flash'],
  api: ['Marvel Rivals API v1'],
  storage: ['AsyncStorage'],
  ui: ['Expo Linear Gradient', 'Expo Image'],
  animations: ['React Native Animated']
};
```

---

## 📁 Estructura del Proyecto
```
mr-api/
├── 📱 app/
│   ├── (tabs)/
│   │   ├── index.tsx        # 🏠 Catálogo de héroes
│   │   ├── ai.tsx           # 💜 Chat con Galacta
│   │   └── explore.tsx      # 🔍 Búsqueda de jugadores
│   ├── hero/[id].tsx        # 📄 Detalles de héroe
│   └── favorites.tsx        # ⭐ Gestión de favoritos
├── 🧩 components/
│   └── HeroComparator.tsx   # ⚖️ Comparador IA
├── ⚙️ services/
│   ├── marvelRivalsApi.ts   # API de Marvel Rivals
│   ├── geminiService.ts     # Integración Gemini
│   └── favoritesService.ts  # Gestión de favoritos
└── 🎨 assets/
    └── *.gif                # GIFs de demostración
```

---

## 🚀 Características Destacadas

<table>
<tr>
<td width="50%">

### 🤖 IA Conversacional
- Contexto de héroes favoritos
- Historial de conversación
- Detección automática de menciones
- Respuestas en <3 segundos

</td>
<td width="50%">

### 🎯 UX Premium
- Dark/Light mode automático
- Animaciones fluidas
- Feedback háptico (iOS)
- Emojis estratégicos

</td>
</tr>
</table>

---

## 💡 Casos de Uso

### 🆕 Para Principiantes
```
Usuario: "Soy nuevo, ¿por dónde empiezo?"
Galacta: "¡Bienvenido! 🎉 Te recomiendo empezar con..."
```

### 🏆 Para Competitivos
```
Usuario: "Compara Luna Snow vs Mantis"
Galacta: "¡Excelente pregunta! 💜 Luna Snow es..."
```

### 🎮 Para Creadores
- Compartir builds desde favoritos
- Capturar análisis de Galacta
- Estadísticas de jugadores pro

---

## 🐛 Solución de Problemas

<details>
<summary><b>❌ Error: "API Key inválida"</b></summary>

**Solución:**
1. Verificar que copiaste la API Key completa
2. Revisar que no hay espacios extra
3. Confirmar que la key está activa en el dashboard
```typescript
// ✅ Correcto
const API_KEY = 'abc123def456...';

// ❌ Incorrecto
const API_KEY = ' abc123def456... '; // Espacios
```
</details>

<details>
<summary><b>⚠️ Error: "Límite de cuota alcanzado"</b></summary>

**Solución:**
- Gemini API Gratis: 15 requests/minuto
- Esperar 1 minuto entre requests intensivos
- Considerar upgrade para uso intensivo

</details>

---

## 📊 Métricas y Performance

| Métrica | Valor |
|---------|-------|
| ⚡ Carga inicial | <2s |
| 🤖 Respuesta IA | <3s |
| 📦 Tamaño app | ~45MB |
| 🔋 Consumo batería | Bajo |
| 📶 Uso de datos | ~5MB/sesión |

---

## 🗺️ Roadmap

- [ ] **v1.1** - Modo offline con caché
- [ ] **v1.2** - Comparador múltiple (3+ héroes)
- [ ] **v1.3** - Perfil de usuario con stats
- [ ] **v2.0** - Integración Discord/Twitter
- [ ] **v2.1** - Modo entrenamiento con IA
- [ ] **v2.2** - Notificaciones de meta updates

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 🎉

1. Fork el proyecto
2. Crea tu rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agrega nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

- **Marvel Rivals API** por los datos oficiales
- **Google Gemini** por la IA conversacional
- **Expo Team** por el increíble framework
- **Comunidad Marvel Rivals** por el feedback

---

<div align="center">

### 💜 Hecho con amor por John Pambi 🗣️🔥

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/tu-usuario)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/tu-usuario)

**¿Te gustó el proyecto? ¡Dale una ⭐!**

</div>
