# Arolar Viajes Website

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas

```
website/
├── src/                          # Código fuente principal
│   ├── components/               # Componentes reutilizables
│   │   ├── banners/             # Componente de banners
│   │   │   ├── banners.css      # Estilos del componente
│   │   │   ├── bannersModule.js # Lógica del componente
│   │   │   └── README.md        # Documentación
│   │   ├── reels/               # Componente de reels
│   │   │   ├── reels.css        # Estilos del componente
│   │   │   ├── reelsModule.js   # Lógica del componente
│   │   │   └── README.md        # Documentación
│   │   ├── carousel/            # Componente de carrusel
│   │   │   ├── carousel.js      # Lógica del carrusel
│   │   │   ├── flightLoader.js  # Cargador de datos
│   │   │   └── README.md        # Documentación
│   │   ├── features/            # Componente de características
│   │   ├── header/              # Componente de header
│   │   └── footer/              # Componente de footer
│   ├── modules/                 # Módulos de funcionalidad
│   │   ├── scroll/              # Sistema de scroll
│   │   │   ├── ultraSmoothScroll.js
│   │   │   └── README.md
│   │   ├── animations/          # Animaciones
│   │   │   └── animations.js
│   │   └── data-loader/         # Cargadores de datos
│   ├── styles/                  # Estilos globales
│   │   ├── main.css            # Punto de entrada CSS
│   │   └── base.css            # Estilos base
│   ├── utils/                   # Utilidades
│   │   └── utils.js            # Funciones utilitarias
│   ├── data/                    # Datos JSON
│   │   ├── banners.json        # Datos de banners
│   │   ├── reels.json          # Datos de reels
│   │   └── flights.json        # Datos de vuelos
│   ├── assets/                  # Recursos estáticos
│   │   └── images/             # Imágenes
│   └── main.js                 # Punto de entrada JavaScript
├── index.html                   # Página principal
├── searchbox.html              # Página de búsqueda
├── package.json                # Configuración del proyecto
└── README.md                   # Documentación principal
```

## 🚀 Características

### ✨ Scroll Ultra Fluido
- **Detección inteligente**: Distingue entre scroll horizontal y vertical
- **Momentum natural**: Inercia suave como scrollview nativo
- **Resistencia en bordes**: Suave en los extremos
- **Performance optimizado**: 60fps en todos los dispositivos

### 📱 Mobile First
- **Touch gestures**: Gestos naturales de móvil
- **Responsive design**: Se adapta a todos los tamaños
- **Hardware acceleration**: Optimizado para performance
- **Overscroll behavior**: Control de scroll nativo

### 🧩 Arquitectura Modular
- **Componentes encapsulados**: Cada componente es independiente
- **Separación de responsabilidades**: CSS, JS y datos separados
- **Reutilización**: Componentes reutilizables
- **Mantenibilidad**: Fácil de mantener y escalar

## 🛠️ Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con flexbox y grid
- **JavaScript ES6+**: Módulos y clases
- **JSON**: Datos estructurados
- **Intersection Observer**: Autoplay de videos
- **RequestAnimationFrame**: Animaciones suaves

## 📦 Componentes

### Banners
- Scroll horizontal ultra fluido
- Carga dinámica desde JSON
- Touch gestures optimizados

### Reels
- Videos con autoplay inteligente
- Scroll horizontal suave
- Intersection Observer para performance

### Carrusel de Vuelos
- Cards de vuelos deslizables
- Carga dinámica de datos
- Scroll nativo del navegador

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone [repository-url]

# Navegar al directorio
cd website

# Instalar dependencias (si las hay)
npm install

# Ejecutar servidor local
npm run dev
# o
python -m http.server 8000
```

## 📝 Uso

### Agregar nuevo banner
```javascript
addBanner('Título', 'https://link.com', 'Aria Label', 'image.jpg', 'Alt text');
```

### Agregar nuevo reel
```javascript
addReel('Título', 'video.mp4', 'https://link.com', 'unique-id');
```

### Debug del carrusel
```javascript
carouselDebug.getCurrentIndex();
carouselDebug.next();
carouselDebug.previous();
```

## 🔧 Configuración

### Velocidades de scroll
- Wheel scroll: 0.4x
- Touch drag: 0.6x
- Friction: 0.95
- Boundary resistance: 30%

### Umbrales de detección
- Touch: 15px
- Mouse: 10px
- Minimum velocity: 0.005

## 📱 Compatibilidad

- **Chrome**: ✅ Totalmente compatible
- **Safari**: ✅ Totalmente compatible
- **Firefox**: ✅ Totalmente compatible
- **Edge**: ✅ Totalmente compatible
- **Mobile**: ✅ Optimizado para móviles

## 🎯 Performance

- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.
