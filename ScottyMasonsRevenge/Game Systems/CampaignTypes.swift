import Foundation
import SceneKit

// MARK: - Campaign Data Structures

struct Campaign {
    let id: UUID
    let name: String
    let description: String
    let faction: Faction
    let missions: [Mission]
    let difficulty: Difficulty
}

struct Mission {
    let id: UUID
    let name: String
    let description: String
    let playerFaction: Faction
    let startingPosition: SCNVector3
    let startingResources: Resources
    let startingUnits: [UnitType: Int]
    let startingBuildings: [BuildingType: Int]
    let objectives: [MissionObjective]
    let enemyForces: [EnemyForce]
    let neutralStructures: [NeutralStructure]
    let failureConditions: [FailureCondition]
    let parTime: Float
    let difficulty: Difficulty
}

struct MissionObjective {
    let id: UUID
    let type: ObjectiveType
    let description: String
    let isOptional: Bool
    let bonusResources: Resources
}

enum ObjectiveType {
    case destroyAllEnemies
    case destroyTarget(String) // Target ID
    case captureBuilding(BuildingType)
    case buildUnits(UnitType, Int) // Unit type and count
    case surviveTime(Float) // Duration in seconds
    case collectResources(Int) // Credit amount
    case reachLocation(SCNVector3) // Position to reach
}

struct EnemyForce {
    let faction: Faction
    let position: SCNVector3
    let units: [UnitType: Int]
    let buildings: [BuildingType: Int]
}

struct NeutralStructure {
    let buildingType: BuildingType
    let position: SCNVector3
}

enum FailureCondition {
    case allUnitsDestroyed
    case baseDestroyed
    case timeLimit(Float) // Time limit in seconds
}

struct CampaignProgress: Codable {
    var currentCampaignFaction: Faction?
    var currentMissionId: UUID?
    var completedMissions: Int = 0
    var completedObjectives: Int = 0
    var totalScore: Int = 0
    var unlockedMissions: Set<UUID> = []
    var lastCompletedMission: UUID?
    var campaignCompleted: Bool = false
    
    init() {}
}

// MARK: - Skirmish Mode Data Structures

struct SkirmishMap {
    let id: UUID
    let name: String
    let description: String
    let size: MapSize
    let terrain: TerrainType
    let playerCount: Int
    let startingPositions: [SCNVector3]
    let resourceDeposits: [ResourceDeposit]
    let neutralBuildings: [NeutralStructure]
}

struct ResourceDeposit {
    let position: SCNVector3
    let oreType: OreType
    let amount: Int
}

// MARK: - Multiplayer Data Structures

struct MultiplayerGame {
    let id: UUID
    let name: String
    let hostPlayer: Player
    let players: [Player]
    let map: SkirmishMap
    let gameRules: GameRules
    let isRanked: Bool
    let maxPlayers: Int
}

struct Player {
    let id: UUID
    let name: String
    let faction: Faction
    let isAI: Bool
    let difficulty: Difficulty? // For AI players
    let color: UIColor
}

// MARK: - Game Statistics

struct GameStatistics {
    var unitsBuilt: [UnitType: Int] = [:]
    var buildingsBuilt: [BuildingType: Int] = [:]
    var unitsLost: [UnitType: Int] = [:]
    var buildingsLost: [BuildingType: Int] = [:]
    var enemyUnitsDestroyed: [UnitType: Int] = [:]
    var enemyBuildingsDestroyed: [BuildingType: Int] = [:]
    var resourcesCollected: Int = 0
    var resourcesSpent: Int = 0
    var gameDuration: TimeInterval = 0
    var veteranUnits: Int = 0
    var eliteUnits: Int = 0
    var superweaponsUsed: Int = 0
}

// MARK: - Achievement System

struct Achievement {
    let id: String
    let name: String
    let description: String
    let iconName: String
    let isUnlocked: Bool
    let unlockedDate: Date?
    let category: AchievementCategory
    let points: Int
}

