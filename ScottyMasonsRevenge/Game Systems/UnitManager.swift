import Foundation
import SceneKit

// MARK: - Unit Manager

class UnitManager {
    static let shared = UnitManager()
    
    private var units: [UUID: Unit] = [:]
    private var unitsByFaction: [Faction: [Unit]] = [:]
    private var selectedUnits: [Unit] = []
    private var unitTypes: [UnitType: UnitTypeData] = [:]
    
    // Update tracking
    private var lastUpdateTime: TimeInterval = 0
    
    private init() {}
    
    func initialize() {
        loadUnitTypes()
        clearAll()
        print("🪖 Unit Manager initialized with \(unitTypes.count) unit types")
    }
    
    func loadUnitTypes() {
        // Load all unit types for all factions
        unitTypes[.engineer] = createEngineerType()
        
        // Allied units
        unitTypes[.alliedSoldier] = createAlliedSoldierType()
        unitTypes[.grizzlyTank] = createGrizzlyTankType()
        unitTypes[.rocketeeer] = createRocketeerType()
        unitTypes[.mirage] = createMirageType()
        unitTypes[.prism] = createPrismType()
        unitTypes[.chronoLegionnaire] = createChronoLegionnaireType()
        unitTypes[.spySatellite] = createSpySatelliteType()
        
        // Soviet units
        unitTypes[.conscript] = createConscriptType()
        unitTypes[.flakTrooper] = createFlakTrooperType()
        unitTypes[.rhinoTank] = createRhinoTankType()
        unitTypes[.apocalypseTank] = createApocalypseTankType()
        unitTypes[.terrorDrone] = createTerrorDroneType()
        unitTypes[.kirovAirship] = createKirovAirshipType()
        
        // Empire units
        unitTypes[.imperialWarrior] = createImperialWarriorType()
        unitTypes[.archer] = createArcherType()
        unitTypes[.tsunamiTank] = createTsunamiTankType()
        unitTypes[.kingOni] = createKingOniType()
        unitTypes[.nanocoreFabricator] = createNanocoreFabricatorType()
        unitTypes[.rocketAngel] = createRocketAngelType()
        
        // Additional faction units
        unitTypes[.confederateInfantry] = createConfederateInfantryType()
        unitTypes[.crusaderTank] = createCrusaderTankType()
        unitTypes[.marineInfantry] = createMarineInfantryType()
        unitTypes[.amphibiousTank] = createAmphibiousTankType()
        unitTypes[.militiaFighter] = createMilitiaFighterType()
        unitTypes[.scorpionTank] = createScorpionTankType()
        unitTypes[.arcticTrooper] = createArcticTrooperType()
        unitTypes[.mammothTank] = createMammothTankType()
        unitTypes[.mercenary] = createMercenaryType()
        unitTypes[.titanTank] = createTitanTankType()
        unitTypes[.rebel] = createRebelType()
        unitTypes[.salvageTank] = createSalvageTankType()
    }
    
    // MARK: - Unit Creation
    
    func createUnit(_ unitType: UnitType, for faction: Faction) -> Unit {
        guard let unitTypeData = unitTypes[unitType] else {
            fatalError("Unknown unit type: \(unitType)")
        }
        
        let unit = Unit(type: unitType, faction: faction, data: unitTypeData)
        units[unit.id] = unit
        
        if unitsByFaction[faction] == nil {
            unitsByFaction[faction] = []
        }
        unitsByFaction[faction]?.append(unit)
        
        return unit
    }
    
    func deployUnit(_ unit: Unit, at position: SCNVector3) {
        unit.deploy(at: position)
    }
    
    func deployUnit(_ unit: Unit, near position: SCNVector3) {
        // Find nearby clear position
        let deployPosition = findClearPosition(near: position)
        deployUnit(unit, at: deployPosition)
    }
    
    // MARK: - Unit Management
    
    func removeUnit(_ unit: Unit) {
        units.removeValue(forKey: unit.id)
        
        if let faction = unitsByFaction[unit.faction] {
            unitsByFaction[unit.faction] = faction.filter { $0.id != unit.id }
        }
        
        selectedUnits.removeAll { $0.id == unit.id }
        unit.destroy()
    }
    
    func getUnits(for faction: Faction) -> [Unit] {
        return unitsByFaction[faction] ?? []
    }
    
    func getAllUnits() -> [Unit] {
        return Array(units.values)
    }
    
    func getSelectedUnits() -> [Unit] {
        return selectedUnits
    }
    
