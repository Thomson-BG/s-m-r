# 👨‍💻 Developers Manual

## Introduction

This document provides information for developers who want to contribute to the Red Alert 2 project.

## Project Structure

The project is organized as follows:

*   `main.py`: The main entry point for the game.
*   `assets/`: This directory stores all of the game's assets, such as images, sounds, and music.
*   `src/`: This directory contains the game's source code.
*   `src/engine/`: This directory contains the game engine code.
*   `src/game/`: This directory contains the game logic.
*   `docs/`: This directory contains the developer and user manuals.

## How to Contribute

1.  Fork the repository.
2.  Create a new branch for your feature.
3.  Make your changes.
4.  Submit a pull request.

## Game Engine

The game engine is responsible for the main game loop and managing game objects. The main classes are:

*   `GameEngine`: The main engine class that runs the game loop.
*   `GameObject`: The base class for all objects in the game.

## Game Logic

The game logic is responsible for the rules of the game. The main classes are:

*   `Game`: The main game class that manages the overall game state.
*   `Player`: Represents a player in the game.
*   `Unit`: The base class for all units in the game.
*   `Soldier`: A basic combat unit.
*   `Miner`: A unit that gathers resources.
*   `Building`: The base class for all buildings in the game.
*   `Barracks`: A building that produces soldiers.
*   `ResourceNode`: A node that contains resources.
*   `AI`: A simple AI that controls a player.
