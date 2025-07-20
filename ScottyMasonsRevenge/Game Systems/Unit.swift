import Foundation
import SceneKit

// MARK: - Unit Class

class Unit: GameObject {
    let unitType: UnitType
    let faction: Faction
    private let unitData: UnitTypeData
    
    // Health and status
    private(set) var maxHealth: Int
    private(set) var currentHealth: Int
    private(set) var armor: Int
    private(set) var isOperational: Bool = true
    
    // Movement and positioning
    private(set) var speed: Float
    private var targetPosition: SCNVector3?
    private var movementQueue: [SCNVector3] = []
    
    // Combat
    private(set) var attackDamage: Int
    private(set) var attackRange: Float
    private(set) var attackSpeed: Float
    private(set) var visionRange: Float
    private var lastAttackTime: TimeInterval = 0
    private(set) var currentTarget: GameObject?
    
    // Experience and veterancy
    private(set) var experience: Int = 0
    private(set) var veterancyLevel: VeterancyLevel = .rookie
    
    // Capabilities
    let canAttack: Bool
    let canConstruct: Bool
    let canCapture: Bool
    let canRepair: Bool
    
    // State
    private(set) var currentState: UnitState = .idle
    private(set) var isSelected: Bool = false
    
    // 3D Model
    private var modelNode: SCNNode!
    private var selectionIndicator: SCNNode?
    private var healthBar: SCNNode?
    
    // Resource generation (for harvesters, etc.)
    let resourceGeneration: Int
    
    init(type: UnitType, faction: Faction, data: UnitTypeData) {
        self.unitType = type
        self.faction = faction
        self.unitData = data
        
        // Initialize stats
        self.maxHealth = data.health
        self.currentHealth = data.health
        self.armor = data.armor
        self.speed = data.speed
        self.attackDamage = data.attackDamage
        self.attackRange = data.attackRange
        self.attackSpeed = data.attackSpeed
        self.visionRange = data.visionRange
        
        // Capabilities
        self.canAttack = data.canAttack
        self.canConstruct = data.canConstruct
        self.canCapture = data.canCapture
        self.canRepair = data.canRepair
        
        // Resource generation
        self.resourceGeneration = data.resourceGeneration
        
        super.init()
        
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
        
        // Load 3D model (placeholder geometry for now)
        let geometry = createModelGeometry()
        modelNode.geometry = geometry
        
        // Apply faction colors
        applyFactionStyling()
        
        // Setup physics body
        setupPhysics()
        
        // Create health bar
        createHealthBar()
    }
    
    private func createModelGeometry() -> SCNGeometry {
        // Create placeholder geometry based on unit class
        switch unitData.unitClass {
        case .infantry:
            let geometry = SCNCapsule(capRadius: 0.3, height: 1.8)
            geometry.materials.first?.diffuse.contents = UIColor.brown
            return geometry
            
        case .vehicle:
            let geometry = SCNBox(width: 2.0, height: 1.0, length: 3.0, chamferRadius: 0.2)
            geometry.materials.first?.diffuse.contents = UIColor.darkGray
            return geometry
            
        case .aircraft:
            let geometry = SCNBox(width: 3.0, height: 0.5, length: 2.0, chamferRadius: 0.1)
            geometry.materials.first?.diffuse.contents = UIColor.lightGray
            return geometry
            
        case .naval:
            let geometry = SCNBox(width: 2.0, height: 1.5, length: 4.0, chamferRadius: 0.3)
            geometry.materials.first?.diffuse.contents = UIColor.blue
            return geometry
        }
    }
    
    private func applyFactionStyling() {
        guard let factionData = FactionManager.shared.getFactionData(faction) else { return }
        
        // Apply faction color accent
        let accentGeometry = SCNBox(width: 0.5, height: 0.1, length: 0.5, chamferRadius: 0.05)
        accentGeometry.materials.first?.diffuse.contents = factionData.color
        
        let accentNode = SCNNode(geometry: accentGeometry)
        accentNode.position = SCNVector3(0, 1.0, 0)
        modelNode.addChildNode(accentNode)
    }
    
