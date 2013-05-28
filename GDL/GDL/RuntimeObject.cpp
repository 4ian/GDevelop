/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <cstring>
#include "GDL/RuntimeObject.h"
#include "GDL/Object.h"
#include "GDL/Automatism.h"
#include "GDL/CommonTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/PolygonCollision.h"
#include "GDL/Polygon.h"
#include <SFML/System.hpp>
#if defined(GD_IDE_ONLY)
#include <wx/intl.h>
#endif

using namespace std;

RuntimeObject::RuntimeObject(RuntimeScene & scene, const gd::Object & object) :
    name(object.GetName()),
    type(object.GetType()),
    X(0),
    Y(0),
    zOrder(0),
    hidden(false),
    objectVariables(object.GetVariables())
{
    ClearForce();

    //Do not forget to delete automatisms which are managed using raw pointers.
    for (std::map<std::string, Automatism* >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
    	delete it->second;

    automatisms.clear();

    //And insert the new ones.
    for (std::map<std::string, Automatism* >::const_iterator it = object.GetAllAutomatisms().begin() ; it != object.GetAllAutomatisms().end(); ++it )
    {
    	automatisms[it->first] = it->second->Clone();
    	automatisms[it->first]->SetOwner(this);
    }
}

RuntimeObject::~RuntimeObject()
{
    //Do not forget to delete automatisms and forces which are managed using raw pointers.
    for (std::map<std::string, Automatism* >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
    	delete it->second;
}

void RuntimeObject::Init(const RuntimeObject & object)
{
    name = object.name;
    type = object.type;
    objectVariables = object.objectVariables;

    X = object.X;
    Y = object.Y;
    zOrder = object.zOrder;
    hidden = object.hidden;
    layer = object.layer;
    force5 = object.force5;
    forces = object.forces;

    //Do not forget to delete automatisms which are managed using raw pointers.
    for (std::map<std::string, Automatism* >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
    	delete it->second;

    automatisms.clear();
    for (std::map<std::string, Automatism* >::const_iterator it = object.automatisms.begin() ; it != object.automatisms.end(); ++it )
    {
    	automatisms[it->first] = it->second->Clone();
    	automatisms[it->first]->SetOwner(this);
    }
}

#if defined(GD_IDE_ONLY)
void RuntimeObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Position");      value = ToString(GetX())+";"+ToString(GetY());}
    else if ( propertyNb == 1 ) {name = _("Angle");         value = ToString(GetAngle())+"°";}
    else if ( propertyNb == 2 ) {name = _("Size");        value = ToString(GetWidth())+";"+ToString(GetHeight());}
    else if ( propertyNb == 3 ) {name = _("Visibility");    value = hidden ? _("Hidden") : _("Displayed");}
    else if ( propertyNb == 4 ) {name = _("Layer");        value = layer;}
    else if ( propertyNb == 5 ) {name = _("Z order");          value = ToString(zOrder);}
    else if ( propertyNb == 6 ) {name = _("Speed");       value = ToString(TotalForceLength());}
    else if ( propertyNb == 7 ) {name = _("Angle of moving"); value = ToString(TotalForceAngle());}
    else if ( propertyNb == 8 ) {name = _("X coordinate of moving");     value = ToString(TotalForceX());}
    else if ( propertyNb == 9 ) {name = _("Y coordinate of moving"); value = ToString(TotalForceY());}
}

bool RuntimeObject::ChangeProperty(unsigned int propertyNb, string newValue)
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
        if ( newValue == _("Hidden") )
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

unsigned int RuntimeObject::GetNumberOfProperties() const
{
    //Be careful, properties start at 0.
    return 10;
}
#endif

void RuntimeObject::DeleteFromScene(RuntimeScene & scene)
{
    name = "";

    //Notify scene that object's name has changed.
    scene.objectsInstances.ObjectNameHasChanged(this);
}

void RuntimeObject::PutAroundAPosition( float positionX, float positionY, float distance, float angleInDegrees )
{
    double angle = angleInDegrees/180.0f*3.14159;

    SetX( positionX + cos(angle)*distance - GetCenterX() );
    SetY( positionY + sin(angle)*distance - GetCenterY() );
}

void RuntimeObject::AddForce( float x, float y, float clearing )
{
    forces.push_back( Force(x,y, clearing) );
}

void RuntimeObject::AddForceUsingPolarCoordinates( float angle, float length, float clearing )
{
    angle *= 3.14159/180.0;
    forces.push_back( Force(cos(angle)*length,sin(angle)*length, clearing) );
}
/**
 * Add a force toward a position
 */
void RuntimeObject::AddForceTowardPosition( float positionX, float positionY, float length, float clearing )
{
	//Workaround Visual C++ internal error (!) by using temporary doubles.
	double y = positionY - (GetDrawableY()+GetCenterY());
	double x = positionX - (GetDrawableX()+GetCenterX());
	float angle = atan2(y,x);

    forces.push_back( Force(cos(angle)*length, sin(angle)*length, clearing) );
}


void RuntimeObject::AddForceToMoveAround( float positionX, float positionY, float angularVelocity, float distance, float clearing )
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

    forces.push_back( Force(newX-oldX, newY-oldY, clearing) );
}

void RuntimeObject::Duplicate(RuntimeScene & scene, std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectLists)
{
    boost::shared_ptr<RuntimeObject> newObject = boost::shared_ptr<RuntimeObject>(Clone());

    scene.objectsInstances.AddObject(newObject);

    if ( pickedObjectLists[name] != NULL && find(pickedObjectLists[name]->begin(), pickedObjectLists[name]->end(), newObject.get()) == pickedObjectLists[name]->end() )
        pickedObjectLists[name]->push_back( newObject.get() );
}

bool RuntimeObject::IsStopped()
{
    return TotalForceLength() == 0;
}

bool RuntimeObject::TestAngleOfDisplacement(float angle, float tolerance)
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

void RuntimeObject::ActivateAutomatism( const std::string & automatismName, bool activate )
{
    GetAutomatismRawPointer(automatismName)->Activate(activate);
}

bool RuntimeObject::AutomatismActivated( const std::string & automatismName )
{
    return GetAutomatismRawPointer(automatismName)->Activated();
}

double RuntimeObject::GetSqDistanceWithObject( RuntimeObject * object )
{
    if ( object == NULL ) return 0;

    float x = GetDrawableX()+GetCenterX() - (object->GetDrawableX()+object->GetCenterX());
    float y = GetDrawableY()+GetCenterY() - (object->GetDrawableY()+object->GetCenterY());

    return x*x+y*y; // No square root here
}

double RuntimeObject::GetDistanceWithObject( RuntimeObject * other )
{
    return sqrt(GetSqDistanceWithObject(other));
}

void RuntimeObject::SeparateFromObjects(std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectLists)
{
    vector<RuntimeObject*> objects;
    for (std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = pickedObjectLists.begin();it!=pickedObjectLists.end();++it)
    {
        if ( it->second != NULL )
        {
            objects.reserve(objects.size()+it->second->size());
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects));
        }
    }

    sf::Vector2f moveVector;
    vector<Polygon2d> hitBoxes = GetHitBoxes();
    for (unsigned int j = 0;j<objects.size(); ++j)
    {
        if ( objects[j] != this )
        {
            vector<Polygon2d> otherHitBoxes = objects[j]->GetHitBoxes();
            for (unsigned int k = 0;k<hitBoxes.size();++k)
            {
                for (unsigned int l = 0;l<otherHitBoxes.size();++l)
                {
                    CollisionResult result = PolygonCollisionTest(hitBoxes[k], otherHitBoxes[l]);
                    if ( result.collision )
                    {
                        moveVector += result.move_axis;
                    }
                }
            }

        }
    }
    SetX(GetX()+moveVector.x);
    SetY(GetY()+moveVector.y);
}

