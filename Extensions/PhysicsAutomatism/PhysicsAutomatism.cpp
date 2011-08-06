/**

Game Develop - Physic Automatism Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

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
#include "Box2D/Box2D.h"
#include "PhysicsAutomatismEditor.h"
#include "GDL/RuntimeScene.h"
#include "GDL/tinyxml.h"
#include "GDL/XmlMacros.h"

PhysicsAutomatism::PhysicsAutomatism(std::string automatismTypeName) :
Automatism(automatismTypeName),
shapeType(Box),
dynamic(true),
fixedRotation(false),
isBullet(false),
massDensity(1),
averageFriction(0.8),
averageRestitution(0),
linearDamping(0.1),
angularDamping(0.1),
body(NULL)
{
}

PhysicsAutomatism::~PhysicsAutomatism()
{
    if ( runtimeScenesPhysicsDatas != boost::shared_ptr<RuntimeScenePhysicsDatas>() && body)
        runtimeScenesPhysicsDatas->world->DestroyBody(body);
}

#if defined(GD_IDE_ONLY)
void PhysicsAutomatism::EditAutomatism( wxWindow* parent, Game & game_, Scene * scene, MainEditorCommand & mainEditorCommand_ )
{
    PhysicsAutomatismEditor editor(parent, game_, scene, *this, mainEditorCommand_);
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
        runtimeScenesPhysicsDatas->world->Step(scene.GetElapsedTime(), 6, 10);
        runtimeScenesPhysicsDatas->world->ClearForces();

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
    if ( objectOldWidth != object->GetWidth() || objectOldHeight != object->GetHeight() )
    {
        runtimeScenesPhysicsDatas->world->DestroyBody(body);
        CreateBody(scene);
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
    if ( runtimeScenesPhysicsDatas == boost::shared_ptr<RuntimeScenePhysicsDatas>() )
        runtimeScenesPhysicsDatas = boost::static_pointer_cast<RuntimeScenePhysicsDatas>(scene.automatismsSharedDatas.find(name)->second);

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
    else
    {
        b2FixtureDef fixtureDef;

        b2PolygonShape dynamicBox;
        dynamicBox.SetAsBox((object->GetWidth() > 0 ? object->GetWidth() : 1.0f)*runtimeScenesPhysicsDatas->GetInvScaleX()/2, (object->GetHeight() > 0 ? object->GetHeight() : 1.0f)*runtimeScenesPhysicsDatas->GetInvScaleY()/2);
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
        body = NULL; //Of course.
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
    body->ApplyForce(b2Vec2(cos(angle)*length,-sin(angle)*length), body->GetPosition());
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
void PhysicsAutomatism::AddRevoluteJointBetweenObjects( const std::string & , Object * object, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);

    if ( object == NULL || !object->HasAutomatism(name) ) return;
    b2Body * otherBody = static_cast<PhysicsAutomatism*>(object->GetAutomatismRawPointer(name))->GetBox2DBody(scene);

    if ( body == otherBody ) return;

    b2RevoluteJointDef jointDef;
    jointDef.Initialize(otherBody, body, otherBody->GetWorldCenter());
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
void PhysicsAutomatism::AddGearJointBetweenObjects( const std::string & , Object * object, RuntimeScene & scene )
{
    if ( !body ) CreateBody(scene);

    if ( object == NULL || !object->HasAutomatism(name) ) return;
    b2Body * otherBody = boost::static_pointer_cast<PhysicsAutomatism>(object->GetAutomatism(name))->GetBox2DBody(scene);

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
    jointDef.ratio = 2.0f * b2_pi / 1.0f; //TODO : Ratio parameter ?


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

    return body->GetLinearVelocity().y;
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
bool PhysicsAutomatism::CollisionWith( const std::string & , std::vector<Object*> list, RuntimeScene & scene)
{
    if ( !body ) CreateBody(scene);

	std::vector<Object*>::const_iterator obj_end = list.end();
    for (std::vector<Object*>::iterator obj = list.begin(); obj != obj_end; ++obj )
    {
        set<PhysicsAutomatism*>::const_iterator it = currentContacts.begin();
        set<PhysicsAutomatism*>::const_iterator end = currentContacts.end();
        for (;it != end;++it)
        {
            if ( (*it)->GetObject()->GetName() == (*obj)->GetName() )
                return true;
        }
    }

    return false;
}


#if defined(GD_IDE_ONLY)
void PhysicsAutomatism::SaveToXml(TiXmlElement * elem) const
{
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("dynamic", dynamic);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("fixedRotation", fixedRotation);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("isBullet", isBullet);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("massDensity", massDensity);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("averageFriction", averageFriction);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("linearDamping", linearDamping);
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("angularDamping", angularDamping);
    if ( shapeType == Circle)
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("shapeType", "Circle")
    else
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE("shapeType", "Box")
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_FLOAT("averageRestitution", averageRestitution);
}
#endif

void PhysicsAutomatism::LoadFromXml(const TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("dynamic", dynamic);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("fixedRotation", fixedRotation);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("isBullet", isBullet);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("massDensity", massDensity);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("averageFriction", averageFriction);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("linearDamping", linearDamping);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("angularDamping", angularDamping);
    std::string shape;
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("shapeType", shape);
    if ( shape == "Circle" )
        shapeType = Circle;
    else
        shapeType = Box;
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_FLOAT("averageRestitution", averageRestitution);
}
