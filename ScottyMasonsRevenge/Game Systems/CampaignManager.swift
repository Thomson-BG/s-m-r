import Foundation
import SceneKit

// MARK: - Campaign Manager

class CampaignManager {
    static let shared = CampaignManager()
    
    private var campaigns: [Faction: Campaign] = [:]
    private(set) var currentCampaign: Campaign?
    private(set) var currentMission: Mission?
    private(set) var currentProgress: CampaignProgress = CampaignProgress()
    
    // Mission state
    private var missionObjectives: [MissionObjective] = []
    private var completedObjectives: Set<UUID> = []
    private var missionTimer: Float = 0.0
    
    private init() {}
    
    func initialize() {
        loadCampaigns()
        print("📜 Campaign Manager initialized with \(campaigns.count) campaigns")
    }
    
    func loadCampaigns() {
        // Create campaigns for each faction
        campaigns[.allies] = createAlliedCampaign()
        campaigns[.soviets] = createSovietCampaign()
        campaigns[.empire] = createEmpireCampaign()
        campaigns[.confederation] = createConfederationCampaign()
        campaigns[.republic] = createRepublicCampaign()
        campaigns[.federation] = createFederationCampaign()
        campaigns[.coalition] = createCoalitionCampaign()
        campaigns[.syndicate] = createSyndicateCampaign()
        campaigns[.resistance] = createResistanceCampaign()
    }
    
    // MARK: - Campaign Management
    
    func startCampaign(for faction: Faction) {
        guard let campaign = campaigns[faction] else {
            print("❌ No campaign found for faction: \(faction)")
            return
        }
        
        currentCampaign = campaign
        currentProgress = CampaignProgress()
        
        // Start first mission
        startMission(campaign.missions.first!)
        
        print("🚀 Started \(campaign.name) campaign")
    }
    
    func startMission(_ mission: Mission) {
        currentMission = mission
        missionObjectives = mission.objectives
        completedObjectives.removeAll()
        missionTimer = 0.0
        
        // Setup mission environment
        setupMissionEnvironment(mission)
        
        // Setup objectives
        setupMissionObjectives(mission.objectives)
        
        print("🎯 Mission started: \(mission.name)")
        
        // Notify UI
        NotificationCenter.default.post(
            name: Notification.Name("MissionStarted"),
            object: mission
        )
    }
    
    private func setupMissionEnvironment(_ mission: Mission) {
        // Reset game state
        UnitManager.shared.clearAll()
        BuildingManager.shared.clearAll()
        ResourceManager.shared.reset()
        
        // Set initial resources
        ResourceManager.shared.addCredits(mission.startingResources.credits)
        
        // Place initial units
        for (unitType, count) in mission.startingUnits {
            for i in 0..<count {
                let unit = UnitManager.shared.createUnit(unitType, for: mission.playerFaction)
                let position = mission.startingPosition.adding(
                    SCNVector3(Float(i % 5) * 2.0, 0, Float(i / 5) * 2.0)
                )
                UnitManager.shared.deployUnit(unit, at: position)
            }
        }
        
        // Place initial buildings
        for (buildingType, count) in mission.startingBuildings {
            for i in 0..<count {
                let building = BuildingManager.shared.createBuilding(buildingType, for: mission.playerFaction)
                let position = mission.startingPosition.adding(
                    SCNVector3(Float(i) * 5.0, 0, -5.0)
                )
                BuildingManager.shared.placeBuilding(building, at: position)
            }
        }
        
        // Setup enemy forces
        setupEnemyForces(mission)
        
        // Setup neutral structures
        setupNeutralStructures(mission)
    }
    
    private func setupEnemyForces(_ mission: Mission) {
        for enemyForce in mission.enemyForces {
            // Place enemy buildings
            for (buildingType, count) in enemyForce.buildings {
                for i in 0..<count {
                    let building = BuildingManager.shared.createBuilding(buildingType, for: enemyForce.faction)
                    let position = enemyForce.position.adding(
                        SCNVector3(Float(i % 3) * 4.0, 0, Float(i / 3) * 4.0)
                    )
                    BuildingManager.shared.placeBuilding(building, at: position)
                }
            }
            
            // Place enemy units
            for (unitType, count) in enemyForce.units {
                for i in 0..<count {
                    let unit = UnitManager.shared.createUnit(unitType, for: enemyForce.faction)
                    let position = enemyForce.position.adding(
                        SCNVector3(Float(i % 4) * 2.5, 0, Float(i / 4) * 2.5)
                    )
                    UnitManager.shared.deployUnit(unit, at: position)
                }
            }
        }
    }
    
