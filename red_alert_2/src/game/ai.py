import random

class AI:
    def __init__(self, player):
        self.player = player

    def update(self):
        # Build soldiers
        for building in self.player.buildings:
            if hasattr(building, "produce_unit") and not building.production_queue:
                building.add_to_production_queue("soldier")

        # Attack enemy units
        for unit in self.player.units:
            if hasattr(unit, "attack"):
                # Find a target
                target = self.find_target()
                if target:
                    unit.attack(target)

    def find_target(self):
        # Find an enemy unit to attack
        enemy_players = [p for p in self.player.engine.game.players if p != self.player]
        if enemy_players:
            enemy_player = random.choice(enemy_players)
            if enemy_player.units:
                return random.choice(enemy_player.units)
        return None
