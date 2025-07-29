/**
 * Renderer for Scotty Mason's Revenge
 * Handles 2D canvas rendering of the game world
 */

class Renderer {
    constructor() {
        this.canvas = null;
        this.context = null;
        this.width = 0;
        this.height = 0;
        
        // Camera system
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1.0,
            targetX: 0,
            targetY: 0,
            targetZoom: 1.0
        };
        
        // Map properties
        this.mapWidth = 1600;
        this.mapHeight = 1200;
        this.tileSize = 32;
        
        // Rendering layers
        this.layers = {
            terrain: [],
            buildings: [],
            units: [],
            effects: [],
            ui: []
        };
        
        // Sprites and graphics
        this.sprites = new Map();
        this.particleSystems = [];
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.fps = 60;
        
        console.log('🎨 Renderer initialized');
    }
    
    async initialize() {
        // Get canvas element
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            throw new Error('Game canvas not found');
        }
        
        this.context = this.canvas.getContext('2d');
        if (!this.context) {
            throw new Error('Failed to get 2D context');
        }
        
        // Set canvas size
        this.resize();
        
        // Setup event listeners
        window.addEventListener('resize', () => this.resize());
        
        // Generate sprites
        this.generateSprites();
        
        // Initialize camera
        this.camera.x = this.mapWidth / 2 - this.width / 2;
        this.camera.y = this.mapHeight / 2 - this.height / 2;
        this.camera.targetX = this.camera.x;
        this.camera.targetY = this.camera.y;
        
        console.log('✅ Renderer ready');
    }
    
    /**
     * Resize canvas to fit container
     */
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Update camera bounds
        this.updateCameraBounds();
    }
    
    /**
     * Generate sprites for game objects
     */
    generateSprites() {
        // Generate building sprites
        this.generateBuildingSprites();
        
        // Generate unit sprites
        this.generateUnitSprites();
        
        // Generate terrain sprites
        this.generateTerrainSprites();
        
        // Generate effect sprites
        this.generateEffectSprites();
        
        console.log('🎨 Sprites generated');
    }
    
    /**
     * Generate building sprites
     */
    generateBuildingSprites() {
        const buildings = [
            { name: 'construction_yard', size: 96, color: '#444444' },
            { name: 'power_plant', size: 64, color: '#ffaa00' },
            { name: 'refinery', size: 80, color: '#666666' },
            { name: 'barracks', size: 64, color: '#008800' },
            { name: 'war_factory', size: 96, color: '#880000' },
            { name: 'tech_center', size: 80, color: '#0088aa' },
            { name: 'defense_turret', size: 32, color: '#aa0000' }
        ];
        
        buildings.forEach(building => {
            const sprite = this.createBuildingSprite(building.size, building.color);
            this.sprites.set(building.name, sprite);
        });
    }
    
    /**
     * Generate unit sprites
     */
    generateUnitSprites() {
        const units = [
            { name: 'engineer', size: 16, color: '#ffaa00' },
            { name: 'gi', size: 16, color: '#008800' },
            { name: 'tank', size: 24, color: '#666666' },
            { name: 'harvester', size: 24, color: '#aa6600' },
            { name: 'helicopter', size: 20, color: '#004400' },
            { name: 'navy_seal', size: 16, color: '#000088' }
        ];
        
        units.forEach(unit => {
            const sprite = this.createUnitSprite(unit.size, unit.color);
            this.sprites.set(unit.name, sprite);
        });
    }
    
    /**
     * Generate terrain sprites
     */
    generateTerrainSprites() {
        // Generate grass tile
        const grassSprite = this.createTerrainSprite('#2d5a3d', '#3d6a4d');
        this.sprites.set('grass', grassSprite);
        
        // Generate water tile
        const waterSprite = this.createTerrainSprite('#1a4d66', '#2a5d76');
        this.sprites.set('water', waterSprite);
        
        // Generate road tile
        const roadSprite = this.createTerrainSprite('#555555', '#666666');
        this.sprites.set('road', roadSprite);
        
        // Generate ore tile
        const oreSprite = this.createTerrainSprite('#aa6600', '#cc7700');
        this.sprites.set('ore', oreSprite);
    }
    
    /**
     * Generate effect sprites
     */
    generateEffectSprites() {
        // Explosion sprite
        const explosionSprite = this.createExplosionSprite();
        this.sprites.set('explosion', explosionSprite);
        
        // Muzzle flash sprite
        const muzzleFlashSprite = this.createMuzzleFlashSprite();
        this.sprites.set('muzzle_flash', muzzleFlashSprite);
        
        // Selection indicator
        const selectionSprite = this.createSelectionSprite();
        this.sprites.set('selection', selectionSprite);
    }
    
    /**
     * Create a building sprite
     */
    createBuildingSprite(size, color) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Main building body
        ctx.fillStyle = color;
        ctx.fillRect(2, 2, size - 4, size - 4);
        
        // Building outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, size - 4, size - 4);
        
        // Windows/details
        ctx.fillStyle = '#ffffff';
        for (let x = 8; x < size - 8; x += 12) {
            for (let y = 8; y < size - 8; y += 12) {
                ctx.fillRect(x, y, 4, 4);
            }
        }
        
        // Roof
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, size, 4);
        
        return canvas;
    }
    
    /**
     * Create a unit sprite
     */
    createUnitSprite(size, color) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Unit body (circular)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Unit outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Directional indicator
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(size / 2, size / 4, 2, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }
    
    /**
     * Create a terrain sprite
     */
    createTerrainSprite(baseColor, accentColor) {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        
        // Base color
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        
        // Add texture
        ctx.fillStyle = accentColor;
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.tileSize;
            const y = Math.random() * this.tileSize;
            const size = Math.random() * 3 + 1;
            ctx.fillRect(x, y, size, size);
        }
        
        return canvas;
    }
    
    /**
     * Create explosion sprite
     */
    createExplosionSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Create radial gradient
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.3, '#ff8800');
        gradient.addColorStop(0.6, '#ff0000');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }
    
    /**
     * Create muzzle flash sprite
     */
    createMuzzleFlashSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#ffff88';
        ctx.beginPath();
        ctx.arc(12, 12, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(12, 12, 6, 0, Math.PI * 2);
        ctx.fill();
        
        return canvas;
    }
    
    /**
     * Create selection indicator sprite
     */
    createSelectionSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(2, 2, 44, 44);
        
        return canvas;
    }
    
    /**
     * Initialize map
     */
    initializeMap(mapSize) {
        // Clear existing terrain
        this.layers.terrain = [];
        
        // Generate terrain tiles
        for (let x = 0; x < this.mapWidth; x += this.tileSize) {
            for (let y = 0; y < this.mapHeight; y += this.tileSize) {
                let tileType = 'grass';
                
                // Add some variety
                const rand = Math.random();
                if (rand < 0.1) tileType = 'ore';
                else if (rand < 0.2) tileType = 'water';
                else if (rand < 0.3) tileType = 'road';
                
                this.layers.terrain.push({
                    type: tileType,
                    x: x,
                    y: y
                });
            }
        }
        
        console.log('🗺️ Map initialized');
    }
    
    /**
     * Add a unit to render
     */
    addUnit(unit) {
        this.layers.units.push(unit);
    }
    
    /**
     * Remove a unit from render
     */
    removeUnit(unit) {
        const index = this.layers.units.indexOf(unit);
        if (index > -1) {
            this.layers.units.splice(index, 1);
        }
    }
    
    /**
     * Add a building to render
     */
    addBuilding(building) {
        this.layers.buildings.push(building);
    }
    
    /**
     * Remove a building from render
     */
    removeBuilding(building) {
        const index = this.layers.buildings.indexOf(building);
        if (index > -1) {
            this.layers.buildings.splice(index, 1);
        }
    }
    
    /**
     * Clear the canvas
     */
    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
        
        // Fill with background color
        this.context.fillStyle = '#001100';
        this.context.fillRect(0, 0, this.width, this.height);
    }
    
    /**
     * Main render method
     */
    render() {
        // Update camera
        this.updateCamera();
        
        // Save context state
        this.context.save();
        
        // Apply camera transform
        this.context.translate(-this.camera.x, -this.camera.y);
        this.context.scale(this.camera.zoom, this.camera.zoom);
        
        // Render layers in order
        this.renderTerrain();
        this.renderBuildings();
        this.renderUnits();
        this.renderEffects();
        
        // Restore context state
        this.context.restore();
        
        // Render UI elements (no camera transform)
        this.renderUI();
        
        // Update performance stats
        this.updateFPS();
    }
    
    /**
     * Render terrain layer
     */
    renderTerrain() {
        for (const tile of this.layers.terrain) {
            if (this.isInView(tile.x, tile.y, this.tileSize, this.tileSize)) {
                const sprite = this.sprites.get(tile.type);
                if (sprite) {
                    this.context.drawImage(sprite, tile.x, tile.y);
                }
            }
        }
    }
    
    /**
     * Render buildings layer
     */
    renderBuildings() {
        for (const building of this.layers.buildings) {
            if (this.isInView(building.x, building.y, building.width, building.height)) {
                const sprite = this.sprites.get(building.type);
                if (sprite) {
                    this.context.drawImage(sprite, building.x, building.y);
                    
                    // Render health bar
                    this.renderHealthBar(building);
                    
                    // Render selection indicator
                    if (building.selected) {
                        this.renderSelectionIndicator(building);
                    }
                }
            }
        }
    }
    
    /**
     * Render units layer
     */
    renderUnits() {
        for (const unit of this.layers.units) {
            if (this.isInView(unit.x, unit.y, unit.width, unit.height)) {
                const sprite = this.sprites.get(unit.type);
                if (sprite) {
                    // Apply rotation if unit has direction
                    this.context.save();
                    this.context.translate(unit.x + unit.width / 2, unit.y + unit.height / 2);
                    this.context.rotate(unit.rotation || 0);
                    this.context.drawImage(sprite, -unit.width / 2, -unit.height / 2);
                    this.context.restore();
                    
                    // Render health bar
                    this.renderHealthBar(unit);
                    
                    // Render selection indicator
                    if (unit.selected) {
                        this.renderSelectionIndicator(unit);
                    }
                }
            }
        }
    }
    
    /**
     * Render effects layer
     */
    renderEffects() {
        for (const effect of this.layers.effects) {
            if (this.isInView(effect.x, effect.y, effect.width, effect.height)) {
                const sprite = this.sprites.get(effect.type);
                if (sprite) {
                    this.context.globalAlpha = effect.alpha || 1.0;
                    this.context.drawImage(sprite, effect.x, effect.y);
                    this.context.globalAlpha = 1.0;
                }
            }
        }
        
        // Clean up finished effects
        this.layers.effects = this.layers.effects.filter(effect => !effect.finished);
    }
    
    /**
     * Render UI layer (no camera transform)
     */
    renderUI() {
        // Render FPS counter
        this.context.fillStyle = '#ffffff';
        this.context.font = '14px monospace';
        this.context.fillText(`FPS: ${this.fps}`, 10, 25);
        
        // Render camera position (debug)
        this.context.fillText(`Camera: ${Math.floor(this.camera.x)}, ${Math.floor(this.camera.y)}`, 10, 45);
        this.context.fillText(`Zoom: ${this.camera.zoom.toFixed(2)}`, 10, 65);
    }
    
    /**
     * Render health bar for objects
     */
    renderHealthBar(object) {
        if (!object.health || !object.maxHealth) return;
        
        const barWidth = object.width;
        const barHeight = 4;
        const barX = object.x;
        const barY = object.y - 8;
        
        // Background
        this.context.fillStyle = '#000000';
        this.context.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
        
        // Health bar
        const healthPercent = object.health / object.maxHealth;
        let healthColor = '#00ff00';
        if (healthPercent < 0.3) healthColor = '#ff0000';
        else if (healthPercent < 0.6) healthColor = '#ffaa00';
        
        this.context.fillStyle = healthColor;
        this.context.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Border
        this.context.strokeStyle = '#ffffff';
        this.context.lineWidth = 1;
        this.context.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    /**
     * Render selection indicator
     */
    renderSelectionIndicator(object) {
        const padding = 4;
        const x = object.x - padding;
        const y = object.y - padding;
        const width = object.width + padding * 2;
        const height = object.height + padding * 2;
        
        this.context.strokeStyle = '#ffaa00';
        this.context.lineWidth = 2;
        this.context.setLineDash([4, 4]);
        this.context.strokeRect(x, y, width, height);
        this.context.setLineDash([]);
    }
    
    /**
     * Check if object is in camera view
     */
    isInView(x, y, width, height) {
        const cameraRight = this.camera.x + this.width / this.camera.zoom;
        const cameraBottom = this.camera.y + this.height / this.camera.zoom;
        
        return !(x + width < this.camera.x || 
                x > cameraRight || 
                y + height < this.camera.y || 
                y > cameraBottom);
    }
    
    /**
     * Update camera position and zoom
     */
    updateCamera() {
        // Smooth camera movement
        const lerpFactor = 0.1;
        this.camera.x += (this.camera.targetX - this.camera.x) * lerpFactor;
        this.camera.y += (this.camera.targetY - this.camera.y) * lerpFactor;
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * lerpFactor;
        
        // Clamp camera to map bounds
        this.updateCameraBounds();
    }
    
    /**
     * Update camera bounds
     */
    updateCameraBounds() {
        const viewWidth = this.width / this.camera.zoom;
        const viewHeight = this.height / this.camera.zoom;
        
        this.camera.x = Math.max(0, Math.min(this.mapWidth - viewWidth, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.mapHeight - viewHeight, this.camera.y));
        
        this.camera.targetX = Math.max(0, Math.min(this.mapWidth - viewWidth, this.camera.targetX));
        this.camera.targetY = Math.max(0, Math.min(this.mapHeight - viewHeight, this.camera.targetY));
    }
    
    /**
     * Move camera to position
     */
    moveCamera(x, y) {
        this.camera.targetX = x - this.width / 2 / this.camera.zoom;
        this.camera.targetY = y - this.height / 2 / this.camera.zoom;
    }
    
    /**
     * Pan camera by offset
     */
    panCamera(deltaX, deltaY) {
        this.camera.targetX += deltaX / this.camera.zoom;
        this.camera.targetY += deltaY / this.camera.zoom;
    }
    
    /**
     * Zoom camera
     */
    zoomCamera(zoomDelta, centerX = null, centerY = null) {
        const oldZoom = this.camera.targetZoom;
        this.camera.targetZoom = Math.max(0.5, Math.min(3.0, this.camera.targetZoom + zoomDelta));
        
        // Zoom towards cursor position if provided
        if (centerX !== null && centerY !== null && this.camera.targetZoom !== oldZoom) {
            const worldX = this.camera.x + centerX / oldZoom;
            const worldY = this.camera.y + centerY / oldZoom;
            
            this.camera.targetX = worldX - centerX / this.camera.targetZoom;
            this.camera.targetY = worldY - centerY / this.camera.targetZoom;
        }
    }
    
    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX, screenY) {
        return {
            x: this.camera.x + screenX / this.camera.zoom,
            y: this.camera.y + screenY / this.camera.zoom
        };
    }
    
    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.camera.x) * this.camera.zoom,
            y: (worldY - this.camera.y) * this.camera.zoom
        };
    }
    
    /**
     * Add visual effect
     */
    addEffect(type, x, y, duration = 1000) {
        const effect = {
            type: type,
            x: x,
            y: y,
            width: 64,
            height: 64,
            alpha: 1.0,
            startTime: Date.now(),
            duration: duration,
            finished: false
        };
        
        this.layers.effects.push(effect);
        
        // Fade out over time
        setTimeout(() => {
            const fadeInterval = setInterval(() => {
                effect.alpha -= 0.05;
                if (effect.alpha <= 0) {
                    effect.finished = true;
                    clearInterval(fadeInterval);
                }
            }, 50);
        }, duration * 0.7);
    }
    
    /**
     * Update FPS counter
     */
    updateFPS() {
        this.frameCount++;
        const now = Date.now();
        
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }
    
    /**
     * Get render statistics
     */
    getRenderStats() {
        return {
            fps: this.fps,
            terrainTiles: this.layers.terrain.length,
            buildings: this.layers.buildings.length,
            units: this.layers.units.length,
            effects: this.layers.effects.length,
            cameraX: this.camera.x,
            cameraY: this.camera.y,
            cameraZoom: this.camera.zoom
        };
    }
}