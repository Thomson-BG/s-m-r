/**
 * Unit class for Scotty Mason's Revenge
 * Represents a movable unit in the game
 */

class Unit extends GameObject {
    constructor(options = {}) {
        super(options);
        
        // Unit-specific properties
        this.unitType = options.type || 'unit';
        this.speed = options.speed || 50;
        this.buildTime = options.buildTime || 10;
        this.cost = options.cost || 100;
        
        // Movement and AI
        this.targetX = this.x;
        this.targetY = this.y;
        this.isMoving = false;  
        this.movementSpeed = this.speed;
        this.path = [];
        this.pathIndex = 0;
        
        // Combat and targeting
        this.target = null;
        this.attackCooldown = 0;
        this.attackSpeed = options.attackSpeed || 1.0; // attacks per second
        this.lastAttackTime = 0;
        
        // Special abilities
        this.canConstruct = options.canConstruct || false;
        this.canRepair = options.canRepair || false;
        this.canHarvest = options.canHarvest || false;
        this.isStealthy = options.isStealthy || false;
        this.isAirUnit = options.isAirUnit || false;
        
        // State
        this.state = 'idle'; // idle, moving, attacking, constructing, harvesting
        this.orders = [];
        this.group = options.group || 0;
        this.veterancy = 0; // 0 = rookie, 1 = veteran, 2 = elite
        
        // Experience and promotion
        this.experience = 0;
        this.killCount = 0;
        
        // Special unit states
        this.isActive = true;
        this.deployed = options.deployed || false;
        this.constructing = null; // building being constructed
        this.repairing = null; // building being repaired
        this.harvesting = null; // resource being harvested
        this.carryingOre = 0;
        this.maxOreCapacity = options.maxOreCapacity || 0;
        
        console.log(`👤 Unit ${this.unitType} created`);
    }
    
    /**
     * Update the unit
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        if (this.destroyed || !this.isActive) return;
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Process current state
        switch (this.state) {
            case 'moving':
                this.updateMovement(deltaTime);
                break;
            case 'attacking':
                this.updateAttack(deltaTime);
                break;
            case 'constructing':
                this.updateConstruction(deltaTime);
                break;
            case 'harvesting':
                this.updateHarvesting(deltaTime);
                break;
            case 'idle':
                this.updateIdle(deltaTime);
                break;
        }
        
        // Process orders queue
        this.processOrders();
        
        // Auto-target enemies if not busy
        if (this.state === 'idle' && this.damage > 0) {
            this.autoTarget();
        }
    }
    
    /**
     * Move to target position
     */
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.state = 'moving';
        this.isMoving = true;
        this.target = null; // Clear attack target
        
        // Simple pathfinding (direct line)
        this.path = [{ x: x, y: y }];
        this.pathIndex = 0;
        
