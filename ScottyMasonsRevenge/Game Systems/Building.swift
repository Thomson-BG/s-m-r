import Foundation
import SceneKit

// MARK: - Building Class

class Building: GameObject {
    let buildingType: BuildingType
    let faction: Faction
    private let buildingData: BuildingTypeData
    
    // Building status
    private(set) var isConstructed: Bool = false
    private(set) var constructionProgress: Float = 0.0
    private(set) var isOperational: Bool = false
    private(set) var powerEfficiency: Float = 1.0
    
    // Production
    private var productionQueue: [ProductionOrder] = []
    private var currentProduction: ProductionOrder?
    private var productionProgress: Float = 0.0
    
    // Selection
    private(set) var isSelected: Bool = false
    private var selectionIndicator: SCNNode?
    
    // Visual components
    private var modelNode: SCNNode!
    private var constructionIndicator: SCNNode?
    private var productionIndicator: SCNNode?
    private var healthBar: SCNNode?
    
    init(type: BuildingType, faction: Faction, data: BuildingTypeData) {
        self.buildingType = type
        self.faction = faction
        self.buildingData = data
        
        super.init()
        
        // Set health
        setMaxHealth(data.health)
        
        setupModel()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // MARK: - Setup
    
    private func setupModel() {
        // Create main model node
        modelNode = SCNNode()
        addChildNode(modelNode)
        
        // Create building geometry
        let geometry = createBuildingGeometry()
        modelNode.geometry = geometry
        
        // Apply faction styling
        applyFactionStyling()
        
        // Setup physics
        setupPhysics()
        
        // Create health bar
        createHealthBar()
    }
    
    private func createBuildingGeometry() -> SCNGeometry {
        let size = buildingData.size
        
        // Base geometry based on building class
        let geometry: SCNGeometry
        
        switch buildingData.buildingClass {
        case .production:
            geometry = SCNBox(width: CGFloat(size), height: CGFloat(size * 0.6), length: CGFloat(size), chamferRadius: 0.2)
        case .defense:
            geometry = SCNCylinder(radius: CGFloat(size * 0.4), height: CGFloat(size * 0.8))
        case .utility:
            geometry = SCNBox(width: CGFloat(size * 0.8), height: CGFloat(size * 1.2), length: CGFloat(size * 0.8), chamferRadius: 0.1)
        case .economic:
            geometry = SCNBox(width: CGFloat(size * 1.2), height: CGFloat(size * 0.5), length: CGFloat(size), chamferRadius: 0.3)
        case .superweapon:
            geometry = SCNSphere(radius: CGFloat(size * 0.6))
        }
        
        // Apply base material
        let material = SCNMaterial()
        material.diffuse.contents = getBaseBuildingColor()
        material.metalness.contents = 0.3
        material.roughness.contents = 0.7
        geometry.materials = [material]
        
        return geometry
    }
    
    private func getBaseBuildingColor() -> UIColor {
        switch buildingData.buildingClass {
        case .production: return UIColor.darkGray
        case .defense: return UIColor.gray
        case .utility: return UIColor.lightGray
        case .economic: return UIColor.brown
        case .superweapon: return UIColor.purple
        }
    }
    
    private func applyFactionStyling() {
        guard let factionData = FactionManager.shared.getFactionData(faction) else { return }
        
        // Add faction color accent
        let accentSize = buildingData.size * 0.1
        let accentGeometry = SCNBox(width: CGFloat(accentSize), height: CGFloat(accentSize), length: CGFloat(accentSize), chamferRadius: 0.02)
        accentGeometry.materials.first?.diffuse.contents = factionData.color
        
        let accentNode = SCNNode(geometry: accentGeometry)
        accentNode.position = SCNVector3(0, buildingData.size * 0.5, 0)
        modelNode.addChildNode(accentNode)
        
        // Add faction emblem
        let textGeometry = SCNText(string: factionData.emblem, extrusionDepth: 0.05)
        textGeometry.font = UIFont.systemFont(ofSize: 0.5)
        textGeometry.materials.first?.diffuse.contents = factionData.color
        
        let textNode = SCNNode(geometry: textGeometry)
        textNode.position = SCNVector3(-0.2, buildingData.size * 0.3, buildingData.size * 0.5 + 0.1)
        modelNode.addChildNode(textNode)
    }
    
    private func setupPhysics() {
        let shape = SCNPhysicsShape(geometry: modelNode.geometry!, options: nil)
        physicsBody = SCNPhysicsBody(type: .static, shape: shape)
        physicsBody?.categoryBitMask = PhysicsCategory.building
        physicsBody?.collisionBitMask = PhysicsCategory.unit | PhysicsCategory.projectile
        physicsBody?.contactTestBitMask = PhysicsCategory.projectile
    }
    
    private func createHealthBar() {
        let barWidth = buildingData.size * 1.2
        let barHeight: Float = 0.2
        
        let barBackground = SCNBox(width: CGFloat(barWidth), height: CGFloat(barHeight), length: 0.05, chamferRadius: 0)
        barBackground.materials.first?.diffuse.contents = UIColor.black
        
        let backgroundNode = SCNNode(geometry: barBackground)
        backgroundNode.position = SCNVector3(0, buildingData.size * 0.8, 0)
        
        let barForeground = SCNBox(width: CGFloat(barWidth), height: CGFloat(barHeight), length: 0.05, chamferRadius: 0)
        barForeground.materials.first?.diffuse.contents = UIColor.green
        
        healthBar = SCNNode(geometry: barForeground)
        healthBar?.position = SCNVector3(0, 0, 0.001)
        backgroundNode.addChildNode(healthBar!)
        
        addChildNode(backgroundNode)
    }
    
    // MARK: - Placement and Construction
    
    func place(at position: SCNVector3) {
        self.position = position
        
        if buildingData.buildTime > 0 {
            startConstruction()
        } else {
            // Instant construction (e.g., Construction Yard)
            completeConstruction()
        }
    }
    
    func startConstruction() {
        isConstructed = false
        isOperational = false
        constructionProgress = 0.0
        
        showConstructionIndicator()
        
        // Set partial transparency during construction
        modelNode.opacity = 0.5
    }
    
    private func updateConstruction(deltaTime: Float) {
        guard !isConstructed else { return }
        
        let constructionRate = 1.0 / buildingData.buildTime
        constructionProgress += constructionRate * deltaTime * powerEfficiency
        
        // Update visual progress
        modelNode.opacity = 0.5 + (constructionProgress * 0.5)
        
        if constructionProgress >= 1.0 {
            completeConstruction()
        }
    }
    
    private func completeConstruction() {
        isConstructed = true
        isOperational = true
        constructionProgress = 1.0
        
        hideConstructionIndicator()
        modelNode.opacity = 1.0
        
        print("🏗️ \(buildingData.name) construction completed")
    }
    
    private func showConstructionIndicator() {
        hideConstructionIndicator()
        
        let indicator = SCNNode(geometry: SCNSphere(radius: 0.3))
        indicator.geometry?.materials.first?.diffuse.contents = UIColor.orange
        indicator.position = SCNVector3(0, buildingData.size + 1.0, 0)
        
        constructionIndicator = indicator
        addChildNode(indicator)
        
        // Animate construction indicator
        let rotateAction = SCNAction.rotateBy(x: 0, y: Float.pi * 2, z: 0, duration: 1.0)
        let repeatAction = SCNAction.repeatForever(rotateAction)
        indicator.runAction(repeatAction)
    }
    
    private func hideConstructionIndicator() {
        constructionIndicator?.removeFromParentNode()
        constructionIndicator = nil
    }
    
    // MARK: - Production System
    
    func canProduceUnit(_ unitType: UnitType) -> Bool {
        return isOperational && buildingData.canProduceUnits && buildingData.producibleUnits.contains(unitType)
    }
    
    func canProduceBuilding(_ buildingType: BuildingType) -> Bool {
        return isOperational && buildingData.canProduceBuildings && buildingData.producibleBuildings.contains(buildingType)
    }
    
    func queueUnit(_ unitType: UnitType) {
        guard canProduceUnit(unitType) else { return }
        
        let order = ProductionOrder(type: .unit(unitType), buildTime: UnitManager.shared.unitTypes[unitType]?.buildTime ?? 10.0)
        productionQueue.append(order)
        
        if currentProduction == nil {
            startNextProduction()
        }
        
        showProductionIndicator()
    }
    
    func queueBuilding(_ buildingType: BuildingType) {
        guard canProduceBuilding(buildingType) else { return }
        
        let order = ProductionOrder(type: .building(buildingType), buildTime: BuildingManager.shared.buildingTypes[buildingType]?.buildTime ?? 30.0)
        productionQueue.append(order)
        
        if currentProduction == nil {
            startNextProduction()
        }
        
        showProductionIndicator()
    }
    
    private func startNextProduction() {
        guard !productionQueue.isEmpty else {
            currentProduction = nil
            hideProductionIndicator()
            return
        }
        
        currentProduction = productionQueue.removeFirst()
        productionProgress = 0.0
    }
    
    private func updateProduction(deltaTime: Float) {
        guard let production = currentProduction else { return }
        
        let productionRate = 1.0 / production.buildTime
        productionProgress += productionRate * deltaTime * powerEfficiency
        
        if productionProgress >= 1.0 {
            completeProduction(production)
            startNextProduction()
        }
    }
    
    private func completeProduction(_ production: ProductionOrder) {
        switch production.type {
        case .unit(let unitType):
            // Create and deploy unit
            let unit = UnitManager.shared.createUnit(unitType, for: faction)
            let deployPosition = findUnitDeployPosition()
            UnitManager.shared.deployUnit(unit, at: deployPosition)
            print("🪖 \(unitType.displayName) production completed")
            
        case .building(let buildingType):
            // Building production completed (handled by BuildingManager)
            print("🏗️ \(buildingType.displayName) production completed")
        }
    }
    
    private func findUnitDeployPosition() -> SCNVector3 {
        let deployDistance = buildingData.size + 2.0
        
        // Try positions around the building
        for angle in stride(from: 0.0, to: 2.0 * Float.pi, by: Float.pi / 4) {
            let testPosition = SCNVector3(
                position.x + cos(angle) * deployDistance,
                position.y,
                position.z + sin(angle) * deployDistance
            )
            
            // Check if position is clear
            if isDeployPositionClear(testPosition) {
                return testPosition
            }
        }
        
        // Fallback to building position
        return position
    }
    
    private func isDeployPositionClear(_ position: SCNVector3) -> Bool {
        // Check against other units
        for unit in UnitManager.shared.getAllUnits() {
            if unit.distanceToPosition(position) < 2.0 {
                return false
            }
        }
        
        // Check against buildings
        for building in BuildingManager.shared.getAllBuildings() {
            if building.distanceToPosition(position) < building.buildingData.size {
                return false
            }
        }
        
        return true
    }
    
    private func showProductionIndicator() {
        guard productionIndicator == nil else { return }
        
        let indicator = SCNNode(geometry: SCNBox(width: 0.5, height: 0.5, length: 0.5, chamferRadius: 0.1))
        indicator.geometry?.materials.first?.diffuse.contents = UIColor.green
        indicator.position = SCNVector3(buildingData.size * 0.5, buildingData.size * 0.5, 0)
        
        productionIndicator = indicator
        addChildNode(indicator)
        
        // Animate production indicator
        let scaleUp = SCNAction.scale(to: 1.2, duration: 0.5)
        let scaleDown = SCNAction.scale(to: 0.8, duration: 0.5)
        let sequence = SCNAction.sequence([scaleUp, scaleDown])
        let repeatAction = SCNAction.repeatForever(sequence)
        indicator.runAction(repeatAction)
    }
    
    private func hideProductionIndicator() {
        productionIndicator?.removeFromParentNode()
        productionIndicator = nil
    }
    
    // MARK: - Power and Efficiency
    
    func setPowerEfficiency(_ efficiency: Float) {
        powerEfficiency = max(0.0, min(1.0, efficiency))
        updateOperationalStatus()
    }
    
    private func updateOperationalStatus() {
        isOperational = isConstructed && powerEfficiency > 0.0
        
        // Update visual indication based on power status
        if powerEfficiency < 1.0 {
            // Add power shortage visual effect
            modelNode.opacity = 0.7 + (powerEfficiency * 0.3)
        } else {
            modelNode.opacity = 1.0
        }
    }
    
    // MARK: - Health and Damage
    
    override func takeDamage(_ amount: Int, from attacker: GameObject? = nil) {
        // Apply building armor
        let armorValue = buildingData.armor
        let reducedDamage = max(1, amount - armorValue)
        
        super.takeDamage(reducedDamage, from: attacker)
        updateHealthBar()
        
        // Stop production if heavily damaged
        if currentHealth < maxHealth / 2 {
            powerEfficiency *= 0.5
        }
    }
    
    private func updateHealthBar() {
        guard let healthBar = healthBar else { return }
        
        let healthPercentage = Float(currentHealth) / Float(maxHealth)
        healthBar.scale = SCNVector3(healthPercentage, 1.0, 1.0)
        
        // Update color based on health
        let material = healthBar.geometry?.materials.first
        if healthPercentage > 0.6 {
            material?.diffuse.contents = UIColor.green
        } else if healthPercentage > 0.3 {
            material?.diffuse.contents = UIColor.yellow
        } else {
            material?.diffuse.contents = UIColor.red
        }
    }
    
    // MARK: - Selection
    
    func setSelected(_ selected: Bool) {
        isSelected = selected
        
        if selected {
            showSelectionIndicator()
        } else {
            hideSelectionIndicator()
        }
    }
    
    private func showSelectionIndicator() {
        hideSelectionIndicator()
        
        let ringRadius = buildingData.size * 0.8
        let ringGeometry = SCNTorus(ringRadius: CGFloat(ringRadius), pipeRadius: 0.1)
        ringGeometry.materials.first?.diffuse.contents = UIColor.cyan
        
        selectionIndicator = SCNNode(geometry: ringGeometry)
        selectionIndicator?.position = SCNVector3(0, 0.2, 0)
        addChildNode(selectionIndicator!)
        
        // Animate selection ring
        let rotateAction = SCNAction.rotateBy(x: 0, y: Float.pi * 2, z: 0, duration: 3.0)
        let repeatAction = SCNAction.repeatForever(rotateAction)
        selectionIndicator?.runAction(repeatAction)
    }
    
    private func hideSelectionIndicator() {
        selectionIndicator?.removeFromParentNode()
        selectionIndicator = nil
    }
    
    // MARK: - Update
    
    func update(deltaTime: Float) {
        updateConstruction(deltaTime: deltaTime)
        updateProduction(deltaTime: deltaTime)
        updateOperationalStatus()
    }
    
    // MARK: - Save/Load
    
    func loadFromSave(_ saveData: BuildingSaveData) {
        position = saveData.position
        currentHealth = saveData.currentHealth
        isConstructed = saveData.isConstructed
        constructionProgress = saveData.constructionProgress
        isOperational = saveData.isOperational
        
        if isConstructed {
            completeConstruction()
        } else {
            startConstruction()
        }
        
        updateHealthBar()
    }
    
    override func destroy() {
        hideSelectionIndicator()
        hideConstructionIndicator()
        hideProductionIndicator()
        super.destroy()
    }
}

// MARK: - Supporting Types

enum BuildingClass: String, CaseIterable, Codable {
    case production
    case defense
    case utility
    case economic
    case superweapon
}

enum ProductionType {
    case unit(UnitType)
    case building(BuildingType)
}

struct ProductionOrder {
    let type: ProductionType
    let buildTime: Float
}

struct BuildingTypeData {
    let name: String
    let description: String
    
