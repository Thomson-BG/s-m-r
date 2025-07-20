import Foundation
import UIKit

// MARK: - Faction Manager

class FactionManager {
    static let shared = FactionManager()
    
    private var factions: [Faction: FactionData] = [:]
    private var playerFaction: Faction = .allies
    
    private init() {}
    
    func initialize() {
        loadFactions()
        print("🏛️ Faction Manager initialized with \(factions.count) factions")
    }
    
    func loadFactions() {
        // Initialize all 8+ factions with unique characteristics
        factions[.allies] = createAlliesFaction()
        factions[.soviets] = createSovietFaction()
        factions[.empire] = createEmpireFaction()
        factions[.confederation] = createConfederationFaction()
        factions[.republic] = createRepublicFaction()
        factions[.federation] = createFederationFaction()
        factions[.coalition] = createCoalitionFaction()
        factions[.syndicate] = createSyndicateFaction()
        factions[.resistance] = createResistanceFaction()
    }
    
    // MARK: - Faction Access
    
    func getFactionData(_ faction: Faction) -> FactionData? {
        return factions[faction]
    }
    
    func getAllFactions() -> [Faction] {
        return Array(factions.keys)
    }
    
    func getEnemyFactions(for faction: Faction) -> [Faction] {
        return getAllFactions().filter { $0 != faction }
    }
    
    func setPlayerFaction(_ faction: Faction) {
        playerFaction = faction
    }
    
    func getPlayerFaction() -> Faction {
        return playerFaction
    }
    
    // MARK: - Starting Resources
    
    func getStartingBuildings(for faction: Faction) -> [BuildingType: Int] {
        guard let factionData = factions[faction] else { return [:] }
        return factionData.startingBuildings
    }
    
    func getStartingUnits(for faction: Faction) -> [UnitType: Int] {
        guard let factionData = factions[faction] else { return [:] }
        return factionData.startingUnits
    }
    
    func getUniqueUnits(for faction: Faction) -> [UnitType] {
        guard let factionData = factions[faction] else { return [] }
        return factionData.uniqueUnits
    }
    
    func getUniqueBuildings(for faction: Faction) -> [BuildingType] {
        guard let factionData = factions[faction] else { return [] }
        return factionData.uniqueBuildings
    }
    
    func getSuperweapon(for faction: Faction) -> SuperweaponType? {
        guard let factionData = factions[faction] else { return nil }
        return factionData.superweapon
    }
    
    // MARK: - Faction Creation Methods
    
    private func createAlliesFaction() -> FactionData {
        return FactionData(
            name: "Allied Forces",
            description: "Advanced technology and air superiority. Masters of precision strikes and defensive tactics.",
            color: .blue,
            emblem: "🇺🇸",
            
            // Faction bonuses matching Red Alert 2 style
            economicBonus: 0.0,        // Standard economy
            militaryBonus: 0.1,        // +10% unit effectiveness
            technologyBonus: 0.15,     // +15% research speed
            
            // Starting resources
            startingBuildings: [
                .constructionYard: 1,
                .powerPlant: 1,
                .barracks: 1
            ],
            startingUnits: [
                .engineer: 2,
                .alliedSoldier: 4,
                .grizzlyTank: 1
            ],
            
            // Unique units
            uniqueUnits: [
                .grizzlyTank,
                .rocketeeer,
                .mirage,
                .prism,
                .chronoLegionnaire,
                .spySatellite
            ],
            
            // Unique buildings
            uniqueBuildings: [
                .prismTower,
                .chronosphere,
                .gapGenerator,
                .alliedAirfield
            ],
            
            // Superweapon
            superweapon: .chronosphere,
            
            // Special abilities
            specialAbilities: [
                "Chronoshift": "Teleport units across the battlefield",
                "Spy Satellite": "Reveal enemy positions",
                "Gap Generator": "Hide base from enemy detection"
            ]
        )
    }
    
