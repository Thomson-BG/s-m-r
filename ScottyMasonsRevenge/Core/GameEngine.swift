import Foundation
import SceneKit

// MARK: - Game Engine

class GameEngine: NSObject {
    static let shared = GameEngine()
    static let gameStateChangedNotification = Notification.Name("GameStateChanged")
    
    // Game State
    enum GameState {
        case mainMenu
        case campaign
        case skirmish
        case multiplayer
        case paused
        case gameOver
    }
    
    private(set) var currentState: GameState = .mainMenu
    private(set) var isPaused: Bool = false
    private(set) var gameSpeed: Float = 1.0
    
    // Game Settings
    private(set) var selectedFaction: Faction = .allies
    private(set) var difficulty: Difficulty = .medium
    private(set) var mapSize: MapSize = .medium
    
    // Game Timer
    private var gameTimer: Timer?
    private var lastUpdateTime: TimeInterval = 0
    
    // Save/Load
    private let saveManager = SaveManager()
    
    override init() {
        super.init()
        setupGameLoop()
    }
    
    // MARK: - Initialization
    
    func initialize() {
        print("🎮 Initializing Scotty Mason's Revenge: RTS")
        
        // Initialize all game systems
        ResourceManager.shared.reset()
        FactionManager.shared.loadFactions()
        UnitManager.shared.loadUnitTypes()
        BuildingManager.shared.loadBuildingTypes()
        CampaignManager.shared.loadCampaigns()
        
        print("✅ Game engine initialized successfully")
    }
    
    // MARK: - Game State Management
    
    func startCampaign(faction: Faction, difficulty: Difficulty) {
        selectedFaction = faction
        self.difficulty = difficulty
        currentState = .campaign
        
        // Start first campaign mission
        CampaignManager.shared.startCampaign(for: faction)
        startGameLoop()
        
        notifyStateChange()
    }
    
    func startSkirmish(settings: SkirmishSettings) {
        selectedFaction = settings.playerFaction
        difficulty = settings.difficulty
        mapSize = settings.mapSize
        currentState = .skirmish
        
        // Initialize skirmish map and AI opponents
        setupSkirmishGame(with: settings)
        startGameLoop()
        
        notifyStateChange()
    }
    
    func pauseGame() {
        isPaused = true
        stopGameLoop()
        notifyStateChange()
    }
    
    func resumeGame() {
        isPaused = false
        if currentState != .mainMenu && currentState != .gameOver {
            startGameLoop()
        }
        notifyStateChange()
    }
    
    func endGame(victory: Bool) {
        currentState = .gameOver
        stopGameLoop()
        
        // Show game over screen
        DispatchQueue.main.async {
            NotificationCenter.default.post(
                name: Notification.Name("GameEnded"),
                object: ["victory": victory]
            )
        }
        
        notifyStateChange()
    }
    
    func returnToMainMenu() {
        stopGameLoop()
        currentState = .mainMenu
        
        // Reset game state
        ResourceManager.shared.reset()
        UnitManager.shared.clearAll()
        BuildingManager.shared.clearAll()
        
        notifyStateChange()
    }
    
    // MARK: - Game Loop
    
    private func setupGameLoop() {
        lastUpdateTime = CACurrentMediaTime()
    }
    
    private func startGameLoop() {
        stopGameLoop()
        gameTimer = Timer.scheduledTimer(withTimeInterval: 1.0/60.0, repeats: true) { [weak self] _ in
            self?.updateGame()
        }
    }
    
    private func stopGameLoop() {
        gameTimer?.invalidate()
        gameTimer = nil
    }
    
    private func updateGame() {
        let currentTime = CACurrentMediaTime()
        let deltaTime = Float(currentTime - lastUpdateTime) * gameSpeed
        lastUpdateTime = currentTime
        
        // Update all game systems
        ResourceManager.shared.update(deltaTime: deltaTime)
        UnitManager.shared.update(deltaTime: deltaTime)
        BuildingManager.shared.update(deltaTime: deltaTime)
        
        // Check win/lose conditions
        checkGameConditions()
    }
    
    // MARK: - Game Actions
    
    func requestBuildUnit(_ unitType: UnitType) {
        guard let selectedBuilding = BuildingManager.shared.selectedBuilding,
              selectedBuilding.canProduceUnit(unitType) else {
            return
        }
        
        let cost = unitType.cost
        if ResourceManager.shared.canAfford(cost) {
            ResourceManager.shared.deductResources(cost)
            selectedBuilding.queueUnit(unitType)
        }
    }
    
