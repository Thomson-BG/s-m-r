import SceneKit
import GameController

class GameScene: SCNScene, SCNSceneRendererDelegate {
    
    // Camera system
    private var cameraNode: SCNNode!
    private var cameraTarget: SCNNode!
    private var cameraDistance: Float = 50.0
    private var cameraAngle: Float = 45.0
    private var cameraRotation: Float = 0.0
    
    // Lighting
    private var sunLight: SCNNode!
    private var ambientLight: SCNNode!
    
    // Terrain
    private var terrainNode: SCNNode!
    private let terrainSize: Float = 512.0
    
    // Input handling
    private var selectedUnits: [Unit] = []
    private var selectedBuildings: [Building] = []
    private var selectionBox: SCNNode?
    private var isSelecting = false
    private var selectionStart: CGPoint = .zero
    
    // Game controller
    private var gameController: GCController?
    
    // UI overlays
    private var unitHealthBars: [SCNNode] = []
    private var buildingHealthBars: [SCNNode] = []
    
    override init() {
        super.init()
        setupScene()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupScene()
    }
    
    // MARK: - Scene Setup
    
    private func setupScene() {
        // Basic scene setup
        background.contents = UIColor.black
        lightingEnvironment.contents = UIColor.darkGray
        lightingEnvironment.intensity = 0.3
        
        // Physics
        physicsWorld.gravity = SCNVector3(0, -9.8, 0)
        physicsWorld.speed = 1.0
    }
    
    func setupCamera() {
        // Create camera target (what the camera looks at)
        cameraTarget = SCNNode()
        cameraTarget.position = SCNVector3(0, 0, 0)
        rootNode.addChildNode(cameraTarget)
        
        // Create camera
        cameraNode = SCNNode()
        cameraNode.camera = SCNCamera()
        cameraNode.camera?.automaticallyAdjustsZRange = true
        cameraNode.camera?.fieldOfView = 60.0
        cameraNode.camera?.zNear = 1.0
        cameraNode.camera?.zFar = 1000.0
        
        // Position camera
        updateCameraPosition()
        
        rootNode.addChildNode(cameraNode)
        
        // Set as point of view
        pointOfView = cameraNode
    }
    
    func setupLighting() {
        // Sun light (directional)
        sunLight = SCNNode()
        sunLight.light = SCNLight()
        sunLight.light?.type = .directional
        sunLight.light?.color = UIColor(white: 1.0, alpha: 1.0)
        sunLight.light?.intensity = 1000
        sunLight.light?.castsShadow = true
        sunLight.light?.shadowRadius = 5.0
        sunLight.light?.shadowMapSize = CGSize(width: 2048, height: 2048)
        sunLight.light?.shadowMode = .deferred
        sunLight.position = SCNVector3(50, 50, 50)
        sunLight.look(at: SCNVector3(0, 0, 0))
        rootNode.addChildNode(sunLight)
        
        // Ambient light
        ambientLight = SCNNode()
        ambientLight.light = SCNLight()
        ambientLight.light?.type = .ambient
        ambientLight.light?.color = UIColor(white: 0.3, alpha: 1.0)
        ambientLight.light?.intensity = 300
        rootNode.addChildNode(ambientLight)
        
        // Additional fill light
        let fillLight = SCNNode()
        fillLight.light = SCNLight()
        fillLight.light?.type = .omni
        fillLight.light?.color = UIColor(white: 0.8, alpha: 1.0)
        fillLight.light?.intensity = 500
        fillLight.position = SCNVector3(-30, 30, 30)
        rootNode.addChildNode(fillLight)
    }
    
    func setupTerrain() {
        // Create terrain geometry
        let terrainGeometry = SCNPlane(width: CGFloat(terrainSize), height: CGFloat(terrainSize))
        terrainGeometry.widthSegmentCount = 128
        terrainGeometry.heightSegmentCount = 128
        
        // Create terrain material
        let terrainMaterial = SCNMaterial()
        terrainMaterial.diffuse.contents = generateTerrainTexture()
        terrainMaterial.normal.contents = generateNormalMap()
        terrainMaterial.roughness.contents = 0.8
        terrainMaterial.metalness.contents = 0.0
        terrainGeometry.materials = [terrainMaterial]
        
        // Create terrain node
        terrainNode = SCNNode(geometry: terrainGeometry)
        terrainNode.rotation = SCNVector4(1, 0, 0, -Float.pi / 2) // Rotate to be horizontal
        terrainNode.position = SCNVector3(0, 0, 0)
        
        // Add physics
        terrainNode.physicsBody = SCNPhysicsBody(type: .static, shape: nil)
        terrainNode.physicsBody?.categoryBitMask = PhysicsCategory.terrain
        
        rootNode.addChildNode(terrainNode)
        
        // Add some terrain features
        addTerrainFeatures()
    }
    
