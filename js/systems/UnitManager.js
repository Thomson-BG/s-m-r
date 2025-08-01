/**
 * Unit Manager for Scotty Mason's Revenge
 * Manages all units in the game
 */

class UnitManager {
    constructor() {
        this.units = [];
        this.unitIdCounter = 1;
        this.selectedUnits = [];
        
        // Unit types and their properties
        this.unitTypes = new Map();
        
        // Event system
        this.eventListeners = {};
        
        console.log('👥 UnitManager initialized');
    }
    
    async initialize() {
        this.loadUnitTypes();
        console.log('✅ UnitManager ready');
    }
    
    /**
     * Load unit type definitions
     */
    loadUnitTypes() {
        const unitDefinitions = [
            // ===== ALLIED UNITS =====
            // Allied Infantry
            {
                type: 'gi',
                name: 'GI',
                faction: 'allies', 
                cost: 200,
                buildTime: 5,
                health: 100,
                speed: 60,
                damage: 25,
                range: 80,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                canDeploy: true,
                deployMode: 'sandbags',
                description: 'Basic Allied infantry armed with M60 machine gun. Can deploy into defensive position.'
            },
            {
                type: 'engineer',
                name: 'Engineer',
                faction: 'allies',
                cost: 500,
                buildTime: 10,
                health: 25,
                speed: 80,
                damage: 0,
                range: 0,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: true,
                canRepair: true,
                canCapture: true,
                description: 'Captures enemy buildings and repairs Allied structures'
            },
            {
                type: 'guardian_gi',
                name: 'Guardian GI',
                faction: 'allies',
                cost: 400,
                buildTime: 8,
                health: 125,
                speed: 50,
                damage: 35,
                range: 120,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                antiAir: true,
                description: 'Heavy infantry with anti-aircraft missiles'
            },
            {
                type: 'rocketeer',
                name: 'Rocketeer',
                faction: 'allies',
                cost: 600,
                buildTime: 12,
                health: 80,
                speed: 100,
                damage: 65,
                range: 150,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                isAirUnit: true,
                antiAir: true,
                description: 'Flying infantry with rocket pack and anti-air missiles'
            },
            {
                type: 'navy_seal',
                name: 'Navy SEAL',
                faction: 'allies',
                cost: 1000,
                buildTime: 18,
                health: 125,
                speed: 80,
                damage: 50,
                range: 100,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                isStealthy: true,
                canSwim: true,
                description: 'Elite special forces unit. Invisible to most enemies.'
            },
            {
                type: 'spy',
                name: 'Spy',
                faction: 'allies',
                cost: 1000,
                buildTime: 15,
                health: 25,
                speed: 80,
                damage: 0,
                range: 0,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                isStealthy: true,
                canDisguise: true,
                canInfiltrate: true,
                description: 'Infiltrates enemy buildings to steal information or sabotage'
            },
            {
                type: 'chrono_legionnaire',
                name: 'Chrono Legionnaire',
                faction: 'allies',
                cost: 1500,
                buildTime: 25,
                health: 125,
                speed: 70,
                damage: 200,
                range: 100,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                chronoWeapon: true,
                canTeleport: true,
                description: 'Elite soldier with chrono-shift technology. Erases enemies from timeline.'
            },
            {
                type: 'tanya',
                name: 'Tanya Adams',
                faction: 'allies',
                cost: 2000,
                buildTime: 30,
                health: 150,
                speed: 90,
                damage: 125,
                range: 80,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                isHero: true,
                canSwim: true,
                c4Explosive: true,
                description: 'Allied commando hero. Devastating against infantry and buildings.'
            },

            // Allied Vehicles
            {
                type: 'grizzly_tank',
                name: 'Grizzly Battle Tank',
                faction: 'allies',
                cost: 700,
                buildTime: 15,
                health: 300,
                speed: 60,
                damage: 65,
                range: 120,
                width: 24,
                height: 24,
                armor: 'heavy',
                canConstruct: false,
                canRepair: false,
                description: 'Allied main battle tank with 120mm cannon'
            },
            {
                type: 'ifv',
                name: 'Infantry Fighting Vehicle',
                faction: 'allies',
                cost: 600,
                buildTime: 12,
                health: 200,
                speed: 80,
                damage: 25,
                range: 100,
                width: 20,
                height: 20,
                armor: 'light',
                canConstruct: false,
                canRepair: false,
                canCarryInfantry: true,
                description: 'Multi-purpose vehicle. Weapon changes based on garrisoned infantry.'
            },
            {
                type: 'mirage_tank',
                name: 'Mirage Tank',
                faction: 'allies',
                cost: 1000,
                buildTime: 20,
                health: 200,
                speed: 70,
                damage: 120,
                range: 150,
                width: 24,
                height: 24,
                armor: 'light',
                canConstruct: false,
                canRepair: false,
                canCloak: true,
                description: 'Stealth tank with powerful cannon. Disguises as trees when stationary.'
            },
            {
                type: 'battle_fortress',
                name: 'Battle Fortress',
                faction: 'allies',
                cost: 2000,
                buildTime: 35,
                health: 600,
                speed: 40,
                damage: 50,
                range: 120,
                width: 32,
                height: 32,
                armor: 'heavy',
                canConstruct: false,
                canRepair: false,
                canCarryInfantry: true,
                maxPassengers: 5,
                description: 'Heavily armored transport. Infantry inside can fire out.'
            },
            {
                type: 'prism_tank',
                name: 'Prism Tank',
                faction: 'allies',
                cost: 1200,
                buildTime: 25,
                health: 150,
                speed: 60,
                damage: 200,
                range: 180,
                width: 24,
                height: 24,
                armor: 'light',
                canConstruct: false,
                canRepair: false,
                prismWeapon: true,
                description: 'Advanced tank with prism cannon. Beams can chain between targets.'
            },
            {
                type: 'chrono_miner',
                name: 'Chrono Miner',
                faction: 'allies',
                cost: 1400,
                buildTime: 20,
                health: 1000,
                speed: 50,
                damage: 0,
                range: 0,
                width: 24,
                height: 24,
                armor: 'heavy',
                canConstruct: false,
                canRepair: false,
                canHarvest: true,
                canTeleport: true,
                description: 'Allied ore harvester with chrono-shift capability'
            },

            // Allied Aircraft
            {
                type: 'harrier',
                name: 'Harrier Jump Jet',
                faction: 'allies',
                cost: 1200,
                buildTime: 25,
                health: 150,
                speed: 120,
                damage: 80,
                range: 100,
                width: 20,
                height: 20,
                armor: 'aircraft',
                canConstruct: false,
                canRepair: false,
                isAirUnit: true,
                needsReload: true,
                description: 'Fast attack aircraft with air-to-ground missiles'
            },
            {
                type: 'black_eagle',
                name: 'Black Eagle Fighter',
                faction: 'allies',
                cost: 1600,
                buildTime: 30,
                health: 200,
                speed: 150,
                damage: 120,
                range: 120,
                width: 20,
                height: 20,
                armor: 'aircraft',
                canConstruct: false,
                canRepair: false,
                isAirUnit: true,
                needsReload: true,
                description: 'Advanced Korean fighter aircraft'
            },

            // Allied Naval
            {
                type: 'destroyer',
                name: 'Destroyer',
                faction: 'allies',
                cost: 1000,
                buildTime: 20,
                health: 400,
                speed: 50,
                damage: 90,
                range: 150,
                width: 32,
                height: 16,
                armor: 'heavy',
                canConstruct: false,
                canRepair: false,
                isNavalUnit: true,
                antiAir: true,
                description: 'Allied naval vessel with dual cannons and Osprey helicopters'
            },
            {
                type: 'aegis_cruiser',
                name: 'Aegis Cruiser',
                faction: 'allies',
                cost: 1200,
                buildTime: 25,
                health: 350,
                speed: 60,
                damage: 75,
                range: 200,
                width: 32,
                height: 16,
                armor: 'heavy',
                canConstruct: false,
                canRepair: false,
                isNavalUnit: true,
                antiAir: true,
                medic: true,
                description: 'Anti-aircraft cruiser that heals nearby units'
            },
            {
                type: 'aircraft_carrier',
                name: 'Aircraft Carrier',
                faction: 'allies',
                cost: 2000,
                buildTime: 40,
                health: 800,
                speed: 30,
                damage: 120,
                range: 300,
                width: 48,
                height: 16,
                armor: 'heavy',
                canConstruct: false,
                canRepair: false,
                isNavalUnit: true,
                hasAircraft: true,
                description: 'Massive carrier with Hornets providing air support'
            },
            {
                type: 'dolphin',
                name: 'Dolphin',
                faction: 'allies',
                cost: 500,
                buildTime: 10,
                health: 150,
                speed: 90,
                damage: 60,
                range: 80,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                isNavalUnit: true,
                sonarPing: true,
                description: 'Trained dolphin with sonar capabilities'
            },

            // ===== SOVIET UNITS =====
            // Soviet Infantry
            {
                type: 'conscript',
                name: 'Conscript',
                faction: 'soviet',
                cost: 100,
                buildTime: 4,
                health: 125,
                speed: 50,
                damage: 25,
                range: 70,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                description: 'Cheap Soviet infantry with AK-47. Strength in numbers.'
            },
            {
                type: 'tesla_trooper',
                name: 'Tesla Trooper',
                faction: 'soviet',
                cost: 500,
                buildTime: 12,
                health: 160,
                speed: 45,
                damage: 100,
                range: 90,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                teslaWeapon: true,
                chargesTesla: true,
                description: 'Elite Soviet soldier with portable tesla coil'
            },
            {
                type: 'flak_trooper',
                name: 'Flak Trooper',
                faction: 'soviet',
                cost: 300,
                buildTime: 8,
                health: 100,
                speed: 55,
                damage: 45,
                range: 120,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                antiAir: true,
                description: 'Anti-aircraft infantry with flak cannon'
            },
            {
                type: 'crazy_ivan',
                name: 'Crazy Ivan',
                faction: 'soviet',
                cost: 600,
                buildTime: 15,
                health: 125,
                speed: 60,
                damage: 200,
                range: 80,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                dynamite: true,
                description: 'Demolitions expert with TNT. Plants bombs on targets.'
            },
            {
                type: 'yuri',
                name: 'Yuri',
                faction: 'soviet',
                cost: 800,
                buildTime: 20,
                health: 100,
                speed: 70,
                damage: 0,
                range: 120,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                mindControl: true,
                description: 'Psychic commander who can control enemy minds'
            },
            {
                type: 'boris',
                name: 'Boris',
                faction: 'soviet',
                cost: 2000,
                buildTime: 30,
                health: 150,
                speed: 80,
                damage: 100,
                range: 100,
                width: 16,
                height: 16,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                isHero: true,
                laserDesignator: true,
                description: 'Soviet commando hero. Can call in MiG airstrikes.'
            },

            // Soviet Vehicles
            {
                type: 'rhino_tank',
                name: 'Rhino Heavy Tank',
                faction: 'soviet',
                cost: 900,
                buildTime: 18,
                health: 400,
                speed: 45,
                damage: 90,
                range: 110,
                width: 24,
                height: 24,
                armor: 'heavy',
                canConstruct: false,
                canRepair: false,
                description: 'Soviet main battle tank with thick armor'
            },
            {
                type: 'flak_track',
                name: 'Flak Track',
                faction: 'soviet',
                cost: 500,
                buildTime: 12,
                health: 180,
                speed: 70,
                damage: 45,
                range: 150,
                width: 20,
                height: 20,
                armor: 'light',
                canConstruct: false,
                canRepair: false,
                canCarryInfantry: true,
                antiAir: true,
                description: 'Mobile anti-aircraft platform that can transport infantry'
            },
            {
                type: 'v3_launcher',
                name: 'V3 Rocket Launcher',
                faction: 'soviet',
                cost: 800,
                buildTime: 15,
                health: 150,
                speed: 50,
                damage: 200,
                range: 300,
                width: 24,
                height: 24,
                armor: 'light',
                canConstruct: false,
                canRepair: false,
                needsDeployment: true,
                description: 'Long-range artillery with V3 rockets'
            },
            {
                type: 'apocalypse_tank',
                name: 'Apocalypse Tank',
                faction: 'soviet',
                cost: 1750,
                buildTime: 35,
                health: 800,
                speed: 35,
                damage: 150,
                range: 140,
                width: 32,
                height: 32,
                armor: 'heavy',
                canConstruct: false,
                canRepair: false,
                dualCannons: true,
                description: 'Massive Soviet super-heavy tank with twin cannons'
            },
            {
                type: 'terror_drone',
                name: 'Terror Drone',
                faction: 'soviet',
                cost: 500,
                buildTime: 10,
                health: 100,
                speed: 100,
                damage: 100,
                range: 10,
                width: 16,
                height: 16,
                armor: 'light',
                canConstruct: false,
                canRepair: false,
                parasitic: true,
                description: 'Small robotic drone that disables vehicles from inside'
            },
            {
                type: 'war_miner',
                name: 'War Miner',
                faction: 'soviet',
                cost: 1400,
                buildTime: 20,
                health: 1000,
                speed: 45,
                damage: 0,
                range: 0,
                width: 24,
                height: 24,
                armor: 'heavy',
                canConstruct: false,
                canRepair: false,
                canHarvest: true,
                description: 'Soviet ore harvester'
            },

            // Soviet Aircraft
            {
                type: 'kirov_airship',
                name: 'Kirov Airship',
                faction: 'soviet',
                cost: 2000,
                buildTime: 40,
                health: 2000,
                speed: 25,
                damage: 300,
                range: 150,
                width: 48,
                height: 24,
                armor: 'heavy',
                canConstruct: false,
                canRepair: false,
                isAirUnit: true,
                heavyBomber: true,
                description: 'Massive bombing zeppelin with devastating firepower'
            },

            // Soviet Naval
            {
                type: 'typhoon_sub',
                name: 'Typhoon Attack Sub',
                faction: 'soviet',
                cost: 1000,
                buildTime: 20,
                health: 350,
                speed: 60,
                damage: 120,
                range: 120,
                width: 24,
                height: 16,
                armor: 'heavy',
                canConstruct: false,
                canRepair: false,
                isNavalUnit: true,
                submerged: true,
                description: 'Nuclear submarine with torpedoes'
            },
            {
                type: 'sea_scorpion',
                name: 'Sea Scorpion',
                faction: 'soviet',
                cost: 600,
                buildTime: 15,
                health: 200,
                speed: 70,
                damage: 50,
                range: 150,
                width: 20,
                height: 16,
                armor: 'light',
                canConstruct: false,
                canRepair: false,
                isNavalUnit: true,
                antiAir: true,
                description: 'Fast patrol boat with flak cannons'
            },
            {
                type: 'giant_squid',
                name: 'Giant Squid',
                faction: 'soviet',
                cost: 1000,
                buildTime: 25,
                health: 200,
                speed: 50,
                damage: 100,
                range: 20,
                width: 24,
                height: 24,
                armor: 'none',
                canConstruct: false,
                canRepair: false,
                isNavalUnit: true,
                grabAndCrush: true,
                description: 'Genetically enhanced squid that crushes ships'
            }
        ];
        
        unitDefinitions.forEach(def => {
            this.unitTypes.set(def.type, def);
        });
        
        console.log(`📋 Loaded ${this.unitTypes.size} unit types`);
    }
    