    private func setupPhysics() {
        let shape = SCNPhysicsShape(geometry: modelNode.geometry!, options: nil)
        physicsBody = SCNPhysicsBody(type: .kinematic, shape: shape)
        physicsBody?.categoryBitMask = PhysicsCategory.unit
        physicsBody?.collisionBitMask = PhysicsCategory.terrain | PhysicsCategory.unit | PhysicsCategory.building
        physicsBody?.contactTestBitMask = PhysicsCategory.projectile
    }
    
    private func createHealthBar() {
        let barBackground = SCNBox(width: 1.0, height: 0.1, length: 0.05, chamferRadius: 0)
        barBackground.materials.first?.diffuse.contents = UIColor.black
        
        let backgroundNode = SCNNode(geometry: barBackground)
        backgroundNode.position = SCNVector3(0, 2.0, 0)
        
        let barForeground = SCNBox(width: 1.0, height: 0.1, length: 0.05, chamferRadius: 0)
        barForeground.materials.first?.diffuse.contents = UIColor.green
        
        healthBar = SCNNode(geometry: barForeground)
        healthBar?.position = SCNVector3(0, 0, 0.001)
        backgroundNode.addChildNode(healthBar!)
        
        addChildNode(backgroundNode)
    }
    
    // MARK: - Deployment
    
    func deploy(at position: SCNVector3) {
        self.position = position
        currentState = .idle
        isOperational = true
    }
    
    // MARK: - Movement
    
    func moveTo(_ position: SCNVector3) {
        targetPosition = position
        currentState = .moving
    }
    
    func queueMove(_ position: SCNVector3) {
        movementQueue.append(position)
    }
    
    func stop() {
        targetPosition = nil
        movementQueue.removeAll()
        currentState = .idle
    }
    
    private func updateMovement(deltaTime: Float) {
        guard let target = targetPosition else { return }
        
        let direction = SCNVector3(
            target.x - position.x,
            target.y - position.y,
            target.z - position.z
        )
        
        let distance = sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z)
        
