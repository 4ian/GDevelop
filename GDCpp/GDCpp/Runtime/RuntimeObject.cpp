/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <cstring>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Extensions/Builtin/MathematicalTools.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/Project/Behavior.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/PolygonCollision.h"
#include "GDCpp/Runtime/Polygon2d.h"
#include "GDCore/CommonTools.h"
#include <SFML/System.hpp>
#include <iostream>

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

    behaviors.clear();
    //Insert the new behaviors.
    for (auto it = object.GetAllBehaviors().cbegin() ; it != object.GetAllBehaviors().cend(); ++it )
    {
    	behaviors[it->first] = std::unique_ptr<gd::Behavior>(it->second->Clone());
    	behaviors[it->first]->SetOwner(this);
    }
}

RuntimeObject::~RuntimeObject()
{

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

    behaviors.clear();
    for (auto it = object.behaviors.cbegin() ; it != object.behaviors.cend(); ++it )
    {
    	behaviors[it->first] = std::unique_ptr<gd::Behavior>(it->second->Clone());
    	behaviors[it->first]->SetOwner(this);
    }
}

#if defined(GD_IDE_ONLY)
void RuntimeObject::GetPropertyForDebugger(std::size_t propertyNb, gd::String & name, gd::String & value) const
{
    if      ( propertyNb == 0 ) {name = _("Position");      value = gd::String::From(GetX())+";"+gd::String::From(GetY());}
    else if ( propertyNb == 1 ) {name = _("Angle");         value = gd::String::From(GetAngle())+u8"°";}
    else if ( propertyNb == 2 ) {name = _("Size");        value = gd::String::From(GetWidth())+";"+gd::String::From(GetHeight());}
    else if ( propertyNb == 3 ) {name = _("Visibility");    value = hidden ? _("Hidden") : _("Displayed");}
    else if ( propertyNb == 4 ) {name = _("Layer");        value = layer;}
    else if ( propertyNb == 5 ) {name = _("Z order");          value = gd::String::From(zOrder);}
    else if ( propertyNb == 6 ) {name = _("Speed");       value = gd::String::From(TotalForceLength());}
    else if ( propertyNb == 7 ) {name = _("Angle of moving"); value = gd::String::From(TotalForceAngle());}
    else if ( propertyNb == 8 ) {name = _("X coordinate of moving");     value = gd::String::From(TotalForceX());}
    else if ( propertyNb == 9 ) {name = _("Y coordinate of moving"); value = gd::String::From(TotalForceY());}
}

bool RuntimeObject::ChangeProperty(std::size_t propertyNb, gd::String newValue)
{
    if ( propertyNb == 0 )
    {
        size_t separationPos = newValue.find(";");

        if ( separationPos > newValue.length())
            return false;

        gd::String xValue = newValue.substr(0, separationPos);
        gd::String yValue = newValue.substr(separationPos+1, newValue.length());

        SetX(xValue.To<float>());
        SetY(yValue.To<float>());
    }
    else if ( propertyNb == 1 ) {return SetAngle(newValue.To<float>());}
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
    else if ( propertyNb == 5 ) {SetZOrder(newValue.To<int>());}
    else if ( propertyNb == 6 ) {return false;}
    else if ( propertyNb == 7 ) {return false;}
    else if ( propertyNb == 8 ) {return false;}
    else if ( propertyNb == 9 ) {return false;}

    return true;
}

std::size_t RuntimeObject::GetNumberOfProperties() const
{
    //Be careful, properties start at 0.
    return 10;
}
#endif

signed long long RuntimeObject::GetElapsedTime(const RuntimeScene & scene) const
{
    const RuntimeLayer & theLayer = scene.GetRuntimeLayer(layer);
    return theLayer.GetElapsedTime(scene);
}

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

