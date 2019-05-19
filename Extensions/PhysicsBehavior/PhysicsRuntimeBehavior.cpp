/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "PhysicsRuntimeBehavior.h"
#include <string>
#include "Box2D/Box2D.h"
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "RuntimeScenePhysicsDatas.h"
#include "Triangulation/triangulate.h"

#undef GetObject

PhysicsRuntimeBehavior::PhysicsRuntimeBehavior(
    const gd::SerializerElement &behaviorContent)
    : RuntimeBehavior(behaviorContent),
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
      runtimeScenesPhysicsDatas(NULL) {
  polygonHeight = 200;
  polygonWidth = 200;
  automaticResizing = false;
  polygonPositioning = OnCenter;
  polygonScaleX = 1;
  polygonScaleY = 1;

  dynamic = behaviorContent.GetBoolAttribute("dynamic");
  fixedRotation = behaviorContent.GetBoolAttribute("fixedRotation");
  isBullet = behaviorContent.GetBoolAttribute("isBullet");
  massDensity = behaviorContent.GetDoubleAttribute("massDensity");
  averageFriction = behaviorContent.GetDoubleAttribute("averageFriction");
  averageRestitution = behaviorContent.GetDoubleAttribute("averageRestitution");

  linearDamping = behaviorContent.GetDoubleAttribute("linearDamping");
  angularDamping = behaviorContent.GetDoubleAttribute("angularDamping");

  gd::String shape = behaviorContent.GetStringAttribute("shapeType");
  if (shape == "Circle")
    shapeType = Circle;
  else if (shape == "CustomPolygon")
    shapeType = CustomPolygon;
  else
    shapeType = Box;

  if (behaviorContent.GetStringAttribute("positioning", "OnOrigin") ==
      "OnOrigin")
    polygonPositioning = OnOrigin;
  else
    polygonPositioning = OnCenter;

  automaticResizing = behaviorContent.GetBoolAttribute("autoResizing", false);
  polygonWidth = behaviorContent.GetDoubleAttribute("polygonWidth");
  polygonHeight = behaviorContent.GetDoubleAttribute("polygonHeight");

  gd::String coordsStr = behaviorContent.GetStringAttribute("coordsList");
  SetPolygonCoords(
      PhysicsRuntimeBehavior::GetCoordsVectorFromString(coordsStr, '/', ';'));
}

PhysicsRuntimeBehavior::~PhysicsRuntimeBehavior() {
  if (runtimeScenesPhysicsDatas != NULL && body)
    runtimeScenesPhysicsDatas->world->DestroyBody(body);
}

/**
 * Called at each frame before events :
 * Simulate the world if necessary and update body positions.
 */
void PhysicsRuntimeBehavior::DoStepPreEvents(RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  if (!runtimeScenesPhysicsDatas
           ->stepped)  // Simulate the world, once at each frame
  {
    runtimeScenesPhysicsDatas->StepWorld(
        static_cast<double>(scene.GetTimeManager().GetElapsedTime()) /
            1000000.0,
        6,
        10);
    runtimeScenesPhysicsDatas->stepped = true;
  }

  // Update object position according to Box2D body
  b2Vec2 position = body->GetPosition();
  object->SetX(position.x * runtimeScenesPhysicsDatas->GetScaleX() -
               object->GetWidth() / 2 + object->GetX() -
               object->GetDrawableX());
  object->SetY(-position.y * runtimeScenesPhysicsDatas->GetScaleY() -
               object->GetHeight() / 2 + object->GetY() -
               object->GetDrawableY());                  // Y axis is inverted
  object->SetAngle(-body->GetAngle() * 180.0f / b2_pi);  // Angles are inverted

  objectOldX = object->GetX();
  objectOldY = object->GetY();
  objectOldAngle = object->GetAngle();
};

/**
 * Called at each frame after events :
 * Update Box2D body if necessary
 */
