#include "GDL/RuntimeGame.h"
#include "GDL/ShaderManager.h"

RuntimeGame::RuntimeGame() :
Game(),
shaderManager(boost::shared_ptr<ShaderManager>(new ShaderManager))
{
    shaderManager->SetGame(this);
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
    shaderManager = boost::shared_ptr<ShaderManager>(new ShaderManager(*runtimeGame.shaderManager));
    shaderManager->SetGame(this);
}

