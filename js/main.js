/**
 * Main Application File for Scotty Mason's Revenge
 * Initializes and starts the game
 */

// Application state
let gameInitialized = false;
let loadingSteps = [];
let currentStep = 0;

/**
 * Initialize the game application
 */
async function initializeGame() {
    console.log('🚀 Starting Scotty Mason\'s Revenge...');
    
    // Define loading steps
    loadingSteps = [
        { name: 'Initializing Game Engine...', action: initializeGameEngine },
        { name: 'Loading Audio System...', action: initializeAudio },
        { name: 'Setting up Renderer...', action: initializeRenderer },
        { name: 'Configuring Input...', action: initializeInput },
        { name: 'Loading Game Systems...', action: initializeGameSystems },
        { name: 'Setting up UI...', action: initializeUI },
        { name: 'Loading Assets...', action: loadAssets },
        { name: 'Finalizing...', action: finalizeInitialization }
    ];
    
    // Start loading process
    for (let i = 0; i < loadingSteps.length; i++) {
        currentStep = i;
        const step = loadingSteps[i];
        
        updateLoadingProgress((i / loadingSteps.length) * 100, step.name);
        
        try {
            await step.action();
            await sleep(200); // Small delay for visual feedback
        } catch (error) {
            console.error(`Failed at step: ${step.name}`, error);
            showErrorMessage(`Initialization failed: ${error.message}`);
            return;
        }
    }
    
    // Complete initialization
    updateLoadingProgress(100, 'Ready to play!');
    await sleep(500);
    
    gameInitialized = true;
    showMainMenu();
    
    console.log('✅ Game initialization complete!');
}

/**
 * Initialize game engine
 */
async function initializeGameEngine() {
    if (!window.gameEngine) {
        throw new Error('GameEngine not found');
    }
    
    await window.gameEngine.initialize();
    
    // Setup global event listeners
    setupGlobalEventListeners();
}

/**
 * Initialize audio system
 */
async function initializeAudio() {
    // Audio is initialized as part of game engine
    // But we need user interaction first
    await setupAudioContext();
}

/**
 * Initialize renderer
 */
async function initializeRenderer() {
    // Renderer is initialized as part of game engine
    // Additional setup if needed
}

/**
 * Initialize input system
 */
async function initializeInput() {
    // Input manager is initialized as part of game engine
    // Additional setup if needed
}

/**
 * Initialize game systems
 */
async function initializeGameSystems() {
    // All systems are initialized as part of game engine
    // Additional configuration if needed
    
    // Create some test assets for demonstration
    if (window.gameEngine.unitManager) {
        // Load unit definitions (already done in managers)
    }
    
    if (window.gameEngine.buildingManager) {
        // Load building definitions (already done in managers)
    }
}

/**
 * Initialize UI system
 */
async function initializeUI() {
    // UI Manager is initialized as part of game engine
    // Additional UI setup if needed
}

/**
 * Load game assets
 */
async function loadAssets() {
    // Assets are generated procedurally
    // This step simulates loading external assets
    await sleep(300);
}

/**
 * Finalize initialization
 */
async function finalizeInitialization() {
    // Final setup steps
    
    // Register service worker for offline capability
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/sw.js');
            console.log('📱 Service worker registered');
        } catch (error) {
            console.warn('Service worker registration failed:', error);
        }
    }
    
    // Setup global error handlers
    setupErrorHandlers();
    
    // Setup performance monitoring
    setupPerformanceMonitoring();
}

/**
 * Setup audio context (requires user interaction)
 */
async function setupAudioContext() {
    // Add click listener to start audio
    const startAudio = async () => {
        if (window.gameEngine && window.gameEngine.audioManager) {
            await window.gameEngine.audioManager.resumeContext();
        }
        document.removeEventListener('click', startAudio);
        document.removeEventListener('touchstart', startAudio);
    };
    
    document.addEventListener('click', startAudio);
    document.addEventListener('touchstart', startAudio);
}

