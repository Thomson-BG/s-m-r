/**
 * Input Manager for Scotty Mason's Revenge
 * Handles mouse, keyboard, and touch input
 */

class InputManager {
    constructor() {
        this.isInitialized = false;
        
        // Input state
        this.keys = new Set();
        this.mouse = {
            x: 0,
            y: 0,
            worldX: 0,
            worldY: 0,
            buttons: 0,
            isDown: false,
            dragStart: null,
            isDragging: false
        };
        
        // Touch state
        this.touches = new Map();
        this.isTouch = false;
        
        // Selection state
        this.selectedObjects = [];
        this.selectionBox = null;
        this.isSelecting = false;
        
        // Camera control
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        
        // Event system
        this.eventListeners = {};
        
        // Key bindings
        this.keyBindings = {
            'KeyW': 'moveUp',
            'KeyA': 'moveLeft', 
            'KeyS': 'moveDown',
            'KeyD': 'moveRight',
            'Space': 'pauseGame',
            'Escape': 'showMenu',
            'Delete': 'deleteSelected',
            'KeyH': 'selectAllUnits',
            'KeyG': 'groupUnits',
            'Digit1': 'selectGroup1',
            'Digit2': 'selectGroup2',
            'Digit3': 'selectGroup3',
            'Digit4': 'selectGroup4',
            'Digit5': 'selectGroup5',
            'Plus': 'zoomIn',
            'Minus': 'zoomOut',
            'Enter': 'confirmAction',
            'KeyQ': 'buildUnit',
            'KeyE': 'buildBuilding'
        };
        
        console.log('🎮 InputManager initialized');
    }
    
    async initialize() {
        // Get canvas element
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            throw new Error('Game canvas not found');
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Detect touch support
        this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        this.isInitialized = true;
        console.log('✅ InputManager ready');
    }
    
    /**
     * Setup all input event listeners
     */
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Touch events
        if (this.isTouch) {
            this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
            this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        }
        
        // Focus events
        window.addEventListener('blur', () => this.handleBlur());
        window.addEventListener('focus', () => this.handleFocus());
        