    /**
     * Create a new unit
     */
    createUnit(unitType, options = {}) {
        const unitDef = this.unitTypes.get(unitType);
        if (!unitDef) {
            console.error(`Unknown unit type: ${unitType}`);
            return null;
        }
        
        const unit = new Unit({
            id: this.unitIdCounter++,
            type: unitType,
            ...unitDef,
            x: options.x || 0,
            y: options.y || 0,
            faction: options.faction || unitDef.faction,
            ...options
        });
        
        this.units.push(unit);
        this.emit('unitCreated', unit);
        
        console.log(`👥 Created ${unitType} at (${unit.x}, ${unit.y})`);
        return unit;
    }
    
    /**
     * Remove a unit
     */
    removeUnit(unit) {
        const index = this.units.indexOf(unit);
        if (index > -1) {
            this.units.splice(index, 1);
            
            // Remove from selection
            const selectedIndex = this.selectedUnits.indexOf(unit);
            if (selectedIndex > -1) {
                this.selectedUnits.splice(selectedIndex, 1);
            }
            
            this.emit('unitDestroyed', unit);
            console.log(`👥 Removed unit ${unit.id}`);
        }
    }
    
    /**
     * Get unit by ID
     */
    getUnitById(id) {
        return this.units.find(unit => unit.id === id);
    }
    
