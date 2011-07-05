#include "SpriteTools.h"
#include <string>
#include <vector>
#include "GDL/SpriteObject.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Collisions.h"

bool GD_API SpriteTurnedToward( std::string, std::string, std::vector<Object*> & objects1, std::vector<Object*> & objects2, float tolerance, bool conditionInverted )
{
    vector<Object*> newObjects1list;
    vector<Object*> newObjects2list;
    bool isTrue = false;

    //Test each object against each other objects
	std::vector<Object*>::iterator obj = objects1.begin();
	std::vector<Object*>::const_iterator obj_end = objects1.end();
    for ( ; obj != obj_end; ++obj )
    {
        std::vector<Object*>::iterator obj2 = objects2.begin();
        std::vector<Object*>::const_iterator obj2_end = objects2.end();
        for (; obj2 != obj2_end; ++obj2 )
        {
            if ( *obj != *obj2 )
            {
                Force force;
                force.SetX( ( (*obj2)->GetDrawableX() + (*obj2)->GetCenterX() ) - ( (*obj)->GetDrawableX() + (*obj)->GetCenterX() ) );
                force.SetY( ( (*obj2)->GetDrawableY() + (*obj2)->GetCenterY() ) - ( (*obj)->GetDrawableY() + (*obj)->GetCenterY() ) );

                int angle = static_cast<int>(force.GetAngle()); //On récupère l'angle entre les deux objets

                int angleObjet = static_cast<SpriteObject*>(*obj)->GetAngle();

                angle = fmodf(angle, 360);
                if ( angle < 0 )
                    angle += 360;

                angleObjet = fmodf(angleObjet, 360);
                if ( angleObjet < 0 )
                    angleObjet += 360;

                float gap = fabs( static_cast<float>(angle - angleObjet) );
                gap = gap > 180 ? 360 - gap : gap;

                if ( gap < tolerance / 2 )
                {
                    if ( !conditionInverted )
                    {
                        isTrue = true;
                        newObjects1list.push_back( *obj );
                        newObjects2list.push_back( *obj2 );
                    }
                }
                else
                {
                    if ( conditionInverted )
                    {
                        isTrue = true;
                        newObjects1list.push_back( *obj );
                        newObjects2list.push_back( *obj2 );
                    }
                }
            }
        }
    }

    objects1 = newObjects1list;
    objects2 = newObjects2list;
    return isTrue;
}

/**
 * Test a collision between two sprites objects
 */
bool GD_API SpriteCollision( std::string, std::string, std::vector<Object*> & objects1, std::vector<Object*> & objects2, bool conditionInverted )
{
    vector<Object*> newObjects1list;
    vector<Object*> newObjects2list;
    bool isTrue = false;

	std::vector<Object*>::const_iterator obj_end = objects1.end();
	std::vector<Object*>::const_iterator obj2_end = objects2.end();

    //On teste la collision entre chaque objets
    for ( std::vector<Object*>::const_iterator obj = objects1.begin(); obj != obj_end; ++obj )
    {
        for (std::vector<Object*>::const_iterator obj2 = objects2.begin(); obj2 != obj2_end; ++obj2 )
        {
            //On vérifie que ce n'est pas le même objet
            if ( *obj != *obj2 &&
                CheckCollision( static_cast<SpriteObject*>(*obj), static_cast<SpriteObject*>(*obj2) ) ^ conditionInverted )
            {
                newObjects1list.push_back( *obj );
                newObjects2list.push_back( *obj2 );
                isTrue = true;
            }
        }
    }

    objects1 = newObjects1list;
    objects2 = newObjects2list;

    return isTrue;
}

void GD_API TurnSpriteToward( std::string, std::string, std::vector<Object*> & objects1, std::vector<Object*> & objects2 )
{
    if (objects2.empty()) return;
    Object* obj2 = objects2[0];

	std::vector<Object*>::iterator obj = objects1.begin();
	std::vector<Object*>::const_iterator obj_end = objects1.end();
    for ( ; obj != obj_end; ++obj )
    {
        //On se dirige vers le centre
        float angle = atan2(
        (obj2->GetDrawableY() + obj2->GetCenterY()) - ((*obj)->GetDrawableY()+(*obj)->GetCenterY()),
        (obj2->GetDrawableX() + obj2->GetCenterX()) - ((*obj)->GetDrawableX()+(*obj)->GetCenterX())
        ) * 180 / 3.14159;

        static_cast<SpriteObject*>(*obj)->SetAngle(angle);
    }
    return;
}


bool GD_API CursorOnSpriteObject( RuntimeScene & scene, std::string, std::vector<Object*> & objects, bool accurate, bool conditionInverted )
{
    vector<Object*> newObjectslist;

    bool isTrue = false;

    for (unsigned int layerIndex = 0;layerIndex < scene.layers.size();++layerIndex)
    {
        for (unsigned int cameraIndex = 0;cameraIndex < scene.layers[layerIndex].GetCamerasNumber();++cameraIndex)
        {
            int mouseXInTheLayer = scene.renderWindow->ConvertCoords(scene.input->GetMouseX(), scene.input->GetMouseY(), scene.layers[layerIndex].GetCamera(cameraIndex).GetSFMLView()).x;
            int mouseYInTheLayer = scene.renderWindow->ConvertCoords(scene.input->GetMouseX(), scene.input->GetMouseY(), scene.layers[layerIndex].GetCamera(cameraIndex).GetSFMLView()).y;

            std::vector<Object*>::iterator obj = objects.begin();
            std::vector<Object*>::const_iterator obj_end = objects.end();
            for ( ; obj != obj_end; ++obj )
            {
                if ( (*obj)->GetLayer() == scene.layers[layerIndex].GetName())
                {
                    if  ( (*obj)->GetDrawableX() < mouseXInTheLayer &&
                        ( (*obj)->GetDrawableX() + (*obj)->GetWidth() ) > mouseXInTheLayer &&
                          (*obj)->GetDrawableY() < mouseYInTheLayer &&
                        ( (*obj)->GetDrawableY() + (*obj)->GetHeight() ) > mouseYInTheLayer )
                    {
                        int ClicX = static_cast<int>( mouseXInTheLayer - (*obj)->GetDrawableX() );
                        int ClicY = static_cast<int>( mouseYInTheLayer - (*obj)->GetDrawableY() );

                        if ( !accurate || static_cast<SpriteObject*>(*obj)->GetCurrentSFMLSprite().GetPixel( ClicX , ClicY ).a != 0 )
                        {
                            if ( !conditionInverted )
                            {
                                isTrue = true;
                                newObjectslist.push_back( *obj );
                            }
                        }
                        else
                        {
                            if ( conditionInverted )
                            {
                                isTrue = true;
                                newObjectslist.push_back( *obj );
                            }
                        }
                    }
                    else
                    {
                        if ( conditionInverted )
                        {
                            isTrue = true;
                            newObjectslist.push_back( *obj );
                        }
                    }
                }
            }
        }
    }

    objects = newObjectslist;

    return isTrue;
}