void PhysicsRuntimeBehavior::DoStepPostEvents(RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  // Note: Strange bug here, using SpriteObject, the tests objectOldWidth !=
  // newWidth and objectOldHeight != newHeight keeps being true even if the two
  // values were exactly the same. Maybe a floating point round error ( the
  // values were integer yet in my tests! ) so we cast the values to int to
  // ensure that the body is not continuously recreated.
  float newWidth = object->GetWidth();
  float newHeight = object->GetHeight();
  if ((int)objectOldWidth != (int)newWidth ||
      (int)objectOldHeight != (int)newHeight) {
    double oldAngularVelocity = body->GetAngularVelocity();
    b2Vec2 oldVelocity = body->GetLinearVelocity();

    runtimeScenesPhysicsDatas->world->DestroyBody(body);
    CreateBody(scene);

    body->SetAngularVelocity(oldAngularVelocity);
    body->SetLinearVelocity(oldVelocity);
  }

  runtimeScenesPhysicsDatas->stepped = false;  // Prepare for a new simulation

  if (objectOldX == object->GetX() && objectOldY == object->GetY() &&
      objectOldAngle == object->GetAngle())
    return;

  b2Vec2 oldPos;
  oldPos.x = (object->GetDrawableX() + object->GetWidth() / 2) *
             runtimeScenesPhysicsDatas->GetInvScaleX();
  oldPos.y = -(object->GetDrawableY() + object->GetHeight() / 2) *
             runtimeScenesPhysicsDatas->GetInvScaleY();  // Y axis is inverted
  body->SetTransform(
      oldPos, -object->GetAngle() * b2_pi / 180.0f);  // Angles are inverted
  body->SetAwake(true);
}

/**
 * Prepare Box2D body, and set up also runtimeScenePhysicsDatasPtr.
 */