    private func createSovietFaction() -> FactionData {
        return FactionData(
            name: "Soviet Union",
            description: "Raw firepower and heavy armor. Overwhelm enemies with superior numbers and devastating weapons.",
            color: .red,
            emblem: "🇷🇺",
            
            economicBonus: 0.1,        // +10% ore income
            militaryBonus: 0.15,       // +15% armor
            technologyBonus: -0.05,    // -5% research speed
            
            startingBuildings: [
                .constructionYard: 1,
                .powerPlant: 1,
                .barracks: 1
            ],
            startingUnits: [
                .engineer: 2,
                .conscript: 6,
                .rhinoTank: 1
            ],
            
            uniqueUnits: [
                .conscript,
                .flakTrooper,
                .rhinoTank,
                .apocalypseTank,
                .terrorDrone,
                .kirovAirship
            ],
            
            uniqueBuildings: [
                .teslaCoil,
                .ironCurtain,
                .nuclearReactor,
                .sovietAirfield
            ],
            
            superweapon: .nuclearMissile,
            
            specialAbilities: [
                "Iron Curtain": "Make units invulnerable temporarily",
                "Tesla Technology": "Chain lightning attacks",
                "Nuclear Power": "High-output power generation"
            ]
        )
    }
    
    private func createEmpireFaction() -> FactionData {
        return FactionData(
            name: "Rising Sun Empire",
            description: "Technological innovation and transforming units. Masters of adaptation and advanced robotics.",
            color: .orange,
            emblem: "🇯🇵",
            
            economicBonus: -0.05,      // -5% economy
            militaryBonus: 0.05,       // +5% unit speed
            technologyBonus: 0.2,      // +20% research speed
            
            startingBuildings: [
                .constructionYard: 1,
                .powerPlant: 1,
                .barracks: 1
            ],
            startingUnits: [
                .engineer: 2,
                .imperialWarrior: 4,
                .tsunamiTank: 1
            ],
            
            uniqueUnits: [
                .imperialWarrior,
                .archer,
                .tsunamiTank,
                .kingOni,
                .nanocoreFabricator,
                .rocketAngel
            ],
            
            uniqueBuildings: [
                .waveForceGun,
                .psionicDecimator,
                .nanoswarmHive,
                .empireAirfield
            ],
            
            superweapon: .psionicDecimator,
            
            specialAbilities: [
                "Psionic Technology": "Mind control and devastating attacks",
                "Nanoswarm": "Self-repairing units and buildings",
                "Transformation": "Units can change forms"
            ]
        )
    }
    
    private func createConfederationFaction() -> FactionData {
        return FactionData(
            name: "European Confederation",
            description: "Balanced forces with superior defense. Masters of fortification and combined arms tactics.",
            color: .purple,
            emblem: "🇪🇺",
            
            economicBonus: 0.05,       // +5% economy
            militaryBonus: 0.1,        // +10% defensive structures
            technologyBonus: 0.05,     // +5% research speed
            
            startingBuildings: [
                .constructionYard: 1,
                .powerPlant: 1,
                .barracks: 1
            ],
            startingUnits: [
                .engineer: 2,
                .confederateInfantry: 4,
                .crusaderTank: 1
            ],
            
            uniqueUnits: [
                .confederateInfantry,
                .peacekeeper,
                .crusaderTank,
                .guardian,
                .medicTrooper,
                .multigunner
            ],
            
            uniqueBuildings: [
                .aegisDefense,
                .weatherController,
                .forceShield,
                .confederateAirbase
            ],
            
            superweapon: .weatherController,
            
            specialAbilities: [
                "Weather Control": "Manipulate battlefield conditions",
                "Force Shields": "Protect units and buildings",
                "Medical Support": "Enhanced unit healing"
            ]
        )
    }
    
