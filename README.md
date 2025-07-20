# 🎮 Scotty Mason's Revenge: RTS

**A next-generation iOS real-time strategy game inspired by Command & Conquer: Red Alert 2**

Scotty Mason's Revenge is a fully-featured 3D RTS game built for iOS and iPadOS that captures the essence of the classic Command & Conquer: Red Alert 2 while bringing modern graphics, controls, and features to mobile devices.

## 🌟 Features

### ✅ **Complete RTS Experience**
- **9 Unique Factions** with distinct units, buildings, and superweapons
- **Full Campaign Mode** with 45+ missions across all factions
- **Skirmish Mode** with AI opponents and customizable maps
- **Resource Management** with credits and power systems
- **Base Building** with 40+ building types
- **Unit Combat** with 50+ unit types and veterancy system

### ⚔️ **Factions & Combat**
- **Allied Forces** - Technology and precision strikes
- **Soviet Union** - Raw firepower and heavy armor  
- **Rising Sun Empire** - Advanced robotics and psionics
- **European Confederation** - Balanced defense specialists
- **Pacific Republic** - Naval supremacy and amphibious warfare
- **African Federation** - Resource abundance and guerrilla tactics
- **Arctic Coalition** - Cold warfare and ice technology
- **Corporate Syndicate** - High-tech mercenaries
- **Global Resistance** - Scrappy survivors with improvised weapons

### 🎯 **Modern iOS Features**
- **Touch Controls** optimized for iPhone and iPad
- **Game Controller Support** for Xbox and PlayStation controllers
- **Save/Load System** with multiple save slots
- **High-Quality 3D Graphics** with PBR materials and lighting
- **Scalable UI** supporting all iOS device sizes
- **File Sharing** for save games via iTunes

## 🚀 Getting Started

### Requirements
- iOS 17.0+ or iPadOS 17.0+
- iPhone or iPad with A12 Bionic chip or later
- 2GB+ available storage

### Installation
1. Clone this repository
2. Open `ScottyMasonsRevenge.xcodeproj` in Xcode 15+
3. Build and run on your iOS device or simulator

### First Time Setup
1. Launch the game
2. Select your preferred faction
3. Complete the tutorial mission
4. Choose Campaign or Skirmish mode
5. Start building your empire!

## 🎮 Gameplay Guide

### Basic Controls
- **Tap** to select units or buildings
- **Drag** to select multiple units
- **Tap & Hold** for context menus
- **Pinch** to zoom camera
- **Two-finger drag** to move camera
- **Controller Support** for traditional RTS controls

### Resource Management
- **Credits** - Primary currency for building units and structures
- **Power** - Required to operate buildings and defenses
- Build **Refineries** and **Harvesters** to collect ore
- Construct **Power Plants** to generate electricity

### Combat System
- Units gain **Experience** from combat
- **Veteran** units deal +25% damage and have +25% health
- **Elite** units deal +50% damage and have +50% health
- Use combined arms tactics for maximum effectiveness

### Superweapons
Each faction has a unique superweapon:
- **Chronosphere** (Allies) - Teleport units across the map
- **Nuclear Missile** (Soviets) - Devastating area attack
- **Psionic Decimator** (Empire) - Mind control technology
- **Weather Controller** (Confederation) - Control battlefield conditions
- And 5 more unique superweapons!

## 🏗️ Technical Architecture

### Core Systems
- **GameEngine** - Main game loop and state management
- **ResourceManager** - Economic system and power management
- **UnitManager** - Unit creation, AI, and combat
- **BuildingManager** - Construction and building management
- **FactionManager** - Faction-specific content and bonuses
- **CampaignManager** - Mission system and objectives

### Graphics & Audio
- **SceneKit** for 3D rendering with PBR materials
- **Procedural Terrain** generation with multiple biomes
- **Dynamic Lighting** with real-time shadows
- **Particle Effects** for explosions and special abilities
- **Faction-Specific Music** and unit voice acting

### Save System
- **JSON-based saves** with full game state
- **Multiple save slots** with thumbnails
- **Auto-save** functionality
- **Campaign progress** tracking
- **Statistics** and achievement tracking

## 📱 Platform Support

