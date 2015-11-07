/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <SFML/Graphics.hpp>
#include "GDCore/Extensions/Builtin/SpriteExtension/Sprite.h"
#include "GDCore/Project/ImageManager.h"
#include "GDCpp/RuntimeSpriteObject.h"
#include "GDCpp/Collisions.h"

bool PixelPerfectTest( const sf::Sprite& object1, const sf::Sprite& object2, sf::Uint8 AlphaLimit, const sf::Image & object1CollisionMask,  const sf::Image & object2CollisionMask )
{
    sf::FloatRect intersection;
    if ( object1.getGlobalBounds().intersects( object2.getGlobalBounds(), intersection ) )
    {
        //We've got an intersection we need to process the pixels
        //in that Rect.

        //Bail out now if AlphaLimit = 0
        if ( AlphaLimit == 0 ) return true;

        //There are a few hacks here, sometimes the TransformToLocal returns negative points
        //Or Points outside the image.  We need to check for these as they print to the error console
        //which is slow, and then return black which registers as a hit.

        sf::Vector2f o1v;
        sf::Vector2f o2v;
        //Loop through our pixels
        for ( int i = intersection.left; i < intersection.left+intersection.width; i++ ) //4ian : Rect now uses width/height.
        {
            for ( int j = intersection.top; j < intersection.top+intersection.height; j++ ) //4ian : Rect now uses width/height.
            {

                o1v = object1.getInverseTransform().transformPoint( i, j ); //Creating objects each loop :(
                o2v = object2.getInverseTransform().transformPoint( i, j );

                //Hack to make sure pixels fall within the Sprite's Image
                if ( o1v.x > 0 && o1v.y > 0 && o2v.x > 0 && o2v.y > 0 &&
                        o1v.x < object1CollisionMask.getSize().x && o1v.y < object1CollisionMask.getSize().y &&
                        o2v.x < object2CollisionMask.getSize().x && o2v.y < object2CollisionMask.getSize().y )
                {
                    //If both sprites have opaque pixels at the same point we've got a hit
                    if (( object1CollisionMask.getPixel( static_cast<int>( o1v.x ), static_cast<int>( o1v.y ) ).a > AlphaLimit ) &&
                        ( object2CollisionMask.getPixel( static_cast<int>( o2v.x ), static_cast<int>( o2v.y ) ).a > AlphaLimit ) )
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
bool GD_API CheckCollision( const RuntimeSpriteObject * const objet1, const RuntimeSpriteObject * const objet2)
{
    return PixelPerfectTest( objet1->GetCurrentSFMLSprite(), objet2->GetCurrentSFMLSprite(), 1, objet1->GetCurrentSprite().GetSFMLTexture()->image, objet2->GetCurrentSprite().GetSFMLTexture()->image  );
}
