/**
 * Base GameObject class for Scotty Mason's Revenge
 * Base class for all game objects (units, buildings, etc.)
 */

class GameObject {
    constructor(options = {}) {
        // Basic properties
        this.id = options.id || 0;
        this.type = options.type || 'object';
        this.name = options.name || this.type;
        
        // Position and size
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 32;
        this.height = options.height || 32;
        this.rotation = options.rotation || 0;
        
        // Health and combat
        this.health = options.health || 100;
        this.maxHealth = options.maxHealth || options.health || 100;
        this.armor = options.armor || 0;
        this.damage = options.damage || 0;
        this.range = options.range || 0;
        
        // Faction and team
        this.faction = options.faction || 'neutral';
        this.team = options.team || this.faction;
        
        // State
        this.selected = false;
        this.destroyed = false;
        this.visible = true;
        
        // Animation and rendering
        this.sprite = options.sprite || null;
        this.animationFrame = 0;
        this.animationTime = 0;
        
        // Event system for each object
        this.eventListeners = {};
        
        console.log(`🎯 GameObject ${this.type} created with ID ${this.id}`);
    }
    
    /**
     * Update the game object
     */
    update(deltaTime) {
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Check for destruction
        if (this.health <= 0 && !this.destroyed) {
            this.destroy();
        }
    }
    