    private func createRepublicFaction() -> FactionData {
        return FactionData(
            name: "Pacific Republic",
            description: "Naval supremacy and amphibious warfare. Masters of sea and air combined operations.",
            color: .cyan,
            emblem: "🏝️",
            
            economicBonus: 0.1,        // +10% from naval operations
            militaryBonus: 0.2,        // +20% naval units
            technologyBonus: 0.0,      // Standard research
            
            startingBuildings: [
                .constructionYard: 1,
                .powerPlant: 1,
                .barracks: 1,
                .navalYard: 1
            ],
            startingUnits: [
                .engineer: 2,
                .marineInfantry: 4,
                .amphibiousTank: 1,
                .dolphin: 2
            ],
            
            uniqueUnits: [
                .marineInfantry,
                .seawing,
                .amphibiousTank,
                .carrierVessel,
                .dolphin,
                .aegisCruiser
            ],
            
            uniqueBuildings: [
                .navalYard,
                .sonarPulse,
                .tidalGenerator,
                .aircraftCarrier
            ],
            
            superweapon: .tidalWave,
            
            specialAbilities: [
                "Tidal Wave": "Devastating coastal attacks",
                "Sonar Network": "Detect submerged enemies",
                "Amphibious Assault": "Land from sea operations"
            ]
        )
    }
    
    private func createFederationFaction() -> FactionData {
        return FactionData(
            name: "African Federation",
            description: "Resource abundance and guerrilla tactics. Masters of mobility and unconventional warfare.",
            color: .green,
            emblem: "🌍",
            
            economicBonus: 0.2,        // +20% resource generation
            militaryBonus: 0.05,       // +5% unit speed
            technologyBonus: -0.1,     // -10% research speed
            
            startingBuildings: [
                .constructionYard: 1,
                .powerPlant: 1,
                .barracks: 1,
                .mineralProcessor: 1
            ],
            startingUnits: [
                .engineer: 2,
                .militiaFighter: 6,
                .scorpionTank: 1,
                .resourceCollector: 2
            ],
            
            uniqueUnits: [
                .militiaFighter,
                .saboteur,
                .scorpionTank,
                .sandstorm,
                .resourceCollector,
                .nomadRider
            ],
            
            uniqueBuildings: [
                .mineralProcessor,
                .dustStorm,
                .guerrillaBase,
                .solarArray
            ],
            
            superweapon: .sandstormGenerator,
            
            specialAbilities: [
                "Sandstorm": "Reduce enemy visibility",
                "Guerrilla Tactics": "Units can hide and ambush",
                "Solar Power": "Efficient energy generation"
            ]
        )
    }
    
    private func createCoalitionFaction() -> FactionData {
        return FactionData(
            name: "Arctic Coalition",
            description: "Cold warfare specialists. Masters of harsh terrain and ice-based technology.",
            color: .white,
            emblem: "❄️",
            
            economicBonus: 0.0,        // Standard economy
            militaryBonus: 0.15,       // +15% in cold terrain
            technologyBonus: 0.1,      // +10% research speed
            
            startingBuildings: [
                .constructionYard: 1,
                .thermalPowerPlant: 1,
                .barracks: 1
            ],
            startingUnits: [
                .engineer: 2,
                .arcticTrooper: 4,
                .mammothTank: 1
            ],
            
            uniqueUnits: [
                .arcticTrooper,
                .cryoLegionnaire,
                .mammothTank,
                .icebreaker,
                .blizzardDrone,
                .polarBear
            ],
            
            uniqueBuildings: [
                .thermalPowerPlant,
                .cryoLab,
                .iceBarrier,
                .arcticBase
            ],
            
            superweapon: .globalFreeze,
            
            specialAbilities: [
                "Global Freeze": "Slow all enemy units",
                "Ice Barriers": "Create impassable terrain",
                "Thermal Power": "Efficient cold-weather energy"
            ]
        )
    }
    