    /**
     * Get all units
     */
    getAllUnits() {
        return this.units.slice();
    }
    
    /**
     * Get units by faction
     */
    getUnitsByFaction(faction) {
        return this.units.filter(unit => unit.faction === faction);
    }
    
    /**
     * Get units by type
     */
    getUnitsByType(unitType) {
        return this.units.filter(unit => unit.type === unitType);
    }
    
    /**
     * Get units in area
     */
    getUnitsInArea(x, y, width, height) {
        return this.units.filter(unit => {
            return !(unit.x + unit.width < x ||
                    unit.x > x + width ||
                    unit.y + unit.height < y ||
                    unit.y > y + height);
        });
    }
    
    /**
     * Get units within range of position
     */
    getUnitsInRange(x, y, range) {
        return this.units.filter(unit => {
            const distance = Math.sqrt(
                Math.pow(unit.x + unit.width/2 - x, 2) +
                Math.pow(unit.y + unit.height/2 - y, 2)
            );
            return distance <= range;
        });
    }
    
    /**
     * Deploy unit at position
     */
    deployUnit(unit, x, y) {
        unit.x = x;
        unit.y = y;
        unit.deployed = true;
        
        this.emit('unitDeployed', unit);
        console.log(`👥 Deployed unit ${unit.id} at (${x}, ${y})`);
    }
    