    private func setupNeutralStructures(_ mission: Mission) {
        for structure in mission.neutralStructures {
            let building = BuildingManager.shared.createBuilding(structure.buildingType, for: .allies) // Neutral faction
            BuildingManager.shared.placeBuilding(building, at: structure.position)
        }
    }
    
    private func setupMissionObjectives(_ objectives: [MissionObjective]) {
        for objective in objectives {
            print("📋 Objective: \(objective.description)")
        }
    }
    
    // MARK: - Mission Progress
    
    func update(deltaTime: Float) {
        guard let mission = currentMission else { return }
        
        missionTimer += deltaTime
        
        // Check objectives
        checkObjectives()
        
        // Check mission conditions
        if checkMissionComplete() {
            completeMission()
        } else if checkMissionFailed() {
            failMission()
        }
        
        // Update AI for enemy forces
        updateEnemyAI(deltaTime)
    }
    
    private func checkObjectives() {
        for objective in missionObjectives {
            if !completedObjectives.contains(objective.id) && isObjectiveComplete(objective) {
                completeObjective(objective)
            }
        }
    }
    
    private func isObjectiveComplete(_ objective: MissionObjective) -> Bool {
        switch objective.type {
        case .destroyAllEnemies:
            let playerFaction = FactionManager.shared.getPlayerFaction()
            let enemyFactions = FactionManager.shared.getEnemyFactions(for: playerFaction)
            
            for faction in enemyFactions {
                let enemyUnits = UnitManager.shared.getUnits(for: faction)
                let enemyBuildings = BuildingManager.shared.getBuildings(for: faction)
                
                if !enemyUnits.isEmpty || !enemyBuildings.isEmpty {
                    return false
                }
            }
            return true
            
        case .destroyTarget(let targetId):
            // Check if specific target is destroyed
            return !BuildingManager.shared.getAllBuildings().contains { $0.id.uuidString == targetId }
            
        case .captureBuilding(let buildingType):
            let playerBuildings = BuildingManager.shared.getBuildings(for: FactionManager.shared.getPlayerFaction())
            return playerBuildings.contains { $0.buildingType == buildingType }
            
        case .buildUnits(let unitType, let count):
            let playerUnits = UnitManager.shared.getUnits(for: FactionManager.shared.getPlayerFaction())
            let unitCount = playerUnits.filter { $0.unitType == unitType }.count
            return unitCount >= count
            
        case .surviveTime(let duration):
            return missionTimer >= duration
            
        case .collectResources(let amount):
            return ResourceManager.shared.credits >= amount
            
        case .reachLocation(let position):
            let playerUnits = UnitManager.shared.getUnits(for: FactionManager.shared.getPlayerFaction())
            return playerUnits.contains { unit in
                unit.distanceToPosition(position) < 5.0
            }
        }
    }
    
    private func completeObjective(_ objective: MissionObjective) {
        completedObjectives.insert(objective.id)
        currentProgress.completedObjectives += 1
        
        print("✅ Objective completed: \(objective.description)")
        
        // Award bonus resources
        if objective.bonusResources.credits > 0 {
            ResourceManager.shared.addCredits(objective.bonusResources.credits)
        }
        
        // Notify UI
        NotificationCenter.default.post(
            name: Notification.Name("ObjectiveCompleted"),
            object: objective
        )
    }
    
    private func checkMissionComplete() -> Bool {
        guard let mission = currentMission else { return false }
        
        // Check if all primary objectives are complete
        let primaryObjectives = mission.objectives.filter { !$0.isOptional }
        return primaryObjectives.allSatisfy { completedObjectives.contains($0.id) }
    }
    
    private func checkMissionFailed() -> Bool {
        guard let mission = currentMission else { return false }
        
        // Check failure conditions
        for condition in mission.failureConditions {
            switch condition {
            case .allUnitsDestroyed:
                let playerUnits = UnitManager.shared.getUnits(for: mission.playerFaction)
                if playerUnits.isEmpty {
                    return true
                }
                
            case .baseDestroyed:
                let playerBuildings = BuildingManager.shared.getBuildings(for: mission.playerFaction)
                let hasConstructionYard = playerBuildings.contains { $0.buildingType == .constructionYard }
                if !hasConstructionYard {
                    return true
                }
                
            case .timeLimit(let duration):
                if missionTimer >= duration {
                    return true
                }
            }
        }
        
        return false
    }
    
