from src.engine.game_objects import GameObject

class Building(GameObject):
    def __init__(self, engine, x, y):
        super().__init__(engine)
        self.x = x
        self.y = y
        self.health = 1000

    def update(self):
        pass

    def take_damage(self, damage):
        self.health -= damage
        if self.health <= 0:
            self.destroy()

    def destroy(self):
        self.engine.game_objects.remove(self)

class Barracks(Building):
    def __init__(self, engine, x, y, player):
        super().__init__(engine, x, y)
        self.player = player
        self.production_queue = []
        self.production_time = 5  # Time to produce one soldier
        self.current_production_time = 0

    def update(self):
        if self.production_queue:
            self.current_production_time += 1
            if self.current_production_time >= self.production_time:
                self.produce_unit()
                self.current_production_time = 0

    def add_to_production_queue(self, unit_type):
        self.production_queue.append(unit_type)

    def produce_unit(self):
        from src.game.units import Soldier
        unit_type = self.production_queue.pop(0)
        if unit_type == "soldier":
            new_unit = Soldier(self.engine, self.x, self.y + 2)
            self.player.add_unit(new_unit)