    func selectUnit(_ unit: Unit) {
        clearSelection()
        selectedUnits = [unit]
        unit.setSelected(true)
    }
    
    func addToSelection(_ unit: Unit) {
        if !selectedUnits.contains(where: { $0.id == unit.id }) {
            selectedUnits.append(unit)
            unit.setSelected(true)
        }
    }
    
    func clearSelection() {
        for unit in selectedUnits {
            unit.setSelected(false)
        }
        selectedUnits.removeAll()
    }
    
    // MARK: - Unit Actions
    
    func moveUnits(_ units: [Unit], to position: SCNVector3) {
        for (index, unit) in units.enumerated() {
            let offset = SCNVector3(
                Float(index % 3 - 1) * 2.0,
                0,
                Float(index / 3 - 1) * 2.0
            )
            let targetPosition = SCNVector3(
                position.x + offset.x,
                position.y + offset.y,
                position.z + offset.z
            )
            unit.moveTo(targetPosition)
        }
    }
    
    func attackTarget(_ units: [Unit], target: GameObject) {
        for unit in units {
            if unit.canAttack(target) {
                unit.attackTarget(target)
            }
        }
    }
    
    func stopUnits(_ units: [Unit]) {
        for unit in units {
            unit.stop()
        }
    }
    
    // MARK: - Update Loop
    
    func update(deltaTime: Float) {
        for unit in units.values {
            unit.update(deltaTime: deltaTime)
        }
        
        // Remove destroyed units
        removeDestroyedUnits()
        
        // Update unit AI
        updateUnitAI(deltaTime: deltaTime)
    }
    
    private func removeDestroyedUnits() {
        let destroyedUnits = units.values.filter { $0.currentHealth <= 0 }
        for unit in destroyedUnits {
            removeUnit(unit)
        }
    }
    
    private func updateUnitAI(deltaTime: Float) {
        for unit in units.values {
            if unit.faction != FactionManager.shared.getPlayerFaction() {
                updateAIUnit(unit, deltaTime: deltaTime)
            }
        }
    }
    
    private func updateAIUnit(_ unit: Unit, deltaTime: Float) {
        // Simple AI behavior
        switch unit.currentState {
        case .idle:
            // Look for nearby enemies
            if let enemy = findNearestEnemy(to: unit) {
                if unit.canAttack(enemy) && unit.distanceTo(enemy) <= unit.attackRange {
                    unit.attackTarget(enemy)
                } else if unit.distanceTo(enemy) <= unit.visionRange {
                    unit.moveTo(enemy.position)
                }
            }
            
        case .moving:
            // Check if we can attack while moving
            if let enemy = findNearestEnemy(to: unit) {
                if unit.canAttack(enemy) && unit.distanceTo(enemy) <= unit.attackRange {
                    unit.attackTarget(enemy)
                }
            }
            
        case .attacking:
            // Continue attacking or find new target
            if let currentTarget = unit.currentTarget {
                if currentTarget.currentHealth <= 0 || unit.distanceTo(currentTarget) > unit.attackRange {
                    unit.currentTarget = nil
                    unit.currentState = .idle
                }
            }
            
        default:
            break
        }
    }
    
    // MARK: - Utility Methods
    
    private func findClearPosition(near position: SCNVector3) -> SCNVector3 {
        let radius: Float = 2.0
        var attempts = 0
        
        while attempts < 10 {
            let angle = Float.random(in: 0...(2 * Float.pi))
            let distance = Float.random(in: 0...radius)
            
            let testPosition = SCNVector3(
                position.x + cos(angle) * distance,
                position.y,
                position.z + sin(angle) * distance
            )
            
            if isPositionClear(testPosition) {
                return testPosition
            }
            
            attempts += 1
        }
        
        return position
    }
    
    private func isPositionClear(_ position: SCNVector3) -> Bool {
        // Check if position is clear of other units and buildings
        for unit in units.values {
            if unit.distanceToPosition(position) < 2.0 {
                return false
            }
        }
        
        // Check buildings (would need BuildingManager)
        // for building in BuildingManager.shared.getAllBuildings() {
        //     if building.distanceToPosition(position) < 3.0 {
        //         return false
        //     }
        // }
        
        return true
    }
    
