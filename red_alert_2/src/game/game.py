from src.engine.engine import GameEngine
from src.game.player import Player
from src.game.buildings import Barracks

class Game:
    def __init__(self):
        self.engine = GameEngine()
        self.engine.game = self  # Give the engine a reference to the game
        self.players = []
        self.game_objects = []

    def setup(self):
        # Create two players
        player1 = Player(self.engine, "Player 1")
        player2 = Player(self.engine, "Player 2", is_ai=True)
        self.players.extend([player1, player2])

        # Create a barracks for each player
        barracks1 = Barracks(self.engine, 10, 10, player1)
        barracks2 = Barracks(self.engine, 50, 50, player2)
        player1.add_building(barracks1)
        player2.add_building(barracks2)
        self.game_objects.extend([barracks1, barracks2])


    def run(self):
        self.setup()
        self.engine.run()
