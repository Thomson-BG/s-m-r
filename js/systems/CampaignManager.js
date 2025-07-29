/**
 * Campaign Manager for Scotty Mason's Revenge
 * Manages campaign missions and story progression
 */

class CampaignManager {
    constructor() {
        this.campaigns = new Map();
        this.currentCampaign = null;
        this.currentMission = null;
        this.completedMissions = new Set();
        this.campaignProgress = {};
        
        // Mission state
        this.objectives = [];
        this.missionStartTime = 0;
        this.missionTimer = 0;
        
        // Event system
        this.eventListeners = {};
        
        console.log('📖 CampaignManager initialized');
    }
    
    async initialize() {
        this.loadCampaigns();
        console.log('✅ CampaignManager ready');
    }
    
    /**
     * Load campaign definitions
     */
    loadCampaigns() {
        const campaignDefinitions = [
            {
                id: 'allies_campaign',
                name: 'Allied Campaign: Operation Eagle Strike',
                faction: 'allies',
                description: 'Lead the Allied forces in their fight for freedom',
                difficulty: 'normal',
                missions: [
                    {
                        id: 'allies_01',
                        name: 'First Steps',
                        description: 'Establish your base and train basic units',
                        objectives: [
                            { type: 'build', target: 'power_plant', count: 2, required: true },
                            { type: 'train', target: 'gi', count: 5, required: true },
                            { type: 'collect', target: 'credits', count: 2000, required: false }
                        ],
                        startingUnits: { engineer: 1, harvester: 1 },
                        startingBuildings: { construction_yard: 1, power_plant: 1 },
                        startingCredits: 3000,
                        timeLimit: 900, // 15 minutes
                        difficulty: 'easy',
                        briefing: 'Commander, establish your base and prepare your forces. The enemy is approaching.',
                        debriefing: 'Excellent work, Commander. Your base is now operational.'
                    },
                    {
                        id: 'allies_02', 
                        name: 'Defensive Operations',
                        description: 'Defend your base against enemy attacks',
                        objectives: [
                            { type: 'survive', duration: 600, required: true },
                            { type: 'build', target: 'defense_turret', count: 3, required: true },
                            { type: 'destroy', target: 'enemy_units', count: 20, required: false }
                        ],
                        startingUnits: { engineer: 1, gi: 3, tank: 1 },
                        startingBuildings: { construction_yard: 1, power_plant: 2, barracks: 1 },
                        startingCredits: 5000,
                        timeLimit: 1200, // 20 minutes
                        difficulty: 'normal',
                        briefing: 'Enemy forces are massing for an attack. Build defenses and hold your ground.',
                        debriefing: 'The enemy assault has been repelled. Well done, Commander.'
                    },
                    {
                        id: 'allies_03',
                        name: 'Strike Force',
                        description: 'Launch an offensive against enemy positions',
                        objectives: [
                            { type: 'destroy', target: 'enemy_base', count: 1, required: true },
                            { type: 'train', target: 'tank', count: 8, required: true },
                            { type: 'capture', target: 'tech_center', count: 1, required: false }
                        ],
                        startingUnits: { engineer: 2, gi: 5, tank: 2 },
                        startingBuildings: { construction_yard: 1, power_plant: 2, barracks: 1, war_factory: 1 },
                        startingCredits: 8000,
                        timeLimit: 1800, // 30 minutes
                        difficulty: 'hard',
                        briefing: 'Time to take the fight to the enemy. Destroy their base and secure the area.',
                        debriefing: 'Outstanding! The enemy stronghold has been eliminated.'
                    }
                ]
            },
            {
                id: 'soviet_campaign',
                name: 'Soviet Campaign: Red Revolution',
                faction: 'soviet',
                description: 'Crush the capitalist forces with Soviet might',
                difficulty: 'normal',
                missions: [
                    {
                        id: 'soviet_01',
                        name: 'Iron Fist',
                        description: 'Establish Soviet dominance in the region',
                        objectives: [
                            { type: 'build', target: 'war_factory', count: 1, required: true },
                            { type: 'train', target: 'tank', count: 6, required: true },
                            { type: 'destroy', target: 'allied_forces', count: 15, required: true }
                        ],
                        startingUnits: { engineer: 1, conscript: 3 },
                        startingBuildings: { construction_yard: 1, power_plant: 1, barracks: 1 },
                        startingCredits: 4000,
                        timeLimit: 1200,
                        difficulty: 'normal',
                        briefing: 'Comrade Commander, show these capitalists the power of the Soviet war machine!',
                        debriefing: 'Victory is ours! The region is now under Soviet control.'
                    }
                ]
            },
            {
                id: 'empire_campaign',
                name: 'Empire Campaign: Rising Dawn',
                faction: 'empire',
                description: 'Expand the Empire\'s influence through advanced technology',
                difficulty: 'hard',
                missions: [
                    {
                        id: 'empire_01',
                        name: 'Technological Supremacy',
                        description: 'Demonstrate the Empire\'s advanced capabilities',
                        objectives: [
                            { type: 'build', target: 'tech_center', count: 1, required: true },
                            { type: 'research', target: 'psychic_tech', count: 1, required: true },
                            { type: 'train', target: 'psychic', count: 3, required: false }
                        ],
                        startingUnits: { engineer: 1, warrior: 2 },
                        startingBuildings: { construction_yard: 1, power_plant: 2 },
                        startingCredits: 6000,
                        timeLimit: 1500,
                        difficulty: 'hard',
                        briefing: 'Honor demands we show our technological superiority to these barbarians.',
                        debriefing: 'The Empire\'s technology proves superior once again.'
                    }
                ]
            }
        ];
        
        campaignDefinitions.forEach(campaign => {
            this.campaigns.set(campaign.id, campaign);
        });
        
        console.log(`📖 Loaded ${this.campaigns.size} campaigns`);
    }
    
