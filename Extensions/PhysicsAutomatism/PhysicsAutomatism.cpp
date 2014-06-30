/**

Game Develop - Physics Automatism Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "PhysicsAutomatism.h"
#include <string>
#include "Box2D/Box2D.h"
#include "Triangulation/triangulate.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/XmlMacros.h"
#include "PhysicsAutomatismEditor.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/Project.h"
#include "GDCpp/Scene.h"
#include "RuntimeScenePhysicsDatas.h"

#undef GetObject

PhysicsAutomatism::PhysicsAutomatism() :
    Automatism(),
    shapeType(Box),
    dynamic(true),
    fixedRotation(false),
    isBullet(false),
    massDensity(1),
    averageFriction(0.8),
    averageRestitution(0),
    linearDamping(0.1),
    angularDamping(0.1),
    body(NULL),
    runtimeScenesPhysicsDatas(NULL)
{
    polygonHeight = 200;
    polygonWidth = 200;
    automaticResizing = false;
    polygonPositioning = OnCenter;
    polygonScaleX = 1;
    polygonScaleY = 1;
}

PhysicsAutomatism::~PhysicsAutomatism()
{
    if ( runtimeScenesPhysicsDatas != NULL && body)
        runtimeScenesPhysicsDatas->world->DestroyBody(body);
}

#if defined(GD_IDE_ONLY)
void PhysicsAutomatism::EditAutomatism( wxWindow* parent, gd::Project & project_, gd::Layout * layout_, gd::MainFrameWrapper & mainFrameWrapper_ )
{
    PhysicsAutomatismEditor editor(parent, project_, layout_, *this, mainFrameWrapper_);
    editor.ShowModal();
}
#endif

/**
 * Called at each frame before events :
 * Simulate the world if necessary and update body positions.
 */
void PhysicsAutomatism::DoStepPreEvents(RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);

    if ( !runtimeScenesPhysicsDatas->stepped ) //Simulate the world, once at each frame
    {
        runtimeScenesPhysicsDatas->StepWorld(static_cast<double>(scene.GetElapsedTime())/1000000.0, 6, 10);
        runtimeScenesPhysicsDatas->stepped = true;
    }

    //Update object position according to Box2D body
    b2Vec2 position = body->GetPosition();
    object->SetX(position.x*runtimeScenesPhysicsDatas->GetScaleX()-object->GetWidth()/2+object->GetX()-object->GetDrawableX());
    object->SetY(-position.y*runtimeScenesPhysicsDatas->GetScaleY()-object->GetHeight()/2+object->GetY()-object->GetDrawableY()); //Y axis is inverted
    object->SetAngle(-body->GetAngle()*180.0f/b2_pi); //Angles are inverted

    objectOldX = object->GetX();
    objectOldY = object->GetY();
    objectOldAngle = object->GetAngle();
};

/**
 * Called at each frame after events :
 * Update Box2D body if necessary
 */
void PhysicsAutomatism::DoStepPostEvents(RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);

    //Note: Strange bug here, using SpriteObject, the tests objectOldWidth != newWidth
    //and objectOldHeight != newHeight keeps being true even if the two values were exactly the same.
    //Maybe a floating point round error ( the values were integer yet in my tests! ) so we cast the values
    //to int to ensure that the body is not continuously recreated.
    float newWidth = object->GetWidth();
    float newHeight = object->GetHeight();
    if ( (int)objectOldWidth != (int)newWidth || (int)objectOldHeight != (int)newHeight )
    {
        /*std::cout << "Changed:" << (int)objectOldWidth << "!=" << (int)newWidth << std::endl;
        std::cout << "Changed:" << (int)objectOldHeight << "!=" << (int)newHeight << std::endl;
        std::cout << "( Object name:" << object->GetName() << std::endl;*/

        double oldAngularVelocity = body->GetAngularVelocity();
        b2Vec2 oldVelocity = body->GetLinearVelocity();

        runtimeScenesPhysicsDatas->world->DestroyBody(body);
        CreateBody(scene);

        body->SetAngularVelocity(oldAngularVelocity);
        body->SetLinearVelocity(oldVelocity);
    }

    runtimeScenesPhysicsDatas->stepped = false; //Prepare for a new simulation

    if ( objectOldX == object->GetX() && objectOldY == object->GetY() && objectOldAngle == object->GetAngle())
        return;

    b2Vec2 oldPos;
    oldPos.x = (object->GetDrawableX()+object->GetWidth()/2)*runtimeScenesPhysicsDatas->GetInvScaleX();
    oldPos.y = -(object->GetDrawableY()+object->GetHeight()/2)*runtimeScenesPhysicsDatas->GetInvScaleY(); //Y axis is inverted
    body->SetTransform(oldPos, -object->GetAngle()*b2_pi/180.0f); //Angles are inverted
    body->SetAwake(true);
}