    private func completeMission() {
        guard let mission = currentMission,
              let campaign = currentCampaign else { return }
        
        currentProgress.completedMissions += 1
        currentProgress.lastCompletedMission = mission.id
        
        print("🎉 Mission completed: \(mission.name)")
        
        // Unlock next mission
        if let nextMissionIndex = campaign.missions.firstIndex(where: { $0.id == mission.id }),
           nextMissionIndex + 1 < campaign.missions.count {
            let nextMission = campaign.missions[nextMissionIndex + 1]
            currentProgress.unlockedMissions.insert(nextMission.id)
        } else {
            // Campaign completed
            currentProgress.campaignCompleted = true
            print("🏆 Campaign completed: \(campaign.name)")
        }
        
        // Calculate score
        let score = calculateMissionScore(mission)
        currentProgress.totalScore += score
        
        // Notify UI
        NotificationCenter.default.post(
            name: Notification.Name("MissionCompleted"),
            object: ["mission": mission, "score": score]
        )
    }
    
    private func failMission() {
        guard let mission = currentMission else { return }
        
        print("💀 Mission failed: \(mission.name)")
        
        // Notify UI
        NotificationCenter.default.post(
            name: Notification.Name("MissionFailed"),
            object: mission
        )
    }
    
    private func calculateMissionScore(_ mission: Mission) -> Int {
        var score = 1000 // Base score
        
        // Time bonus
        let timeBonus = max(0, Int((mission.parTime - missionTimer) * 10))
        score += timeBonus
        
        // Objective bonus
        let optionalObjectives = mission.objectives.filter { $0.isOptional }
        let completedOptional = optionalObjectives.filter { completedObjectives.contains($0.id) }
        score += completedOptional.count * 500
        
        // Unit preservation bonus
        let remainingUnits = UnitManager.shared.getUnits(for: mission.playerFaction).count
        score += remainingUnits * 50
        
        return score
    }
    
    // MARK: - Enemy AI
    
    private func updateEnemyAI(_ deltaTime: Float) {
        // Simple AI behavior for enemy forces
        // This would be expanded with more sophisticated AI
        
        // For now, just make enemies attack periodically
        if Int(missionTimer) % 30 == 0 && Int(missionTimer * 10) % 10 == 0 {
            launchEnemyAttack()
        }
    }
    
    private func launchEnemyAttack() {
        guard let mission = currentMission else { return }
        
        // Find player buildings
        let playerBuildings = BuildingManager.shared.getBuildings(for: mission.playerFaction)
        guard let targetBuilding = playerBuildings.randomElement() else { return }
        
        // Send enemy units to attack
        for enemyForce in mission.enemyForces {
            let enemyUnits = UnitManager.shared.getUnits(for: enemyForce.faction)
            let attackingUnits = Array(enemyUnits.prefix(3)) // Send 3 units
            
            for unit in attackingUnits {
                unit.attackTarget(targetBuilding)
            }
        }
        
        print("🚨 Enemy attack launched!")
    }
    
    // MARK: - Save/Load
    
    func loadProgress(_ progress: CampaignProgress) {
        currentProgress = progress
        
        // Restore campaign state if needed
        if let campaignFaction = progress.currentCampaignFaction,
           let campaign = campaigns[campaignFaction] {
            currentCampaign = campaign
            
            // Restore current mission if in progress
            if let missionId = progress.currentMissionId,
               let mission = campaign.missions.first(where: { $0.id == missionId }) {
                currentMission = mission
            }
        }
    }
    
    // MARK: - Campaign Creation Methods
    
    private func createAlliedCampaign() -> Campaign {
        let missions = [
            createAlliedMission1(),
            createAlliedMission2(),
            createAlliedMission3(),
            createAlliedMission4(),
            createAlliedMission5()
        ]
        
        return Campaign(
            id: UUID(),
            name: "Allied Liberation",
            description: "Fight to restore freedom across the world",
            faction: .allies,
            missions: missions,
            difficulty: .medium
        )
    }
    