    func requestBuildBuilding(_ buildingType: BuildingType) {
        let cost = buildingType.cost
        if ResourceManager.shared.canAfford(cost) {
            ResourceManager.shared.deductResources(cost)
            BuildingManager.shared.startBuilding(buildingType)
        }
    }
    
    func deployUnit(_ unit: Unit, at position: SCNVector3) {
        UnitManager.shared.deployUnit(unit, at: position)
    }
    
    func moveUnit(_ unit: Unit, to position: SCNVector3) {
        unit.moveTo(position)
    }
    
    func attackTarget(_ unit: Unit, target: GameObject) {
        unit.attackTarget(target)
    }
    
    // MARK: - Game Conditions
    
    private func checkGameConditions() {
        // Check victory conditions
        if checkVictoryCondition() {
            endGame(victory: true)
        }
        
        // Check defeat conditions
        if checkDefeatCondition() {
            endGame(victory: false)
        }
    }
    
    private func checkVictoryCondition() -> Bool {
        switch currentState {
        case .campaign:
            return CampaignManager.shared.currentMission?.isCompleted ?? false
        case .skirmish:
            // Victory if all enemy factions are eliminated
            let enemyFactions = FactionManager.shared.getEnemyFactions(for: selectedFaction)
            return enemyFactions.allSatisfy { faction in
                BuildingManager.shared.getBuildings(for: faction).isEmpty &&
                UnitManager.shared.getUnits(for: faction).isEmpty
            }
        default:
            return false
        }
    }
    
    private func checkDefeatCondition() -> Bool {
        // Defeat if player has no buildings and no construction units
        let playerBuildings = BuildingManager.shared.getBuildings(for: selectedFaction)
        let playerUnits = UnitManager.shared.getUnits(for: selectedFaction)
        let hasConstructionUnits = playerUnits.contains { $0.canConstruct }
        
        return playerBuildings.isEmpty && !hasConstructionUnits
    }
    
    // MARK: - Save/Load System
    
    func saveGame(name: String? = nil) {
        let saveData = GameSaveData(
            gameState: currentState,
            faction: selectedFaction,
            difficulty: difficulty,
            resources: ResourceManager.shared.currentResources,
            units: UnitManager.shared.getAllUnits(),
            buildings: BuildingManager.shared.getAllBuildings(),
            campaignProgress: CampaignManager.shared.currentProgress
        )
        
        saveManager.saveGame(saveData, name: name)
    }
    
    func loadGame(_ saveData: GameSaveData) {
        // Restore game state
        currentState = saveData.gameState
        selectedFaction = saveData.faction
        difficulty = saveData.difficulty
        
        // Restore managers
        ResourceManager.shared.loadResources(saveData.resources)
        UnitManager.shared.loadUnits(saveData.units)
        BuildingManager.shared.loadBuildings(saveData.buildings)
        CampaignManager.shared.loadProgress(saveData.campaignProgress)
        
        // Resume game
        if currentState != .mainMenu && currentState != .gameOver {
            startGameLoop()
        }
        
        notifyStateChange()
    }
    
    func autoSave() {
        saveGame()
    }
    
    func saveGameState() {
        saveGame("autosave")
    }
    
    // MARK: - Settings
    
    func setGameSpeed(_ speed: Float) {
        gameSpeed = max(0.1, min(3.0, speed))
    }
    
    // MARK: - Private Methods
    
    private func setupSkirmishGame(with settings: SkirmishSettings) {
        // Initialize map
        let mapGenerator = MapGenerator()
        mapGenerator.generateMap(size: settings.mapSize, terrain: settings.terrain)
        
        // Place starting bases for all factions
        for (index, faction) in settings.factions.enumerated() {
            let startPosition = mapGenerator.getStartPosition(for: index)
            let startingBuildings = FactionManager.shared.getStartingBuildings(for: faction)
            let startingUnits = FactionManager.shared.getStartingUnits(for: faction)
            
            // Place buildings
            for (buildingType, count) in startingBuildings {
                for _ in 0..<count {
                    let building = BuildingManager.shared.createBuilding(buildingType, for: faction)
                    BuildingManager.shared.placeBuilding(building, near: startPosition)
                }
            }
            
            // Place units
            for (unitType, count) in startingUnits {
                for _ in 0..<count {
                    let unit = UnitManager.shared.createUnit(unitType, for: faction)
                    UnitManager.shared.deployUnit(unit, near: startPosition)
                }
            }
        }
        
        // Give initial resources
        let initialResources = settings.startingResources
        ResourceManager.shared.setResources(initialResources)
    }
    