        this.emit('moveStarted', { x: x, y: y });
        console.log(`👤 ${this.name} moving to (${x}, ${y})`);
    }
    
    /**
     * Update movement
     */
    updateMovement(deltaTime) {
        if (this.path.length === 0 || this.pathIndex >= this.path.length) {
            this.stopMoving();
            return;
        }
        
        const target = this.path[this.pathIndex];
        const dx = target.x - this.getCenterX();
        const dy = target.y - this.getCenterY();
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 2) {
            // Reached this waypoint
            this.pathIndex++;
            if (this.pathIndex >= this.path.length) {
                this.stopMoving();
                return;
            }
        }
        
        // Move towards target
        const moveDistance = this.movementSpeed * deltaTime;
        if (distance > 0) {
            const moveX = (dx / distance) * moveDistance;
            const moveY = (dy / distance) * moveDistance;
            
            // Update position
            this.x += moveX;
            this.y += moveY;
            
            // Update rotation to face movement direction
            this.setRotation(Math.atan2(dy, dx));
        }
    }
    
    /**
     * Stop moving
     */
    stopMoving() {
        this.isMoving = false;
        this.state = 'idle';
        this.path = [];
        this.pathIndex = 0;
        
        this.emit('moveCompleted');
    }
    
    /**
     * Set attack target
     */
    setTarget(target) {
        if (!target || target.destroyed || target === this) {
            this.target = null;
            if (this.state === 'attacking') {
                this.state = 'idle';
            }
            return;
        }
        
        this.target = target;
        this.state = 'attacking';
        
        this.emit('targetAcquired', target);
        console.log(`👤 ${this.name} targeting ${target.name}`);
    }
    
    /**
     * Attack target  
     */
    attackTarget(target) {
        this.setTarget(target);
    }
    
    /**
     * Update attack behavior
     */
    updateAttack(deltaTime) {
        if (!this.target || this.target.destroyed || this.damage <= 0) {
            this.target = null;
            this.state = 'idle';
            return;
        }
        
        const distance = this.getDistanceTo(this.target);
        
        // Move closer if out of range
        if (distance > this.range) {
            // Move towards target
            const dx = this.target.getCenterX() - this.getCenterX();
            const dy = this.target.getCenterY() - this.getCenterY();
            const moveDistance = this.movementSpeed * deltaTime;
            
            if (distance > 0) {
                const moveX = (dx / distance) * moveDistance;
                const moveY = (dy / distance) * moveDistance;
                
                this.x += moveX;
                this.y += moveY;
                this.setRotation(Math.atan2(dy, dx));
            }
        } else {
            // In range - attack if cooldown is ready
            if (this.attackCooldown <= 0) {
                this.performAttack(this.target);
                this.attackCooldown = 1.0 / this.attackSpeed;
            }
            
            // Face target
            this.rotateTowards(this.target.getCenterX(), this.target.getCenterY());
        }
    }
    
    /**
     * Perform attack on target
     */
    performAttack(target) {
        if (!this.canAttack(target)) return false;
        
        const success = this.attack(target);
        
        if (success && target.destroyed) {
            // Target destroyed - gain experience
            this.gainExperience(10);
            this.killCount++;
            this.target = null;
            this.state = 'idle';
        }
        
        return success;
    }
    
    /**
     * Auto-target nearby enemies
     */
    autoTarget() {
        if (!window.gameEngine.unitManager) return;
        
        const nearestEnemy = window.gameEngine.unitManager.findNearestEnemy(this, this.range);
        if (nearestEnemy) {
            this.setTarget(nearestEnemy);
        }
    }
    
    /**
     * Update idle behavior
     */
    updateIdle(deltaTime) {
        // Look for nearby enemies if aggressive
        if (this.damage > 0) {
            this.autoTarget();
        }
    }
    
    /**
     * Start construction
     */
    startConstruction(buildingType, x, y) {
        if (!this.canConstruct) return false;
        
        // Check if we can build this
        if (!window.gameEngine.buildingManager.canBuildType(buildingType, this.faction)) {
            return false;
        }
        
        // Move to construction site first if not close enough
        const distance = Math.sqrt((x - this.getCenterX()) ** 2 + (y - this.getCenterY()) ** 2);
        if (distance > 50) {
            this.orders.push({
                type: 'construct',
                buildingType: buildingType,
                x: x,
                y: y
            });
            this.moveTo(x, y);
            return true;
        }
        
        // Start construction
        if (window.gameEngine.buildingManager.startBuilding(buildingType, x, y, this.faction)) {
            this.state = 'constructing';
            this.constructing = { type: buildingType, x: x, y: y };
            
            this.emit('constructionStarted', this.constructing);
            console.log(`👤 ${this.name} constructing ${buildingType}`);
            return true;
        }
        
        return false;
    }
    
    /**
     * Update construction
     */
    updateConstruction(deltaTime) {
        if (!this.constructing) {
            this.state = 'idle';
            return;
        }
        
        // Look for the building we're constructing
        const building = window.gameEngine.buildingManager.getBuildingsInArea(
            this.constructing.x, this.constructing.y, 96, 96
        ).find(b => b.isConstructing && b.type === this.constructing.type);
        
        if (!building) {
            // Construction complete or cancelled
            this.constructing = null;
            this.state = 'idle';
            return;
        }
        
        // Face the building
        this.rotateTowards(building.getCenterX(), building.getCenterY());
        
        // Construction happens automatically in BuildingManager
        if (!building.isConstructing) {
            this.constructing = null;
            this.state = 'idle';
            this.emit('constructionCompleted');
        }
    }
    
    /**
     * Start repair
     */
    startRepair(building) {
        if (!this.canRepair || !building || building.health >= building.maxHealth) {
            return false;
        }
        
        this.repairing = building;
        this.state = 'repairing';
        
        this.emit('repairStarted', building);
        console.log(`👤 ${this.name} repairing ${building.name}`);
        return true;
    }
    
    /**
     * Start harvesting
     */
    startHarvesting(resource) {
        if (!this.canHarvest || !resource) return false;
        
        this.harvesting = resource;
        this.state = 'harvesting';
        
        this.emit('harvestingStarted', resource);
        console.log(`👤 ${this.name} harvesting resource`);
        return true;
    }
    
    /**
     * Update harvesting
     */
    updateHarvesting(deltaTime) {
        if (!this.harvesting) {
            this.state = 'idle';
            return;
        }
        
        // Simulate ore collection
        const harvestRate = 10; // ore per second
        const harvested = Math.min(harvestRate * deltaTime, this.maxOreCapacity - this.carryingOre);
        
        this.carryingOre += harvested;
        
        // If full, return to refinery
        if (this.carryingOre >= this.maxOreCapacity) {
            this.returnToRefinery();
        }
    }
    
    /**
     * Return to refinery
     */
    returnToRefinery() {
        const refinery = window.gameEngine.buildingManager.findNearestBuilding(
            this.getCenterX(), this.getCenterY(), 'refinery', this.faction
        );
        
        if (refinery) {
            this.orders.push({
                type: 'deliver',
                target: refinery
            });
            this.moveTo(refinery.getCenterX(), refinery.getCenterY());
        }
        
        this.harvesting = null;
        this.state = 'moving';
    }
    
    /**
     * Process orders queue
     */
    processOrders() {
        if (this.orders.length === 0 || this.state !== 'idle') return;
        
        const order = this.orders.shift();
        
        switch (order.type) {
            case 'move':
                this.moveTo(order.x, order.y);
                break;
            case 'attack':
                this.setTarget(order.target);
                break;
            case 'construct':
                this.startConstruction(order.buildingType, order.x, order.y);
                break;
            case 'repair':
                this.startRepair(order.target);
                break;
            case 'harvest':
                this.startHarvesting(order.target);
                break;
            case 'deliver':
                // Deliver ore to refinery
                if (this.carryingOre > 0) {
                    window.gameEngine.resourceManager.addCredits(this.carryingOre * 4);
                    this.carryingOre = 0;
                }
                break;
        }
    }
    
    /**
     * Add order to queue
     */
    addOrder(order) {
        this.orders.push(order);
    }
    
    /**
     * Clear all orders
     */
    clearOrders() {
        this.orders = [];
        this.target = null;
        if (this.state !== 'idle') {
            this.state = 'idle';
        }
    }
    
    /**
     * Gain experience
     */
    gainExperience(amount) {
        this.experience += amount;
        
        const oldVeterancy = this.veterancy;
        
        // Check for promotion
        if (this.experience >= 100 && this.veterancy === 0) {
            this.promote();
        } else if (this.experience >= 300 && this.veterancy === 1) {
            this.promote();
        }
    }
    
    /**
     * Promote unit
     */
    promote() {
        if (this.veterancy >= 2) return;
        
        this.veterancy++;
        
        // Apply veterancy bonuses
        const bonus = this.veterancy * 0.25; // 25% per level
        this.health = Math.floor(this.maxHealth * (1 + bonus));
        this.maxHealth = this.health;
        this.damage = Math.floor(this.damage * (1 + bonus));
        
        this.emit('promoted', this.veterancy);
        console.log(`⭐ ${this.name} promoted to veterancy ${this.veterancy}`);
    }
    
    /**
     * Deploy/undeploy unit (for certain unit types)
     */
    deploy() {
        if (this.deployed) return;
        
        this.deployed = true;
        this.movementSpeed = 0; // Can't move when deployed
        this.damage *= 1.5; // Bonus damage when deployed
        this.range *= 1.2; // Bonus range when deployed
        
        this.emit('deployed');
        console.log(`👤 ${this.name} deployed`);
    }
    
    /**
     * Undeploy unit
     */
    undeploy() {
        if (!this.deployed) return;
        
        this.deployed = false;
        this.movementSpeed = this.speed;
        this.damage /= 1.5;
        this.range /= 1.2;
        
        this.emit('undeployed');
        console.log(`👤 ${this.name} undeployed`);
    }
    
    /**
     * Get unit status for UI
     */
    getStatus() {
        const status = {
            ...this.getDisplayInfo(),
            state: this.state,
            isMoving: this.isMoving,
            hasTarget: !!this.target,
            targetName: this.target ? this.target.name : null,
            veterancy: this.veterancy,
            experience: this.experience,
            killCount: this.killCount,
            orders: this.orders.length,
            group: this.group,
            deployed: this.deployed,
            carryingOre: this.carryingOre
        };
        
        // Add special states
        if (this.constructing) {
            status.constructing = this.constructing.type;
        }
        if (this.repairing) {
            status.repairing = this.repairing.name;
        }
        if (this.harvesting) {
            status.harvesting = true;
        }
        
        return status;
    }
    
    /**
     * Get save data
     */
    getSaveData() {
        return {
            ...super.getSaveData(),
            unitType: this.unitType,
            speed: this.speed,
            buildTime: this.buildTime,
            cost: this.cost,
            targetX: this.targetX,
            targetY: this.targetY,
            isMoving: this.isMoving,
            movementSpeed: this.movementSpeed,
            attackSpeed: this.attackSpeed,
            canConstruct: this.canConstruct,
            canRepair: this.canRepair,
            canHarvest: this.canHarvest,
            isStealthy: this.isStealthy,
            isAirUnit: this.isAirUnit,
            state: this.state,
            group: this.group,
            veterancy: this.veterancy,
            experience: this.experience,
            killCount: this.killCount,
            isActive: this.isActive,
            deployed: this.deployed,
            carryingOre: this.carryingOre,
            maxOreCapacity: this.maxOreCapacity
        };
    }
    
    /**
     * Load from save data
     */
    loadSaveData(data) {
        super.loadSaveData(data);
        // Orders and temporary state not saved
        this.orders = [];
        this.target = null;
        this.constructing = null;
        this.repairing = null;
        this.harvesting = null;
    }
}