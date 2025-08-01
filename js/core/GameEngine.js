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
        
        // Start first mission
        this.campaignManager.startCampaign(faction);
        
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
        this.resourceManager.setPower(settings.startingPower || 100, settings.startingPower || 100);
        
        // Initialize map
        this.renderer.initializeMap(this.mapSize);
        
        // Place starting buildings and units
        this.placeStartingAssets();
        
        console.log('🌍 Game world initialized');
    }
    
    /**
     * Place starting buildings and units
     */
    placeStartingAssets() {
        const startingBuildings = this.factionManager.getStartingBuildings(this.selectedFaction);
        const startingUnits = this.factionManager.getStartingUnits(this.selectedFaction);
        
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
        
        console.log('🏗️ Starting assets placed');
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
            return this.campaignManager.currentMission.isCompleted();
        }
        
        // For skirmish: check if all enemies are eliminated
        const enemyBuildings = this.buildingManager.getBuildingsByFaction('enemy');
        const enemyUnits = this.unitManager.getUnitsByFaction('enemy');
        
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