    private func generateTerrainTexture() -> UIImage {
        // Generate procedural terrain texture
        let size = CGSize(width: 512, height: 512)
        UIGraphicsBeginImageContext(size)
        
        let context = UIGraphicsGetCurrentContext()!
        
        // Base green color
        context.setFillColor(UIColor(red: 0.2, green: 0.6, blue: 0.1, alpha: 1.0).cgColor)
        context.fill(CGRect(origin: .zero, size: size))
        
        // Add some variation
        for _ in 0..<1000 {
            let x = CGFloat.random(in: 0...size.width)
            let y = CGFloat.random(in: 0...size.height)
            let radius = CGFloat.random(in: 1...5)
            
            context.setFillColor(UIColor(red: 0.15 + CGFloat.random(in: -0.05...0.05),
                                       green: 0.55 + CGFloat.random(in: -0.1...0.1),
                                       blue: 0.08 + CGFloat.random(in: -0.03...0.03),
                                       alpha: 0.5).cgColor)
            context.fillEllipse(in: CGRect(x: x - radius, y: y - radius, width: radius * 2, height: radius * 2))
        }
        
        let image = UIGraphicsGetImageFromCurrentImageContext()!
        UIGraphicsEndImageContext()
        return image
    }
    
    private func generateNormalMap() -> UIImage {
        // Generate simple normal map for terrain detail
        let size = CGSize(width: 256, height: 256)
        UIGraphicsBeginImageContext(size)
        
        let context = UIGraphicsGetCurrentContext()!
        context.setFillColor(UIColor(red: 0.5, green: 0.5, blue: 1.0, alpha: 1.0).cgColor)
        context.fill(CGRect(origin: .zero, size: size))
        
        let image = UIGraphicsGetImageFromCurrentImageContext()!
        UIGraphicsEndImageContext()
        return image
    }
    
    private func addTerrainFeatures() {
        // Add trees, rocks, and other environmental features
        for _ in 0..<50 {
            addTree(at: randomPosition())
        }
        
        for _ in 0..<20 {
            addRock(at: randomPosition())
        }
        
        // Add resource deposits
        for _ in 0..<10 {
            addOreDeposit(at: randomPosition())
        }
    }
    
    private func addTree(at position: SCNVector3) {
        // Create simple tree
        let trunk = SCNNode(geometry: SCNCylinder(radius: 0.3, height: 4.0))
        trunk.geometry?.materials.first?.diffuse.contents = UIColor.brown
        trunk.position = SCNVector3(position.x, 2.0, position.z)
        
        let leaves = SCNNode(geometry: SCNSphere(radius: 2.0))
        leaves.geometry?.materials.first?.diffuse.contents = UIColor.green
        leaves.position = SCNVector3(0, 3.0, 0)
        trunk.addChildNode(leaves)
        
        rootNode.addChildNode(trunk)
    }
    
    private func addRock(at position: SCNVector3) {
        let rock = SCNNode(geometry: SCNBox(width: 2.0, height: 1.5, length: 2.0, chamferRadius: 0.3))
        rock.geometry?.materials.first?.diffuse.contents = UIColor.gray
        rock.position = SCNVector3(position.x, 0.75, position.z)
        rock.rotation = SCNVector4(0, 1, 0, Float.random(in: 0...Float.pi * 2))
        rootNode.addChildNode(rock)
    }
    
    private func addOreDeposit(at position: SCNVector3) {
        let ore = SCNNode(geometry: SCNBox(width: 3.0, height: 1.0, length: 3.0, chamferRadius: 0.1))
        ore.geometry?.materials.first?.diffuse.contents = UIColor.orange
        ore.position = SCNVector3(position.x, 0.5, position.z)
        ore.name = "ore_deposit"
        
        // Add physics for interaction
        ore.physicsBody = SCNPhysicsBody(type: .static, shape: nil)
        ore.physicsBody?.categoryBitMask = PhysicsCategory.resource
        
        rootNode.addChildNode(ore)
    }
    
