import Foundation
import SceneKit

// MARK: - Building Manager

class BuildingManager {
    static let shared = BuildingManager()
    
    private var buildings: [UUID: Building] = [:]
    private var buildingsByFaction: [Faction: [Building]] = [:]
    private var buildingTypes: [BuildingType: BuildingTypeData] = [:]
    private(set) var selectedBuilding: Building?
    
    // Construction
    private var constructionQueue: [ConstructionOrder] = []
    private var isConstructing: Bool = false
    
    private init() {}
    
    func initialize() {
        loadBuildingTypes()
        clearAll()
        print("🏗️ Building Manager initialized with \(buildingTypes.count) building types")
    }
    
    func loadBuildingTypes() {
        // Universal buildings
        buildingTypes[.constructionYard] = createConstructionYardType()
        buildingTypes[.powerPlant] = createPowerPlantType()
        buildingTypes[.barracks] = createBarracksType()
        buildingTypes[.refinery] = createRefineryType()
        
        // Allied buildings
        buildingTypes[.prismTower] = createPrismTowerType()
        buildingTypes[.chronosphere] = createChronosphereType()
        buildingTypes[.gapGenerator] = createGapGeneratorType()
        buildingTypes[.alliedAirfield] = createAlliedAirfieldType()
        
        // Soviet buildings
        buildingTypes[.teslaCoil] = createTeslaCoilType()
        buildingTypes[.ironCurtain] = createIronCurtainType()
        buildingTypes[.nuclearReactor] = createNuclearReactorType()
        buildingTypes[.sovietAirfield] = createSovietAirfieldType()
        
        // Empire buildings
        buildingTypes[.waveForceGun] = createWaveForceGunType()
        buildingTypes[.psionicDecimator] = createPsionicDecimatorType()
        buildingTypes[.nanoswarmHive] = createNanoswarmHiveType()
        buildingTypes[.empireAirfield] = createEmpireAirfieldType()
        
        // Additional faction buildings
        buildingTypes[.aegisDefense] = createAegisDefenseType()
        buildingTypes[.weatherController] = createWeatherControllerType()
        buildingTypes[.navalYard] = createNavalYardType()
        buildingTypes[.mineralProcessor] = createMineralProcessorType()
        buildingTypes[.thermalPowerPlant] = createThermalPowerPlantType()
        buildingTypes[.corporateHQ] = createCorporateHQType()
        buildingTypes[.scrapyard] = createScrapyardType()
    }
    
    // MARK: - Building Creation
    
    func createBuilding(_ buildingType: BuildingType, for faction: Faction) -> Building {
        guard let buildingTypeData = buildingTypes[buildingType] else {
            fatalError("Unknown building type: \(buildingType)")
        }
        
        let building = Building(type: buildingType, faction: faction, data: buildingTypeData)
        buildings[building.id] = building
        
        if buildingsByFaction[faction] == nil {
            buildingsByFaction[faction] = []
        }
        buildingsByFaction[faction]?.append(building)
        
        return building
    }
    
    func placeBuilding(_ building: Building, at position: SCNVector3) {
        building.place(at: position)
        registerBuildingWithSystems(building)
    }
    
    func placeBuilding(_ building: Building, near position: SCNVector3) {
        let clearPosition = findClearPosition(near: position, for: building.buildingType)
        placeBuilding(building, at: clearPosition)
    }
    
    func startBuilding(_ buildingType: BuildingType) {
        let order = ConstructionOrder(buildingType: buildingType, faction: FactionManager.shared.getPlayerFaction())
        constructionQueue.append(order)
        
        if !isConstructing {
            processConstructionQueue()
        }
    }
    
    // MARK: - Building Management
    
    func removeBuilding(_ building: Building) {
        buildings.removeValue(forKey: building.id)
        
        if let faction = buildingsByFaction[building.faction] {
            buildingsByFaction[building.faction] = faction.filter { $0.id != building.id }
        }
        
        if selectedBuilding?.id == building.id {
            selectedBuilding = nil
        }
        
        unregisterBuildingFromSystems(building)
        building.destroy()
    }
    
    func getBuildings(for faction: Faction) -> [Building] {
        return buildingsByFaction[faction] ?? []
    }
    