    private func findNearestEnemy(to unit: Unit) -> GameObject? {
        var nearestEnemy: GameObject?
        var nearestDistance: Float = Float.greatestFiniteMagnitude
        
        // Check enemy units
        for faction in FactionManager.shared.getEnemyFactions(for: unit.faction) {
            for enemyUnit in getUnits(for: faction) {
                let distance = unit.distanceTo(enemyUnit)
                if distance < nearestDistance && distance <= unit.visionRange {
                    nearestDistance = distance
                    nearestEnemy = enemyUnit
                }
            }
            
            // Check enemy buildings
            for enemyBuilding in BuildingManager.shared.getBuildings(for: faction) {
                let distance = unit.distanceTo(enemyBuilding)
                if distance < nearestDistance && distance <= unit.visionRange {
                    nearestDistance = distance
                    nearestEnemy = enemyBuilding
                }
            }
        }
        
        return nearestEnemy
    }
    
    // MARK: - Save/Load
    
    func loadUnits(_ unitSaveData: [UnitSaveData]) {
        clearAll()
        
        for saveData in unitSaveData {
            let unit = createUnit(saveData.unitType, for: saveData.faction)
            unit.loadFromSave(saveData)
        }
    }
    
    func clearAll() {
        units.removeAll()
        unitsByFaction.removeAll()
        selectedUnits.removeAll()
    }
    
    // MARK: - Unit Type Creation Methods
    
    private func createEngineerType() -> UnitTypeData {
        return UnitTypeData(
            name: "Engineer",
            description: "Can capture buildings and repair structures",
            health: 25,
            armor: 0,
            speed: 4.0,
            cost: Resources(credits: 500),
            buildTime: 10.0,
            
            canAttack: false,
            canConstruct: true,
            canCapture: true,
            canRepair: true,
            
            attackDamage: 0,
            attackRange: 0,
            attackSpeed: 0,
            visionRange: 6.0,
            
            modelName: "engineer_model",
            iconName: "engineer_icon",
            
            unitClass: .infantry,
            special: .engineer
        )
    }
    
    private func createAlliedSoldierType() -> UnitTypeData {
        return UnitTypeData(
            name: "Allied Soldier",
            description: "Basic infantry unit with assault rifle",
            health: 100,
            armor: 0,
            speed: 4.0,
            cost: Resources(credits: 200),
            buildTime: 5.0,
            
            canAttack: true,
            canConstruct: false,
            canCapture: false,
            canRepair: false,
            
            attackDamage: 15,
            attackRange: 5.0,
            attackSpeed: 1.0,
            visionRange: 7.0,
            
            modelName: "allied_soldier_model",
            iconName: "allied_soldier_icon",
            
            unitClass: .infantry,
            special: .none
        )
    }
    
    private func createGrizzlyTankType() -> UnitTypeData {
        return UnitTypeData(
            name: "Grizzly Tank",
            description: "Allied main battle tank",
            health: 300,
            armor: 2,
            speed: 5.0,
            cost: Resources(credits: 700),
            buildTime: 20.0,
            
            canAttack: true,
            canConstruct: false,
            canCapture: false,
            canRepair: false,
            
            attackDamage: 65,
            attackRange: 7.0,
            attackSpeed: 2.0,
            visionRange: 8.0,
            
            modelName: "grizzly_tank_model",
            iconName: "grizzly_tank_icon",
            
            unitClass: .vehicle,
            special: .none
        )
    }
    
    private func createRocketeerType() -> UnitTypeData {
        return UnitTypeData(
            name: "Rocketeer",
            description: "Flying infantry with rockets",
            health: 80,
            armor: 0,
            speed: 6.0,
            cost: Resources(credits: 600),
            buildTime: 15.0,
            
            canAttack: true,
            canConstruct: false,
            canCapture: false,
            canRepair: false,
            
            attackDamage: 50,
            attackRange: 6.0,
            attackSpeed: 2.5,
            visionRange: 9.0,
            
            modelName: "rocketeer_model",
            iconName: "rocketeer_icon",
            
            unitClass: .aircraft,
            special: .antiAir
        )
    }
    
    private func createMirageType() -> UnitTypeData {
        return UnitTypeData(
            name: "Mirage Tank",
            description: "Stealth tank with powerful cannon",
            health: 250,
            armor: 1,
            speed: 7.0,
            cost: Resources(credits: 1000),
            buildTime: 25.0,
            
            canAttack: true,
            canConstruct: false,
            canCapture: false,
            canRepair: false,
            
            attackDamage: 80,
            attackRange: 8.0,
            attackSpeed: 3.0,
            visionRange: 8.0,
            
            modelName: "mirage_tank_model",
            iconName: "mirage_tank_icon",
            
            unitClass: .vehicle,
            special: .stealth
        )
    }
    
