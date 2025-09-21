/**
 * Main Game Engine for Scotty Mason's Revenge
 * Manages game state, updates, and coordination between systems
 */

class GameEngine {
    constructor() {
        this.isInitialized = false;
        this.currentState = 'menu';
        this.isPaused = false;
        this.gameSpeed = 1.0;
        this.lastUpdateTime = 0;
        this.deltaTime = 0;
        
        // Game systems
        this.resourceManager = null;
        this.unitManager = null;
        this.buildingManager = null;
        this.factionManager = null;
        this.campaignManager = null;
        this.audioManager = null;
        this.inputManager = null;
        this.renderer = null;
        this.uiManager = null;
        
        // Game settings
        this.selectedFaction = 'allies';
        this.difficulty = 'medium';
        this.mapSize = 'medium';
        
        // Update loop
        this.updateLoop = null;
        
        // Event system
        this.eventListeners = {};
        
        console.log('🎮 GameEngine initialized');
    }
    
    /**
     * Initialize all game systems
     */
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🚀 Initializing Scotty Mason\'s Revenge...');
        
        try {
            // Initialize core systems
            this.resourceManager = new ResourceManager();
            this.audioManager = new AudioManager();
            this.inputManager = new InputManager();
            this.renderer = new Renderer();
            this.uiManager = new UIManager();
            
            // Initialize game systems
            this.unitManager = new UnitManager();
            this.buildingManager = new BuildingManager();
            this.factionManager = new FactionManager();
            this.campaignManager = new CampaignManager();
            
            // Initialize each system
            await this.resourceManager.initialize();
            await this.audioManager.initialize();
            await this.inputManager.initialize();
            await this.renderer.initialize();
            await this.uiManager.initialize();
            
            await this.unitManager.initialize();
            await this.buildingManager.initialize();
            await this.factionManager.initialize();
            await this.campaignManager.initialize();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            this.emit('gameInitialized');
            
            console.log('✅ Game engine initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize game engine:', error);
            throw error;
        }
    }
    
    /**
     * Start the main game loop
     */
    startGameLoop() {
        if (this.updateLoop) {
            cancelAnimationFrame(this.updateLoop);
        }
        
        this.lastUpdateTime = performance.now();
        this.gameLoop();
    }
    
    /**
     * Stop the main game loop
     */
    stopGameLoop() {
        if (this.updateLoop) {
            cancelAnimationFrame(this.updateLoop);
            this.updateLoop = null;
        }
    }
    
    /**
     * Main game loop
     */
    gameLoop() {
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastUpdateTime) / 1000 * this.gameSpeed;
        this.lastUpdateTime = currentTime;
        
        if (!this.isPaused && this.currentState === 'playing') {
            this.update(this.deltaTime);
            this.render();
        }
        
        this.updateLoop = requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Update all game systems
     */
    update(deltaTime) {
        try {
            // Update core systems
            this.resourceManager.update(deltaTime);
            this.unitManager.update(deltaTime);
            this.buildingManager.update(deltaTime);
            this.inputManager.update(deltaTime);
            this.audioManager.update(deltaTime);
            
            // Check game conditions
            this.checkGameConditions();
            
            // Update UI
            this.uiManager.update(deltaTime);
            
        } catch (error) {
            console.error('Error in game update:', error);
        }
    }
    
    /**
     * Render the game
     */
    render() {
        try {
            this.renderer.clear();
            this.renderer.render();
        } catch (error) {
            console.error('Error in game render:', error);
        }
    }
    
    /**
     * Start a new campaign
     */
    startCampaign(faction = 'allies', difficulty = 'medium') {
        console.log(`🎯 Starting campaign: ${faction} (${difficulty})`);
        
        this.selectedFaction = faction;
        this.difficulty = difficulty;
        this.currentState = 'playing';
        
        // Initialize game world
        this.initializeGameWorld();
        
        // Start first mission - map faction to campaign ID
        const campaignId = faction + '_campaign';
        this.campaignManager.startCampaign(campaignId);
        
        // Start game loop
        this.startGameLoop();
        
        this.emit('campaignStarted', { faction, difficulty });
    }
    
    /**
     * Start a skirmish game
     */
    startSkirmish(settings = {}) {
        console.log('⚔️ Starting skirmish game');
        
        const defaultSettings = {
            playerFaction: 'allies',
            enemyFactions: ['soviet'],
            difficulty: 'medium',
            mapSize: 'medium',
            startingCredits: 5000,
            startingPower: 100
        };
        
        const gameSettings = { ...defaultSettings, ...settings };
        
        this.selectedFaction = gameSettings.playerFaction;
        this.difficulty = gameSettings.difficulty;
        this.mapSize = gameSettings.mapSize;
        this.currentState = 'playing';
        this.gameStartTime = performance.now();
        
        // Initialize game world
        this.initializeGameWorld(gameSettings);
        
        // Start game loop
        this.startGameLoop();
        
        this.emit('skirmishStarted', gameSettings);
    }
    
    /**
     * Initialize the game world
     */
    initializeGameWorld(settings = {}) {
        // Reset all systems
        this.resourceManager.reset();
        this.unitManager.reset();
        this.buildingManager.reset();
        
        // Set initial resources
        this.resourceManager.setCredits(settings.startingCredits || 5000);
        const startingPower = settings.startingPower || 100;
        this.resourceManager.setPower(startingPower, startingPower);
        
        // Initialize map
        this.renderer.initializeMap(this.mapSize);
        
        // Place starting buildings and units
        this.placeStartingAssets();
        
        // Force UI update for initial values
        if (this.uiManager) {
            const credits = this.resourceManager.getCredits();
            const power = this.resourceManager.getPower();
            const maxPower = this.resourceManager.getMaxPower();
            console.log('🔋 Initial values - credits:', credits, 'power:', power, 'maxPower:', maxPower);
            this.uiManager.updateCreditsDisplay(credits);
            this.uiManager.updatePowerDisplay(power, maxPower);
        }
        
        console.log('🌍 Game world initialized');
    }
    
    /**
     * Place starting buildings and units
     */
    placeStartingAssets() {
        const startingBuildings = this.factionManager.getStartingBuildings(this.selectedFaction);
        const startingUnits = this.factionManager.getStartingUnits(this.selectedFaction);
        
        // PLAYER STARTING ASSETS
        // Place construction yard at center
        const constructionYard = this.buildingManager.createBuilding('construction_yard', {
            x: 400,
            y: 300,
            faction: this.selectedFaction
        });
        
        // Place power plant
        const powerPlant = this.buildingManager.createBuilding('power_plant', {
            x: 350,
            y: 250,
            faction: this.selectedFaction
        });
        
        // Place ore refinery
        const refinery = this.buildingManager.createBuilding('ore_refinery', {
            x: 450,
            y: 250,
            faction: this.selectedFaction
        });
        
        // Create starting units
        const engineer = this.unitManager.createUnit('engineer', {
            x: 380,
            y: 350,
            faction: this.selectedFaction
        });
        
        const harvester = this.unitManager.createUnit('chrono_miner', {
            x: 470,
            y: 280,
            faction: this.selectedFaction
        });
        
        console.log('🏗️ Player starting assets placed');
        
        // ENEMY STARTING ASSETS (placed far from player)
        try {
            const enemyFaction = 'enemy';
            
            console.log('🏗️ Creating enemy assets...');
            
            // Enemy construction yard
            const enemyConstructionYard = this.buildingManager.createBuilding('construction_yard', {
                x: 1200,
                y: 900,
                faction: enemyFaction
            });
            console.log('🏗️ Enemy construction yard created');
            
            // Enemy power plant
            const enemyPowerPlant = this.buildingManager.createBuilding('power_plant', {
                x: 1150,
                y: 850,
                faction: enemyFaction
            });
            console.log('🏗️ Enemy power plant created');
            
            // Enemy ore refinery
            const enemyRefinery = this.buildingManager.createBuilding('ore_refinery', {
                x: 1250,
                y: 850,
                faction: enemyFaction
            });
            console.log('🏗️ Enemy refinery created');
            
            // Enemy units
            const enemyEngineer = this.unitManager.createUnit('engineer', {
                x: 1180,
                y: 950,
                faction: enemyFaction
            });
            console.log('🏗️ Enemy engineer created');
            
            const enemyHarvester = this.unitManager.createUnit('chrono_miner', {
                x: 1270,
                y: 880,
                faction: enemyFaction
            });
            console.log('🏗️ Enemy harvester created');
            
            // Enemy attack units
            const enemyTank = this.unitManager.createUnit('grizzly_tank', {
                x: 1150,
                y: 950,
                faction: enemyFaction
            });
            console.log('🏗️ Enemy tank created');
            
            const enemyInfantry = this.unitManager.createUnit('gi', {
                x: 1100,
                y: 900,
                faction: enemyFaction
            });
            console.log('🏗️ Enemy infantry created');
            
            console.log('🏗️ All enemy assets created successfully');
            
        } catch (error) {
            console.error('❌ Failed to create enemy assets:', error);
        }
        
        // PLACE RESOURCE PATCHES
        this.placeResourcePatches();
        
        console.log('🏗️ Starting assets placed for player and enemy');
    }
    
    /**
     * Place resource patches on the map
     */
    placeResourcePatches() {
        console.log('💎 Placing resource patches...');
        
        // Create ore patches near starting positions
        const orePatches = [
            // Near player starting area
            { x: 300, y: 200, amount: 5000 },
            { x: 500, y: 350, amount: 4000 },
            { x: 250, y: 400, amount: 3000 },
            
            // Center map patches
            { x: 600, y: 500, amount: 8000 },
            { x: 800, y: 400, amount: 6000 },
            { x: 700, y: 600, amount: 7000 },
            
            // Near enemy starting area
            { x: 1100, y: 700, amount: 5000 },
            { x: 1300, y: 800, amount: 4000 },
            { x: 1200, y: 950, amount: 3000 },
            
            // Additional patches
            { x: 400, y: 700, amount: 3500 },
            { x: 1000, y: 300, amount: 4500 },
        ];
        
        for (const patch of orePatches) {
            this.createResourcePatch(patch.x, patch.y, patch.amount);
        }
        
        console.log('💎 Resource patches placed');
    }
    
    /**
     * Create a resource patch at specified location
     */
    createResourcePatch(x, y, amount) {
        // For now, we'll store resource patches in the renderer for visual display
        if (this.renderer && this.renderer.addResourcePatch) {
            this.renderer.addResourcePatch({
                x: x,
                y: y,
                amount: amount,
                maxAmount: amount,
                type: 'ore'
            });
        }
        
        // Store in resource manager for harvesting logic
        if (this.resourceManager && this.resourceManager.addResourcePatch) {
            this.resourceManager.addResourcePatch(x, y, amount);
        }
    }
    
    /**
     * Pause the game
     */
    pauseGame() {
        this.isPaused = true;
        this.emit('gamePaused');
        console.log('⏸️ Game paused');
    }
    
    /**
     * Resume the game
     */
    resumeGame() {
        this.isPaused = false;
        this.emit('gameResumed');
        console.log('▶️ Game resumed');
    }
    
    /**
     * Return to main menu
     */
    returnToMainMenu() {
        this.stopGameLoop();
        this.currentState = 'menu';
        
        // Clean up game state
        this.resourceManager.reset();
        this.unitManager.reset();
        this.buildingManager.reset();
        
        this.emit('returnedToMenu');
        console.log('🏠 Returned to main menu');
    }
    
    /**
     * Set game speed
     */
    setGameSpeed(speed) {
        this.gameSpeed = Math.max(0.1, Math.min(3.0, speed));
        this.emit('gameSpeedChanged', this.gameSpeed);
        console.log(`⚡ Game speed set to ${this.gameSpeed}x`);
    }
    
    /**
     * Check win/lose conditions
     */
    checkGameConditions() {
        // Check victory conditions
        if (this.checkVictoryCondition()) {
            this.endGame(true);
            return;
        }
        
        // Check defeat conditions
        if (this.checkDefeatCondition()) {
            this.endGame(false);
            return;
        }
    }
    
    /**
     * Check victory condition
     */
    checkVictoryCondition() {
        if (this.currentState !== 'playing') return false;
        
        // For campaign: check mission objectives
        if (this.campaignManager.currentMission) {
            // Check if all required objectives are completed
            const objectives = this.campaignManager.objectives || [];
            const requiredObjectives = objectives.filter(obj => obj.required);
            const completedRequiredObjectives = requiredObjectives.filter(obj => obj.completed);
            
            return requiredObjectives.length > 0 && completedRequiredObjectives.length === requiredObjectives.length;
        }
        
        // For skirmish: add minimum game time requirement and check if all enemies are eliminated
        const currentTime = performance.now();
        const gameStartTime = this.gameStartTime || currentTime;
        const gameTimeElapsed = currentTime - gameStartTime;
        const minimumGameTime = 10000; // 10 seconds minimum
        
        if (gameTimeElapsed < minimumGameTime) {
            return false; // Game must run for at least 10 seconds
        }
        
        const enemyBuildings = this.buildingManager.getBuildingsByFaction('enemy');
        const enemyUnits = this.unitManager.getUnitsByFaction('enemy');
        
        // For now, require player to have built at least 3 units to win
        const playerUnits = this.unitManager.getUnitsByFaction(this.selectedFaction);
        if (playerUnits.length < 3) {
            return false;
        }
        
        return enemyBuildings.length === 0 && enemyUnits.length === 0;
    }
    
    /**
     * Check defeat condition
     */
    checkDefeatCondition() {
        if (this.currentState !== 'playing') return false;
        
        // Player loses if they have no buildings and no construction units
        const playerBuildings = this.buildingManager.getBuildingsByFaction(this.selectedFaction);
        const constructionUnits = this.unitManager.getUnitsByFaction(this.selectedFaction)
            .filter(unit => unit.canConstruct);
        
        return playerBuildings.length === 0 && constructionUnits.length === 0;
    }
    
    /**
     * End the game
     */
    endGame(victory) {
        this.stopGameLoop();
        this.currentState = 'gameOver';
        
        this.emit('gameEnded', { victory });
        
        if (victory) {
            console.log('🎉 Victory!');
        } else {
            console.log('💀 Defeat!');
        }
    }
    
    /**
     * Save the game
     */
    saveGame(saveName = null) {
        const saveData = {
            timestamp: Date.now(),
            gameState: this.currentState,
            faction: this.selectedFaction,
            difficulty: this.difficulty,
            resources: this.resourceManager.getSaveData(),
            units: this.unitManager.getSaveData(),
            buildings: this.buildingManager.getSaveData(),
            campaign: this.campaignManager.getSaveData()
        };
        
        const fileName = saveName || `autosave_${Date.now()}`;
        localStorage.setItem(`smr_save_${fileName}`, JSON.stringify(saveData));
        
        console.log(`💾 Game saved: ${fileName}`);
        this.emit('gameSaved', fileName);
    }
    
    /**
     * Load a saved game
     */
    loadGame(fileName) {
        try {
            const saveData = JSON.parse(localStorage.getItem(`smr_save_${fileName}`));
            
            if (!saveData) {
                throw new Error('Save file not found');
            }
            
            // Restore game state
            this.currentState = saveData.gameState;
            this.selectedFaction = saveData.faction;
            this.difficulty = saveData.difficulty;
            
            // Restore systems
            this.resourceManager.loadSaveData(saveData.resources);
            this.unitManager.loadSaveData(saveData.units);
            this.buildingManager.loadSaveData(saveData.buildings);
            this.campaignManager.loadSaveData(saveData.campaign);
            
            // Start game if needed
            if (this.currentState === 'playing') {
                this.startGameLoop();
            }
            
            console.log(`📁 Game loaded: ${fileName}`);
            this.emit('gameLoaded', fileName);
            
        } catch (error) {
            console.error('❌ Failed to load game:', error);
            this.emit('gameLoadFailed', error.message);
        }
    }
    
    /**
     * Get list of saved games
     */
    getSavedGames() {
        const saves = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('smr_save_')) {
                const fileName = key.replace('smr_save_', '');
                try {
                    const saveData = JSON.parse(localStorage.getItem(key));
                    saves.push({
                        fileName,
                        timestamp: saveData.timestamp,
                        faction: saveData.faction,
                        difficulty: saveData.difficulty
                    });
                } catch (error) {
                    console.warn('Invalid save file:', fileName);
                }
            }
        }
        
        return saves.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    /**
     * Setup event listeners for various game events
     */
    setupEventListeners() {
        // Resource events
        this.resourceManager.on('creditsChanged', (credits) => {
            this.uiManager.updateCreditsDisplay(credits);
        });
        
        this.resourceManager.on('powerChanged', (power, maxPower) => {
            this.uiManager.updatePowerDisplay(power, maxPower);
        });
        
        // Unit events
        this.unitManager.on('unitCreated', (unit) => {
            this.renderer.addUnit(unit);
        });
        
        this.unitManager.on('unitDestroyed', (unit) => {
            this.renderer.removeUnit(unit);
        });
        
        // Building events
        this.buildingManager.on('buildingCreated', (building) => {
            this.renderer.addBuilding(building);
        });
        
        this.buildingManager.on('buildingDestroyed', (building) => {
            this.renderer.removeBuilding(building);
        });
        
        // Input events
        this.inputManager.on('unitSelected', (units) => {
            this.uiManager.showUnitInfo(units);
        });
        
        this.inputManager.on('buildingSelected', (building) => {
            this.uiManager.showBuildingInfo(building);
        });
        
        console.log('🔗 Event listeners configured');
    }
    
    /**
     * Event system methods
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.eventListeners[event]) return;
        const index = this.eventListeners[event].indexOf(callback);
        if (index > -1) {
            this.eventListeners[event].splice(index, 1);
        }
    }
    
    emit(event, data = null) {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }
    
    /**
     * Get current game statistics
     */
    getGameStats() {
        return {
            state: this.currentState,
            faction: this.selectedFaction,
            difficulty: this.difficulty,
            credits: this.resourceManager.getCredits(),
            power: this.resourceManager.getPower(),
            unitCount: this.unitManager.getUnitCount(),
            buildingCount: this.buildingManager.getBuildingCount(),
            gameTime: this.lastUpdateTime
        };
    }
}

// Create global game engine instance
window.gameEngine = new GameEngine();