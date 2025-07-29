/**
 * Building class for Scotty Mason's Revenge
 * Represents a structure in the game
 */

class Building extends GameObject {
    constructor(options = {}) {
        super(options);
        
        // Building-specific properties
        this.buildingType = options.type || 'building';
        this.cost = options.cost || 500;
        this.buildTime = options.buildTime || 30;
        
        // Power system
        this.power = options.power || 0; // Power consumption
        this.powerGeneration = options.powerGeneration || 0; // Power generation
        
        // Construction
        this.isConstructing = options.isConstructing || false;
        this.constructionProgress = options.constructionProgress || 0;
        this.constructionTime = options.constructionTime || this.buildTime;
        
        // Production capabilities
        this.canBuild = options.canBuild || []; // Buildings this can construct
        this.canProduce = options.canProduce || []; // Units this can produce
        this.productionQueue = [];
        this.currentProduction = null;
        this.productionProgress = 0;
        
        // Special functions
        this.processesOre = options.processesOre || false;
        this.includesHarvester = options.includesHarvester || false;
        this.isDefense = options.isDefense || false;
        this.enablesUnits = options.enablesUnits || [];
        this.enablesBuildings = options.enablesBuildings || [];
        
        // Defense capabilities
        this.turret = null;
        this.lastFireTime = 0;
        this.fireRate = options.fireRate || 1.0; // shots per second
        
        // State
        this.isActive = true;
        this.isPowered = true;
        this.ralliePoint = null;
        this.description = options.description || '';
        
        // Economy
        this.oreStorage = 0;
        this.maxOreStorage = options.maxOreStorage || 0;
        
        console.log(`🏢 Building ${this.buildingType} created`);
    }
    
    /**
     * Update the building
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.destroyed) return;
        
        // Update construction
        if (this.isConstructing) {
            this.updateConstruction(deltaTime);
        }
        
        // Update production
        if (this.currentProduction) {
            this.updateProduction(deltaTime);
        }
        
        // Update defense turret
        if (this.isDefense && this.damage > 0) {
            this.updateDefense(deltaTime);
        }
        
        // Update power status
        this.updatePowerStatus();
        
        // Process ore if refinery
        if (this.processesOre) {
            this.updateOreProcessing(deltaTime);
        }
    }
    
    /**
     * Update construction progress
     */
    updateConstruction(deltaTime) {
        if (!this.isConstructing) return;
        
        this.constructionProgress += deltaTime;
        
        // Construction complete
        if (this.constructionProgress >= this.constructionTime) {
            this.completeConstruction();
        }
        
        this.emit('constructionProgress', {
            progress: this.constructionProgress,
            total: this.constructionTime,
            percentage: this.constructionProgress / this.constructionTime
        });
    }
    
    /**
     * Complete construction
     */
    completeConstruction() {
        this.isConstructing = false;
        this.constructionProgress = 0;
        this.isActive = true;
        
        // If this building includes a harvester, create one
        if (this.includesHarvester && window.gameEngine.unitManager) {
            const harvester = window.gameEngine.unitManager.createUnit('harvester', {
                x: this.x + this.width + 10,
                y: this.y + this.height / 2,
                faction: this.faction
            });
            
            // Register harvester with resource manager
            if (window.gameEngine.resourceManager) {
                window.gameEngine.resourceManager.addHarvester(harvester);
            }
        }
        
        this.emit('constructionCompleted');
        console.log(`🏢 ${this.name} construction completed`);
    }
    
    /**
     * Update production
     */
    updateProduction(deltaTime) {
        if (!this.currentProduction || !this.isPowered) return;
        
        this.productionProgress += deltaTime;
        
        // Production complete
        if (this.productionProgress >= this.currentProduction.buildTime) {
            this.completeProduction();
        }
        
        this.emit('productionProgress', {
            unit: this.currentProduction.type,
            progress: this.productionProgress,
            total: this.currentProduction.buildTime,
            percentage: this.productionProgress / this.currentProduction.buildTime
        });
    }
    
    /**
     * Complete production
     */
    completeProduction() {
        if (!this.currentProduction) return;
        
        const unitType = this.currentProduction.type;
        
        // Create unit
        const unit = window.gameEngine.unitManager.createUnit(unitType, {
            x: this.x + this.width + 10,
            y: this.y + this.height / 2,
            faction: this.faction
        });
        
        // Set rally point if exists
        if (this.ralliePoint) {
            unit.moveTo(this.ralliePoint.x, this.ralliePoint.y);
        }
        
        // Move to next in queue
        this.currentProduction = null;
        this.productionProgress = 0;
        
        if (this.productionQueue.length > 0) {
            this.currentProduction = this.productionQueue.shift();
        }
        
        this.emit('productionCompleted', { unitType: unitType, unit: unit });
        console.log(`🏢 ${this.name} completed production of ${unitType}`);
    }
    