        if distance < 0.5 {
            // Reached target
            position = target
            targetPosition = nil
            
            // Check for queued moves
            if !movementQueue.isEmpty {
                targetPosition = movementQueue.removeFirst()
            } else {
                currentState = .idle
            }
        } else {
            // Move towards target
            let normalizedDirection = SCNVector3(
                direction.x / distance,
                direction.y / distance,
                direction.z / distance
            )
            
            let moveDistance = speed * deltaTime
            position = SCNVector3(
                position.x + normalizedDirection.x * moveDistance,
                position.y + normalizedDirection.y * moveDistance,
                position.z + normalizedDirection.z * moveDistance
            )
            
            // Rotate to face movement direction
            if distance > 0 {
                let angle = atan2(normalizedDirection.x, normalizedDirection.z)
                rotation = SCNVector4(0, 1, 0, angle)
            }
        }
    }
    
    // MARK: - Combat
    
    func attackTarget(_ target: GameObject) {
        if canAttack && canAttackTarget(target) {
            currentTarget = target
            currentState = .attacking
        }
    }
    
    func canAttackTarget(_ target: GameObject) -> Bool {
        guard canAttack else { return false }
        
        let distance = distanceTo(target)
        return distance <= attackRange
    }
    
    private func updateCombat(deltaTime: Float) {
        guard let target = currentTarget else {
            currentState = .idle
            return
        }
        
        // Check if target is still valid
        if target.currentHealth <= 0 {
            currentTarget = nil
            currentState = .idle
            return
        }
        
        // Check if target is still in range
        let distance = distanceTo(target)
        if distance > attackRange {
            // Move closer to target
            moveTo(target.position)
            return
        }
        
        // Face the target
        let direction = SCNVector3(
            target.position.x - position.x,
            0,
            target.position.z - position.z
        )
        
        if direction.x != 0 || direction.z != 0 {
            let angle = atan2(direction.x, direction.z)
            rotation = SCNVector4(0, 1, 0, angle)
        }
        
        // Attack if cooldown is ready
        let currentTime = CACurrentMediaTime()
        if currentTime - lastAttackTime >= TimeInterval(attackSpeed) {
            performAttack(on: target)
            lastAttackTime = currentTime
        }
    }
    
    private func performAttack(on target: GameObject) {
        // Calculate damage with veterancy bonus
        let damage = Float(attackDamage) * veterancyDamageMultiplier
        let finalDamage = Int(damage)
        
        // Apply damage
        target.takeDamage(finalDamage, from: self)
        
        // Gain experience
        gainExperience(1)
        
        // Create attack effect
        createAttackEffect(to: target.position)
    }
    
    private func createAttackEffect(to targetPosition: SCNVector3) {
        // Create simple projectile effect
        let projectile = SCNNode(geometry: SCNSphere(radius: 0.1))
        projectile.geometry?.materials.first?.diffuse.contents = UIColor.yellow
        projectile.position = position
        
        parent?.addChildNode(projectile)
        
        // Animate projectile to target
        let moveAction = SCNAction.move(to: targetPosition, duration: 0.5)
        let removeAction = SCNAction.removeFromParentNode()
        let sequence = SCNAction.sequence([moveAction, removeAction])
        
        projectile.runAction(sequence)
    }
    
    // MARK: - Health and Damage
    
    override func takeDamage(_ amount: Int, from attacker: GameObject? = nil) {
        // Apply armor reduction
        let reducedDamage = max(1, amount - armor)
        currentHealth = max(0, currentHealth - reducedDamage)
        
        updateHealthBar()
        
        if currentHealth <= 0 {
            destroy()
        }
    }
    
    func heal(_ amount: Int) {
        currentHealth = min(maxHealth, currentHealth + amount)
        updateHealthBar()
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
    
    // MARK: - Experience and Veterancy
    
    func gainExperience(_ amount: Int) {
        experience += amount
        checkVeterancyPromotion()
    }
    
    private func checkVeterancyPromotion() {
        let newLevel = VeterancyLevel.fromExperience(experience)
        if newLevel != veterancyLevel {
            promoteToVeterancy(newLevel)
        }
    }
    
    private func promoteToVeterancy(_ level: VeterancyLevel) {
        veterancyLevel = level
        
        // Apply veterancy bonuses
        let healthBonus = Int(Float(unitData.health) * level.healthBonus)
        maxHealth = unitData.health + healthBonus
        currentHealth = min(currentHealth + healthBonus, maxHealth)
        
        speed = unitData.speed * (1.0 + level.speedBonus)
        attackDamage = Int(Float(unitData.attackDamage) * (1.0 + level.damageBonus))
        
        // Visual indication of promotion
        showPromotionEffect()
        
        print("🎖️ \(unitData.name) promoted to \(level.displayName)")
    }
    
    private func showPromotionEffect() {
        // Create promotion visual effect
        let starGeometry = SCNBox(width: 0.3, height: 0.3, length: 0.1, chamferRadius: 0.05)
        starGeometry.materials.first?.diffuse.contents = UIColor.gold
        
        let starNode = SCNNode(geometry: starGeometry)
        starNode.position = SCNVector3(0, 1.5, 0)
        addChildNode(starNode)
        
        // Animate star
        let scaleUp = SCNAction.scale(to: 1.5, duration: 0.3)
        let scaleDown = SCNAction.scale(to: 0.0, duration: 0.3)
        let remove = SCNAction.removeFromParentNode()
        let sequence = SCNAction.sequence([scaleUp, scaleDown, remove])
        
        starNode.runAction(sequence)
    }
    
    private var veterancyDamageMultiplier: Float {
        return 1.0 + veterancyLevel.damageBonus
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
        
        let ringGeometry = SCNTorus(ringRadius: 1.5, pipeRadius: 0.1)
        ringGeometry.materials.first?.diffuse.contents = UIColor.cyan
        
        selectionIndicator = SCNNode(geometry: ringGeometry)
        selectionIndicator?.position = SCNVector3(0, 0.1, 0)
        addChildNode(selectionIndicator!)
        
        // Animate selection ring
        let rotateAction = SCNAction.rotateBy(x: 0, y: Float.pi * 2, z: 0, duration: 2.0)
        let repeatAction = SCNAction.repeatForever(rotateAction)
        selectionIndicator?.runAction(repeatAction)
    }
    
    private func hideSelectionIndicator() {
        selectionIndicator?.removeFromParentNode()
        selectionIndicator = nil
    }
    
    // MARK: - Update
    
    func update(deltaTime: Float) {
        switch currentState {
        case .moving:
            updateMovement(deltaTime: deltaTime)
        case .attacking:
            updateCombat(deltaTime: deltaTime)
        case .constructing:
            updateConstruction(deltaTime: deltaTime)
        case .repairing:
            updateRepair(deltaTime: deltaTime)
        default:
            break
        }
        
        // Update operational status based on power
        updateOperationalStatus()
    }
    
    private func updateConstruction(deltaTime: Float) {
        // Construction logic would go here
        // For now, just placeholder
    }
    
    private func updateRepair(deltaTime: Float) {
        // Repair logic would go here
        // For now, just placeholder
    }
    
    private func updateOperationalStatus() {
        // Check if unit has enough power to operate
        let efficiency = ResourceManager.shared.isPowerLow ? 0.5 : 1.0
        speed = unitData.speed * efficiency
    }
    
    // MARK: - Save/Load
    
    func loadFromSave(_ saveData: UnitSaveData) {
        position = saveData.position
        currentHealth = saveData.currentHealth
        experience = saveData.experience
        veterancyLevel = saveData.veterancyLevel
        currentState = saveData.state
        
        // Apply veterancy bonuses
        if veterancyLevel != .rookie {
            promoteToVeterancy(veterancyLevel)
        }
        
        updateHealthBar()
    }
    
    override func destroy() {
        hideSelectionIndicator()
        super.destroy()
    }
}

