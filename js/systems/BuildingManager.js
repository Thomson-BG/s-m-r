/**
 * Building Manager for Scotty Mason's Revenge
 * Manages all buildings in the game
 */

class BuildingManager {
    constructor() {
        this.buildings = [];
        this.buildingIdCounter = 1;
        this.selectedBuilding = null;
        this.buildQueue = [];
        
        // Building types and their properties
        this.buildingTypes = new Map();
        
        // Event system
        this.eventListeners = {};
        
        console.log('🏗️ BuildingManager initialized');
    }
    
    async initialize() {
        this.loadBuildingTypes();
        console.log('✅ BuildingManager ready');
    }
    
    /**
     * Load building type definitions
     */
    loadBuildingTypes() {
        const buildingDefinitions = [
            {
                type: 'construction_yard',
                name: 'Construction Yard',
                faction: 'allies',
                cost: 0, // Starting building
                buildTime: 0,
                health: 1000,
                power: 0,
                powerGeneration: 0,
                width: 96,
                height: 96,
                canBuild: ['power_plant', 'refinery', 'barracks'],
                description: 'Primary construction facility'
            },
            {
                type: 'power_plant',
                name: 'Power Plant',
                faction: 'allies',  
                cost: 800,
                buildTime: 15,
                health: 750,
                power: 0,
                powerGeneration: 100,
                width: 64,
                height: 64,
                canBuild: [],
                description: 'Generates power for base operations'
            },
            {
                type: 'refinery',
                name: 'Ore Refinery',
                faction: 'allies',
                cost: 2000,
                buildTime: 30,
                health: 900,
                power: 50,
                powerGeneration: 0,
                width: 80,
                height: 80,
                canBuild: [],
                processesOre: true,
                includesHarvester: true,
                description: 'Processes ore into credits'
            },
            {
                type: 'barracks',
                name: 'Allied Barracks',
                faction: 'allies',
                cost: 500,
                buildTime: 20,
                health: 800,
                power: 20,
                powerGeneration: 0,
                width: 64,
                height: 64,
                canBuild: [],
                canProduce: ['engineer', 'gi', 'navy_seal'],
                description: 'Trains infantry units'
            },
            {
                type: 'war_factory',
                name: 'War Factory',
                faction: 'allies',
                cost: 2000,
                buildTime: 40,
                health: 1000,
                power: 50,
                powerGeneration: 0,
                width: 96,
                height: 96,
                canBuild: [],
                canProduce: ['tank', 'harvester'],
                description: 'Produces vehicles and tanks'
            },
            {
                type: 'tech_center',
                name: 'Battle Lab',
                faction: 'allies',
                cost: 2000,
                buildTime: 50,
                health: 500,
                power: 200,
                powerGeneration: 0,
                width: 80,
                height: 80,
                canBuild: [],
                enablesUnits: ['helicopter'],
                enablesBuildings: ['superweapon'],
                description: 'Enables advanced technology'
            },
            {
                type: 'defense_turret',
                name: 'Patriot Missile',
                faction: 'allies',
                cost: 1000,
                buildTime: 25,
                health: 900,
                power: 50,
                powerGeneration: 0,
                width: 32,
                height: 32,
                canBuild: [],
                damage: 100,
                range: 200,
                isDefense: true,
                description: 'Anti-air and anti-ground defense'
            }
        ];
        
        buildingDefinitions.forEach(def => {
            this.buildingTypes.set(def.type, def);
        });
        
        console.log(`📋 Loaded ${this.buildingTypes.size} building types`);
    }
    
