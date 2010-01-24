#include "GDL/RuntimeGame.h"

RuntimeGame::RuntimeGame()
{
    //ctor
}

RuntimeGame::~RuntimeGame()
{
    //dtor
}

/**
 * Initialize RuntimeGame from Game
 */
bool RuntimeGame::LoadFromGame(const Game & game)
{
    name = game.name;
    author = game.author;
    windowWidth = game.windowWidth;
    windowHeight = game.windowHeight;
    maxFPS = game.maxFPS;
    minFPS = game.minFPS;
    verticalSync = game.verticalSync;
    portable = game.portable;
    fullscreen = game.fullscreen;

    extensionsUsed = game.extensionsUsed;

    loadingScreen = game.loadingScreen;

    images = game.images;
    dossierImages = game.dossierImages;

    m_scenes = game.m_scenes;
    globalObjects = game.globalObjects;

    variables = game.variables;

    return true;
}