/**
 * Prepare Box2D body, and set up also runtimeScenePhysicsDatasPtr.
 */
void PhysicsAutomatism::CreateBody(const RuntimeScene & scene)
{
    if ( runtimeScenesPhysicsDatas == NULL )
        runtimeScenesPhysicsDatas = static_cast<RuntimeScenePhysicsDatas*>(scene.GetAutomatismSharedDatas(name).get());

    //Create body from object
    b2BodyDef bodyDef;
    bodyDef.type = dynamic ? b2_dynamicBody : b2_staticBody;
    bodyDef.position.Set((object->GetDrawableX()+object->GetWidth()/2)*runtimeScenesPhysicsDatas->GetInvScaleX(), -(object->GetDrawableY()+object->GetHeight()/2)*runtimeScenesPhysicsDatas->GetInvScaleY());
    bodyDef.angle = -object->GetAngle()*b2_pi/180.0f; //Angles are inverted
    bodyDef.angularDamping = angularDamping > 0.0f ? angularDamping : 0.0f;
    bodyDef.linearDamping = linearDamping > 0.0f ? linearDamping : 0.0f;
    bodyDef.bullet = isBullet;
    bodyDef.fixedRotation = fixedRotation;
    body = runtimeScenesPhysicsDatas->world->CreateBody(&bodyDef);
    body->SetUserData(this);

    //Setup body
    if ( shapeType == Circle)
    {
        b2FixtureDef fixtureDef;

        b2CircleShape circle;
        circle.m_radius = (object->GetWidth()*runtimeScenesPhysicsDatas->GetInvScaleX()+
                           object->GetHeight()*runtimeScenesPhysicsDatas->GetInvScaleY())/4; //Radius is based on the average of height and width
        if ( circle.m_radius <= 0 ) circle.m_radius = 1;
        fixtureDef.shape = &circle;
        fixtureDef.density = massDensity;
        fixtureDef.friction = averageFriction;
        fixtureDef.restitution = averageRestitution;

        body->CreateFixture(&fixtureDef);
    }
    else if( shapeType == CustomPolygon && polygonCoords.size() > 2)
    {
        //Make a polygon triangulation to make possible to use a concave polygon and more than 8 edged polygons
        std::vector<sf::Vector2f> resultOfTriangulation;

        Triangulate::Process(polygonCoords, resultOfTriangulation);

        //Iterate over all triangles
        for(unsigned int i = 0; i < resultOfTriangulation.size() / 3; i++)
        {
            b2FixtureDef fixtureDef;
            b2PolygonShape dynamicBox;

            //Create vertices
            b2Vec2 vertices[3];

            unsigned int b = 0;
            for(int a = 2; a >= 0; a--) //Box2D use another direction for vertices
            {
                if(polygonPositioning == OnOrigin)
                {
                    vertices[b].Set((resultOfTriangulation.at(i*3 + a).x * GetPolygonScaleX() - object->GetWidth()/2 - (object->GetDrawableX() - object->GetX()))                                                * runtimeScenesPhysicsDatas->GetInvScaleX(),
                                    (((object->GetHeight() - (resultOfTriangulation.at(i*3 + a).y * GetPolygonScaleY())) - object->GetHeight()/2  + (object->GetDrawableY() - object->GetY()))                   * runtimeScenesPhysicsDatas->GetInvScaleY()));
                }
                /*else if(polygonPositioning == OnTopLeftCorner)
                {
                    vertices[b].Set((resultOfTriangulation.at(i*3 + a).x * GetPolygonScaleX() - object->GetWidth()/2 )                                              * runtimeScenesPhysicsDatas->GetInvScaleX(),
                                    (((object->GetHeight() - (resultOfTriangulation.at(i*3 + a).y * GetPolygonScaleY())) - object->GetHeight()/2)                   * runtimeScenesPhysicsDatas->GetInvScaleY()));
                }*/
                else if(polygonPositioning == OnCenter)
                {
                    vertices[b].Set((resultOfTriangulation.at(i*3 + a).x * GetPolygonScaleX())                                                                       * runtimeScenesPhysicsDatas->GetInvScaleX(),
                                    (((object->GetHeight() - (resultOfTriangulation.at(i*3 + a).y * GetPolygonScaleY())) - object->GetHeight())                      * runtimeScenesPhysicsDatas->GetInvScaleY()));
                }

                b++;
            }

            dynamicBox.Set(vertices, 3);

            fixtureDef.shape = &dynamicBox;
            fixtureDef.density = massDensity;
            fixtureDef.friction = averageFriction;
            fixtureDef.restitution = averageRestitution;

            body->CreateFixture(&fixtureDef);
        }
    }
    else
    {
        b2FixtureDef fixtureDef;

        b2PolygonShape dynamicBox;
        dynamicBox.SetAsBox((object->GetWidth() > 0 ? object->GetWidth() : 1.0f)*runtimeScenesPhysicsDatas->GetInvScaleX()/2,
            (object->GetHeight() > 0 ? object->GetHeight() : 1.0f)*runtimeScenesPhysicsDatas->GetInvScaleY()/2);
        fixtureDef.shape = &dynamicBox;
        fixtureDef.density = massDensity;
        fixtureDef.friction = averageFriction;
        fixtureDef.restitution = averageRestitution;

        body->CreateFixture(&fixtureDef);
    }

    objectOldWidth = object->GetWidth();
    objectOldHeight = object->GetHeight();
}

