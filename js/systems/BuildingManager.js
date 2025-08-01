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
            // ===== ALLIED BUILDINGS =====
            {
                type: 'construction_yard',
                name: 'Allied Construction Yard',
                faction: 'allies',
                cost: 0, // Starting building
                buildTime: 0,
                health: 1000,
                power: 0,
                powerGeneration: 0,
                width: 96,
                height: 96,
                canBuild: ['power_plant', 'ore_refinery', 'barracks', 'war_factory', 'naval_yard', 'airforce_command'],
                description: 'Primary construction facility for the Allied Forces'
            },
            {
                type: 'power_plant',
                name: 'Allied Power Plant',
                faction: 'allies',  
                cost: 800,
                buildTime: 15,
                health: 750,
                power: 0,
                powerGeneration: 100,
                width: 64,
                height: 64,
                canBuild: [],
                description: 'Generates power for Allied base operations'
            },
            {
                type: 'ore_refinery',
                name: 'Allied Ore Refinery',
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
                includesHarvester: 'chrono_miner',
                description: 'Processes ore into credits. Comes with Chrono Miner.'
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
                canProduce: ['gi', 'engineer', 'guardian_gi', 'rocketeer', 'navy_seal', 'spy', 'chrono_legionnaire', 'tanya'],
                description: 'Trains Allied infantry units'
            },
            {
                type: 'war_factory',
                name: 'Allied War Factory',
                faction: 'allies',
                cost: 2000,
                buildTime: 40,
                health: 1000,
                power: 50,
                powerGeneration: 0,
                width: 96,
                height: 96,
                canBuild: [],
                canProduce: ['grizzly_tank', 'ifv', 'mirage_tank', 'battle_fortress', 'prism_tank', 'chrono_miner'],
                description: 'Produces Allied vehicles and tanks'
            },
            {
                type: 'naval_yard',
                name: 'Allied Naval Yard',
                faction: 'allies',
                cost: 1000,
                buildTime: 25,
                health: 1200,
                power: 30,
                powerGeneration: 0,
                width: 96,
                height: 64,
                canBuild: [],
                canProduce: ['destroyer', 'aegis_cruiser', 'aircraft_carrier', 'dolphin'],
                requiresWater: true,
                description: 'Constructs Allied naval vessels'
            },
            {
                type: 'airforce_command',
                name: 'Airforce Command Headquarters',
                faction: 'allies',
                cost: 1000,
                buildTime: 25,
                health: 600,
                power: 50,
                powerGeneration: 0,
                width: 80,
                height: 80,
                canBuild: [],
                canProduce: ['harrier', 'black_eagle'],
                requiresRadar: true,
                description: 'Constructs and controls Allied aircraft'
            },
            {
                type: 'service_depot',
                name: 'Allied Service Depot',
                faction: 'allies',
                cost: 800,
                buildTime: 15,
                health: 1100,
                power: 25,
                powerGeneration: 0,
                width: 64,
                height: 64,
                canBuild: [],
                canRepairVehicles: true,
                description: 'Repairs and reloads Allied vehicles'
            },
            {
                type: 'ore_purifier',
                name: 'Allied Ore Purifier',
                faction: 'allies',
                cost: 2500,
                buildTime: 45,
                health: 900,
                power: 100,
                powerGeneration: 0,
                width: 80,
                height: 80,
                canBuild: [],
                oreBonus: 0.25,
                description: 'Increases ore refining efficiency by 25%'
            },
            {
                type: 'battle_lab',
                name: 'Allied Battle Lab',
                faction: 'allies',
                cost: 2000,
                buildTime: 50,
                health: 500,
                power: 200,
                powerGeneration: 0,
                width: 80,
                height: 80,
                canBuild: [],
                enablesUnits: ['chrono_legionnaire', 'tanya', 'prism_tank', 'mirage_tank'],
                enablesBuildings: ['chronosphere', 'weather_controller', 'spy_satellite'],
                description: 'Enables advanced Allied technology'
            },
            {
                type: 'spy_satellite',
                name: 'Spy Satellite Uplink',
                faction: 'allies',
                cost: 1000,
                buildTime: 20,
                health: 1000,
                power: 100,
                powerGeneration: 0,
                width: 64,
                height: 64,
                canBuild: [],
                revealsMap: true,
                description: 'Reveals entire battlefield to Allied forces'
            },
            {
                type: 'chronosphere',
                name: 'Chronosphere',
                faction: 'allies',
                cost: 2500,
                buildTime: 60,
                health: 750,
                power: 200,
                powerGeneration: 0,
                width: 96,
                height: 96,
                canBuild: [],
                isSuperweapon: true,
                superweaponType: 'chronosphere',
                description: 'Teleports units across time and space'
            },
            {
                type: 'weather_controller',
                name: 'Weather Control Device',
                faction: 'allies',
                cost: 5000,
                buildTime: 90,
                health: 1000,
                power: 200,
                powerGeneration: 0,
                width: 96,
                height: 96,
                canBuild: [],
                isSuperweapon: true,
                superweaponType: 'weather_storm',
                description: 'Creates devastating lightning storm'
            },
            {
                type: 'patriot_missile',
                name: 'Patriot Missile System',
                faction: 'allies',
                cost: 1000,
                buildTime: 25,
                health: 900,
                power: 50,
                powerGeneration: 0,
                width: 32,
                height: 32,
                canBuild: [],
                isDefense: true,
                damage: 100,
                range: 200,
                antiAir: true,
                description: 'Long-range anti-aircraft defense system'
            },
            {
                type: 'prism_tower',
                name: 'Prism Tower',
                faction: 'allies',
                cost: 1500,
                buildTime: 30,
                health: 600,
                power: 75,
                powerGeneration: 0,
                width: 32,
                height: 32,
                canBuild: [],
                isDefense: true,
                damage: 200,
                range: 180,
                prismWeapon: true,
                description: 'Advanced defensive tower with prism cannon'
            },
            {
                type: 'gap_generator',
                name: 'Gap Generator',
                faction: 'allies',
                cost: 1000,
                buildTime: 20,
                health: 600,
                power: 100,
                powerGeneration: 0,
                width: 64,
                height: 64,
                canBuild: [],
                createsGap: true,
                description: 'Creates radar gap to hide Allied forces'
            },

            // ===== SOVIET BUILDINGS =====
            {
                type: 'construction_yard',
                name: 'Soviet Construction Yard',
                faction: 'soviet',
                cost: 0, // Starting building
                buildTime: 0,
                health: 1000,
                power: 0,
                powerGeneration: 0,
                width: 96,
                height: 96,
                canBuild: ['tesla_reactor', 'ore_refinery', 'barracks', 'war_factory', 'naval_yard', 'radar_tower'],
                description: 'Primary construction facility for the Soviet Union'
            },
            {
                type: 'tesla_reactor',
                name: 'Tesla Reactor',
                faction: 'soviet',
                cost: 600,
                buildTime: 12,
                health: 1000,
                power: 0,
                powerGeneration: 150,
                width: 64,
                height: 64,
                canBuild: [],
                teslaChain: true,
                description: 'Generates power and can chain to Tesla weapons'
            },
            {
                type: 'ore_refinery',
                name: 'Soviet Ore Refinery',
                faction: 'soviet',
                cost: 2000,
                buildTime: 30,
                health: 900,
                power: 50,
                powerGeneration: 0,
                width: 80,
                height: 80,
                canBuild: [],
                processesOre: true,
                includesHarvester: 'war_miner',
                description: 'Processes ore into credits. Comes with War Miner.'
            },
            {
                type: 'barracks',
                name: 'Soviet Barracks',
                faction: 'soviet',
                cost: 500,
                buildTime: 20,
                health: 800,
                power: 20,
                powerGeneration: 0,
                width: 64,
                height: 64,
                canBuild: [],
                canProduce: ['conscript', 'engineer', 'tesla_trooper', 'flak_trooper', 'crazy_ivan', 'yuri', 'boris'],
                description: 'Trains Soviet infantry units'
            },
            {
                type: 'war_factory',
                name: 'Soviet War Factory',
                faction: 'soviet',
                cost: 2000,
                buildTime: 40,
                health: 1000,
                power: 50,
                powerGeneration: 0,
                width: 96,
                height: 96,
                canBuild: [],
                canProduce: ['rhino_tank', 'flak_track', 'v3_launcher', 'apocalypse_tank', 'terror_drone', 'war_miner'],
                description: 'Produces Soviet vehicles and tanks'
            },
            {
                type: 'naval_yard',
                name: 'Soviet Naval Yard',
                faction: 'soviet',
                cost: 1000,
                buildTime: 25,
                health: 1200,
                power: 30,
                powerGeneration: 0,
                width: 96,
                height: 64,
                canBuild: [],
                canProduce: ['typhoon_sub', 'sea_scorpion', 'giant_squid'],
                requiresWater: true,
                description: 'Constructs Soviet naval vessels'
            },
            {
                type: 'radar_tower',
                name: 'Soviet Radar Tower',
                faction: 'soviet',
                cost: 1000,
                buildTime: 25,
                health: 1000,
                power: 50,
                powerGeneration: 0,
                width: 48,
                height: 48,
                canBuild: [],
                canProduce: ['kirov_airship'],
                providesRadar: true,
                description: 'Provides radar and enables Kirov production'
            },
            {
                type: 'service_depot',
                name: 'Soviet Service Depot',
                faction: 'soviet',
                cost: 800,
                buildTime: 15,
                health: 1100,
                power: 25,
                powerGeneration: 0,
                width: 64,
                height: 64,
                canBuild: [],
                canRepairVehicles: true,
                description: 'Repairs and reloads Soviet vehicles'
            },
            {
                type: 'battle_lab',
                name: 'Soviet Battle Lab',
                faction: 'soviet',
                cost: 2000,
                buildTime: 50,
                health: 500,
                power: 200,
                powerGeneration: 0,
                width: 80,
                height: 80,
                canBuild: [],
                enablesUnits: ['apocalypse_tank', 'kirov_airship', 'boris'],
                enablesBuildings: ['nuclear_silo', 'iron_curtain', 'cloning_vats'],
                description: 'Enables advanced Soviet technology'
            },
            {
                type: 'nuclear_reactor',
                name: 'Nuclear Reactor',
                faction: 'soviet',
                cost: 1000,
                buildTime: 30,
                health: 400,
                power: 0,
                powerGeneration: 2000,
                width: 64,
                height: 64,
                canBuild: [],
                explodesOnDeath: true,
                radiationDamage: true,
                description: 'Massive power generation but explodes when destroyed'
            },
            {
                type: 'nuclear_silo',
                name: 'Nuclear Missile Silo',
                faction: 'soviet',
                cost: 5000,
                buildTime: 90,
                health: 1000,
                power: 200,
                powerGeneration: 0,
                width: 96,
                height: 96,
                canBuild: [],
                isSuperweapon: true,
                superweaponType: 'nuclear_missile',
                description: 'Launches devastating nuclear warheads'
            },
            {
                type: 'iron_curtain',
                name: 'Iron Curtain Device',
                faction: 'soviet',
                cost: 2500,
                buildTime: 60,
                health: 750,
                power: 200,
                powerGeneration: 0,
                width: 96,
                height: 96,
                canBuild: [],
                isSuperweapon: true,
                superweaponType: 'iron_curtain',
                description: 'Makes units temporarily invulnerable'
            },
            {
                type: 'cloning_vats',
                name: 'Cloning Vats',
                faction: 'soviet',
                cost: 2500,
                buildTime: 50,
                health: 750,
                power: 200,
                powerGeneration: 0,
                width: 80,
                height: 80,
                canBuild: [],
                clonesInfantry: true,
                description: 'Creates copies of trained infantry units'
            },
            {
                type: 'tesla_coil',
                name: 'Tesla Coil',
                faction: 'soviet',
                cost: 1500,
                buildTime: 30,
                health: 1000,
                power: 75,
                powerGeneration: 0,
                width: 32,
                height: 32,
                canBuild: [],
                isDefense: true,
                damage: 200,
                range: 150,
                teslaWeapon: true,
                needsPower: true,
                description: 'Powerful Tesla defense tower'
            },
            {
                type: 'flak_cannon',
                name: 'Flak Cannon',
                faction: 'soviet',
                cost: 1000,
                buildTime: 25,
                health: 900,
                power: 50,
                powerGeneration: 0,
                width: 32,
                height: 32,
                canBuild: [],
                isDefense: true,
                damage: 100,
                range: 200,
                antiAir: true,
                description: 'Anti-aircraft defense system'
            },
            {
                type: 'psychic_sensor',
                name: 'Psychic Sensor',
                faction: 'soviet',
                cost: 1000,
                buildTime: 20,
                health: 1000,
                power: 100,
                powerGeneration: 0,
                width: 64,
                height: 64,
                canBuild: [],
                detectsStealthed: true,
                description: 'Detects infiltrators and stealthed units'
            },

            // ===== NEUTRAL BUILDINGS =====
            {
                type: 'civilian_building',
                name: 'Civilian Building',
                faction: 'neutral',
                cost: 0,
                buildTime: 0,
                health: 200,
                power: 0,
                powerGeneration: 0,
                width: 48,
                height: 48,
                canBuild: [],
                description: 'Neutral civilian structure'
            },
            {
                type: 'tech_outpost',
                name: 'Technology Outpost',
                faction: 'neutral',
                cost: 0,
                buildTime: 0,
                health: 500,
                power: 0,
                powerGeneration: 0,
                width: 64,
                height: 64,
                canBuild: [],
                capturable: true,
                techBonus: true,
                description: 'Provides technology bonuses when captured'
            },
            {
                type: 'oil_derrick',
                name: 'Oil Derrick',
                faction: 'neutral',
                cost: 0,
                buildTime: 0,
                health: 750,
                power: 0,
                powerGeneration: 0,
                width: 48,
                height: 48,
                canBuild: [],
                capturable: true,
                providesIncome: 20,
                description: 'Provides continuous income when captured'
            },
            {
                type: 'airport',
                name: 'Civilian Airport',
                faction: 'neutral',
                cost: 0,
                buildTime: 0,
                health: 1000,
                power: 0,
                powerGeneration: 0,
                width: 96,
                height: 96,
                canBuild: [],
                capturable: true,
                airborneLanding: true,
                description: 'Allows airborne unit deployment when captured'
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