    /**
     * Get campaign by ID
     */
    getCampaign(campaignId) {
        return this.campaigns.get(campaignId);
    }
    
    /**
     * Get all campaigns
     */
    getAllCampaigns() {
        return Array.from(this.campaigns.values());
    }
    
    /**
     * Get campaigns for faction
     */
    getCampaignsForFaction(faction) {
        return Array.from(this.campaigns.values()).filter(campaign => campaign.faction === faction);
    }
    
    /**
     * Start campaign
     */
    startCampaign(campaignId) {
        const campaign = this.getCampaign(campaignId);
        if (!campaign) {
            console.error(`Campaign not found: ${campaignId}`);
            return false;
        }
        
        this.currentCampaign = campaign;
        this.campaignProgress[campaignId] = {
            currentMissionIndex: 0,
            completedMissions: [],
            startTime: Date.now()
        };
        
        // Start first mission
        if (campaign.missions.length > 0) {
            this.startMission(campaign.missions[0]);
        }
        
        this.emit('campaignStarted', campaign);
        console.log(`📖 Started campaign: ${campaign.name}`);
        
        return true;
    }
    
    /**
     * Start mission
     */
    startMission(mission) {
        if (!mission) return false;
        
        this.currentMission = mission;
        this.objectives = mission.objectives.map(obj => ({
            ...obj,
            completed: false,
            progress: 0
        }));
        
        this.missionStartTime = Date.now();
        this.missionTimer = 0;
        
        // Setup mission
        this.setupMission(mission);
        
        this.emit('missionStarted', mission);
        console.log(`📖 Started mission: ${mission.name}`);
        
        return true;
    }
    
    /**
     * Setup mission environment
     */
    setupMission(mission) {
        // Clear existing game state
        if (window.gameEngine) {
            window.gameEngine.resourceManager.reset();
            window.gameEngine.unitManager.reset();
            window.gameEngine.buildingManager.reset();
        }
        
        // Set starting resources
        if (window.gameEngine.resourceManager) {
            window.gameEngine.resourceManager.setCredits(mission.startingCredits || 5000);
        }
        
        // Create starting buildings
        if (mission.startingBuildings) {
            let buildingX = 350;
            let buildingY = 250;
            
            for (const [buildingType, count] of Object.entries(mission.startingBuildings)) {
                for (let i = 0; i < count; i++) {
                    window.gameEngine.buildingManager.createBuilding(buildingType, {
                        x: buildingX,
                        y: buildingY,
                        faction: this.currentCampaign.faction
                    });
                    
                    buildingX += 100;
                    if (buildingX > 600) {
                        buildingX = 350;
                        buildingY += 100;
                    }
                }
            }
        }
        
        // Create starting units
        if (mission.startingUnits) {
            let unitX = 400;
            let unitY = 400;
            
            for (const [unitType, count] of Object.entries(mission.startingUnits)) {
                for (let i = 0; i < count; i++) {
                    window.gameEngine.unitManager.createUnit(unitType, {
                        x: unitX,
                        y: unitY,
                        faction: this.currentCampaign.faction
                    });
                    
                    unitX += 30;
                    if (unitX > 600) {
                        unitX = 400;
                        unitY += 30;
                    }
                }
            }
        }
        
        // Create enemy forces (simplified)
        this.createEnemyForces(mission);
        
        console.log(`📖 Mission setup complete: ${mission.name}`);
    }
    
