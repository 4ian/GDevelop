/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SHADERMANAGER_H
#define SHADERMANAGER_H
#include <map>
#include <string>
#include <boost/shared_ptr.hpp>
#include <boost/weak_ptr.hpp>
#include <SFML/Graphics.hpp>
class Game;

class ShaderManager
{
public:
    ShaderManager();
    virtual ~ShaderManager() {};
    void SetGame(Game * game_) { game = game_; }

    boost::shared_ptr<sf::Shader> GetSFMLShader(const std::vector<std::string> & shaders);

private:
    mutable std::map < std::vector<std::string>, boost::weak_ptr<sf::Shader> > alreadyLoadedShader;

    Game * game;
};

#endif // SHADERMANAGER_H