void PhysicsAutomatism::OnDeActivate()
{
    if ( runtimeScenesPhysicsDatas && body )
    {
        runtimeScenesPhysicsDatas->world->DestroyBody(body);
        body = NULL; //Of course: body can ( and will ) be reused: Make sure we nullify the pointer as the body was destroyed.
    }
}

/**
 * Set a body to be static
 */
void PhysicsAutomatism::SetStatic(RuntimeScene & scene )
{
    dynamic = false;

    if ( !body ) CreateBody(scene);
    body->SetType(b2_staticBody);
}

/**
 * Set a body to be dynamic
 */
void PhysicsAutomatism::SetDynamic(RuntimeScene & scene )
{
    dynamic = true;

    if ( !body ) CreateBody(scene);
    body->SetType(b2_dynamicBody);
    body->SetAwake(true);
}

/**
 * Set rotation to be fixed
 */
void PhysicsAutomatism::SetFixedRotation(RuntimeScene & scene )
{
    fixedRotation = true;

    if ( !body ) CreateBody(scene);
    body->SetFixedRotation(true);
}

/**
 * Set rotation to be free
 */
void PhysicsAutomatism::SetFreeRotation(RuntimeScene & scene )
{
    fixedRotation = false;

    if ( !body ) CreateBody(scene);
    body->SetFixedRotation(false);
}

/**
 * Consider object as bullet, for better collision handling
 */
void PhysicsAutomatism::SetAsBullet(RuntimeScene & scene )
{
    isBullet = true;

    if ( !body ) CreateBody(scene);
    body->SetBullet(true);
}

/**
 * Don't consider object as bullet, for faster collision handling
 */
void PhysicsAutomatism::DontSetAsBullet(RuntimeScene & scene )
{
    isBullet = false;

    if ( !body ) CreateBody(scene);
    body->SetBullet(false);
}

/**
 * Apply an impulse
 */
void PhysicsAutomatism::ApplyImpulse(double xCoordinate, double yCoordinate, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);
    body->ApplyLinearImpulse(b2Vec2(xCoordinate, -yCoordinate),body->GetPosition());
}

/**
 * Apply a impulse
 */
void PhysicsAutomatism::ApplyImpulseUsingPolarCoordinates( float angle, float length, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);
    body->ApplyLinearImpulse(b2Vec2(cos(angle*b2_pi/180.0f)*length,-sin(angle*b2_pi/180.0f)*length), body->GetPosition());
}

/**
 * Apply a impulse
 */
void PhysicsAutomatism::ApplyImpulseTowardPosition(float xPosition, float yPosition, float length, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);

    float angle = atan2(yPosition*runtimeScenesPhysicsDatas->GetInvScaleY()+body->GetPosition().y,
                        xPosition*runtimeScenesPhysicsDatas->GetInvScaleX()-body->GetPosition().x);

    body->ApplyLinearImpulse(b2Vec2(cos(angle)*length, -sin(angle)*length), body->GetPosition());
}

