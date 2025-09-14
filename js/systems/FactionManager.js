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
            // Command & Conquer: Red Alert 2 - Allied Forces
            {
                id: 'allies',
                name: 'Allied Forces',
                color: '#0066cc',
                description: 'Technology and precision warfare',
                playable: true,
                startingBuildings: {
                    'construction_yard': 1,
                    'power_plant': 1,
                    'ore_refinery': 1
                },
                startingUnits: {
                    'engineer': 1,
                    'chrono_miner': 1
                },
                startingResources: {
                    credits: 5000,
                    power: 100
                },
                bonuses: {
                    constructionSpeed: 1.0,
                    unitTrainingSpeed: 1.0,
                    techCost: 1.0,
                    repairSpeed: 1.2,
                    chronoTech: true
                },
                superweapons: ['chronosphere', 'weather_storm'],
                theme: {
                    primaryColor: '#0066cc',
                    secondaryColor: '#004499',
                    accentColor: '#66aaff'
                },
                units: [
                    // Infantry
                    'gi', 'engineer', 'guardian_gi', 'rocketeer', 'navy_seal', 'spy', 'chrono_legionnaire', 'tanya',
                    // Vehicles
                    'grizzly_tank', 'ifv', 'mirage_tank', 'battle_fortress', 'prism_tank', 'chrono_miner',
                    // Aircraft
                    'harrier', 'black_eagle',
                    // Naval
                    'destroyer', 'aegis_cruiser', 'aircraft_carrier', 'dolphin'
                ],
                buildings: [
                    'construction_yard', 'power_plant', 'ore_refinery', 'barracks', 'war_factory', 
                    'naval_yard', 'airforce_command', 'service_depot', 'ore_purifier', 'battle_lab',
                    'spy_satellite', 'chronosphere', 'weather_controller', 'patriot_missile', 
                    'prism_tower', 'gap_generator'
                ],
                techTree: {
                    tier1: ['barracks', 'war_factory', 'power_plant', 'ore_refinery'],
                    tier2: ['naval_yard', 'airforce_command', 'service_depot'],
                    tier3: ['battle_lab', 'spy_satellite'],
                    tier4: ['chronosphere', 'weather_controller']
                },
                lore: 'The Allied Forces represent the free nations of the world. Armed with advanced chronoshift technology, weather control, and prism weaponry, they fight to preserve democracy and freedom.'
            },
            // Command & Conquer: Red Alert 2 - Soviet Union
            {
                id: 'soviet',
                name: 'Soviet Union',
                color: '#cc0000',
                description: 'Raw firepower and heavy armor',
                playable: true,
                startingBuildings: {
                    'construction_yard': 1,
                    'tesla_reactor': 1,
                    'ore_refinery': 1
                },
                startingUnits: {
                    'engineer': 1,
                    'war_miner': 1
                },
                startingResources: {
                    credits: 5000,
                    power: 100
                },
                bonuses: {
                    constructionSpeed: 0.8,
                    unitTrainingSpeed: 1.2,
                    techCost: 1.1,
                    armorBonus: 1.3,
                    teslaTech: true
                },
                superweapons: ['nuclear_missile', 'iron_curtain'],
                theme: {
                    primaryColor: '#cc0000',
                    secondaryColor: '#990000',
                    accentColor: '#ff4444'
                },
                units: [
                    // Infantry
                    'conscript', 'engineer', 'tesla_trooper', 'flak_trooper', 'crazy_ivan', 'yuri', 'boris',
                    // Vehicles  
                    'rhino_tank', 'flak_track', 'v3_launcher', 'apocalypse_tank', 'terror_drone', 'war_miner',
                    // Aircraft
                    'kirov_airship',
                    // Naval
                    'typhoon_sub', 'sea_scorpion', 'giant_squid'
                ],
                buildings: [
                    'construction_yard', 'tesla_reactor', 'ore_refinery', 'barracks', 'war_factory',
                    'naval_yard', 'radar_tower', 'service_depot', 'battle_lab', 'nuclear_reactor',
                    'nuclear_silo', 'iron_curtain', 'cloning_vats', 'tesla_coil', 'flak_cannon',
                    'psychic_sensor'
                ],
                techTree: {
                    tier1: ['barracks', 'war_factory', 'tesla_reactor', 'ore_refinery'],
                    tier2: ['naval_yard', 'radar_tower', 'service_depot'],
                    tier3: ['battle_lab', 'nuclear_reactor'],
                    tier4: ['nuclear_silo', 'iron_curtain', 'cloning_vats']
                },
                lore: 'The Soviet Union commands the Red Army with overwhelming firepower, tesla technology, and nuclear weapons. Their heavy armor and devastating weapons crush all opposition.'
            },
            // Command & Conquer: Red Alert 2 - Yuri\'s Faction (Yuri\'s Revenge Expansion)
            {
                id: 'yuri',
                name: 'Yuri\'s Army',
                color: '#9900cc',
                description: 'Psychic warfare and mind control',
                playable: true,
                startingBuildings: {
                    'construction_yard': 1,
                    'bio_reactor': 1,
                    'slave_miner': 1
                },
                startingUnits: {
                    'engineer': 1,
                    'initiate': 3
                },
                startingResources: {
                    credits: 4500,
                    power: 120
                },
                bonuses: {
                    constructionSpeed: 1.1,
                    unitTrainingSpeed: 0.9,
                    techCost: 0.9,
                    psychicPower: true,
                    mindControl: true
                },
                superweapons: ['psychic_dominator', 'genetic_mutator'],
                theme: {
                    primaryColor: '#9900cc',
                    secondaryColor: '#6600aa',
                    accentColor: '#cc33ff'
                },
                units: [
                    // Infantry
                    'initiate', 'engineer', 'brute', 'yuri_clone', 'yuri_prime', 'slave',
                    // Vehicles
                    'lasher_tank', 'gattling_tank', 'magnetron', 'mastermind', 'floating_disc',
                    // Aircraft  
                    'boomer_sub',
                    // Naval
                    'boomer_sub'
                ],
                buildings: [
                    'construction_yard', 'bio_reactor', 'slave_miner', 'barracks', 'war_factory',
                    'sub_pen', 'radar_tower', 'grinder', 'battle_lab', 'cloning_vats',
                    'psychic_dominator', 'genetic_mutator', 'gattling_cannon', 'psychic_tower',
                    'tank_bunker'
                ],
                techTree: {
                    tier1: ['barracks', 'war_factory', 'bio_reactor', 'slave_miner'],
                    tier2: ['sub_pen', 'radar_tower', 'grinder'],
                    tier3: ['battle_lab', 'cloning_vats'],
                    tier4: ['psychic_dominator', 'genetic_mutator']
                },
                lore: 'Yuri\'s psychic army uses mind control technology, genetic manipulation, and floating disc aircraft. Through psychic domination, Yuri seeks to control all minds on Earth.'
            },
            // Neutral/Civilian faction
            {
                id: 'neutral',
                name: 'Neutral',
                color: '#888888',
                description: 'Civilian and neutral forces',
                playable: false,
                startingBuildings: {},
                startingUnits: {},
                startingResources: {
                    credits: 0,
                    power: 0
                },
                bonuses: {},
                superweapons: [],
                theme: {
                    primaryColor: '#888888',
                    secondaryColor: '#666666',
                    accentColor: '#aaaaaa'
                },
                units: ['civilian', 'technician'],
                buildings: ['civilian_building', 'tech_outpost', 'oil_derrick', 'airport'],
                techTree: {},
                lore: 'Neutral forces, civilians, and capturable structures found across the battlefield.'
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