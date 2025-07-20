import Foundation
import SceneKit

// MARK: - GameObject Base Class

class GameObject: SCNNode {
    let id: UUID = UUID()
    private(set) var currentHealth: Int = 100
    private(set) var maxHealth: Int = 100
    private(set) var isDestroyed: Bool = false
    
    override init() {
        super.init()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }
    
    // MARK: - Health Management
    
    func takeDamage(_ amount: Int, from attacker: GameObject? = nil) {
        currentHealth = max(0, currentHealth - amount)
        
        if currentHealth <= 0 {
            destroy()
        }
    }
    
    func heal(_ amount: Int) {
        currentHealth = min(maxHealth, currentHealth + amount)
    }
    
    func setMaxHealth(_ health: Int) {
        maxHealth = health
        currentHealth = min(currentHealth, maxHealth)
    }
    
    // MARK: - Utility Methods
    
    func distanceTo(_ other: GameObject) -> Float {
        return distance(from: position, to: other.position)
    }
    
    func distanceToPosition(_ position: SCNVector3) -> Float {
        return distance(from: self.position, to: position)
    }
    
    private func distance(from: SCNVector3, to: SCNVector3) -> Float {
        let dx = from.x - to.x
        let dy = from.y - to.y
        let dz = from.z - to.z
        return sqrt(dx*dx + dy*dy + dz*dz)
    }
    
    func directionTo(_ other: GameObject) -> SCNVector3 {
        return directionToPosition(other.position)
    }
    
    func directionToPosition(_ targetPosition: SCNVector3) -> SCNVector3 {
        let direction = SCNVector3(
            targetPosition.x - position.x,
            targetPosition.y - position.y,
            targetPosition.z - position.z
        )
        return normalize(direction)
    }
    
    private func normalize(_ vector: SCNVector3) -> SCNVector3 {
        let length = sqrt(vector.x*vector.x + vector.y*vector.y + vector.z*vector.z)
        if length == 0 { return SCNVector3(0, 0, 0) }
        return SCNVector3(vector.x/length, vector.y/length, vector.z/length)
    }
    
    // MARK: - Destruction
    
    func destroy() {
        isDestroyed = true
        createDestructionEffect()
        removeFromParentNode()
    }
    
    private func createDestructionEffect() {
        // Create explosion effect
        let explosion = SCNNode()
        explosion.position = position
        
        // Create multiple particle effects
        for _ in 0..<5 {
            let particle = SCNNode(geometry: SCNSphere(radius: 0.2))
            particle.geometry?.materials.first?.diffuse.contents = UIColor.orange
            particle.position = SCNVector3(
                Float.random(in: -1...1),
                Float.random(in: -1...1),
                Float.random(in: -1...1)
            )
            explosion.addChildNode(particle)
            
            // Animate particles
            let moveAction = SCNAction.moveBy(x: CGFloat(Float.random(in: -3...3)),
                                            y: CGFloat(Float.random(in: 0...3)),
                                            z: CGFloat(Float.random(in: -3...3)),
                                            duration: 1.0)
            let fadeAction = SCNAction.fadeOut(duration: 1.0)
            let removeAction = SCNAction.removeFromParentNode()
            let sequence = SCNAction.sequence([SCNAction.group([moveAction, fadeAction]), removeAction])
            
            particle.runAction(sequence)
        }
        
        parent?.addChildNode(explosion)
        
        // Remove explosion node after animation
        let removeExplosion = SCNAction.sequence([
            SCNAction.wait(duration: 1.5),
            SCNAction.removeFromParentNode()
        ])
        explosion.runAction(removeExplosion)
    }
}