    func getAllBuildings() -> [Building] {
        return Array(buildings.values)
    }
    
    func selectBuilding(_ building: Building) {
        selectedBuilding?.setSelected(false)
        selectedBuilding = building
        building.setSelected(true)
    }
    
    func clearSelection() {
        selectedBuilding?.setSelected(false)
        selectedBuilding = nil
    }
    
    // MARK: - Construction System
    
    private func processConstructionQueue() {
        guard !constructionQueue.isEmpty else {
            isConstructing = false
            return
        }
        
        isConstructing = true
        let order = constructionQueue.removeFirst()
        
        guard let buildingData = buildingTypes[order.buildingType] else {
            processConstructionQueue()
            return
        }
        
        // Check if we can afford the building
        if !ResourceManager.shared.canAfford(buildingData.cost) {
            print("⚠️ Cannot afford \(buildingData.name)")
            processConstructionQueue()
            return
        }
        
        // Deduct resources
        if ResourceManager.shared.deductResources(buildingData.cost) {
            // Start construction
            let building = createBuilding(order.buildingType, for: order.faction)
            building.startConstruction()
            
            // Place building (for now, place near construction yard)
            if let constructionYard = findConstructionYard(for: order.faction) {
                placeBuilding(building, near: constructionYard.position)
            } else {
                // Fallback position
                placeBuilding(building, at: SCNVector3(0, 0, 0))
            }
            
            print("🏗️ Started construction of \(buildingData.name)")
        }
        
        // Continue with next construction
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.processConstructionQueue()
        }
    }
    
    private func findConstructionYard(for faction: Faction) -> Building? {
        return getBuildings(for: faction).first { $0.buildingType == .constructionYard }
    }
    
    // MARK: - Building Registration
    
    private func registerBuildingWithSystems(_ building: Building) {
        // Register with resource manager
        switch building.buildingType {
        case .powerPlant, .nuclearReactor, .thermalPowerPlant:
            ResourceManager.shared.addPowerPlant(building)
        case .refinery, .mineralProcessor:
            ResourceManager.shared.addRefinery(building)
        default:
            break
        }
        
        // Add power consumption
        if building.buildingType.powerConsumption > 0 {
            ResourceManager.shared.addPowerConsumption(building.buildingType.powerConsumption)
        }
    }
    
    private func unregisterBuildingFromSystems(_ building: Building) {
        // Unregister from resource manager
        switch building.buildingType {
        case .powerPlant, .nuclearReactor, .thermalPowerPlant:
            ResourceManager.shared.removePowerPlant(building)
        case .refinery, .mineralProcessor:
            ResourceManager.shared.removeRefinery(building)
        default:
            break
        }
        
        // Remove power consumption
        if building.buildingType.powerConsumption > 0 {
            ResourceManager.shared.removePowerConsumption(building.buildingType.powerConsumption)
        }
    }
    
    // MARK: - Update Loop
    
    func update(deltaTime: Float) {
        for building in buildings.values {
            building.update(deltaTime: deltaTime)
        }
        
        // Remove destroyed buildings
        removeDestroyedBuildings()
    }
    
    private func removeDestroyedBuildings() {
        let destroyedBuildings = buildings.values.filter { $0.currentHealth <= 0 }
        for building in destroyedBuildings {
            removeBuilding(building)
        }
    }
    
    // MARK: - Utility Methods
    
    private func findClearPosition(near position: SCNVector3, for buildingType: BuildingType) -> SCNVector3 {
        let buildingSize = buildingType.size
        let radius: Float = 5.0
        var attempts = 0
        
        while attempts < 20 {
            let angle = Float.random(in: 0...(2 * Float.pi))
            let distance = Float.random(in: buildingSize...radius)
            
            let testPosition = SCNVector3(
                position.x + cos(angle) * distance,
                position.y,
                position.z + sin(angle) * distance
            )
            
            if isPositionClear(testPosition, for: buildingType) {
                return testPosition
            }
            
            attempts += 1
        }
        
        return position
    }
    
    private func isPositionClear(_ position: SCNVector3, for buildingType: BuildingType) -> Bool {
        let buildingSize = buildingType.size
        
        // Check against other buildings
        for building in buildings.values {
            let distance = sqrt(
                pow(building.position.x - position.x, 2) +
                pow(building.position.z - position.z, 2)
            )
            let minDistance = (buildingSize + building.buildingType.size) / 2 + 1.0
            
            if distance < minDistance {
                return false
            }
        }
        
        // Check against units
        for unit in UnitManager.shared.getAllUnits() {
            let distance = sqrt(
                pow(unit.position.x - position.x, 2) +
                pow(unit.position.z - position.z, 2)
            )
            
            if distance < buildingSize / 2 + 2.0 {
                return false
            }
        }
        
        return true
    }
    
    // MARK: - Save/Load
    
    func loadBuildings(_ buildingSaveData: [BuildingSaveData]) {
        clearAll()
        
        for saveData in buildingSaveData {
            let building = createBuilding(saveData.buildingType, for: saveData.faction)
            building.loadFromSave(saveData)
            placeBuilding(building, at: saveData.position)
        }
    }
    
    func clearAll() {
        buildings.removeAll()
        buildingsByFaction.removeAll()
        selectedBuilding = nil
        constructionQueue.removeAll()
        isConstructing = false
    }
    
    // MARK: - Building Type Creation Methods
    
    private func createConstructionYardType() -> BuildingTypeData {
        return BuildingTypeData(
            name: "Construction Yard",
            description: "Primary construction facility",
            health: 1000,
            armor: 2,
            cost: Resources(credits: 2500),
            buildTime: 0, // Pre-placed
            size: 4.0,
            
            canProduceUnits: false,
            canProduceBuildings: true,
            powerGeneration: 0,
            powerConsumption: 50,
            resourceGeneration: 0,
            
            producibleUnits: [],
            producibleBuildings: [.powerPlant, .barracks, .refinery],
            
            modelName: "construction_yard_model",
            iconName: "construction_yard_icon",
            
            buildingClass: .production,
            isDefensive: false
        )
    }
    
    private func createPowerPlantType() -> BuildingTypeData {
        return BuildingTypeData(
            name: "Power Plant",
            description: "Generates electrical power",
            health: 750,
            armor: 1,
            cost: Resources(credits: 800),
            buildTime: 30.0,
            size: 3.0,
            
            canProduceUnits: false,
            canProduceBuildings: false,
            powerGeneration: 100,
            powerConsumption: 0,
            resourceGeneration: 0,
            
            producibleUnits: [],
            producibleBuildings: [],
            
            modelName: "power_plant_model",
            iconName: "power_plant_icon",
            
            buildingClass: .utility,
            isDefensive: false
        )
    }
    
    private func createBarracksType() -> BuildingTypeData {
        return BuildingTypeData(
            name: "Barracks",
            description: "Trains infantry units",
            health: 800,
            armor: 1,
            cost: Resources(credits: 500, power: 25),
            buildTime: 25.0,
            size: 3.0,
            
            canProduceUnits: true,
            canProduceBuildings: false,
            powerGeneration: 0,
            powerConsumption: 25,
            resourceGeneration: 0,
            
            producibleUnits: [.engineer, .alliedSoldier, .conscript], // Faction-specific
            producibleBuildings: [],
            
            modelName: "barracks_model",
            iconName: "barracks_icon",
            
            buildingClass: .production,
            isDefensive: false
        )
    }
    
    private func createRefineryType() -> BuildingTypeData {
        return BuildingTypeData(
            name: "Refinery",
            description: "Processes ore into credits",
            health: 900,
            armor: 1,
            cost: Resources(credits: 2000),
            buildTime: 40.0,
            size: 4.0,
            
            canProduceUnits: true, // Produces harvester
            canProduceBuildings: false,
            powerGeneration: 0,
            powerConsumption: 50,
            resourceGeneration: 20,
            
            producibleUnits: [.engineer], // Harvester would be here
            producibleBuildings: [],
            
            modelName: "refinery_model",
            iconName: "refinery_icon",
            
            buildingClass: .economic,
            isDefensive: false
        )
    }
    
    private func createPrismTowerType() -> BuildingTypeData {
        return BuildingTypeData(
            name: "Prism Tower",
            description: "Advanced defensive laser turret",
            health: 600,
            armor: 2,
            cost: Resources(credits: 1500, power: 75),
            buildTime: 35.0,
            size: 2.0,
            
            canProduceUnits: false,
            canProduceBuildings: false,
            powerGeneration: 0,
            powerConsumption: 75,
            resourceGeneration: 0,
            
            producibleUnits: [],
            producibleBuildings: [],
            
            modelName: "prism_tower_model",
            iconName: "prism_tower_icon",
            
            buildingClass: .defense,
            isDefensive: true
        )
    }
    
    private func createChronosphereType() -> BuildingTypeData {
        return BuildingTypeData(
            name: "Chronosphere",
            description: "Allied superweapon facility",
            health: 1000,
            armor: 2,
            cost: Resources(credits: 5000, power: 200),
            buildTime: 120.0,
            size: 5.0,
            
            canProduceUnits: false,
            canProduceBuildings: false,
            powerGeneration: 0,
            powerConsumption: 200,
            resourceGeneration: 0,
            
            producibleUnits: [],
            producibleBuildings: [],
            
            modelName: "chronosphere_model",
            iconName: "chronosphere_icon",
            
            buildingClass: .superweapon,
            isDefensive: false
        )
    }
    
    // Additional building types would continue here...
    // For brevity, I'll create simplified versions of the remaining types
    
    private func createGapGeneratorType() -> BuildingTypeData {
        return createStandardBuildingType("Gap Generator", health: 500, cost: 2500, power: 100, buildingClass: .utility)
    }
    
    private func createAlliedAirfieldType() -> BuildingTypeData {
        return createStandardBuildingType("Allied Airfield", health: 1200, cost: 3000, power: 150, buildingClass: .production)
    }
    
    private func createTeslaCoilType() -> BuildingTypeData {
        return createStandardBuildingType("Tesla Coil", health: 650, cost: 1200, power: 75, buildingClass: .defense)
    }
    
    private func createIronCurtainType() -> BuildingTypeData {
        return createStandardBuildingType("Iron Curtain", health: 1000, cost: 4500, power: 200, buildingClass: .superweapon)
    }
    
    private func createNuclearReactorType() -> BuildingTypeData {
        return BuildingTypeData(
            name: "Nuclear Reactor",
            description: "High-output power generation",
            health: 800,
            armor: 1,
            cost: Resources(credits: 1500),
            buildTime: 45.0,
            size: 3.5,
            
            canProduceUnits: false,
            canProduceBuildings: false,
            powerGeneration: 200, // Higher than standard power plant
            powerConsumption: 0,
            resourceGeneration: 0,
            
            producibleUnits: [],
            producibleBuildings: [],
            
            modelName: "nuclear_reactor_model",
            iconName: "nuclear_reactor_icon",
            
            buildingClass: .utility,
            isDefensive: false
        )
    }
    
    private func createSovietAirfieldType() -> BuildingTypeData {
        return createStandardBuildingType("Soviet Airfield", health: 1200, cost: 3000, power: 150, buildingClass: .production)
    }
    
    private func createWaveForceGunType() -> BuildingTypeData {
        return createStandardBuildingType("Wave Force Gun", health: 700, cost: 1800, power: 100, buildingClass: .defense)
    }
    
    private func createPsionicDecimatorType() -> BuildingTypeData {
        return createStandardBuildingType("Psionic Decimator", health: 1000, cost: 5500, power: 250, buildingClass: .superweapon)
    }
    
    private func createNanoswarmHiveType() -> BuildingTypeData {
        return createStandardBuildingType("Nanoswarm Hive", health: 600, cost: 2000, power: 75, buildingClass: .utility)
    }
    
    private func createEmpireAirfieldType() -> BuildingTypeData {
        return createStandardBuildingType("Empire Airfield", health: 1200, cost: 3000, power: 150, buildingClass: .production)
    }
    
    private func createAegisDefenseType() -> BuildingTypeData {
        return createStandardBuildingType("Aegis Defense", health: 800, cost: 2000, power: 100, buildingClass: .defense)
    }
    
    private func createWeatherControllerType() -> BuildingTypeData {
        return createStandardBuildingType("Weather Controller", health: 1000, cost: 4800, power: 200, buildingClass: .superweapon)
    }
    
    private func createNavalYardType() -> BuildingTypeData {
        return createStandardBuildingType("Naval Yard", health: 1000, cost: 2500, power: 100, buildingClass: .production)
    }
    
    private func createMineralProcessorType() -> BuildingTypeData {
        return BuildingTypeData(
            name: "Mineral Processor",
            description: "Enhanced ore processing facility",
            health: 950,
            armor: 1,
            cost: Resources(credits: 2200),
            buildTime: 42.0,
            size: 4.0,
            
            canProduceUnits: false,
            canProduceBuildings: false,
            powerGeneration: 0,
            powerConsumption: 60,
            resourceGeneration: 30, // Higher than standard refinery
            
            producibleUnits: [],
            producibleBuildings: [],
            
            modelName: "mineral_processor_model",
            iconName: "mineral_processor_icon",
            
            buildingClass: .economic,
            isDefensive: false
        )
    }
    
    private func createThermalPowerPlantType() -> BuildingTypeData {
        return BuildingTypeData(
            name: "Thermal Power Plant",
            description: "Cold-weather power generation",
            health: 800,
            armor: 2,
            cost: Resources(credits: 900),
            buildTime: 32.0,
            size: 3.0,
            
            canProduceUnits: false,
            canProduceBuildings: false,
            powerGeneration: 120, // Slightly better than standard
            powerConsumption: 0,
            resourceGeneration: 0,
            
            producibleUnits: [],
            producibleBuildings: [],
            
            modelName: "thermal_power_plant_model",
            iconName: "thermal_power_plant_icon",
            
            buildingClass: .utility,
            isDefensive: false
        )
    }
    
    private func createCorporateHQType() -> BuildingTypeData {
        return createStandardBuildingType("Corporate HQ", health: 1200, cost: 3500, power: 100, buildingClass: .production)
    }
    
    private func createScrapyardType() -> BuildingTypeData {
        return BuildingTypeData(
            name: "Scrapyard",
            description: "Salvages resources from wreckage",
            health: 700,
            armor: 0,
            cost: Resources(credits: 1200),
            buildTime: 30.0,
            size: 3.5,
            
            canProduceUnits: false,
            canProduceBuildings: false,
            powerGeneration: 0,
            powerConsumption: 25,
            resourceGeneration: 15, // Generates credits from salvage
            
            producibleUnits: [],
            producibleBuildings: [],
            
            modelName: "scrapyard_model",
            iconName: "scrapyard_icon",
            
            buildingClass: .economic,
            isDefensive: false
        )
    }
    
    // Helper method for creating standard building types
    private func createStandardBuildingType(_ name: String, health: Int, cost: Int, power: Int, buildingClass: BuildingClass) -> BuildingTypeData {
        return BuildingTypeData(
            name: name,
            description: "\(name) building",
            health: health,
            armor: 1,
            cost: Resources(credits: cost, power: power),
            buildTime: Float(cost) / 80.0,
            size: 3.0,
            
            canProduceUnits: false,
            canProduceBuildings: false,
            powerGeneration: 0,
            powerConsumption: power,
            resourceGeneration: 0,
            
            producibleUnits: [],
            producibleBuildings: [],
            
            modelName: "\(name.lowercased().replacingOccurrences(of: " ", with: "_"))_model",
            iconName: "\(name.lowercased().replacingOccurrences(of: " ", with: "_"))_icon",
            
            buildingClass: buildingClass,
            isDefensive: buildingClass == .defense
        )
    }
}

// MARK: - Supporting Types

struct ConstructionOrder {
    let buildingType: BuildingType
    let faction: Faction
}

// MARK: - Building Types Extension

extension BuildingType {
    var size: Float {
        switch self {
        case .constructionYard: return 4.0
        case .powerPlant, .nuclearReactor, .thermalPowerPlant: return 3.0
        case .barracks: return 3.0
        case .refinery, .mineralProcessor: return 4.0
        case .prismTower, .teslaCoil: return 2.0
        case .chronosphere, .ironCurtain, .psionicDecimator: return 5.0
        default: return 3.0
        }
    }
    
    var powerConsumption: Int {
        switch self {
        case .constructionYard: return 50
        case .barracks: return 25
        case .refinery, .mineralProcessor: return 50
        case .prismTower, .teslaCoil: return 75
        case .chronosphere, .ironCurtain: return 200
        case .psionicDecimator: return 250
        default: return 0
        }
    }
}