        console.log('🎮 Input event listeners configured');
    }
    
    /**
     * Handle keyboard key down
     */
    handleKeyDown(event) {
        const key = event.code;
        
        // Prevent default for game keys
        if (this.keyBindings[key]) {
            event.preventDefault();
        }
        
        // Add to pressed keys
        this.keys.add(key);
        
        // Handle key binding
        const action = this.keyBindings[key];
        if (action) {
            this.handleAction(action, event);
        }
        
        this.emit('keyDown', { key, action, event });
    }
    
    /**
     * Handle keyboard key up
     */
    handleKeyUp(event) {
        const key = event.code;
        this.keys.delete(key);
        
        const action = this.keyBindings[key];
        this.emit('keyUp', { key, action, event });
    }
    
    /**
     * Handle mouse down
     */
    handleMouseDown(event) {
        this.updateMousePosition(event);
        
        this.mouse.isDown = true;
        this.mouse.buttons = event.buttons;
        this.mouse.dragStart = { x: this.mouse.x, y: this.mouse.y };
        
        if (event.button === 0) { // Left click
            this.handleLeftClick(event);
        } else if (event.button === 2) { // Right click
            this.handleRightClick(event);
        } else if (event.button === 1) { // Middle click
            this.handleMiddleClick(event);
        }
        
        this.emit('mouseDown', { 
            button: event.button, 
            x: this.mouse.x, 
            y: this.mouse.y,
            worldX: this.mouse.worldX,
            worldY: this.mouse.worldY
        });
    }
    
    /**
     * Handle mouse move
     */
    handleMouseMove(event) {
        this.updateMousePosition(event);
        
        // Handle dragging
        if (this.mouse.isDown && this.mouse.dragStart) {
            const dragDistance = Math.sqrt(
                Math.pow(this.mouse.x - this.mouse.dragStart.x, 2) +
                Math.pow(this.mouse.y - this.mouse.dragStart.y, 2)
            );
            
            if (!this.mouse.isDragging && dragDistance > 5) {
                this.mouse.isDragging = true;
                this.startDrag();
            }
            
            if (this.mouse.isDragging) {
                this.updateDrag();
            }
        }
        
        // Handle camera panning with middle mouse
        if (this.isPanning) {
            const deltaX = this.mouse.x - this.panStart.x;
            const deltaY = this.mouse.y - this.panStart.y;
            
            window.gameEngine.renderer.panCamera(-deltaX, -deltaY);
            this.panStart = { x: this.mouse.x, y: this.mouse.y };
        }
        
        this.emit('mouseMove', {
            x: this.mouse.x,
            y: this.mouse.y,
            worldX: this.mouse.worldX,
            worldY: this.mouse.worldY
        });
    }
    
    /**
     * Handle mouse up
     */
    handleMouseUp(event) {
        this.updateMousePosition(event);
        
        if (this.mouse.isDragging) {
            this.endDrag();
        } else if (event.button === 0) {
            // Left click - selection
            this.handleSingleClick();
        } else if (event.button === 2) {
            // Right click - commands
            this.handleRightClick(event);
        }
        
        this.mouse.isDown = false;
        this.mouse.isDragging = false;
        this.mouse.dragStart = null;
        this.isPanning = false;
        
        this.emit('mouseUp', {
            button: event.button,
            x: this.mouse.x,
            y: this.mouse.y,
            worldX: this.mouse.worldX,
            worldY: this.mouse.worldY
        });
    }
    
    /**
     * Handle mouse wheel (zoom)
     */
    handleWheel(event) {
        event.preventDefault();
        
        const zoomDelta = event.deltaY > 0 ? -0.1 : 0.1;
        window.gameEngine.renderer.zoomCamera(zoomDelta, this.mouse.x, this.mouse.y);
        
        this.emit('wheel', { delta: zoomDelta, x: this.mouse.x, y: this.mouse.y });
    }
    
    /**
     * Handle left click
     */
    handleLeftClick(event) {
        if (event.ctrlKey || event.metaKey) {
            // Multi-selection mode
            this.toggleSelection();
        } else {
            // Start selection box if not clicking on object
            const objectAtMouse = this.getObjectAtPosition(this.mouse.worldX, this.mouse.worldY);
            if (!objectAtMouse) {
                this.startSelectionBox();
            }
        }
    }
    
    /**
     * Handle right click
     */
    handleRightClick(event) {
        if (this.selectedObjects.length > 0) {
            // Command selected units
            this.issueCommand(this.mouse.worldX, this.mouse.worldY);
        } else {
            // Show context menu
            this.showContextMenu(this.mouse.x, this.mouse.y);
        }
    }
    
    /**
     * Handle middle click
     */
    handleMiddleClick(event) {
        this.isPanning = true;
        this.panStart = { x: this.mouse.x, y: this.mouse.y };
    }
    
    /**
     * Update mouse position and world coordinates
     */
    updateMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = event.clientX - rect.left;
        this.mouse.y = event.clientY - rect.top;
        
        // Convert to world coordinates
        const worldPos = window.gameEngine.renderer.screenToWorld(this.mouse.x, this.mouse.y);
        this.mouse.worldX = worldPos.x;
        this.mouse.worldY = worldPos.y;
    }
    
    /**
     * Handle touch start
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            this.touches.set(touch.identifier, {
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY,
                startTime: Date.now()
            });
        }
        
        if (event.touches.length === 1) {
            // Single touch - treat as mouse down
            const touch = event.touches[0];
            this.updateMousePositionFromTouch(touch);
            this.handleLeftClick({ ctrlKey: false, metaKey: false });
        }
    }
    
    /**
     * Handle touch move
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            // Single touch - camera pan
            const touch = event.touches[0];
            const oldTouch = this.touches.get(touch.identifier);
            
            if (oldTouch) {
                const deltaX = touch.clientX - oldTouch.x;
                const deltaY = touch.clientY - oldTouch.y;
                
                window.gameEngine.renderer.panCamera(-deltaX, -deltaY);
                
                // Update touch position
                oldTouch.x = touch.clientX;
                oldTouch.y = touch.clientY;
            }
        } else if (event.touches.length === 2) {
            // Two touches - pinch zoom
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
            
            if (!this.lastPinchDistance) {
                this.lastPinchDistance = distance;
            } else {
                const deltaDistance = distance - this.lastPinchDistance;
                const zoomDelta = deltaDistance > 0 ? 0.05 : -0.05;
                
                const centerX = (touch1.clientX + touch2.clientX) / 2;
                const centerY = (touch1.clientY + touch2.clientY) / 2;
                
                window.gameEngine.renderer.zoomCamera(zoomDelta, centerX, centerY);
                this.lastPinchDistance = distance;
            }
        }
    }
    
    /**
     * Handle touch end
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        for (const touch of event.changedTouches) {
            const touchData = this.touches.get(touch.identifier);
            
            if (touchData) {
                const duration = Date.now() - touchData.startTime;
                const distance = Math.sqrt(
                    Math.pow(touch.clientX - touchData.startX, 2) +
                    Math.pow(touch.clientY - touchData.startY, 2)
                );
                
                // Detect tap vs drag
                if (duration < 300 && distance < 10) {
                    this.updateMousePositionFromTouch(touch);
                    this.handleSingleClick();
                }
                
                this.touches.delete(touch.identifier);
            }
        }
        
        if (event.touches.length === 0) {
            this.lastPinchDistance = null;
        }
    }
    
    /**
     * Update mouse position from touch
     */
    updateMousePositionFromTouch(touch) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = touch.clientX - rect.left;
        this.mouse.y = touch.clientY - rect.top;
        
        const worldPos = window.gameEngine.renderer.screenToWorld(this.mouse.x, this.mouse.y);
        this.mouse.worldX = worldPos.x;
        this.mouse.worldY = worldPos.y;
    }
    
    /**
     * Handle window blur (lose focus)
     */
    handleBlur() {
        // Clear all pressed keys
        this.keys.clear();
        this.mouse.isDown = false;
        this.mouse.isDragging = false;
        this.isPanning = false;
    }
    
    /**
     * Handle window focus
     */
    handleFocus() {
        // Resume audio context if needed
        if (window.gameEngine.audioManager) {
            window.gameEngine.audioManager.resumeContext();
        }
    }
    
    /**
     * Start selection box
     */
    startSelectionBox() {
        this.isSelecting = true;
        this.selectionBox = {
            startX: this.mouse.x,
            startY: this.mouse.y,
            currentX: this.mouse.x,
            currentY: this.mouse.y
        };
        
        this.showSelectionBox();
    }
    
    /**
     * Update selection box
     */
    updateSelectionBox() {
        if (!this.isSelecting || !this.selectionBox) return;
        
        this.selectionBox.currentX = this.mouse.x;
        this.selectionBox.currentY = this.mouse.y;
        
        this.showSelectionBox();
    }
    
    /**
     * End selection box
     */
    endSelectionBox() {
        if (!this.isSelecting || !this.selectionBox) return;
        
        // Calculate selection area in world coordinates
        const startWorld = window.gameEngine.renderer.screenToWorld(
            this.selectionBox.startX, this.selectionBox.startY
        );
        const endWorld = window.gameEngine.renderer.screenToWorld(
            this.selectionBox.currentX, this.selectionBox.currentY
        );
        
        const minX = Math.min(startWorld.x, endWorld.x);
        const maxX = Math.max(startWorld.x, endWorld.x);
        const minY = Math.min(startWorld.y, endWorld.y);
        const maxY = Math.max(startWorld.y, endWorld.y);
        
        // Select objects in area
        this.selectObjectsInArea(minX, minY, maxX, maxY);
        
        this.isSelecting = false;
        this.selectionBox = null;
        this.hideSelectionBox();
    }
    
    /**
     * Show selection box UI
     */
    showSelectionBox() {
        const selectionBoxElement = document.getElementById('selection-box');
        if (!selectionBoxElement || !this.selectionBox) return;
        
        const minX = Math.min(this.selectionBox.startX, this.selectionBox.currentX);
        const minY = Math.min(this.selectionBox.startY, this.selectionBox.currentY);
        const width = Math.abs(this.selectionBox.currentX - this.selectionBox.startX);
        const height = Math.abs(this.selectionBox.currentY - this.selectionBox.startY);
        
        const canvasRect = this.canvas.getBoundingClientRect();
        
        selectionBoxElement.style.left = (canvasRect.left + minX) + 'px';
        selectionBoxElement.style.top = (canvasRect.top + minY) + 'px';
        selectionBoxElement.style.width = width + 'px';
        selectionBoxElement.style.height = height + 'px';
        selectionBoxElement.classList.remove('hidden');
    }
    
    /**
     * Hide selection box UI
     */
    hideSelectionBox() {
        const selectionBoxElement = document.getElementById('selection-box');
        if (selectionBoxElement) {
            selectionBoxElement.classList.add('hidden');
        }
    }
    
    /**
     * Start drag operation
     */
    startDrag() {
        if (this.selectedObjects.length === 0) {
            this.startSelectionBox();
        }
    }
    
    /**
     * Update drag operation
     */
    updateDrag() {
        if (this.isSelecting) {
            this.updateSelectionBox();
        }
    }
    
    /**
     * End drag operation
     */
    endDrag() {
        if (this.isSelecting) {
            this.endSelectionBox();
        }
    }
    
    /**
     * Handle single click selection
     */
    handleSingleClick() {
        const objectAtMouse = this.getObjectAtPosition(this.mouse.worldX, this.mouse.worldY);
        
        if (objectAtMouse) {
            this.selectObject(objectAtMouse);
        } else {
            this.clearSelection();
        }
    }
    
    /**
     * Get object at world position
     */
    getObjectAtPosition(worldX, worldY) {
        // Check units first
        if (window.gameEngine.unitManager) {
            const units = window.gameEngine.unitManager.getAllUnits();
            for (const unit of units) {
                if (this.isPointInObject(worldX, worldY, unit)) {
                    return unit;
                }
            }
        }
        
        // Check buildings
        if (window.gameEngine.buildingManager) {
            const buildings = window.gameEngine.buildingManager.getAllBuildings();
            for (const building of buildings) {
                if (this.isPointInObject(worldX, worldY, building)) {
                    return building;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Check if point is inside object
     */
    isPointInObject(x, y, object) {
        return x >= object.x && 
               x <= object.x + object.width &&
               y >= object.y && 
               y <= object.y + object.height;
    }
    
    /**
     * Select objects in area
     */
    selectObjectsInArea(minX, minY, maxX, maxY) {
        const objectsInArea = [];
        
        // Check units
        if (window.gameEngine.unitManager) {
            const units = window.gameEngine.unitManager.getAllUnits();
            for (const unit of units) {
                if (this.isObjectInArea(unit, minX, minY, maxX, maxY)) {
                    objectsInArea.push(unit);
                }
            }
        }
        
        // If no units selected, check buildings
        if (objectsInArea.length === 0 && window.gameEngine.buildingManager) {
            const buildings = window.gameEngine.buildingManager.getAllBuildings();
            for (const building of buildings) {
                if (this.isObjectInArea(building, minX, minY, maxX, maxY)) {
                    objectsInArea.push(building);
                }
            }
        }
        
        this.selectObjects(objectsInArea);
    }
    
    /**
     * Check if object is in area
     */
    isObjectInArea(object, minX, minY, maxX, maxY) {
        return !(object.x + object.width < minX ||
                object.x > maxX ||
                object.y + object.height < minY ||
                object.y > maxY);
    }
    
    /**
     * Select single object
     */
    selectObject(object) {
        this.clearSelection();
        this.selectedObjects = [object];
        object.selected = true;
        
        // Play selection sound
        if (window.gameEngine.audioManager) {
            window.gameEngine.audioManager.playSound('unitSelect');
        }
        
        this.emit('objectSelected', object);
    }
    
    /**
     * Select multiple objects
     */
    selectObjects(objects) {
        this.clearSelection();
        this.selectedObjects = objects.slice();
        
        for (const object of objects) {
            object.selected = true;
        }
        
        // Play selection sound
        if (objects.length > 0 && window.gameEngine.audioManager) {
            window.gameEngine.audioManager.playSound('unitSelect');
        }
        
        this.emit('objectsSelected', objects);
    }
    
    /**
     * Clear selection
     */
    clearSelection() {
        for (const object of this.selectedObjects) {
            object.selected = false;
        }
        this.selectedObjects = [];
        
        this.emit('selectionCleared');
    }
    
    /**
     * Toggle object selection
     */
    toggleSelection() {
        const objectAtMouse = this.getObjectAtPosition(this.mouse.worldX, this.mouse.worldY);
        
        if (objectAtMouse) {
            if (objectAtMouse.selected) {
                const index = this.selectedObjects.indexOf(objectAtMouse);
                if (index > -1) {
                    this.selectedObjects.splice(index, 1);
                    objectAtMouse.selected = false;
                }
            } else {
                this.selectedObjects.push(objectAtMouse);
                objectAtMouse.selected = true;
            }
            
            this.emit('selectionChanged', this.selectedObjects);
        }
    }
    
    /**
     * Issue command to selected objects
     */
    issueCommand(worldX, worldY) {
        if (this.selectedObjects.length === 0) return;
        
        const targetObject = this.getObjectAtPosition(worldX, worldY);
        
        for (const selectedObject of this.selectedObjects) {
            if (selectedObject.type === 'unit') {
                if (targetObject && targetObject !== selectedObject) {
                    // Attack or interact with target
                    selectedObject.setTarget(targetObject);
                } else {
                    // Move to position
                    selectedObject.moveTo(worldX, worldY);
                }
            }
        }
        
        this.emit('commandIssued', { x: worldX, y: worldY, target: targetObject });
    }
    
    /**
     * Show context menu
     */
    showContextMenu(screenX, screenY) {
        // Implementation depends on UI system
        this.emit('contextMenuRequested', { x: screenX, y: screenY });
    }
    
    /**
     * Handle action from key binding
     */
    handleAction(action, event) {
        switch (action) {
            case 'moveUp':
                window.gameEngine.renderer.panCamera(0, -50);
                break;
            case 'moveDown':
                window.gameEngine.renderer.panCamera(0, 50);
                break;
            case 'moveLeft':
                window.gameEngine.renderer.panCamera(-50, 0);
                break;
            case 'moveRight':
                window.gameEngine.renderer.panCamera(50, 0);
                break;
            case 'zoomIn':
                window.gameEngine.renderer.zoomCamera(0.1);
                break;
            case 'zoomOut':
                window.gameEngine.renderer.zoomCamera(-0.1);
                break;
            case 'pauseGame':
                if (window.gameEngine.isPaused) {
                    window.gameEngine.resumeGame();
                } else {
                    window.gameEngine.pauseGame();
                }
                break;
            case 'selectAllUnits':
                this.selectAllUnits();
                break;
            case 'deleteSelected':
                this.deleteSelectedObjects();
                break;
            // Add more actions as needed
        }
        
        this.emit('actionExecuted', action);
    }
    
    /**
     * Select all units
     */
    selectAllUnits() {
        if (window.gameEngine.unitManager) {
            const allUnits = window.gameEngine.unitManager.getUnitsByFaction(
                window.gameEngine.selectedFaction
            );
            this.selectObjects(allUnits);
        }
    }
    
    /**
     * Delete selected objects
     */
    deleteSelectedObjects() {
        for (const object of this.selectedObjects) {
            if (object.type === 'unit' && window.gameEngine.unitManager) {
                window.gameEngine.unitManager.removeUnit(object);
            } else if (object.type === 'building' && window.gameEngine.buildingManager) {
                window.gameEngine.buildingManager.removeBuilding(object);
            }
        }
        
        this.clearSelection();
    }
    
    /**
     * Update input system
     */
    update(deltaTime) {
        // Handle continuous key presses
        for (const key of this.keys) {
            const action = this.keyBindings[key];
            if (action && this.isContinuousAction(action)) {
                this.handleContinuousAction(action, deltaTime);
            }
        }
    }
    
    /**
     * Check if action should be continuous
     */
    isContinuousAction(action) {
        return ['moveUp', 'moveDown', 'moveLeft', 'moveRight'].includes(action);
    }
    
    /**
     * Handle continuous action
     */
    handleContinuousAction(action, deltaTime) {
        const speed = 200 * deltaTime; // pixels per second
        
        switch (action) {
            case 'moveUp':
                window.gameEngine.renderer.panCamera(0, -speed);
                break;
            case 'moveDown':
                window.gameEngine.renderer.panCamera(0, speed);
                break;
            case 'moveLeft':
                window.gameEngine.renderer.panCamera(-speed, 0);
                break;
            case 'moveRight':
                window.gameEngine.renderer.panCamera(speed, 0);
                break;
        }
    }
    
    /**
     * Get selected objects
     */
    getSelectedObjects() {
        return this.selectedObjects.slice();
    }
    
    /**
     * Set key binding
     */
    setKeyBinding(key, action) {
        this.keyBindings[key] = action;
    }
    
    /**
     * Get input state for debugging
     */
    getInputState() {
        return {
            keys: Array.from(this.keys),
            mouse: { ...this.mouse },
            selectedObjects: this.selectedObjects.length,
            isSelecting: this.isSelecting,
            isPanning: this.isPanning,
            isTouch: this.isTouch
        };
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
                console.error(`Error in InputManager event listener for ${event}:`, error);
            }
        });
    }
}