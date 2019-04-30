/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef PATHFINDINGOBSTACLERUNTIMEBEHAVIOR_H
#define PATHFINDINGOBSTACLERUNTIMEBEHAVIOR_H
#include "GDCpp/Runtime/RuntimeBehavior.h"
#include "GDCpp/Runtime/RuntimeObject.h"
class ScenePathfindingObstaclesManager;
class RuntimeScene;
namespace gd {
class SerializerElement;
}

/**
 * \brief Behavior that mark object as being obstacles for objects using
 * pathfinding behavior.
 */
class GD_EXTENSION_API PathfindingObstacleRuntimeBehavior : public RuntimeBehavior {
 public:
  PathfindingObstacleRuntimeBehavior(const gd::SerializerElement& behaviorContent);
  virtual ~PathfindingObstacleRuntimeBehavior();
  virtual PathfindingObstacleRuntimeBehavior* Clone() const {
    return new PathfindingObstacleRuntimeBehavior(*this);
  }

  /**
   * \brief Return the object owning this behavior.
   */
  RuntimeObject* GetObject() const { return object; }

  /**
   * \brief Return true if the obstacle is impassable.
   */
  bool IsImpassable() const { return impassable; }

  /**
   * \brief Set the object as impassable or not.
   */
  void SetImpassable(bool impassable_ = true) { impassable = impassable_; }

  /**
   * \brief Return the cost of moving on the object.
   */
  float GetCost() const { return cost; }

  /**
   * \brief Change the cost of moving on the object.
   */
  void SetCost(float newCost) { cost = newCost; }

 private:
  virtual void OnActivate();
  virtual void OnDeActivate();

  virtual void DoStepPreEvents(RuntimeScene& scene);
  virtual void DoStepPostEvents(RuntimeScene& scene);

  RuntimeScene* parentScene;  ///< The scene the object belongs to.
  ScenePathfindingObstaclesManager*
      sceneManager;          ///< The obstacles manager associated to the scene.
  bool registeredInManager;  ///< True if the behavior is registered in the list
                             ///< of obstacles of the scene.
  bool impassable;
  float cost;  ///< The cost of moving on the obstacle (for when impassable ==
               ///< false)
};

#endif  // PATHFINDINGOBSTACLERUNTIMEBEHAVIOR_H