void RuntimeObject::Duplicate(RuntimeScene & scene, std::map <gd::String, std::vector<RuntimeObject*> *> pickedObjectLists)
{
    RuntimeObject * newObject = scene.objectsInstances.AddObject( std::unique_ptr<RuntimeObject>( Clone() ) );

    if ( pickedObjectLists[name] != NULL && find(pickedObjectLists[name]->begin(), pickedObjectLists[name]->end(), newObject) == pickedObjectLists[name]->end() )
        pickedObjectLists[name]->push_back( newObject );
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

void RuntimeObject::ActivateBehavior( const gd::String & behaviorName, bool activate )
{
    if(GetBehaviorRawPointer(behaviorName))
        GetBehaviorRawPointer(behaviorName)->Activate(activate);
}

bool RuntimeObject::BehaviorActivated( const gd::String & behaviorName )
{
    if(GetBehaviorRawPointer(behaviorName))
        return GetBehaviorRawPointer(behaviorName)->Activated();
    else
        return false;
}

double RuntimeObject::GetSqDistanceTo(double pointX, double pointY)
{
    double x = GetDrawableX()+GetCenterX() - pointX;
    double y = GetDrawableY()+GetCenterY() - pointY;

    return x*x+y*y;
}

double RuntimeObject::GetSqDistanceWithObject(RuntimeObject * object)
{
    if ( object == NULL ) return 0;

    return GetSqDistanceTo(
        object->GetDrawableX()+object->GetCenterX(),
        object->GetDrawableY()+object->GetCenterY());
}

double RuntimeObject::GetDistanceWithObject(RuntimeObject * object)
{
    return sqrt(GetSqDistanceWithObject(object));
}

bool RuntimeObject::SeparateFromObjects(std::map <gd::String, std::vector<RuntimeObject*> *> pickedObjectLists)
{
    vector<RuntimeObject*> objects;
    for (std::map <gd::String, std::vector<RuntimeObject*> *>::const_iterator it = pickedObjectLists.begin();it!=pickedObjectLists.end();++it)
    {
        if ( it->second != NULL )
        {
            objects.reserve(objects.size()+it->second->size());
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects));
        }
    }

    return SeparateFromObjects(objects);
}

bool RuntimeObject::SeparateFromObjects(const std::vector<RuntimeObject*> & objects)
{
    bool moved = false;
    sf::Vector2f moveVector;
    for (std::size_t j = 0;j<objects.size(); ++j)
    {
        if ( objects[j] != this )
        {
            std::vector<Polygon2d> hitBoxes = GetHitBoxes(objects[j]->GetAABB());
            vector<Polygon2d> otherHitBoxes = objects[j]->GetHitBoxes(GetAABB());
            for (std::size_t k = 0;k<hitBoxes.size();++k)
            {
                for (std::size_t l = 0;l<otherHitBoxes.size();++l)
                {
                    CollisionResult result = PolygonCollisionTest(hitBoxes[k], otherHitBoxes[l]);
                    if ( result.collision )
                    {
                        moveVector += result.move_axis;
                        moved = true;
                    }
                }
            }

        }
    }
    SetX(GetX()+moveVector.x);
    SetY(GetY()+moveVector.y);
    return moved;
}

void RuntimeObject::RotateTowardPosition(float Xposition, float Yposition, float speed, RuntimeScene & scene)
{
    //Work around for a Visual C++ internal compiler error (!)
    double y = Yposition - (GetDrawableY()+GetCenterY());
    double x = Xposition - (GetDrawableX()+GetCenterX());
    float angle = atan2(y,x) * 180.0 / gd::Pi();

    RotateTowardAngle(angle, speed, scene);
}

void RuntimeObject::RotateTowardAngle(float angleInDegrees, float speed, RuntimeScene & scene)
{
    if (speed == 0)
    {
        SetAngle(angleInDegrees);
        return;
    }

    float timeDelta = static_cast<double>(GetElapsedTime(scene)) / 1000000.0;
    float angularDiff = GDpriv::MathematicalTools::angleDifference(GetAngle(), angleInDegrees);
    bool diffWasPositive = angularDiff >= 0;

    float newAngle = GetAngle()+(diffWasPositive ? -1.0 : 1.0)*speed*timeDelta;
    if((GDpriv::MathematicalTools::angleDifference(newAngle, angleInDegrees) > 0) ^ diffWasPositive)
        newAngle = angleInDegrees;
    SetAngle(newAngle);

    if (GetAngle() != newAngle) //Objects like sprite in 8 directions does not handle small increments...
        SetAngle(angleInDegrees); //...so force them to be in the path angle anyway.
}