    private func createPrismType() -> UnitTypeData {
        return UnitTypeData(
            name: "Prism Tank",
            description: "Advanced tank with prism beam",
            health: 200,
            armor: 1,
            speed: 5.0,
            cost: Resources(credits: 1200),
            buildTime: 30.0,
            
            canAttack: true,
            canConstruct: false,
            canCapture: false,
            canRepair: false,
            
            attackDamage: 120,
            attackRange: 9.0,
            attackSpeed: 3.5,
            visionRange: 10.0,
            
            modelName: "prism_tank_model",
            iconName: "prism_tank_icon",
            
            unitClass: .vehicle,
            special: .beam
        )
    }
    
    private func createChronoLegionnaireType() -> UnitTypeData {
        return UnitTypeData(
            name: "Chrono Legionnaire",
            description: "Time-based infantry unit",
            health: 120,
            armor: 0,
            speed: 4.0,
            cost: Resources(credits: 1500),
            buildTime: 35.0,
            
            canAttack: true,
            canConstruct: false,
            canCapture: false,
            canRepair: false,
            
            attackDamage: 200,
            attackRange: 4.0,
            attackSpeed: 5.0,
            visionRange: 7.0,
            
            modelName: "chrono_legionnaire_model",
            iconName: "chrono_legionnaire_icon",
            
            unitClass: .infantry,
            special: .chrono
        )
    }
    
    private func createSpySatelliteType() -> UnitTypeData {
        return UnitTypeData(
            name: "Spy Satellite",
            description: "Reconnaissance satellite",
            health: 50,
            armor: 0,
            speed: 0.0,
            cost: Resources(credits: 1000),
            buildTime: 20.0,
            
            canAttack: false,
            canConstruct: false,
            canCapture: false,
            canRepair: false,
            
            attackDamage: 0,
            attackRange: 0,
            attackSpeed: 0,
            visionRange: 30.0,
            
            modelName: "spy_satellite_model",
            iconName: "spy_satellite_icon",
            
            unitClass: .aircraft,
            special: .reconnaissance
        )
    }
    
    // Soviet Units
    private func createConscriptType() -> UnitTypeData {
        return UnitTypeData(
            name: "Conscript",
            description: "Basic Soviet infantry",
            health: 120,
            armor: 0,
            speed: 3.5,
            cost: Resources(credits: 100),
            buildTime: 4.0,
            
            canAttack: true,
            canConstruct: false,
            canCapture: false,
            canRepair: false,
            
            attackDamage: 12,
            attackRange: 4.0,
            attackSpeed: 0.8,
            visionRange: 6.0,
            
            modelName: "conscript_model",
            iconName: "conscript_icon",
            
            unitClass: .infantry,
            special: .none
        )
    }
    
    private func createFlakTrooperType() -> UnitTypeData {
        return UnitTypeData(
            name: "Flak Trooper",
            description: "Anti-aircraft infantry",
            health: 100,
            armor: 0,
            speed: 3.5,
            cost: Resources(credits: 300),
            buildTime: 8.0,
            
            canAttack: true,
            canConstruct: false,
            canCapture: false,
            canRepair: false,
            
            attackDamage: 40,
            attackRange: 8.0,
            attackSpeed: 1.5,
            visionRange: 9.0,
            
            modelName: "flak_trooper_model",
            iconName: "flak_trooper_icon",
            
            unitClass: .infantry,
            special: .antiAir
        )
    }
    
    private func createRhinoTankType() -> UnitTypeData {
        return UnitTypeData(
            name: "Rhino Tank",
            description: "Soviet heavy tank",
            health: 400,
            armor: 3,
            speed: 4.0,
            cost: Resources(credits: 900),
            buildTime: 25.0,
            
            canAttack: true,
            canConstruct: false,
            canCapture: false,
            canRepair: false,
            
            attackDamage: 90,
            attackRange: 6.0,
            attackSpeed: 2.5,
            visionRange: 7.0,
            
            modelName: "rhino_tank_model",
            iconName: "rhino_tank_icon",
            
            unitClass: .vehicle,
            special: .none
        )
    }
    
