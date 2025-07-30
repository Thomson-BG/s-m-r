class GameEngine:
    def __init__(self):
        self.is_running = False
        self.game_objects = []
        self.game = None

    def run(self):
        self.is_running = True
        while self.is_running:
            # Update all game objects
            for obj in self.game_objects:
                obj.update()

            # Update all players
            if self.game:
                for player in self.game.players:
                    player.update()

    def stop(self):
        self.is_running = False
