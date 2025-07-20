import UIKit
import SceneKit

// MARK: - GameUI Delegate Protocol

protocol GameUIDelegate: AnyObject {
    func didSelectUnit(_ unit: Unit)
    func didSelectBuilding(_ building: Building)
    func didRequestBuildUnit(_ unitType: UnitType)
    func didRequestBuildBuilding(_ buildingType: BuildingType)
    func didRequestPauseGame()
    func didRequestSaveGame()
    func didRequestLoadGame()
    func didRequestMainMenu()
}

// MARK: - GameUI Main Class

class GameUI: UIView {
    weak var delegate: GameUIDelegate?
    
    // UI Components
    private var topBar: TopBarView!
    private var bottomBar: BottomBarView!
    private var sidePanel: SidePanelView!
    private var minimap: MinimapView!
    private var pauseMenu: PauseMenuView?
    private var loadGameMenu: LoadGameMenuView?
    
    // State
    private var currentGameState: GameEngine.GameState = .mainMenu
    private var selectedUnit: Unit?
    private var selectedBuilding: Building?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupUI()
        setupNotifications()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupUI()
        setupNotifications()
    }
    
    // MARK: - UI Setup
    
    private func setupUI() {
        backgroundColor = UIColor.clear
        
        // Top bar (resources, game status)
        topBar = TopBarView()
        topBar.delegate = self
        addSubview(topBar)
        
        // Bottom bar (unit controls, building queue)
        bottomBar = BottomBarView()
        bottomBar.delegate = self
        addSubview(bottomBar)
        
        // Side panel (building construction, unit production)
        sidePanel = SidePanelView()
        sidePanel.delegate = self
        addSubview(sidePanel)
        
        // Minimap
        minimap = MinimapView()
        minimap.delegate = self
        addSubview(minimap)
        
        setupConstraints()
        
        // Initially hide some components
        sidePanel.isHidden = true
    }
    
    private func setupConstraints() {
        topBar.translatesAutoresizingMaskIntoConstraints = false
        bottomBar.translatesAutoresizingMaskIntoConstraints = false
        sidePanel.translatesAutoresizingMaskIntoConstraints = false
        minimap.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            // Top bar
            topBar.topAnchor.constraint(equalTo: safeAreaLayoutGuide.topAnchor),
            topBar.leadingAnchor.constraint(equalTo: leadingAnchor),
            topBar.trailingAnchor.constraint(equalTo: trailingAnchor),
            topBar.heightAnchor.constraint(equalToConstant: 60),
            
            // Bottom bar
            bottomBar.bottomAnchor.constraint(equalTo: safeAreaLayoutGuide.bottomAnchor),
            bottomBar.leadingAnchor.constraint(equalTo: leadingAnchor),
            bottomBar.trailingAnchor.constraint(equalTo: trailingAnchor),
            bottomBar.heightAnchor.constraint(equalToConstant: 120),
            
            // Side panel
            sidePanel.topAnchor.constraint(equalTo: topBar.bottomAnchor, constant: 10),
            sidePanel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -10),
            sidePanel.widthAnchor.constraint(equalToConstant: 300),
            sidePanel.heightAnchor.constraint(equalToConstant: 400),
            
            // Minimap
            minimap.topAnchor.constraint(equalTo: topBar.bottomAnchor, constant: 10),
            minimap.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 10),
            minimap.widthAnchor.constraint(equalToConstant: 200),
            minimap.heightAnchor.constraint(equalToConstant: 200)
        ])
    }
    
    private func setupNotifications() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(gameStateChanged),
            name: GameEngine.gameStateChangedNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(resourcesChanged),
            name: ResourceManager.resourcesChangedNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(missionStarted(_:)),
            name: .missionStarted,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(objectiveCompleted(_:)),
            name: .objectiveCompleted,
            object: nil
        )
    }
    
    // MARK: - Public Methods
    
    func updateGameState() {
        currentGameState = GameEngine.shared.currentState
        
        DispatchQueue.main.async {
            self.updateUIForGameState()
        }
    }
    
    func showControllerConnectedMessage() {
        showMessage("🎮 Controller Connected", duration: 2.0)
    }
    
    func hideControllerConnectedMessage() {
        showMessage("🎮 Controller Disconnected", duration: 2.0)
    }
    
    func showLoadGameInterface() {
        guard loadGameMenu == nil else { return }
        
        loadGameMenu = LoadGameMenuView()
        loadGameMenu?.delegate = self
        addSubview(loadGameMenu!)
        
        loadGameMenu?.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            loadGameMenu!.centerXAnchor.constraint(equalTo: centerXAnchor),
            loadGameMenu!.centerYAnchor.constraint(equalTo: centerYAnchor),
            loadGameMenu!.widthAnchor.constraint(equalToConstant: 400),
            loadGameMenu!.heightAnchor.constraint(equalToConstant: 500)
        ])
        
        loadGameMenu?.alpha = 0
        UIView.animate(withDuration: 0.3) {
            self.loadGameMenu?.alpha = 1
        }
    }
    
    private func updateUIForGameState() {
        switch currentGameState {
        case .mainMenu:
            topBar.isHidden = true
            bottomBar.isHidden = true
            sidePanel.isHidden = true
            minimap.isHidden = true
            
        case .campaign, .skirmish:
            topBar.isHidden = false
            bottomBar.isHidden = false
            minimap.isHidden = false
            updateResourceDisplay()
            
        case .paused:
            showPauseMenu()
            
        case .gameOver:
            showGameOverScreen()
            
        default:
            break
        }
    }
    
    private func updateResourceDisplay() {
        let resources = ResourceManager.shared.currentResources
        topBar.updateResources(resources)
        topBar.updatePower(ResourceManager.shared.availablePower, ResourceManager.shared.power)
    }
    
    // MARK: - UI State Management
    
    func selectUnit(_ unit: Unit) {
        selectedUnit = unit
        selectedBuilding = nil
        
        bottomBar.showUnitControls(for: unit)
        sidePanel.isHidden = true
    }
    
    func selectBuilding(_ building: Building) {
        selectedBuilding = building
        selectedUnit = nil
        
        bottomBar.showBuildingControls(for: building)
        
        if building.buildingData.canProduceUnits || building.buildingData.canProduceBuildings {
            sidePanel.showProductionOptions(for: building)
            sidePanel.isHidden = false
        } else {
            sidePanel.isHidden = true
        }
    }
    
    func clearSelection() {
        selectedUnit = nil
        selectedBuilding = nil
        
        bottomBar.clearSelection()
        sidePanel.isHidden = true
    }
    
    // MARK: - Menu Management
    
    private func showPauseMenu() {
        guard pauseMenu == nil else { return }
        
        pauseMenu = PauseMenuView()
        pauseMenu?.delegate = self
        addSubview(pauseMenu!)
        
        pauseMenu?.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            pauseMenu!.centerXAnchor.constraint(equalTo: centerXAnchor),
            pauseMenu!.centerYAnchor.constraint(equalTo: centerYAnchor),
            pauseMenu!.widthAnchor.constraint(equalToConstant: 300),
            pauseMenu!.heightAnchor.constraint(equalToConstant: 400)
        ])
        
        pauseMenu?.alpha = 0
        UIView.animate(withDuration: 0.3) {
            self.pauseMenu?.alpha = 1
        }
    }
    
    private func hidePauseMenu() {
        guard let pauseMenu = pauseMenu else { return }
        
        UIView.animate(withDuration: 0.3, animations: {
            pauseMenu.alpha = 0
        }) { _ in
            pauseMenu.removeFromSuperview()
            self.pauseMenu = nil
        }
    }
    
    private func hideLoadGameMenu() {
        guard let loadGameMenu = loadGameMenu else { return }
        
        UIView.animate(withDuration: 0.3, animations: {
            loadGameMenu.alpha = 0
        }) { _ in
            loadGameMenu.removeFromSuperview()
            self.loadGameMenu = nil
        }
    }
    
    private func showGameOverScreen() {
        // Implementation for game over screen
        let gameOverView = GameOverView()
        gameOverView.delegate = self
        addSubview(gameOverView)
        
        gameOverView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            gameOverView.centerXAnchor.constraint(equalTo: centerXAnchor),
            gameOverView.centerYAnchor.constraint(equalTo: centerYAnchor),
            gameOverView.widthAnchor.constraint(equalToConstant: 400),
            gameOverView.heightAnchor.constraint(equalToConstant: 300)
        ])
    }
    
    private func showMessage(_ text: String, duration: TimeInterval) {
        let messageLabel = UILabel()
        messageLabel.text = text
        messageLabel.textColor = .white
        messageLabel.backgroundColor = UIColor.black.withAlphaComponent(0.7)
        messageLabel.textAlignment = .center
        messageLabel.layer.cornerRadius = 10
        messageLabel.clipsToBounds = true
        
        addSubview(messageLabel)
        
        messageLabel.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            messageLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            messageLabel.topAnchor.constraint(equalTo: topBar.bottomAnchor, constant: 20),
            messageLabel.widthAnchor.constraint(equalToConstant: 300),
            messageLabel.heightAnchor.constraint(equalToConstant: 50)
        ])
        
        messageLabel.alpha = 0
        UIView.animate(withDuration: 0.3, animations: {
            messageLabel.alpha = 1
        }) { _ in
            UIView.animate(withDuration: 0.3, delay: duration, animations: {
                messageLabel.alpha = 0
            }) { _ in
                messageLabel.removeFromSuperview()
            }
        }
    }
    
    // MARK: - Notification Handlers
    
    @objc private func gameStateChanged() {
        updateGameState()
    }
    
    @objc private func resourcesChanged() {
        updateResourceDisplay()
    }
    
    @objc private func missionStarted(_ notification: Notification) {
        guard let mission = notification.object as? Mission else { return }
        showMessage("Mission: \(mission.name)", duration: 3.0)
    }
    
    @objc private func objectiveCompleted(_ notification: Notification) {
        guard let objective = notification.object as? MissionObjective else { return }
        showMessage("✅ \(objective.description)", duration: 2.0)
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}

