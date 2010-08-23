#include "GDL/RuntimeGame.h"

RuntimeGame::RuntimeGame() :
Game(),
imageManager(boost::shared_ptr<ImageManager>(new ImageManager))
{
    imageManager->SetGame(this);
}

RuntimeGame::RuntimeGame(const RuntimeGame & runtimeGame) :
Game(runtimeGame)
{
    Init(runtimeGame);
}

RuntimeGame& RuntimeGame::operator=(const RuntimeGame & runtimeGame)
{
    if( (this) != &runtimeGame )
    {
        Game::operator=(runtimeGame);
        Init(runtimeGame);
    }

    return *this;
}

void RuntimeGame::Init(const RuntimeGame & runtimeGame)
{
    imageManager = boost::shared_ptr<ImageManager>(new ImageManager(*runtimeGame.imageManager));
    imageManager->SetGame(this);
}