/**
 * Setup global event listeners
 */
function setupGlobalEventListeners() {
    // Game state events
    window.gameEngine.on('gameInitialized', () => {
        console.log('🎮 Game systems ready');
    });
    
    window.gameEngine.on('campaignStarted', (data) => {
        console.log('📖 Campaign started:', data.faction);
        showNotification(`Campaign started: ${data.faction}`, 'success');
    });
    
    window.gameEngine.on('skirmishStarted', (data) => {
        console.log('⚔️ Skirmish started');
        showNotification('Skirmish battle begins!', 'success');
    });
    
    window.gameEngine.on('gameEnded', (data) => {
        const message = data.victory ? 'Victory!' : 'Defeat!';
        const type = data.victory ? 'success' : 'error';
        showNotification(message, type, 5000);
        
        // Return to menu after delay
        setTimeout(() => {
            if (window.gameEngine.uiManager) {
                window.gameEngine.uiManager.showMainMenu();
            }
        }, 5000);
    });
    
    window.gameEngine.on('gameSaved', (fileName) => {
        showNotification(`Game saved: ${fileName}`, 'success');
    });
    
    window.gameEngine.on('gameLoaded', (fileName) => {
        showNotification(`Game loaded: ${fileName}`, 'success');
    });
    
    // Resource events
    if (window.gameEngine.resourceManager) {
        window.gameEngine.resourceManager.on('powerShortage', (shortage) => {
            showNotification('Power shortage! Build more power plants.', 'warning', 4000);
        });
    }
    
    // Unit events
    if (window.gameEngine.unitManager) {
        window.gameEngine.unitManager.on('unitCreated', (unit) => {
            if (unit.faction === window.gameEngine.selectedFaction) {
                console.log(`👥 Unit created: ${unit.type}`);
            }
        });
    }
    
    // Building events
    if (window.gameEngine.buildingManager) {
        window.gameEngine.buildingManager.on('buildingCompleted', (building) => {
            if (building.faction === window.gameEngine.selectedFaction) {
                showNotification(`${building.name} construction complete`, 'success');
                
                // Play completion sound
                if (window.gameEngine.audioManager) {
                    window.gameEngine.audioManager.playSound('constructionComplete');
                }
            }
        });
        
        window.gameEngine.buildingManager.on('buildingDestroyed', (building) => {
            if (building.faction === window.gameEngine.selectedFaction) {
                showNotification(`${building.name} destroyed!`, 'error');
            }
        });
    }
    
    // Input events
    if (window.gameEngine.inputManager) {
        window.gameEngine.inputManager.on('objectSelected', (object) => {
            if (window.gameEngine.uiManager) {
                window.gameEngine.uiManager.showObjectInfo(object);
            }
        });
        
        window.gameEngine.inputManager.on('selectionCleared', () => {
            if (window.gameEngine.uiManager) {
                window.gameEngine.uiManager.showObjectInfo({ name: 'No selection', type: 'none' });
            }
        });
    }
}

/**
 * Setup error handlers
 */
function setupErrorHandlers() {
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        showErrorMessage(`An error occurred: ${event.error.message}`);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        showErrorMessage(`Promise error: ${event.reason}`);
    });
}

/**
 * Setup performance monitoring
 */
function setupPerformanceMonitoring() {
    // Monitor FPS
    let frameCount = 0;
    let lastTime = performance.now();
    
    function updateFPS() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
            const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
            
            // Warn if FPS is too low
            if (fps < 30 && gameInitialized) {
                console.warn(`Low FPS detected: ${fps}`);
            }
            
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(updateFPS);
    }
    
    updateFPS();
    
    // Monitor memory usage
    if (performance.memory) {
        setInterval(() => {
            const memory = performance.memory;
            const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
            const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
            
            if (usedMB / limitMB > 0.8) {
                console.warn(`High memory usage: ${usedMB}MB / ${limitMB}MB`);
            }
        }, 10000);
    }
}

