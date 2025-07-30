from src.game.ai import AI

class Player:
    def __init__(self, engine, name, is_ai=False):
        self.engine = engine
        self.name = name
        self.units = []
        self.buildings = []
        self.resources = 0
        self.is_ai = is_ai
        if self.is_ai:
            self.ai = AI(self)

    def update(self):
        if self.is_ai:
            self.ai.update()

    def add_unit(self, unit):
        self.units.append(unit)

    def remove_unit(self, unit):
        self.units.remove(unit)

    def add_building(self, building):
        self.buildings.append(building)

    def remove_building(self, building):
        self.buildings.remove(building)

    def add_resources(self, amount):
        self.resources += amount
