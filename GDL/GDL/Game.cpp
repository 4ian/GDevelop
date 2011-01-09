#include "GDL/Game.h"
#include "GDL/MemTrace.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExternalEvents.h"

#if defined(GD_IDE_ONLY)
#include <wx/wx.h>
#elif !defined(_)
#define _(x) x
#endif


Game::Game() :
name(_("Projet")),
windowWidth(800),
windowHeight(600),
maxFPS(60),
minFPS(10),
verticalSync(false),
portable(false),
fullscreen(false)
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
    extensionsUsed.push_back("BuiltinCommonConversions");
    extensionsUsed.push_back("BuiltinStringInstructions");
}


void Game::Init(const Game & game)
{
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
    imagesFolders = game.imagesFolders;

    globalObjects.clear();
    for (unsigned int i =0;i<game.globalObjects.size();++i)
    	globalObjects.push_back( game.globalObjects[i]->Clone() );

    scenes.clear();
    for (unsigned int i =0;i<game.scenes.size();++i)
    	scenes.push_back( boost::shared_ptr<Scene>(new Scene(*game.scenes[i])) );

    externalEvents.clear();
    for (unsigned int i =0;i<game.externalEvents.size();++i)
    	externalEvents.push_back( boost::shared_ptr<ExternalEvents>(new ExternalEvents(*game.externalEvents[i])) );

    variables = game.variables;
    objectGroups = game.objectGroups;

    #if defined(GD_IDE_ONLY)
    gameFile = game.gameFile;
    imagesChanged = game.imagesChanged;

    winExecutableFilename = game.winExecutableFilename;
    winExecutableIconFile = game.winExecutableIconFile;
    linuxExecutableFilename = game.linuxExecutableFilename;
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
