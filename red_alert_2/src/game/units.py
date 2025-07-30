from src.engine.game_objects import GameObject

class Unit(GameObject):
    def __init__(self, engine, x, y):
        super().__init__(engine)
        self.x = x
        self.y = y
        self.health = 100

    def update(self):
        pass

    def move(self, dx, dy):
        self.x += dx
        self.y += dy

    def take_damage(self, damage):
        self.health -= damage
        if self.health <= 0:
            self.destroy()

    def destroy(self):
        self.engine.game_objects.remove(self)

class Soldier(Unit):
    def __init__(self, engine, x, y):
        super().__init__(engine, x, y)
        self.attack_damage = 10
        self.attack_range = 1

    def attack(self, target_unit):
        if self.can_attack(target_unit):
            target_unit.take_damage(self.attack_damage)

    def can_attack(self, target_unit):
        distance = ((self.x - target_unit.x) ** 2 + (self.y - target_unit.y) ** 2) ** 0.5
        return distance <= self.attack_range

class Miner(Unit):
    def __init__(self, engine, x, y):
        super().__init__(engine, x, y)
        self.capacity = 1000
        self.current_load = 0
        self.gather_rate = 100

    def gather(self, resource_node):
        if self.can_gather(resource_node):
            amount_to_gather = min(self.gather_rate, self.capacity - self.current_load)
            gathered_amount = resource_node.extract(amount_to_gather)
            self.current_load += gathered_amount

    def can_gather(self, resource_node):
        distance = ((self.x - resource_node.x) ** 2 + (self.y - resource_node.y) ** 2) ** 0.5
        return distance <= 1