/**
 * Apply a force
 */
void PhysicsAutomatism::ApplyForce(double xCoordinate, double yCoordinate, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);
    body->ApplyForce(b2Vec2(xCoordinate, -yCoordinate),body->GetPosition());
}

/**
 * Apply a force
 */
void PhysicsAutomatism::ApplyForceUsingPolarCoordinates( float angle, float length, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);
    body->ApplyForce(b2Vec2(cos(angle*b2_pi/180.0f)*length,-sin(angle*b2_pi/180.0f)*length), body->GetPosition());
}

/**
 * Apply a force
 */
void PhysicsAutomatism::ApplyForceTowardPosition(float xPosition, float yPosition, float length, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);

    float angle = atan2(yPosition*runtimeScenesPhysicsDatas->GetInvScaleY()+body->GetPosition().y,
                        xPosition*runtimeScenesPhysicsDatas->GetInvScaleX()-body->GetPosition().x);

    body->ApplyForce(b2Vec2(cos(angle)*length, -sin(angle)*length), body->GetPosition());
}

/**
 * Apply a torque
 */
void PhysicsAutomatism::ApplyTorque( double torque, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);
    body->ApplyTorque(torque);
}

/**
 * Change linear velocity
 */
void PhysicsAutomatism::SetLinearVelocity( double xVelocity, double yVelocity, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);
    body->SetLinearVelocity(b2Vec2(xVelocity,-yVelocity));
}

/**
 * Change angular velocity
 */
void PhysicsAutomatism::SetAngularVelocity( double angularVelocity, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);
    body->SetAngularVelocity(angularVelocity);
}

/**
 * Change linear damping
 */
void PhysicsAutomatism::SetLinearDamping( float linearDamping_ , RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);
    body->SetLinearDamping(linearDamping_);
}

/**
 * Change angular damping
 */
void PhysicsAutomatism::SetAngularDamping( float angularDamping_ , RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);
    body->SetAngularDamping(angularDamping_);
}

/**
 * Add an hinge between two objects
 */
void PhysicsAutomatism::AddRevoluteJointBetweenObjects( RuntimeObject * object, RuntimeScene & scene, float xPosRelativeToMassCenter, float yPosRelativeToMassCenter )
{
    if ( !body ) CreateBody(scene);

    if ( object == NULL || !object->HasAutomatismNamed(name) ) return;
    b2Body * otherBody = static_cast<PhysicsAutomatism*>(object->GetAutomatismRawPointer(name))->GetBox2DBody(scene);

    if ( body == otherBody ) return;

    b2RevoluteJointDef jointDef;
    jointDef.Initialize(body,
                        otherBody,
                        body->GetWorldCenter()+b2Vec2(xPosRelativeToMassCenter*runtimeScenesPhysicsDatas->GetInvScaleX(),
                                                      yPosRelativeToMassCenter*runtimeScenesPhysicsDatas->GetInvScaleY()));
    runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef);
}


/**
 * Add an hinge to an object
 */
void PhysicsAutomatism::AddRevoluteJoint( float xPosition, float yPosition, RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);

    b2RevoluteJointDef jointDef;
    jointDef.Initialize(body, runtimeScenesPhysicsDatas->staticBody,
                        b2Vec2( xPosition*runtimeScenesPhysicsDatas->GetInvScaleX(), -yPosition*runtimeScenesPhysicsDatas->GetInvScaleY()));

    runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef);
}


/**
 * Change gravity
 */
void PhysicsAutomatism::SetGravity( float xGravity, float yGravity, RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);

    runtimeScenesPhysicsDatas->world->SetGravity(b2Vec2( xGravity*runtimeScenesPhysicsDatas->GetInvScaleX(), -yGravity*runtimeScenesPhysicsDatas->GetInvScaleY()));
}


/**
 * Add a gear joint between two objects
 */