    /**
     * Move unit to position
     */
    moveUnit(unit, x, y) {
        unit.moveTo(x, y);
    }
    
    /**
     * Order unit to attack target
     */
    attackTarget(unit, target) {
        if (unit.damage > 0) {
            unit.attackTarget(target);
        }
    }
    
    /**
     * Select units
     */
    selectUnits(units) {
        // Clear previous selection
        this.selectedUnits.forEach(unit => {
            unit.selected = false;
        });
        
        // Set new selection
        this.selectedUnits = units.slice();
        this.selectedUnits.forEach(unit => {
            unit.selected = true;
        });
        
        this.emit('unitsSelected', this.selectedUnits);
    }
    
    /**
     * Get selected units
     */
    getSelectedUnits() {
        return this.selectedUnits.slice();
    }
    
    /**
     * Clear unit selection
     */
    clearSelection() {
        this.selectedUnits.forEach(unit => {
            unit.selected = false;
        });
        this.selectedUnits = [];
        
        this.emit('selectionCleared');
    }
    
    /**
     * Group units
     */
    groupUnits(units, groupNumber) {
        units.forEach(unit => {
            unit.group = groupNumber;
        });
        
        this.emit('unitsGrouped', { units, groupNumber });
    }
    
    /**
     * Select group
     */
    selectGroup(groupNumber) {
        const groupUnits = this.units.filter(unit => unit.group === groupNumber);
        this.selectUnits(groupUnits);
    }
    