    /**
     * Create a new building
     */
    createBuilding(buildingType, options = {}) {
        const buildingDef = this.buildingTypes.get(buildingType);
        if (!buildingDef) {
            console.error(`Unknown building type: ${buildingType}`);
            return null;
        }
        
        const building = new Building({
            id: this.buildingIdCounter++,
            type: buildingType,
            ...buildingDef,
            x: options.x || 0,
            y: options.y || 0,
            faction: options.faction || buildingDef.faction,
            ...options
        });
        
        this.buildings.push(building);
        
        // Register with resource manager
        if (building.powerGeneration > 0) {
            window.gameEngine.resourceManager.addPowerPlant(building);
        }
        if (building.processesOre) {
            window.gameEngine.resourceManager.addRefinery(building);
        }
        
        // Use power
        if (building.power > 0) {
            window.gameEngine.resourceManager.usePower(building.power);
        }
        
        this.emit('buildingCreated', building);
        
        console.log(`🏗️ Created ${buildingType} at (${building.x}, ${building.y})`);
        return building;
    }
    
    /**
     * Remove a building
     */
    removeBuilding(building) {
        const index = this.buildings.indexOf(building);
        if (index > -1) {
            this.buildings.splice(index, 1);
            
            // Unregister from resource manager
            if (building.powerGeneration > 0) {
                window.gameEngine.resourceManager.removePowerPlant(building);
            }
            if (building.processesOre) {
                window.gameEngine.resourceManager.removeRefinery(building);
            }
            
            // Free power
            if (building.power > 0) {
                window.gameEngine.resourceManager.freePower(building.power);
            }
            
            // Clear selection if this building was selected
            if (this.selectedBuilding === building) {
                this.selectedBuilding = null;
            }
            
            this.emit('buildingDestroyed', building);
            console.log(`🏗️ Removed building ${building.id}`);
        }
    }
    
    /**
     * Start building construction
     */
    startBuilding(buildingType, x, y, faction) {
        const buildingDef = this.buildingTypes.get(buildingType);
        if (!buildingDef) {
            console.error(`Unknown building type: ${buildingType}`);
            return false;
        }
        
        // Check if can afford
        if (!window.gameEngine.resourceManager.canAfford(buildingDef.cost)) {
            console.warn(`Cannot afford ${buildingType}`);
            return false;
        }
        
        // Check prerequisites
        if (!this.canBuildType(buildingType, faction)) {
            console.warn(`Prerequisites not met for ${buildingType}`);
            return false;
        }
        
        // Check placement
        if (!this.canPlaceAt(x, y, buildingDef.width, buildingDef.height)) {
            console.warn(`Cannot place ${buildingType} at (${x}, ${y})`);
            return false;
        }
        
        // Spend resources
        window.gameEngine.resourceManager.spendCredits(buildingDef.cost);
        
        // Create building in construction mode
        const building = this.createBuilding(buildingType, {
            x: x,
            y: y,
            faction: faction,
            isConstructing: true,
            constructionProgress: 0,
            constructionTime: buildingDef.buildTime
        });
        
        this.emit('buildingStarted', building);
        return true;
    }
    
    /**
     * Get building by ID
     */
    getBuildingById(id) {
        return this.buildings.find(building => building.id === id);
    }
    
    /**
     * Get all buildings
     */
    getAllBuildings() {
        return this.buildings.slice();
    }
    
    /**
     * Get buildings by faction
     */
    getBuildingsByFaction(faction) {
        return this.buildings.filter(building => building.faction === faction);
    }
    
    /**
     * Get buildings by type
     */
    getBuildingsByType(buildingType) {
        return this.buildings.filter(building => building.type === buildingType);
    }
    
    /**
     * Get buildings in area
     */
    getBuildingsInArea(x, y, width, height) {
        return this.buildings.filter(building => {
            return !(building.x + building.width < x ||
                    building.x > x + width ||
                    building.y + building.height < y ||
                    building.y > y + height);
        });
    }
    
    /**
     * Check if can place building at position
     */
    canPlaceAt(x, y, width, height) {
        // Check boundaries
        if (x < 0 || y < 0 || 
            x + width > window.gameEngine.renderer.mapWidth ||
            y + height > window.gameEngine.renderer.mapHeight) {
            return false;
        }
        
        // Check for overlapping buildings
        const overlapping = this.getBuildingsInArea(x, y, width, height);
        if (overlapping.length > 0) {
            return false;
        }
        
        // Check terrain (simplified - would need proper terrain system)
        return true;
    }
    