    private func notifyStateChange() {
        DispatchQueue.main.async {
            NotificationCenter.default.post(name: Self.gameStateChangedNotification, object: nil)
        }
    }
}

// MARK: - Supporting Types

enum Difficulty: CaseIterable {
    case easy, medium, hard, brutal
    
    var aiMultiplier: Float {
        switch self {
        case .easy: return 0.7
        case .medium: return 1.0
        case .hard: return 1.3
        case .brutal: return 1.6
        }
    }
}

enum MapSize: CaseIterable {
    case small, medium, large, huge
    
    var dimensions: (width: Int, height: Int) {
        switch self {
        case .small: return (64, 64)
        case .medium: return (128, 128)
        case .large: return (256, 256)
        case .huge: return (512, 512)
        }
    }
}

struct SkirmishSettings {
    let playerFaction: Faction
    let factions: [Faction]
    let difficulty: Difficulty
    let mapSize: MapSize
    let terrain: TerrainType
    let startingResources: Resources
    let gameRules: GameRules
}

struct GameRules {
    let superweaponsEnabled: Bool
    let unitLimit: Int
    let startingCredits: Int
    let allowCratePickups: Bool
    let allowBaseWalking: Bool
    let shortGame: Bool
}

enum TerrainType: CaseIterable {
    case temperate, snow, urban, desert
}

// MARK: - Save System

struct GameSaveData: Codable {
    let gameState: GameEngine.GameState
    let faction: Faction
    let difficulty: Difficulty
    let resources: Resources
    let units: [UnitSaveData]
    let buildings: [BuildingSaveData]
    let campaignProgress: CampaignProgress
    let timestamp: Date
    
    init(gameState: GameEngine.GameState, faction: Faction, difficulty: Difficulty,
         resources: Resources, units: [Unit], buildings: [Building], campaignProgress: CampaignProgress) {
        self.gameState = gameState
        self.faction = faction
        self.difficulty = difficulty
        self.resources = resources
        self.units = units.map { UnitSaveData(from: $0) }
        self.buildings = buildings.map { BuildingSaveData(from: $0) }
        self.campaignProgress = campaignProgress
        self.timestamp = Date()
    }
}

class SaveManager {
    private let documentsDirectory: URL
    
    init() {
        documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    }
    
    func saveGame(_ saveData: GameSaveData, name: String?) {
        let fileName = name ?? "autosave_\(Int(Date().timeIntervalSince1970))"
        let fileURL = documentsDirectory.appendingPathComponent("GameSaves").appendingPathComponent("\(fileName).save")
        
        do {
            let data = try JSONEncoder().encode(saveData)
            try data.write(to: fileURL)
            print("✅ Game saved successfully: \(fileName)")
        } catch {
            print("❌ Failed to save game: \(error)")
        }
    }
    
    func loadGame(from fileName: String) -> GameSaveData? {
        let fileURL = documentsDirectory.appendingPathComponent("GameSaves").appendingPathComponent("\(fileName).save")
        
        do {
            let data = try Data(contentsOf: fileURL)
            let saveData = try JSONDecoder().decode(GameSaveData.self, from: data)
            print("✅ Game loaded successfully: \(fileName)")
            return saveData
        } catch {
            print("❌ Failed to load game: \(error)")
            return nil
        }
    }
    
    func getSaveFiles() -> [String] {
        let savesDirectory = documentsDirectory.appendingPathComponent("GameSaves")
        
        do {
            let files = try FileManager.default.contentsOfDirectory(at: savesDirectory, includingPropertiesForKeys: nil)
            return files.compactMap { url in
                url.pathExtension == "save" ? url.deletingPathExtension().lastPathComponent : nil
            }
        } catch {
            return []
        }
    }
}

// MARK: - Map Generator

class MapGenerator {
    func generateMap(size: MapSize, terrain: TerrainType) {
        let dimensions = size.dimensions
        // Generate terrain, resources, and strategic points
        // This is a simplified implementation
        print("🗺️ Generating \(terrain) map of size \(dimensions.width)x\(dimensions.height)")
    }
    
    func getStartPosition(for playerIndex: Int) -> SCNVector3 {
        // Return starting positions for different players
        let positions = [
            SCNVector3(-50, 0, -50),  // Player 1
            SCNVector3(50, 0, 50),    // Player 2
            SCNVector3(-50, 0, 50),   // Player 3
            SCNVector3(50, 0, -50),   // Player 4
        ]
        return positions[min(playerIndex, positions.count - 1)]
    }
}