void RuntimeObject::Rotate(float speed, RuntimeScene & scene)
{
    float timeDelta = static_cast<double>(GetElapsedTime(scene)) / 1000000.0;
    SetAngle(GetAngle()+speed*timeDelta);
}

bool RuntimeObject::IsCollidingWith(RuntimeObject * obj2)
{
    //First check if bounding circle are too far.
    RuntimeObject * obj1 = this;
    float o1w = obj1->GetWidth();
    float o1h = obj1->GetHeight();
    float o2w = obj2->GetWidth();
    float o2h = obj2->GetHeight();

    float x = obj1->GetDrawableX()+obj1->GetCenterX()-(obj2->GetDrawableX()+obj2->GetCenterX());
    float y = obj1->GetDrawableY()+obj1->GetCenterY()-(obj2->GetDrawableY()+obj2->GetCenterY());
    float obj1BoundingRadius = sqrt(o1w*o1w+o1h*o1h)/2.0;
    float obj2BoundingRadius = sqrt(o2w*o2w+o2h*o2h)/2.0;

    if ( sqrt(x*x+y*y) > obj1BoundingRadius + obj2BoundingRadius )
        return false;

    //Do a real check if necessary.

    //Get the bounding rect of the two objects to use them
    //as a hint to get the other's hitboxes
    sf::FloatRect objRect = obj1->GetAABB();
    sf::FloatRect obj2Rect = obj2->GetAABB();

    vector<Polygon2d> objHitboxes = obj1->GetHitBoxes(obj2Rect);
    vector<Polygon2d> obj2Hitboxes = obj2->GetHitBoxes(objRect);
    for (std::size_t k = 0;k<objHitboxes.size();++k)
    {
        for (std::size_t l = 0;l<obj2Hitboxes.size();++l)
        {
            if ( PolygonCollisionTest(objHitboxes[k], obj2Hitboxes[l]).collision )
                return true;
        }
    }

    return false;
}

bool RuntimeObject::IsCollidingWithPoint(float pointX, float pointY){
    vector<Polygon2d> hitBoxes = GetHitBoxes();
    for (std::size_t i = 0; i < hitBoxes.size(); ++i)
    {
        if ( IsPointInsidePolygon(hitBoxes[i], pointX, pointY) )
            return true;
    }

    return false;
}

void RuntimeObject::SeparateObjectsWithoutForces( std::map <gd::String, std::vector<RuntimeObject*> *> pickedObjectLists)
{
    vector<RuntimeObject*> objects2;
    for (std::map <gd::String, std::vector<RuntimeObject*> *>::const_iterator it = pickedObjectLists.begin();it!=pickedObjectLists.end();++it)
    {
        if ( it->second != NULL )
        {
            objects2.reserve(objects2.size()+it->second->size());
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects2));
        }
    }

    for (std::size_t j = 0;j<objects2.size(); ++j)
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

void RuntimeObject::SeparateObjectsWithForces( std::map <gd::String, std::vector<RuntimeObject*> *> pickedObjectLists)
{
    vector<RuntimeObject*> objects2;
    for (std::map <gd::String, std::vector<RuntimeObject*> *>::const_iterator it = pickedObjectLists.begin();it!=pickedObjectLists.end();++it)
    {
        if ( it->second != NULL )
        {
            objects2.reserve(objects2.size()+it->second->size());
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects2));
        }
    }

    for (std::size_t j = 0;j<objects2.size(); ++j)
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