void RuntimeObject::SeparateObjectsWithoutForces( std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectLists)
{
    vector<RuntimeObject*> objects2;
    for (std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = pickedObjectLists.begin();it!=pickedObjectLists.end();++it)
    {
        if ( it->second != NULL )
        {
            objects2.reserve(objects2.size()+it->second->size());
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects2));
        }
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

void RuntimeObject::SeparateObjectsWithForces( std::map <std::string, std::vector<RuntimeObject*> *> pickedObjectLists)
{
    vector<RuntimeObject*> objects2;
    for (std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = pickedObjectLists.begin();it!=pickedObjectLists.end();++it)
    {
        if ( it->second != NULL )
        {
            objects2.reserve(objects2.size()+it->second->size());
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects2));
        }
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
                if ( force5.GetX() == 0 )
                    force5.SetX( -( TotalForceX() ) - 10 );
            }
            else
            {
                if ( force5.GetX() == 0 )
                    force5.SetX( -( TotalForceX() ) + 10 );
            }

            if ( Yobj1 < Yobj2 )
            {
                if ( force5.GetY() == 0 )
                    force5.SetY( -( TotalForceY() ) - 10 );
            }
            else
            {
                if ( force5.GetY() == 0 )
                    force5.SetY( -( TotalForceY() ) + 10 );
            }
        }
    }
}

