# 🎮 Scotty Mason's Revenge: User Guide

**A Real-Time Strategy Game Inspired by Command & Conquer: Red Alert 2**

Welcome, Commander! This comprehensive guide will help you master the art of warfare in Scotty Mason's Revenge, a web-based RTS game that captures the essence of classic Command & Conquer gameplay.

---

## 📋 Table of Contents

1. [Getting Started](#-getting-started)
2. [Game Controls](#-game-controls)
3. [User Interface](#-user-interface)
4. [Factions](#-factions)
5. [Units](#-units)
6. [Buildings](#-buildings)
7. [Resources](#-resources)
8. [Combat System](#-combat-system)
9. [Campaign Mode](#-campaign-mode)
10. [Skirmish Mode](#-skirmish-mode)
11. [Tips & Strategies](#-tips--strategies)
12. [Keyboard Shortcuts](#-keyboard-shortcuts)
13. [Troubleshooting](#-troubleshooting)
14. [FAQ](#-faq)

---

## 🚀 Getting Started

### System Requirements
- **Browser**: Modern web browser (Chrome, Firefox, Safari, Edge)
- **JavaScript**: Must be enabled
- **Local Storage**: Required for save games
- **Audio**: Web Audio API support recommended
- **Resolution**: Minimum 1024x768, recommended 1920x1080

### First Launch
1. **Loading**: The game will automatically load all systems and assets
2. **Audio Setup**: Click anywhere to enable audio (browser requirement)
3. **Main Menu**: Navigate using mouse or keyboard
4. **Tutorial**: New players should start with Campaign mode for guided learning

### Quick Start
1. Click **"START GAME"** for an immediate skirmish battle
2. Your faction: **Allied Forces** 🇺🇸
3. Enemy faction: **Soviet Union** 🇷🇺
4. Objective: Destroy all enemy forces and structures

---

## 🕹️ Game Controls

### Mouse Controls
- **Left Click**: Select units/buildings, confirm actions
- **Right Click**: Command selected units (move/attack)
- **Left Drag**: Create selection box for multiple units
- **Right Drag**: N/A
- **Mouse Wheel**: Zoom in/out
- **Middle Click + Drag**: Pan camera

### Touch Controls (Mobile/Tablet)
- **Single Tap**: Select units/buildings
- **Tap + Hold**: Show context menu
- **Single Finger Drag**: Pan camera
- **Two Finger Pinch**: Zoom in/out
- **Two Finger Drag**: Rotate camera (if enabled)

### Advanced Controls
- **Double-Click Unit**: Select all units of the same type on screen
- **Ctrl + Click**: Add/remove units from selection
- **Alt + Click**: Select all units of same type owned by you
- **Shift + Click**: Queue multiple commands

---

## 🖥️ User Interface

### Main Menu
- **START GAME**: Quick skirmish battle
- **CAMPAIGN**: Story-driven missions
- **SKIRMISH**: Custom battles vs AI
- **LOAD GAME**: Resume saved games
- **SETTINGS**: Audio, graphics, and game options
- **CREDITS**: Development team information

### Game Interface Layout

#### Top HUD
- **Credits Display** 💰: Current money available
- **Power Display** ⚡: Current/maximum power
- **Game Controls**: Pause, speed, menu buttons

#### Left Panel
- **Tactical Map**: Mini overview of battlefield
- **Faction Banner**: Your current faction info

#### Bottom Panel
- **Selected Info**: Details about selected unit/building
- **Action Panel**: Available commands and production options

#### Right Panel
- **Build Queue**: Units/buildings in production
- **Unit Groups**: Quick selection groups (1-0)

### Status Indicators
- 🟢 **Green Health Bar**: Unit/building in good condition
- 🟡 **Yellow Health Bar**: Moderate damage taken
- 🔴 **Red Health Bar**: Severely damaged, needs attention
- ⚡ **Power Icon**: Indicates power-consuming buildings
- 🔧 **Construction Icon**: Building under construction
- ⭐ **Stars**: Unit veterancy level (experience)

---

## 🏛️ Factions

### 🇺🇸 Allied Forces
**"Technology and Precision Warfare"**

**Strengths**:
- Advanced technology units
- Superior air power
- Precise, long-range weapons
- Fast construction and repair

**Weaknesses**:
- More expensive units
- Lower armor values
- Power-dependent systems

**Signature Units**:
- **Navy SEAL**: Elite stealth infantry
- **Grizzly Tank**: Main battle tank
- **Harrier**: Fast attack aircraft

**Superweapon**: Chronosphere (teleportation device)

### 🇷🇺 Soviet Union
**"Raw Firepower and Heavy Armor"**

**Strengths**:
- Heavily armored units
- Devastating firepower
- Cheaper unit costs
- Resilient structures

**Weaknesses**:
- Slower unit movement
- Higher power consumption
- Limited technology options

**Signature Units**:
- **Conscript**: Basic infantry (cheap and numerous)
- **Rhino Tank**: Heavy assault tank
- **Tesla Trooper**: Electric shock infantry

**Superweapon**: Nuclear Missile (devastating area attack)

### 🌅 Rising Sun Empire
**"Advanced Robotics and Psionics"**

**Strengths**:
- Energy-efficient technology
- Psychic warfare capabilities
- Advanced robotics
- Unique transformation units

**Weaknesses**:
- Complex unit combinations
- Vulnerable to EMP attacks
- Resource intensive tech

**Signature Units**:
- **Warrior**: Basic samurai infantry
- **Psychic**: Mind control specialist
- **Mecha Tengu**: Transforming jet/mech

**Superweapon**: Psionic Decimator (mind control weapon)

### 🇪🇺 European Confederation
**"Balanced Defense Specialists"**

**Strengths**:
- Superior defensive structures
- Weather manipulation
- Balanced unit roster
- Efficient logistics

**Weaknesses**:
- No major specialization
- Moderate in all aspects
- Predictable strategies

**Signature Units**:
- **Peacekeeper**: Balanced infantry
- **Guardian**: Defensive specialist
- **Mirage Tank**: Stealth capabilities

**Superweapon**: Weather Controller (environmental weapon)

---

## 👥 Units

### Infantry Units

#### 🔧 Engineer
- **Role**: Construction and repair specialist
- **Health**: 25 HP
- **Speed**: Fast
- **Special**: Can capture enemy buildings, repair structures
- **Cost**: 500 credits
- **Build Time**: 10 seconds

#### ⚔️ Basic Infantry (GI/Conscript/Warrior/Peacekeeper)
- **Role**: Anti-infantry combat
- **Health**: 100 HP
- **Damage**: 25 (vs infantry)
- **Range**: Short to medium
- **Cost**: 200 credits
- **Special**: Can garrison buildings for protection

#### 🏴 Elite Infantry (Navy SEAL/Tesla Trooper/Psychic/Guardian)
- **Role**: Specialized combat
- **Health**: 125-150 HP
- **Damage**: 50-75
- **Range**: Medium
- **Cost**: 1000 credits
- **Special**: Unique abilities per faction

### Vehicle Units

#### 🚚 Harvester
- **Role**: Resource collection
- **Health**: 1000 HP
- **Speed**: Slow when loaded
- **Special**: Automatically collects ore and returns to refinery
- **Cost**: 1400 credits
- **Build Time**: 20 seconds

#### 🚗 Light Vehicles
- **Role**: Fast reconnaissance and harassment
- **Health**: 150-200 HP
- **Speed**: Very fast
- **Damage**: Light
- **Cost**: 600-800 credits

#### 🚛 Main Battle Tanks
- **Role**: Primary assault force
- **Health**: 300-400 HP
- **Damage**: 65-85
- **Armor**: Heavy
- **Cost**: 700-900 credits
- **Special**: Strong vs vehicles, weak vs infantry

### Aircraft Units

#### 🚁 Attack Aircraft
- **Role**: Air superiority and ground attack
- **Health**: 150-200 HP
- **Speed**: Very fast
- **Damage**: 80-100
- **Cost**: 1200-1600 credits
- **Special**: Cannot be attacked by most ground units

### Unit Experience System

Units gain experience through combat and can achieve veterancy levels:

#### ⭐ Veteran (Level 1)
- **Requirements**: Survive 2-3 combats or destroy 1 enemy unit
- **Bonuses**: +25% damage, +25% health, +10% speed
- **Visual**: One gold star

#### ⭐⭐ Elite (Level 2)
- **Requirements**: Destroy 3+ enemy units or survive major battles
- **Bonuses**: +50% damage, +50% health, +20% speed, special abilities
- **Visual**: Two gold stars

---

## 🏗️ Buildings

### Base Buildings

#### 🏛️ Construction Yard
- **Role**: Primary construction facility
- **Health**: 1000 HP
- **Power**: No consumption
- **Cost**: Free (starting building)
- **Builds**: All basic structures
- **Special**: Losing this severely limits building options

#### ⚡ Power Plant
- **Role**: Provides electrical power
- **Health**: 750 HP
- **Power**: +100 generation
- **Cost**: 800 credits
- **Build Time**: 15 seconds
- **Special**: Essential for advanced buildings

#### 🏭 Ore Refinery
- **Role**: Processes ore into credits
- **Health**: 900 HP
- **Power**: -50 consumption
- **Cost**: 2000 credits
- **Build Time**: 30 seconds
- **Special**: Includes one harvester when built

### Military Buildings

#### 🏫 Barracks
- **Role**: Trains infantry units
- **Health**: 800 HP
- **Power**: -20 consumption
- **Cost**: 500 credits
- **Produces**: All infantry units
- **Special**: Can set rally points for new units

#### 🏭 War Factory
- **Role**: Builds vehicles and tanks
- **Health**: 1000 HP
- **Power**: -50 consumption
- **Cost**: 2000 credits
- **Produces**: All vehicle units
- **Special**: Repair depot for damaged vehicles

#### 🔬 Tech Center
- **Role**: Enables advanced technology
- **Health**: 500 HP
- **Power**: -200 consumption
- **Cost**: 2000 credits
- **Build Time**: 50 seconds
- **Special**: Required for advanced units and superweapons

### Defensive Buildings

#### 🎯 Defense Turrets
- **Role**: Automated base defense
- **Health**: 900 HP
- **Power**: -50 consumption
- **Damage**: 100
- **Range**: 200
- **Cost**: 1000 credits
- **Special**: Attacks air and ground targets

#### 🛡️ Walls
- **Role**: Passive defense and base layout
- **Health**: 300 HP
- **Power**: No consumption
- **Cost**: 100 credits
- **Special**: Blocks unit movement, can be destroyed

### Building Placement
- **Green Outline**: Valid placement location
- **Red Outline**: Invalid placement (obstructed or out of bounds)
- **Power Radius**: Some buildings require proximity to power sources
- **Construction**: Buildings under construction are vulnerable

---

## 💰 Resources

### Credits 💰
**Primary Currency**

**Sources**:
- **Ore Refineries**: Process raw ore into credits
- **Harvesters**: Collect ore from ore deposits
- **Base Generation**: Small passive income over time

**Uses**:
- Build units and structures
- Repair damaged buildings
- Research upgrades

**Management Tips**:
- Build multiple refineries for faster income
- Protect harvesters from enemy attacks
- Expand to new ore fields when current ones deplete

### Power ⚡
**Energy System**

**Generation**:
- **Power Plants**: +100 power each
- **Advanced Generators**: Faction-specific high-output plants

**Consumption**:
- **Buildings**: Most structures require power
- **Defenses**: Automated weapons need power to function
- **Production**: Some units require power to build

**Power Shortage Effects**:
- ⚠️ **Low Power**: Slower production, reduced defense effectiveness
- 🔴 **No Power**: Buildings shut down, no production possible

**Power Management**:
- Build power plants before power-hungry structures
- Plan for future expansion power needs
- Protect power plants from enemy attacks

### Ore Deposits 🟫
**Finite Resource Nodes**

**Types**:
- **Regular Ore**: Standard income source
- **Gems**: Higher value, faster income
- **Tiberium**: Special ore with unique properties (faction-specific)

**Characteristics**:
- Finite supply - will eventually deplete
- Different densities provide varying income rates
- Can be contested by multiple players

---

## ⚔️ Combat System

### Damage Types

#### Physical Damage 🔫
- **Effective Against**: Infantry, light vehicles
- **Ineffective Against**: Heavy armor
- **Sources**: Rifles, machine guns, cannons

#### Explosive Damage 💥
- **Effective Against**: Buildings, grouped units
- **Area Effect**: Damages multiple targets
- **Sources**: Rockets, artillery, bombs

#### Energy Damage ⚡
- **Effective Against**: Electronic systems, shields
- **Special Effects**: Can disable units temporarily
- **Sources**: Laser weapons, tesla coils

### Armor Types

#### 🟢 No Armor
- **Units**: Infantry, light vehicles
- **Vulnerabilities**: All damage types effective
- **Protection**: None

#### 🟡 Light Armor
- **Units**: APCs, light tanks
- **Vulnerabilities**: Explosive weapons
- **Protection**: Reduced physical damage

#### 🔴 Heavy Armor
- **Units**: Main battle tanks, heavy vehicles
- **Vulnerabilities**: Specialized anti-tank weapons
- **Protection**: High resistance to small arms

### Combat Mechanics

#### Range and Line of Sight
- **Visual Range**: How far units can see enemies
- **Weapon Range**: Maximum distance for attacks
- **Obstacles**: Buildings and terrain block attacks
- **High Ground**: Elevated positions provide range bonus

#### Accuracy and Damage
- **Base Accuracy**: Each weapon has inherent accuracy
- **Distance Modifier**: Accuracy decreases with range
- **Movement Penalty**: Moving units are less accurate
- **Veterancy Bonus**: Experienced units are more accurate

#### Special Combat Features

##### 🎯 Critical Hits
- Random chance for extra damage
- Higher probability with veteran units
- Visual and audio feedback

##### 🛡️ Deflection
- Heavily armored units can deflect weak attacks
- No damage dealt on successful deflection
- More common against inappropriate weapon types

##### 💥 Splash Damage
- Explosive weapons damage nearby units
- Damage decreases with distance from impact
- Friendly fire possible - be careful with placement

---

## 📖 Campaign Mode

### Story Structure
Experience the epic conflict through the eyes of different factions as they fight for global dominance.

#### 🇺🇸 Allied Campaign: "Operation Eagle Strike"
**Missions**: 15 missions
**Difficulty**: Progressive from Easy to Hard
**Story**: Lead the Allied forces in their fight against tyranny

**Sample Missions**:
1. **"First Steps"**: Establish your base and train basic units
2. **"Defensive Operations"**: Survive enemy attacks while building defenses
3. **"Strike Force"**: Launch offensive operations against enemy positions

#### 🇷🇺 Soviet Campaign: "Red Revolution"
**Missions**: 15 missions  
**Difficulty**: Moderate to Brutal
**Story**: Spread Soviet influence through overwhelming might

#### 🌅 Empire Campaign: "Rising Dawn"
**Difficulty**: Hard to Brutal
**Story**: Expand the Empire's technological dominance

### Mission Types

#### 🏗️ Base Building
- Establish and expand your base
- Economic focus with defensive elements
- Time limits for construction goals

#### 🛡️ Defense Missions
- Survive waves of enemy attacks
- Limited resources, strategic placement crucial
- Multiple objectives and bonus goals

#### ⚔️ Assault Missions
- Destroy enemy bases and units
- Combined arms tactics required
- Various victory conditions

#### 🎯 Special Operations
- Unique objectives and mechanics
- Stealth missions, rescue operations
- Limited units, tactical gameplay

### Campaign Features

#### 📊 Mission Scoring
- **Speed Bonus**: Complete missions quickly for extra points
- **Efficiency Bonus**: Minimize losses for higher scores
- **Optional Objectives**: Bonus points for extra challenges
- **Difficulty Multiplier**: Higher difficulties provide score bonuses

#### 🏆 Achievements
- **Mission Completion**: Finish all missions in a campaign
- **Perfect Scores**: Complete missions with maximum points
- **Speed Runs**: Finish missions under target times
- **No Casualties**: Complete missions without losing units

#### 💾 Save System
- **Automatic Saves**: Game saves progress automatically
- **Mission Checkpoints**: Resume from key points in long missions
- **Multiple Saves**: Keep different save files for different attempts

---

## ⚔️ Skirmish Mode

### Game Setup

#### Map Selection
- **Small Maps**: 64x64, 2-4 players, quick battles
- **Medium Maps**: 128x128, 4-6 players, balanced gameplay
- **Large Maps**: 256x256, 6-8 players, epic battles
- **Huge Maps**: 512x512, 8+ players, marathon games

#### Faction Selection
- Choose your faction from available options
- Each faction has unique units and abilities
- Balance considerations for multiplayer games

#### AI Difficulty
- **Easy**: Passive AI, suitable for learning
- **Medium**: Balanced challenge for most players
- **Hard**: Aggressive AI with economic bonuses
- **Brutal**: Maximum difficulty with all bonuses

#### Game Rules
- **Starting Credits**: 5000, 10000, or unlimited
- **Unit Limits**: Maximum units per player
- **Superweapons**: Enable/disable superweapons
- **Base Walking**: Allow/prevent building on enemy structures

### Victory Conditions

#### 🏆 Annihilation
- Destroy all enemy units and buildings
- Most common victory condition
- Requires complete military dominance

#### 💰 Economic Victory
- Accumulate massive resource reserves
- Control majority of resource points
- Alternative to pure military conquest

#### 🎯 Objective Control
- Capture and hold key strategic points
- Time-based control requirements
- Encourages territorial warfare

#### 🚀 Superweapon Victory
- Build and successfully deploy superweapon
- Massive destructive potential
- High-risk, high-reward strategy

### AI Behavior

#### Personality Types
- **Aggressive**: Focuses on early attacks and pressure
- **Economic**: Prioritizes base building and long-term growth
- **Defensive**: Builds strong defenses before expanding
- **Adaptive**: Changes strategy based on game state

#### AI Bonuses (Higher Difficulties)
- **Resource Bonus**: Extra starting credits and faster income
- **Production Bonus**: Faster unit and building construction
- **Unit Bonus**: Extra starting units and periodic reinforcements
- **Intelligence Bonus**: Better target selection and tactics

---

## 💡 Tips & Strategies

### Early Game (0-10 minutes)

#### Economic Foundation
1. **Build Power Plants First**: Ensure adequate power for expansion
2. **Construct Refinery Quickly**: Establish income stream immediately
3. **Protect Harvesters**: Guard your economic units from raids
4. **Expand Ore Collection**: Build multiple refineries for faster income

#### Military Basics
1. **Build Barracks Early**: Start training basic infantry
2. **Scout the Map**: Use cheap units to explore and find enemies
3. **Defensive Positioning**: Place units to guard key approaches
4. **Production Balance**: 70% economy, 30% military early game

### Mid Game (10-20 minutes)

#### Base Development
1. **Tech Center Priority**: Build tech center for advanced units
2. **Defense Network**: Establish turrets at key defensive points
3. **Redundant Systems**: Multiple power plants and production facilities
4. **Expand Territory**: Secure additional ore fields

#### Military Growth
1. **Combined Arms**: Mix infantry, vehicles, and aircraft
2. **Unit Upgrades**: Focus on veterancy development
3. **Tactical Raids**: Harass enemy economy and infrastructure
4. **Strategic Reserves**: Keep mobile force for counterattacks

### Late Game (20+ minutes)

#### Advanced Strategy
1. **Superweapon Development**: Build and deploy faction superweapon
2. **Total War Economy**: Focus entirely on military production
3. **Elite Forces**: Use veteran units for maximum effectiveness
4. **Territory Control**: Dominate map resources and strategic points

### Faction-Specific Tips

#### 🇺🇸 Allied Forces
- **Technology Focus**: Rush to advanced tech quickly
- **Air Superiority**: Build aircraft to dominate skies
- **Precision Strikes**: Use accurate weapons for efficiency
- **Mobility**: Keep forces mobile and reactive

#### 🇷🇺 Soviet Union
- **Mass Production**: Build large numbers of cheap units
- **Heavy Armor**: Focus on tank-based strategies
- **Power Projection**: Build forward bases aggressively
- **Attrition Warfare**: Overwhelm enemies with numbers

#### 🌅 Rising Sun Empire
- **Energy Efficiency**: Maintain power surplus for abilities
- **Technology Synergy**: Combine units for maximum effect
- **Harassment Tactics**: Use mobility and special abilities
- **Transformation**: Adapt units to changing battlefield needs

### Common Mistakes to Avoid

#### ❌ Economic Errors
- Building military before adequate economy
- Insufficient power plant construction
- Unprotected harvesters and refineries
- Ignoring resource expansion

#### ❌ Military Mistakes
- Single unit type armies (no combined arms)
- Attacking without scouting first
- Leaving base completely undefended
- Poor target prioritization

#### ❌ Strategic Blunders
- Overextending early in game
- Neglecting technology advancement
- Poor base layout and organization
- Ignoring enemy superweapon development

---

## ⌨️ Keyboard Shortcuts

### Essential Commands
- **WASD**: Pan camera (alternative to mouse)
- **Space**: Pause/Resume game
- **Escape**: Open main menu or cancel current action
- **Enter**: Confirm dialog boxes and commands
- **Delete**: Destroy selected units/buildings

### Selection Shortcuts
- **H**: Select all units (entire army)
- **Ctrl+A**: Select all units on screen
- **Double-Click**: Select all units of same type on screen
- **Ctrl+Click**: Add/remove units from selection
- **Alt+Click**: Select all units of same type owned by you

### Unit Groups
- **Ctrl+1-0**: Assign selected units to group
- **1-0**: Select assigned unit group
- **Shift+1-0**: Add current selection to group
- **Alt+1-0**: Center camera on group

### Production Shortcuts
- **Q**: Queue most common unit (context-dependent)
- **E**: Build most common building (context-dependent)
- **R**: Repair selected building
- **T**: Stop current production/action

### Camera and View
- **+/-**: Zoom in/out
- **Arrow Keys**: Pan camera
- **Home**: Center on base
- **End**: Center on last battle/event
- **Page Up/Down**: Cycle through unit groups

### Game Speed
- **F1**: Slowest speed (0.5x)
- **F2**: Normal speed (1.0x)
- **F3**: Fast speed (1.5x)
- **F4**: Fastest speed (2.0x)

### Advanced Commands
- **Ctrl+S**: Quick save game
- **Ctrl+L**: Quick load game
- **Ctrl+Z**: Undo last action (if applicable)
- **F12**: Take screenshot
- **Alt+Enter**: Toggle fullscreen mode

---

## 🔧 Troubleshooting

### Performance Issues

#### Low Frame Rate
**Symptoms**: Choppy movement, slow response times
**Solutions**:
1. Lower graphics quality in settings
2. Close other browser tabs and applications
3. Ensure hardware acceleration is enabled
4. Update graphics drivers
5. Try different browser (Chrome recommended)

#### High Memory Usage
**Symptoms**: Browser becomes sluggish, system slowdown
**Solutions**:
1. Refresh the game page periodically
2. Clear browser cache and cookies
3. Reduce game speed setting
4. Close unnecessary browser tabs

### Audio Problems

#### No Sound
**Solutions**:
1. Click anywhere on page to activate audio
2. Check browser audio settings
3. Ensure volume is not muted
4. Try refreshing the page
5. Check system audio mixer

#### Distorted Audio
**Solutions**:
1. Lower master volume in game settings
2. Check system audio sample rate
3. Close other audio applications
4. Try different browser

### Game Loading Issues

#### Infinite Loading Screen
**Solutions**:
1. Hard refresh page (Ctrl+F5)
2. Clear browser cache
3. Disable browser extensions temporarily
4. Check internet connection
5. Try incognito/private browsing mode

#### Game Won't Start
**Solutions**:
1. Enable JavaScript in browser
2. Check for browser updates
3. Disable ad blockers temporarily
4. Allow local storage permissions
5. Try different browser

### Gameplay Issues

#### Units Won't Move
**Solutions**:
1. Check if game is paused
2. Ensure units aren't already busy with commands
3. Right-click on valid terrain
4. Select units first before issuing commands

#### Buildings Won't Build
**Solutions**:
1. Check available credits and power
2. Ensure construction requirements are met
3. Find valid placement location (green outline)
4. Verify faction can build selected structure

### Save Game Problems

#### Can't Save Game
**Solutions**:
1. Enable local storage in browser
2. Clear storage space (delete old saves)
3. Check browser privacy settings
4. Ensure sufficient disk space

#### Save Files Corrupted
**Solutions**:
1. Load earlier save file
2. Start new game
3. Clear browser storage and restart
4. Export save files before major browser updates

---

## ❓ FAQ

### General Questions

**Q: Is this game free to play?**
A: Yes, Scotty Mason's Revenge is completely free to play in your web browser.

**Q: Do I need to download anything?**
A: No, the game runs entirely in your browser. No downloads or installations required.

**Q: Can I play offline?**
A: The game supports offline play once initially loaded, but some features may require internet connection.

**Q: Is there multiplayer support?**
A: Currently, the game features single-player campaigns and skirmish against AI opponents. Multiplayer may be added in future updates.

### Gameplay Questions

**Q: How do I win a skirmish match?**
A: Destroy all enemy units and buildings, or achieve specific victory conditions if enabled.

**Q: Why can't I build certain units?**
A: Some units require specific buildings (like Tech Center) or faction requirements to unlock.

**Q: How do I save my progress?**
A: The game auto-saves campaign progress. You can also manually save from the pause menu.

**Q: Can I change factions during a campaign?**
A: No, each campaign is faction-specific. You can start different campaigns for other factions.

### Technical Questions

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, and Edge. Chrome is recommended for best performance.

**Q: Why is the game running slowly?**
A: Try lowering graphics quality, closing other tabs, or playing on a less crowded map.

**Q: How do I report bugs?**
A: Use the feedback option in the main menu or contact support through the official channels.

**Q: Are there cheat codes?**
A: In development mode, you can access debug commands through the browser console, but not in the standard game.

### Strategy Questions

**Q: What's the best faction for beginners?**
A: Allied Forces are recommended for new players due to balanced units and straightforward strategies.

**Q: How important is base defense?**
A: Very important! Always build defensive structures and keep some units guarding your base.

**Q: Should I focus on economy or military first?**
A: Start with economy (70%), then gradually shift to military (50/50), then full military in late game.

**Q: How do I counter specific unit types?**
A: Use combined arms: infantry beats aircraft, vehicles beat infantry, aircraft beat vehicles. Anti-tank units counter heavy armor.

---

## 🎯 Advanced Strategies

### Micro-Management Techniques

#### Unit Control
- **Stutter Stepping**: Move units between attacks to avoid return fire
- **Focus Fire**: Concentrate all units on single high-value targets
- **Retreat Timing**: Pull damaged units back before they're destroyed
- **Formation Fighting**: Use unit positioning for maximum effectiveness

#### Economic Optimization
- **Harvester Cycling**: Manually direct harvesters to optimal ore patches
- **Production Queuing**: Always keep production buildings busy
- **Power Management**: Build exactly enough power, no excess
- **Resource Denial**: Capture or destroy enemy ore sources

### Macro-Management

#### Base Layout
- **Production Efficiency**: Group related buildings together
- **Defensive Layers**: Multiple rings of defense around core structures
- **Expansion Planning**: Plan base growth for optimal efficiency
- **Redundancy**: Multiple production facilities to prevent bottlenecks

#### Map Control
- **Strategic Points**: Control key terrain features and resources
- **Vision Control**: Maintain scouts across the battlefield
- **Territory Expansion**: Gradually expand your sphere of influence
- **Chokepoint Management**: Control narrow passages and bridges

### Psychological Warfare

#### Pressure Tactics
- **Economic Harassment**: Constant raids on enemy harvesters
- **Feint Attacks**: Threaten multiple locations simultaneously
- **Resource Strangulation**: Cut off enemy expansion attempts
- **Timing Pressure**: Force engagements at advantageous times

---

## 🏆 Achievement System

### Campaign Achievements
- 🥇 **Campaign Victor**: Complete all missions in a faction campaign
- 🎯 **Perfect Mission**: Complete mission with 100% score
- ⚡ **Speed Runner**: Complete campaign under target time
- 🛡️ **Untouchable**: Complete mission without losing any units

### Combat Achievements  
- 💀 **Destroyer**: Destroy 1000 enemy units
- 🏭 **Demolisher**: Destroy 100 enemy buildings
- ⭐ **Elite Commander**: Promote 50 units to elite status
- 🎖️ **Veteran Leader**: Win 25 skirmish battles

### Economic Achievements
- 💰 **Millionaire**: Accumulate 1,000,000 credits
- ⚡ **Power Player**: Generate 10,000 total power
- 🚚 **Resource Master**: Collect 100,000 ore
- 🏗️ **Master Builder**: Construct 500 buildings

---

## 📞 Support & Community

### Getting Help
- **In-Game Tutorial**: Complete campaign missions for guided learning
- **Community Forums**: Connect with other players for tips and strategies
- **Video Guides**: Watch gameplay videos for advanced techniques
- **Developer Blog**: Stay updated on game development and patches

### Feedback
- **Bug Reports**: Report issues through the game's feedback system
- **Feature Requests**: Suggest new content and improvements
- **Balance Feedback**: Share thoughts on unit and faction balance
- **Community Content**: Share screenshots, videos, and strategies

### Updates
- **Regular Patches**: Bug fixes and balance adjustments
- **Content Updates**: New units, buildings, and campaigns
- **Feature Additions**: New game modes and quality of life improvements
- **Community Events**: Special challenges and competitions

---

## 🎉 Conclusion

Congratulations, Commander! You now have all the knowledge needed to dominate the battlefield in Scotty Mason's Revenge. Remember that mastery comes through practice, so don't be discouraged by early defeats. Each battle teaches valuable lessons that will make you a stronger strategist.

**Key Takeaways**:
- 🏗️ **Economy First**: Build a strong economic foundation before military expansion
- ⚔️ **Combined Arms**: Use diverse unit types working together
- 🛡️ **Defense Matters**: Always protect your base and key assets
- 📈 **Adapt & Overcome**: Change strategies based on battlefield conditions
- 🧠 **Think Ahead**: Plan several moves in advance like chess

Whether you're leading the Allied Forces to technological victory, crushing enemies with Soviet might, or dominating through Empire innovation, remember that victory belongs to those who can adapt, improvise, and overcome.

**Good luck, Commander! The fate of the world is in your hands!** 🌍⚔️🏆

---

*This guide will be updated regularly with new strategies, tips, and content. Check back frequently for the latest information!*

**Version**: 1.0  
**Last Updated**: 2024  
**Game Version**: Web Release 1.0