// MARK: - TopBarView Delegate

extension GameUI: TopBarViewDelegate {
    func pauseButtonTapped() {
        delegate?.didRequestPauseGame()
    }
    
    func menuButtonTapped() {
        delegate?.didRequestMainMenu()
    }
}

// MARK: - BottomBarView Delegate

extension GameUI: BottomBarViewDelegate {
    func unitActionButtonTapped(_ action: UnitAction) {
        // Handle unit actions (move, attack, stop, etc.)
    }
    
    func buildingActionButtonTapped(_ action: BuildingAction) {
        // Handle building actions
    }
}

// MARK: - SidePanelView Delegate

extension GameUI: SidePanelViewDelegate {
    func buildUnitButtonTapped(_ unitType: UnitType) {
        delegate?.didRequestBuildUnit(unitType)
    }
    
    func buildBuildingButtonTapped(_ buildingType: BuildingType) {
        delegate?.didRequestBuildBuilding(buildingType)
    }
}

// MARK: - MinimapView Delegate

extension GameUI: MinimapViewDelegate {
    func minimapLocationTapped(_ position: SCNVector3) {
        // Handle minimap tap for camera movement
    }
}

// MARK: - PauseMenuView Delegate

extension GameUI: PauseMenuViewDelegate {
    func resumeGameButtonTapped() {
        hidePauseMenu()
        GameEngine.shared.resumeGame()
    }
    
