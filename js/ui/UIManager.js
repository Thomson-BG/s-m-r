/**
 * UI Manager for Scotty Mason's Revenge
 * Manages the game user interface
 */

class UIManager {
    constructor() {
        this.elements = {};
        this.isInitialized = false;
        this.currentScreen = 'loading';
        this.selectedObject = null;
        
        // UI state
        this.showingModal = false;
        this.notifications = [];
        this.tooltips = new Set();
        
        // Event system
        this.eventListeners = {};
        
        console.log('🖥️ UIManager initialized');
    }
    
    async initialize() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupModalSystem();
        this.setupTooltips();
        
        this.isInitialized = true;
        console.log('✅ UIManager ready');
    }
    
    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        // Screen elements
        this.elements.loadingScreen = document.getElementById('loading-screen');
        this.elements.mainMenu = document.getElementById('main-menu');
        this.elements.gameInterface = document.getElementById('game-interface');
        
        // Loading elements
        this.elements.loadingProgress = document.getElementById('loading-progress');
        this.elements.loadingText = document.getElementById('loading-text');
        
        // Menu elements
        this.elements.startGameBtn = document.getElementById('start-game-btn');
        this.elements.campaignBtn = document.getElementById('campaign-btn');
        this.elements.skirmishBtn = document.getElementById('skirmish-btn');
        this.elements.loadGameBtn = document.getElementById('load-game-btn');
        this.elements.settingsBtn = document.getElementById('settings-btn');
        this.elements.creditsBtn = document.getElementById('credits-btn');
        
        // Game UI elements
        this.elements.creditsDisplay = document.getElementById('credits-display');
        this.elements.powerDisplay = document.getElementById('power-display');
        this.elements.selectedInfo = document.getElementById('selected-info');
        this.elements.selectedName = document.getElementById('selected-name');
        this.elements.selectedDetails = document.getElementById('selected-details');
        this.elements.actionGrid = document.getElementById('action-grid');
        this.elements.queueItems = document.getElementById('queue-items');
        this.elements.factionBanner = document.getElementById('faction-banner');
        this.elements.factionName = document.getElementById('faction-name');
        
        // Control elements
        this.elements.pauseBtn = document.getElementById('pause-btn');
        this.elements.speedBtn = document.getElementById('speed-btn');
        this.elements.menuBtn = document.getElementById('menu-btn');
        
        // Modal elements
        this.elements.modalOverlay = document.getElementById('modal-overlay');
        this.elements.settingsModal = document.getElementById('settings-modal');
        this.elements.creditsModal = document.getElementById('credits-modal');
        
        // Settings elements
        this.elements.graphicsQuality = document.getElementById('graphics-quality');
        this.elements.masterVolume = document.getElementById('master-volume');
        this.elements.volumeValue = document.getElementById('volume-value');
        this.elements.gameSpeed = document.getElementById('game-speed');
        
        // Unit group buttons
        this.elements.groupButtons = document.querySelectorAll('.group-btn');
        
        console.log('🖥️ DOM elements cached');
    }
    
    /**
     * Setup UI event listeners
     */
    setupEventListeners() {
        // Menu buttons
        if (this.elements.startGameBtn) {
            this.elements.startGameBtn.addEventListener('click', () => this.startQuickGame());
        }
        
        if (this.elements.campaignBtn) {
            this.elements.campaignBtn.addEventListener('click', () => this.showCampaignSelect());
        }
        
        if (this.elements.skirmishBtn) {
            this.elements.skirmishBtn.addEventListener('click', () => this.startSkirmish());
        }
        
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        }
        
        if (this.elements.creditsBtn) {
            this.elements.creditsBtn.addEventListener('click', () => this.showCredits());
        }
        
        // Game control buttons
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        if (this.elements.speedBtn) {
            this.elements.speedBtn.addEventListener('click', () => this.cycleGameSpeed());
        }
        
        if (this.elements.menuBtn) {
            this.elements.menuBtn.addEventListener('click', () => this.showGameMenu());
        }
        
        // Settings controls
        if (this.elements.masterVolume) {
            this.elements.masterVolume.addEventListener('input', (e) => {
                this.updateVolume(parseInt(e.target.value));
            });
        }
        
        if (this.elements.gameSpeed) {
            this.elements.gameSpeed.addEventListener('change', (e) => {
                this.updateGameSpeed(parseFloat(e.target.value));
            });
        }
        
        // Unit group buttons
        this.elements.groupButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => this.selectUnitGroup(index + 1));
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.assignUnitGroup(index + 1);
            });
        });
        
        console.log('🖥️ Event listeners configured');
    }
    
    /**
     * Setup modal system
     */
    setupModalSystem() {
        // Close modal when clicking overlay
        if (this.elements.modalOverlay) {
            this.elements.modalOverlay.addEventListener('click', (e) => {
                if (e.target === this.elements.modalOverlay) {
                    this.closeModal();
                }
            });
        }
        
        // Close buttons
        const closeButtons = document.querySelectorAll('.close-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.showingModal) {
                this.closeModal();
            }
        });
    }
    
    /**
     * Setup tooltip system
     */
    setupTooltips() {
        // Add tooltips to elements with data-tooltip attribute
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target.dataset.tooltip, e.target);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }
    
    /**
     * Show loading screen
     */
    showLoadingScreen() {
        this.currentScreen = 'loading';
        this.hideAllScreens();
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.remove('hidden');
        }
    }
    
    /**
     * Update loading progress
     */
    updateLoadingProgress(progress, text) {
        if (this.elements.loadingProgress) {
            this.elements.loadingProgress.style.width = `${progress}%`;
        }
        
        if (this.elements.loadingText && text) {
            this.elements.loadingText.textContent = text;
        }
    }
    
    /**
     * Show main menu
     */
    showMainMenu() {
        this.currentScreen = 'menu';
        this.hideAllScreens();
        if (this.elements.mainMenu) {
            this.elements.mainMenu.classList.remove('hidden');
        }
        
        // Play menu music
        if (window.gameEngine.audioManager) {
            window.gameEngine.audioManager.playMusic('menuMusic');
        }
    }
    
    /**
     * Show game interface
     */
    showGameInterface() {
        this.currentScreen = 'game';
        this.hideAllScreens();
        if (this.elements.gameInterface) {
            this.elements.gameInterface.classList.remove('hidden');
        }
        
        // Play game music
        if (window.gameEngine.audioManager) {
            window.gameEngine.audioManager.playMusic('gameMusic');
        }
        
        // Update faction display
        this.updateFactionDisplay();
    }
    
    /**
     * Hide all screens
     */
    hideAllScreens() {
        const screens = [
            this.elements.loadingScreen,
            this.elements.mainMenu,
            this.elements.gameInterface
        ];
        
        screens.forEach(screen => {
            if (screen) {
                screen.classList.add('hidden');
            }
        });
    }
    
    /**
     * Start quick game
     */
    startQuickGame() {
        this.playButtonSound();
        
        // Start skirmish with default settings
        window.gameEngine.startSkirmish({
            playerFaction: 'allies',
            enemyFactions: ['soviet'],
            difficulty: 'medium',
            mapSize: 'medium'
        });
        
        this.showGameInterface();
    }
    
    /**
     * Show campaign selection
     */
    showCampaignSelect() {
        this.playButtonSound();
        
        // For now, start allies campaign
        window.gameEngine.startCampaign('allies', 'medium');
        this.showGameInterface();
    }
    
    /**
     * Start skirmish
     */
    startSkirmish() {
        this.playButtonSound();
        
        window.gameEngine.startSkirmish({
            playerFaction: 'allies',
            enemyFactions: ['soviet'],
            difficulty: 'medium',
            mapSize: 'medium'
        });
        
        this.showGameInterface();
    }
    
    /**
     * Show settings modal
     */
    showSettings() {
        this.playButtonSound();
        this.showModal('settings');
    }
    
    /**
     * Show credits modal
     */
    showCredits() {
        this.playButtonSound();
        this.showModal('credits');
    }
    
    /**
     * Show modal
     */
    showModal(modalType) {
        this.showingModal = true;
        
        if (this.elements.modalOverlay) {
            this.elements.modalOverlay.classList.remove('hidden');
        }
        
        // Hide all modals first
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.classList.add('hidden'));
        
        // Show specific modal
        switch (modalType) {
            case 'settings':
                if (this.elements.settingsModal) {
                    this.elements.settingsModal.classList.remove('hidden');
                }
                break;
            case 'credits':
                if (this.elements.creditsModal) {
                    this.elements.creditsModal.classList.remove('hidden');
                }
                break;
        }
    }
    
    /**
     * Close modal
     */
    closeModal() {
        this.showingModal = false;
        
        if (this.elements.modalOverlay) {
            this.elements.modalOverlay.classList.add('hidden');
        }
        
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.classList.add('hidden'));
    }
    
    /**
     * Update credits display
     */
    updateCreditsDisplay(credits) {
        if (this.elements.creditsDisplay) {
            this.elements.creditsDisplay.textContent = Math.floor(credits).toLocaleString();
        }
    }
    
    /**
     * Update power display
     */
    updatePowerDisplay(power, maxPower) {
        if (this.elements.powerDisplay) {
            // Debug logging
            console.log('🔋 Power display update:', power, maxPower);
            
            // Ensure we have valid numbers
            const currentPower = isNaN(power) ? 0 : Math.floor(power);
            const totalPower = isNaN(maxPower) ? 0 : Math.floor(maxPower);
            this.elements.powerDisplay.textContent = `${currentPower}/${totalPower}`;
        }
    }
    
    /**
     * Update faction display
     */
    updateFactionDisplay() {
        if (this.elements.factionName && window.gameEngine.factionManager) {
            const factionName = window.gameEngine.factionManager.getFactionName(
                window.gameEngine.selectedFaction
            );
            this.elements.factionName.textContent = factionName;
        }
        
        if (this.elements.factionBanner && window.gameEngine.factionManager) {
            const theme = window.gameEngine.factionManager.getFactionTheme(
                window.gameEngine.selectedFaction
            );
            this.elements.factionBanner.style.background = 
                `linear-gradient(45deg, ${theme.primaryColor}, ${theme.secondaryColor})`;
        }
    }
    
    /**
     * Show unit/building info
     */
    showObjectInfo(object) {
        this.selectedObject = object;
        
        if (this.elements.selectedName) {
            this.elements.selectedName.textContent = object.name || object.type;
        }
        
        if (this.elements.selectedDetails) {
            const details = this.generateObjectDetails(object);
            this.elements.selectedDetails.innerHTML = details;
        }
        
        // Update action buttons
        this.updateActionButtons(object);
    }
    
    /**
     * Generate object details HTML
     */
    generateObjectDetails(object) {
        let html = '<div class="object-stats">';
        
        // Health
        if (object.health !== undefined) {
            const healthPercent = (object.health / object.maxHealth) * 100;
            html += `
                <div class="stat-row">
                    <span>Health:</span>
                    <div class="stat-bar">
                        <div class="stat-fill health" style="width: ${healthPercent}%"></div>
                        <span class="stat-text">${Math.floor(object.health)}/${object.maxHealth}</span>
                    </div>
                </div>
            `;
        }
        
        // Damage
        if (object.damage > 0) {
            html += `
                <div class="stat-row">
                    <span>Damage:</span>
                    <span class="stat-value">${object.damage}</span>
                </div>
            `;
        }
        
        // Range
        if (object.range > 0) {
            html += `
                <div class="stat-row">
                    <span>Range:</span>
                    <span class="stat-value">${object.range}</span>
                </div>
            `;
        }
        
        // Unit-specific info
        if (object.type === 'unit') {
            if (object.speed) {
                html += `
                    <div class="stat-row">
                        <span>Speed:</span>
                        <span class="stat-value">${object.speed}</span>
                    </div>
                `;
            }
            
            if (object.veterancy > 0) {
                const stars = '⭐'.repeat(object.veterancy);
                html += `
                    <div class="stat-row">
                        <span>Veterancy:</span>
                        <span class="stat-value">${stars}</span>
                    </div>
                `;
            }
        }
        
        // Building-specific info
        if (object.type === 'building') {
            if (object.powerGeneration > 0) {
                html += `
                    <div class="stat-row">
                        <span>Power Gen:</span>
                        <span class="stat-value">+${object.powerGeneration}</span>
                    </div>
                `;
            }
            
            if (object.power > 0) {
                html += `
                    <div class="stat-row">
                        <span>Power Use:</span>
                        <span class="stat-value">-${object.power}</span>
                    </div>
                `;
            }
            
            if (object.isConstructing) {
                const percent = (object.constructionProgress / object.constructionTime) * 100;
                html += `
                    <div class="stat-row">
                        <span>Construction:</span>
                        <div class="stat-bar">
                            <div class="stat-fill construction" style="width: ${percent}%"></div>
                            <span class="stat-text">${Math.floor(percent)}%</span>
                        </div>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        
        return html;
    }
    
    /**
     * Update action buttons
     */
    updateActionButtons(object) {
        if (!this.elements.actionGrid) return;
        
        this.elements.actionGrid.innerHTML = '';
        
        if (object.type === 'building' && object.canProduce) {
            // Show unit production buttons
            object.canProduce.forEach(unitType => {
                const button = this.createActionButton(unitType, 'produce', unitType);
                this.elements.actionGrid.appendChild(button);
            });
        }
        
        // Add more action buttons based on object type
        if (object.canRepair) {
            const button = this.createActionButton('Repair', 'repair', 'repair');
            this.elements.actionGrid.appendChild(button);
        }
        
        if (object.canConstruct) {
            const button = this.createActionButton('Build', 'build', 'construct');
            this.elements.actionGrid.appendChild(button);
        }
    }
    
    /**
     * Create action button
     */
    createActionButton(text, action, data) {
        const button = document.createElement('button');
        button.className = 'action-button';
        button.textContent = text;
        button.dataset.action = action;
        button.dataset.data = data;
        
        button.addEventListener('click', () => {
            this.handleActionButton(action, data);
        });
        
        return button;
    }
    
    /**
     * Handle action button click
     */
    handleActionButton(action, data) {
        this.playButtonSound();
        
        switch (action) {
            case 'produce':
                this.produceUnit(data);
                break;
            case 'repair':
                // Implement repair logic
                break;
            case 'build':
                // Implement build logic
                break;
        }
    }
    
    /**
     * Produce unit
     */
    produceUnit(unitType) {
        if (this.selectedObject && window.gameEngine.buildingManager) {
            window.gameEngine.buildingManager.queueUnit(unitType, this.selectedObject);
        }
    }
    
    /**
     * Toggle pause
     */
    togglePause() {
        this.playButtonSound();
        
        if (window.gameEngine.isPaused) {
            window.gameEngine.resumeGame();
            this.elements.pauseBtn.textContent = '⏸️';
        } else {
            window.gameEngine.pauseGame();
            this.elements.pauseBtn.textContent = '▶️';
        }
    }
    
    /**
     * Cycle game speed
     */
    cycleGameSpeed() {
        this.playButtonSound();
        
        const speeds = [1.0, 1.5, 2.0, 0.5];
        const currentSpeed = window.gameEngine.gameSpeed;
        const currentIndex = speeds.indexOf(currentSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        
        window.gameEngine.setGameSpeed(speeds[nextIndex]);
        
        // Update button text
        this.elements.speedBtn.textContent = `${speeds[nextIndex]}x`;
    }
    
    /**
     * Show game menu
     */
    showGameMenu() {
        this.playButtonSound();
        
        const confirmed = confirm('Return to main menu? (Progress will be lost)');
        if (confirmed) {
            window.gameEngine.returnToMainMenu();
            this.showMainMenu();
        }
    }
    
    /**
     * Update volume
     */
    updateVolume(volume) {
        if (window.gameEngine.audioManager) {
            window.gameEngine.audioManager.setMasterVolume(volume / 100);
        }
        
        if (this.elements.volumeValue) {
            this.elements.volumeValue.textContent = `${volume}%`;
        }
    }
    
    /**
     * Update game speed setting
     */
    updateGameSpeed(speed) {
        if (window.gameEngine) {
            window.gameEngine.setGameSpeed(speed);
        }
    }
    
    /**
     * Select unit group
     */
    selectUnitGroup(groupNumber) {
        if (window.gameEngine.inputManager) {
            // This would integrate with the unit group system
            console.log(`Selecting unit group ${groupNumber}`);
        }
    }
    
    /**
     * Assign unit group
     */
    assignUnitGroup(groupNumber) {
        if (window.gameEngine.inputManager) {
            // This would integrate with the unit group system
            console.log(`Assigning unit group ${groupNumber}`);
        }
    }
    
    /**
     * Show tooltip
     */
    showTooltip(text, element) {
        const tooltip = document.getElementById('tooltip');
        const content = document.getElementById('tooltip-content');
        
        if (!tooltip || !content) return;
        
        content.textContent = text;
        tooltip.classList.remove('hidden');
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
    }
    
    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.classList.add('hidden');
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
        
        this.notifications.push(notification);
    }
    
    /**
     * Play button sound
     */
    playButtonSound() {
        if (window.gameEngine.audioManager) {
            window.gameEngine.audioManager.playSound('buttonClick');
        }
    }
    
    /**
     * Update UI
     */
    update(deltaTime) {
        // Update any animated UI elements
        this.updateAnimations(deltaTime);
        
        // Update build queue display
        this.updateBuildQueue();
    }
    
    /**
     * Update animations
     */
    updateAnimations(deltaTime) {
        // Animate loading bars, progress indicators, etc.
    }
    
    /**
     * Update build queue display
     */
    updateBuildQueue() {
        if (!this.elements.queueItems || !this.selectedObject) return;
        
        this.elements.queueItems.innerHTML = '';
        
        if (this.selectedObject.type === 'building' && this.selectedObject.getProductionQueueInfo) {
            const queue = this.selectedObject.getProductionQueueInfo();
            
            queue.forEach(item => {
                const queueItem = document.createElement('div');
                queueItem.className = 'queue-item';
                queueItem.innerHTML = `
                    <div class="queue-item-name">${item.type}</div>
                    <div class="queue-progress">
                        <div class="queue-progress-bar" style="width: ${item.percentage * 100}%"></div>
                    </div>
                `;
                
                this.elements.queueItems.appendChild(queueItem);
            });
        }
    }
    
    /**
     * Event system methods
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.eventListeners[event]) return;
        const index = this.eventListeners[event].indexOf(callback);
        if (index > -1) {
            this.eventListeners[event].splice(index, 1);
        }
    }
    
    emit(event, data = null) {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in UIManager event listener for ${event}:`, error);
            }
        });
    }
}