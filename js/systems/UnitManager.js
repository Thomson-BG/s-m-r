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
                canConstruct: true,
                canRepair: true,
                description: 'Captures buildings and repairs structures'
            },
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
                canConstruct: false,
                canRepair: false,
                description: 'Basic infantry unit with rifle'
            },
            {
                type: 'tank',
                name: 'Grizzly Tank',
                faction: 'allies',
                cost: 700,
                buildTime: 15,
                health: 300,
                speed: 40,
                damage: 65,
                range: 120,
                width: 24,
                height: 24,
                canConstruct: false,
                canRepair: false,
                description: 'Main battle tank with cannon'
            },
            {
                type: 'harvester',
                name: 'Chrono Miner',
                faction: 'allies',
                cost: 1400,
                buildTime: 20,
                health: 1000,
                speed: 30,
                damage: 0,
                range: 0,
                width: 24,
                height: 24,
                canConstruct: false,
                canRepair: false,
                canHarvest: true,
                description: 'Collects ore for credits'
            },
            {
                type: 'helicopter',
                name: 'Harrier',
                faction: 'allies',
                cost: 1200,
                buildTime: 25,
                health: 150,
                speed: 120,
                damage: 80,
                range: 100,
                width: 20,
                height: 20,
                canConstruct: false,
                canRepair: false,
                isAirUnit: true,
                description: 'Fast attack aircraft'
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
                canConstruct: false,
                canRepair: false,
                isStealthy: true,
                description: 'Elite special forces unit'
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