// MARK: - Supporting Types

enum UnitState: String, Codable {
    case idle
    case moving
    case attacking
    case constructing
    case repairing
    case capturing
    case garrisoned
    case patrolling
}

enum UnitClass: String, CaseIterable, Codable {
    case infantry
    case vehicle
    case aircraft
    case naval
}

enum UnitSpecial: String, CaseIterable, Codable {
    case none
    case engineer
    case antiAir
    case stealth
    case beam
    case chrono
    case reconnaissance
    case heavy
    case drone
    case bomber
    case longRange
    case constructor
}

enum VeterancyLevel: String, CaseIterable, Codable {
    case rookie
    case veteran
    case elite
    
    var displayName: String {
        switch self {
        case .rookie: return "Rookie"
        case .veteran: return "Veteran"
        case .elite: return "Elite"
        }
    }
    
    var experienceRequired: Int {
        switch self {
        case .rookie: return 0
        case .veteran: return 10
        case .elite: return 25
        }
    }
    
    var healthBonus: Float {
        switch self {
        case .rookie: return 0.0
        case .veteran: return 0.25
        case .elite: return 0.5
        }
    }
    
    var damageBonus: Float {
        switch self {
        case .rookie: return 0.0
        case .veteran: return 0.25
        case .elite: return 0.5
        }
    }
    
    var speedBonus: Float {
        switch self {
        case .rookie: return 0.0
        case .veteran: return 0.1
        case .elite: return 0.2
        }
    }
    
    static func fromExperience(_ experience: Int) -> VeterancyLevel {
        if experience >= VeterancyLevel.elite.experienceRequired {
            return .elite
        } else if experience >= VeterancyLevel.veteran.experienceRequired {
            return .veteran
        } else {
            return .rookie
        }
    }
}

// MARK: - Unit Type Data

struct UnitTypeData {
    let name: String
    let description: String
    
    // Basic stats
    let health: Int
    let armor: Int
    let speed: Float
    let cost: Resources
    let buildTime: Float
    
    // Capabilities
    let canAttack: Bool
    let canConstruct: Bool
    let canCapture: Bool
    let canRepair: Bool
    
    // Combat stats
    let attackDamage: Int
    let attackRange: Float
    let attackSpeed: Float
    let visionRange: Float
    
    // Visual
    let modelName: String
    let iconName: String
    
    // Classification
    let unitClass: UnitClass
    let special: UnitSpecial
    
    // Resource generation (for economic units)
    let resourceGeneration: Int
    
    init(name: String, description: String, health: Int, armor: Int, speed: Float,
         cost: Resources, buildTime: Float, canAttack: Bool, canConstruct: Bool = false,
         canCapture: Bool = false, canRepair: Bool = false, attackDamage: Int,
         attackRange: Float, attackSpeed: Float, visionRange: Float, modelName: String,
         iconName: String, unitClass: UnitClass, special: UnitSpecial, resourceGeneration: Int = 0) {
        
        self.name = name
        self.description = description
        self.health = health
        self.armor = armor
        self.speed = speed
        self.cost = cost
        self.buildTime = buildTime
        self.canAttack = canAttack
        self.canConstruct = canConstruct
        self.canCapture = canCapture
        self.canRepair = canRepair
        self.attackDamage = attackDamage
        self.attackRange = attackRange
        self.attackSpeed = attackSpeed
        self.visionRange = visionRange
        self.modelName = modelName
        self.iconName = iconName
        self.unitClass = unitClass
        self.special = special
        self.resourceGeneration = resourceGeneration
    }
}

