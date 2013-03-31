/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include <SFML/Graphics.hpp>
#include "GDL/ImageManager.h"
#include "GDL/Sprite.h"
#include "GDL/SpriteObject.h"
#include "GDL/Collisions.h"

namespace //Some private tools functions
{

sf::Vector2f GD_API RotatePoint( const sf::Vector2f& Point, float Angle )
{
    Angle = -Angle * 3.14159265358979323846/180.0;
    sf::Vector2f RotatedPoint;
    RotatedPoint.x = Point.x * cos( Angle ) + Point.y * sin( Angle );
    RotatedPoint.y = -Point.x * sin( Angle ) + Point.y * cos( Angle );
    return RotatedPoint;
}

inline float MinValue( float a, float b, float c, float d )
{
    float min = a;

    min = ( b < min ? b : min );
    min = ( c < min ? c : min );
    min = ( d < min ? d : min );

    return min;
}

inline float MaxValue( float a, float b, float c, float d )
{
    float max = a;

    max = ( b > max ? b : max );
    max = ( c > max ? c : max );
    max = ( d > max ? d : max );

    return max;
}

}

sf::IntRect GetAABB( const sf::Sprite& Object )
{

    //Get the top left corner of the sprite regardless of the sprite's center
    //This is in Global Coordinates so we can put the rectangle back into the right place
    sf::Vector2f pos = Object.getTransform().transformPoint( 0,0 );

    //Store the size so we can calculate the other corners
    sf::FloatRect size = Object.getLocalBounds();

    float Angle = Object.getRotation();

    //Bail out early if the sprite isn't rotated
    if ( Angle == 0.0f )
    {
        return sf::IntRect( static_cast<int>( pos.x ),
                            static_cast<int>( pos.y ),
                            static_cast<int>( size.width ),
                            static_cast<int>( size.height ) );
    }

    //Calculate the other points as vectors from (0,0)
    //Imagine sf::Vector2f A(0,0); but its not necessary
    //as rotation is around this point.
    sf::Vector2f B( size.width, 0 );
    sf::Vector2f C( size.width, size.height );
    sf::Vector2f D( 0, size.height );

    //Rotate the points to match the sprite rotation
    B = RotatePoint( B, Angle );
    C = RotatePoint( C, Angle );
    D = RotatePoint( D, Angle );

    //Round off to int and set the four corners of our Rect
    int Left = static_cast<int>( MinValue( 0.0f, B.x, C.x, D.x ) );
    int Top = static_cast<int>( MinValue( 0.0f, B.y, C.y, D.y ) );
    int Right = static_cast<int>( MaxValue( 0.0f, B.x, C.x, D.x ) );
    int Bottom = static_cast<int>( MaxValue( 0.0f, B.y, C.y, D.y ) );

    //Create a Rect from out points and move it back to the correct position on the screen
    sf::IntRect AABB = sf::IntRect( pos.x+Left, pos.y+Top, Right-Left, Bottom-Top ); //4ian : Rect now uses width/height.
    return AABB;
}
bool PixelPerfectTest( const sf::Sprite& Object1, const sf::Sprite& Object2, sf::Uint8 AlphaLimit, const sf::Image & Object1CollisionMask,  const sf::Image & Object2CollisionMask )
{
    //Get AABBs of the two sprites
    sf::IntRect Object1AABB = GetAABB( Object1 );
    sf::IntRect Object2AABB = GetAABB( Object2 );

    sf::IntRect Intersection;

    //TODO : Use sf::Sprite::getGlobalBounds ?
    if ( Object1AABB.intersects( Object2AABB, Intersection ) )
    {

        //We've got an intersection we need to process the pixels
        //In that Rect.

        //Bail out now if AlphaLimit = 0
        if ( AlphaLimit == 0 ) return true;

        //There are a few hacks here, sometimes the TransformToLocal returns negative points
        //Or Points outside the image.  We need to check for these as they print to the error console
        //which is slow, and then return black which registers as a hit.

        sf::FloatRect O1SubRect = Object1.getLocalBounds();
        sf::FloatRect O2SubRect = Object2.getLocalBounds();

        sf::Vector2f o1v;
        sf::Vector2f o2v;
        //Loop through our pixels
        for ( int i = Intersection.left; i < Intersection.left+Intersection.width; i++ ) //4ian : Rect now uses width/height.
        {
            for ( int j = Intersection.top; j < Intersection.top+Intersection.height; j++ ) //4ian : Rect now uses width/height.
            {

                o1v = Object1.getInverseTransform().transformPoint( i, j ); //Creating Objects each loop :(
                o2v = Object2.getInverseTransform().transformPoint( i, j );

                //Hack to make sure pixels fall within the Sprite's Image
                if ( o1v.x > 0 && o1v.y > 0 && o2v.x > 0 && o2v.y > 0 &&
                        o1v.x < Object1CollisionMask.getSize().x && o1v.y < Object1CollisionMask.getSize().y &&
                        o2v.x < Object2CollisionMask.getSize().x && o2v.y < Object2CollisionMask.getSize().y )
                {
                    //If both sprites have opaque pixels at the same point we've got a hit
                    if (( Object1CollisionMask.getPixel( static_cast<int>( o1v.x ), static_cast<int>( o1v.y ) ).a > AlphaLimit ) &&
                        ( Object2CollisionMask.getPixel( static_cast<int>( o2v.x ), static_cast<int>( o2v.y ) ).a > AlphaLimit ) )
                    {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    return false;
}

/**
 * Check for collision between two sprite objects
 */
bool GD_API CheckCollision( const SpriteObject * const objet1, const SpriteObject * const objet2)
{
    return PixelPerfectTest( objet1->GetCurrentSFMLSprite(), objet2->GetCurrentSFMLSprite(), 1, objet1->GetCurrentSprite().GetSFMLTexture()->image, objet2->GetCurrentSprite().GetSFMLTexture()->image  );
}

