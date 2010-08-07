/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SPRITE_H
#define SPRITE_H
#include <SFML/Graphics.hpp>
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

    inline const sf::Sprite & GetSprite() const { return sfmlSprite; }
    inline sf::Sprite & ModSprite() { return sfmlSprite; }
    void SetSprite(const sf::Sprite & sprite_);

    inline vector < Point > & ModNonDefaultPoints() { return points; }
    inline const vector < Point > & GetNonDefaultPoints() const { return points; }

    void AddPoint( const Point & point );
    void DelPoint( const string & name );
    const Point & GetPoint( const string & name) const;
    Point & ModPoint(const string & name);
    bool HasPoint( const string & name ) const;

    inline const Point & GetOrigine() const { return origine; }
    inline Point & ModOrigine() { return origine; }

    inline const Point & GetCentre() const { return centre; }
    inline Point & ModCentre() { automaticCentre = false; return centre; }
    inline bool IsCentreAutomatic() const { return automaticCentre; }
    bool SetCentreAutomatic(bool enabled);

    inline void SetImageName(const string & image_) { image = image_; }
    inline const string & GetImageName() const { return image; }

    /**
     * Make the sprite, if it uses an image from ImageManager,
     * copy this image and own it inside.
     */
    void MakeSpriteOwnsItsImage();

    /**
     * Get the unique image the sprite own.
     * Make sure that the sprite own its personal image before calling this function.
     */
    inline sf::Image & GetSpriteOwnImage() {return uniqueImage;};

protected:
private:

    /**
     * SFML Sprite
     */
    sf::Sprite sfmlSprite;

    /**
     * Name of the image to be loaded in ImageManager
     */
    string image;

    /**
     * Can also hold its own image
     */
    sf::Image uniqueImage;
    bool hasItsOwnImage;

    vector < Point > points;
    Point origine;

    bool automaticCentre;
    Point centre;

    static Point badPoint; //Si on ne peut pas retourner de points valide.
};

#endif // SPRITE_H