sf::FloatRect RuntimeObject::GetAABB() const
{
    sf::FloatRect notTransformedAABB(
        -GetCenterX(),
        -GetCenterY(),
        GetWidth(),
        GetHeight()
    );

    sf::Transform rotationTransform;
    rotationTransform.rotate(GetAngle());

    sf::Vector2f translationVec = sf::Vector2f(GetDrawableX() + GetCenterX(), GetDrawableY() + GetCenterY());
    sf::Transform translationTransform;
    translationTransform.translate(translationVec.x, translationVec.y);

    sf::Transform resultTransform;
    resultTransform = translationTransform * rotationTransform;

    return resultTransform.transformRect(notTransformedAABB);
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

std::vector<Polygon2d> RuntimeObject::GetHitBoxes(sf::FloatRect hint) const
{
    return GetHitBoxes();
}

bool RuntimeObject::CursorOnObject(RuntimeScene & scene, bool)
{
    RuntimeLayer & theLayer = scene.GetRuntimeLayer(layer);
    auto insideObject = [this](const sf::Vector2f & pos) {
        return GetDrawableX() <= pos.x
            && GetDrawableX() + GetWidth()  >= pos.x
            && GetDrawableY() <= pos.y
            && GetDrawableY() + GetHeight() >= pos.y;
    };

    for (std::size_t cameraIndex = 0;cameraIndex < theLayer.GetCameraCount();++cameraIndex)
    {
        const auto & view = theLayer.GetCamera(cameraIndex).GetSFMLView();

        sf::Vector2f mousePos = scene.renderWindow->mapPixelToCoords(
            scene.GetInputManager().GetMousePosition(), view);

        if (insideObject(mousePos)) return true;

        auto & touches = scene.GetInputManager().GetAllTouches();
        for(auto & it : touches)
        {
            sf::Vector2f touchPos = scene.renderWindow->mapPixelToCoords(it.second, view);
            if (insideObject(touchPos)) return true;
        }
    }

    return false;
}

Behavior* RuntimeObject::GetBehaviorRawPointer(const gd::String & name)
{
    return behaviors.find(name)->second.get();
}

Behavior* RuntimeObject::GetBehaviorRawPointer(const gd::String & name) const
{
    return behaviors.find(name)->second.get();
}

bool RuntimeObject::ClearForce()
{
    force5.SetLength(0); //Clear the deprecated force
    force5.SetClearing(0);

    forces.clear();

    return true;
}

bool RuntimeObject::UpdateForce( float elapsedTime )
{
    force5.SetLength( force5.GetLength() - force5.GetLength() * ( 1 - force5.GetClearing() ) * elapsedTime );
    if ( force5.GetClearing() == 0 ) force5.SetLength(0);

    for ( std::size_t i = 0; i < forces.size();)
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
    for ( std::size_t i = 0; i < forces.size();i++ )
        ForceXsimple += forces[i].GetX();

    return ForceXsimple + force5.GetX();
}

float RuntimeObject::TotalForceY() const
{
    float ForceYsimple = 0;
    for ( std::size_t i = 0; i < forces.size();i++ )
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

void RuntimeObject::DoBehaviorsPreEvents(RuntimeScene & scene)
{
    for (auto it = behaviors.cbegin() ; it != behaviors.cend(); ++it )
        it->second->StepPreEvents(scene);
}

void RuntimeObject::DoBehaviorsPostEvents(RuntimeScene & scene)
{
    for (auto it = behaviors.cbegin() ; it != behaviors.cend(); ++it )
        it->second->StepPostEvents(scene);
}

bool RuntimeObject::VariableExists(const gd::String & variable)
{
    return objectVariables.Has(variable);
}

bool RuntimeObject::VariableChildExists(const gd::Variable & variable, const gd::String & childName)
{
    return variable.HasChild(childName);
}

void RuntimeObject::VariableRemoveChild(gd::Variable & variable, const gd::String & childName)
{
    variable.RemoveChild(childName);
}

void RuntimeObject::VariableClearChildren(gd::Variable & variable)
{
    variable.ClearChildren();
}

unsigned int RuntimeObject::GetVariableChildCount(gd::Variable & variable)
{
    if (variable.IsStructure() == false) return 0;
    return variable.GetAllChildren().size();
}