    private func randomPosition() -> SCNVector3 {
        return SCNVector3(
            Float.random(in: -terrainSize/2...terrainSize/2),
            0,
            Float.random(in: -terrainSize/2...terrainSize/2)
        )
    }
    
    // MARK: - Camera Control
    
    private func updateCameraPosition() {
        let x = cameraDistance * cos(cameraAngle * Float.pi / 180) * cos(cameraRotation * Float.pi / 180)
        let y = cameraDistance * sin(cameraAngle * Float.pi / 180)
        let z = cameraDistance * cos(cameraAngle * Float.pi / 180) * sin(cameraRotation * Float.pi / 180)
        
        cameraNode.position = SCNVector3(
            cameraTarget.position.x + x,
            cameraTarget.position.y + y,
            cameraTarget.position.z + z
        )
        
        cameraNode.look(at: cameraTarget.position)
    }
    
    // MARK: - Input Handling
    
    func handleTap(at location: CGPoint) {
        guard let sceneView = pointOfView?.parent as? SCNView else { return }
        
        let hitResults = sceneView.hitTest(location, options: [:])
        
        for hit in hitResults {
            if let unit = hit.node.parent as? Unit {
                selectUnit(unit)
                return
            } else if let building = hit.node.parent as? Building {
                selectBuilding(building)
                return
            }
        }
        
        // If nothing was hit, move selected units to location
        if !selectedUnits.isEmpty {
            let worldPosition = worldPosition(from: location, in: sceneView)
            moveSelectedUnits(to: worldPosition)
        }
        
        clearSelection()
    }
    
    func handlePanBegan(at location: CGPoint) {
        if !selectedUnits.isEmpty {
            // Start selection box
            isSelecting = true
            selectionStart = location
        }
    }
    
    func handlePanChanged(translation: CGPoint, velocity: CGPoint) {
        if !isSelecting {
            // Camera panning
            let sensitivity: Float = 0.1
            cameraTarget.position.x -= Float(translation.x) * sensitivity
            cameraTarget.position.z += Float(translation.y) * sensitivity
            updateCameraPosition()
        }
    }
    
    func handlePanEnded(velocity: CGPoint) {
        if isSelecting {
            // Complete selection
            isSelecting = false
            // Handle multi-selection logic here
        }
    }
    
    func handlePinchBegan() {
        // Start zoom
    }
    
    func handlePinchChanged(scale: CGFloat) {
        let newDistance = cameraDistance / Float(scale)
        cameraDistance = max(10.0, min(100.0, newDistance))
        updateCameraPosition()
    }
    
    func handlePinchEnded() {
        // End zoom
    }
    
    private func worldPosition(from screenPoint: CGPoint, in sceneView: SCNView) -> SCNVector3 {
        let hitResults = sceneView.hitTest(screenPoint, options: [
            SCNHitTestOption.categoryBitMask: PhysicsCategory.terrain
        ])
        
        if let hit = hitResults.first {
            return hit.worldCoordinates
        }
        
        // Fallback: project onto a plane at y=0
        let camera = sceneView.pointOfView!
        let ray = camera.ray(for: screenPoint, in: sceneView)
        
        // Intersect with y=0 plane
        if ray.direction.y != 0 {
            let t = -ray.origin.y / ray.direction.y
            return SCNVector3(
                ray.origin.x + ray.direction.x * t,
                0,
                ray.origin.z + ray.direction.z * t
            )
        }
        
        return SCNVector3(0, 0, 0)
    }
    
    // MARK: - Selection Management
    
    func selectUnit(_ unit: Unit) {
        clearSelection()
        selectedUnits = [unit]
        unit.setSelected(true)
    }
    
    func selectBuilding(_ building: Building) {
        clearSelection()
        selectedBuildings = [building]
        building.setSelected(true)
    }
    
    private func clearSelection() {
        for unit in selectedUnits {
            unit.setSelected(false)
        }
        for building in selectedBuildings {
            building.setSelected(false)
        }
        selectedUnits.removeAll()
        selectedBuildings.removeAll()
    }
    
    private func moveSelectedUnits(to position: SCNVector3) {
        for (index, unit) in selectedUnits.enumerated() {
            let offset = SCNVector3(
                Float(index % 3 - 1) * 2.0,
                0,
                Float(index / 3 - 1) * 2.0
            )
            let targetPosition = SCNVector3(
                position.x + offset.x,
                position.y + offset.y,
                position.z + offset.z
            )
            GameEngine.shared.moveUnit(unit, to: targetPosition)
        }
    }
    