// MARK: - Unit Types Enumeration

enum UnitType: String, CaseIterable, Codable {
    // Universal
    case engineer = "engineer"
    
    // Allied Forces
    case alliedSoldier = "allied_soldier"
    case grizzlyTank = "grizzly_tank"
    case rocketeeer = "rocketeer"
    case mirage = "mirage"
    case prism = "prism"
    case chronoLegionnaire = "chrono_legionnaire"
    case spySatellite = "spy_satellite"
    
    // Soviet Union
    case conscript = "conscript"
    case flakTrooper = "flak_trooper"
    case rhinoTank = "rhino_tank"
    case apocalypseTank = "apocalypse_tank"
    case terrorDrone = "terror_drone"
    case kirovAirship = "kirov_airship"
    
    // Rising Sun Empire
    case imperialWarrior = "imperial_warrior"
    case archer = "archer"
    case tsunamiTank = "tsunami_tank"
    case kingOni = "king_oni"
    case nanocoreFabricator = "nanocore_fabricator"
    case rocketAngel = "rocket_angel"
    
    // European Confederation
    case confederateInfantry = "confederate_infantry"
    case peacekeeper = "peacekeeper"
    case crusaderTank = "crusader_tank"
    case guardian = "guardian"
    case medicTrooper = "medic_trooper"
    case multigunner = "multigunner"
    
    // Pacific Republic
    case marineInfantry = "marine_infantry"
    case seawing = "seawing"
    case amphibiousTank = "amphibious_tank"
    case carrierVessel = "carrier_vessel"
    case dolphin = "dolphin"
    case aegisCruiser = "aegis_cruiser"
    
    // African Federation
    case militiaFighter = "militia_fighter"
    case saboteur = "saboteur"
    case scorpionTank = "scorpion_tank"
    case sandstorm = "sandstorm"
    case resourceCollector = "resource_collector"
    case nomadRider = "nomad_rider"
    
    // Arctic Coalition
    case arcticTrooper = "arctic_trooper"
    case cryoLegionnaire = "cryo_legionnaire"
    case mammothTank = "mammoth_tank"
    case icebreaker = "icebreaker"
    case blizzardDrone = "blizzard_drone"
    case polarBear = "polar_bear"
    
    // Corporate Syndicate
    case mercenary = "mercenary"
    case cyborg = "cyborg"
    case titanTank = "titan_tank"
    case stealthFighter = "stealth_fighter"
    case hackDrone = "hack_drone"
    case corporateAgent = "corporate_agent"
    
    // Global Resistance
    case rebel = "rebel"
    case demolitionist = "demolitionist"
    case salvageTank = "salvage_tank"
    case scrapMech = "scrap_mech"
    case partisanFighter = "partisan_fighter"
    case scavengerDrone = "scavenger_drone"
    
    var displayName: String {
        return rawValue.replacingOccurrences(of: "_", with: " ").capitalized
    }
}

// MARK: - Unit Save Data

struct UnitSaveData: Codable {
    let id: UUID
    let unitType: UnitType
    let faction: Faction
    let position: SCNVector3
    let currentHealth: Int
    let experience: Int
    let veterancyLevel: VeterancyLevel
    let state: UnitState
    
    init(from unit: Unit) {
        self.id = unit.id
        self.unitType = unit.unitType
        self.faction = unit.faction
        self.position = unit.position
        self.currentHealth = unit.currentHealth
        self.experience = unit.experience
        self.veterancyLevel = unit.veterancyLevel
        self.state = unit.currentState
    }
}

// Extension for SCNVector3 Codable conformance
extension SCNVector3: Codable {
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(x, forKey: .x)
        try container.encode(y, forKey: .y)
        try container.encode(z, forKey: .z)
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let x = try container.decode(Float.self, forKey: .x)
        let y = try container.decode(Float.self, forKey: .y)
        let z = try container.decode(Float.self, forKey: .z)
        self.init(x, y, z)
    }
    
    private enum CodingKeys: String, CodingKey {
        case x, y, z
    }
}