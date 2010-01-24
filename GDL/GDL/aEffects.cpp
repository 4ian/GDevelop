#include "GDL/aEffects.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/SpriteObject.h"

/**
 * Change the color filter of a sprite
 */
bool SpriteObject::ActChangeColor( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    vector < GDExpression > colors = SpliterStringToVector <GDExpression> (eval.EvalTxt(action.GetParameter(1), shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    SetColor(  eval.EvalExp( colors[0] ),
               eval.EvalExp( colors[1] ),
               eval.EvalExp( colors[2] ));

    return true;
}

/**
 * Copy the image of the current image of a Sprite object, and only this object.
 */
bool SpriteObject::ActCopyImageOnImageOfSprite( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    currentSprite->MakeSpriteOwnsItsImage(); //We want to modify only the image of the object, not all objects which have the same image.
    sf::Image & dest = currentSprite->GetSpriteOwnImage();

    std::map < string, sf::Image >::const_iterator src = scene->game->imageManager.images.find(eval.EvalTxt(action.GetParameter(1), shared_from_this()));
    if ( src == scene->game->imageManager.images.end() ) return false;

    //Make sure the coordinates are correct.
    int destX = eval.EvalExp(action.GetParameter(2), shared_from_this());
    if ( destX < 0 || static_cast<unsigned>(destX) >= dest.GetWidth()) return false;

    int destY = eval.EvalExp(action.GetParameter(3), shared_from_this());
    if ( destY < 0 || static_cast<unsigned>(destY) >= dest.GetWidth()) return false;

    dest.Copy(src->second, destX, destY);

    return true;
}