void PhysicsRuntimeBehavior::CreateBody(const RuntimeScene &scene) {
  if (runtimeScenesPhysicsDatas == NULL)
    runtimeScenesPhysicsDatas = static_cast<RuntimeScenePhysicsDatas *>(
        scene.GetBehaviorSharedData(name).get());

  // Create body from object
  b2BodyDef bodyDef;
  bodyDef.type = dynamic ? b2_dynamicBody : b2_staticBody;
  bodyDef.position.Set((object->GetDrawableX() + object->GetWidth() / 2) *
                           runtimeScenesPhysicsDatas->GetInvScaleX(),
                       -(object->GetDrawableY() + object->GetHeight() / 2) *
                           runtimeScenesPhysicsDatas->GetInvScaleY());
  bodyDef.angle = -object->GetAngle() * b2_pi / 180.0f;  // Angles are inverted
  bodyDef.angularDamping = angularDamping > 0.0f ? angularDamping : 0.0f;
  bodyDef.linearDamping = linearDamping > 0.0f ? linearDamping : 0.0f;
  bodyDef.bullet = isBullet;
  bodyDef.fixedRotation = fixedRotation;
  body = runtimeScenesPhysicsDatas->world->CreateBody(&bodyDef);
  body->SetUserData(this);

  // Setup body
  if (shapeType == Circle) {
    b2FixtureDef fixtureDef;

    b2CircleShape circle;
    circle.m_radius =
        (object->GetWidth() * runtimeScenesPhysicsDatas->GetInvScaleX() +
         object->GetHeight() * runtimeScenesPhysicsDatas->GetInvScaleY()) /
        4;  // Radius is based on the average of height and width
    if (circle.m_radius <= 0) circle.m_radius = 1;
    fixtureDef.shape = &circle;
    fixtureDef.density = massDensity;
    fixtureDef.friction = averageFriction;
    fixtureDef.restitution = averageRestitution;

    body->CreateFixture(&fixtureDef);
  } else if (shapeType == CustomPolygon && polygonCoords.size() > 2) {
    // Make a polygon triangulation to make possible to use a concave polygon
    // and more than 8 edged polygons
    std::vector<sf::Vector2f> resultOfTriangulation;

    Triangulate::Process(polygonCoords, resultOfTriangulation);

    // Iterate over all triangles
    for (std::size_t i = 0; i < resultOfTriangulation.size() / 3; i++) {
      b2FixtureDef fixtureDef;
      b2PolygonShape dynamicBox;

      // Create vertices
      b2Vec2 vertices[3];

      std::size_t b = 0;
      for (int a = 2; a >= 0; a--)  // Box2D use another direction for vertices
      {
        if (polygonPositioning == OnOrigin) {
          vertices[b].Set(
              (resultOfTriangulation.at(i * 3 + a).x * GetPolygonScaleX() -
               object->GetWidth() / 2 -
               (object->GetDrawableX() - object->GetX())) *
                  runtimeScenesPhysicsDatas->GetInvScaleX(),
              (((object->GetHeight() -
                 (resultOfTriangulation.at(i * 3 + a).y * GetPolygonScaleY())) -
                object->GetHeight() / 2 +
                (object->GetDrawableY() - object->GetY())) *
               runtimeScenesPhysicsDatas->GetInvScaleY()));
        }
        /*else if(polygonPositioning == OnTopLeftCorner)
        {
            vertices[b].Set((resultOfTriangulation.at(i*3 + a).x *
        GetPolygonScaleX() - object->GetWidth()/2 ) *
        runtimeScenesPhysicsDatas->GetInvScaleX(),
                            (((object->GetHeight() -
        (resultOfTriangulation.at(i*3 + a).y * GetPolygonScaleY())) -
        object->GetHeight()/2)                   *
        runtimeScenesPhysicsDatas->GetInvScaleY()));
        }*/
        else if (polygonPositioning == OnCenter) {
          vertices[b].Set(
              (resultOfTriangulation.at(i * 3 + a).x * GetPolygonScaleX()) *
                  runtimeScenesPhysicsDatas->GetInvScaleX(),
              (((object->GetHeight() -
                 (resultOfTriangulation.at(i * 3 + a).y * GetPolygonScaleY())) -
                object->GetHeight()) *
               runtimeScenesPhysicsDatas->GetInvScaleY()));
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
  } else {
    b2FixtureDef fixtureDef;

    b2PolygonShape dynamicBox;
    dynamicBox.SetAsBox((object->GetWidth() > 0 ? object->GetWidth() : 1.0f) *
                            runtimeScenesPhysicsDatas->GetInvScaleX() / 2,
                        (object->GetHeight() > 0 ? object->GetHeight() : 1.0f) *
                            runtimeScenesPhysicsDatas->GetInvScaleY() / 2);
    fixtureDef.shape = &dynamicBox;
    fixtureDef.density = massDensity;
    fixtureDef.friction = averageFriction;
    fixtureDef.restitution = averageRestitution;

    body->CreateFixture(&fixtureDef);
  }

  objectOldWidth = object->GetWidth();
  objectOldHeight = object->GetHeight();
}

void PhysicsRuntimeBehavior::OnDeActivate() {
  if (runtimeScenesPhysicsDatas && body) {
    runtimeScenesPhysicsDatas->world->DestroyBody(body);
    body = NULL;  // Of course: body can ( and will ) be reused: Make sure we
                  // nullify the pointer as the body was destroyed.
  }
}

/**
 * Set a body to be static
 */
void PhysicsRuntimeBehavior::SetStatic(RuntimeScene &scene) {
  dynamic = false;

  if (!body) CreateBody(scene);
  body->SetType(b2_staticBody);
}

/**
 * Set a body to be dynamic
 */
void PhysicsRuntimeBehavior::SetDynamic(RuntimeScene &scene) {
  dynamic = true;

  if (!body) CreateBody(scene);
  body->SetType(b2_dynamicBody);
  body->SetAwake(true);
}

/**
 * Set rotation to be fixed
 */
void PhysicsRuntimeBehavior::SetFixedRotation(RuntimeScene &scene) {
  fixedRotation = true;

  if (!body) CreateBody(scene);
  body->SetFixedRotation(true);
}

/**
 * Set rotation to be free
 */
void PhysicsRuntimeBehavior::SetFreeRotation(RuntimeScene &scene) {
  fixedRotation = false;

  if (!body) CreateBody(scene);
  body->SetFixedRotation(false);
}

/**
 * Consider object as bullet, for better collision handling
 */
void PhysicsRuntimeBehavior::SetAsBullet(RuntimeScene &scene) {
  isBullet = true;

  if (!body) CreateBody(scene);
  body->SetBullet(true);
}

/**
 * Don't consider object as bullet, for faster collision handling
 */
void PhysicsRuntimeBehavior::DontSetAsBullet(RuntimeScene &scene) {
  isBullet = false;

  if (!body) CreateBody(scene);
  body->SetBullet(false);
}

/**
 * Apply an impulse
 */
void PhysicsRuntimeBehavior::ApplyImpulse(double xCoordinate,
                                          double yCoordinate,
                                          RuntimeScene &scene) {
  if (!body) CreateBody(scene);
  body->ApplyLinearImpulse(b2Vec2(xCoordinate, -yCoordinate),
                           body->GetPosition());
}

/**
 * Apply a impulse
 */
void PhysicsRuntimeBehavior::ApplyImpulseUsingPolarCoordinates(
    float angle, float length, RuntimeScene &scene) {
  if (!body) CreateBody(scene);
  body->ApplyLinearImpulse(b2Vec2(cos(angle * b2_pi / 180.0f) * length,
                                  -sin(angle * b2_pi / 180.0f) * length),
                           body->GetPosition());
}

/**
 * Apply a impulse
 */
void PhysicsRuntimeBehavior::ApplyImpulseTowardPosition(float xPosition,
                                                        float yPosition,
                                                        float length,
                                                        RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  float angle = atan2(yPosition * runtimeScenesPhysicsDatas->GetInvScaleY() +
                          body->GetPosition().y,
                      xPosition * runtimeScenesPhysicsDatas->GetInvScaleX() -
                          body->GetPosition().x);

  body->ApplyLinearImpulse(b2Vec2(cos(angle) * length, -sin(angle) * length),
                           body->GetPosition());
}

/**
 * Apply a force
 */
void PhysicsRuntimeBehavior::ApplyForce(double xCoordinate,
                                        double yCoordinate,
                                        RuntimeScene &scene) {
  if (!body) CreateBody(scene);
  body->ApplyForce(b2Vec2(xCoordinate, -yCoordinate), body->GetPosition());
}

/**
 * Apply a force
 */
void PhysicsRuntimeBehavior::ApplyForceUsingPolarCoordinates(
    float angle, float length, RuntimeScene &scene) {
  if (!body) CreateBody(scene);
  body->ApplyForce(b2Vec2(cos(angle * b2_pi / 180.0f) * length,
                          -sin(angle * b2_pi / 180.0f) * length),
                   body->GetPosition());
}

/**
 * Apply a force
 */
void PhysicsRuntimeBehavior::ApplyForceTowardPosition(float xPosition,
                                                      float yPosition,
                                                      float length,
                                                      RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  float angle = atan2(yPosition * runtimeScenesPhysicsDatas->GetInvScaleY() +
                          body->GetPosition().y,
                      xPosition * runtimeScenesPhysicsDatas->GetInvScaleX() -
                          body->GetPosition().x);

  body->ApplyForce(b2Vec2(cos(angle) * length, -sin(angle) * length),
                   body->GetPosition());
}

/**
 * Apply a torque
 */
void PhysicsRuntimeBehavior::ApplyTorque(double torque, RuntimeScene &scene) {
  if (!body) CreateBody(scene);
  body->ApplyTorque(torque);
}

/**
 * Change linear velocity
 */
void PhysicsRuntimeBehavior::SetLinearVelocity(double xVelocity,
                                               double yVelocity,
                                               RuntimeScene &scene) {
  if (!body) CreateBody(scene);
  body->SetLinearVelocity(b2Vec2(xVelocity, -yVelocity));
}

/**
 * Change angular velocity
 */
void PhysicsRuntimeBehavior::SetAngularVelocity(double angularVelocity,
                                                RuntimeScene &scene) {
  if (!body) CreateBody(scene);
  body->SetAngularVelocity(angularVelocity);
}

/**
 * Change linear damping
 */
void PhysicsRuntimeBehavior::SetLinearDamping(float linearDamping_,
                                              RuntimeScene &scene) {
  if (!body) CreateBody(scene);
  body->SetLinearDamping(linearDamping_);
}

/**
 * Change angular damping
 */
void PhysicsRuntimeBehavior::SetAngularDamping(float angularDamping_,
                                               RuntimeScene &scene) {
  if (!body) CreateBody(scene);
  body->SetAngularDamping(angularDamping_);
}

/**
 * Add an hinge between two objects
 */
void PhysicsRuntimeBehavior::AddRevoluteJointBetweenObjects(
    RuntimeObject *object,
    RuntimeScene &scene,
    float xPosRelativeToMassCenter,
    float yPosRelativeToMassCenter) {
  if (!body) CreateBody(scene);

  if (object == NULL || !object->HasBehaviorNamed(name)) return;
  b2Body *otherBody =
      static_cast<PhysicsRuntimeBehavior *>(object->GetBehaviorRawPointer(name))
          ->GetBox2DBody(scene);

  if (body == otherBody) return;

  b2RevoluteJointDef jointDef;
  jointDef.Initialize(
      body,
      otherBody,
      body->GetWorldCenter() +
          b2Vec2(xPosRelativeToMassCenter *
                     runtimeScenesPhysicsDatas->GetInvScaleX(),
                 yPosRelativeToMassCenter *
                     runtimeScenesPhysicsDatas->GetInvScaleY()));
  runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef);
}

/**
 * Add an hinge to an object
 */
void PhysicsRuntimeBehavior::AddRevoluteJoint(float xPosition,
                                              float yPosition,
                                              RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  b2RevoluteJointDef jointDef;
  jointDef.Initialize(
      body,
      runtimeScenesPhysicsDatas->staticBody,
      b2Vec2(xPosition * runtimeScenesPhysicsDatas->GetInvScaleX(),
             -yPosition * runtimeScenesPhysicsDatas->GetInvScaleY()));

  runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef);
}

/**
 * Change gravity
 */
void PhysicsRuntimeBehavior::SetGravity(float xGravity,
                                        float yGravity,
                                        RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  runtimeScenesPhysicsDatas->world->SetGravity(b2Vec2(xGravity, -yGravity));
}

/**
 * Add a gear joint between two objects
 */
void PhysicsRuntimeBehavior::AddGearJointBetweenObjects(RuntimeObject *object,
                                                        float ratio,
                                                        RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  if (object == NULL || !object->HasBehaviorNamed(name)) return;
  b2Body *otherBody =
      static_cast<PhysicsRuntimeBehavior *>(object->GetBehaviorRawPointer(name))
          ->GetBox2DBody(scene);

  if (body == otherBody) return;

  // Gear joint need a revolute joint to the ground for the two objects
  b2RevoluteJointDef jointDef1;
  jointDef1.Initialize(
      runtimeScenesPhysicsDatas->staticBody, body, body->GetWorldCenter());

  b2RevoluteJointDef jointDef2;
  jointDef2.Initialize(runtimeScenesPhysicsDatas->staticBody,
                       otherBody,
                       otherBody->GetWorldCenter());

  b2GearJointDef jointDef;
  jointDef.bodyA = body;
  jointDef.bodyB = otherBody;
  jointDef.joint1 = runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef1);
  jointDef.joint2 = runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef2);
  jointDef.ratio = ratio * b2_pi;

  runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef);
}

