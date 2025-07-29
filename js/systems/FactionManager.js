/**
 * Faction Manager for Scotty Mason's Revenge
 * Manages different factions and their properties
 */

class FactionManager {
    constructor() {
        this.factions = new Map();
        this.currentFaction = 'allies';
        
        // Event system
        this.eventListeners = {};
        
        console.log('🏛️ FactionManager initialized');
    }
    
    async initialize() {
        this.loadFactions();
        console.log('✅ FactionManager ready');
    }
    
    /**
     * Load faction definitions
     */
    loadFactions() {
        const factionDefinitions = [
            {
                id: 'allies',
                name: 'Allied Forces',
                color: '#0066cc',
                description: 'Technology and precision warfare',
                playable: true,
                startingBuildings: {
                    'construction_yard': 1,
                    'power_plant': 1,
                    'refinery': 1
                },
                startingUnits: {
                    'engineer': 1,
                    'harvester': 1
                },
                startingResources: {
                    credits: 5000,
                    power: 100
                },
                bonuses: {
                    constructionSpeed: 1.0,
                    unitTrainingSpeed: 1.0,
                    techCost: 1.0,
                    repairSpeed: 1.2
                },
                superweapon: 'chronosphere',
                theme: {
                    primaryColor: '#0066cc',
                    secondaryColor: '#004499',
                    accentColor: '#66aaff'
                },
                units: [
                    'engineer', 'gi', 'tank', 'harvester', 'helicopter', 'navy_seal'
                ],
                buildings: [
                    'construction_yard', 'power_plant', 'refinery', 'barracks', 
                    'war_factory', 'tech_center', 'defense_turret'
                ],
                lore: 'The Allied Forces represent the free nations of the world, united in their fight against tyranny. They excel in advanced technology and precision strikes.'
            },
            {
                id: 'soviet',
                name: 'Soviet Union',
                color: '#cc0000',
                description: 'Raw firepower and heavy armor',
                playable: true,
                startingBuildings: {
                    'construction_yard': 1,
                    'power_plant': 1,
                    'refinery': 1
                },
                startingUnits: {
                    'engineer': 1,
                    'harvester': 1
                },
                startingResources: {
                    credits: 5000,
                    power: 100
                },
                bonuses: {
                    constructionSpeed: 0.8,
                    unitTrainingSpeed: 1.2,
                    techCost: 1.1,
                    armorBonus: 1.3
                },
                superweapon: 'nuclear_missile',
                theme: {
                    primaryColor: '#cc0000',
                    secondaryColor: '#990000',
                    accentColor: '#ff4444'
                },
                units: [
                    'engineer', 'conscript', 'tank', 'harvester', 'helicopter', 'tesla_trooper'
                ],
                buildings: [
                    'construction_yard', 'power_plant', 'refinery', 'barracks',
                    'war_factory', 'tech_center', 'defense_turret'
                ],
                lore: 'The Soviet Union relies on overwhelming firepower and resilient armor. Their units may be slower but pack devastating punch.'
            },
            {
                id: 'empire',
                name: 'Rising Sun Empire',
                color: '#cc6600',
                description: 'Advanced robotics and psionics',
                playable: true,
                startingBuildings: {
                    'construction_yard': 1,
                    'power_plant': 1,
                    'refinery': 1
                },
                startingUnits: {
                    'engineer': 1,
                    'harvester': 1
                },
                startingResources: {
                    credits: 4500,
                    power: 120
                },
                bonuses: {
                    constructionSpeed: 1.1,
                    unitTrainingSpeed: 0.9,
                    techCost: 0.9,
                    energyEfficiency: 1.2
                },
                superweapon: 'psionic_decimator',
                theme: {
                    primaryColor: '#cc6600',
                    secondaryColor: '#994400',
                    accentColor: '#ff9933'
                },
                units: [
                    'engineer', 'warrior', 'tank', 'harvester', 'helicopter', 'psychic'
                ],
                buildings: [
                    'construction_yard', 'power_plant', 'refinery', 'barracks',
                    'war_factory', 'tech_center', 'defense_turret'
                ],
                lore: 'The Rising Sun Empire combines ancient traditions with cutting-edge technology, utilizing psychic powers and advanced robotics.'
            },
            {
                id: 'confederation',
                name: 'European Confederation',
                color: '#9966cc',
                description: 'Balanced defense specialists',
                playable: true,
                startingBuildings: {
                    'construction_yard': 1,
                    'power_plant': 1,
                    'refinery': 1
                },
                startingUnits: {
                    'engineer': 1,
                    'harvester': 1
                },
                startingResources: {
                    credits: 5200,
                    power: 90
                },
                bonuses: {
                    constructionSpeed: 0.9,
                    unitTrainingSpeed: 1.0,
                    techCost: 1.0,
                    defenseBonus: 1.4
                },
                superweapon: 'weather_controller',
                theme: {
                    primaryColor: '#9966cc',
                    secondaryColor: '#6644aa',
                    accentColor: '#bb88ff'
                },
                units: [
                    'engineer', 'peacekeeper', 'tank', 'harvester', 'helicopter', 'guardian'
                ],
                buildings: [
                    'construction_yard', 'power_plant', 'refinery', 'barracks',
                    'war_factory', 'tech_center', 'defense_turret'
                ],
                lore: 'The European Confederation focuses on defensive strategies and maintaining peace through superior fortifications and tactical awareness.'
            },
            {
                id: 'neutral',
                name: 'Neutral',
                color: '#888888',
                description: 'Non-aligned forces',
                playable: false,
                startingBuildings: {},
                startingUnits: {},
                startingResources: {
                    credits: 0,
                    power: 0
                },
                bonuses: {},
                superweapon: null,
                theme: {
                    primaryColor: '#888888',
                    secondaryColor: '#666666',
                    accentColor: '#aaaaaa'
                },
                units: [],
                buildings: [],
                lore: 'Neutral forces and civilian structures.'
            }
        ];
        
        factionDefinitions.forEach(faction => {
            this.factions.set(faction.id, faction);
        });
        
        console.log(`🏛️ Loaded ${this.factions.size} factions`);
    }
    