    private func createAlliedMission1() -> Mission {
        let objectives = [
            MissionObjective(
                id: UUID(),
                type: .buildUnits(.alliedSoldier, 5),
                description: "Train 5 Allied Soldiers",
                isOptional: false,
                bonusResources: Resources(credits: 500)
            ),
            MissionObjective(
                id: UUID(),
                type: .destroyAllEnemies,
                description: "Eliminate all Soviet forces",
                isOptional: false,
                bonusResources: Resources(credits: 1000)
            )
        ]
        
        let enemyForces = [
            EnemyForce(
                faction: .soviets,
                position: SCNVector3(50, 0, 50),
                units: [.conscript: 3, .rhinoTank: 1],
                buildings: [.barracks: 1, .powerPlant: 1]
            )
        ]
        
        return Mission(
            id: UUID(),
            name: "First Strike",
            description: "Your first mission against Soviet forces. Build up your base and eliminate the enemy.",
            playerFaction: .allies,
            startingPosition: SCNVector3(-50, 0, -50),
            startingResources: Resources(credits: 10000),
            startingUnits: [.engineer: 1, .alliedSoldier: 2],
            startingBuildings: [.constructionYard: 1, .powerPlant: 1],
            objectives: objectives,
            enemyForces: enemyForces,
            neutralStructures: [],
            failureConditions: [.baseDestroyed, .timeLimit(600)],
            parTime: 300.0,
            difficulty: .easy
        )
    }
    
    private func createAlliedMission2() -> Mission {
        let objectives = [
            MissionObjective(
                id: UUID(),
                type: .captureBuilding(.refinery),
                description: "Capture the Soviet refinery",
                isOptional: false,
                bonusResources: Resources(credits: 2000)
            ),
            MissionObjective(
                id: UUID(),
                type: .collectResources(15000),
                description: "Accumulate 15,000 credits",
                isOptional: true,
                bonusResources: Resources(credits: 1000)
            )
        ]
        
        let enemyForces = [
            EnemyForce(
                faction: .soviets,
                position: SCNVector3(80, 0, 30),
                units: [.conscript: 6, .flakTrooper: 2, .rhinoTank: 2],
                buildings: [.barracks: 1, .refinery: 1, .powerPlant: 2, .teslaCoil: 1]
            )
        ]
        
        return Mission(
            id: UUID(),
            name: "Resource War",
            description: "Secure vital resources by capturing the enemy refinery.",
            playerFaction: .allies,
            startingPosition: SCNVector3(-60, 0, -60),
            startingResources: Resources(credits: 12000),
            startingUnits: [.engineer: 2, .alliedSoldier: 4, .grizzlyTank: 1],
            startingBuildings: [.constructionYard: 1, .powerPlant: 1, .barracks: 1],
            objectives: objectives,
            enemyForces: enemyForces,
            neutralStructures: [
                NeutralStructure(buildingType: .refinery, position: SCNVector3(0, 0, 40))
            ],
            failureConditions: [.baseDestroyed, .timeLimit(900)],
            parTime: 450.0,
            difficulty: .medium
        )
    }
    
    private func createAlliedMission3() -> Mission {
        let objectives = [
            MissionObjective(
                id: UUID(),
                type: .destroyTarget("soviet_base_main"),
                description: "Destroy the Soviet main base",
                isOptional: false,
                bonusResources: Resources(credits: 3000)
            ),
            MissionObjective(
                id: UUID(),
                type: .surviveTime(300),
                description: "Survive for 5 minutes",
                isOptional: true,
                bonusResources: Resources(credits: 1500)
            )
        ]
        
        let enemyForces = [
            EnemyForce(
                faction: .soviets,
                position: SCNVector3(100, 0, 0),
                units: [.conscript: 8, .flakTrooper: 4, .rhinoTank: 3, .terrorDrone: 2],
                buildings: [.constructionYard: 1, .barracks: 2, .powerPlant: 3, .teslaCoil: 2, .nuclearReactor: 1]
            )
        ]
        
        return Mission(
            id: UUID(),
            name: "Assault on Red Base",
            description: "Launch a full assault on the heavily fortified Soviet base.",
            playerFaction: .allies,
            startingPosition: SCNVector3(-80, 0, -80),
            startingResources: Resources(credits: 15000),
            startingUnits: [.engineer: 2, .alliedSoldier: 6, .grizzlyTank: 2, .rocketeeer: 3],
            startingBuildings: [.constructionYard: 1, .powerPlant: 2, .barracks: 1],
            objectives: objectives,
            enemyForces: enemyForces,
            neutralStructures: [],
            failureConditions: [.baseDestroyed, .timeLimit(1200)],
            parTime: 600.0,
            difficulty: .hard
        )
    }
    