    /**
     * Add unit to production queue
     */
    addToProductionQueue(productionItem) {
        if (!this.currentProduction) {
            this.currentProduction = productionItem;
            this.productionProgress = 0;
        } else {
            this.productionQueue.push(productionItem);
        }
        
        this.emit('unitQueued', productionItem);
    }
    
    /**
     * Cancel current production
     */
    cancelProduction() {
        if (!this.currentProduction) return;
        
        // Refund resources
        const unitDef = window.gameEngine.unitManager.getUnitType(this.currentProduction.type);
        if (unitDef) {
            window.gameEngine.resourceManager.addCredits(Math.floor(unitDef.cost * 0.75));
        }
        
        // Move to next in queue
        this.currentProduction = null;
        this.productionProgress = 0;
        
        if (this.productionQueue.length > 0) {
            this.currentProduction = this.productionQueue.shift();
        }
        
        this.emit('productionCancelled');
    }
    
    /**
     * Clear production queue
     */
    clearProductionQueue() {
        // Refund queued items
        for (const item of this.productionQueue) {
            const unitDef = window.gameEngine.unitManager.getUnitType(item.type);
            if (unitDef) {
                window.gameEngine.resourceManager.addCredits(Math.floor(unitDef.cost * 0.75));
            }
        }
        
        this.productionQueue = [];
        this.emit('queueCleared');
    }
    
    /**
     * Update defense turret
     */
    updateDefense(deltaTime) {
        if (!this.isPowered) return;
        
        // Find nearest enemy
        const enemies = window.gameEngine.unitManager ? 
            window.gameEngine.unitManager.getUnitsInRange(
                this.getCenterX(),
                this.getCenterY(),
                this.range
            ).filter(unit => unit.faction !== this.faction) : [];
        
        if (enemies.length === 0) {
            this.target = null;
            return;
        }
        
        // Target nearest enemy
        const nearestEnemy = enemies.reduce((nearest, enemy) => {
            const nearestDist = nearest ? this.getDistanceTo(nearest) : Infinity;
            const enemyDist = this.getDistanceTo(enemy);
            return enemyDist < nearestDist ? enemy : nearest;
        }, null);
        
        this.target = nearestEnemy;
        
        // Fire at target
        const now = Date.now();
        if (now - this.lastFireTime >= (1000 / this.fireRate)) {
            this.fireAtTarget(nearestEnemy);
            this.lastFireTime = now;
        }
        
        // Rotate turret towards target
        if (nearestEnemy) {
            this.rotateTowards(nearestEnemy.getCenterX(), nearestEnemy.getCenterY());
        }
    }
    
    /**
     * Fire at target
     */
    fireAtTarget(target) {
        if (!target || !this.canAttack(target)) return;
        
        // Create projectile effect
        this.createAttackEffect(target);
        
        // Deal damage
        target.takeDamage(this.damage, 'explosive', this);
        
        this.emit('fired', { target: target, damage: this.damage });
    }
    
    /**
     * Update power status
     */
    updatePowerStatus() {
        // Check if building has enough power
        const resourceManager = window.gameEngine.resourceManager;
        if (resourceManager) {
            const powerEfficiency = resourceManager.getPowerEfficiency();
            this.isPowered = powerEfficiency > 0.5 || this.power === 0;
        } else {
            this.isPowered = true;
        }
        
        // Reduce effectiveness if low power
        if (!this.isPowered) {
            // Slow down production
            // Reduce defense effectiveness
            // etc.
        }
    }
    
    /**
     * Update ore processing
     */
    updateOreProcessing(deltaTime) {
        if (!this.processesOre || this.oreStorage <= 0) return;
        
        const processingRate = 20; // ore per second
        const processed = Math.min(processingRate * deltaTime, this.oreStorage);
        
        this.oreStorage -= processed;
        
        // Convert to credits
        const creditsGenerated = processed * 4;
        window.gameEngine.resourceManager.addCredits(creditsGenerated);
        
        this.emit('oreProcessed', { ore: processed, credits: creditsGenerated });
    }
    
    /**
     * Receive ore delivery
     */
    receiveOre(amount) {
        if (!this.processesOre) return 0;
        
        const capacity = this.maxOreStorage || 1000;
        const canStore = Math.min(amount, capacity - this.oreStorage);
        
        this.oreStorage += canStore;
        
        this.emit('oreReceived', { amount: canStore, total: this.oreStorage });
        
        return canStore;
    }
    
    /**
     * Set rally point
     */
    setRallyPoint(x, y) {
        this.ralliePoint = { x: x, y: y };
        this.emit('rallyPointSet', this.ralliePoint);
        console.log(`🏢 ${this.name} rally point set to (${x}, ${y})`);
    }
    
    /**
     * Clear rally point
     */
    clearRallyPoint() {
        this.ralliePoint = null;
        this.emit('rallyPointCleared');
    }
    
    /**
     * Check if can produce unit type
     */
    canProduceUnit(unitType) {
        if (!this.canProduce) return false;
        if (!this.canProduce.includes(unitType)) return false;
        if (this.isConstructing) return false;
        if (!this.isPowered) return false;
        
        return true;
    }
    