    /**
     * Update all units
     */
    update(deltaTime) {
        for (const unit of this.units) {
            unit.update(deltaTime);
        }
        
        // Clean up dead units
        const deadUnits = this.units.filter(unit => unit.health <= 0);
        deadUnits.forEach(unit => this.removeUnit(unit));
    }
    
    /**
     * Get unit type definition
     */
    getUnitType(unitType) {
        return this.unitTypes.get(unitType);
    }
    
    /**
     * Get all unit types
     */
    getAllUnitTypes() {
        return Array.from(this.unitTypes.values());
    }
    
    /**
     * Get unit types for faction
     */
    getUnitTypesForFaction(faction) {
        return Array.from(this.unitTypes.values()).filter(def => def.faction === faction);
    }
    
    /**
     * Can build unit type
     */
    canBuildUnit(unitType, faction) {
        const unitDef = this.unitTypes.get(unitType);
        if (!unitDef) return false;
        
        // Check faction
        if (unitDef.faction !== faction) return false;
        
        // Check resources
        if (!window.gameEngine.resourceManager.canAfford(unitDef.cost)) {
            return false;
        }
        
        // Check prerequisites (to be implemented)
        return true;
    }
    
    /**
     * Get unit count
     */
    getUnitCount() {
        return this.units.length;
    }
    