    func saveGameButtonTapped() {
        delegate?.didRequestSaveGame()
        hidePauseMenu()
    }
    
    func loadGameButtonTapped() {
        hidePauseMenu()
        delegate?.didRequestLoadGame()
    }
    
    func mainMenuButtonTapped() {
        hidePauseMenu()
        delegate?.didRequestMainMenu()
    }
}

// MARK: - LoadGameMenuView Delegate

extension GameUI: LoadGameMenuViewDelegate {
    func loadSaveFile(_ fileName: String) {
        hideLoadGameMenu()
        // Load the selected save file
    }
    
    func cancelLoadGame() {
        hideLoadGameMenu()
    }
}

// MARK: - GameOverView Delegate

extension GameUI: GameOverViewDelegate {
    func restartMissionButtonTapped() {
        // Restart current mission
    }
    
    func returnToMainMenuButtonTapped() {
        delegate?.didRequestMainMenu()
    }
}

// MARK: - Supporting Types

enum UnitAction {
    case move, attack, stop, patrol, guard
}

enum BuildingAction {
    case repair, sell, power
}

// MARK: - Top Bar View

class TopBarView: UIView {
    weak var delegate: TopBarViewDelegate?
    
    private var creditsLabel: UILabel!
    private var powerLabel: UILabel!
    private var pauseButton: UIButton!
    private var menuButton: UIButton!
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupViews()
    }
    
    private func setupViews() {
        backgroundColor = UIColor.black.withAlphaComponent(0.8)
        layer.cornerRadius = 10
        
        // Credits display
        creditsLabel = UILabel()
        creditsLabel.textColor = .yellow
        creditsLabel.font = UIFont.boldSystemFont(ofSize: 16)
        creditsLabel.text = "💰 10,000"
        addSubview(creditsLabel)
        
        // Power display
        powerLabel = UILabel()
        powerLabel.textColor = .cyan
        powerLabel.font = UIFont.boldSystemFont(ofSize: 16)
        powerLabel.text = "⚡ 100/200"
        addSubview(powerLabel)
        
        // Pause button
        pauseButton = UIButton(type: .system)
        pauseButton.setTitle("⏸️", for: .normal)
        pauseButton.titleLabel?.font = UIFont.systemFont(ofSize: 24)
        pauseButton.addTarget(self, action: #selector(pauseButtonTapped), for: .touchUpInside)
        addSubview(pauseButton)
        
        // Menu button
        menuButton = UIButton(type: .system)
        menuButton.setTitle("📋", for: .normal)
        menuButton.titleLabel?.font = UIFont.systemFont(ofSize: 24)
        menuButton.addTarget(self, action: #selector(menuButtonTapped), for: .touchUpInside)
        addSubview(menuButton)
        
        setupConstraints()
    }
    
    private func setupConstraints() {
        [creditsLabel, powerLabel, pauseButton, menuButton].forEach {
            $0?.translatesAutoresizingMaskIntoConstraints = false
        }
        
        NSLayoutConstraint.activate([
            creditsLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 20),
            creditsLabel.centerYAnchor.constraint(equalTo: centerYAnchor),
            
            powerLabel.leadingAnchor.constraint(equalTo: creditsLabel.trailingAnchor, constant: 30),
            powerLabel.centerYAnchor.constraint(equalTo: centerYAnchor),
            
            menuButton.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -20),
            menuButton.centerYAnchor.constraint(equalTo: centerYAnchor),
            
            pauseButton.trailingAnchor.constraint(equalTo: menuButton.leadingAnchor, constant: -20),
            pauseButton.centerYAnchor.constraint(equalTo: centerYAnchor)
        ])
    }
    
    func updateResources(_ resources: Resources) {
        creditsLabel.text = "💰 \(ResourceUI.formatCredits(resources.credits))"
    }
    
    func updatePower(_ current: Int, _ max: Int) {
        powerLabel.text = "⚡ \(ResourceUI.formatPower(current, max))"
        powerLabel.textColor = ResourceUI.getPowerColor(current: current, max: max)
    }
    
    @objc private func pauseButtonTapped() {
        delegate?.pauseButtonTapped()
    }
    
    @objc private func menuButtonTapped() {
        delegate?.menuButtonTapped()
    }
}