enum AchievementCategory: String, CaseIterable {
    case campaign = "Campaign"
    case units = "Units"
    case buildings = "Buildings"
    case combat = "Combat"
    case resources = "Resources"
    case multiplayer = "Multiplayer"
    case special = "Special"
}

struct PlayerProfile {
    let id: UUID
    let name: String
    let level: Int
    let experience: Int
    let totalScore: Int
    let achievements: [Achievement]
    let statistics: GameStatistics
    let campaignProgress: [Faction: CampaignProgress]
    let favoriteFactio: Faction
    let gamesPlayed: Int
    var gamesWon: Int
    let multiplayerRating: Int
}

// MARK: - Game Save Data

struct GameSaveMetadata {
    let saveDate: Date
    let gameName: String
    let gameMode: GameMode
    let faction: Faction
    let missionName: String?
    let gameTime: TimeInterval
    let difficulty: Difficulty
    let thumbnail: Data? // Screenshot data
}

enum GameMode: String, CaseIterable, Codable {
    case campaign = "Campaign"
    case skirmish = "Skirmish"
    case multiplayer = "Multiplayer"
    case tutorial = "Tutorial"
}

// MARK: - Tutorial System

struct TutorialStep {
    let id: UUID
    let title: String
    let description: String
    let targetElement: String? // UI element to highlight
    let action: TutorialAction
    let completionCondition: TutorialCondition
}

enum TutorialAction {
    case showHighlight(String) // Element ID to highlight
    case showTooltip(String, SCNVector3) // Text and position
    case pauseGame
    case resumeGame
    case waitForUser
    case executeCommand(String) // Command to execute
}

enum TutorialCondition {
    case userAction(String) // Specific user action
    case gameState(String) // Game state condition
    case timeElapsed(Float) // Time condition
    case objectiveComplete // Any objective completed
}

struct Tutorial {
    let id: UUID
    let name: String
    let description: String
    let steps: [TutorialStep]
    let faction: Faction
    let isCompleted: Bool
}

// MARK: - AI Behavior System

struct AIBehavior {
    let faction: Faction
    let personality: AIPersonality
    let buildQueue: [BuildOrder]
    let attackStrategy: AttackStrategy
    let defenseStrategy: DefenseStrategy
    let economicStrategy: EconomicStrategy
}

struct BuildOrder {
    let priority: Int
    let buildingType: BuildingType?
    let unitType: UnitType?
    let condition: BuildCondition
}

enum BuildCondition {
    case always
    case hasResources(Resources)
    case hasBuilding(BuildingType)
    case enemyThreat(ThreatLevel)
    case timeElapsed(Float)
}

enum ThreatLevel {
    case none, low, medium, high, critical
}

enum AttackStrategy {
    case defensive // Wait for enemy
    case balanced // Mixed approach
    case aggressive // Constant attacks
    case rusher // Early game rushes
    case turtling // Heavy defense focus
}

enum DefenseStrategy {
    case minimal // Few defenses
    case standard // Balanced defense
    case heavy // Many defensive structures
    case adaptive // Respond to threats
}

enum EconomicStrategy {
    case conservative // Slow, steady growth
    case balanced // Standard economy
    case aggressive // Fast expansion
    case specialized // Focus on specific resources
}

// MARK: - Replay System

struct GameReplay {
    let id: UUID
    let gameMode: GameMode
    let players: [Player]
    let map: SkirmishMap?
    let mission: Mission?
    let startTime: Date
    let duration: TimeInterval
    let winner: Player?
    let commands: [ReplayCommand]
    let metadata: GameSaveMetadata
}

struct ReplayCommand {
    let timestamp: TimeInterval
    let playerId: UUID
    let command: GameCommand
}

enum GameCommand: Codable {
    case moveUnit(UUID, SCNVector3) // Unit ID, target position
    case attackTarget(UUID, UUID) // Attacker ID, target ID
    case buildUnit(UnitType, UUID) // Unit type, building ID
    case buildBuilding(BuildingType, SCNVector3) // Building type, position
    case useAbility(String, SCNVector3?) // Ability name, optional position
    case selectUnits([UUID]) // Unit IDs
    case groupUnits([UUID], Int) // Unit IDs, group number
    case pause
    case unpause
    case surrender
}

