#include "ObjectTools.h"
#include "GDL/Object.h"
#include "GDL/RotatedRectangle.h"
#include "GDL/RotatedRectangleCollision.h"

using namespace std;

double GD_API PickedObjectsCount( string , vector<Object*> & pickedObjects )
{
    return pickedObjects.size();
}

bool GD_API HitBoxesCollision( string, string, vector<Object*> & objects1, vector<Object*> & objects2, bool conditionInverted )
{
    vector<Object*> newObject1list;
    vector<Object*> newObject2list;

    bool isTrue = false;

    //Test each object against each other objects
	for(unsigned int i = 0;i<objects1.size();++i)
    {
        bool AuMoinsUnObjet = false;
        for(unsigned int j = 0;j<objects2.size();++j)
        {
            if ( objects1[i] != objects2[j] )
            {
                bool collision = false;

                vector<RotatedRectangle> objHitboxes = objects1[i]->GetHitBoxes();
                vector<RotatedRectangle> obj2Hitboxes = objects2[j]->GetHitBoxes();
                for (unsigned int k = 0;k<objHitboxes.size();++k)
                {
                    for (unsigned int l = 0;l<obj2Hitboxes.size();++l)
                    {
                        if ( RotatedRectanglesCollisionTest(&objHitboxes[k], &obj2Hitboxes[l]) != 0 )
                            collision = true;
                    }

                    if ( collision ) break;
                }

                if ( collision )
                {
                    if ( !conditionInverted )
                    {
                        isTrue = true;
                        newObject1list.push_back( objects1[i] );
                        newObject2list.push_back( objects2[j] );
                    }
                    AuMoinsUnObjet = true;
                }
            }
        }
        //Si l'objet n'est en collision avec AUCUN autre objets
        if ( AuMoinsUnObjet == false && conditionInverted)
        {
            isTrue = true;
            newObject1list.push_back( objects1[i] );
        }
    }

    objects1 = newObject1list;
    objects2 = newObject2list;

    return isTrue;
}

float GD_API DistanceBetweenObjects( string, string, vector<Object*> & objects1, vector<Object*> & objects2, float length, string relationalOperator, bool conditionInverted)
{
    vector<Object*> newObject1list;
    vector<Object*> newObject2list;

    bool isTrue = false;

    //Test each object against each other objects
	for(unsigned int i = 0;i<objects1.size();++i)
    {
        for(unsigned int j = 0;j<objects2.size();++j)
        {
            if ( objects1[i] != objects2[j] )
            {
                float X = objects1[i]->GetDrawableX()+objects1[i]->GetCenterX() - (objects2[j]->GetDrawableX()+objects2[j]->GetCenterX());
                float Y = objects1[i]->GetDrawableY()+objects1[i]->GetCenterY() - (objects2[j]->GetDrawableY()+objects2[j]->GetCenterY());

                if (( relationalOperator == "=" && sqrt(X*X+Y*Y) == length ) ||
                        ( relationalOperator == "<" && sqrt(X*X+Y*Y) < length ) ||
                        ( relationalOperator == ">" && sqrt(X*X+Y*Y) > length ) ||
                        ( relationalOperator == "<=" && sqrt(X*X+Y*Y) <= length ) ||
                        ( relationalOperator == ">=" && sqrt(X*X+Y*Y) >= length ) ||
                        ( relationalOperator == "!=" && sqrt(X*X+Y*Y) != length )
                   )
                {
                    if ( !conditionInverted )
                    {
                        isTrue = true;
                        newObject1list.push_back( objects1[i] );
                        newObject2list.push_back( objects2[j] );
                    }
                }
                else
                {
                    if ( conditionInverted )
                    {
                        isTrue = true;
                        newObject1list.push_back( objects1[i] );
                        newObject2list.push_back( objects2[j] );
                    }
                }
            }
        }
    }

    objects1 = newObject1list;
    objects2 = newObject2list;

    return isTrue;
}