    private func createApocalypseTankType() -> UnitTypeData {
        return UnitTypeData(
            name: "Apocalypse Tank",
            description: "Ultimate Soviet tank",
            health: 800,
            armor: 5,
            speed: 2.0,
            cost: Resources(credits: 1750),
            buildTime: 45.0,
            
            canAttack: true,
            canConstruct: false,
            canCapture: false,
            canRepair: false,
            
            attackDamage: 200,
            attackRange: 8.0,
            attackSpeed: 4.0,
            visionRange: 8.0,
            
            modelName: "apocalypse_tank_model",
            iconName: "apocalypse_tank_icon",
            
            unitClass: .vehicle,
            special: .heavy
        )
    }
    
    private func createTerrorDroneType() -> UnitTypeData {
        return UnitTypeData(
            name: "Terror Drone",
            description: "Fast attack drone",
            health: 100,
            armor: 1,
            speed: 8.0,
            cost: Resources(credits: 500),
            buildTime: 12.0,
            
            canAttack: true,
            canConstruct: false,
            canCapture: false,
            canRepair: false,
            
            attackDamage: 35,
            attackRange: 1.0,
            attackSpeed: 1.0,
            visionRange: 6.0,
            
            modelName: "terror_drone_model",
            iconName: "terror_drone_icon",
            
            unitClass: .vehicle,
            special: .drone
        )
    }
    
    private func createKirovAirshipType() -> UnitTypeData {
        return UnitTypeData(
            name: "Kirov Airship",
            description: "Heavy bombing airship",
            health: 1000,
            armor: 2,
            speed: 2.0,
            cost: Resources(credits: 2000),
            buildTime: 60.0,
            
            canAttack: true,
            canConstruct: false,
            canCapture: false,
            canRepair: false,
            
            attackDamage: 300,
            attackRange: 1.0,
            attackSpeed: 8.0,
            visionRange: 10.0,
            
            modelName: "kirov_airship_model",
            iconName: "kirov_airship_icon",
            
            unitClass: .aircraft,
            special: .bomber
        )
    }
    
    // Empire Units (abbreviated for space)
    private func createImperialWarriorType() -> UnitTypeData {
        return UnitTypeData(
            name: "Imperial Warrior",
            description: "Elite Empire infantry",
            health: 110,
            armor: 1,
            speed: 4.5,
            cost: Resources(credits: 250),
            buildTime: 6.0,
            
            canAttack: true,
            attackDamage: 18,
            attackRange: 5.0,
            attackSpeed: 1.2,
            visionRange: 7.0,
            
            modelName: "imperial_warrior_model",
            iconName: "imperial_warrior_icon",
            
            unitClass: .infantry,
            special: .none
        )
    }
    
    // ... (Continue with other unit types, abbreviated for space)
    
    private func createArcherType() -> UnitTypeData {
        return UnitTypeData(
            name: "Archer Maiden",
            description: "Long-range archer unit",
            health: 90,
            armor: 0,
            speed: 4.0,
            cost: Resources(credits: 400),
            buildTime: 10.0,
            
            canAttack: true,
            attackDamage: 30,
            attackRange: 9.0,
            attackSpeed: 1.8,
            visionRange: 10.0,
            
            modelName: "archer_model",
            iconName: "archer_icon",
            
            unitClass: .infantry,
            special: .longRange
        )
    }
    
    // Additional unit types would continue here...
    // For brevity, I'll create simplified versions of the remaining types
    
    private func createTsunamiTankType() -> UnitTypeData {
        return createStandardTankType("Tsunami Tank", damage: 75, health: 350, cost: 800)
    }
    
    private func createKingOniType() -> UnitTypeData {
        return createStandardTankType("King Oni", damage: 150, health: 600, cost: 1400)
    }
    
    private func createNanocoreFabricatorType() -> UnitTypeData {
        return createStandardVehicleType("Nanocore Fabricator", damage: 0, health: 200, cost: 1000, special: .constructor)
    }
    
    private func createRocketAngelType() -> UnitTypeData {
        return createStandardAircraftType("Rocket Angel", damage: 45, health: 90, cost: 700)
    }
    
    private func createConfederateInfantryType() -> UnitTypeData {
        return createStandardInfantryType("Confederate Infantry", damage: 16, health: 105, cost: 220)
    }
    
    private func createCrusaderTankType() -> UnitTypeData {
        return createStandardTankType("Crusader Tank", damage: 70, health: 320, cost: 750)
    }
    
    private func createMarineInfantryType() -> UnitTypeData {
        return createStandardInfantryType("Marine Infantry", damage: 20, health: 110, cost: 280)
    }
    
    private func createAmphibiousTankType() -> UnitTypeData {
        return createStandardTankType("Amphibious Tank", damage: 60, health: 280, cost: 650)
    }
    
