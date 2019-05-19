/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef PHYSICSRUNTIMEBEHAVIOR_H
#define PHYSICSRUNTIMEBEHAVIOR_H
#include <map>
#include <set>
#include <vector>
#include "GDCpp/Runtime/RuntimeBehavior.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "SFML/Config.hpp"
#include "SFML/System/Vector2.hpp"
namespace gd {
class Project;
class Layout;
class SerializerElement;
}
class RuntimeScene;
class b2Body;
class RuntimeScenePhysicsDatas;

namespace sf {
class Clock;
}

class GD_EXTENSION_API PhysicsRuntimeBehavior : public RuntimeBehavior {
 public:
  PhysicsRuntimeBehavior(const gd::SerializerElement& behaviorContent);
  virtual ~PhysicsRuntimeBehavior();
  virtual PhysicsRuntimeBehavior *Clone() const { return new PhysicsRuntimeBehavior(*this); }

  enum Positioning { OnOrigin = 0, OnCenter = 2 };

  /**
   * Destroy Box2D body if behavior is deactivated
   */
  virtual void OnDeActivate();

  b2Body *GetBox2DBody(const RuntimeScene &scene) {
    if (!body) CreateBody(scene);
    return body;
  }
  inline RuntimeObject *GetObject() { return object; };
  inline const RuntimeObject *GetObject() const { return object; };

  std::set<PhysicsRuntimeBehavior *>
      currentContacts;  ///< List of other bodies that are in contact with this
                        ///< body.

  void SetStatic(RuntimeScene &scene);
  void SetDynamic(RuntimeScene &scene);
  bool IsStatic();
  bool IsDynamic();
  void SetFixedRotation(RuntimeScene &scene);
  void SetFreeRotation(RuntimeScene &scene);
  void SetAsBullet(RuntimeScene &scene);
  void DontSetAsBullet(RuntimeScene &scene);
  void ApplyForce(double xCoordinate, double yCoordinate, RuntimeScene &scene);
  void ApplyForceUsingPolarCoordinates(float angle,
                                       float length,
                                       RuntimeScene &scene);
  void ApplyForceTowardPosition(float xPosition,
                                float yPosition,
                                float length,
                                RuntimeScene &scene);
  void ApplyImpulse(double xCoordinate,
                    double yCoordinate,
                    RuntimeScene &scene);
  void ApplyImpulseUsingPolarCoordinates(float angle,
                                         float length,
                                         RuntimeScene &scene);
  void ApplyImpulseTowardPosition(float xPosition,
                                  float yPosition,
                                  float length,
                                  RuntimeScene &scene);
  void ApplyTorque(double torque, RuntimeScene &scene);
  void SetLinearVelocity(double xVelocity,
                         double yVelocity,
                         RuntimeScene &scene);
  void SetAngularVelocity(double angularVelocity, RuntimeScene &scene);
  void SetLinearDamping(float linearDamping_, RuntimeScene &scene);
  void SetAngularDamping(float angularDamping_, RuntimeScene &scene);
  void AddRevoluteJointBetweenObjects(RuntimeObject *object,
                                      RuntimeScene &scene,
                                      float xPosRelativeToMassCenter,
                                      float yPosRelativeToMassCenter);
  void AddRevoluteJoint(float xPosition, float yPosition, RuntimeScene &scene);
  void SetGravity(float xGravity, float yGravity, RuntimeScene &scene);
  void AddGearJointBetweenObjects(RuntimeObject *object,
                                  float ratio,
                                  RuntimeScene &scene);

  void SetLinearVelocityX(double xVelocity, RuntimeScene &scene);
  void SetLinearVelocityY(double yVelocity, RuntimeScene &scene);
  float GetLinearVelocityX(RuntimeScene &scene);
  float GetLinearVelocityY(RuntimeScene &scene);
  float GetLinearVelocity(RuntimeScene &scene);
  double GetAngularVelocity(const RuntimeScene &scene);
  double GetLinearDamping(const RuntimeScene &scene);
  double GetAngularDamping(const RuntimeScene &scene);

  void SetPolygonCoords(const std::vector<sf::Vector2f> &);
  const std::vector<sf::Vector2f> &GetPolygonCoords() const;

  bool HasAutomaticResizing() const;
  void SetAutomaticResizing(bool);

  float GetPolygonScaleX() const;
  void SetPolygonScaleX(float, RuntimeScene &);

  float GetPolygonScaleY() const;
  void SetPolygonScaleY(float, RuntimeScene &);

  /**
  Return a string representing the coordinates vector.
  \param vec the vector containing coordinates
  \param coordsSep the separator between coordinates
  \param composantSep the separator between the X and Y composant of a
  coordinate \return a gd::String representing the vector
  */
  static gd::String GetStringFromCoordsVector(
      const std::vector<sf::Vector2f> &vec,
      char32_t coordsSep = U'\n',
      char32_t composantSep = U';');

  /**
  Return a vector created with a string containing coordinates
  \param str the string
  \param coordsSep the separator between coordinates
  \param composantSep the separator between the X and Y composant of a
  coordinate \return a std::vector< sf::Vector2f >
  */
  static std::vector<sf::Vector2f> GetCoordsVectorFromString(
      const gd::String &str,
      char32_t coordsSep = U'\n',
      char32_t composantSep = U';');

  bool CollisionWith(
      std::map<gd::String, std::vector<RuntimeObject *> *> otherObjectsLists,
      RuntimeScene &scene);

 private:
  virtual void DoStepPreEvents(RuntimeScene &scene);
  virtual void DoStepPostEvents(RuntimeScene &scene);
  void CreateBody(const RuntimeScene &scene);

  enum ShapeType {
    Box,
    Circle,
    CustomPolygon
  } shapeType;  ///< the kind of hitbox -> Box, Circle or CustomPolygon
  Positioning polygonPositioning;
  std::vector<sf::Vector2f>
      polygonCoords;  ///< The list of coordinates of the collision polygon

  bool automaticResizing;
  float polygonWidth;   ///< ONLY for automatic resizing, used to define a scale
                        ///< with automatic resizing
  float polygonHeight;  ///< ONLY for automatic resizing, used to define a scale
                        ///< with automatic resizing

  float polygonScaleX;  ///< ONLY for non-automatic resizing -> Use
                        ///< GetPolygonScaleX() instead to be sure to get a
                        ///< correct value
  float polygonScaleY;  ///< ONLY for non-automatic resizing -> Use
                        ///< GetPolygonScaleY() instead to be sure to get a
                        ///< correct value

  bool dynamic;        ///< Is the object static or dynamic
  bool fixedRotation;  ///< Is the rotation fixed or not
  bool isBullet;  ///< True if the object as to be considered as a bullet ( for
                  ///< better collision handling )
  float massDensity;
  float averageFriction;
  float averageRestitution;
  float linearDamping;
  float angularDamping;

  float objectOldX;
  float objectOldY;
  float objectOldAngle;
  float objectOldWidth;
  float objectOldHeight;

  sf::Clock *stepClock;

  b2Body *body;  ///< Box2D body, representing the object in the Box2D world
  RuntimeScenePhysicsDatas *runtimeScenesPhysicsDatas;
};

#endif  // PHYSICSRUNTIMEBEHAVIOR_H
