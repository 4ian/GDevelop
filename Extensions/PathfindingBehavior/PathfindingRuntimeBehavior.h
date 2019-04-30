/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef PATHFINDINGRUNTIMEBEHAVIOR_H
#define PATHFINDINGRUNTIMEBEHAVIOR_H
#include <SFML/System/Vector2.hpp>
#include <vector>
#include "GDCpp/Runtime/RuntimeBehavior.h"
#include "GDCpp/Runtime/Project/Object.h"
namespace gd {
class Layout;
}
class RuntimeScene;
class PlatformBehavior;
class ScenePathfindingObstaclesManager;
namespace gd {
class SerializerElement;
}
class RuntimeScenePlatformData;

/**
 * \brief Compute path for objects avoiding obstacles
 */
class GD_EXTENSION_API PathfindingRuntimeBehavior : public RuntimeBehavior {
 public:
  PathfindingRuntimeBehavior(const gd::SerializerElement& behaviorContent);
  virtual ~PathfindingRuntimeBehavior(){};
  virtual RuntimeBehavior* Clone() const { return new PathfindingRuntimeBehavior(*this); }

  /**
   * \brief Compute and move on the path to the specified destination.
   */
  void MoveTo(RuntimeScene& scene, float x, float y);

  // Path information:
  /**
   * \brief Return true if the latest call to MoveTo succeeded.
   */
  bool PathFound() { return pathFound; }

  /**
   * \brief Return true if the object reached its destination
   */
  bool DestinationReached() { return reachedEnd; }

  float GetNodeX(std::size_t index) const;
  float GetNodeY(std::size_t index) const;
  std::size_t GetNextNodeIndex() const;
  std::size_t GetNodeCount() const { return path.size(); };
  float GetNextNodeX() const;
  float GetNextNodeY() const;
  float GetLastNodeX() const;
  float GetLastNodeY() const;
  float GetDestinationX() const;
  float GetDestinationY() const;

  // Configuration:
  bool DiagonalsAllowed() { return allowDiagonals; };
  float GetAcceleration() { return acceleration; };
  float GetMaxSpeed() { return maxSpeed; };
  float GetAngularMaxSpeed() { return angularMaxSpeed; };
  bool IsObjectRotated() { return rotateObject; }
  float GetAngleOffset() { return angleOffset; };
  unsigned int GetCellWidth() { return cellWidth; };
  unsigned int GetCellHeight() { return cellHeight; };
  float GetExtraBorder() { return extraBorder; };

  void SetAllowDiagonals(bool allowDiagonals_) {
    allowDiagonals = allowDiagonals_;
  };
  void SetAcceleration(float acceleration_) { acceleration = acceleration_; };
  void SetMaxSpeed(float maxSpeed_) { maxSpeed = maxSpeed_; };
  void SetAngularMaxSpeed(float angularMaxSpeed_) {
    angularMaxSpeed = angularMaxSpeed_;
  };
  void SetRotateObject(bool rotateObject_) { rotateObject = rotateObject_; };
  void SetAngleOffset(float angleOffset_) { angleOffset = angleOffset_; };
  void SetCellWidth(unsigned int cellWidth_) { cellWidth = cellWidth_; };
  void SetCellHeight(unsigned int cellHeight_) { cellHeight = cellHeight_; };
  void SetExtraBorder(float extraBorder_) { extraBorder = extraBorder_; };

  float GetSpeed() { return speed; };
  void SetSpeed(float speed_) { speed = speed_; };

 private:
  virtual void DoStepPreEvents(RuntimeScene& scene);
  virtual void DoStepPostEvents(RuntimeScene& scene);
  void EnterSegment(std::size_t segmentNumber);

  RuntimeScene* parentScene;  ///< The scene the object belongs to.
  ScenePathfindingObstaclesManager*
      sceneManager;  ///< The platform objects manager associated to the scene.
  std::vector<sf::Vector2f> path;  ///< The computed path
  bool pathFound;

  // Behavior configuration:
  bool allowDiagonals;
  float acceleration;
  float maxSpeed;
  float angularMaxSpeed;
  bool rotateObject;  ///< If true, the object is rotated according to the
                      ///< current segment's angle.
  float angleOffset;  ///< Angle offset (added to the angle calculated with the
                      ///< segment)
  unsigned int cellWidth;
  unsigned int cellHeight;
  float extraBorder;

  // Attributes used for traveling on the path:
  float speed;
  float angularSpeed;
  float timeOnSegment;
  float totalSegmentTime;
  std::size_t currentSegment;
  bool reachedEnd;
};
#endif  // PATHFINDINGRUNTIMEBEHAVIOR_H