    private func createAlliedMission4() -> Mission {
        let objectives = [
            MissionObjective(
                id: UUID(),
                type: .buildUnits(.chronoLegionnaire, 3),
                description: "Train 3 Chrono Legionnaires",
                isOptional: false,
                bonusResources: Resources(credits: 2000)
            ),
            MissionObjective(
                id: UUID(),
                type: .destroyAllEnemies,
                description: "Eliminate all enemy forces",
                isOptional: false,
                bonusResources: Resources(credits: 5000)
            )
        ]
        
        let enemyForces = [
            EnemyForce(
                faction: .soviets,
                position: SCNVector3(70, 0, 70),
                units: [.conscript: 10, .flakTrooper: 6, .apocalypseTank: 2, .kirovAirship: 1],
                buildings: [.constructionYard: 1, .barracks: 2, .powerPlant: 4, .nuclearReactor: 2, .teslaCoil: 3]
            ),
            EnemyForce(
                faction: .empire,
                position: SCNVector3(-70, 0, 70),
                units: [.imperialWarrior: 8, .archer: 4, .tsunamiTank: 2],
                buildings: [.barracks: 1, .powerPlant: 2, .waveForceGun: 2]
            )
        ]
        
        return Mission(
            id: UUID(),
            name: "Chronotech Deployment",
            description: "Deploy advanced chronotechnology against multiple enemy factions.",
            playerFaction: .allies,
            startingPosition: SCNVector3(-100, 0, -100),
            startingResources: Resources(credits: 20000),
            startingUnits: [.engineer: 3, .alliedSoldier: 8, .grizzlyTank: 3, .mirage: 2],
            startingBuildings: [.constructionYard: 1, .powerPlant: 2, .barracks: 1],
            objectives: objectives,
            enemyForces: enemyForces,
            neutralStructures: [],
            failureConditions: [.baseDestroyed, .timeLimit(1500)],
            parTime: 900.0,
            difficulty: .hard
        )
    }
    
    private func createAlliedMission5() -> Mission {
        let objectives = [
            MissionObjective(
                id: UUID(),
                type: .destroyTarget("soviet_superweapon"),
                description: "Destroy the Soviet superweapon",
                isOptional: false,
                bonusResources: Resources(credits: 10000)
            ),
            MissionObjective(
                id: UUID(),
                type: .surviveTime(600),
                description: "Survive the assault for 10 minutes",
                isOptional: true,
                bonusResources: Resources(credits: 5000)
            )
        ]
        
        let enemyForces = [
            EnemyForce(
                faction: .soviets,
                position: SCNVector3(120, 0, 0),
                units: [.conscript: 15, .flakTrooper: 10, .apocalypseTank: 5, .kirovAirship: 3, .terrorDrone: 8],
                buildings: [.constructionYard: 2, .barracks: 3, .powerPlant: 6, .nuclearReactor: 3, .teslaCoil: 5, .ironCurtain: 1]
            )
        ]
        
        return Mission(
            id: UUID(),
            name: "Final Liberation",
            description: "Destroy the Soviet superweapon and end their threat once and for all.",
            playerFaction: .allies,
            startingPosition: SCNVector3(-120, 0, -120),
            startingResources: Resources(credits: 30000),
            startingUnits: [.engineer: 5, .alliedSoldier: 12, .grizzlyTank: 5, .mirage: 3, .prism: 2, .chronoLegionnaire: 3],
            startingBuildings: [.constructionYard: 1, .powerPlant: 3, .barracks: 2],
            objectives: objectives,
            enemyForces: enemyForces,
            neutralStructures: [],
            failureConditions: [.baseDestroyed, .timeLimit(1800)],
            parTime: 1200.0,
            difficulty: .brutal
        )
    }
    
    // Additional campaign creation methods would follow the same pattern
    // For brevity, I'll create simplified versions of other campaigns
    
    private func createSovietCampaign() -> Campaign {
        let missions = [
            createBasicMission("Red Dawn", .soviets, .allies, .easy),
            createBasicMission("Iron Advance", .soviets, .confederation, .medium),
            createBasicMission("Nuclear Storm", .soviets, .republic, .hard),
            createBasicMission("Tesla Strike", .soviets, .empire, .hard),
            createBasicMission("Soviet Victory", .soviets, .syndicate, .brutal)
        ]
        
        return Campaign(
            id: UUID(),
            name: "Soviet Conquest",
            description: "Spread the revolution across the globe",
            faction: .soviets,
            missions: missions,
            difficulty: .medium
        )
    }
    