    // Basic stats
    let health: Int
    let armor: Int
    let cost: Resources
    let buildTime: Float
    let size: Float
    
    // Capabilities
    let canProduceUnits: Bool
    let canProduceBuildings: Bool
    let powerGeneration: Int
    let powerConsumption: Int
    let resourceGeneration: Int
    
    // Production options
    let producibleUnits: [UnitType]
    let producibleBuildings: [BuildingType]
    
    // Visual
    let modelName: String
    let iconName: String
    
    // Classification
    let buildingClass: BuildingClass
    let isDefensive: Bool
}

// MARK: - Building Types Enumeration

enum BuildingType: String, CaseIterable, Codable {
    // Universal Buildings
    case constructionYard = "construction_yard"
    case powerPlant = "power_plant"
    case barracks = "barracks"
    case refinery = "refinery"
    
    // Allied Buildings
    case prismTower = "prism_tower"
    case chronosphere = "chronosphere"
    case gapGenerator = "gap_generator"
    case alliedAirfield = "allied_airfield"
    
    // Soviet Buildings
    case teslaCoil = "tesla_coil"
    case ironCurtain = "iron_curtain"
    case nuclearReactor = "nuclear_reactor"
    case sovietAirfield = "soviet_airfield"
    
    // Empire Buildings
    case waveForceGun = "wave_force_gun"
    case psionicDecimator = "psionic_decimator"
    case nanoswarmHive = "nanoswarm_hive"
    case empireAirfield = "empire_airfield"
    