    /**
     * Check if can build building type
     */
    canBuildType(buildingType, faction) {
        const buildingDef = this.buildingTypes.get(buildingType);
        if (!buildingDef) return false;
        
        // Check faction
        if (buildingDef.faction !== faction) return false;
        
        // Check if construction yard exists
        const constructionYards = this.getBuildingsByType('construction_yard')
            .filter(b => b.faction === faction && !b.isConstructing);
        
        if (constructionYards.length === 0) return false;
        
        // Check if any construction yard can build this type
        const canBuildFromYard = constructionYards.some(yard => 
            yard.canBuild && yard.canBuild.includes(buildingType)
        );
        
        if (!canBuildFromYard) return false;
        
        // Check prerequisites (tech buildings, etc.)
        // This would be more complex in a full implementation
        
        return true;
    }
    
    /**
     * Select building
     */
    selectBuilding(building) {
        if (this.selectedBuilding) {
            this.selectedBuilding.selected = false;
        }
        
        this.selectedBuilding = building;
        if (building) {
            building.selected = true;
        }
        
        this.emit('buildingSelected', building);
    }
    
    /**
     * Clear building selection
     */
    clearSelection() {
        if (this.selectedBuilding) {
            this.selectedBuilding.selected = false;
            this.selectedBuilding = null;
        }
        
        this.emit('selectionCleared');
    }
    
    /**
     * Queue unit production
     */
    queueUnit(unitType, building = null) {
        const productionBuilding = building || this.selectedBuilding;
        
        if (!productionBuilding) {
            console.warn('No building selected for unit production');
            return false;
        }
        
        if (!productionBuilding.canProduce || 
            !productionBuilding.canProduce.includes(unitType)) {
            console.warn(`Building cannot produce ${unitType}`);
            return false;
        }
        
        const unitDef = window.gameEngine.unitManager.getUnitType(unitType);
        if (!unitDef) {
            console.error(`Unknown unit type: ${unitType}`);
            return false;
        }
        
        // Check resources
        if (!window.gameEngine.resourceManager.canAfford(unitDef.cost)) {
            console.warn(`Cannot afford ${unitType}`);
            return false;
        }
        
        // Spend resources
        window.gameEngine.resourceManager.spendCredits(unitDef.cost);
        
        // Add to production queue
        productionBuilding.addToProductionQueue({
            type: unitType,
            buildTime: unitDef.buildTime,
            progress: 0
        });
        
        this.emit('unitQueued', { unitType, building: productionBuilding });
        return true;
    }
    
    /**
     * Place building at position
     */
    placeBuilding(building, x, y) {
        building.x = x;
        building.y = y;
        building.placed = true;
        
        this.emit('buildingPlaced', building);
        console.log(`🏗️ Placed building ${building.id} at (${x}, ${y})`);
    }
    
    /**
     * Update all buildings
     */
    update(deltaTime) {
        for (const building of this.buildings) {
            building.update(deltaTime);
            
            // Handle construction completion
            if (building.isConstructing && building.constructionProgress >= building.constructionTime) {
                building.isConstructing = false;
                building.constructionProgress = 0;
                
                // Play completion sound
                if (window.gameEngine.audioManager) {
                    window.gameEngine.audioManager.playSound('constructionComplete');
                }
                
                this.emit('buildingCompleted', building);
            }
        }
        
        // Clean up destroyed buildings
        const destroyedBuildings = this.buildings.filter(building => building.health <= 0);
        destroyedBuildings.forEach(building => this.removeBuilding(building));
    }
    
    /**
     * Get building type definition
     */
    getBuildingType(buildingType) {
        return this.buildingTypes.get(buildingType);
    }
    
    /**
     * Get all building types
     */
    getAllBuildingTypes() {
        return Array.from(this.buildingTypes.values());
    }
    
    /**
     * Get building types for faction
     */
    getBuildingTypesForFaction(faction) {
        return Array.from(this.buildingTypes.values()).filter(def => def.faction === faction);
    }
    