    private func createSyndicateFaction() -> FactionData {
        return FactionData(
            name: "Corporate Syndicate",
            description: "High-tech mercenaries with unlimited funding. Masters of cutting-edge technology.",
            color: .yellow,
            emblem: "💼",
            
            economicBonus: 0.25,       // +25% economy
            militaryBonus: -0.05,      // -5% unit durability
            technologyBonus: 0.25,     // +25% research speed
            
            startingBuildings: [
                .constructionYard: 1,
                .powerPlant: 1,
                .barracks: 1,
                .corporateHQ: 1
            ],
            startingUnits: [
                .engineer: 2,
                .mercenary: 4,
                .titanTank: 1
            ],
            
            uniqueUnits: [
                .mercenary,
                .cyborg,
                .titanTank,
                .stealthFighter,
                .hackDrone,
                .corporateAgent
            ],
            
            uniqueBuildings: [
                .corporateHQ,
                .economicCenter,
                .stealthGenerator,
                .techLab
            ],
            
            superweapon: .economicCollapse,
            
            specialAbilities: [
                "Economic Warfare": "Drain enemy resources",
                "Stealth Technology": "Advanced cloaking",
                "Corporate Espionage": "Steal enemy technology"
            ]
        )
    }
    
    private func createResistanceFaction() -> FactionData {
        return FactionData(
            name: "Global Resistance",
            description: "Scrappy survivors using salvaged equipment. Masters of improvisation and tenacity.",
            color: .brown,
            emblem: "✊",
            
            economicBonus: -0.1,       // -10% economy
            militaryBonus: 0.2,        // +20% when outnumbered
            technologyBonus: -0.15,    // -15% research speed
            
            startingBuildings: [
                .constructionYard: 1,
                .powerPlant: 1,
                .barracks: 1,
                .scrapyard: 1
            ],
            startingUnits: [
                .engineer: 3,
                .rebel: 8,
                .salvageTank: 1
            ],
            
            uniqueUnits: [
                .rebel,
                .demolitionist,
                .salvageTank,
                .scrapMech,
                .partisanFighter,
                .scavengerDrone
            ],
            
            uniqueBuildings: [
                .scrapyard,
                .guerrillaOutpost,
                .undergroundBase,
                .radioTower
            ],
            
            superweapon: .empBlast,
            
            specialAbilities: [
                "EMP Blast": "Disable enemy electronics",
                "Scavenging": "Recover resources from wreckage",
                "Underground Network": "Hidden movement paths"
            ]
        )
    }
}

// MARK: - Faction Enumeration

enum Faction: String, CaseIterable, Codable {
    case allies = "allies"
    case soviets = "soviets"
    case empire = "empire"
    case confederation = "confederation"
    case republic = "republic"
    case federation = "federation"
    case coalition = "coalition"
    case syndicate = "syndicate"
    case resistance = "resistance"
    
    var displayName: String {
        switch self {
        case .allies: return "Allied Forces"
        case .soviets: return "Soviet Union"
        case .empire: return "Rising Sun Empire"
        case .confederation: return "European Confederation"
        case .republic: return "Pacific Republic"
        case .federation: return "African Federation"
        case .coalition: return "Arctic Coalition"
        case .syndicate: return "Corporate Syndicate"
        case .resistance: return "Global Resistance"
        }
    }
}

// MARK: - Faction Data Structure

struct FactionData {
    let name: String
    let description: String
    let color: UIColor
    let emblem: String
    
    // Faction bonuses
    let economicBonus: Float      // Percentage bonus to resource generation
    let militaryBonus: Float      // Percentage bonus to unit effectiveness
    let technologyBonus: Float    // Percentage bonus to research speed
    
    // Starting resources
    let startingBuildings: [BuildingType: Int]
    let startingUnits: [UnitType: Int]
    
    // Unique content
    let uniqueUnits: [UnitType]
    let uniqueBuildings: [BuildingType]
    let superweapon: SuperweaponType?
    
    // Special abilities
    let specialAbilities: [String: String]
}

// MARK: - Superweapon Types

enum SuperweaponType: String, CaseIterable, Codable {
    case chronosphere = "chronosphere"
    case nuclearMissile = "nuclear_missile"
    case psionicDecimator = "psionic_decimator"
    case weatherController = "weather_controller"
    case tidalWave = "tidal_wave"
    case sandstormGenerator = "sandstorm_generator"
    case globalFreeze = "global_freeze"
    case economicCollapse = "economic_collapse"
    case empBlast = "emp_blast"
    
