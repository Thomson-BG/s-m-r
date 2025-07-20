import UIKit
import AVFoundation

class SplashViewController: UIViewController {
    
    // MARK: - UI Elements
    private let backgroundView = UIView()
    private let terminalView = UIView()
    private let codeLabel = UILabel()
    private let gameLogoImageView = UIImageView()
    private let startButtonLabel = UILabel()
    private let creditsLabel = UILabel()
    private let developerLogoImageView = UIImageView()
    private let companyLabel = UILabel()
    
    // MARK: - Audio
    private var audioPlayer: AVAudioPlayer?
    private var typingTimer: Timer?
    
    // MARK: - Animation Properties
    private let terminalCode = [
        "INITIALIZING QUANTUM PROCESSOR...",
        "LOADING TACTICAL DATABANK...",
        "ENCRYPTING COMMAND PROTOCOLS...",
        "ESTABLISHING SECURE CONNECTION...",
        "ACCESSING GLOBAL DEFENSE NETWORK...",
        "QUANTUM ENCRYPTION ENABLED...",
        "TACTICAL SYSTEMS ONLINE...",
        "REVENGE PROTOCOL ACTIVATED...",
        "WELCOME COMMANDER..."
    ]
    
    private var currentCodeIndex = 0
    private var currentCharIndex = 0
    private var hasStarted = false
    
    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        setupBackground()
        setupTerminalView()
        setupGameLogo()
        setupStartButton()
        setupCredits()
        setupAudio()
        setupTapGesture()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        startSplashAnimation()
    }
    
    // MARK: - Setup Methods
    private func setupBackground() {
        view.backgroundColor = UIColor.black
        
        // Create a subtle gradient background
        let gradientLayer = CAGradientLayer()
        gradientLayer.frame = view.bounds
        gradientLayer.colors = [
            UIColor.black.cgColor,
            UIColor(red: 0.1, green: 0.0, blue: 0.0, alpha: 1.0).cgColor,
            UIColor.black.cgColor
        ]
        gradientLayer.locations = [0.0, 0.5, 1.0]
        view.layer.insertSublayer(gradientLayer, at: 0)
    }
    
    private func setupTerminalView() {
        terminalView.backgroundColor = UIColor.black.withAlphaComponent(0.8)
        terminalView.layer.borderColor = UIColor.red.cgColor
        terminalView.layer.borderWidth = 2.0
        terminalView.layer.cornerRadius = 8.0
        
        view.addSubview(terminalView)
        terminalView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            terminalView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            terminalView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 50),
            terminalView.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 0.8),
            terminalView.heightAnchor.constraint(equalToConstant: 200)
        ])
        
        // Setup code label
        codeLabel.textColor = UIColor.red
        codeLabel.font = UIFont(name: "Courier", size: 14) ?? UIFont.monospacedSystemFont(ofSize: 14, weight: .medium)
        codeLabel.numberOfLines = 0
        codeLabel.textAlignment = .left
        
        terminalView.addSubview(codeLabel)
        codeLabel.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            codeLabel.leadingAnchor.constraint(equalTo: terminalView.leadingAnchor, constant: 16),
            codeLabel.trailingAnchor.constraint(equalTo: terminalView.trailingAnchor, constant: -16),
            codeLabel.topAnchor.constraint(equalTo: terminalView.topAnchor, constant: 16),
            codeLabel.bottomAnchor.constraint(equalTo: terminalView.bottomAnchor, constant: -16)
        ])
    }
    
    private func setupGameLogo() {
        // Create the game logo programmatically
        let logoImage = generateGameLogo()
        gameLogoImageView.image = logoImage
        gameLogoImageView.contentMode = .scaleAspectFit
        gameLogoImageView.alpha = 0.0
        
        view.addSubview(gameLogoImageView)
        gameLogoImageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            gameLogoImageView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            gameLogoImageView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            gameLogoImageView.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 0.7),
            gameLogoImageView.heightAnchor.constraint(equalToConstant: 120)
        ])
    }
    
    private func setupStartButton() {
        startButtonLabel.text = "PRESS START TO CONTINUE"
        startButtonLabel.textColor = UIColor.yellow
        startButtonLabel.font = UIFont.boldSystemFont(ofSize: 24)
        startButtonLabel.textAlignment = .center
        startButtonLabel.alpha = 0.0
        
        view.addSubview(startButtonLabel)
        startButtonLabel.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            startButtonLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            startButtonLabel.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -120)
        ])
    }
    
    private func setupCredits() {
        // Developer logo
        let developerLogo = generateDeveloperLogo()
        developerLogoImageView.image = developerLogo
        developerLogoImageView.contentMode = .scaleAspectFit
        developerLogoImageView.alpha = 0.0
        
        view.addSubview(developerLogoImageView)
        developerLogoImageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            developerLogoImageView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            developerLogoImageView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -60),
            developerLogoImageView.widthAnchor.constraint(equalToConstant: 40),
            developerLogoImageView.heightAnchor.constraint(equalToConstant: 40)
        ])
        
        // Company label
        companyLabel.text = "Thomson innovations"
        companyLabel.textColor = UIColor.white
        companyLabel.font = UIFont.systemFont(ofSize: 16)
        companyLabel.textAlignment = .center
        companyLabel.alpha = 0.0
        
        view.addSubview(companyLabel)
        companyLabel.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            companyLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            companyLabel.topAnchor.constraint(equalTo: developerLogoImageView.bottomAnchor, constant: 8)
        ])
        
        // Credits label
        creditsLabel.text = "Built by: Josh Thomson\nFor: Scotty Mason"
        creditsLabel.textColor = UIColor.lightGray
        creditsLabel.font = UIFont.systemFont(ofSize: 14)
        creditsLabel.textAlignment = .center
        creditsLabel.numberOfLines = 0
        creditsLabel.alpha = 0.0
        
        view.addSubview(creditsLabel)
        creditsLabel.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            creditsLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            creditsLabel.bottomAnchor.constraint(equalTo: developerLogoImageView.topAnchor, constant: -20)
        ])
    }
    
    private func setupAudio() {
        // Create typing sound effect programmatically (we'll use system sounds for now)
    }
    
    private func setupTapGesture() {
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap))
        view.addGestureRecognizer(tapGesture)
        
        // Also respond to space bar or return key
        let keyCommand = UIKeyCommand(input: " ", modifierFlags: [], action: #selector(handleKeyPress))
        addKeyCommand(keyCommand)
        
        let returnCommand = UIKeyCommand(input: "\r", modifierFlags: [], action: #selector(handleKeyPress))
        addKeyCommand(returnCommand)
    }
    
    // MARK: - Animation Methods
    private func startSplashAnimation() {
        // Start typing animation after a brief delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.startTypingAnimation()
        }
        
        // Show logo after terminal animation
        DispatchQueue.main.asyncAfter(deadline: .now() + 8.0) {
            self.showGameLogo()
        }
        
        // Show start button after logo
        DispatchQueue.main.asyncAfter(deadline: .now() + 10.0) {
            self.showStartButton()
        }
    }
    
    private func startTypingAnimation() {
        typingTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
            self.typeNextCharacter()
        }
    }
    
    private func typeNextCharacter() {
        guard currentCodeIndex < terminalCode.count else {
            typingTimer?.invalidate()
            return
        }
        
        let currentLine = terminalCode[currentCodeIndex]
        
        if currentCharIndex < currentLine.count {
            let index = currentLine.index(currentLine.startIndex, offsetBy: currentCharIndex)
            let character = currentLine[index]
            
            // Update the displayed text
            let displayedText = codeLabel.text ?? ""
            if currentCharIndex == 0 && currentCodeIndex > 0 {
                codeLabel.text = displayedText + "\n> " + String(character)
            } else if currentCharIndex == 0 {
                codeLabel.text = "> " + String(character)
            } else {
                codeLabel.text = displayedText + String(character)
            }
            
            currentCharIndex += 1
            
            // Play typing sound
            playTypingSound()
        } else {
            currentCodeIndex += 1
            currentCharIndex = 0
        }
    }
    
    private func showGameLogo() {
        UIView.animate(withDuration: 2.0, animations: {
            self.gameLogoImageView.alpha = 1.0
            self.gameLogoImageView.transform = CGAffineTransform(scaleX: 1.1, y: 1.1)
        }) { _ in
            UIView.animate(withDuration: 0.5) {
                self.gameLogoImageView.transform = CGAffineTransform.identity
            }
        }
    }
    
    private func showStartButton() {
        startFlashingStartButton()
    }
    
    private func startFlashingStartButton() {
        UIView.animate(withDuration: 0.8, options: [.repeat, .autoreverse]) {
            self.startButtonLabel.alpha = 1.0
        }
    }
    
    private func showCredits() {
        let credits = [creditsLabel, developerLogoImageView, companyLabel]
        
        for (index, view) in credits.enumerated() {
            UIView.animate(
                withDuration: 1.0,
                delay: Double(index) * 0.5,
                options: .curveEaseInOut
            ) {
                view.alpha = 1.0
            }
        }
    }
    
    // MARK: - Input Handling
    @objc private func handleTap() {
        proceedToMainMenu()
    }
    
    @objc private func handleKeyPress() {
        proceedToMainMenu()
    }
    
    private func proceedToMainMenu() {
        guard !hasStarted else { return }
        hasStarted = true
        
        typingTimer?.invalidate()
        
        // Show credits animation first
        showCredits()
        
        // Then proceed to main menu after credits
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
            self.transitionToMainMenu()
        }
    }
    
    private func transitionToMainMenu() {
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        
        // Check if MainMenuViewController exists in storyboard, otherwise create programmatically
        let mainMenuVC: UIViewController
        if let menuVC = storyboard.instantiateViewController(withIdentifier: "MainMenuViewController") as? MainMenuViewController {
            mainMenuVC = menuVC
        } else {
            mainMenuVC = MainMenuViewController()
        }
        
        mainMenuVC.modalTransitionStyle = .crossDissolve
        mainMenuVC.modalPresentationStyle = .fullScreen
        
        present(mainMenuVC, animated: true)
    }
    
    // MARK: - Audio Methods
    private func playTypingSound() {
        // Use system sound for now
        AudioServicesPlaySystemSound(1104) // Keyboard click sound
    }
    
    // MARK: - Logo Generation
    private func generateGameLogo() -> UIImage? {
        let size = CGSize(width: 600, height: 120)
        let renderer = UIGraphicsImageRenderer(size: size)
        
        return renderer.image { context in
            let cgContext = context.cgContext
            
            // Background
            cgContext.setFillColor(UIColor.clear.cgColor)
            cgContext.fill(CGRect(origin: .zero, size: size))
            
            // Title text
            let title = "SCOTTY MASON'S\nREVENGE"
            let titleAttributes: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 48),
                .foregroundColor: UIColor.red,
                .strokeColor: UIColor.yellow,
                .strokeWidth: -2.0
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
            
            title.draw(in: titleRect, withAttributes: titleAttributes)
            
            // Add glow effect
            cgContext.setShadow(offset: .zero, blur: 10.0, color: UIColor.red.cgColor)
            title.draw(in: titleRect, withAttributes: titleAttributes)
        }
    }
    
    private func generateDeveloperLogo() -> UIImage? {
        let size = CGSize(width: 40, height: 40)
        let renderer = UIGraphicsImageRenderer(size: size)
        
        return renderer.image { context in
            let cgContext = context.cgContext
            
            // Black square background with transparency
            cgContext.setFillColor(UIColor.black.withAlphaComponent(0.8).cgColor)
            cgContext.fill(CGRect(origin: .zero, size: size))
            
            // Border
            cgContext.setStrokeColor(UIColor.lightGray.cgColor)
            cgContext.setLineWidth(1.0)
            cgContext.stroke(CGRect(origin: .zero, size: size))
            
            // "T" and "i" text
            let text = "Ti"
            let attributes: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 20),
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
}

import AudioToolbox