    private func createMilitiaFighterType() -> UnitTypeData {
        return createStandardInfantryType("Militia Fighter", damage: 14, health: 95, cost: 150)
    }
    
    private func createScorpionTankType() -> UnitTypeData {
        return createStandardTankType("Scorpion Tank", damage: 55, health: 260, cost: 600)
    }
    
    private func createArcticTrooperType() -> UnitTypeData {
        return createStandardInfantryType("Arctic Trooper", damage: 18, health: 115, cost: 260)
    }
    
    private func createMammothTankType() -> UnitTypeData {
        return createStandardTankType("Mammoth Tank", damage: 180, health: 700, cost: 1600)
    }
    
    private func createMercenaryType() -> UnitTypeData {
        return createStandardInfantryType("Mercenary", damage: 22, health: 100, cost: 350)
    }
    
    private func createTitanTankType() -> UnitTypeData {
        return createStandardTankType("Titan Tank", damage: 95, health: 380, cost: 950)
    }
    
    private func createRebelType() -> UnitTypeData {
        return createStandardInfantryType("Rebel", damage: 10, health: 80, cost: 80)
    }
    
    private func createSalvageTankType() -> UnitTypeData {
        return createStandardTankType("Salvage Tank", damage: 45, health: 220, cost: 400)
    }
    
    // Helper methods for creating standard unit types
    private func createStandardInfantryType(_ name: String, damage: Int, health: Int, cost: Int, special: UnitSpecial = .none) -> UnitTypeData {
        return UnitTypeData(
            name: name,
            description: "\(name) unit",
            health: health,
            armor: 0,
            speed: 4.0,
            cost: Resources(credits: cost),
            buildTime: Float(cost) / 50.0,
            
            canAttack: true,
            attackDamage: damage,
            attackRange: 5.0,
            attackSpeed: 1.0,
            visionRange: 7.0,
            
            modelName: "\(name.lowercased().replacingOccurrences(of: " ", with: "_"))_model",
            iconName: "\(name.lowercased().replacingOccurrences(of: " ", with: "_"))_icon",
            
            unitClass: .infantry,
            special: special
        )
    }
    
    private func createStandardTankType(_ name: String, damage: Int, health: Int, cost: Int, special: UnitSpecial = .none) -> UnitTypeData {
        return UnitTypeData(
            name: name,
            description: "\(name) unit",
            health: health,
            armor: 2,
            speed: 5.0,
            cost: Resources(credits: cost),
            buildTime: Float(cost) / 40.0,
            
            canAttack: true,
            attackDamage: damage,
            attackRange: 7.0,
            attackSpeed: 2.0,
            visionRange: 8.0,
            
            modelName: "\(name.lowercased().replacingOccurrences(of: " ", with: "_"))_model",
            iconName: "\(name.lowercased().replacingOccurrences(of: " ", with: "_"))_icon",
            
            unitClass: .vehicle,
            special: special
        )
    }
    
    private func createStandardVehicleType(_ name: String, damage: Int, health: Int, cost: Int, special: UnitSpecial = .none) -> UnitTypeData {
        return UnitTypeData(
            name: name,
            description: "\(name) unit",
            health: health,
            armor: 1,
            speed: 6.0,
            cost: Resources(credits: cost),
            buildTime: Float(cost) / 45.0,
            
            canAttack: damage > 0,
            attackDamage: damage,
            attackRange: 6.0,
            attackSpeed: 1.5,
            visionRange: 8.0,
            
            modelName: "\(name.lowercased().replacingOccurrences(of: " ", with: "_"))_model",
            iconName: "\(name.lowercased().replacingOccurrences(of: " ", with: "_"))_icon",
            
            unitClass: .vehicle,
            special: special
        )
    }
    
    private func createStandardAircraftType(_ name: String, damage: Int, health: Int, cost: Int, special: UnitSpecial = .none) -> UnitTypeData {
        return UnitTypeData(
            name: name,
            description: "\(name) unit",
            health: health,
            armor: 0,
            speed: 8.0,
            cost: Resources(credits: cost),
            buildTime: Float(cost) / 35.0,
            
            canAttack: true,
            attackDamage: damage,
            attackRange: 6.0,
            attackSpeed: 1.8,
            visionRange: 10.0,
            
            modelName: "\(name.lowercased().replacingOccurrences(of: " ", with: "_"))_model",
            iconName: "\(name.lowercased().replacingOccurrences(of: " ", with: "_"))_icon",
            
            unitClass: .aircraft,
            special: special
        )
    }
}