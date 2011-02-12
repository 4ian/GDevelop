/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef FONTMANAGER_H
#define FONTMANAGER_H
#include <SFML/Graphics.hpp>
#include <string>
#include <vector>

using namespace std;

/**
 * \brief FontManager loads and manages SFML fonts.
 */
class GD_API FontManager
{
public:

    /**
     * Return a pointer to an SFML font.
     * Example :
     * \code
     * sfmlText.SetFont(*fontManager->GetFont(fontName));
     * \endcode
     */
    const sf::Font * GetFont(string fontName);

    static FontManager *GetInstance()
    {
        if ( NULL == _singleton )
        {
            _singleton = new FontManager;
        }

        return ( static_cast<FontManager*>( _singleton ) );
    }

    static void DestroySingleton()
    {
        if ( NULL != _singleton )
        {
            delete _singleton;
            _singleton = NULL;
        }
    }

private:

    map < std::string, sf::Font* >   fonts;

    FontManager();
    virtual ~FontManager();

    static FontManager *_singleton;
};

#endif // FONTMANAGER_H