    var displayName: String {
        switch self {
        case .chronosphere: return "Chronosphere"
        case .nuclearMissile: return "Nuclear Missile"
        case .psionicDecimator: return "Psionic Decimator"
        case .weatherController: return "Weather Controller"
        case .tidalWave: return "Tidal Wave"
        case .sandstormGenerator: return "Sandstorm Generator"
        case .globalFreeze: return "Global Freeze"
        case .economicCollapse: return "Economic Collapse"
        case .empBlast: return "EMP Blast"
        }
    }
    
    var description: String {
        switch self {
        case .chronosphere: return "Teleport units across the battlefield"
        case .nuclearMissile: return "Devastating nuclear strike"
        case .psionicDecimator: return "Mind control and psychic damage"
        case .weatherController: return "Control weather patterns"
        case .tidalWave: return "Massive wave attack"
        case .sandstormGenerator: return "Create blinding sandstorms"
        case .globalFreeze: return "Freeze enemy forces"
        case .economicCollapse: return "Destroy enemy economy"
        case .empBlast: return "Disable electronic systems"
        }
    }
    
    var chargeDuration: TimeInterval {
        switch self {
        case .chronosphere: return 420.0  // 7 minutes
        case .nuclearMissile: return 480.0  // 8 minutes
        case .psionicDecimator: return 360.0  // 6 minutes
        case .weatherController: return 450.0  // 7.5 minutes
        case .tidalWave: return 400.0  // 6.5 minutes
        case .sandstormGenerator: return 300.0  // 5 minutes
        case .globalFreeze: return 380.0  // 6.3 minutes
        case .economicCollapse: return 320.0  // 5.3 minutes
        case .empBlast: return 240.0  // 4 minutes
        }
    }
}

// MARK: - AI Personalities

struct AIPersonality {
    let aggressiveness: Float      // 0.0 - 1.0
    let economicFocus: Float       // 0.0 - 1.0
    let expansionism: Float        // 0.0 - 1.0
    let defensiveness: Float       // 0.0 - 1.0
    let rushTendency: Float        // 0.0 - 1.0
    
    static func forFaction(_ faction: Faction) -> AIPersonality {
        switch faction {
        case .allies:
            return AIPersonality(aggressiveness: 0.6, economicFocus: 0.7, expansionism: 0.5, defensiveness: 0.8, rushTendency: 0.3)
        case .soviets:
            return AIPersonality(aggressiveness: 0.9, economicFocus: 0.5, expansionism: 0.7, defensiveness: 0.4, rushTendency: 0.8)
        case .empire:
            return AIPersonality(aggressiveness: 0.7, economicFocus: 0.8, expansionism: 0.6, defensiveness: 0.5, rushTendency: 0.4)
        case .confederation:
            return AIPersonality(aggressiveness: 0.5, economicFocus: 0.7, expansionism: 0.4, defensiveness: 0.9, rushTendency: 0.2)
        case .republic:
            return AIPersonality(aggressiveness: 0.6, economicFocus: 0.6, expansionism: 0.8, defensiveness: 0.6, rushTendency: 0.3)
        case .federation:
            return AIPersonality(aggressiveness: 0.4, economicFocus: 0.9, expansionism: 0.5, defensiveness: 0.7, rushTendency: 0.2)
        case .coalition:
            return AIPersonality(aggressiveness: 0.5, economicFocus: 0.6, expansionism: 0.3, defensiveness: 0.8, rushTendency: 0.3)
        case .syndicate:
            return AIPersonality(aggressiveness: 0.7, economicFocus: 0.9, expansionism: 0.6, defensiveness: 0.5, rushTendency: 0.5)
        case .resistance:
            return AIPersonality(aggressiveness: 0.8, economicFocus: 0.3, expansionism: 0.7, defensiveness: 0.6, rushTendency: 0.9)
        }
    }
}