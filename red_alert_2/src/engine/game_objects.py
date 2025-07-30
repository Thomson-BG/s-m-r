class GameObject:
    def __init__(self, engine):
        self.engine = engine
        self.engine.game_objects.append(self)

    def update(self):
        pass
