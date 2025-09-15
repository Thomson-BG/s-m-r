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
            resourcePatches: [],
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
        if (!this.canvas) return;
        
        // Get the parent element bounds
        const rect = this.canvas.parentElement.getBoundingClientRect();
        
        // If parent has no dimensions (e.g., hidden), use fallback dimensions
        if (rect.width <= 0 || rect.height <= 0) {
            // Calculate grid area dimensions based on window size
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            // Account for grid layout: 250px + 1fr + 250px columns, 60px + 1fr + 200px rows
            this.width = Math.max(500, windowWidth - 500); // Subtract left and right panels
            this.height = Math.max(400, windowHeight - 260); // Subtract top hud and bottom panel
        } else {
            this.width = rect.width;
            this.height = rect.height;
        }
        
        // Ensure minimum dimensions
        this.width = Math.max(320, this.width);
        this.height = Math.max(240, this.height);
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Update camera bounds
        this.updateCameraBounds();
        
        console.log(`🎨 Canvas resized to ${this.width}x${this.height}`);
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
            // Allied Buildings
            { name: 'construction_yard', size: 96, faction: 'allies', type: 'construction' },
            { name: 'power_plant', size: 64, faction: 'allies', type: 'power' },
            { name: 'ore_refinery', size: 80, faction: 'allies', type: 'refinery' },
            { name: 'barracks', size: 64, faction: 'allies', type: 'barracks' },
            { name: 'war_factory', size: 96, faction: 'allies', type: 'factory' },
            { name: 'naval_yard', size: 96, faction: 'allies', type: 'naval' },
            { name: 'airforce_command', size: 80, faction: 'allies', type: 'airfield' },
            { name: 'service_depot', size: 64, faction: 'allies', type: 'depot' },
            { name: 'ore_purifier', size: 80, faction: 'allies', type: 'tech' },
            { name: 'battle_lab', size: 80, faction: 'allies', type: 'tech' },
            { name: 'spy_satellite', size: 64, faction: 'allies', type: 'radar' },
            { name: 'chronosphere', size: 96, faction: 'allies', type: 'superweapon' },
            { name: 'weather_controller', size: 96, faction: 'allies', type: 'superweapon' },
            { name: 'patriot_missile', size: 32, faction: 'allies', type: 'defense' },
            { name: 'prism_tower', size: 32, faction: 'allies', type: 'defense' },
            { name: 'gap_generator', size: 64, faction: 'allies', type: 'support' },
            
            // Soviet Buildings
            { name: 'tesla_reactor', size: 64, faction: 'soviet', type: 'power' },
            { name: 'radar_tower', size: 48, faction: 'soviet', type: 'radar' },
            { name: 'nuclear_reactor', size: 64, faction: 'soviet', type: 'power' },
            { name: 'nuclear_silo', size: 96, faction: 'soviet', type: 'superweapon' },
            { name: 'iron_curtain', size: 96, faction: 'soviet', type: 'superweapon' },
            { name: 'cloning_vats', size: 80, faction: 'soviet', type: 'support' },
            { name: 'tesla_coil', size: 32, faction: 'soviet', type: 'defense' },
            { name: 'flak_cannon', size: 32, faction: 'soviet', type: 'defense' },
            { name: 'psychic_sensor', size: 64, faction: 'soviet', type: 'support' },
            
            // Neutral Buildings
            { name: 'civilian_building', size: 48, faction: 'neutral', type: 'civilian' },
            { name: 'tech_outpost', size: 64, faction: 'neutral', type: 'tech' },
            { name: 'oil_derrick', size: 48, faction: 'neutral', type: 'resource' },
            { name: 'airport', size: 96, faction: 'neutral', type: 'airfield' }
        ];
        
        buildings.forEach(building => {
            const sprite = this.createAdvancedBuildingSprite(building.size, building.faction, building.type, building.name);
            this.sprites.set(building.name, sprite);
        });
    }
    
    /**
     * Generate unit sprites
     */
    generateUnitSprites() {
        const units = [
            // Allied Units
            { name: 'gi', size: 16, faction: 'allies', type: 'infantry' },
            { name: 'engineer', size: 16, faction: 'allies', type: 'engineer' },
            { name: 'guardian_gi', size: 16, faction: 'allies', type: 'infantry' },
            { name: 'rocketeer', size: 16, faction: 'allies', type: 'aircraft' },
            { name: 'navy_seal', size: 16, faction: 'allies', type: 'special' },
            { name: 'spy', size: 16, faction: 'allies', type: 'stealth' },
            { name: 'chrono_legionnaire', size: 16, faction: 'allies', type: 'special' },
            { name: 'tanya', size: 16, faction: 'allies', type: 'hero' },
            { name: 'grizzly_tank', size: 24, faction: 'allies', type: 'tank' },
            { name: 'ifv', size: 20, faction: 'allies', type: 'vehicle' },
            { name: 'mirage_tank', size: 24, faction: 'allies', type: 'tank' },
            { name: 'battle_fortress', size: 32, faction: 'allies', type: 'heavy' },
            { name: 'prism_tank', size: 24, faction: 'allies', type: 'tank' },
            { name: 'chrono_miner', size: 24, faction: 'allies', type: 'harvester' },
            { name: 'harrier', size: 20, faction: 'allies', type: 'aircraft' },
            { name: 'black_eagle', size: 20, faction: 'allies', type: 'aircraft' },
            { name: 'destroyer', size: 32, faction: 'allies', type: 'naval' },
            { name: 'aegis_cruiser', size: 32, faction: 'allies', type: 'naval' },
            { name: 'aircraft_carrier', size: 48, faction: 'allies', type: 'naval' },
            { name: 'dolphin', size: 16, faction: 'allies', type: 'naval' },
            
            // Soviet Units
            { name: 'conscript', size: 16, faction: 'soviet', type: 'infantry' },
            { name: 'tesla_trooper', size: 16, faction: 'soviet', type: 'infantry' },
            { name: 'flak_trooper', size: 16, faction: 'soviet', type: 'infantry' },
            { name: 'crazy_ivan', size: 16, faction: 'soviet', type: 'special' },
            { name: 'yuri', size: 16, faction: 'soviet', type: 'special' },
            { name: 'boris', size: 16, faction: 'soviet', type: 'hero' },
            { name: 'rhino_tank', size: 24, faction: 'soviet', type: 'tank' },
            { name: 'flak_track', size: 20, faction: 'soviet', type: 'vehicle' },
            { name: 'v3_launcher', size: 24, faction: 'soviet', type: 'artillery' },
            { name: 'apocalypse_tank', size: 32, faction: 'soviet', type: 'heavy' },
            { name: 'terror_drone', size: 16, faction: 'soviet', type: 'special' },
            { name: 'war_miner', size: 24, faction: 'soviet', type: 'harvester' },
            { name: 'kirov_airship', size: 48, faction: 'soviet', type: 'aircraft' },
            { name: 'typhoon_sub', size: 24, faction: 'soviet', type: 'naval' },
            { name: 'sea_scorpion', size: 20, faction: 'soviet', type: 'naval' },
            { name: 'giant_squid', size: 24, faction: 'soviet', type: 'naval' }
        ];
        
        units.forEach(unit => {
            const sprite = this.createAdvancedUnitSprite(unit.size, unit.faction, unit.type, unit.name);
            this.sprites.set(unit.name, sprite);
        });
    }
    
    /**
     * Generate terrain sprites
     */
    generateTerrainSprites() {
        // Generate multiple terrain types for diverse Red Alert 2 style maps
        
        // Grass variations
        const grassSprite = this.createAdvancedTerrainSprite('grass', '#2d5a3d', '#3d6a4d');
        this.sprites.set('grass', grassSprite);
        
        const darkGrassSprite = this.createAdvancedTerrainSprite('dark_grass', '#1d4a2d', '#2d5a3d');
        this.sprites.set('dark_grass', darkGrassSprite);
        
        // Water and shore
        const waterSprite = this.createAdvancedTerrainSprite('water', '#1a4d66', '#2a5d76');
        this.sprites.set('water', waterSprite);
        
        const shoreSprite = this.createAdvancedTerrainSprite('shore', '#8b7355', '#a68866');
        this.sprites.set('shore', shoreSprite);
        
        // Desert terrain
        const sandSprite = this.createAdvancedTerrainSprite('sand', '#c2b280', '#d4c491');
        this.sprites.set('sand', sandSprite);
        
        // Snow and ice
        const snowSprite = this.createAdvancedTerrainSprite('snow', '#f0f8ff', '#ffffff');
        this.sprites.set('snow', snowSprite);
        
        const iceSprite = this.createAdvancedTerrainSprite('ice', '#b0e0e6', '#e0f6ff');
        this.sprites.set('ice', iceSprite);
        
        // Rocky terrain
        const rockSprite = this.createAdvancedTerrainSprite('rock', '#696969', '#808080');
        this.sprites.set('rock', rockSprite);
        
        // Urban terrain
        const concreteSprite = this.createAdvancedTerrainSprite('concrete', '#808080', '#909090');
        this.sprites.set('concrete', concreteSprite);
        
        const roadSprite = this.createAdvancedTerrainSprite('road', '#555555', '#666666');
        this.sprites.set('road', roadSprite);
        
        // Resource patches
        const oreSprite = this.createAdvancedTerrainSprite('ore', '#aa6600', '#cc7700');
        this.sprites.set('ore', oreSprite);
        
        const gemsSprite = this.createAdvancedTerrainSprite('gems', '#8a2be2', '#9932cc');
        this.sprites.set('gems', gemsSprite);
        
        // Bridge terrain
        const bridgeSprite = this.createAdvancedTerrainSprite('bridge', '#8b7355', '#a68866');
        this.sprites.set('bridge', bridgeSprite);
        
        // Cliffs and elevation
        const cliffSprite = this.createAdvancedTerrainSprite('cliff', '#696969', '#556b2f');
        this.sprites.set('cliff', cliffSprite);
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
     * Create an advanced building sprite with detailed faction-specific design
     */
    createAdvancedBuildingSprite(size, faction, type, name) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Get faction color scheme
        const colors = this.getFactionColors(faction);
        
        // Create building based on type and faction
        switch (type) {
            case 'construction':
                this.drawConstructionYard(ctx, size, colors, faction);
                break;
            case 'power':
                this.drawPowerBuilding(ctx, size, colors, faction, name);
                break;
            case 'refinery':
                this.drawRefinery(ctx, size, colors, faction);
                break;
            case 'barracks':
                this.drawBarracks(ctx, size, colors, faction);
                break;
            case 'factory':
                this.drawFactory(ctx, size, colors, faction);
                break;
            case 'defense':
                this.drawDefenseBuilding(ctx, size, colors, faction, name);
                break;
            case 'superweapon':
                this.drawSuperweapon(ctx, size, colors, faction, name);
                break;
            case 'tech':
                this.drawTechBuilding(ctx, size, colors, faction);
                break;
            case 'naval':
                this.drawNavalYard(ctx, size, colors, faction);
                break;
            case 'airfield':
                this.drawAirfield(ctx, size, colors, faction);
                break;
            default:
                this.drawGenericBuilding(ctx, size, colors, faction);
        }
        
        return canvas;
    }
    
    /**
     * Create an advanced unit sprite with detailed faction-specific design
     */
    createAdvancedUnitSprite(size, faction, type, name) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Get faction color scheme
        const colors = this.getFactionColors(faction);
        
        // Create unit based on type and faction
        switch (type) {
            case 'infantry':
                this.drawInfantry(ctx, size, colors, faction, name);
                break;
            case 'tank':
                this.drawTank(ctx, size, colors, faction, name);
                break;
            case 'vehicle':
                this.drawVehicle(ctx, size, colors, faction, name);
                break;
            case 'aircraft':
                this.drawAircraft(ctx, size, colors, faction, name);
                break;
            case 'naval':
                this.drawNavalUnit(ctx, size, colors, faction, name);
                break;
            case 'harvester':
                this.drawHarvester(ctx, size, colors, faction);
                break;
            case 'special':
                this.drawSpecialUnit(ctx, size, colors, faction, name);
                break;
            case 'hero':
                this.drawHero(ctx, size, colors, faction, name);
                break;
            case 'heavy':
                this.drawHeavyUnit(ctx, size, colors, faction, name);
                break;
            default:
                this.drawGenericUnit(ctx, size, colors, faction);
        }
        
        return canvas;
    }
    
    /**
     * Get faction-specific color schemes
     */
    getFactionColors(faction) {
        const schemes = {
            allies: {
                primary: '#2a5bb8',      // Allied blue
                secondary: '#4a7bd8',    // Lighter blue
                accent: '#ffffff',       // White
                dark: '#1a3b78',         // Dark blue
                metal: '#8a9bb0',        // Blue-grey metal
                energy: '#00ffff'        // Cyan for chrono effects
            },
            soviet: {
                primary: '#cc0000',      // Soviet red
                secondary: '#ff3333',    // Lighter red
                accent: '#ffff00',       // Yellow
                dark: '#880000',         // Dark red
                metal: '#606060',        // Grey metal
                energy: '#ff00ff'        // Purple for tesla effects
            },
            yuri: {
                primary: '#6600cc',      // Purple
                secondary: '#9933ff',    // Light purple
                accent: '#00ff00',       // Green
                dark: '#440088',         // Dark purple
                metal: '#888888',        // Grey metal
                energy: '#ff00ff'        // Magenta for psychic effects
            },
            neutral: {
                primary: '#666666',      // Grey
                secondary: '#999999',    // Light grey
                accent: '#cccccc',       // Very light grey
                dark: '#333333',         // Dark grey
                metal: '#888888',        // Metal grey
                energy: '#ffffff'        // White
            }
        };
        
        return schemes[faction] || schemes.neutral;
    }
    
    /**
     * Draw construction yard building
     */
    drawConstructionYard(ctx, size, colors, faction) {
        // Main building structure - more angular and industrial
        ctx.fillStyle = colors.primary;
        ctx.fillRect(2, 2, size - 4, size - 4);
        
        // Faction-specific architectural details
        if (faction === 'allies') {
            // Allied: Clean, technological appearance
            ctx.fillStyle = colors.secondary;
            ctx.fillRect(4, 4, size - 8, 8);
            ctx.fillRect(4, size - 12, size - 8, 8);
            
            // Radar dish
            ctx.fillStyle = colors.metal;
            ctx.beginPath();
            ctx.arc(size * 0.8, size * 0.2, 6, 0, Math.PI * 2);
            ctx.fill();
        } else if (faction === 'soviet' || faction === 'enemy') {
            // Soviet: Heavy, industrial appearance
            ctx.fillStyle = colors.dark;
            ctx.fillRect(6, 6, size - 12, size - 12);
            
            // Factory smokestacks
            ctx.fillStyle = colors.metal;
            ctx.fillRect(size * 0.7, 2, 4, size * 0.3);
            ctx.fillRect(size * 0.8, 2, 4, size * 0.4);
        }
        
        // Construction crane - more detailed
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(size * 0.15, size * 0.85);
        ctx.lineTo(size * 0.15, size * 0.15);
        ctx.lineTo(size * 0.6, size * 0.15);
        ctx.stroke();
        
        // Crane hook
        ctx.fillStyle = colors.accent;
        ctx.fillRect(size * 0.55, size * 0.15, 3, 8);
        
        // Building outline
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, size - 4, size - 4);
        
        // Faction emblem
        ctx.fillStyle = colors.accent;
        if (faction === 'allies') {
            // Allied star
            this.drawStar(ctx, size * 0.8, size * 0.8, 4, 2);
        } else if (faction === 'soviet' || faction === 'enemy') {
            // Soviet hammer and sickle (simplified)
            ctx.fillRect(size * 0.75, size * 0.75, 8, 2);
            ctx.fillRect(size * 0.78, size * 0.72, 2, 8);
        }
    }
        
        // Faction logo area
        ctx.fillStyle = colors.accent;
        ctx.fillRect(size * 0.4, size * 0.4, size * 0.2, size * 0.2);
        
        // Outline
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, size - 8, size - 8);
    }
    
    /**
     * Helper method to draw a star shape
     */
    drawStar(ctx, x, y, outerRadius, innerRadius) {
        const points = 5;
        ctx.beginPath();
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = x + Math.cos(angle - Math.PI / 2) * radius;
            const py = y + Math.sin(angle - Math.PI / 2) * radius;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Draw power building (power plant or tesla reactor)
     */
    drawPowerBuilding(ctx, size, colors, faction, name) {
        if (name === 'tesla_reactor') {
            // Tesla Reactor design
            ctx.fillStyle = colors.primary;
            ctx.fillRect(6, 6, size - 12, size - 12);
            
            // Tesla coils
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                const x = size / 2 + Math.cos(angle) * (size * 0.3);
                const y = size / 2 + Math.sin(angle) * (size * 0.3);
                
                ctx.fillStyle = colors.energy;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Central core
            ctx.fillStyle = colors.energy;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Regular power plant
            ctx.fillStyle = colors.primary;
            ctx.fillRect(6, 6, size - 12, size - 12);
            
            // Cooling towers
            ctx.fillStyle = colors.secondary;
            ctx.beginPath();
            ctx.arc(size * 0.3, size * 0.4, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(size * 0.7, size * 0.4, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Steam effects
            ctx.fillStyle = colors.accent;
            ctx.fillRect(size * 0.28, size * 0.2, 4, 8);
            ctx.fillRect(size * 0.68, size * 0.2, 4, 8);
        }
        
        // Outline
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 2;
        ctx.strokeRect(6, 6, size - 12, size - 12);
    }
    
    /**
     * Draw refinery building
     */
    drawRefinery(ctx, size, colors, faction) {
        // Main structure
        ctx.fillStyle = colors.primary;
        ctx.fillRect(4, 4, size - 8, size - 8);
        
        // Processing towers
        ctx.fillStyle = colors.secondary;
        ctx.fillRect(size * 0.2, size * 0.1, 8, size * 0.6);
        ctx.fillRect(size * 0.4, size * 0.1, 8, size * 0.8);
        ctx.fillRect(size * 0.6, size * 0.1, 8, size * 0.5);
        
        // Conveyor belt
        ctx.fillStyle = colors.metal;
        ctx.fillRect(4, size * 0.75, size - 8, 6);
        
        // Ore storage area
        ctx.fillStyle = '#ffaa00'; // Ore color
        ctx.fillRect(size * 0.7, size * 0.7, size * 0.25, size * 0.25);
        
        // Outline
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, size - 8, size - 8);
    }
    
    /**
     * Draw infantry unit
     */
    drawInfantry(ctx, size, colors, faction, name) {
        const centerX = size / 2;
        const centerY = size / 2;
        
        // Body
        ctx.fillStyle = colors.primary;
        ctx.fillRect(centerX - 3, centerY - 2, 6, 8);
        
        // Head
        ctx.fillStyle = colors.secondary;
        ctx.beginPath();
        ctx.arc(centerX, centerY - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Weapon (varies by unit type)
        ctx.strokeStyle = colors.metal;
        ctx.lineWidth = 2;
        if (name.includes('gi') || name === 'conscript') {
            // Rifle
            ctx.beginPath();
            ctx.moveTo(centerX + 3, centerY);
            ctx.lineTo(centerX + 6, centerY - 2);
            ctx.stroke();
        } else if (name.includes('rocket') || name === 'flak_trooper') {
            // Rocket launcher
            ctx.fillStyle = colors.dark;
            ctx.fillRect(centerX + 2, centerY - 3, 4, 2);
        }
        
        // Faction indicator
        ctx.fillStyle = colors.accent;
        ctx.fillRect(centerX - 1, centerY + 4, 2, 2);
        
        // Outline
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX - 4, centerY - 6, 8, 12);
    }
    
    /**
     * Draw tank unit
     */
    drawTank(ctx, size, colors, faction, name) {
        const centerX = size / 2;
        const centerY = size / 2;
        
        // Faction-specific tank designs
        if (name === 'grizzly_tank' || name === 'rhino_tank') {
            // Main tank body - more angular for realism
            ctx.fillStyle = colors.primary;
            ctx.fillRect(centerX - 10, centerY - 6, 20, 12);
            
            // Tank hull details
            ctx.fillStyle = colors.secondary;
            ctx.fillRect(centerX - 8, centerY - 4, 16, 8);
            
            // Turret - faction specific
            if (name === 'grizzly_tank') {
                // Allied Grizzly - sleek turret
                ctx.fillStyle = colors.secondary;
                ctx.beginPath();
                ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
                ctx.fill();
                
                // Cannon
                ctx.fillStyle = colors.metal;
                ctx.fillRect(centerX - 1, centerY - 12, 2, 10);
                
                // Allied star emblem
                ctx.fillStyle = colors.accent;
                this.drawStar(ctx, centerX, centerY + 6, 3, 1);
                
            } else if (name === 'rhino_tank') {
                // Soviet Rhino - heavy angular turret
                ctx.fillStyle = colors.secondary;
                ctx.fillRect(centerX - 6, centerY - 6, 12, 12);
                
                // Heavy cannon
                ctx.fillStyle = colors.metal;
                ctx.fillRect(centerX - 2, centerY - 12, 4, 10);
                
                // Soviet red star
                ctx.fillStyle = colors.accent;
                this.drawStar(ctx, centerX, centerY + 6, 3, 1);
            }
            
            // Tank tracks - more detailed
            ctx.fillStyle = colors.dark;
            ctx.fillRect(centerX - 12, centerY - 8, 3, 16);
            ctx.fillRect(centerX + 9, centerY - 8, 3, 16);
            
            // Track treads
            ctx.fillStyle = colors.metal;
            for (let i = 0; i < 4; i++) {
                const y = centerY - 6 + i * 3;
                ctx.fillRect(centerX - 11, y, 1, 2);
                ctx.fillRect(centerX + 10, y, 1, 2);
            }
            
        } else if (name === 'apocalypse_tank') {
            // Soviet Apocalypse Tank - massive and intimidating
            ctx.fillStyle = colors.primary;
            ctx.fillRect(centerX - 12, centerY - 8, 24, 16);
            
            // Heavy armor plating
            ctx.fillStyle = colors.dark;
            ctx.fillRect(centerX - 10, centerY - 6, 20, 12);
            
            // Dual turrets
            ctx.fillStyle = colors.secondary;
            ctx.fillRect(centerX - 8, centerY - 8, 6, 6);
            ctx.fillRect(centerX + 2, centerY - 8, 6, 6);
            
            // Dual cannons
            ctx.fillStyle = colors.metal;
            ctx.fillRect(centerX - 6, centerY - 14, 2, 8);
            ctx.fillRect(centerX + 4, centerY - 14, 2, 8);
            
            // Heavy tracks
            ctx.fillStyle = colors.dark;
            ctx.fillRect(centerX - 14, centerY - 10, 4, 20);
            ctx.fillRect(centerX + 10, centerY - 10, 4, 20);
            
        } else if (name === 'prism_tank') {
            // Allied Prism Tank - high-tech appearance
            ctx.fillStyle = colors.primary;
            ctx.fillRect(centerX - 9, centerY - 5, 18, 10);
            
            // Prism housing
            ctx.fillStyle = colors.secondary;
            ctx.fillRect(centerX - 4, centerY - 8, 8, 8);
            
            // Prism crystal
            ctx.fillStyle = colors.energy;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 12);
            ctx.lineTo(centerX - 3, centerY - 6);
            ctx.lineTo(centerX + 3, centerY - 6);
            ctx.closePath();
            ctx.fill();
            
            // Energy conduits
            ctx.strokeStyle = colors.energy;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX - 6, centerY);
            ctx.lineTo(centerX, centerY - 6);
            ctx.lineTo(centerX + 6, centerY);
            ctx.stroke();
            
        } else {
            // Generic tank design
            ctx.fillStyle = colors.primary;
            ctx.fillRect(centerX - 8, centerY - 6, 16, 12);
            
            ctx.fillStyle = colors.secondary;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = colors.dark;
            ctx.fillRect(centerX - 1, centerY - 10, 2, 8);
        }
        
        // Outline
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX - 12, centerY - 10, 24, 20);
    }
    
    /**
     * Draw aircraft unit
     */
    drawAircraft(ctx, size, colors, faction, name) {
        const centerX = size / 2;
        const centerY = size / 2;
        
        if (name === 'kirov_airship') {
            // Kirov airship - large balloon
            ctx.fillStyle = colors.primary;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY - 4, 18, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Gondola
            ctx.fillStyle = colors.secondary;
            ctx.fillRect(centerX - 6, centerY + 2, 12, 4);
            
            // Propellers
            ctx.strokeStyle = colors.metal;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(centerX - 15, centerY, 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(centerX + 15, centerY, 3, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Fighter aircraft
            ctx.fillStyle = colors.primary;
            
            // Fuselage
            ctx.fillRect(centerX - 1, centerY - 8, 2, 16);
            
            // Wings
            ctx.fillRect(centerX - 8, centerY - 2, 16, 4);
            
            // Tail
            ctx.fillRect(centerX - 3, centerY + 6, 6, 2);
            
            // Cockpit
            ctx.fillStyle = colors.accent;
            ctx.fillRect(centerX - 1, centerY - 6, 2, 4);
        }
        
        // Shadow effect for height
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(centerX - size/4 + 2, centerY + size/4 + 2, size/2, size/2);
        
        // Outline
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    /**
     * Draw generic building fallback
     */
    drawGenericBuilding(ctx, size, colors, faction) {
        // Main building body
        ctx.fillStyle = colors.primary;
        ctx.fillRect(4, 4, size - 8, size - 8);
        
        // Building outline
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, size - 8, size - 8);
        
        // Windows/details
        ctx.fillStyle = colors.accent;
        for (let x = 8; x < size - 8; x += 12) {
            for (let y = 8; y < size - 8; y += 12) {
                ctx.fillRect(x, y, 4, 4);
            }
        }
        
        // Roof
        ctx.fillStyle = colors.secondary;
        ctx.fillRect(2, 2, size - 4, 6);
    }
    
    /**
     * Draw generic unit fallback
     */
    drawGenericUnit(ctx, size, colors, faction) {
        const centerX = size / 2;
        const centerY = size / 2;
        
        // Unit body (circular)
        ctx.fillStyle = colors.primary;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Unit outline
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Directional indicator
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(centerX, centerY - size/4, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Additional drawing methods for other unit/building types would go here
    // (truncated for space, but following the same pattern)
    drawBarracks(ctx, size, colors, faction) { this.drawGenericBuilding(ctx, size, colors, faction); }
    drawFactory(ctx, size, colors, faction) { this.drawGenericBuilding(ctx, size, colors, faction); }
    drawDefenseBuilding(ctx, size, colors, faction, name) { this.drawGenericBuilding(ctx, size, colors, faction); }
    drawSuperweapon(ctx, size, colors, faction, name) { this.drawGenericBuilding(ctx, size, colors, faction); }
    drawTechBuilding(ctx, size, colors, faction) { this.drawGenericBuilding(ctx, size, colors, faction); }
    drawNavalYard(ctx, size, colors, faction) { this.drawGenericBuilding(ctx, size, colors, faction); }
    drawAirfield(ctx, size, colors, faction) { this.drawGenericBuilding(ctx, size, colors, faction); }
    drawVehicle(ctx, size, colors, faction, name) { this.drawGenericUnit(ctx, size, colors, faction); }
    drawNavalUnit(ctx, size, colors, faction, name) { this.drawGenericUnit(ctx, size, colors, faction); }
    drawHarvester(ctx, size, colors, faction) { this.drawGenericUnit(ctx, size, colors, faction); }
    drawSpecialUnit(ctx, size, colors, faction, name) { this.drawGenericUnit(ctx, size, colors, faction); }
    drawHero(ctx, size, colors, faction, name) { this.drawInfantry(ctx, size, colors, faction, name); }
    drawHeavyUnit(ctx, size, colors, faction, name) { this.drawTank(ctx, size, colors, faction, name); }
    
    /**
     * Create a building sprite (legacy method for compatibility)
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
     * Create a unit sprite (legacy method for compatibility)
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
     * Create advanced terrain sprite with detailed texturing
     */
    createAdvancedTerrainSprite(terrainType, baseColor, accentColor) {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        
        // Base color
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);
        
        // Terrain-specific detailing
        switch (terrainType) {
            case 'grass':
            case 'dark_grass':
                this.addGrassTexture(ctx, accentColor);
                break;
                
            case 'water':
                this.addWaterTexture(ctx, accentColor);
                break;
                
            case 'shore':
                this.addShoreTexture(ctx, accentColor);
                break;
                
            case 'sand':
                this.addSandTexture(ctx, accentColor);
                break;
                
            case 'snow':
                this.addSnowTexture(ctx, accentColor);
                break;
                
            case 'ice':
                this.addIceTexture(ctx, accentColor);
                break;
                
            case 'rock':
                this.addRockTexture(ctx, accentColor);
                break;
                
            case 'concrete':
            case 'road':
                this.addConcreteTexture(ctx, accentColor);
                break;
                
            case 'ore':
                this.addOreTexture(ctx, accentColor);
                break;
                
            case 'gems':
                this.addGemTexture(ctx, accentColor);
                break;
                
            case 'bridge':
                this.addBridgeTexture(ctx, accentColor);
                break;
                
            case 'cliff':
                this.addCliffTexture(ctx, accentColor);
                break;
                
            default:
                this.addGenericTexture(ctx, accentColor);
        }
        
        return canvas;
    }
    
    /**
     * Add grass texture details
     */
    addGrassTexture(ctx, accentColor) {
        ctx.fillStyle = accentColor;
        
        // Add grass blades
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.tileSize;
            const y = Math.random() * this.tileSize;
            ctx.fillRect(x, y, 1, 3);
            ctx.fillRect(x + 1, y - 1, 1, 2);
        }
        
        // Add small dirt patches
        ctx.fillStyle = '#8b7355';
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * this.tileSize;
            const y = Math.random() * this.tileSize;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * Add water texture details
     */
    addWaterTexture(ctx, accentColor) {
        // Add wave patterns
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 5; i++) {
            const y = (i * this.tileSize) / 5;
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x < this.tileSize; x += 4) {
                ctx.lineTo(x, y + Math.sin(x * 0.5) * 2);
            }
            ctx.stroke();
        }
        
        // Add foam effects
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * this.tileSize;
            const y = Math.random() * this.tileSize;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * Add ore texture details
     */
    addOreTexture(ctx, accentColor) {
        ctx.fillStyle = accentColor;
        
        // Add crystalline ore formations
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * this.tileSize;
            const y = Math.random() * this.tileSize;
            const size = Math.random() * 4 + 2;
            
            ctx.beginPath();
            ctx.moveTo(x, y - size);
            ctx.lineTo(x + size/2, y);
            ctx.lineTo(x, y + size);
            ctx.lineTo(x - size/2, y);
            ctx.closePath();
            ctx.fill();
        }
        
        // Add ore sparkles
        ctx.fillStyle = '#ffff00';
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * this.tileSize;
            const y = Math.random() * this.tileSize;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    /**
     * Add generic texture fallback
     */
    addGenericTexture(ctx, accentColor) {
        ctx.fillStyle = accentColor;
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.tileSize;
            const y = Math.random() * this.tileSize;
            const size = Math.random() * 3 + 1;
            ctx.fillRect(x, y, size, size);
        }
    }
    
    // Simplified texture methods for other terrain types
    addShoreTexture(ctx, accentColor) { this.addGenericTexture(ctx, accentColor); }
    addSandTexture(ctx, accentColor) { this.addGenericTexture(ctx, accentColor); }
    addSnowTexture(ctx, accentColor) { this.addGenericTexture(ctx, accentColor); }
    addIceTexture(ctx, accentColor) { this.addGenericTexture(ctx, accentColor); }
    addRockTexture(ctx, accentColor) { this.addGenericTexture(ctx, accentColor); }
    addConcreteTexture(ctx, accentColor) { this.addGenericTexture(ctx, accentColor); }
    addGemTexture(ctx, accentColor) { this.addOreTexture(ctx, accentColor); }
    addBridgeTexture(ctx, accentColor) { this.addGenericTexture(ctx, accentColor); }
    addCliffTexture(ctx, accentColor) { this.addGenericTexture(ctx, accentColor); }
    
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
     * Initialize map with Red Alert 2 style terrain generation
     */
    initializeMap(mapSize) {
        // Clear existing terrain
        this.layers.terrain = [];
        
        // Map generation parameters
        const mapTypes = ['temperate', 'desert', 'snow', 'urban'];
        const currentMapType = mapTypes[Math.floor(Math.random() * mapTypes.length)];
        
        console.log(`🗺️ Generating ${currentMapType} battlefield...`);
        
        // Generate base terrain
        this.generateBaseTerrain(currentMapType);
        
        // Add terrain features
        this.addTerrainFeatures(currentMapType);
        
        // Add resource deposits
        this.addResourceDeposits();
        
        // Add strategic features
        this.addStrategicFeatures();
        
        console.log('🗺️ Red Alert 2 style map initialized');
    }
    
    /**
     * Generate base terrain based on map type
     */
    generateBaseTerrain(mapType) {
        const tileTypeMap = {
            temperate: { base: 'grass', variants: ['dark_grass', 'grass'] },
            desert: { base: 'sand', variants: ['sand', 'rock'] },
            snow: { base: 'snow', variants: ['snow', 'ice'] },
            urban: { base: 'concrete', variants: ['concrete', 'road'] }
        };
        
        const terrainConfig = tileTypeMap[mapType];
        
        for (let x = 0; x < this.mapWidth; x += this.tileSize) {
            for (let y = 0; y < this.mapHeight; y += this.tileSize) {
                // Use noise function for natural terrain variation
                const noiseValue = this.simpleNoise(x / 100, y / 100);
                
                let tileType = terrainConfig.base;
                if (noiseValue > 0.3) {
                    tileType = terrainConfig.variants[1];
                }
                
                this.layers.terrain.push({
                    type: tileType,
                    x: x,
                    y: y,
                    mapType: mapType
                });
            }
        }
    }
    
    /**
     * Add terrain features like water bodies, cliffs, etc.
     */
    addTerrainFeatures(mapType) {
        // Add water bodies
        this.addWaterBodies(mapType);
        
        // Add cliffs and elevation changes
        this.addCliffFormations();
        
        // Add bridges over water
        this.addBridges();
        
        // Add roads connecting strategic points
        this.addRoadNetwork();
    }
    
    /**
     * Add water bodies to the map
     */
    addWaterBodies(mapType) {
        if (mapType === 'desert') return; // No water in desert maps
        
        const waterBodies = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < waterBodies; i++) {
            const centerX = Math.random() * (this.mapWidth - 200) + 100;
            const centerY = Math.random() * (this.mapHeight - 200) + 100;
            const size = Math.random() * 150 + 100;
            
            for (let x = centerX - size; x < centerX + size; x += this.tileSize) {
                for (let y = centerY - size; y < centerY + size; y += this.tileSize) {
                    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    
                    if (distance < size && x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
                        // Replace terrain tile with water
                        const tileIndex = this.findTerrainTile(x, y);
                        if (tileIndex !== -1) {
                            if (distance < size * 0.7) {
                                this.layers.terrain[tileIndex].type = mapType === 'snow' ? 'ice' : 'water';
                            } else {
                                this.layers.terrain[tileIndex].type = 'shore';
                            }
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Add cliff formations for tactical elevation
     */
    addCliffFormations() {
        const cliffCount = Math.floor(Math.random() * 4) + 2;
        
        for (let i = 0; i < cliffCount; i++) {
            const startX = Math.random() * this.mapWidth;
            const startY = Math.random() * this.mapHeight;
            const length = Math.random() * 200 + 100;
            const angle = Math.random() * Math.PI * 2;
            
            for (let j = 0; j < length; j += this.tileSize) {
                const x = startX + Math.cos(angle) * j;
                const y = startY + Math.sin(angle) * j;
                
                if (x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
                    const tileIndex = this.findTerrainTile(x, y);
                    if (tileIndex !== -1) {
                        this.layers.terrain[tileIndex].type = 'cliff';
                    }
                }
            }
        }
    }
    
    /**
     * Add resource deposits (ore and gems)
     */
    addResourceDeposits() {
        const oreDeposits = Math.floor(Math.random() * 6) + 4;
        const gemDeposits = Math.floor(Math.random() * 3) + 1;
        
        // Add ore deposits
        for (let i = 0; i < oreDeposits; i++) {
            const centerX = Math.random() * (this.mapWidth - 100) + 50;
            const centerY = Math.random() * (this.mapHeight - 100) + 50;
            const size = Math.random() * 80 + 60;
            
            this.createResourceDeposit(centerX, centerY, size, 'ore');
        }
        
        // Add gem deposits (more valuable but smaller)
        for (let i = 0; i < gemDeposits; i++) {
            const centerX = Math.random() * (this.mapWidth - 60) + 30;
            const centerY = Math.random() * (this.mapHeight - 60) + 30;
            const size = Math.random() * 40 + 30;
            
            this.createResourceDeposit(centerX, centerY, size, 'gems');
        }
    }
    
    /**
     * Create a resource deposit
     */
    createResourceDeposit(centerX, centerY, size, resourceType) {
        for (let x = centerX - size; x < centerX + size; x += this.tileSize) {
            for (let y = centerY - size; y < centerY + size; y += this.tileSize) {
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                
                if (distance < size && x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight) {
                    const tileIndex = this.findTerrainTile(x, y);
                    if (tileIndex !== -1 && this.layers.terrain[tileIndex].type !== 'water') {
                        this.layers.terrain[tileIndex].type = resourceType;
                        this.layers.terrain[tileIndex].resourceAmount = Math.floor(Math.random() * 500) + 500;
                    }
                }
            }
        }
    }
    
    /**
     * Add bridges over water bodies
     */
    addBridges() {
        // Find water tiles and add bridges at strategic points
        const waterTiles = this.layers.terrain.filter(tile => tile.type === 'water' || tile.type === 'ice');
        
        if (waterTiles.length > 10) {
            const bridgeCount = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < bridgeCount; i++) {
                const waterTile = waterTiles[Math.floor(Math.random() * waterTiles.length)];
                
                // Create a bridge across the water
                for (let j = 0; j < 5; j++) {
                    const x = waterTile.x + (j * this.tileSize);
                    const y = waterTile.y;
                    
                    if (x < this.mapWidth) {
                        const tileIndex = this.findTerrainTile(x, y);
                        if (tileIndex !== -1) {
                            this.layers.terrain[tileIndex].type = 'bridge';
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Add road network connecting strategic points
     */
    addRoadNetwork() {
        const roadNodes = [
            { x: this.mapWidth * 0.2, y: this.mapHeight * 0.2 },
            { x: this.mapWidth * 0.8, y: this.mapHeight * 0.2 },
            { x: this.mapWidth * 0.2, y: this.mapHeight * 0.8 },
            { x: this.mapWidth * 0.8, y: this.mapHeight * 0.8 },
            { x: this.mapWidth * 0.5, y: this.mapHeight * 0.5 }
        ];
        
        // Connect road nodes
        for (let i = 0; i < roadNodes.length - 1; i++) {
            this.createRoad(roadNodes[i], roadNodes[i + 1]);
        }
    }
    
    /**
     * Create a road between two points
     */
    createRoad(start, end) {
        const steps = Math.floor(Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2) / this.tileSize);
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = start.x + (end.x - start.x) * t;
            const y = start.y + (end.y - start.y) * t;
            
            const tileIndex = this.findTerrainTile(x, y);
            if (tileIndex !== -1 && this.layers.terrain[tileIndex].type !== 'water' && this.layers.terrain[tileIndex].type !== 'ore') {
                this.layers.terrain[tileIndex].type = 'road';
            }
        }
    }
    
    /**
     * Add strategic features like chokepoints and defensive positions
     */
    addStrategicFeatures() {
        // Add some strategic elevation points
        const strategicPoints = Math.floor(Math.random() * 4) + 2;
        
        for (let i = 0; i < strategicPoints; i++) {
            const x = Math.random() * this.mapWidth;
            const y = Math.random() * this.mapHeight;
            const size = Math.random() * 60 + 40;
            
            // Create elevated areas
            for (let dx = -size; dx < size; dx += this.tileSize) {
                for (let dy = -size; dy < size; dy += this.tileSize) {
                    const distance = Math.sqrt(dx ** 2 + dy ** 2);
                    
                    if (distance < size && x + dx >= 0 && x + dx < this.mapWidth && y + dy >= 0 && y + dy < this.mapHeight) {
                        const tileIndex = this.findTerrainTile(x + dx, y + dy);
                        if (tileIndex !== -1 && this.layers.terrain[tileIndex].type !== 'water') {
                            if (distance < size * 0.3) {
                                this.layers.terrain[tileIndex].elevated = true;
                                this.layers.terrain[tileIndex].elevation = 2;
                            } else if (distance < size * 0.7) {
                                this.layers.terrain[tileIndex].elevated = true;
                                this.layers.terrain[tileIndex].elevation = 1;
                            }
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Find terrain tile at coordinates
     */
    findTerrainTile(x, y) {
        const tileX = Math.floor(x / this.tileSize) * this.tileSize;
        const tileY = Math.floor(y / this.tileSize) * this.tileSize;
        
        return this.layers.terrain.findIndex(tile => 
            Math.abs(tile.x - tileX) < this.tileSize/2 && 
            Math.abs(tile.y - tileY) < this.tileSize/2
        );
    }
    
    /**
     * Simple noise function for terrain generation
     */
    simpleNoise(x, y) {
        return Math.sin(x * 4.7) * Math.cos(y * 3.1) * 0.5 + 
               Math.sin(x * 2.3) * Math.cos(y * 5.7) * 0.3 + 
               Math.sin(x * 8.1) * Math.cos(y * 1.9) * 0.2;
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
     * Add a resource patch to render
     */
    addResourcePatch(patch) {
        this.layers.resourcePatches.push(patch);
    }
    
    /**
     * Remove a resource patch from render
     */
    removeResourcePatch(patch) {
        const index = this.layers.resourcePatches.indexOf(patch);
        if (index > -1) {
            this.layers.resourcePatches.splice(index, 1);
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
        this.renderResourcePatches();
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
     * Render resource patches layer
     */
    renderResourcePatches() {
        for (const patch of this.layers.resourcePatches) {
            if (this.isInView(patch.x - 30, patch.y - 30, 60, 60)) {
                this.drawResourcePatch(patch);
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
     * Draw a resource patch
     */
    drawResourcePatch(patch) {
        const ctx = this.context;
        const centerX = patch.x;
        const centerY = patch.y;
        const radius = 25;
        
        // Draw ore patch - golden yellow crystals
        ctx.save();
        
        // Background glow
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
        gradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
        
        // Draw ore crystals/chunks
        const density = Math.max(0.2, patch.amount / patch.maxAmount);
        const oreCount = Math.floor(12 * density);
        
        for (let i = 0; i < oreCount; i++) {
            const angle = (i / oreCount) * Math.PI * 2 + Math.sin(patch.id + i) * 0.5;
            const distance = (radius * 0.3) + Math.random() * (radius * 0.4);
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            // Draw ore chunk
            ctx.fillStyle = '#FFD700'; // Gold
            ctx.strokeStyle = '#B8860B'; // Dark gold
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            const chunkSize = 3 + Math.random() * 4;
            ctx.rect(x - chunkSize/2, y - chunkSize/2, chunkSize, chunkSize);
            ctx.fill();
            ctx.stroke();
            
            // Add highlight
            ctx.fillStyle = '#FFFF99';
            ctx.fillRect(x - chunkSize/4, y - chunkSize/4, chunkSize/2, chunkSize/2);
        }
        
        // Amount indicator (for debugging)
        if (this.showDebugInfo) {
            ctx.fillStyle = 'white';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(Math.floor(patch.amount).toString(), centerX, centerY - radius - 5);
        }
        
        ctx.restore();
    }
    
    /**
     * Get render statistics
     */
    getRenderStats() {
        return {
            fps: this.fps,
            terrainTiles: this.layers.terrain.length,
            resourcePatches: this.layers.resourcePatches.length,
            buildings: this.layers.buildings.length,
            units: this.layers.units.length,
            effects: this.layers.effects.length,
            cameraX: this.camera.x,
            cameraY: this.camera.y,
            cameraZoom: this.camera.zoom
        };
    }
}