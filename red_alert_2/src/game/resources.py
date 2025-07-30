from src.engine.game_objects import GameObject

class ResourceNode(GameObject):
    def __init__(self, engine, x, y, amount):
        super().__init__(engine)
        self.x = x
        self.y = y
        self.amount = amount

    def extract(self, amount_to_extract):
        extracted_amount = min(amount_to_extract, self.amount)
        self.amount -= extracted_amount
        if self.amount <= 0:
            self.destroy()
        return extracted_amount

    def destroy(self):
        self.engine.game_objects.remove(self)
