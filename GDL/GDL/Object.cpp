/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Object.h"
#include <iostream>
#include <string>
#include <vector>
#include <string>
#include <list>
#include <sstream>
#include <boost/shared_ptr.hpp>
#include "GDL/Log.h"
#include "GDL/Force.h"
#include "GDL/CommonTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Automatism.h"

using namespace std;

Object::Object(string name_) :
        name( name_ ),
        X( 0 ),
        Y( 0 ),
        zOrder( 0 ),
        hidden( false )
{
    this->ClearForce();
}

Object::~Object()
{
    //C++ is like hell sometimes, his implementation at last.
    //Implementing the, empty, destructor here prevent compiler to say that there is
    //an undefined reference to "vtable of Object".
}

void Object::Init(const Object & object)
{
    Forces = object.Forces;
    Force5 = object.Force5;
    variablesObjet = object.variablesObjet;

    name = object.name;
    type = object.type;

    X = object.X;
    Y = object.Y;
    zOrder = object.zOrder;
    hidden = object.hidden;
    layer = object.layer;

    automatisms.clear();
    for (std::map<std::string, boost::shared_ptr<Automatism> >::const_iterator it = object.automatisms.begin() ; it != object.automatisms.end(); ++it )
    {
    	automatisms[it->first] = it->second->Clone();
    	automatisms[it->first]->SetOwner(this);
    }
}

////////////////////////////////////////////////////////////
/// Met les forces à zéro
//NE PAS EFFACER CETTE FONCTION APPARAMMENT INUTILE,
//VOIR PLUS LOIN
////////////////////////////////////////////////////////////
bool Object::ClearForce()
{
    Force ForceVide;
    ForceVide.SetX(0);
    ForceVide.SetY(0);
    ForceVide.SetAngle(0);
    ForceVide.SetLength(0);
    ForceVide.SetClearing(0);

    Force5 = ForceVide;

    //NE PAS EFFACER CETTE FONCTION APPARAMMENT INUTILE,
    //TANT QUE CECI N'AURA PAS ETE ENLEVE :
    for ( unsigned int i = 0; i < Forces.size();i++ )
        Forces[i] = ForceVide;

    return true;
}


struct NullForce
{
    bool operator ()( const Force &A ) const
    {
        return A.GetLength() == 0;
    }
};

////////////////////////////////////////////////////////////
/// Met à jour les forces en fonction de leur diffusion
////////////////////////////////////////////////////////////
bool Object::UpdateForce( float ElapsedTime )
{
    Force5.SetLength( Force5.GetLength() - Force5.GetLength() * ( 1 - Force5.GetClearing() ) * ElapsedTime );
    if ( Force5.GetClearing() == 0 ) Force5.SetLength(0);

    for ( unsigned int i = 0; i < Forces.size();i++ )
    {
        Forces[i].SetLength( Forces[i].GetLength() - Forces[i].GetLength() * ( 1 - Forces[i].GetClearing() ) * ElapsedTime );
        if ( Forces[i].GetClearing() == 0 ) {Forces[i].SetLength(0); }
    }

    Forces.erase( std::remove_if( Forces.begin(), Forces.end(), NullForce() ), Forces.end() );

    return true;
}
////////////////////////////////////////////////////////////
/// Donne le total des forces en X
////////////////////////////////////////////////////////////
float Object::TotalForceX() const
{
    float ForceXsimple = 0;
    for ( unsigned int i = 0; i < Forces.size();i++ )
        ForceXsimple += Forces[i].GetX();

    return ForceXsimple + Force5.GetX();
}

////////////////////////////////////////////////////////////
/// Donne le total des forces en Y
////////////////////////////////////////////////////////////
float Object::TotalForceY() const
{
    float ForceYsimple = 0;
    for ( unsigned int i = 0; i < Forces.size();i++ )
        ForceYsimple += Forces[i].GetY();

    return ForceYsimple + Force5.GetY();
}