    /**
     * Get buildable types from current buildings
     */
    getBuildableTypes(faction) {
        const constructionYards = this.getBuildingsByType('construction_yard')
            .filter(b => b.faction === faction && !b.isConstructing);
        
        const buildableTypes = new Set();
        
        for (const yard of constructionYards) {
            if (yard.canBuild) {
                yard.canBuild.forEach(type => buildableTypes.add(type));
            }
        }
        
        return Array.from(buildableTypes);
    }
    
    /**
     * Get building count
     */
    getBuildingCount() {
        return this.buildings.length;
    }
    
    /**
     * Get building count by faction
     */
    getBuildingCountByFaction(faction) {
        return this.buildings.filter(building => building.faction === faction).length;
    }
    
    /**
     * Get building count by type
     */
    getBuildingCountByType(buildingType) {
        return this.buildings.filter(building => building.type === buildingType).length;
    }
    
    /**
     * Find nearest building of type
     */
    findNearestBuilding(x, y, buildingType = null, faction = null) {
        let nearestBuilding = null;
        let nearestDistance = Infinity;
        
        for (const building of this.buildings) {
            if (buildingType && building.type !== buildingType) continue;
            if (faction && building.faction !== faction) continue;
            
            const distance = Math.sqrt(
                Math.pow(building.x + building.width/2 - x, 2) +
                Math.pow(building.y + building.height/2 - y, 2)
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestBuilding = building;
            }
        }
        
        return nearestBuilding;
    }
    
    /**
     * Get power generation total
     */
    getTotalPowerGeneration(faction) {
        return this.getBuildingsByFaction(faction)
            .filter(b => !b.isConstructing)
            .reduce((total, building) => total + (building.powerGeneration || 0), 0);
    }
    
    /**
     * Get power consumption total
     */
    getTotalPowerConsumption(faction) {
        return this.getBuildingsByFaction(faction)
            .filter(b => !b.isConstructing)
            .reduce((total, building) => total + (building.power || 0), 0);
    }
    
    /**
     * Reset all buildings
     */
    reset() {
        this.buildings = [];
        this.selectedBuilding = null;
        this.buildQueue = [];
        this.buildingIdCounter = 1;
        
        this.emit('buildingsReset');
        console.log('🏗️ All buildings reset');
    }
    
    /**
     * Get save data
     */
    getSaveData() {
        return {
            buildings: this.buildings.map(building => building.getSaveData()),
            buildingIdCounter: this.buildingIdCounter
        };
    }
    
    /**
     * Load save data
     */
    loadSaveData(data) {
        this.reset();
        
        if (data.buildings) {
            data.buildings.forEach(buildingData => {
                const building = new Building(buildingData);
                this.buildings.push(building);
                
                // Re-register with resource manager
                if (building.powerGeneration > 0) {
                    window.gameEngine.resourceManager.addPowerPlant(building);
                }
                if (building.processesOre) {
                    window.gameEngine.resourceManager.addRefinery(building);
                }
            });
        }
        
        if (data.buildingIdCounter) {
            this.buildingIdCounter = data.buildingIdCounter;
        }
        
        console.log(`🏗️ Loaded ${this.buildings.length} buildings from save`);
    }
    
    /**
     * Get statistics
     */
    getStatistics() {
        const stats = {
            totalBuildings: this.buildings.length,
            buildingsByFaction: {},
            buildingsByType: {},
            underConstruction: this.buildings.filter(b => b.isConstructing).length,
            selectedBuilding: this.selectedBuilding ? this.selectedBuilding.type : null
        };
        
        // Count by faction and type
        for (const building of this.buildings) {
            stats.buildingsByFaction[building.faction] = (stats.buildingsByFaction[building.faction] || 0) + 1;
            stats.buildingsByType[building.type] = (stats.buildingsByType[building.type] || 0) + 1;
        }
        
        return stats;
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
                console.error(`Error in BuildingManager event listener for ${event}:`, error);
            }
        });
    }
}