void PhysicsRuntimeBehavior::SetLinearVelocityX(double xVelocity,
                                                RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  body->SetLinearVelocity(b2Vec2(xVelocity, body->GetLinearVelocity().y));
}
void PhysicsRuntimeBehavior::SetLinearVelocityY(double yVelocity,
                                                RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  body->SetLinearVelocity(b2Vec2(body->GetLinearVelocity().x, -yVelocity));
}
float PhysicsRuntimeBehavior::GetLinearVelocityX(RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  return body->GetLinearVelocity().x;
}
float PhysicsRuntimeBehavior::GetLinearVelocityY(RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  return -body->GetLinearVelocity().y;
}
float PhysicsRuntimeBehavior::GetLinearVelocity(RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  return sqrt(body->GetLinearVelocity().x * body->GetLinearVelocity().x +
              body->GetLinearVelocity().y * body->GetLinearVelocity().y);
}
double PhysicsRuntimeBehavior::GetAngularVelocity(const RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  return body->GetAngularVelocity();
}
double PhysicsRuntimeBehavior::GetLinearDamping(const RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  return body->GetLinearDamping();
}
double PhysicsRuntimeBehavior::GetAngularDamping(const RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  return body->GetAngularDamping();
}

/**
 * Test if there is a contact with another object
 */