void PhysicsAutomatism::AddGearJointBetweenObjects( RuntimeObject * object, float ratio, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);

    if ( object == NULL || !object->HasAutomatismNamed(name) ) return;
    b2Body * otherBody = static_cast<PhysicsAutomatism*>(object->GetAutomatismRawPointer(name))->GetBox2DBody(scene);

    if ( body == otherBody ) return;

    //Gear joint need a revolute joint to the ground for the two objects
    b2RevoluteJointDef jointDef1;
    jointDef1.Initialize(runtimeScenesPhysicsDatas->staticBody, body, body->GetWorldCenter());

    b2RevoluteJointDef jointDef2;
    jointDef2.Initialize(runtimeScenesPhysicsDatas->staticBody, otherBody, otherBody->GetWorldCenter());

    b2GearJointDef jointDef;
    jointDef.bodyA = body;
    jointDef.bodyB = otherBody;
    jointDef.joint1 = runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef1);
    jointDef.joint2 = runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef2);
    jointDef.ratio = ratio * b2_pi;


    runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef);
}

void PhysicsAutomatism::SetLinearVelocityX( double xVelocity, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);

    body->SetLinearVelocity(b2Vec2(xVelocity, body->GetLinearVelocity().y));

}
void PhysicsAutomatism::SetLinearVelocityY( double yVelocity, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);

    body->SetLinearVelocity(b2Vec2(body->GetLinearVelocity().x, -yVelocity));

}
float PhysicsAutomatism::GetLinearVelocityX( RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);

    return body->GetLinearVelocity().x;
}
float PhysicsAutomatism::GetLinearVelocityY( RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);

    return -body->GetLinearVelocity().y;
}
float PhysicsAutomatism::GetLinearVelocity( RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);

    return sqrt(body->GetLinearVelocity().x*body->GetLinearVelocity().x+body->GetLinearVelocity().y*body->GetLinearVelocity().y);
}
double PhysicsAutomatism::GetAngularVelocity( const RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);

    return body->GetAngularVelocity();
}
double PhysicsAutomatism::GetLinearDamping( const RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);

    return body->GetLinearDamping();
}
double PhysicsAutomatism::GetAngularDamping( const RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);

    return body->GetAngularDamping();
}

/**
 * Test if there is a contact with another object
 */
bool PhysicsAutomatism::CollisionWith( std::map <std::string, std::vector<RuntimeObject*> *> otherObjectsLists, RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);

    //Getting a list of all objects which are tested
    std::vector<RuntimeObject*> objects;
    for (std::map <std::string, std::vector<RuntimeObject*> *>::const_iterator it = otherObjectsLists.begin();it!=otherObjectsLists.end();++it)
    {
        if ( it->second != NULL )
        {
            objects.reserve(objects.size()+it->second->size());
            std::copy(it->second->begin(), it->second->end(), std::back_inserter(objects));
        }
    }

    //Test if an object of the list is in collision with our object.
	std::vector<RuntimeObject*>::const_iterator obj_end = objects.end();
    for (std::vector<RuntimeObject*>::iterator obj = objects.begin(); obj != obj_end; ++obj )
    {
        std::set<PhysicsAutomatism*>::const_iterator it = currentContacts.begin();
        std::set<PhysicsAutomatism*>::const_iterator end = currentContacts.end();
        for (;it != end;++it)
        {
            if ( (*it)->GetObject() == (*obj) )
                return true;
        }
    }

    return false;
}

bool PhysicsAutomatism::IsStatic()
{
    return !dynamic;
}

bool PhysicsAutomatism::IsDynamic()
{
    return dynamic;
}

void PhysicsAutomatism::SetPolygonCoords(const std::vector<sf::Vector2f> &vec)
{
    polygonCoords = vec;
}

const std::vector<sf::Vector2f>& PhysicsAutomatism::GetPolygonCoords() const
{
    return polygonCoords;
}

bool PhysicsAutomatism::HasAutomaticResizing() const
{
    return automaticResizing;
}

void PhysicsAutomatism::SetAutomaticResizing(bool b)
{
    automaticResizing = b;
}

float PhysicsAutomatism::GetPolygonScaleX() const
{
    if(automaticResizing)
        return object->GetWidth() / polygonWidth;
    else
        return polygonScaleX;
}

void PhysicsAutomatism::SetPolygonScaleX(float scX, RuntimeScene &scene)
{
    polygonScaleX = scX;

    runtimeScenesPhysicsDatas->world->DestroyBody(body);
    CreateBody(scene);
}

float PhysicsAutomatism::GetPolygonScaleY() const
{
    if(automaticResizing)
        return object->GetHeight() / polygonHeight;
    else
        return polygonScaleY;
}