    /**
     * Get faction by ID
     */
    getFaction(factionId) {
        return this.factions.get(factionId);
    }
    
    /**
     * Get all factions
     */
    getAllFactions() {
        return Array.from(this.factions.values());
    }
    
    /**
     * Get playable factions
     */
    getPlayableFactions() {
        return Array.from(this.factions.values()).filter(faction => faction.playable);
    }
    
    /**
     * Get faction color
     */
    getFactionColor(factionId) {
        const faction = this.getFaction(factionId);
        return faction ? faction.color : '#888888';
    }
    
    /**
     * Get faction theme
     */
    getFactionTheme(factionId) {
        const faction = this.getFaction(factionId);
        return faction ? faction.theme : {
            primaryColor: '#888888',
            secondaryColor: '#666666',
            accentColor: '#aaaaaa'
        };
    }
    
    /**
     * Get faction name
     */
    getFactionName(factionId) {
        const faction = this.getFaction(factionId);
        return faction ? faction.name : 'Unknown Faction';
    }
    
    /**
     * Get faction description
     */
    getFactionDescription(factionId) {
        const faction = this.getFaction(factionId);
        return faction ? faction.description : '';
    }
    
    /**
     * Get faction lore
     */
    getFactionLore(factionId) {
        const faction = this.getFaction(factionId);
        return faction ? faction.lore : '';
    }
    
    /**
     * Get starting buildings for faction
     */
    getStartingBuildings(factionId) {
        const faction = this.getFaction(factionId);
        return faction ? faction.startingBuildings : {};
    }
    
    /**
     * Get starting units for faction
     */
    getStartingUnits(factionId) {
        const faction = this.getFaction(factionId);
        return faction ? faction.startingUnits : {};
    }
    
    /**
     * Get starting resources for faction
     */
    getStartingResources(factionId) {
        const faction = this.getFaction(factionId);
        return faction ? faction.startingResources : { credits: 0, power: 0 };
    }
    
    /**
     * Get faction bonuses
     */
    getFactionBonuses(factionId) {
        const faction = this.getFaction(factionId);
        return faction ? faction.bonuses : {};
    }
    
    /**
     * Get faction superweapon
     */
    getFactionSuperweapon(factionId) {
        const faction = this.getFaction(factionId);
        return faction ? faction.superweapon : null;
    }
    
    /**
     * Get available units for faction
     */
    getFactionUnits(factionId) {
        const faction = this.getFaction(factionId);
        return faction ? faction.units : [];
    }
    
    /**
     * Get available buildings for faction
     */
    getFactionBuildings(factionId) {
        const faction = this.getFaction(factionId);
        return faction ? faction.buildings : [];
    }
    
    /**
     * Check if faction can build unit
     */
    canFactionBuildUnit(factionId, unitType) {
        const faction = this.getFaction(factionId);
        if (!faction) return false;
        
        return faction.units.includes(unitType);
    }
    
    /**
     * Check if faction can build building
     */
    canFactionBuildBuilding(factionId, buildingType) {
        const faction = this.getFaction(factionId);
        if (!faction) return false;
        
        return faction.buildings.includes(buildingType);
    }
    
    /**
     * Get enemy factions
     */
    getEnemyFactions(factionId) {
        const allFactions = this.getPlayableFactions();
        return allFactions.filter(faction => faction.id !== factionId).map(faction => faction.id);
    }
    
    /**
     * Check if factions are enemies
     */
    areFactionsEnemies(faction1, faction2) {
        if (faction1 === faction2) return false;
        if (faction1 === 'neutral' || faction2 === 'neutral') return false;
        
        // In this simplified system, all non-neutral factions are enemies
        return true;
    }
    
    /**
     * Check if factions are allies
     */
    areFactionsAllies(faction1, faction2) {
        return faction1 === faction2;
    }
    