protocol TopBarViewDelegate: AnyObject {
    func pauseButtonTapped()
    func menuButtonTapped()
}

// MARK: - Additional UI Components (Simplified)

class BottomBarView: UIView {
    weak var delegate: BottomBarViewDelegate?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupViews()
    }
    
    private func setupViews() {
        backgroundColor = UIColor.black.withAlphaComponent(0.8)
        layer.cornerRadius = 10
    }
    
    func showUnitControls(for unit: Unit) {
        // Show unit-specific controls
    }
    
    func showBuildingControls(for building: Building) {
        // Show building-specific controls
    }
    
    func clearSelection() {
        // Clear all controls
    }
}

protocol BottomBarViewDelegate: AnyObject {
    func unitActionButtonTapped(_ action: UnitAction)
    func buildingActionButtonTapped(_ action: BuildingAction)
}

class SidePanelView: UIView {
    weak var delegate: SidePanelViewDelegate?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupViews()
    }
    
    private func setupViews() {
        backgroundColor = UIColor.black.withAlphaComponent(0.8)
        layer.cornerRadius = 10
    }
    
    func showProductionOptions(for building: Building) {
        // Show production buttons for the building
    }
}

protocol SidePanelViewDelegate: AnyObject {
    func buildUnitButtonTapped(_ unitType: UnitType)
    func buildBuildingButtonTapped(_ buildingType: BuildingType)
}

class MinimapView: UIView {
    weak var delegate: MinimapViewDelegate?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupViews()
    }
    
    private func setupViews() {
        backgroundColor = UIColor.black.withAlphaComponent(0.8)
        layer.cornerRadius = 10
        layer.borderWidth = 2
        layer.borderColor = UIColor.gray.cgColor
    }
}

protocol MinimapViewDelegate: AnyObject {
    func minimapLocationTapped(_ position: SCNVector3)
}

// MARK: - Menu Views