void PhysicsAutomatism::SetPolygonScaleY(float scY, RuntimeScene &scene)
{
    polygonScaleY = scY;

    runtimeScenesPhysicsDatas->world->DestroyBody(body);
    CreateBody(scene);
}

#if defined(GD_IDE_ONLY)
void PhysicsAutomatism::SerializeTo(gd::SerializerElement & element) const
{
    element.SetAttribute("dynamic", dynamic);
    element.SetAttribute("fixedRotation", fixedRotation);
    element.SetAttribute("isBullet", isBullet);
    element.SetAttribute("massDensity", massDensity);
    element.SetAttribute("averageFriction", averageFriction);
    element.SetAttribute("linearDamping", linearDamping);
    element.SetAttribute("angularDamping", angularDamping);
    if ( shapeType == Circle)
        element.SetAttribute("shapeType", "Circle");
    else if( shapeType == CustomPolygon )
        element.SetAttribute("shapeType", "CustomPolygon");
    else
        element.SetAttribute("shapeType", "Box");

    if ( polygonPositioning == OnOrigin )
        element.SetAttribute("positioning", "OnOrigin");
    else
        element.SetAttribute("positioning", "OnCenter");

    element.SetAttribute("autoResizing", automaticResizing);
    element.SetAttribute("polygonWidth", polygonWidth);
    element.SetAttribute("polygonHeight", polygonHeight);

    element.SetAttribute("coordsList", PhysicsAutomatism::GetStringFromCoordsVector(GetPolygonCoords(), '/', ';'));
    element.SetAttribute("averageRestitution", averageRestitution);
}
#endif

void PhysicsAutomatism::UnserializeFrom(const gd::SerializerElement & element)
{
    dynamic = element.GetBoolAttribute("dynamic");
    fixedRotation = element.GetBoolAttribute("fixedRotation");
    isBullet = element.GetBoolAttribute("isBullet");
    massDensity = element.GetDoubleAttribute("massDensity");
    averageFriction = element.GetDoubleAttribute("averageFriction");
    averageRestitution = element.GetDoubleAttribute("averageRestitution");

    linearDamping = element.GetDoubleAttribute("linearDamping");
    angularDamping = element.GetDoubleAttribute("angularDamping");

    std::string shape = element.GetStringAttribute("shapeType");
    if ( shape == "Circle" )
        shapeType = Circle;
    else if (shape == "CustomPolygon")
        shapeType = CustomPolygon;
    else
        shapeType = Box;

    if(element.GetStringAttribute("positioning", "OnOrigin") == "OnOrigin")
        polygonPositioning = OnOrigin;
    else
        polygonPositioning = OnCenter;

    automaticResizing = element.GetBoolAttribute("autoResizing", false);
    polygonWidth = element.GetDoubleAttribute("polygonWidth");
    polygonHeight = element.GetDoubleAttribute("polygonHeight");

    std::string coordsStr = element.GetStringAttribute("coordsList");
    SetPolygonCoords(PhysicsAutomatism::GetCoordsVectorFromString(coordsStr, '/', ';'));
}


std::string PhysicsAutomatism::GetStringFromCoordsVector(const std::vector<sf::Vector2f> &vec, char coordsSep, char composantSep)
{
    std::string coordsStr;

	for (unsigned int a = 0; a < vec.size(); a++)
	{
	    coordsStr += ToString<float>(vec.at(a).x) + composantSep + ToString<float>(vec.at(a).y);
	    if(a != vec.size() - 1)
            coordsStr += coordsSep;
	}

	return coordsStr;
}

std::vector<sf::Vector2f> PhysicsAutomatism::GetCoordsVectorFromString(const std::string &str, char coordsSep, char composantSep)
{
    std::vector<sf::Vector2f> coordsVec;

    std::vector<std::string> coordsDecomposed = SplitString<std::string>(str, coordsSep);

    for(unsigned int a = 0; a < coordsDecomposed.size(); a++)
    {
        std::vector<std::string> coordXY = SplitString<std::string>(coordsDecomposed.at(a), composantSep);

        if(coordXY.size() != 2)
            continue;

        sf::Vector2f newCoord(ToFloat<std::string>(coordXY.at(0)), ToFloat<std::string>(coordXY.at(1)));
        coordsVec.push_back(newCoord);
    }

    return coordsVec;
}