    /**
     * Apply faction bonuses to unit
     */
    applyFactionBonuses(unit, factionId) {
        const bonuses = this.getFactionBonuses(factionId);
        
        if (bonuses.armorBonus) {
            unit.armor = Math.floor(unit.armor * bonuses.armorBonus);
        }
        
        if (bonuses.damageBonus) {
            unit.damage = Math.floor(unit.damage * bonuses.damageBonus);
        }
        
        if (bonuses.speedBonus) {
            unit.speed = Math.floor(unit.speed * bonuses.speedBonus);
        }
        
        if (bonuses.healthBonus) {
            unit.health = Math.floor(unit.health * bonuses.healthBonus);
            unit.maxHealth = unit.health;
        }
    }
    
    /**
     * Apply faction bonuses to building
     */
    applyFactionBonuses(building, factionId) {
        const bonuses = this.getFactionBonuses(factionId);
        
        if (bonuses.constructionSpeed && building.isConstructing) {
            building.constructionTime = Math.floor(building.constructionTime / bonuses.constructionSpeed);
        }
        
        if (bonuses.defenseBonus && building.isDefense) {
            building.damage = Math.floor(building.damage * bonuses.defenseBonus);
            building.health = Math.floor(building.health * bonuses.defenseBonus);
            building.maxHealth = building.health;
        }
        
        if (bonuses.energyEfficiency && building.powerGeneration > 0) {
            building.powerGeneration = Math.floor(building.powerGeneration * bonuses.energyEfficiency);
        }
    }
    
    /**
     * Get faction tech tree
     */
    getFactionTechTree(factionId) {
        // Simplified tech tree - would be more complex in full implementation
        const faction = this.getFaction(factionId);
        if (!faction) return {};
        
        return {
            tier1: {
                buildings: ['barracks', 'power_plant', 'refinery'],
                units: ['engineer', 'gi', 'harvester']
            },
            tier2: {
                buildings: ['war_factory', 'defense_turret'],
                units: ['tank'],
                requires: ['barracks']
            },
            tier3: {
                buildings: ['tech_center'],
                units: ['helicopter', 'navy_seal'],
                requires: ['war_factory']
            },
            superweapons: {
                buildings: [faction.superweapon],
                requires: ['tech_center']
            }
        };
    }
    
    /**
     * Set current faction
     */
    setCurrentFaction(factionId) {
        if (this.factions.has(factionId)) {
            this.currentFaction = factionId;
            this.emit('factionChanged', factionId);
            console.log(`🏛️ Current faction set to ${this.getFactionName(factionId)}`);
        }
    }
    
    /**
     * Get current faction
     */
    getCurrentFaction() {
        return this.currentFaction;
    }
    
    /**
     * Get faction statistics
     */
    getFactionStatistics() {
        const stats = {
            totalFactions: this.factions.size,
            playableFactions: this.getPlayableFactions().length,
            currentFaction: this.currentFaction,
            factionList: Array.from(this.factions.keys())
        };
        
        return stats;
    }
    
    /**
     * Get faction matchups (for AI difficulty)
     */
    getFactionMatchups(faction1, faction2) {
        // Simplified matchup system
        const matchups = {
            'allies_vs_soviet': { advantage: 'allies', reason: 'Technology advantage' },
            'allies_vs_empire': { advantage: 'even', reason: 'Balanced matchup' },
            'soviet_vs_empire': { advantage: 'soviet', reason: 'Armor advantage' },
            'confederation_vs_allies': { advantage: 'confederation', reason: 'Defensive superiority' }
        };
        
        const key = `${faction1}_vs_${faction2}`;
        const reverseKey = `${faction2}_vs_${faction1}`;
        
        return matchups[key] || matchups[reverseKey] || { advantage: 'even', reason: 'Unknown matchup' };
    }
    
    /**
     * Get recommended strategies for faction
     */
    getFactionStrategies(factionId) {
        const strategies = {
            allies: [
                'Focus on technology upgrades early',
                'Use precision strikes against key targets', 
                'Maintain superior air power',
                'Build defensive positions with repair units'
            ],
            soviet: [
                'Mass produce heavy units',
                'Use overwhelming firepower',
                'Focus on armor and durability',
                'Control resource points aggressively'
            ],
            empire: [
                'Utilize psychic units for battlefield control',
                'Build advanced robotics early',
                'Focus on energy efficiency',
                'Use mobility to outmaneuver enemies'
            ],
            confederation: [
                'Build strong defensive positions',
                'Use weather control strategically',
                'Focus on balanced unit composition',
                'Maintain superior logistics'
            ]
        };
        
        return strategies[factionId] || ['Adapt to battlefield conditions'];
    }
    
    /**
     * Reset faction manager
     */
    reset() {
        this.currentFaction = 'allies';
        this.emit('factionReset');
        console.log('🏛️ FactionManager reset');
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
                console.error(`Error in FactionManager event listener for ${event}:`, error);
            }
        });
    }
}