import UIKit
import SceneKit
import GameController

class GameViewController: UIViewController {
    var sceneView: SCNView!
    var gameScene: GameScene!
    var gameUI: GameUI!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupSceneView()
        setupGameScene()
        setupGameUI()
        setupInputHandling()
        setupNotifications()
    }
    
    private func setupSceneView() {
        sceneView = SCNView(frame: view.bounds)
        sceneView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        sceneView.allowsCameraControl = false
        sceneView.showsStatistics = true
        sceneView.backgroundColor = UIColor.black
        sceneView.antialiasingMode = .multisampling4X
        
        // Enable advanced graphics features
        sceneView.preferredFramesPerSecond = 60
        sceneView.isJitteringEnabled = true
        sceneView.isTemporalAntialiasingEnabled = true
        
        view.addSubview(sceneView)
    }
    
    private func setupGameScene() {
        gameScene = GameScene()
        sceneView.scene = gameScene
        sceneView.delegate = gameScene
        
        // Setup camera
        gameScene.setupCamera()
        gameScene.setupLighting()
        gameScene.setupTerrain()
    }
    
    private func setupGameUI() {
        gameUI = GameUI(frame: view.bounds)
        gameUI.delegate = self
        view.addSubview(gameUI)
        
        // Setup UI constraints
        gameUI.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            gameUI.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            gameUI.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            gameUI.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            gameUI.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }
    
    private func setupInputHandling() {
        // Touch gesture recognizers
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap(_:)))
        let panGesture = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
        let pinchGesture = UIPinchGestureRecognizer(target: self, action: #selector(handlePinch(_:)))
        
        sceneView.addGestureRecognizer(tapGesture)
        sceneView.addGestureRecognizer(panGesture)
        sceneView.addGestureRecognizer(pinchGesture)
        
        // Game controller support
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(controllerDidConnect(_:)),
            name: .GCControllerDidConnect,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(controllerDidDisconnect(_:)),
            name: .GCControllerDidDisconnect,
            object: nil
        )
    }
    
    private func setupNotifications() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(gameStateChanged(_:)),
            name: GameEngine.gameStateChangedNotification,
            object: nil
        )
    }
    
    // MARK: - Input Handling
    
    @objc private func handleTap(_ gesture: UITapGestureRecognizer) {
        let location = gesture.location(in: sceneView)
        gameScene.handleTap(at: location)
    }
    
    @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
        let translation = gesture.translation(in: sceneView)
        let velocity = gesture.velocity(in: sceneView)
        
        switch gesture.state {
        case .began:
            gameScene.handlePanBegan(at: gesture.location(in: sceneView))
        case .changed:
            gameScene.handlePanChanged(translation: translation, velocity: velocity)
        case .ended, .cancelled:
            gameScene.handlePanEnded(velocity: velocity)
        default:
            break
        }
        
        gesture.setTranslation(.zero, in: sceneView)
    }
    
    @objc private func handlePinch(_ gesture: UIPinchGestureRecognizer) {
        switch gesture.state {
        case .began:
            gameScene.handlePinchBegan()
        case .changed:
            gameScene.handlePinchChanged(scale: gesture.scale)
        case .ended, .cancelled:
            gameScene.handlePinchEnded()
        default:
            break
        }
        
        gesture.scale = 1.0
    }
    
    // MARK: - Game Controller Support
    
    @objc private func controllerDidConnect(_ notification: Notification) {
        guard let controller = notification.object as? GCController else { return }
        gameScene.connectController(controller)
        gameUI.showControllerConnectedMessage()
    }
    
    @objc private func controllerDidDisconnect(_ notification: Notification) {
        gameScene.disconnectController()
        gameUI.hideControllerConnectedMessage()
    }
    
    // MARK: - Game State Management
    
    @objc private func gameStateChanged(_ notification: Notification) {
        DispatchQueue.main.async {
            self.gameUI.updateGameState()
        }
    }
    
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        if UIDevice.current.userInterfaceIdiom == .phone {
            return .landscape
        } else {
            return .all
        }
    }
    
    override var prefersStatusBarHidden: Bool {
        return true
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}

// MARK: - GameUI Delegate

extension GameViewController: GameUIDelegate {
    func didSelectUnit(_ unit: Unit) {
        gameScene.selectUnit(unit)
    }
    
    func didSelectBuilding(_ building: Building) {
        gameScene.selectBuilding(building)
    }
    
    func didRequestBuildUnit(_ unitType: UnitType) {
        GameEngine.shared.requestBuildUnit(unitType)
    }
    
    func didRequestBuildBuilding(_ buildingType: BuildingType) {
        GameEngine.shared.requestBuildBuilding(buildingType)
    }
    
    func didRequestPauseGame() {
        GameEngine.shared.pauseGame()
    }
    
    func didRequestSaveGame() {
        GameEngine.shared.saveGame()
    }
    
    func didRequestLoadGame() {
        // Show load game interface
        gameUI.showLoadGameInterface()
    }
    
    func didRequestMainMenu() {
        GameEngine.shared.returnToMainMenu()
    }
}