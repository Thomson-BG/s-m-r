import UIKit
import AVFoundation

class MainMenuViewController: UIViewController {
    
    // MARK: - UI Elements
    private let backgroundImageView = UIImageView()
    private let gameLogoImageView = UIImageView()
    private let menuStackView = UIStackView()
    private let developerLogoImageView = UIImageView()
    private let companyLabel = UILabel()
    
    // Menu buttons
    private let startGameButton = UIButton(type: .system)
    private let campaignButton = UIButton(type: .system)
    private let skirmishButton = UIButton(type: .system)
    private let settingsButton = UIButton(type: .system)
    private let creditsButton = UIButton(type: .system)
    private let exitButton = UIButton(type: .system)
    
    // MARK: - Audio
    private var backgroundMusicPlayer: AVAudioPlayer?
    
    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        setupBackground()
        setupGameLogo()
        setupMenuButtons()
        setupDeveloperBranding()
        setupBackgroundMusic()
        setupParticleEffects()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        startMenuAnimations()
        playBackgroundMusic()
    }
    
    // MARK: - Setup Methods
    private func setupBackground() {
        view.backgroundColor = UIColor.black
        
        // Create a futuristic background
        let gradientLayer = CAGradientLayer()
        gradientLayer.frame = view.bounds
        gradientLayer.colors = [
            UIColor.black.cgColor,
            UIColor(red: 0.05, green: 0.05, blue: 0.1, alpha: 1.0).cgColor,
            UIColor(red: 0.1, green: 0.0, blue: 0.0, alpha: 1.0).cgColor,
            UIColor.black.cgColor
        ]
        gradientLayer.locations = [0.0, 0.3, 0.7, 1.0]
        view.layer.insertSublayer(gradientLayer, at: 0)
        
        // Add animated background elements
        addAnimatedBackgroundElements()
    }
    
    private func addAnimatedBackgroundElements() {
        // Create subtle animated grid lines
        for i in 0..<20 {
            let lineView = UIView()
            lineView.backgroundColor = UIColor.red.withAlphaComponent(0.1)
            lineView.frame = CGRect(x: CGFloat(i) * 50, y: 0, width: 1, height: view.bounds.height)
            view.addSubview(lineView)
            
            // Animate opacity
            UIView.animate(withDuration: 2.0 + Double(i) * 0.1, 
                          delay: Double(i) * 0.2, 
                          options: [.repeat, .autoreverse]) {
                lineView.alpha = 0.3
            }
        }
    }
    
    private func setupGameLogo() {
        let logoImage = generateMainMenuLogo()
        gameLogoImageView.image = logoImage
        gameLogoImageView.contentMode = .scaleAspectFit
        gameLogoImageView.alpha = 0.0
        
        view.addSubview(gameLogoImageView)
        gameLogoImageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            gameLogoImageView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            gameLogoImageView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 40),
            gameLogoImageView.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 0.8),
            gameLogoImageView.heightAnchor.constraint(equalToConstant: 100)
        ])
    }
    
    private func setupMenuButtons() {
        // Configure stack view
        menuStackView.axis = .vertical
        menuStackView.distribution = .fillEqually
        menuStackView.spacing = 20
        menuStackView.alpha = 0.0
        
        view.addSubview(menuStackView)
        menuStackView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            menuStackView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            menuStackView.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: 20),
            menuStackView.widthAnchor.constraint(equalToConstant: 300),
            menuStackView.heightAnchor.constraint(equalToConstant: 360)
        ])
        
        // Configure buttons
        let buttons = [
            (startGameButton, "START GAME", #selector(startGameTapped)),
            (campaignButton, "CAMPAIGN", #selector(campaignTapped)),
            (skirmishButton, "SKIRMISH", #selector(skirmishTapped)),
            (settingsButton, "SETTINGS", #selector(settingsTapped)),
            (creditsButton, "CREDITS", #selector(creditsTapped)),
            (exitButton, "EXIT", #selector(exitTapped))
        ]
        
        for (button, title, action) in buttons {
            configureMenuButton(button, title: title, action: action)
            menuStackView.addArrangedSubview(button)
        }
    }
    
    private func configureMenuButton(_ button: UIButton, title: String, action: Selector) {
        button.setTitle(title, for: .normal)
        button.titleLabel?.font = UIFont.boldSystemFont(ofSize: 20)
        button.setTitleColor(UIColor.yellow, for: .normal)
        button.setTitleColor(UIColor.orange, for: .highlighted)
        button.backgroundColor = UIColor.black.withAlphaComponent(0.7)
        button.layer.borderColor = UIColor.red.cgColor
        button.layer.borderWidth = 2.0
        button.layer.cornerRadius = 8.0
        
        // Add glow effect
        button.layer.shadowColor = UIColor.red.cgColor
        button.layer.shadowOffset = .zero
        button.layer.shadowRadius = 10.0
        button.layer.shadowOpacity = 0.5
        
        button.addTarget(self, action: action, for: .touchUpInside)
        
        // Add hover effect for supported devices
        if #available(iOS 13.4, *) {
            button.addTarget(self, action: #selector(buttonHoverBegan(_:)), for: .touchDown)
            button.addTarget(self, action: #selector(buttonHoverEnded(_:)), for: .touchUpInside)
            button.addTarget(self, action: #selector(buttonHoverEnded(_:)), for: .touchUpOutside)
        }
    }
    
    private func setupDeveloperBranding() {
        // Developer logo at bottom
        let developerLogo = generateDeveloperLogo()
        developerLogoImageView.image = developerLogo
        developerLogoImageView.contentMode = .scaleAspectFit
        developerLogoImageView.alpha = 0.8
        
        view.addSubview(developerLogoImageView)
        developerLogoImageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            developerLogoImageView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -40),
            developerLogoImageView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            developerLogoImageView.widthAnchor.constraint(equalToConstant: 30),
            developerLogoImageView.heightAnchor.constraint(equalToConstant: 30)
        ])
        
        // Company name
        companyLabel.text = "Thomson innovations"
        companyLabel.textColor = UIColor.lightGray
        companyLabel.font = UIFont.systemFont(ofSize: 12)
        companyLabel.textAlignment = .center
        companyLabel.alpha = 0.8
        
        view.addSubview(companyLabel)
        companyLabel.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            companyLabel.topAnchor.constraint(equalTo: developerLogoImageView.bottomAnchor, constant: 5),
            companyLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor)
        ])
    }
    
    private func setupBackgroundMusic() {
        // Create background music programmatically
        guard let audioData = generateBackgroundMusicData() else { return }
        
        do {
            backgroundMusicPlayer = try AVAudioPlayer(data: audioData)
            backgroundMusicPlayer?.numberOfLoops = -1 // Loop indefinitely
            backgroundMusicPlayer?.volume = 0.3
            backgroundMusicPlayer?.prepareToPlay()
        } catch {
            print("Failed to setup background music: \(error)")
        }
    }
    
    private func setupParticleEffects() {
        // Add subtle particle effects for atmosphere
        let emitterLayer = CAEmitterLayer()
        emitterLayer.emitterPosition = CGPoint(x: view.bounds.width / 2, y: -10)
        emitterLayer.emitterSize = CGSize(width: view.bounds.width, height: 1)
        
        let cell = CAEmitterCell()
        cell.birthRate = 2
        cell.lifetime = 10.0
        cell.velocity = 50
        cell.velocityRange = 20
        cell.emissionRange = .pi / 8
        cell.scale = 0.1
        cell.scaleRange = 0.05
        cell.color = UIColor.red.withAlphaComponent(0.3).cgColor
        cell.contents = createParticleImage()?.cgImage
        
        emitterLayer.emitterCells = [cell]
        view.layer.addSublayer(emitterLayer)
    }
    
    // MARK: - Animation Methods
    private func startMenuAnimations() {
        // Animate logo appearance
        UIView.animate(withDuration: 1.5, delay: 0.5, options: .curveEaseOut) {
            self.gameLogoImageView.alpha = 1.0
            self.gameLogoImageView.transform = CGAffineTransform(scaleX: 1.05, y: 1.05)
        } completion: { _ in
            UIView.animate(withDuration: 0.3) {
                self.gameLogoImageView.transform = CGAffineTransform.identity
            }
        }
        
        // Animate menu buttons
        UIView.animate(withDuration: 1.0, delay: 1.0, options: .curveEaseOut) {
            self.menuStackView.alpha = 1.0
        }
        
        // Animate buttons one by one
        for (index, button) in menuStackView.arrangedSubviews.enumerated() {
            button.alpha = 0.0
            button.transform = CGAffineTransform(translationX: -50, y: 0)
            
            UIView.animate(
                withDuration: 0.5,
                delay: 1.2 + Double(index) * 0.1,
                options: .curveEaseOut
            ) {
                button.alpha = 1.0
                button.transform = CGAffineTransform.identity
            }
        }
    }
    
    private func playBackgroundMusic() {
        backgroundMusicPlayer?.play()
    }
    
    // MARK: - Button Actions
    @objc private func startGameTapped() {
        playButtonSound()
        // Start a quick skirmish game
        startGame(mode: .skirmish)
    }
    
    @objc private func campaignTapped() {
        playButtonSound()
        startGame(mode: .campaign)
    }
    
    @objc private func skirmishTapped() {
        playButtonSound()
        startGame(mode: .skirmish)
    }
    
    @objc private func settingsTapped() {
        playButtonSound()
        showSettings()
    }
    
    @objc private func creditsTapped() {
        playButtonSound()
        showCredits()
    }
    
    @objc private func exitTapped() {
        playButtonSound()
        // On iOS, we can't actually exit the app, so we'll show an alert
        showExitAlert()
    }
    
    @objc private func buttonHoverBegan(_ sender: UIButton) {
        UIView.animate(withDuration: 0.1) {
            sender.transform = CGAffineTransform(scaleX: 1.05, y: 1.05)
            sender.layer.shadowOpacity = 0.8
        }
    }
    
    @objc private func buttonHoverEnded(_ sender: UIButton) {
        UIView.animate(withDuration: 0.1) {
            sender.transform = CGAffineTransform.identity
            sender.layer.shadowOpacity = 0.5
        }
    }
    
    // MARK: - Game Flow
    private enum GameMode {
        case campaign
        case skirmish
    }
    
    private func startGame(mode: GameMode) {
        backgroundMusicPlayer?.stop()
        
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        guard let gameViewController = storyboard.instantiateViewController(withIdentifier: "GameViewController") as? GameViewController else {
            print("Failed to instantiate GameViewController from storyboard")
            return
        }
        
        // Set up game mode
        switch mode {
        case .campaign:
            // TODO: Set up campaign mode
            break
        case .skirmish:
            // TODO: Set up skirmish mode
            break
        }
        
        gameViewController.modalTransitionStyle = .crossDissolve
        gameViewController.modalPresentationStyle = .fullScreen
        
        present(gameViewController, animated: true)
    }
    
    private func showSettings() {
        let alert = UIAlertController(title: "Settings", message: "Settings panel will be implemented in future updates.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    private func showCredits() {
        let creditsVC = UIViewController()
        creditsVC.view.backgroundColor = UIColor.black
        
        let textView = UITextView()
        textView.backgroundColor = UIColor.black
        textView.textColor = UIColor.white
        textView.font = UIFont.systemFont(ofSize: 16)
        textView.textAlignment = .center
        textView.isEditable = false
        textView.text = """
        SCOTTY MASON'S REVENGE
        
        A Real-Time Strategy Game
        Inspired by Command & Conquer: Red Alert 2
        
        DEVELOPED BY
        Josh Thomson
        
        COMMISSIONED BY
        Scotty Mason
        
        SPECIAL THANKS
        Command & Conquer fans worldwide
        The RTS gaming community
        
        POWERED BY
        Thomson innovations
        
        © 2024 All Rights Reserved
        
        Tap anywhere to return to menu
        """
        
        creditsVC.view.addSubview(textView)
        textView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            textView.leadingAnchor.constraint(equalTo: creditsVC.view.leadingAnchor, constant: 40),
            textView.trailingAnchor.constraint(equalTo: creditsVC.view.trailingAnchor, constant: -40),
            textView.topAnchor.constraint(equalTo: creditsVC.view.safeAreaLayoutGuide.topAnchor, constant: 40),
            textView.bottomAnchor.constraint(equalTo: creditsVC.view.safeAreaLayoutGuide.bottomAnchor, constant: -40)
        ])
        
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(dismissCredits))
        creditsVC.view.addGestureRecognizer(tapGesture)
        
        creditsVC.modalTransitionStyle = .crossDissolve
        creditsVC.modalPresentationStyle = .fullScreen
        
        present(creditsVC, animated: true)
    }
    
    @objc private func dismissCredits() {
        dismiss(animated: true)
    }
    
    private func showExitAlert() {
        let alert = UIAlertController(
            title: "Exit Game",
            message: "Are you sure you want to exit?",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Exit", style: .destructive) { _ in
            // On iOS, we can minimize to background
            if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                scene.windows.first?.rootViewController?.dismiss(animated: false)
            }
        })
        
        present(alert, animated: true)
    }
    
    // MARK: - Audio Methods
    private func playButtonSound() {
        // Use system sound for button clicks
        AudioServicesPlaySystemSound(1104)
    }
    
    private func generateBackgroundMusicData() -> Data? {
        // For now, return nil - in a real implementation, you'd generate or load music data
        return nil
    }
    
    // MARK: - Graphics Generation
    private func generateMainMenuLogo() -> UIImage? {
        let size = CGSize(width: 800, height: 100)
        let renderer = UIGraphicsImageRenderer(size: size)
        
        return renderer.image { context in
            let cgContext = context.cgContext
            
            // Clear background
            cgContext.setFillColor(UIColor.clear.cgColor)
            cgContext.fill(CGRect(origin: .zero, size: size))
            
            // Main title
            let title = "SCOTTY MASON'S REVENGE"
            let titleAttributes: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 36),
                .foregroundColor: UIColor.red,
                .strokeColor: UIColor.yellow,
                .strokeWidth: -1.5
            ]
            
            let titleSize = title.boundingRect(
                with: size,
                options: .usesLineFragmentOrigin,
                attributes: titleAttributes,
                context: nil
            ).size
            
            let titleRect = CGRect(
                x: (size.width - titleSize.width) / 2,
                y: (size.height - titleSize.height) / 2,
                width: titleSize.width,
                height: titleSize.height
            )
            
            // Draw with glow effect
            cgContext.setShadow(offset: .zero, blur: 15.0, color: UIColor.red.cgColor)
            title.draw(in: titleRect, withAttributes: titleAttributes)
            
            // Add subtitle
            let subtitle = "Real-Time Strategy"
            let subtitleAttributes: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 14),
                .foregroundColor: UIColor.lightGray
            ]
            
            let subtitleSize = subtitle.size(withAttributes: subtitleAttributes)
            let subtitleRect = CGRect(
                x: (size.width - subtitleSize.width) / 2,
                y: titleRect.maxY + 5,
                width: subtitleSize.width,
                height: subtitleSize.height
            )
            
            subtitle.draw(in: subtitleRect, withAttributes: subtitleAttributes)
        }
    }
    
    private func generateDeveloperLogo() -> UIImage? {
        let size = CGSize(width: 30, height: 30)
        let renderer = UIGraphicsImageRenderer(size: size)
        
        return renderer.image { context in
            let cgContext = context.cgContext
            
            // Black square background
            cgContext.setFillColor(UIColor.black.cgColor)
            cgContext.fill(CGRect(origin: .zero, size: size))
            
            // Border
            cgContext.setStrokeColor(UIColor.white.cgColor)
            cgContext.setLineWidth(1.0)
            cgContext.stroke(CGRect(origin: .zero, size: size))
            
            // "T" and "i" text
            let text = "Ti"
            let attributes: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 16),
                .foregroundColor: UIColor.white
            ]
            
            let textSize = text.size(withAttributes: attributes)
            let textRect = CGRect(
                x: (size.width - textSize.width) / 2,
                y: (size.height - textSize.height) / 2,
                width: textSize.width,
                height: textSize.height
            )
            
            text.draw(in: textRect, withAttributes: attributes)
        }
    }
    
    private func createParticleImage() -> UIImage? {
        let size = CGSize(width: 4, height: 4)
        let renderer = UIGraphicsImageRenderer(size: size)
        
        return renderer.image { context in
            let cgContext = context.cgContext
            cgContext.setFillColor(UIColor.red.cgColor)
            cgContext.fillEllipse(in: CGRect(origin: .zero, size: size))
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
        backgroundMusicPlayer?.stop()
    }
}

import AudioToolbox