    // MARK: - Game Controller Support
    
    func connectController(_ controller: GCController) {
        gameController = controller
        
        // Setup controller input handlers
        controller.extendedGamepad?.leftThumbstick.valueChangedHandler = { [weak self] (dpad, xValue, yValue) in
            self?.handleControllerCameraMove(x: xValue, y: yValue)
        }
        
        controller.extendedGamepad?.rightThumbstick.valueChangedHandler = { [weak self] (dpad, xValue, yValue) in
            self?.handleControllerCameraRotate(x: xValue, y: yValue)
        }
        
        controller.extendedGamepad?.buttonA.pressedChangedHandler = { [weak self] (button, value, pressed) in
            if pressed {
                self?.handleControllerAction()
            }
        }
    }
    
    func disconnectController() {
        gameController = nil
    }
    
    private func handleControllerCameraMove(x: Float, y: Float) {
        let sensitivity: Float = 0.5
        cameraTarget.position.x += x * sensitivity
        cameraTarget.position.z -= y * sensitivity
        updateCameraPosition()
    }
    
    private func handleControllerCameraRotate(x: Float, y: Float) {
        let sensitivity: Float = 2.0
        cameraRotation += x * sensitivity
        cameraAngle = max(10.0, min(80.0, cameraAngle - y * sensitivity))
        updateCameraPosition()
    }
    
    private func handleControllerAction() {
        // Handle controller action button
        // Could be unit selection, building placement, etc.
    }
    
    // MARK: - Scene Renderer Delegate
    
    func renderer(_ renderer: SCNSceneRenderer, updateAtTime time: TimeInterval) {
        // Update game objects
        updateVisibleObjects()
        updateUI()
    }
    
    private func updateVisibleObjects() {
        // Update unit positions and animations
        for unit in UnitManager.shared.getAllUnits() {
            unit.update()
        }
        
        // Update building animations
        for building in BuildingManager.shared.getAllBuildings() {
            building.update()
        }
    }
    
    private func updateUI() {
        // Update health bars and other UI elements
        updateHealthBars()
    }
    
    private func updateHealthBars() {
        // Update unit health bars
        for (index, unit) in selectedUnits.enumerated() {
            if index < unitHealthBars.count {
                let healthBar = unitHealthBars[index]
                updateHealthBar(healthBar, for: unit.currentHealth, maxHealth: unit.maxHealth)
            }
        }
        
        // Update building health bars
        for (index, building) in selectedBuildings.enumerated() {
            if index < buildingHealthBars.count {
                let healthBar = buildingHealthBars[index]
                updateHealthBar(healthBar, for: building.currentHealth, maxHealth: building.maxHealth)
            }
        }
    }
    
    private func updateHealthBar(_ healthBar: SCNNode, for currentHealth: Float, maxHealth: Float) {
        let healthPercentage = currentHealth / maxHealth
        healthBar.scale = SCNVector3(healthPercentage, 1.0, 1.0)
        
        // Color based on health
        let material = healthBar.geometry?.materials.first
        if healthPercentage > 0.6 {
            material?.diffuse.contents = UIColor.green
        } else if healthPercentage > 0.3 {
            material?.diffuse.contents = UIColor.yellow
        } else {
            material?.diffuse.contents = UIColor.red
        }
    }
}

// MARK: - Physics Categories

struct PhysicsCategory {
    static let terrain: Int = 1 << 0
    static let unit: Int = 1 << 1
    static let building: Int = 1 << 2
    static let projectile: Int = 1 << 3
    static let resource: Int = 1 << 4
}

// MARK: - Extensions

extension SCNNode {
    func ray(for point: CGPoint, in sceneView: SCNView) -> (origin: SCNVector3, direction: SCNVector3) {
        let nearPoint = sceneView.unprojectPoint(SCNVector3(Float(point.x), Float(point.y), 0.0))
        let farPoint = sceneView.unprojectPoint(SCNVector3(Float(point.x), Float(point.y), 1.0))
        
        let direction = SCNVector3(
            farPoint.x - nearPoint.x,
            farPoint.y - nearPoint.y,
            farPoint.z - nearPoint.z
        )
        
        return (nearPoint, direction)
    }
}