void RuntimeObject::AddForceTowardObject(RuntimeObject * object, float length, float clearing )
{
    if ( object == NULL ) return;

    AddForceTowardPosition(object->GetDrawableX() + object->GetCenterX(),
                           object->GetDrawableY() + object->GetCenterY(),
                           length, clearing);
}

void RuntimeObject::AddForceToMoveAroundObject( RuntimeObject * object, float velocity, float length, float clearing )
{
    if ( object == NULL ) return;

    AddForceToMoveAround(object->GetDrawableX() + object->GetCenterX(), object->GetDrawableY() + object->GetCenterY(),
                         velocity, length, clearing);
}

void RuntimeObject::PutAroundObject( RuntimeObject * object, float length, float angleInDegrees )
{
    if ( object == NULL ) return;

    double angle = angleInDegrees/180*3.14159;

    SetX( object->GetDrawableX()+object->GetCenterX() + cos(angle)*length- GetCenterX() );
    SetY( object->GetDrawableY()+object->GetCenterY() + sin(angle)*length - GetCenterY() );
}


void RuntimeObject::SetXY( const char* xOperator, float xValue, const char* yOperator, float yValue )
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

double RuntimeObject::GetVariableValue( const std::string & variable )
{
    return objectVariables.GetVariableValue(variable);
}

const std::string & RuntimeObject::GetVariableString( const std::string & variable )
{
    return objectVariables.GetVariableString(variable);
}

std::vector<Polygon2d> RuntimeObject::GetHitBoxes() const
{
    std::vector<Polygon2d> mask;
    Polygon2d rectangle = Polygon2d::CreateRectangle(GetWidth(), GetHeight());
    rectangle.Rotate(GetAngle()/180*3.14159);
    rectangle.Move(GetX()+GetCenterX(), GetY()+GetCenterY());

    mask.push_back(rectangle);
    return mask;
}

Automatism* RuntimeObject::GetAutomatismRawPointer(const std::string & name)
{
    return automatisms.find(name)->second;
}

Automatism* RuntimeObject::GetAutomatismRawPointer(const std::string & name) const
{
    return automatisms.find(name)->second;
}

bool RuntimeObject::ClearForce()
{
    force5.SetLength(0); //Clear the deprecated force
    force5.SetClearing(0);

    forces.clear();

    return true;
}

/**
 * \brief Internal functor testing if a force's length is 0.
 */
struct NullForce
{
    bool operator ()( const Force &A ) const
    {
        return A.GetLength() <= 0.001;
    }
};

bool RuntimeObject::UpdateForce( float elapsedTime )
{
    force5.SetLength( force5.GetLength() - force5.GetLength() * ( 1 - force5.GetClearing() ) * elapsedTime );
    if ( force5.GetClearing() == 0 ) force5.SetLength(0);

    for ( unsigned int i = 0; i < forces.size();)
    {
        if ( forces[i].GetClearing() == 0 || forces[i].GetLength() <= 0.001 )
            forces.erase(forces.begin()+i);
        else
        {
            forces[i].SetLength( forces[i].GetLength() - forces[i].GetLength() * ( 1 - forces[i].GetClearing() ) * elapsedTime );
            ++i;
        }

    }

    return true;
}

float RuntimeObject::TotalForceX() const
{
    float ForceXsimple = 0;
    for ( unsigned int i = 0; i < forces.size();i++ )
        ForceXsimple += forces[i].GetX();

    return ForceXsimple + force5.GetX();
}

float RuntimeObject::TotalForceY() const
{
    float ForceYsimple = 0;
    for ( unsigned int i = 0; i < forces.size();i++ )
        ForceYsimple += forces[i].GetY();

    return ForceYsimple + force5.GetY();
}

float RuntimeObject::TotalForceAngle() const
{
    Force ForceMoyenne;
    ForceMoyenne.SetX( TotalForceX() );
    ForceMoyenne.SetY( TotalForceY() );

    return ForceMoyenne.GetAngle();
}

float RuntimeObject::TotalForceLength() const
{
    Force ForceMoyenne;
    ForceMoyenne.SetX( TotalForceX() );
    ForceMoyenne.SetY( TotalForceY() );

    return ForceMoyenne.GetLength();
}

void RuntimeObject::DoAutomatismsPreEvents(RuntimeScene & scene)
{
    for (std::map<std::string, Automatism* >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
        it->second->StepPreEvents(scene);
}

void RuntimeObject::DoAutomatismsPostEvents(RuntimeScene & scene)
{
    for (std::map<std::string, Automatism* >::const_iterator it = automatisms.begin() ; it != automatisms.end(); ++it )
        it->second->StepPostEvents(scene);
}

void DestroyBaseRuntimeObject(RuntimeObject * object)
{
    delete object;
}

RuntimeObject * CreateBaseRuntimeObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeObject(scene, object);
}
