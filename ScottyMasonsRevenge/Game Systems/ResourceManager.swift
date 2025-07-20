import Foundation

// MARK: - Resource Manager

class ResourceManager {
    static let shared = ResourceManager()
    
    // Resource types matching Red Alert 2
    private(set) var credits: Int = 0
    private(set) var power: Int = 0
    private(set) var powerConsumption: Int = 0
    
    // Resource collection rates
    private var creditIncome: Float = 0.0
    private var powerGeneration: Int = 0
    
    // Resource buildings
    private var refineries: [Building] = []
    private var powerPlants: [Building] = []
    private var oreMiners: [Unit] = []
    
    // Notifications
    static let resourcesChangedNotification = Notification.Name("ResourcesChanged")
    static let lowPowerNotification = Notification.Name("LowPower")
    static let noCreditsNotification = Notification.Name("NoCredits")
    
    private init() {}
    
    // MARK: - Initialization
    
    func initialize() {
        reset()
        print("💰 Resource Manager initialized")
    }
    
    func reset() {
        credits = 10000  // Starting credits like Red Alert 2
        power = 0
        powerConsumption = 0
        creditIncome = 0.0
        powerGeneration = 0
        
        refineries.removeAll()
        powerPlants.removeAll()
        oreMiners.removeAll()
        
        notifyResourceChange()
    }
    
    // MARK: - Resource Access
    
    var currentResources: Resources {
        return Resources(credits: credits, power: availablePower)
    }
    
    var availablePower: Int {
        return max(0, power - powerConsumption)
    }
    
    var powerDeficit: Int {
        return max(0, powerConsumption - power)
    }
    
    var isPowerLow: Bool {
        return powerDeficit > 0 || availablePower < 50
    }
    
    // MARK: - Resource Management
    
    func addCredits(_ amount: Int) {
        credits += amount
        notifyResourceChange()
    }
    
    func deductCredits(_ amount: Int) -> Bool {
        if credits >= amount {
            credits -= amount
            notifyResourceChange()
            return true
        }
        return false
    }
    
    func addPower(_ amount: Int) {
        powerGeneration += amount
        power = powerGeneration
        notifyResourceChange()
    }
    
    func removePower(_ amount: Int) {
        powerGeneration = max(0, powerGeneration - amount)
        power = powerGeneration
        notifyResourceChange()
        
        if isPowerLow {
            NotificationCenter.default.post(name: Self.lowPowerNotification, object: nil)
        }
    }
    
    func addPowerConsumption(_ amount: Int) {
        powerConsumption += amount
        notifyResourceChange()
        
        if isPowerLow {
            NotificationCenter.default.post(name: Self.lowPowerNotification, object: nil)
        }
    }
    
    func removePowerConsumption(_ amount: Int) {
        powerConsumption = max(0, powerConsumption - amount)
        notifyResourceChange()
    }
    
    // MARK: - Resource Checking
    
    func canAfford(_ cost: Resources) -> Bool {
        return credits >= cost.credits && availablePower >= cost.power
    }
    
    func deductResources(_ cost: Resources) -> Bool {
        if canAfford(cost) {
            credits -= cost.credits
            if cost.power > 0 {
                addPowerConsumption(cost.power)
            }
            notifyResourceChange()
            return true
        }
        return false
    }
    
    // MARK: - Resource Buildings Management
    
    func addRefinery(_ building: Building) {
        refineries.append(building)
        updateResourceIncome()
    }
    
    func removeRefinery(_ building: Building) {
        refineries.removeAll { $0 === building }
        updateResourceIncome()
    }
    
    func addPowerPlant(_ building: Building) {
        powerPlants.append(building)
        let powerOutput = building.buildingType.powerGeneration
        addPower(powerOutput)
    }
    
    func removePowerPlant(_ building: Building) {
        powerPlants.removeAll { $0 === building }
        let powerOutput = building.buildingType.powerGeneration
        removePower(powerOutput)
    }
    
    func addOreMiner(_ unit: Unit) {
        oreMiners.append(unit)
        updateResourceIncome()
    }
    
    func removeOreMiner(_ unit: Unit) {
        oreMiners.removeAll { $0 === unit }
        updateResourceIncome()
    }
    
    // MARK: - Update Loop
    
    func update(deltaTime: Float) {
        updateResourceCollection(deltaTime)
        updatePowerEfficiency()
    }
    
    private func updateResourceCollection(_ deltaTime: Float) {
        // Credit collection from ore mining
        let creditsToAdd = Int(creditIncome * deltaTime)
        if creditsToAdd > 0 {
            addCredits(creditsToAdd)
        }
        
        // Check for resource depletion warnings
        checkResourceWarnings()
    }
    
    private func updateResourceIncome() {
        // Calculate credit income based on refineries and ore miners
        var newIncome: Float = 0.0
        
        // Base income from refineries
        for refinery in refineries {
            if refinery.isOperational {
                newIncome += Float(refinery.buildingType.resourceGeneration) * getPowerEfficiency()
            }
        }
        
        // Income from ore miners
        for miner in oreMiners {
            if miner.isOperational {
                newIncome += Float(miner.unitType.resourceGeneration) * getPowerEfficiency()
            }
        }
        
        creditIncome = newIncome
    }
    