////////////////////////////////////////////////////////////
/// Donne l'angle moyen des force
////////////////////////////////////////////////////////////
float Object::TotalForceAngle() const
{
    Force ForceMoyenne;
    ForceMoyenne.SetX( TotalForceX() );
    ForceMoyenne.SetY( TotalForceY() );

    return ForceMoyenne.GetAngle();
}

////////////////////////////////////////////////////////////
/// Donne l'angle moyen des force
////////////////////////////////////////////////////////////
float Object::TotalForceLength() const
{
    Force ForceMoyenne;
    ForceMoyenne.SetX( TotalForceX() );
    ForceMoyenne.SetY( TotalForceY() );

    return ForceMoyenne.GetLength();
}

void Object::DoAutomatismsPreEvents(RuntimeScene & scene)
{
    for (std::map<std::string, boost::shared_ptr<Automatism> >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
        it->second->StepPreEvents(scene);
}

void Object::DoAutomatismsPostEvents(RuntimeScene & scene)
{
    for (std::map<std::string, boost::shared_ptr<Automatism> >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
        it->second->StepPostEvents(scene);
}

std::vector < std::string > Object::GetAllAutomatismNames()
{
    std::vector < std::string > allNameIdentifiers;

    for (std::map<std::string, boost::shared_ptr<Automatism> >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
    	allNameIdentifiers.push_back(it->first);

    return allNameIdentifiers;
}

void Object::AddAutomatism(boost::shared_ptr<Automatism> automatism)
{
    automatisms[automatism->GetName()] = automatism;
    automatisms[automatism->GetName()]->SetOwner(this);
}
#if defined(GD_IDE_ONLY)
void Object::RemoveAutomatism(const std::string & name)
{
    automatisms.erase(name);
}
#endif

double Object::GetVariableValue( const std::string & variable )
{
    return variablesObjet.GetVariableValue(variable);
}

const std::string & Object::GetVariableString( const std::string & variable )
{
    return variablesObjet.GetVariableString(variable);
}

#if defined(GD_IDE_ONLY)
void Object::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Position");      value = ToString(GetX())+";"+ToString(GetY());}
    else if ( propertyNb == 1 ) {name = _("Angle");         value = ToString(GetAngle())+"°";}
    else if ( propertyNb == 2 ) {name = _("Taille");        value = ToString(GetWidth())+";"+ToString(GetHeight());}
    else if ( propertyNb == 3 ) {name = _("Visibilité");    value = hidden ? _("Masqué") : _("Affiché");}
    else if ( propertyNb == 4 ) {name = _("Calque");        value = layer;}
    else if ( propertyNb == 5 ) {name = _("Plan");          value = ToString(zOrder);}
    else if ( propertyNb == 6 ) {name = _("Vitesse");       value = ToString(TotalForceLength());}
    else if ( propertyNb == 7 ) {name = _("Angle de déplacement"); value = ToString(TotalForceAngle());}
    else if ( propertyNb == 8 ) {name = _("Déplacement en X");     value = ToString(TotalForceX());}
    else if ( propertyNb == 9 ) {name = _("Déplacement en Y"); value = ToString(TotalForceY());}
}

bool Object::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if ( propertyNb == 0 )
    {
        size_t separationPos = newValue.find(";");

        if ( separationPos > newValue.length())
            return false;

        string xValue = newValue.substr(0, separationPos);
        string yValue = newValue.substr(separationPos+1, newValue.length());

        SetX(ToFloat(xValue));
        SetY(ToFloat(yValue));
    }
    else if ( propertyNb == 1 ) {return SetAngle(ToFloat(newValue));}
    else if ( propertyNb == 2 ) {return false;}
    else if ( propertyNb == 3 )
    {
        if ( newValue == _("Masqué") )
        {
            SetHidden();
        }
        else
            SetHidden(false);
    }
    else if ( propertyNb == 4 ) { layer = newValue; }
    else if ( propertyNb == 5 ) {SetZOrder(ToInt(newValue));}
    else if ( propertyNb == 6 ) {return false;}
    else if ( propertyNb == 7 ) {return false;}
    else if ( propertyNb == 8 ) {return false;}
    else if ( propertyNb == 9 ) {return false;}

    return true;
}

unsigned int Object::GetNumberOfProperties() const
{
    //Be careful, properties start at 0.
    return 10;
}
#endif

void Object::PutAroundAPosition( float positionX, float positionY, float distance, float angleInDegrees )
{
    double angle = angleInDegrees/180.0f*3.14159;

    SetX( positionX + cos(angle)*distance - GetCenterX() );
    SetY( positionY + sin(angle)*distance - GetCenterY() );
}

void Object::AddForce( float x, float y, float clearing )
{
    Force forceToAdd;
    forceToAdd.SetX( x ); forceToAdd.SetY( y ); forceToAdd.SetClearing( clearing );
    Forces.push_back( forceToAdd );
}

void Object::AddForceUsingPolarCoordinates( float angle, float length, float clearing )
{
    Force forceToAdd;
    forceToAdd.SetAngle( angle );
    forceToAdd.SetLength( length );
    forceToAdd.SetClearing( clearing );
    Forces.push_back( forceToAdd );
}

/**
 * Add a force toward a position
 */
void Object::AddForceTowardPosition( float positionX, float positionY, float length, float clearing )
{
    Force forceToAdd;
    forceToAdd.SetLength( length );
    forceToAdd.SetClearing( clearing );

	//Workaround Visual C++ internal error (!) by using temporary doubles.
	double y = positionY - (GetDrawableY()+GetCenterY());
	double x = positionX - (GetDrawableX()+GetCenterX());
    forceToAdd.SetAngle( atan2(y,x) * 180 / 3.14159 );

    Forces.push_back( forceToAdd );
}


void Object::AddForceToMoveAround( float positionX, float positionY, float angularVelocity, float distance, float clearing )
{
    //Angle en degré entre les deux objets

	//Workaround Visual C++ internal error (!) by using temporary doubles.
	double y = ( GetDrawableY() + GetCenterY()) - positionY;
	double x = ( GetDrawableX() + GetCenterX() ) - positionX;
    float angle = atan2(y,x) * 180 / 3.14159f;
    float newangle = angle + angularVelocity;

    //position actuelle de l'objet 1 par rapport à l'objet centre
    int oldX = ( GetDrawableX() + GetCenterX() ) - positionX;
    int oldY = ( GetDrawableY() + GetCenterY() ) - positionY;

    //nouvelle position à atteindre
    int newX = cos(newangle/180.f*3.14159f) * distance;
    int newY = sin(newangle/180.f*3.14159f) * distance;

    Force forceToAdd;
    forceToAdd.SetX( newX-oldX );
    forceToAdd.SetY( newY-oldY );
    forceToAdd.SetClearing( clearing );

    Forces.push_back( forceToAdd );
}

void Object::Duplicate(RuntimeScene & scene, std::vector<Object*> & concernedObjects)
{
    ObjSPtr newObject = Clone();

    scene.objectsInstances.AddObject(newObject);

    if ( std::find(concernedObjects.begin(), concernedObjects.end(), newObject.get()) == concernedObjects.end() )
        concernedObjects.push_back(newObject.get()); //Object is concerned for future actions
}

bool Object::IsStopped()
{
    return TotalForceLength() == 0;
}

bool Object::TestAngleOfDisplacement(float angle, float tolerance)
{
    if ( TotalForceLength() == 0) return false;

    float objectAngle = TotalForceAngle();

    //Compute difference between two angles
    float diff = objectAngle - angle;
    while ( diff>180 )
		diff -= 360;
	while ( diff<-180 )
		diff += 360;

    if ( fabs(diff) <= tolerance/2 )
        return true;

    return false;
}

void Object::ActivateAutomatism( const std::string & automatismName, bool activate )
{
    GetAutomatism(automatismName)->Activate(activate);
}

bool Object::AutomatismActivated( const std::string & automatismName )
{
    return GetAutomatism(automatismName)->Activated();
}

double Object::GetSqDistanceWithObject( const std::string &, Object * object )
{
    if ( object == NULL ) return 0;

    float x = GetDrawableX()+GetCenterX() - (object->GetDrawableX()+object->GetCenterX());
    float y = GetDrawableY()+GetCenterY() - (object->GetDrawableY()+object->GetCenterY());

    return x*x+y*y; // No square root here
}

double Object::GetDistanceWithObject( const std::string & unused, Object * other )
{
    return sqrt(GetSqDistanceWithObject(unused, other));
}

void Object::SeparateObjectsWithoutForces( const string & , std::map <std::string, std::vector<Object*> *> pickedObjectLists)
{
    std::vector<Object*> objects2;
    std::map <std::string, std::vector<Object*> *>::const_iterator it = pickedObjectLists.begin();
    for (;it!=pickedObjectLists.end();++it)
    {
        if ( it->second == NULL ) break;

        std::vector<Object*> & list = *(it->second);
        for (unsigned int i = 0;i<list.size();++i) objects2.push_back(list[i]);
    }

    for (unsigned int j = 0;j<objects2.size(); ++j)
    {
        if ( objects2[j] != this )
        {
            float Left1 = GetDrawableX();
            float Left2 = objects2[j]->GetDrawableX();
            float Right1 = GetDrawableX() + GetWidth();
            float Right2 = objects2[j]->GetDrawableX() + objects2[j]->GetWidth();
            float Top1 = GetDrawableY();
            float Top2 = objects2[j]->GetDrawableY();
            float Bottom1 = GetDrawableY() + GetHeight();
            float Bottom2 = objects2[j]->GetDrawableY() + objects2[j]->GetHeight();

            if ( Left1 < Left2 )
            {
                SetX( Left2 - GetWidth() );
            }
            else if ( Right1 > Right2 )
            {
                SetX( Right2 );
            }

            if ( Top1 < Top2 )
            {
                SetY( Top2 - GetHeight() );
            }
            else if ( Bottom1 > Bottom2 )
            {
                SetY( Bottom2 );
            }
        }
    }
}

void Object::SeparateObjectsWithForces( const string & , std::map <std::string, std::vector<Object*> *> pickedObjectLists)
{
    std::vector<Object*> objects2;
    std::map <std::string, std::vector<Object*> *>::const_iterator it = pickedObjectLists.begin();
    for (;it!=pickedObjectLists.end();++it)
    {
        if ( it->second == NULL ) break;

        std::vector<Object*> & list = *(it->second);
        for (unsigned int i = 0;i<list.size();++i) objects2.push_back(list[i]);
    }

    for (unsigned int j = 0;j<objects2.size(); ++j)
    {
        if ( objects2[j] != this )
        {
            float Xobj1 = GetDrawableX()+(GetCenterX()) ;
            float Yobj1 = GetDrawableY()+(GetCenterY()) ;
            float Xobj2 = objects2[j]->GetDrawableX()+(objects2[j]->GetCenterX()) ;
            float Yobj2 = objects2[j]->GetDrawableY()+(objects2[j]->GetCenterY()) ;

            if ( Xobj1 < Xobj2 )
            {
                if ( Force5.GetX() == 0 )
                    Force5.SetX( -( TotalForceX() ) - 10 );
            }
            else
            {
                if ( Force5.GetX() == 0 )
                    Force5.SetX( -( TotalForceX() ) + 10 );
            }

            if ( Yobj1 < Yobj2 )
            {
                if ( Force5.GetY() == 0 )
                    Force5.SetY( -( TotalForceY() ) - 10 );
            }
            else
            {
                if ( Force5.GetY() == 0 )
                    Force5.SetY( -( TotalForceY() ) + 10 );
            }
        }
    }
}

void Object::AddForceTowardObject(string , float length, float clearing, Object * object )
{
    if ( object == NULL ) return;

    Force forceToAdd;
    forceToAdd.SetLength( length );
    forceToAdd.SetClearing( clearing );
    forceToAdd.SetAngle( atan2(( object->GetDrawableY() + object->GetCenterY() ) - ( GetDrawableY() + GetCenterY() ),
                             ( object->GetDrawableX() + object->GetCenterX() ) - ( GetDrawableX() + GetCenterX() ) )
                             * 180 / 3.14159 );

    Forces.push_back( forceToAdd );
}

void Object::AddForceToMoveAroundObject( string , float velocity, float length, float clearing, Object * object )
{
    if ( object == NULL ) return;

    //Angle en degré entre les deux objets
    float angle = atan2(( GetDrawableY() + GetCenterY()) - ( object->GetDrawableY() + object->GetCenterY() ),
                        ( GetDrawableX() + GetCenterX() ) - ( object->GetDrawableX() + object->GetCenterX() ) )
                         * 180 / 3.14159f;
    float newangle = angle + velocity;

    //position actuelle de l'objet 1 par rapport à l'objet centre
    int oldX = ( GetDrawableX() + GetCenterX() ) - ( object->GetDrawableX() + object->GetCenterX() );
    int oldY = ( GetDrawableY() + GetCenterY()) - ( object->GetDrawableY() + object->GetCenterY());

    //nouvelle position à atteindre
    int newX = cos(newangle/180.f*3.14159f) * length;
    int newY = sin(newangle/180.f*3.14159f) * length;

    Force forceToAdd;
    forceToAdd.SetX( newX-oldX );
    forceToAdd.SetY( newY-oldY );
    forceToAdd.SetClearing( clearing );

    Forces.push_back( forceToAdd );
}

void Object::PutAroundObject( string , float length, float angleInDegrees, Object * object )
{
    if ( object == NULL ) return;

    double angle = angleInDegrees/180*3.14159;

    SetX( object->GetDrawableX()+object->GetCenterX() + cos(angle)*length- GetCenterX() );
    SetY( object->GetDrawableY()+object->GetCenterY() + sin(angle)*length - GetCenterY() );
}


void Object::SetXY( float xValue, const char* xOperator, float yValue, const char* yOperator )
{
    if ( strcmp(xOperator, "") == 0 || strcmp(xOperator, "=") == 0)
        SetX( xValue );
    else if ( strcmp(xOperator, "+") == 0 )
        SetX( GetX() + xValue );
    else if ( strcmp(xOperator, "-") == 0 )
        SetX( GetX() - xValue );
    else if ( strcmp(xOperator, "*") == 0 )
        SetX( GetX() * xValue );
    else if ( strcmp(xOperator, "/") == 0 )
        SetX( GetX() / xValue );

    if ( strcmp(yOperator, "") == 0 || strcmp(yOperator, "=") == 0)
        SetY( yValue );
    else if ( strcmp(yOperator, "+") == 0 )
        SetY( GetY() + yValue );
    else if ( strcmp(yOperator, "-") == 0 )
        SetY( GetY() - yValue );
    else if ( strcmp(yOperator, "*") == 0 )
        SetY( GetY() * yValue );
    else if ( strcmp(yOperator, "/") == 0 )
        SetY( GetY() / yValue );
}

bool GD_API MustBeDeleted ( boost::shared_ptr<Object> object )
{
    return object->GetName().empty();
}

Automatism* Object::GetAutomatismRawPointer(const std::string & name)
{
    return automatisms.find(name)->second.get();
}

Automatism* Object::GetAutomatismRawPointer(const std::string & name) const
{
    return automatisms.find(name)->second.get();
}

void DestroyBaseObject(Object * object)
{
    delete object;
}

Object * CreateBaseObject(std::string name)
{
    return new Object(name);
}