    /**
     * Check if can build building type
     */
    canBuildBuilding(buildingType) {
        if (!this.canBuild) return false;
        if (!this.canBuild.includes(buildingType)) return false;
        if (this.isConstructing) return false;
        if (!this.isPowered) return false;
        
        return true;
    }
    
    /**
     * Repair building
     */
    repair(amount) {
        if (this.health >= this.maxHealth) return 0;
        
        const repaired = Math.min(amount, this.maxHealth - this.health);
        this.health += repaired;
        
        this.emit('repaired', { amount: repaired, health: this.health });
        
        return repaired;
    }
    
    /**
     * Sell building
     */
    sell() {
        if (this.isConstructing) return false;
        
        // Refund portion of cost
        const refund = Math.floor(this.cost * 0.5);
        window.gameEngine.resourceManager.addCredits(refund);
        
        // Clear production queue and refund
        this.clearProductionQueue();
        if (this.currentProduction) {
            this.cancelProduction();
        }
        
        this.emit('sold', { refund: refund });
        
        // Destroy building
        this.destroy();
        
        console.log(`🏢 ${this.name} sold for ${refund} credits`);
        return true;
    }
    
    /**
     * Get building status
     */
    getStatus() {
        const status = {
            ...this.getDisplayInfo(),
            isConstructing: this.isConstructing,
            constructionProgress: this.constructionProgress,
            constructionTime: this.constructionTime,
            constructionPercentage: this.constructionTime > 0 ? this.constructionProgress / this.constructionTime : 0,
            isActive: this.isActive,
            isPowered: this.isPowered,
            powerConsumption: this.power,
            powerGeneration: this.powerGeneration,
            canProduce: this.canProduce || [],
            canBuild: this.canBuild || [],
            productionQueue: this.productionQueue.length,
            currentProduction: this.currentProduction ? this.currentProduction.type : null,
            productionProgress: this.productionProgress,
            ralliePoint: this.ralliePoint,
            oreStorage: this.oreStorage,
            maxOreStorage: this.maxOreStorage
        };
        
        // Add production percentage
        if (this.currentProduction) {
            status.productionPercentage = this.productionProgress / this.currentProduction.buildTime;
            status.productionTimeRemaining = this.currentProduction.buildTime - this.productionProgress;
        }
        
        return status;
    }
    
    /**
     * Get production queue info
     */
    getProductionQueueInfo() {
        const queue = [];
        
        if (this.currentProduction) {
            queue.push({
                type: this.currentProduction.type,
                progress: this.productionProgress,
                total: this.currentProduction.buildTime,
                percentage: this.productionProgress / this.currentProduction.buildTime,
                isActive: true
            });
        }
        
        for (const item of this.productionQueue) {
            queue.push({
                type: item.type,
                progress: 0,
                total: item.buildTime,
                percentage: 0,
                isActive: false
            });
        }
        
        return queue;
    }
    
    /**
     * Get power info
     */
    getPowerInfo() {
        return {
            consumption: this.power,
            generation: this.powerGeneration,
            isPowered: this.isPowered,
            netPower: this.powerGeneration - this.power
        };
    }
    
    /**
     * Get save data
     */
    getSaveData() {
        return {
            ...super.getSaveData(),
            buildingType: this.buildingType,
            cost: this.cost,
            buildTime: this.buildTime,
            power: this.power,
            powerGeneration: this.powerGeneration,
            isConstructing: this.isConstructing,
            constructionProgress: this.constructionProgress,
            constructionTime: this.constructionTime,
            canBuild: this.canBuild,
            canProduce: this.canProduce,
            productionQueue: this.productionQueue,
            currentProduction: this.currentProduction,
            productionProgress: this.productionProgress,
            processesOre: this.processesOre,
            includesHarvester: this.includesHarvester,
            isDefense: this.isDefense,
            enablesUnits: this.enablesUnits,
            enablesBuildings: this.enablesBuildings,
            fireRate: this.fireRate,
            isActive: this.isActive,
            ralliePoint: this.ralliePoint,
            oreStorage: this.oreStorage,
            maxOreStorage: this.maxOreStorage
        };
    }
    
    /**
     * Load from save data
     */
    loadSaveData(data) {
        super.loadSaveData(data);
        // Reset temporary state
        this.target = null;
        this.lastFireTime = 0;
        this.isPowered = true;
    }
    
    /**
     * Destroy building
     */
    destroy(destroyer = null) {
        // Cancel production and refund
        this.clearProductionQueue();
        if (this.currentProduction) {
            this.cancelProduction();
        }
        
        // Create larger explosion for buildings
        if (window.gameEngine.renderer) {
            window.gameEngine.renderer.addEffect(
                'explosion',
                this.getCenterX() - 48,
                this.getCenterY() - 48,
                2000
            );
        }
        
        super.destroy(destroyer);
    }
}