    // European Confederation
    case aegisDefense = "aegis_defense"
    case weatherController = "weather_controller"
    case forceShield = "force_shield"
    case confederateAirbase = "confederate_airbase"
    
    // Pacific Republic
    case navalYard = "naval_yard"
    case sonarPulse = "sonar_pulse"
    case tidalGenerator = "tidal_generator"
    case aircraftCarrier = "aircraft_carrier"
    
    // African Federation
    case mineralProcessor = "mineral_processor"
    case dustStorm = "dust_storm"
    case guerrillaBase = "guerrilla_base"
    case solarArray = "solar_array"
    
    // Arctic Coalition
    case thermalPowerPlant = "thermal_power_plant"
    case cryoLab = "cryo_lab"
    case iceBarrier = "ice_barrier"
    case arcticBase = "arctic_base"
    
    // Corporate Syndicate
    case corporateHQ = "corporate_hq"
    case economicCenter = "economic_center"
    case stealthGenerator = "stealth_generator"
    case techLab = "tech_lab"
    
    // Global Resistance
    case scrapyard = "scrapyard"
    case guerrillaOutpost = "guerrilla_outpost"
    case undergroundBase = "underground_base"
    case radioTower = "radio_tower"
    
    var displayName: String {
        return rawValue.replacingOccurrences(of: "_", with: " ").capitalized
    }
}

// MARK: - Building Save Data

struct BuildingSaveData: Codable {
    let id: UUID
    let buildingType: BuildingType
    let faction: Faction
    let position: SCNVector3
    let currentHealth: Int
    let isConstructed: Bool
    let constructionProgress: Float
    let isOperational: Bool
    
    init(from building: Building) {
        self.id = building.id
        self.buildingType = building.buildingType
        self.faction = building.faction
        self.position = building.position
        self.currentHealth = building.currentHealth
        self.isConstructed = building.isConstructed
        self.constructionProgress = building.constructionProgress
        self.isOperational = building.isOperational
    }
}