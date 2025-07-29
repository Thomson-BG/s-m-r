/**
 * Resource Manager for Scotty Mason's Revenge
 * Handles credits, power, and resource collection
 */

class ResourceManager {
    constructor() {
        this.credits = 5000;
        this.power = 100;
        this.maxPower = 100;
        this.powerUsed = 0;
        
        // Resource generation rates
        this.creditGeneration = 0;
        this.powerGeneration = 0;
        
        // Resource buildings
        this.refineries = [];
        this.powerPlants = [];
        this.harvesters = [];
        
        // Event system
        this.eventListeners = {};
        
        console.log('💰 ResourceManager initialized');
    }
    
    async initialize() {
        this.reset();
        console.log('✅ ResourceManager ready');
    }
    
    /**
     * Reset all resources to default values
     */
    reset() {
        this.credits = 5000;
        this.power = 100;
        this.maxPower = 100;
        this.powerUsed = 0;
        this.creditGeneration = 0;
        this.powerGeneration = 100; // Base power generation
        
        this.refineries = [];
        this.powerPlants = [];
        this.harvesters = [];
        
        this.emit('creditsChanged', this.credits);
        this.emit('powerChanged', this.power, this.maxPower);
    }
    
    /**
     * Update resource generation
     */
    update(deltaTime) {
        // Generate credits from refineries
        if (this.creditGeneration > 0) {
            const creditsGenerated = this.creditGeneration * deltaTime;
            this.addCredits(creditsGenerated);
        }
        
        // Update power status
        this.updatePowerStatus();
    }
    
    /**
     * Add credits
     */
    addCredits(amount) {
        const oldCredits = this.credits;
        this.credits = Math.max(0, this.credits + amount);
        
        if (this.credits !== oldCredits) {
            this.emit('creditsChanged', this.credits);
        }
    }
    
    /**
     * Spend credits
     */
    spendCredits(amount) {
        if (this.credits >= amount) {
            this.credits -= amount;
            this.emit('creditsChanged', this.credits);
            return true;
        }
        return false;
    }
    
    /**
     * Check if player can afford something
     */
    canAfford(cost) {
        return this.credits >= cost;
    }
    
    /**
     * Get current credits
     */
    getCredits() {
        return Math.floor(this.credits);
    }
    
    /**
     * Set credits (for initialization/cheats)
     */
    setCredits(amount) {
        this.credits = Math.max(0, amount);
        this.emit('creditsChanged', this.credits);
    }
    
    /**
     * Add power generation
     */
    addPowerGeneration(amount) {
        this.maxPower += amount;
        this.power = Math.min(this.power + amount, this.maxPower);
        this.emit('powerChanged', this.power, this.maxPower);
    }
    
    /**
     * Remove power generation
     */
    removePowerGeneration(amount) {
        this.maxPower = Math.max(0, this.maxPower - amount);
        this.power = Math.min(this.power, this.maxPower);
        this.emit('powerChanged', this.power, this.maxPower);
    }
    
    /**
     * Use power
     */
    usePower(amount) {
        if (this.power >= amount) {
            this.powerUsed += amount;
            this.updatePowerStatus();
            return true;
        }
        return false;
    }
    
    /**
     * Free up power
     */
    freePower(amount) {
        this.powerUsed = Math.max(0, this.powerUsed - amount);
        this.updatePowerStatus();
    }
    
    /**
     * Update power status
     */
    updatePowerStatus() {
        const availablePower = this.maxPower - this.powerUsed;
        
        if (availablePower !== this.power) {
            this.power = availablePower;
            this.emit('powerChanged', this.power, this.maxPower);
        }
        
        // Check for power shortage
        if (this.powerUsed > this.maxPower) {
            this.emit('powerShortage', this.powerUsed - this.maxPower);
        }
    }
    
    /**
     * Get power status
     */
    getPower() {
        return this.power;
    }
    
    /**
     * Get max power
     */
    getMaxPower() {
        return this.maxPower;
    }
    
    /**
     * Get power usage
     */
    getPowerUsed() {
        return this.powerUsed;
    }
    
    /**
     * Set power (for initialization)
     */
    setPower(current, max) {
        this.power = Math.max(0, current);
        this.maxPower = Math.max(0, max);
        this.powerUsed = Math.max(0, this.maxPower - this.power);
        this.emit('powerChanged', this.power, this.maxPower);
    }
    
    /**
     * Register a refinery
     */
    addRefinery(refinery) {
        this.refineries.push(refinery);
        this.updateCreditGeneration();
        console.log('🏭 Refinery added');
    }
    
    /**
     * Remove a refinery
     */
    removeRefinery(refinery) {
        const index = this.refineries.indexOf(refinery);
        if (index > -1) {
            this.refineries.splice(index, 1);
            this.updateCreditGeneration();
            console.log('🏭 Refinery removed');
        }
    }
    
