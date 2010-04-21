#include "GDL/Game.h"
#include "GDL/MemTrace.h"
#include "GDL/ExtensionsManager.h"

Game::Game() :
name("Application"),
windowWidth(800),
windowHeight(600),
maxFPS(60),
minFPS(10),
verticalSync(false),
portable(false),
fullscreen(false)
#if defined(GDE)
,imagesWereModified(true)
#endif
{
    //Game use builtin extensions by default
    extensionsUsed.push_back("BuiltinObject");
    extensionsUsed.push_back("BuiltinAudio");
    extensionsUsed.push_back("BuiltinVariables");
    extensionsUsed.push_back("BuiltinTime");
    extensionsUsed.push_back("BuiltinMouse");
    extensionsUsed.push_back("BuiltinKeyboard");
    extensionsUsed.push_back("BuiltinJoystick");
    extensionsUsed.push_back("BuiltinCamera");
    extensionsUsed.push_back("BuiltinWindow");
    extensionsUsed.push_back("BuiltinFile");
    extensionsUsed.push_back("BuiltinInterface");
    extensionsUsed.push_back("BuiltinNetwork");
    extensionsUsed.push_back("BuiltinScene");
    extensionsUsed.push_back("BuiltinAdvanced");
    extensionsUsed.push_back("Sprite");
    extensionsUsed.push_back("BuiltinCommonInstructions");
}


void Game::Init(const Game & game)
{
    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    //Some properties
    name = game.name;
    author = game.author;
    windowWidth = game.windowWidth;
    windowHeight = game.windowHeight;
    maxFPS = game.maxFPS;
    minFPS = game.minFPS;
    verticalSync = game.verticalSync;
    portable = game.portable;
    fullscreen = game.fullscreen;

    //Extensions used
    extensionsUsed = game.extensionsUsed;

    loadingScreen = game.loadingScreen;

    //Resources
    images = game.images;
    dossierImages = game.dossierImages;

    globalObjects.clear();
    for (unsigned int i =0;i<game.globalObjects.size();++i)
    	globalObjects.push_back( extensionManager->CreateObject(game.globalObjects[i]) );

    scenes.clear();
    for (unsigned int i =0;i<game.scenes.size();++i)
    	scenes.push_back( boost::shared_ptr<Scene>(new Scene(*game.scenes[i])) );

    variables = game.variables;
    objectGroups = game.objectGroups;

    #if defined(GDE)
    gameFile = game.gameFile;
    imagesWereModified = game.imagesWereModified;
    #endif
}

Game::Game(const Game & game)
{
    Init(game);
}

Game& Game::operator=(const Game & game)
{
    if ( this != &game )
        Init(game);

    return *this;
}