    /**
     * Create enemy forces for mission
     */
    createEnemyForces(mission) {
        // Simplified enemy creation
        const enemyFaction = this.currentCampaign.faction === 'allies' ? 'soviet' : 'allies';
        
        // Create enemy base
        window.gameEngine.buildingManager.createBuilding('construction_yard', {
            x: 1000,
            y: 200,
            faction: enemyFaction
        });
        
        window.gameEngine.buildingManager.createBuilding('power_plant', {
            x: 950,
            y: 150,
            faction: enemyFaction
        });
        
        // Create enemy units
        for (let i = 0; i < 5; i++) {
            window.gameEngine.unitManager.createUnit('gi', {
                x: 1000 + i * 25,
                y: 300,
                faction: enemyFaction
            });
        }
        
        for (let i = 0; i < 2; i++) {
            window.gameEngine.unitManager.createUnit('tank', {
                x: 950 + i * 50,
                y: 350,
                faction: enemyFaction
            });
        }
    }
    
    /**
     * Update mission progress
     */
    update(deltaTime) {
        if (!this.currentMission) return;
        
        this.missionTimer += deltaTime;
        
        // Check objectives
        for (const objective of this.objectives) {
            if (objective.completed) continue;
            
            this.checkObjective(objective);
        }
        
        // Check mission completion
        this.checkMissionCompletion();
        
        // Check time limit
        if (this.currentMission.timeLimit && this.missionTimer >= this.currentMission.timeLimit) {
            this.failMission('Time limit exceeded');
        }
    }
    
    /**
     * Check individual objective
     */
    checkObjective(objective) {
        let progress = 0;
        let completed = false;
        
        switch (objective.type) {
            case 'build':
                if (window.gameEngine.buildingManager) {
                    const buildings = window.gameEngine.buildingManager.getBuildingsByType(objective.target)
                        .filter(b => b.faction === this.currentCampaign.faction && !b.isConstructing);
                    progress = buildings.length;
                    completed = progress >= objective.count;
                }
                break;
                
            case 'train':
                if (window.gameEngine.unitManager) {
                    const units = window.gameEngine.unitManager.getUnitsByType(objective.target)
                        .filter(u => u.faction === this.currentCampaign.faction);
                    progress = units.length;
                    completed = progress >= objective.count;
                }
                break;
                
            case 'collect':
                if (objective.target === 'credits' && window.gameEngine.resourceManager) {
                    progress = window.gameEngine.resourceManager.getCredits();
                    completed = progress >= objective.count;
                }
                break;
                
            case 'destroy':
                // Would need to track destroyed enemies
                progress = 0; // Simplified
                completed = false;
                break;
                
            case 'survive':
                progress = this.missionTimer;
                completed = progress >= objective.duration;
                break;
                
            case 'capture':
                // Would need capture mechanic
                progress = 0; // Simplified
                completed = false;
                break;
                
            case 'research':
                // Would need research system
                progress = 0; // Simplified
                completed = false;
                break;
        }
        
        objective.progress = progress;
        
        if (completed && !objective.completed) {
            objective.completed = true;
            this.emit('objectiveCompleted', objective);
            console.log(`📖 Objective completed: ${objective.type} ${objective.target}`);
        }
    }
    
    /**
     * Check mission completion
     */
    checkMissionCompletion() {
        const requiredObjectives = this.objectives.filter(obj => obj.required);
        const completedRequired = requiredObjectives.filter(obj => obj.completed);
        
        if (completedRequired.length === requiredObjectives.length) {
            this.completeMission();
        }
    }
    
    /**
     * Complete current mission
     */
    completeMission() {
        if (!this.currentMission || !this.currentCampaign) return;
        
        const missionId = this.currentMission.id;
        this.completedMissions.add(missionId);
        
        // Update campaign progress
        if (this.campaignProgress[this.currentCampaign.id]) {
            this.campaignProgress[this.currentCampaign.id].completedMissions.push(missionId);
            this.campaignProgress[this.currentCampaign.id].currentMissionIndex++;
        }
        
        // Calculate score
        const score = this.calculateMissionScore();
        
        this.emit('missionCompleted', {
            mission: this.currentMission,
            score: score,
            timeElapsed: this.missionTimer
        });
        
        console.log(`📖 Mission completed: ${this.currentMission.name} (Score: ${score})`);
        
        // Check if campaign is complete
        const progress = this.campaignProgress[this.currentCampaign.id];
        if (progress.currentMissionIndex >= this.currentCampaign.missions.length) {
            this.completeCampaign();
        } else {
            // Advance to next mission
            const nextMission = this.currentCampaign.missions[progress.currentMissionIndex];
            if (nextMission) {
                setTimeout(() => {
                    this.startMission(nextMission);
                }, 3000); // 3 second delay
            }
        }
    }
    