bool PhysicsRuntimeBehavior::CollisionWith(
    std::map<gd::String, std::vector<RuntimeObject *> *> otherObjectsLists,
    RuntimeScene &scene) {
  if (!body) CreateBody(scene);

  // Getting a list of all objects which are tested
  std::vector<RuntimeObject *> objects;
  for (std::map<gd::String, std::vector<RuntimeObject *> *>::const_iterator it =
           otherObjectsLists.begin();
       it != otherObjectsLists.end();
       ++it) {
    if (it->second != NULL) {
      objects.reserve(objects.size() + it->second->size());
      std::copy(
          it->second->begin(), it->second->end(), std::back_inserter(objects));
    }
  }

  // Test if an object of the list is in collision with our object.
  std::vector<RuntimeObject *>::const_iterator obj_end = objects.end();
  for (std::vector<RuntimeObject *>::iterator obj = objects.begin();
       obj != obj_end;
       ++obj) {
    std::set<PhysicsRuntimeBehavior *>::const_iterator it =
        currentContacts.begin();
    std::set<PhysicsRuntimeBehavior *>::const_iterator end =
        currentContacts.end();
    for (; it != end; ++it) {
      if ((*it)->GetObject() == (*obj)) return true;
    }
  }

  return false;
}

bool PhysicsRuntimeBehavior::IsStatic() { return !dynamic; }