    /**
     * Update animation
     */
    updateAnimation(deltaTime) {
        this.animationTime += deltaTime;
        
        // Simple frame animation (could be expanded)
        if (this.animationTime > 0.2) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTime = 0;
        }
    }
    
    /**
     * Take damage
     */
    takeDamage(amount, damageType = 'normal', attacker = null) {
        if (this.destroyed) return;
        
        // Apply armor reduction
        const actualDamage = Math.max(1, amount - this.armor);
        const oldHealth = this.health;
        
        this.health = Math.max(0, this.health - actualDamage);
        
        // Emit damage event
        this.emit('damaged', {
            damage: actualDamage,
            damageType: damageType,
            attacker: attacker,
            healthBefore: oldHealth,
            healthAfter: this.health
        });
        
        // Visual feedback
        this.showDamageEffect();
        
        // Check for destruction
        if (this.health <= 0) {
            this.destroy(attacker);
        }
        
        console.log(`🎯 ${this.name} took ${actualDamage} damage (${this.health}/${this.maxHealth})`);
    }
    
    /**
     * Heal the object
     */
    heal(amount) {
        if (this.destroyed) return;
        
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);
        
        if (this.health > oldHealth) {
            this.emit('healed', {
                healAmount: this.health - oldHealth,
                healthBefore: oldHealth,
                healthAfter: this.health
            });
        }
    }
    
    /**
     * Destroy the object
     */
    destroy(destroyer = null) {
        if (this.destroyed) return;
        
        this.destroyed = true;
        this.health = 0;
        this.selected = false;
        
        // Create explosion effect
        this.createExplosionEffect();
        
        // Play destruction sound
        if (window.gameEngine.audioManager) {
            window.gameEngine.audioManager.playPositionalSound(
                'explosion', 
                this.x + this.width/2, 
                this.y + this.height/2,
                window.gameEngine.renderer.camera.x + window.gameEngine.renderer.width/2,
                window.gameEngine.renderer.camera.y + window.gameEngine.renderer.height/2
            );
        }
        
        this.emit('destroyed', { destroyer: destroyer });
        
        console.log(`💥 ${this.name} destroyed`);
    }
    
    /**
     * Get center position
     */
    getCenterX() {
        return this.x + this.width / 2;
    }
    
    getCenterY() {
        return this.y + this.height / 2;
    }
    
    getCenter() {
        return {
            x: this.getCenterX(),
            y: this.getCenterY()
        };
    }
    
    /**
     * Get distance to another object
     */
    getDistanceTo(other) {
        const dx = this.getCenterX() - other.getCenterX();
        const dy = this.getCenterY() - other.getCenterY();
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Check if point is inside object bounds
     */
    containsPoint(x, y) {
        return x >= this.x && 
               x <= this.x + this.width &&
               y >= this.y && 
               y <= this.y + this.height;
    }
    
    /**
     * Check if object overlaps with another object
     */
    overlaps(other) {
        return !(this.x + this.width < other.x ||
                other.x + other.width < this.x ||
                this.y + this.height < other.y ||
                other.y + other.height < this.y);
    }
    
    /**
     * Check if object is within range of another object
     */
    isInRangeOf(other, range) {
        return this.getDistanceTo(other) <= range;
    }
    
    /**
     * Check if object can attack another object
     */
    canAttack(other) {
        if (this.damage <= 0) return false;
        if (this.range <= 0) return false;
        if (other.destroyed) return false;
        if (other.faction === this.faction) return false;
        
        return this.isInRangeOf(other, this.range);
    }
    
    /**
     * Attack another object
     */
    attack(target) {
        if (!this.canAttack(target)) return false;
        
        // Deal damage
        target.takeDamage(this.damage, 'normal', this);
        
        // Create attack effect
        this.createAttackEffect(target);
        
        // Play attack sound
        if (window.gameEngine.audioManager) {
            window.gameEngine.audioManager.playPositionalSound(
                'weaponFire',
                this.getCenterX(),
                this.getCenterY(),
                window.gameEngine.renderer.camera.x + window.gameEngine.renderer.width/2,
                window.gameEngine.renderer.camera.y + window.gameEngine.renderer.height/2
            );
        }
        
        this.emit('attacked', { target: target, damage: this.damage });
        
        return true;
    }
    
    /**
     * Set selection state
     */
    setSelected(selected) {
        this.selected = selected;
        this.emit('selectionChanged', selected);
    }
    
    /**
     * Show damage effect
     */
    showDamageEffect() {
        // Add visual feedback for taking damage
        if (window.gameEngine.renderer) {
            window.gameEngine.renderer.addEffect(
                'damage_flash',
                this.x,
                this.y,
                300
            );
        }
    }
    
    /**
     * Create explosion effect
     */
    createExplosionEffect() {
        if (window.gameEngine.renderer) {
            window.gameEngine.renderer.addEffect(
                'explosion',
                this.getCenterX() - 32,
                this.getCenterY() - 32,
                1000
            );
        }
    }
    
    /**
     * Create attack effect
     */
    createAttackEffect(target) {
        if (window.gameEngine.renderer) {
            // Muzzle flash
            window.gameEngine.renderer.addEffect(
                'muzzle_flash',
                this.getCenterX() - 12,
                this.getCenterY() - 12,
                200
            );
            
            // Projectile trail (simplified)
            const steps = 5;
            for (let i = 0; i < steps; i++) {
                const t = i / steps;
                const x = this.getCenterX() + (target.getCenterX() - this.getCenterX()) * t;
                const y = this.getCenterY() + (target.getCenterY() - this.getCenterY()) * t;
                
                setTimeout(() => {
                    window.gameEngine.renderer.addEffect(
                        'projectile_trail',
                        x - 1,
                        y - 10,
                        100
                    );
                }, i * 20);
            }
        }
    }
    
    /**
     * Get object bounds
     */
    getBounds() {
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.width,
            bottom: this.y + this.height,
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * Set position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.emit('positionChanged', { x: x, y: y });
    }
    
    /**
     * Move by offset
     */
    moveBy(deltaX, deltaY) {
        this.setPosition(this.x + deltaX, this.y + deltaY);
    }
    
    /**
     * Set rotation
     */
    setRotation(rotation) {
        this.rotation = rotation;
        this.emit('rotationChanged', rotation);
    }
    
    /**
     * Rotate towards target
     */
    rotateTowards(targetX, targetY) {
        const dx = targetX - this.getCenterX();
        const dy = targetY - this.getCenterY();
        const angle = Math.atan2(dy, dx);
        this.setRotation(angle);
    }
    
    /**
     * Get health percentage
     */
    getHealthPercentage() {
        return this.maxHealth > 0 ? this.health / this.maxHealth : 0;
    }
    
    /**
     * Is object alive
     */
    isAlive() {
        return this.health > 0 && !this.destroyed;
    }
    
    /**
     * Is object enemy to another object
     */
    isEnemyOf(other) {
        return this.faction !== other.faction;
    }
    
    /**
     * Is object allied to another object
     */
    isAlliedTo(other) {
        return this.faction === other.faction;
    }
    
    /**
     * Get display information
     */
    getDisplayInfo() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            faction: this.faction,
            health: this.health,
            maxHealth: this.maxHealth,
            healthPercentage: this.getHealthPercentage(),
            x: Math.floor(this.x),
            y: Math.floor(this.y),
            selected: this.selected,
            destroyed: this.destroyed
        };
    }
    
    /**
     * Get save data
     */
    getSaveData() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rotation: this.rotation,
            health: this.health,
            maxHealth: this.maxHealth,
            armor: this.armor,
            damage: this.damage,
            range: this.range,
            faction: this.faction,
            team: this.team,
            destroyed: this.destroyed
        };
    }
    
    /**
     * Load from save data
     */
    loadSaveData(data) {
        Object.assign(this, data);
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
                console.error(`Error in GameObject event listener for ${event}:`, error);
            }
        });
    }
    
    /**
     * Cleanup when object is removed
     */
    cleanup() {
        this.eventListeners = {};
        this.destroyed = true;
    }
    
    /**
     * String representation
     */
    toString() {
        return `${this.type}[${this.id}] at (${Math.floor(this.x)}, ${Math.floor(this.y)})`;
    }
}