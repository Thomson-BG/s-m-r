# 🎮 Scotty Mason's Revenge - Web Edition

**A Real-Time Strategy Game Inspired by Command & Conquer: Red Alert 2**

## 🌟 Overview

Scotty Mason's Revenge is a fully-featured web-based RTS game that captures the essence of classic Command & Conquer: Red Alert 2 gameplay. Built entirely with modern web technologies, it features multiple factions, campaign missions, and epic real-time strategy combat.

## ✨ Features

### 🎯 Core Gameplay
- **4 Unique Factions**: Allied Forces, Soviet Union, Rising Sun Empire, European Confederation
- **Campaign Mode**: Story-driven missions for each faction
- **Skirmish Mode**: Customizable battles against AI opponents
- **Real-Time Combat**: Classic RTS mechanics with modern polish

### 🏗️ Base Building
- **Resource Management**: Credits and power systems
- **Construction System**: Build bases, defenses, and production facilities
- **Technology Trees**: Unlock advanced units and buildings

### 👥 Units & Combat
- **Diverse Unit Types**: Infantry, vehicles, aircraft, and special units
- **Veterancy System**: Units gain experience and improve over time
- **Combined Arms**: Strategic unit combinations for maximum effectiveness

### 🖥️ Technical Features
- **100% Web-Based**: No downloads or installations required
- **Cross-Platform**: Works on desktop, tablet, and mobile devices  
- **Offline Capable**: Play without internet connection
- **Save System**: Progress saved in browser local storage

## 🚀 Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- 2GB RAM recommended
- 1024x768 minimum resolution

### How to Play
1. Open `index.html` in your web browser
2. Wait for the game to load all systems
3. Click "START GAME" for a quick battle
4. Or choose "CAMPAIGN" for the full story experience

### First Time Players
- Complete the tutorial missions in Campaign mode
- Read the comprehensive [User Guide](userguide.md)
- Start with Allied Forces faction (most beginner-friendly)

## 📁 Project Structure

```
scotty-masons-revenge/
├── index.html              # Main game page
├── userguide.md            # Comprehensive player guide
├── cover-generator.html    # Cover art generator tool
├── css/
│   ├── main.css           # Main game styling
│   └── ui.css             # UI component styles
├── js/
│   ├── core/              # Core game systems
│   │   ├── GameEngine.js  # Main game engine
│   │   ├── ResourceManager.js
│   │   ├── AudioManager.js
│   │   ├── InputManager.js
│   │   └── Renderer.js
│   ├── systems/           # Game logic systems
│   │   ├── UnitManager.js
│   │   ├── BuildingManager.js
│   │   ├── FactionManager.js
│   │   └── CampaignManager.js
│   ├── game/              # Game objects
│   │   ├── GameObject.js
│   │   ├── Unit.js
│   │   └── Building.js
│   ├── ui/                # User interface
│   │   └── UIManager.js
│   ├── utils/             # Utility functions
│   │   └── Utils.js
│   └── main.js            # Application entry point
└── assets/                # Game assets (images, audio)
```

## 🎮 Gameplay Guide

### Factions

#### 🇺🇸 Allied Forces
- **Specialty**: Advanced technology and precision weapons
- **Strengths**: Superior air power, fast construction
- **Weakness**: Higher costs, power dependent

#### 🇷🇺 Soviet Union  
- **Specialty**: Heavy armor and devastating firepower
- **Strengths**: Cheap units, high durability
- **Weakness**: Slow movement, high power consumption

#### 🌅 Rising Sun Empire
- **Specialty**: Energy efficiency and psychic warfare
- **Strengths**: Advanced robotics, transformation units
- **Weakness**: Complex mechanics, resource intensive

#### 🇪🇺 European Confederation
- **Specialty**: Balanced defense and weather control
- **Strengths**: Superior defenses, balanced roster
- **Weakness**: No major specialization

### Basic Strategy
1. **Economy First**: Build power plants and refineries
2. **Military Growth**: Train diverse unit types
3. **Combined Arms**: Use infantry, vehicles, and aircraft together
4. **Base Defense**: Build turrets and defensive positions
5. **Expansion**: Control multiple resource points

## 🛠️ Development

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Graphics**: Canvas 2D API with procedural generation
- **Audio**: Web Audio API with synthesized sounds
- **Storage**: LocalStorage for save games
- **Architecture**: Modular ES6 classes with event systems

### Key Systems

#### Game Engine
- 60 FPS game loop with delta time
- State management (menu, playing, paused)
- Resource loading and initialization
- Event-driven architecture

#### Renderer
- 2D Canvas-based graphics
- Sprite generation and caching
- Camera system with zoom and pan
- Layered rendering (terrain, buildings, units, effects)

#### Audio System
- Procedural sound generation
- Positional audio with distance falloff
- Music and sound effect management
- Volume controls and mixing

#### Input System
- Mouse and keyboard support
- Touch gestures for mobile devices
- Unit selection and command issuing
- Camera controls and UI interaction

### Performance Optimizations
- Efficient rendering with culling
- Object pooling for frequently created items
- Minimal DOM manipulation
- Optimized game loops and updates

## 📱 Platform Support

### Desktop Browsers
- **Chrome**: Full support, best performance
- **Firefox**: Full support
- **Safari**: Full support (macOS/iOS)
- **Edge**: Full support

### Mobile Devices
- **iOS Safari**: Touch controls, responsive UI
- **Android Chrome**: Touch controls, responsive UI
- **Performance**: Optimized for mobile processors

### Accessibility
- Keyboard-only navigation support
- Screen reader compatible UI elements
- High contrast mode support
- Scalable interface elements

## 🎨 Assets & Content

### Graphics
- Procedurally generated sprites
- Faction-specific color schemes
- Particle effects and animations
- Dynamic lighting and shadows

### Audio
- Synthesized sound effects
- Atmospheric background music
- Faction-specific audio themes
- Positional 3D audio

### Content
- Multiple campaign storylines
- Diverse unit and building types
- Various map sizes and terrain types
- Achievement and progression systems

## 🔧 Configuration

### Game Settings
- Graphics quality options
- Audio volume controls
- Game speed adjustment
- Control customization

### Browser Settings
- Local storage must be enabled
- JavaScript required
- Hardware acceleration recommended
- Pop-up blocker may need exceptions

## 🐛 Troubleshooting

### Common Issues
- **Loading Problems**: Clear browser cache, disable extensions
- **Performance Issues**: Lower graphics quality, close other tabs
- **Audio Problems**: Click on page to activate audio context
- **Save Issues**: Check local storage permissions

### Debug Tools
- Browser developer console shows detailed logs
- Performance monitoring built into game engine
- Debug commands available in development mode

## 🤝 Contributing

### Bug Reports
- Use browser developer tools to capture errors
- Include system information and browser version
- Describe steps to reproduce the issue

### Feature Requests
- Suggest new units, buildings, or game modes
- Propose balance changes and improvements
- Share strategic insights and feedback

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Inspiration**: Command & Conquer: Red Alert 2 by Westwood Studios
- **Commissioner**: Scotty Mason
- **Developer**: Josh Thomson (Thomson Innovations)
- **Community**: RTS gaming enthusiasts worldwide

## 📞 Support

For technical support, gameplay questions, or feedback:
- Check the [User Guide](userguide.md) for comprehensive information
- Use browser developer tools for debugging
- Report issues through the game's feedback system

---

**Ready to command your forces to victory? Launch the game and let the battle begin!** ⚔️🎮🌍

*Last Updated: 2024*  
*Version: Web Release 1.0*