    /**
     * Register a power plant
     */
    addPowerPlant(powerPlant) {
        this.powerPlants.push(powerPlant);
        this.addPowerGeneration(powerPlant.powerOutput);
        console.log('⚡ Power plant added');
    }
    
    /**
     * Remove a power plant
     */
    removePowerPlant(powerPlant) {
        const index = this.powerPlants.indexOf(powerPlant);
        if (index > -1) {
            this.powerPlants.splice(index, 1);
            this.removePowerGeneration(powerPlant.powerOutput);
            console.log('⚡ Power plant removed');
        }
    }
    
    /**
     * Register a harvester
     */
    addHarvester(harvester) {
        this.harvesters.push(harvester);
        this.updateCreditGeneration();
        console.log('🚚 Harvester added');
    }
    
    /**
     * Remove a harvester
     */
    removeHarvester(harvester) {
        const index = this.harvesters.indexOf(harvester);
        if (index > -1) {
            this.harvesters.splice(index, 1);
            this.updateCreditGeneration();
            console.log('🚚 Harvester removed');
        }
    }
    
    /**
     * Update credit generation rate
     */
    updateCreditGeneration() {
        // Base generation from refineries
        let generation = this.refineries.length * 50; // 50 credits per second per refinery
        
        // Bonus from harvesters
        const activeHarvesters = this.harvesters.filter(h => h.isActive);
        generation += activeHarvesters.length * 25; // 25 additional credits per active harvester
        
        this.creditGeneration = generation;
        
        this.emit('creditGenerationChanged', this.creditGeneration);
    }
    
    /**
     * Get resource collection info
     */
    getResourceInfo() {
        return {
            credits: this.credits,
            creditGeneration: this.creditGeneration,
            power: this.power,
            maxPower: this.maxPower,
            powerUsed: this.powerUsed,
            refineries: this.refineries.length,
            powerPlants: this.powerPlants.length,
            harvesters: this.harvesters.length,
            activeHarvesters: this.harvesters.filter(h => h.isActive).length
        };
    }
    
    /**
     * Check if there's enough resources for a purchase
     */
    canAffordPurchase(cost, powerRequirement = 0) {
        return this.credits >= cost && this.power >= powerRequirement;
    }
    
    /**
     * Make a purchase (spend credits and power)
     */
    makePurchase(cost, powerRequirement = 0) {
        if (this.canAffordPurchase(cost, powerRequirement)) {
            this.spendCredits(cost);
            if (powerRequirement > 0) {
                this.usePower(powerRequirement);
            }
            return true;
        }
        return false;
    }
    
    /**
     * Calculate income rate
     */
    getIncomeRate() {
        return this.creditGeneration;
    }
    
    /**
     * Get power efficiency (0-1)
     */
    getPowerEfficiency() {
        if (this.maxPower === 0) return 0;
        return Math.min(1, this.power / this.maxPower);
    }
    
    /**
     * Get resource status for UI
     */
    getResourceStatus() {
        const powerEfficiency = this.getPowerEfficiency();
        let status = 'normal';
        
        if (powerEfficiency < 0.5) {
            status = 'low_power';
        } else if (this.credits < 1000) {
            status = 'low_credits';
        } else if (powerEfficiency === 1 && this.creditGeneration > 100) {
            status = 'optimal';
        }
        
        return {
            status,
            credits: this.credits,
            power: this.power,
            maxPower: this.maxPower,
            powerEfficiency,
            creditGeneration: this.creditGeneration
        };
    }
    
    /**
     * Save data for game saves
     */
    getSaveData() {
        return {
            credits: this.credits,
            power: this.power,
            maxPower: this.maxPower,
            powerUsed: this.powerUsed,
            creditGeneration: this.creditGeneration,
            powerGeneration: this.powerGeneration,
            refineryCount: this.refineries.length,
            powerPlantCount: this.powerPlants.length,
            harvesterCount: this.harvesters.length
        };
    }
    
    /**
     * Load data from game saves
     */
    loadSaveData(data) {
        this.credits = data.credits || 5000;
        this.power = data.power || 100;
        this.maxPower = data.maxPower || 100;
        this.powerUsed = data.powerUsed || 0;
        this.creditGeneration = data.creditGeneration || 0;
        this.powerGeneration = data.powerGeneration || 100;
        
        // Clear arrays (buildings will re-register themselves)
        this.refineries = [];
        this.powerPlants = [];
        this.harvesters = [];
        
        this.emit('creditsChanged', this.credits);
        this.emit('powerChanged', this.power, this.maxPower);
        
        console.log('📁 ResourceManager data loaded');
    }
    
    /**
     * Debug method to add resources (for testing)
     */
    addDebugResources() {
        this.addCredits(10000);
        this.addPowerGeneration(500);
        console.log('🐛 Debug resources added');
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
                console.error(`Error in ResourceManager event listener for ${event}:`, error);
            }
        });
    }
}