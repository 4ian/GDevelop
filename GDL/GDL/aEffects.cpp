#include "GDL/aEffects.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/SpriteObject.h"

/**
 * Change the color filter of a sprite
 */
bool SpriteObject::ActChangeColor( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    vector < string > colors = SpliterStringToVector <string> (action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    SetColor(  ToInt(colors[0]),
               ToInt(colors[1]),
               ToInt(colors[2]) );

    return true;
}

/**
 * Changing blending mode for sprites objects
 */
bool SpriteObject::ActBlendMode( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    int blendModeRequested = static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    if ( blendModeRequested == 0 ) SetBlendMode(sf::Blend::Alpha);
    else if ( blendModeRequested == 1 ) SetBlendMode(sf::Blend::Add);
    else if ( blendModeRequested == 2 ) SetBlendMode(sf::Blend::Multiply);
    else if ( blendModeRequested == 3 ) SetBlendMode(sf::Blend::None);

    return true;
}

/**
 * Flip a sprite object on X axis
 */
bool SpriteObject::ActFlipX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    isFlippedX = action.GetParameter( 1 ).GetAsBool();

    return true;
}

/**
 * Flip a sprite object on X axis
 */
bool SpriteObject::ActFlipY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    isFlippedY = action.GetParameter( 1 ).GetAsBool();

    return true;
}

/**
 * Copy the image of the current image of a Sprite object, and only this object.
 */
bool SpriteObject::ActCopyImageOnImageOfSprite( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    ptrToCurrentSprite->MakeSpriteOwnsItsImage(); //We want to modify only the image of the object, not all objects which have the same image.
    sf::Image & dest = ptrToCurrentSprite->GetSpriteOwnImage();

    //Make sure the coordinates are correct.
    int destX = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    if ( destX < 0 || static_cast<unsigned>(destX) >= dest.GetWidth()) return false;

    int destY = action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    if ( destY < 0 || static_cast<unsigned>(destY) >= dest.GetWidth()) return false;

    bool applyAlpha = false;
    if ( action.GetParameters().size() > 4 )
    {
        applyAlpha = action.GetParameter(4).GetAsBool();
    }

    dest.Copy(scene.game->imageManager.GetImage(action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this())),
              destX, destY, sf::IntRect(0, 0, 0, 0), applyAlpha);

    return true;
}

bool SpriteObject::ActCreateMaskFromColorOnActualImage( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    ptrToCurrentSprite->MakeSpriteOwnsItsImage(); //We want to modify only the image of the object, not all objects which have the same image.
    sf::Image & dest = ptrToCurrentSprite->GetSpriteOwnImage();

    vector < string > colors = SpliterStringToVector <string> (action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    dest.CreateMaskFromColor(  sf::Color( ToInt(colors[0]), ToInt(colors[1]), ToInt(colors[2])));

    return true;
}
