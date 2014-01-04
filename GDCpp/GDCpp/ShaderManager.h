/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SHADERMANAGER_H
#define SHADERMANAGER_H
#include <map>
#include <string>
#include <boost/shared_ptr.hpp>
#include <boost/weak_ptr.hpp>
#include <SFML/Graphics.hpp>
namespace gd { class Project; }

/**
 * \brief Still work in progress class to manage shaders
 *
 * \ingroup GameEngine
 */
class ShaderManager
{
public:
    ShaderManager();
    virtual ~ShaderManager() {};
    void SetGame(gd::Project * game_) { game = game_; }

    boost::shared_ptr<sf::Shader> GetSFMLShader(const std::vector<std::string> & shaders);

private:
    mutable std::map < std::vector<std::string>, boost::weak_ptr<sf::Shader> > alreadyLoadedShader;

    gd::Project * game;
};

#endif // SHADERMANAGER_H