### iPhone
- Optimized touch controls
- Portrait and landscape modes
- Adaptive UI for all screen sizes
- Performance scaling for older devices

### iPad
- Enhanced UI with additional panels
- Support for external keyboards
- Apple Pencil support for precise control
- Split-screen multitasking compatibility

### Game Controllers
- **Xbox Wireless Controller** support
- **PlayStation DualSense** support  
- **MFi controllers** support
- **Custom button mapping**

## 🔧 Development

### Project Structure
```
ScottyMasonsRevenge/
├── Core/                    # Game engine and scene management
├── Game Systems/           # Resource, unit, building, faction systems
├── UI/                     # User interface components
└── Resources/              # Assets, images, sounds
```

### Building the Project
1. Ensure Xcode 15+ is installed
2. Open `ScottyMasonsRevenge.xcodeproj`
3. Select your target device
4. Build and run (⌘+R)

### Testing
- Unit tests for core game logic
- UI tests for interface interactions
- Performance profiling for 60fps gameplay
- Memory usage optimization

## 📚 Documentation

### For Players
- **User Manual** - Complete gameplay guide with screenshots
- **Strategy Guide** - Faction-specific tactics and tips
- **Controller Setup** - Configuring external controllers

### For Developers  
- **Developer Manual** - Technical implementation details
- **API Documentation** - Core system interfaces
- **Modding Guide** - Adding custom content
- **Troubleshooting** - Common issues and solutions

## 🏆 Game Modes

### Campaign Mode
- **45+ Missions** across 9 factions
- **Increasing Difficulty** with optional objectives
- **Narrative Storylines** for each faction
- **Bonus Rewards** for mission excellence

### Skirmish Mode
- **AI Opponents** with 4 difficulty levels
- **Custom Maps** with various terrain types
- **Configurable Rules** (unit limits, starting resources, etc.)
- **Multiple Victory Conditions**

### Multiplayer (Future)
- **Online Battles** with matchmaking
- **Cooperative Campaigns** with friends
- **Ranked Play** with leaderboards
- **Tournament Mode** for competitive play

## 🎨 Art & Design

### Visual Style
- **Realistic 3D Models** with high-polygon counts
- **PBR Materials** for authentic lighting
- **Faction-Specific Aesthetics** with unique color schemes
- **Environmental Storytelling** through map details

### Audio Design
- **Dynamic Music** that responds to gameplay
- **Faction-Specific Themes** with unique instruments
- **Realistic Sound Effects** for weapons and vehicles
- **Professional Voice Acting** for all units

## 📊 Performance

### Target Specifications
- **60 FPS** on iPhone 12 and newer
- **30 FPS** minimum on supported devices
- **Dynamic Quality Scaling** for optimal performance
- **Memory Optimization** for extended play sessions

### Optimization Features
- **Level-of-Detail (LOD)** for distant objects
- **Occlusion Culling** to hide non-visible geometry
- **Texture Streaming** for reduced memory usage
- **Battery Optimization** with adjustable quality settings

## 🔄 Future Updates

### Planned Features
- **Additional Factions** with unique mechanics
- **Map Editor** for user-generated content
- **Mod Support** for community modifications
- **VR Mode** for immersive gameplay
- **Apple TV Support** with Siri Remote controls

### Community Features
- **Replay System** for sharing epic battles
- **Screenshot Mode** with advanced camera controls
- **Social Integration** for sharing achievements
- **Community Challenges** with special rewards

## 🐛 Bug Reports & Support

### Reporting Issues
1. Check existing issues on GitHub
2. Provide device information and iOS version
3. Include save file if relevant
4. Describe steps to reproduce the problem

### Getting Help
- **In-Game Tutorial** for basic gameplay
- **Community Discord** for strategy discussions
- **GitHub Issues** for technical problems
- **Official Forums** for general questions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by **Command & Conquer: Red Alert 2** by Westwood Studios
- Built with **Apple's SceneKit** framework
- Uses **Swift 6** and modern iOS development practices
- Special thanks to the RTS gaming community

---

**Ready to command your faction to victory? Download Scotty Mason's Revenge today!** ⚔️🎮🌍 