bool GD_API MovesToward( string, string, vector<Object*> & objects1, vector<Object*> & objects2, float tolerance, bool conditionInverted )
{
    vector<Object*> newObject1list;
    vector<Object*> newObject2list;

    bool isTrue = false;

    //Test each object against each other objects
	for(unsigned int i = 0;i<objects1.size();++i)
    {
        if ( objects1[i]->TotalForceLength() != 0 )
        {
            for(unsigned int j = 0;j<objects2.size();++j)
            {
                if ( objects1[i] != objects2[j] )
                {
                    Force force;
                    //Les comparaisons sont faites de centre à centre
                    force.SetX( ( objects2[j]->GetDrawableX() + objects2[j]->GetCenterX() ) - ( objects1[i]->GetDrawableX() + objects1[i]->GetCenterX() ) );
                    force.SetY( ( objects2[j]->GetDrawableY() + objects2[j]->GetCenterY() ) - ( objects1[i]->GetDrawableY() + objects1[i]->GetCenterY() ) );

                    float angle = force.GetAngle(); //On récupère l'angle entre les deux objets

                    float objectAngle = objects1[i]->TotalForceAngle();

                    //Compute difference between two angles
                    float diff = objectAngle - angle;
                    while ( diff>180 )
                        diff -= 360;
                    while ( diff<-180 )
                        diff += 360;

                    if ( fabs( diff ) <= tolerance / 2 )
                    {
                        if ( !conditionInverted )
                        {
                            isTrue = true;
                            newObject1list.push_back( objects1[i] ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                            newObject2list.push_back( objects2[j] ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                        }
                    }
                    else
                    {
                        if ( conditionInverted )
                        {
                            isTrue = true;
                            newObject1list.push_back( objects1[i] ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                            newObject2list.push_back( objects2[j] ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                        }
                    }
                }
            }
        }
        else
        {
            if ( conditionInverted )
            {
                isTrue = true;
                newObject1list.push_back( objects1[i] ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
            }
        }
    }

    objects1 = newObject1list;
    objects2 = newObject2list;

    return isTrue;
}

void GD_API AddForceTowardObject( string , string , float length, float clearing, vector<Object*> & objects1, vector<Object*> & objects2 )
{
    if ( objects2.empty() ) return;

    for (unsigned int i = 0;i<objects1.size();++i )
    {
        Force forceToAdd;
        forceToAdd.SetLength( length );
        forceToAdd.SetClearing( clearing );
        forceToAdd.SetAngle( atan2(( objects2[0]->GetDrawableY() + objects2[0]->GetCenterY() ) - ( objects1[i]->GetDrawableY() + objects1[i]->GetCenterY() ),
                                 ( objects2[0]->GetDrawableX() + objects2[0]->GetCenterX() ) - ( objects1[i]->GetDrawableX() + objects1[i]->GetCenterX() ) )
                                 * 180 / 3.14159 );

        objects1[i]->Forces.push_back( forceToAdd );
    }
}

void GD_API AddForceToMoveAround( string , string , float velocity, float length, float clearing, vector<Object*> & objects1, vector<Object*> & objects2 )
{
    if ( objects2.empty() ) return;

    for (unsigned int i = 0;i<objects1.size();++i )
    {
        //Angle en degré entre les deux objets
        float angle = atan2(( objects1[i]->GetDrawableY() + objects1[i]->GetCenterY()) - ( objects2[0]->GetDrawableY() + objects2[0]->GetCenterY() ),
                            ( objects1[i]->GetDrawableX() + objects1[i]->GetCenterX() ) - ( objects2[0]->GetDrawableX() + objects2[0]->GetCenterX() ) )
                             * 180 / 3.14159f;
        float newangle = angle + velocity;

        //position actuelle de l'objet 1 par rapport à l'objet centre
        int oldX = ( objects1[i]->GetDrawableX() + objects1[i]->GetCenterX() ) - ( objects2[0]->GetDrawableX() + objects2[0]->GetCenterX() );
        int oldY = ( objects1[i]->GetDrawableY() + objects1[i]->GetCenterY()) - ( objects2[0]->GetDrawableY() + objects2[0]->GetCenterY());

        //nouvelle position à atteindre
        int newX = cos(newangle/180.f*3.14159f) * length;
        int newY = sin(newangle/180.f*3.14159f) * length;

        Force forceToAdd;
        forceToAdd.SetX( newX-oldX );
        forceToAdd.SetY( newY-oldY );
        forceToAdd.SetClearing( clearing );

        objects1[i]->Forces.push_back( forceToAdd );
    }
}

void GD_API PutAround( string , string , float length, float angleInDegrees, vector<Object*> & objects1, vector<Object*> & objects2 )
{
    if ( objects2.empty() ) return;

    for (unsigned int i = 0;i<objects1.size();++i )
    {
        double angle = angleInDegrees/180*3.14159;

        objects1[i]->SetX( objects2[0]->GetDrawableX()+objects2[0]->GetCenterX()
                                               + cos(angle)*length
                                               - objects1[i]->GetCenterX() );

        objects1[i]->SetY( objects2[0]->GetDrawableY()+objects2[0]->GetCenterY()
                                               + sin(angle)*length
                                               - objects1[i]->GetCenterY() );
    }
}

void GD_API SeparateObjectsWithoutForces( string , string, vector<Object*> & objects1, vector<Object*> & objects2 )
{
    for (unsigned int i = 0;i<objects1.size();++i )
    {
        for (unsigned int j = 0;j<objects2.size(); ++j)
        {
            if ( objects2 != objects1 )
            {
                float Left1 = objects1[i]->GetDrawableX();
                float Left2 = objects2[j]->GetDrawableX();
                float Right1 = objects1[i]->GetDrawableX() + objects1[i]->GetWidth();
                float Right2 = objects2[j]->GetDrawableX() + objects2[j]->GetWidth();
                float Top1 = objects1[i]->GetDrawableY();
                float Top2 = objects2[j]->GetDrawableY();
                float Bottom1 = objects1[i]->GetDrawableY() + objects1[i]->GetHeight();
                float Bottom2 = objects2[j]->GetDrawableY() + objects2[j]->GetHeight();

                if (( Left1 < Left2 ) )
                {
                    objects1[i]->SetX( Left2 - objects1[i]->GetWidth() );
                }
                else if (( Right1 > Right2 ) )
                {
                    objects1[i]->SetX( Right2 );
                }

                if (( Top1 < Top2 ) )
                {
                    objects1[i]->SetY( Top2 - objects1[i]->GetHeight() );
                }
                else if ( Bottom1 > Bottom2 )
                {
                    objects1[i]->SetY( Bottom2 );
                }
            }
        }
    }
}

void GD_API SeparateObjectsWithForces( string , string, vector<Object*> & objects1, vector<Object*> & objects2 )
{
    for (unsigned int i = 0;i<objects1.size();++i )
    {
        for (unsigned int j = 0;j<objects2.size(); ++j)
        {
            if ( objects2 != objects1 )
            {
                float Xobj1 = objects1[i]->GetDrawableX()+(objects1[i]->GetCenterX()) ;
                float Yobj1 = objects1[i]->GetDrawableY()+(objects1[i]->GetCenterY()) ;
                float Xobj2 = objects2[j]->GetDrawableX()+(objects2[j]->GetCenterX()) ;
                float Yobj2 = objects2[j]->GetDrawableY()+(objects2[j]->GetCenterY()) ;

                if ( Xobj1 < Xobj2 )
                {
                    if ( objects1[i]->Force5.GetX() == 0 )
                        objects1[i]->Force5.SetX( -( objects1[i]->TotalForceX() ) - 10 );
                }
                else
                {
                    if ( objects1[i]->Force5.GetX() == 0 )
                        objects1[i]->Force5.SetX( -( objects1[i]->TotalForceX() ) + 10 );
                }

                if ( Yobj1 < Yobj2 )
                {
                    if ( objects1[i]->Force5.GetY() == 0 )
                        objects1[i]->Force5.SetY( -( objects1[i]->TotalForceY() ) - 10 );
                }
                else
                {
                    if ( objects1[i]->Force5.GetY() == 0 )
                        objects1[i]->Force5.SetY( -( objects1[i]->TotalForceY() ) + 10 );
                }
            }
        }
    }
}