    /**
     * Fail current mission
     */
    failMission(reason = 'Mission failed') {
        if (!this.currentMission) return;
        
        this.emit('missionFailed', {
            mission: this.currentMission,
            reason: reason,
            timeElapsed: this.missionTimer
        });
        
        console.log(`📖 Mission failed: ${this.currentMission.name} - ${reason}`);
        
        // Allow retry
        setTimeout(() => {
            this.startMission(this.currentMission);
        }, 5000);
    }
    
    /**
     * Complete current campaign
     */
    completeCampaign() {
        if (!this.currentCampaign) return;
        
        this.emit('campaignCompleted', {
            campaign: this.currentCampaign,
            totalTime: Date.now() - this.campaignProgress[this.currentCampaign.id].startTime
        });
        
        console.log(`📖 Campaign completed: ${this.currentCampaign.name}`);
    }
    
    /**
     * Calculate mission score
     */
    calculateMissionScore() {
        let score = 1000; // Base score
        
        // Time bonus
        if (this.currentMission.timeLimit) {
            const timeRatio = this.missionTimer / this.currentMission.timeLimit;
            score += Math.floor((1 - timeRatio) * 500);
        }
        
        // Objective bonus
        const optionalCompleted = this.objectives.filter(obj => !obj.required && obj.completed);
        score += optionalCompleted.length * 200;
        
        // Difficulty bonus
        switch (this.currentMission.difficulty) {
            case 'easy': break;
            case 'normal': score *= 1.2; break;
            case 'hard': score *= 1.5; break;
            case 'brutal': score *= 2.0; break;
        }
        
        return Math.floor(score);
    }
    
    /**
     * Get current mission status
     */
    getCurrentMissionStatus() {
        if (!this.currentMission) return null;
        
        return {
            mission: this.currentMission,
            objectives: this.objectives,
            timeElapsed: this.missionTimer,
            timeRemaining: this.currentMission.timeLimit ? 
                Math.max(0, this.currentMission.timeLimit - this.missionTimer) : null,
            requiredComplete: this.objectives.filter(obj => obj.required && obj.completed).length,
            requiredTotal: this.objectives.filter(obj => obj.required).length,
            optionalComplete: this.objectives.filter(obj => !obj.required && obj.completed).length,
            optionalTotal: this.objectives.filter(obj => !obj.required).length
        };
    }
    
    /**
     * Get campaign progress
     */
    getCampaignProgress(campaignId = null) {
        const id = campaignId || (this.currentCampaign ? this.currentCampaign.id : null);
        if (!id) return null;
        
        return this.campaignProgress[id] || null;
    }
    
    /**
     * Get all campaign progress
     */
    getAllProgress() {
        return { ...this.campaignProgress };
    }
    
    /**
     * Reset campaign progress
     */
    resetProgress(campaignId = null) {
        if (campaignId) {
            delete this.campaignProgress[campaignId];
            this.completedMissions.clear();
        } else {
            this.campaignProgress = {};
            this.completedMissions.clear();
        }
        
        this.emit('progressReset', campaignId);
        console.log('📖 Campaign progress reset');
    }
    
    /**
     * Get current progress
     */
    get currentProgress() {
        return this.campaignProgress;
    }
    
    /**
     * Get save data
     */
    getSaveData() {
        return {
            campaignProgress: this.campaignProgress,
            completedMissions: Array.from(this.completedMissions),
            currentCampaign: this.currentCampaign ? this.currentCampaign.id : null,
            currentMission: this.currentMission ? this.currentMission.id : null
        };
    }
    
    /**
     * Load save data
     */
    loadSaveData(data) {
        if (data.campaignProgress) {
            this.campaignProgress = data.campaignProgress;
        }
        
        if (data.completedMissions) {
            this.completedMissions = new Set(data.completedMissions);
        }
        
        if (data.currentCampaign) {
            this.currentCampaign = this.getCampaign(data.currentCampaign);
        }
        
        if (data.currentMission && this.currentCampaign) {
            this.currentMission = this.currentCampaign.missions.find(m => m.id === data.currentMission);
        }
        
        console.log('📖 Campaign progress loaded');
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
                console.error(`Error in CampaignManager event listener for ${event}:`, error);
            }
        });
    }
}