    private func createEmpireCampaign() -> Campaign {
        let missions = [
            createBasicMission("Rising Sun", .empire, .allies, .easy),
            createBasicMission("Psionic War", .empire, .soviets, .medium),
            createBasicMission("Neural Storm", .empire, .confederation, .hard),
            createBasicMission("Mind Control", .empire, .federation, .hard),
            createBasicMission("Empire Ascendant", .empire, .resistance, .brutal)
        ]
        
        return Campaign(
            id: UUID(),
            name: "Empire of the Rising Sun",
            description: "Unite the world under the Empire's banner",
            faction: .empire,
            missions: missions,
            difficulty: .hard
        )
    }
    
    // Continue with other campaigns...
    private func createConfederationCampaign() -> Campaign {
        return createSimpleCampaign("European Unity", .confederation)
    }
    
    private func createRepublicCampaign() -> Campaign {
        return createSimpleCampaign("Pacific Storm", .republic)
    }
    
    private func createFederationCampaign() -> Campaign {
        return createSimpleCampaign("African Liberation", .federation)
    }
    
    private func createCoalitionCampaign() -> Campaign {
        return createSimpleCampaign("Frozen War", .coalition)
    }
    
    private func createSyndicateCampaign() -> Campaign {
        return createSimpleCampaign("Corporate Takeover", .syndicate)
    }
    
    private func createResistanceCampaign() -> Campaign {
        return createSimpleCampaign("Global Uprising", .resistance)
    }
    
    // Helper methods
    private func createSimpleCampaign(_ name: String, _ faction: Faction) -> Campaign {
        let missions = [
            createBasicMission("First Strike", faction, .allies, .easy),
            createBasicMission("Advance", faction, .soviets, .medium),
            createBasicMission("Breakthrough", faction, .empire, .hard),
            createBasicMission("Decisive Battle", faction, .confederation, .hard),
            createBasicMission("Final Victory", faction, .resistance, .brutal)
        ]
        
        return Campaign(
            id: UUID(),
            name: name,
            description: "Fight for \(faction.displayName) supremacy",
            faction: faction,
            missions: missions,
            difficulty: .medium
        )
    }
    
    private func createBasicMission(_ name: String, _ playerFaction: Faction, _ enemyFaction: Faction, _ difficulty: Difficulty) -> Mission {
        let objectives = [
            MissionObjective(
                id: UUID(),
                type: .destroyAllEnemies,
                description: "Eliminate all enemy forces",
                isOptional: false,
                bonusResources: Resources(credits: 2000)
            )
        ]
        
        let enemyForces = [
            EnemyForce(
                faction: enemyFaction,
                position: SCNVector3(60, 0, 60),
                units: getStartingUnits(for: enemyFaction),
                buildings: getStartingBuildings(for: enemyFaction)
            )
        ]
        
        return Mission(
            id: UUID(),
            name: name,
            description: "Defeat the \(enemyFaction.displayName) forces",
            playerFaction: playerFaction,
            startingPosition: SCNVector3(-60, 0, -60),
            startingResources: Resources(credits: difficulty == .easy ? 15000 : difficulty == .medium ? 12000 : 10000),
            startingUnits: getStartingUnits(for: playerFaction),
            startingBuildings: getStartingBuildings(for: playerFaction),
            objectives: objectives,
            enemyForces: enemyForces,
            neutralStructures: [],
            failureConditions: [.baseDestroyed, .timeLimit(difficulty == .easy ? 900 : difficulty == .medium ? 720 : 600)],
            parTime: Float(difficulty == .easy ? 450 : difficulty == .medium ? 360 : 300),
            difficulty: difficulty
        )
    }
    
    private func getStartingUnits(for faction: Faction) -> [UnitType: Int] {
        let uniqueUnits = FactionManager.shared.getUniqueUnits(for: faction)
        var units: [UnitType: Int] = [.engineer: 2]
        
        if !uniqueUnits.isEmpty {
            units[uniqueUnits[0]] = 4 // Basic infantry
            if uniqueUnits.count > 1 {
                units[uniqueUnits[1]] = 1 // Basic vehicle
            }
        }
        
        return units
    }
    
    private func getStartingBuildings(for faction: Faction) -> [BuildingType: Int] {
        return [.constructionYard: 1, .powerPlant: 1]
    }
}

// MARK: - Supporting Extensions

extension SCNVector3 {
    func adding(_ other: SCNVector3) -> SCNVector3 {
        return SCNVector3(x + other.x, y + other.y, z + other.z)
    }
}