/**
 * Update loading progress
 */
function updateLoadingProgress(progress, text) {
    const progressBar = document.getElementById('loading-progress');
    const loadingText = document.getElementById('loading-text');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    if (loadingText && text) {
        loadingText.textContent = text;
    }
}

/**
 * Show main menu
 */
function showMainMenu() {
    if (window.gameEngine && window.gameEngine.uiManager) {
        window.gameEngine.uiManager.showMainMenu();
    }
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    console.error(message);
    
    // Create error overlay
    const errorOverlay = document.createElement('div');
    errorOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: monospace;
        text-align: center;
        padding: 2rem;
    `;
    
    errorOverlay.innerHTML = `
        <div>
            <h2 style="color: #ff4444; margin-bottom: 1rem;">❌ Game Error</h2>
            <p style="margin-bottom: 1rem;">${message}</p>
            <button onclick="location.reload()" style="
                background: #ff4444;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 3px;
                cursor: pointer;
                font-size: 1rem;
            ">Reload Game</button>
        </div>
    `;
    
    document.body.appendChild(errorOverlay);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info', duration = 3000) {
    if (window.gameEngine && window.gameEngine.uiManager) {
        window.gameEngine.uiManager.showNotification(message, type, duration);
    } else {
        console.log(`Notification (${type}): ${message}`);
    }
}

/**
 * Utility sleep function
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check browser compatibility
 */
function checkBrowserCompatibility() {
    const required = {
        'Canvas 2D': () => {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        },
        'Local Storage': () => {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        },
        'Audio Context': () => {
            return !!(window.AudioContext || window.webkitAudioContext);
        },
        'Request Animation Frame': () => {
            return !!(window.requestAnimationFrame);
        }
    };
    
    const missing = [];
    
    for (const [feature, check] of Object.entries(required)) {
        if (!check()) {
            missing.push(feature);
        }
    }
    
    if (missing.length > 0) {
        showErrorMessage(`Your browser is missing required features: ${missing.join(', ')}`);
        return false;
    }
    
    return true;
}

/**
 * Add utility functions to global scope
 */
window.gameUtils = {
    showNotification,
    showErrorMessage,
    sleep
};

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌐 DOM loaded, starting game initialization...');
    
    // Check browser compatibility
    if (!checkBrowserCompatibility()) {
        return;
    }
    
    // Add loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
    
    try {
        await initializeGame();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showErrorMessage(`Failed to start game: ${error.message}`);
    }
});

// Prevent context menu on right click (for game controls)
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('#game-canvas')) {
        e.preventDefault();
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.gameEngine && gameInitialized) {
        if (document.hidden) {
            // Page hidden - pause game
            if (!window.gameEngine.isPaused) {
                window.gameEngine.pauseGame();
            }
        } else {
            // Page visible - resume if needed
            // Don't auto-resume, let player decide
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.gameEngine && window.gameEngine.renderer) {
        window.gameEngine.renderer.resize();
    }
});

// Export for debugging
if (typeof window !== 'undefined') {
    window.debugGame = {
        engine: () => window.gameEngine,
        createTestUnits: () => {
            if (window.gameEngine.unitManager) {
                window.gameEngine.unitManager.createTestUnits();
            }
        },
        addResources: () => {
            if (window.gameEngine.resourceManager) {
                window.gameEngine.resourceManager.addDebugResources();
            }
        },
        getStats: () => {
            return {
                game: window.gameEngine.getGameStats(),
                resources: window.gameEngine.resourceManager.getResourceInfo(),
                units: window.gameEngine.unitManager.getStatistics(),
                buildings: window.gameEngine.buildingManager.getStatistics(),
                renderer: window.gameEngine.renderer.getRenderStats()
            };
        }
    };
}

console.log('📜 Main application script loaded');