    /**
     * Get unit count by faction
     */
    getUnitCountByFaction(faction) {
        return this.units.filter(unit => unit.faction === faction).length;
    }
    
    /**
     * Get unit count by type
     */
    getUnitCountByType(unitType) {
        return this.units.filter(unit => unit.type === unitType).length;
    }
    
    /**
     * Find nearest enemy unit
     */
    findNearestEnemy(fromUnit, range = Infinity) {
        let nearestEnemy = null;
        let nearestDistance = range;
        
        for (const unit of this.units) {
            if (unit.faction === fromUnit.faction) continue;
            
            const distance = Math.sqrt(
                Math.pow(unit.x + unit.width/2 - fromUnit.x - fromUnit.width/2, 2) +
                Math.pow(unit.y + unit.height/2 - fromUnit.y - fromUnit.height/2, 2)
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = unit;
            }
        }
        
        return nearestEnemy;
    }
    
    /**
     * Reset all units
     */
    reset() {
        this.units = [];
        this.selectedUnits = [];
        this.unitIdCounter = 1;
        
        this.emit('unitsReset');
        console.log('👥 All units reset');
    }
    
    /**
     * Get save data
     */
    getSaveData() {
        return {
            units: this.units.map(unit => unit.getSaveData()),
            unitIdCounter: this.unitIdCounter
        };
    }
    
    /**
     * Load save data
     */
    loadSaveData(data) {
        this.reset();
        
        if (data.units) {
            data.units.forEach(unitData => {
                const unit = new Unit(unitData);
                this.units.push(unit);
            });
        }
        
        if (data.unitIdCounter) {
            this.unitIdCounter = data.unitIdCounter;
        }
        
        console.log(`👥 Loaded ${this.units.length} units from save`);
    }
    
    /**
     * Get statistics
     */
    getStatistics() {
        const stats = {
            totalUnits: this.units.length,
            unitsByFaction: {},
            unitsByType: {},
            selectedUnits: this.selectedUnits.length
        };
        
        // Count by faction
        for (const unit of this.units) {
            stats.unitsByFaction[unit.faction] = (stats.unitsByFaction[unit.faction] || 0) + 1;
            stats.unitsByType[unit.type] = (stats.unitsByType[unit.type] || 0) + 1;
        }
        
        return stats;
    }
    
    /**
     * Debug method to create test units
     */
    createTestUnits() {
        // Create some test units for development
        this.createUnit('engineer', { x: 100, y: 100, faction: 'allies' });
        this.createUnit('gi', { x: 150, y: 100, faction: 'allies' });
        this.createUnit('tank', { x: 200, y: 100, faction: 'allies' });
        this.createUnit('harvester', { x: 250, y: 100, faction: 'allies' });
        
        console.log('🐛 Test units created');
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
                console.error(`Error in UnitManager event listener for ${event}:`, error);
            }
        });
    }
}