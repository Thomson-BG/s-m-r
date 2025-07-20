import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Initialize game systems
        setupGameSystems()
        
        // Enable file sharing for save games
        setupFileSharing()
        
        return true
    }
    
    private func setupGameSystems() {
        // Initialize core game systems
        GameEngine.shared.initialize()
        ResourceManager.shared.initialize()
        FactionManager.shared.initialize()
        UnitManager.shared.initialize()
        BuildingManager.shared.initialize()
        CampaignManager.shared.initialize()
    }
    
    private func setupFileSharing() {
        // Enable iTunes file sharing for game saves
        if let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            let savesDirectory = documentsPath.appendingPathComponent("GameSaves")
            try? FileManager.default.createDirectory(at: savesDirectory, withIntermediateDirectories: true, attributes: nil)
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Pause the game when app becomes inactive
        GameEngine.shared.pauseGame()
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Auto-save when entering background
        GameEngine.shared.autoSave()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Resume game when returning to foreground
        GameEngine.shared.resumeGame()
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Resume game updates
        GameEngine.shared.resumeGame()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Save game state before termination
        GameEngine.shared.saveGameState()
    }
}