    private func updatePowerEfficiency() {
        // Update efficiency of all buildings based on power availability
        let efficiency = getPowerEfficiency()
        
        // Notify buildings of power efficiency changes
        for refinery in refineries {
            refinery.setPowerEfficiency(efficiency)
        }
        
        for powerPlant in powerPlants {
            powerPlant.setPowerEfficiency(efficiency)
        }
    }
    
    private func getPowerEfficiency() -> Float {
        if powerConsumption == 0 {
            return 1.0
        }
        
        let efficiency = Float(power) / Float(powerConsumption)
        return min(1.0, efficiency)
    }
    
    private func checkResourceWarnings() {
        // Check for low credits
        if credits < 1000 {
            NotificationCenter.default.post(name: Self.noCreditsNotification, object: nil)
        }
        
        // Check for power shortage
        if isPowerLow {
            NotificationCenter.default.post(name: Self.lowPowerNotification, object: nil)
        }
    }
    
    // MARK: - Save/Load
    
    func loadResources(_ resources: Resources) {
        credits = resources.credits
        power = resources.power
        // Note: powerConsumption and income will be recalculated based on loaded buildings
        notifyResourceChange()
    }
    
    // MARK: - Resource Deposits and Collection
    
    func findNearestOreDeposit(to position: SCNVector3) -> OreDeposit? {
        // Find the nearest ore deposit for mining
        // This would integrate with the map system
        return nil // Placeholder
    }
    
    func collectOre(from deposit: OreDeposit, amount: Int) -> Int {
        let collected = deposit.extractOre(amount)
        return collected
    }
    
    // MARK: - Private Methods
    
    private func notifyResourceChange() {
        DispatchQueue.main.async {
            NotificationCenter.default.post(name: Self.resourcesChangedNotification, object: self.currentResources)
        }
    }
}

// MARK: - Supporting Types

struct Resources: Codable {
    let credits: Int
    let power: Int
    
    init(credits: Int, power: Int = 0) {
        self.credits = credits
        self.power = power
    }
    
    static let zero = Resources(credits: 0, power: 0)
    
    static func + (lhs: Resources, rhs: Resources) -> Resources {
        return Resources(credits: lhs.credits + rhs.credits, power: lhs.power + rhs.power)
    }
    
    static func - (lhs: Resources, rhs: Resources) -> Resources {
        return Resources(credits: lhs.credits - rhs.credits, power: lhs.power - rhs.power)
    }
}

// MARK: - Ore Deposit

class OreDeposit {
    let id: UUID = UUID()
    let position: SCNVector3
    private(set) var remainingOre: Int
    private(set) var maxOre: Int
    let oreType: OreType
    
    init(position: SCNVector3, amount: Int, type: OreType = .standard) {
        self.position = position
        self.remainingOre = amount
        self.maxOre = amount
        self.oreType = type
    }
    
    func extractOre(_ amount: Int) -> Int {
        let extracted = min(amount, remainingOre)
        remainingOre -= extracted
        return extracted * oreType.creditValue
    }
    
    var isExhausted: Bool {
        return remainingOre <= 0
    }
    
    var percentageRemaining: Float {
        return Float(remainingOre) / Float(maxOre)
    }
}

enum OreType {
    case standard
    case premium
    case gems
    
    var creditValue: Int {
        switch self {
        case .standard: return 1
        case .premium: return 2
        case .gems: return 4
        }
    }
    
    var color: UIColor {
        switch self {
        case .standard: return .orange
        case .premium: return .yellow
        case .gems: return .cyan
        }
    }
}

// MARK: - Resource UI Helper

class ResourceUI {
    static func formatCredits(_ amount: Int) -> String {
        if amount >= 1000000 {
            return String(format: "%.1fM", Float(amount) / 1000000.0)
        } else if amount >= 1000 {
            return String(format: "%.1fK", Float(amount) / 1000.0)
        } else {
            return "\(amount)"
        }
    }
    
    static func formatPower(_ current: Int, _ max: Int) -> String {
        return "\(current)/\(max)"
    }
    
    static func getPowerColor(current: Int, max: Int) -> UIColor {
        let ratio = Float(current) / Float(max(1, max))
        
        if ratio >= 0.8 {
            return .green
        } else if ratio >= 0.5 {
            return .yellow
        } else {
            return .red
        }
    }
}

// MARK: - Economic Balance

struct EconomicBalance {
    // Red Alert 2 inspired balance values
    static let startingCredits = 10000
    static let refineryOutput = 20  // Credits per second when processing ore
    static let powerPlantOutput = 100  // Power units generated
    static let constructionYardPower = 50  // Power consumed by construction yard
    static let barracksLowPower = 25  // Power consumed by barracks
    static let factoryHighPower = 100  // Power consumed by war factory
    
    // Ore collection rates
    static let oreCollectionRate = 10  // Ore units per second by harvester
    static let oreToCreditsRatio = 2   // Credits per ore unit
    
    // Building costs (matching Red Alert 2 style)
    static let powerPlantCost = Resources(credits: 800)
    static let refineryCost = Resources(credits: 2000)
    static let barracksCost = Resources(credits: 500, power: 25)
    static let warFactoryCost = Resources(credits: 2000, power: 100)
    
    // Unit costs
    static let engineerCost = Resources(credits: 500)
    static let soldierCost = Resources(credits: 200)
    static let tankCost = Resources(credits: 900)
    static let harvesterCost = Resources(credits: 1400)
}

// Import SceneKit for SCNVector3
import SceneKit