class PauseMenuView: UIView {
    weak var delegate: PauseMenuViewDelegate?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupViews()
    }
    
    private func setupViews() {
        backgroundColor = UIColor.black.withAlphaComponent(0.9)
        layer.cornerRadius = 15
        
        let titleLabel = UILabel()
        titleLabel.text = "Game Paused"
        titleLabel.textColor = .white
        titleLabel.font = UIFont.boldSystemFont(ofSize: 24)
        titleLabel.textAlignment = .center
        addSubview(titleLabel)
        
        let buttonStack = UIStackView()
        buttonStack.axis = .vertical
        buttonStack.spacing = 15
        buttonStack.distribution = .fillEqually
        
        let resumeButton = createButton("Resume Game", action: #selector(resumeButtonTapped))
        let saveButton = createButton("Save Game", action: #selector(saveButtonTapped))
        let loadButton = createButton("Load Game", action: #selector(loadButtonTapped))
        let menuButton = createButton("Main Menu", action: #selector(menuButtonTapped))
        
        [resumeButton, saveButton, loadButton, menuButton].forEach {
            buttonStack.addArrangedSubview($0)
        }
        
        addSubview(buttonStack)
        
        [titleLabel, buttonStack].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
        }
        
        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: topAnchor, constant: 30),
            titleLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            
            buttonStack.centerXAnchor.constraint(equalTo: centerXAnchor),
            buttonStack.centerYAnchor.constraint(equalTo: centerYAnchor, constant: 20),
            buttonStack.widthAnchor.constraint(equalToConstant: 200),
            buttonStack.heightAnchor.constraint(equalToConstant: 240)
        ])
    }
    
    private func createButton(_ title: String, action: Selector) -> UIButton {
        let button = UIButton(type: .system)
        button.setTitle(title, for: .normal)
        button.titleLabel?.font = UIFont.systemFont(ofSize: 18)
        button.backgroundColor = UIColor.blue.withAlphaComponent(0.7)
        button.setTitleColor(.white, for: .normal)
        button.layer.cornerRadius = 8
        button.addTarget(self, action: action, for: .touchUpInside)
        return button
    }
    
    @objc private func resumeButtonTapped() {
        delegate?.resumeGameButtonTapped()
    }
    
    @objc private func saveButtonTapped() {
        delegate?.saveGameButtonTapped()
    }
    
    @objc private func loadButtonTapped() {
        delegate?.loadGameButtonTapped()
    }
    
    @objc private func menuButtonTapped() {
        delegate?.mainMenuButtonTapped()
    }
}

protocol PauseMenuViewDelegate: AnyObject {
    func resumeGameButtonTapped()
    func saveGameButtonTapped()
    func loadGameButtonTapped()
    func mainMenuButtonTapped()
}

class LoadGameMenuView: UIView {
    weak var delegate: LoadGameMenuViewDelegate?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupViews()
    }
    
    private func setupViews() {
        backgroundColor = UIColor.black.withAlphaComponent(0.9)
        layer.cornerRadius = 15
        
        // Implementation for load game interface
        let titleLabel = UILabel()
        titleLabel.text = "Load Game"
        titleLabel.textColor = .white
        titleLabel.font = UIFont.boldSystemFont(ofSize: 24)
        titleLabel.textAlignment = .center
        addSubview(titleLabel)
        
        let cancelButton = UIButton(type: .system)
        cancelButton.setTitle("Cancel", for: .normal)
        cancelButton.titleLabel?.font = UIFont.systemFont(ofSize: 18)
        cancelButton.backgroundColor = UIColor.red.withAlphaComponent(0.7)
        cancelButton.setTitleColor(.white, for: .normal)
        cancelButton.layer.cornerRadius = 8
        cancelButton.addTarget(self, action: #selector(cancelButtonTapped), for: .touchUpInside)
        addSubview(cancelButton)
        
        [titleLabel, cancelButton].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
        }
        
        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: topAnchor, constant: 30),
            titleLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            
            cancelButton.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -30),
            cancelButton.centerXAnchor.constraint(equalTo: centerXAnchor),
            cancelButton.widthAnchor.constraint(equalToConstant: 100),
            cancelButton.heightAnchor.constraint(equalToConstant: 40)
        ])
    }
    
    @objc private func cancelButtonTapped() {
        delegate?.cancelLoadGame()
    }
}

protocol LoadGameMenuViewDelegate: AnyObject {
    func loadSaveFile(_ fileName: String)
    func cancelLoadGame()
}

class GameOverView: UIView {
    weak var delegate: GameOverViewDelegate?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupViews()
    }
    
    private func setupViews() {
        backgroundColor = UIColor.black.withAlphaComponent(0.9)
        layer.cornerRadius = 15
        
        let titleLabel = UILabel()
        titleLabel.text = "Mission Complete"
        titleLabel.textColor = .white
        titleLabel.font = UIFont.boldSystemFont(ofSize: 24)
        titleLabel.textAlignment = .center
        addSubview(titleLabel)
        
        [titleLabel].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
        }
        
        NSLayoutConstraint.activate([
            titleLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            titleLabel.centerYAnchor.constraint(equalTo: centerYAnchor)
        ])
    }
}

protocol GameOverViewDelegate: AnyObject {
    func restartMissionButtonTapped()
    func returnToMainMenuButtonTapped()
}