bool PhysicsRuntimeBehavior::IsDynamic() { return dynamic; }

void PhysicsRuntimeBehavior::SetPolygonCoords(
    const std::vector<sf::Vector2f> &vec) {
  polygonCoords = vec;
}

const std::vector<sf::Vector2f> &PhysicsRuntimeBehavior::GetPolygonCoords()
    const {
  return polygonCoords;
}

bool PhysicsRuntimeBehavior::HasAutomaticResizing() const {
  return automaticResizing;
}

void PhysicsRuntimeBehavior::SetAutomaticResizing(bool b) {
  automaticResizing = b;
}

float PhysicsRuntimeBehavior::GetPolygonScaleX() const {
  if (automaticResizing)
    return object->GetWidth() / polygonWidth;
  else
    return polygonScaleX;
}

void PhysicsRuntimeBehavior::SetPolygonScaleX(float scX, RuntimeScene &scene) {
  polygonScaleX = scX;

  runtimeScenesPhysicsDatas->world->DestroyBody(body);
  CreateBody(scene);
}

float PhysicsRuntimeBehavior::GetPolygonScaleY() const {
  if (automaticResizing)
    return object->GetHeight() / polygonHeight;
  else
    return polygonScaleY;
}

void PhysicsRuntimeBehavior::SetPolygonScaleY(float scY, RuntimeScene &scene) {
  polygonScaleY = scY;

  runtimeScenesPhysicsDatas->world->DestroyBody(body);
  CreateBody(scene);
}

gd::String PhysicsRuntimeBehavior::GetStringFromCoordsVector(
    const std::vector<sf::Vector2f> &vec,
    char32_t coordsSep,
    char32_t composantSep) {
  gd::String coordsStr;

  for (std::size_t a = 0; a < vec.size(); a++) {
    coordsStr += gd::String::From(vec.at(a).x);
    coordsStr.push_back(composantSep);
    coordsStr += gd::String::From(vec.at(a).y);
    if (a != vec.size() - 1) coordsStr.push_back(coordsSep);
  }

  return coordsStr;
}

std::vector<sf::Vector2f> PhysicsRuntimeBehavior::GetCoordsVectorFromString(
    const gd::String &str, char32_t coordsSep, char32_t composantSep) {
  std::vector<sf::Vector2f> coordsVec;

  std::vector<gd::String> coordsDecomposed = str.Split(coordsSep);

  for (std::size_t a = 0; a < coordsDecomposed.size(); a++) {
    std::vector<gd::String> coordXY =
        coordsDecomposed.at(a).Split(composantSep);

    if (coordXY.size() != 2) continue;

    sf::Vector2f newCoord(coordXY.at(0).To<float>(), coordXY.at(1).To<float>());
    coordsVec.push_back(newCoord);
  }

  return coordsVec;
}