// MARK: - Error Handling

enum GameError: Error, LocalizedError {
    case insufficientResources
    case invalidPosition
    case unitNotFound
    case buildingNotFound
    case invalidTarget
    case gameNotInitialized
    case saveFileCorrupted
    case networkError(String)
    case unknownError(String)
    
    var errorDescription: String? {
        switch self {
        case .insufficientResources:
            return "Not enough resources to complete this action"
        case .invalidPosition:
            return "Invalid position for this action"
        case .unitNotFound:
            return "Unit not found"
        case .buildingNotFound:
            return "Building not found"
        case .invalidTarget:
            return "Invalid target for this action"
        case .gameNotInitialized:
            return "Game has not been properly initialized"
        case .saveFileCorrupted:
            return "Save file is corrupted or incompatible"
        case .networkError(let message):
            return "Network error: \(message)"
        case .unknownError(let message):
            return "Unknown error: \(message)"
        }
    }
}

// MARK: - Notification Extensions

extension Notification.Name {
    static let gameInitialized = Notification.Name("GameInitialized")
    static let gameStarted = Notification.Name("GameStarted")
    static let gameEnded = Notification.Name("GameEnded")
    static let gamePaused = Notification.Name("GamePaused")
    static let gameResumed = Notification.Name("GameResumed")
    static let missionStarted = Notification.Name("MissionStarted")
    static let missionCompleted = Notification.Name("MissionCompleted")
    static let missionFailed = Notification.Name("MissionFailed")
    static let objectiveCompleted = Notification.Name("ObjectiveCompleted")
    static let unitCreated = Notification.Name("UnitCreated")
    static let unitDestroyed = Notification.Name("UnitDestroyed")
    static let buildingCreated = Notification.Name("BuildingCreated")
    static let buildingDestroyed = Notification.Name("BuildingDestroyed")
    static let resourcesChanged = Notification.Name("ResourcesChanged")
    static let powerChanged = Notification.Name("PowerChanged")
    static let superweaponReady = Notification.Name("SuperweaponReady")
    static let superweaponActivated = Notification.Name("SuperweaponActivated")
    static let achievementUnlocked = Notification.Name("AchievementUnlocked")
    static let tutorialStepCompleted = Notification.Name("TutorialStepCompleted")
}

// MARK: - Codable Extensions

extension GameEngine.GameState: Codable {}
extension Difficulty: Codable {}
extension MapSize: Codable {}
extension TerrainType: Codable {}
extension GameMode: Codable {}

// Make sure our complex types are Codable
extension SCNVector3: Codable {
    enum CodingKeys: String, CodingKey {
        case x, y, z
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let x = try container.decode(Float.self, forKey: .x)
        let y = try container.decode(Float.self, forKey: .y)
        let z = try container.decode(Float.self, forKey: .z)
        self.init(x, y, z)
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(x, forKey: .x)
        try container.encode(y, forKey: .y)
        try container.encode(z, forKey: .z)
    }
}

extension UIColor: Codable {
    enum CodingKeys: String, CodingKey {
        case red, green, blue, alpha
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let red = try container.decode(CGFloat.self, forKey: .red)
        let green = try container.decode(CGFloat.self, forKey: .green)
        let blue = try container.decode(CGFloat.self, forKey: .blue)
        let alpha = try container.decode(CGFloat.self, forKey: .alpha)
        self.init(red: red, green: green, blue: blue, alpha: alpha)
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        var red: CGFloat = 0
        var green: CGFloat = 0
        var blue: CGFloat = 0
        var alpha: CGFloat = 0
        getRed(&red, green: &green, blue: &blue, alpha: &alpha)
        try container.encode(red, forKey: .red)
        try container.encode(green, forKey: .green)
        try container.encode(blue, forKey: .blue)
        try container.encode(alpha, forKey: .alpha)
    }
}