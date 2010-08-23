/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SPRITE_H
#define SPRITE_H
#include <SFML/Graphics.hpp>
#include <boost/shared_ptr.hpp>
#include "GDL/Point.h"
#include <string>

using namespace std;

/**
 * A sprite contains a SFML sprite to be display,
 * some points, and can also have its own image ( rather than a image from ImageManager ).
 */
class GD_API Sprite
{
public:
    Sprite();
    virtual ~Sprite();

    inline const sf::Sprite & GetSFMLSprite() const { return sfmlSprite; }
    inline sf::Sprite & GetSFMLSprite() { return sfmlSprite; }

    void LoadImage(boost::shared_ptr<sf::Image> image);
    boost::shared_ptr<sf::Image> GetSFMLImage() { return sfmlImage; };
    const boost::shared_ptr<sf::Image> GetSFMLImage() const { return sfmlImage; };

    inline void SetImageName(const string & image_) { image = image_; }
    inline const string & GetImageName() const { return image; }

    inline vector < Point > & GetAllNonDefaultPoints() { return points; }
    inline const vector < Point > & GetAllNonDefaultPoints() const { return points; }

    void AddPoint( const Point & point );
    void DelPoint( const string & name );
    const Point & GetPoint( const string & name) const;
    Point & GetPoint(const string & name);
    bool HasPoint( const string & name ) const;

    inline const Point & GetOrigine() const { return origine; }
    inline Point & GetOrigine() { return origine; }

    inline const Point & GetCentre() const { return centre; }
    inline Point & GetCentre() { automaticCentre = false; return centre; }
    inline bool IsCentreAutomatic() const { return automaticCentre; }
    bool SetCentreAutomatic(bool enabled);

    /**
     * Make the sprite, if it uses an image from ImageManager,
     * copy this image and own it inside.
     */
    void MakeSpriteOwnsItsImage();

private:

    sf::Sprite sfmlSprite; ///< Displayed SFML sprite
    boost::shared_ptr<sf::Image> sfmlImage; ///< Pointer to the image displayed by the sprite.
    bool hasItsOwnImage; ///< True if sfmlImage is only owned by this Sprite.
    string image; ///< Name of the image to be loaded in Image Manager.

    vector < Point > points;
    Point origine;

    bool automaticCentre;
    Point centre;

    static Point badPoint; //Si on ne peut pas retourner de points valide.
};

#endif // SPRITE_H
