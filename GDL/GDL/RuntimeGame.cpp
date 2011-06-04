#include "GDL/RuntimeGame.h"
#include "GDL/ImageManager.h"
#include "GDL/Object.h"
#include "GDL/ObjectGroup.h"
#include "GDL/RuntimeScene.h"

RuntimeGame::RuntimeGame() :
windowWidth(800),
windowHeight(600),
maxFPS(60),
minFPS(10),
verticalSync(false),
portable(false),
fullscreen(false),
imageManager(boost::shared_ptr<ImageManager>(new ImageManager))
{
    imageManager->SetGame(this);
}

RuntimeGame::RuntimeGame(const RuntimeGame & runtimeGame)
{
    Init(runtimeGame);
}

RuntimeGame& RuntimeGame::operator=(const RuntimeGame & runtimeGame)
{
    if( (this) != &runtimeGame )
        Init(runtimeGame);

    return *this;
}

void RuntimeGame::Init(const RuntimeGame & game)
{
    imageManager = boost::shared_ptr<ImageManager>(new ImageManager(*game.imageManager));
    imageManager->SetGame(this);

    //Some properties
    windowWidth = game.windowWidth;
    windowHeight = game.windowHeight;
    maxFPS = game.maxFPS;
    minFPS = game.minFPS;
    verticalSync = game.verticalSync;
    portable = game.portable;
    fullscreen = game.fullscreen;

    //Resources
    images = game.images;

    globalObjects.clear();
    for (unsigned int i =0;i<game.globalObjects.size();++i)
    	globalObjects.push_back( game.globalObjects[i]->Clone() );

    scenes.clear();
    for (unsigned int i =0;i<game.scenes.size();++i)
    	scenes.push_back( boost::shared_ptr<RuntimeScene>(new RuntimeScene(*game.scenes[i])) );

    variables = game.variables;
    objectGroups = game.objectGroups;
}

RuntimeGame::~RuntimeGame()
{
}
