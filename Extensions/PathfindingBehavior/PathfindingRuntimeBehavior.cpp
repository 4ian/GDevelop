/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "PathfindingRuntimeBehavior.h"
#include <algorithm>
#include <cmath>
#include <iostream>
#include <memory>
#include <set>
#include <unordered_map>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Extensions/Builtin/MathematicalTools.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "PathfindingObstacleRuntimeBehavior.h"
#include "ScenePathfindingObstaclesManager.h"

/**
 * \brief Internal tool class representing the position of a node when looking
 * for a path.
 */
class NodePosition {
 public:
  NodePosition(int x_, int y_) : x(x_), y(y_){};

  int x;
  int y;
};

std::ostream& operator<<(std::ostream& stream, const NodePosition& nodePos) {
  stream << nodePos.x << ";" << nodePos.y;
  return stream;
}

bool operator==(const NodePosition& a, const NodePosition& b) {
  return ((a.x == b.x) && (a.y == b.y));
}

namespace std {
/**
 * \brief Tool function used to store a NodePosition as key in
 * std::unordered_set.
 */
template <>
struct hash<NodePosition> {
  std::size_t operator()(NodePosition const& n) const {
    return (std::hash<int>()(n.x)) ^ (std::hash<int>()(n.y) << 1);
  }
};

}  // namespace std

namespace {
/**
 * \brief Internal tool class representing a node when looking for a path
 */
class Node {
 public:
  Node()
      : pos(0, 0),
        cost(0),
        smallestCost(-1),
        estimateCost(-1),
        parent(NULL),
        open(true){};
  Node(int x, int y)
      : pos(x, y),
        cost(0),
        smallestCost(-1),
        estimateCost(-1),
        parent(NULL),
        open(true){};
  Node(const NodePosition& pos_)
      : pos(pos_),
        cost(0),
        smallestCost(-1),
        estimateCost(-1),
        parent(NULL),
        open(true){};

  NodePosition pos;
  float cost;          ///< The cost for traveling on this node
  float smallestCost;  ///< the cost to go to this node (when considering the
                       ///< shortest path).
  float estimateCost;  ///< the estimate cost total to go to the destination
                       ///< through this node (when considering the shortest
                       ///< path).
  const Node* parent;  ///< The previous node to be visited to go to this node
                       ///< (when considering the shortest path).
  bool open;  ///< true if the node is "open" (must be explored), false if
              ///< "close" (already explored)

  /**
   * \brief Tool function used to store a Node in a priority_queue.
   */
  class NodeComparator {
   public:
    bool operator()(const Node* n1, const Node* n2) {
      return n1->estimateCost < n2->estimateCost;
    }
  };
};

bool operator==(Node const& n1, Node const& n2) {
  return n1.pos.x == n2.pos.x && n1.pos.y == n2.pos.y;
};

typedef float (*DistanceFunPtr)(const NodePosition&, const NodePosition&);

/**
 * \brief Internal tool class containing the structures used by A* and members
 * functions related to them.
 */
class SearchContext {
 public:
  SearchContext(ScenePathfindingObstaclesManager& obstacles_,
                bool allowsDiagonal_ = true)
      : obstacles(obstacles_),
        finalNode(NULL),
        destination(0, 0),
        startX(0),
        startY(0),
        allowsDiagonal(allowsDiagonal_),
        maxComplexityFactor(50),
        cellWidth(20),
        cellHeight(20),
        leftBorder(0),
        rightBorder(0),
        topBorder(0),
        bottomBorder(0) {
    distanceFunction = allowsDiagonal ? &SearchContext::EuclideanDistance
                                      : &SearchContext::ManhattanDistance;
  }

  /**
   * \brief Set the start position.
   * \param x The coordinate on X axis of the start position, in "world"
   * coordinates. \param y The coordinate on Y axis of the start position, in
   * "world" coordinates.
   */
  SearchContext& SetStartPosition(float x, float y) {
    startX = x;
    startY = y;
    return *this;
  }

  /**
   * \brief Set the size to be considered for the object for which the path will
   * be planned.
   */
  SearchContext& SetObjectSize(float leftBorder_,
                               float topBorder_,
                               float rightBorder_,
                               float bottomBorder_) {
    leftBorder = leftBorder_;
    rightBorder = rightBorder_;
    topBorder = topBorder_;
    bottomBorder = bottomBorder_;
    return *this;
  }

  /**
   * \brief Change the size of a virtual cell, in pixels.
   */
  SearchContext& SetCellSize(unsigned int cellWidth_,
                             unsigned int cellHeight_) {
    cellWidth = cellWidth_;
    cellHeight = cellHeight_;
    return *this;
  }

  /**
   * \brief Compute a path to the specified position, considering the obstacles
   * and the start position passed in the constructor.
   * \return true if computation found a path, in which case you can call
   * GetFinalNode method to construct the path. \param x The coordinate on X
   * axis of the target position, in "world" coordinates. \param y The
   * coordinate on Y axis of the target position, in "world" coordinates.
   */
  bool ComputePathTo(float targetX, float targetY) {
    destination = NodePosition(GDRound(targetX / cellWidth),
                               GDRound(targetY / cellHeight));
    NodePosition start(GDRound(startX / cellWidth),
                       GDRound(startY / cellHeight));

    // Initialize the algorithm
    allNodes.clear();
    Node& startNode = GetNode(start);
    startNode.smallestCost = 0;
    startNode.estimateCost = 0 + distanceFunction(start, destination);
    openNodes.clear();
    openNodes.insert(&startNode);

    // A* algorithm main loop
    std::size_t iterationCount = 0;
    std::size_t maxIterationCount =
        startNode.estimateCost * maxComplexityFactor;
    while (!openNodes.empty()) {
      if (iterationCount++ > maxIterationCount)
        return false;  // Make sure we do not search forever.

      Node* n = *openNodes.begin();  // Get the most promising node...
      n->open = false;               //...and flag it as explored
      openNodes.erase(
          openNodes.begin());  // Be sure to remove ONLY the first element!

      // Check if we reached destination?
      if (n->pos.x == destination.x && n->pos.y == destination.y) {
        finalNode = n;
        return true;
      }

      // No, so add neighbors to the nodes to explore.
      InsertNeighbors(*n);
    }

    return false;
  }

  /**
   * @return The final node of the computed path.
   * Iterate on the parent member to create the path. Beware, the coordinates of
   * the node must be multiplied by the cell size to get the "world" coordinates
   * of the path.
   */
  Node* GetFinalNode() const { return finalNode; }

 private:
  /**
   * Insert the neighbors of the current node in the open list
   * (Only if they are not closed, and if the cost is better than the already
   * existing smallest cost).
   */
  void InsertNeighbors(const Node& currentNode) {
    AddOrUpdateNode(
        NodePosition(currentNode.pos.x + 1, currentNode.pos.y), currentNode, 1);
    AddOrUpdateNode(
        NodePosition(currentNode.pos.x - 1, currentNode.pos.y), currentNode, 1);
    AddOrUpdateNode(
        NodePosition(currentNode.pos.x, currentNode.pos.y + 1), currentNode, 1);
    AddOrUpdateNode(
        NodePosition(currentNode.pos.x, currentNode.pos.y - 1), currentNode, 1);
    if (allowsDiagonal) {
      AddOrUpdateNode(
          NodePosition(currentNode.pos.x + 1, currentNode.pos.y + 1),
          currentNode,
          sqrt2);
      AddOrUpdateNode(
          NodePosition(currentNode.pos.x + 1, currentNode.pos.y - 1),
          currentNode,
          sqrt2);
      AddOrUpdateNode(
          NodePosition(currentNode.pos.x - 1, currentNode.pos.y - 1),
          currentNode,
          sqrt2);
      AddOrUpdateNode(
          NodePosition(currentNode.pos.x - 1, currentNode.pos.y + 1),
          currentNode,
          sqrt2);
    }
  }

  /**
   * \brief Get (or dynamically construct) a node.
   *
   * *All* nodes should be created using this method: The cost of the node is
   * computed thanks to the objects flagged as obstacles.
   */
  Node& GetNode(const NodePosition& pos) {
    if (allNodes.find(pos) != allNodes.end()) return allNodes.find(pos)->second;

    Node newNode(pos);

    bool objectsOnCell = false;
    const std::set<PathfindingObstacleRuntimeBehavior*>& allObstacles =
        obstacles.GetAllObstacles();
    for (std::set<PathfindingObstacleRuntimeBehavior*>::const_iterator it =
             allObstacles.begin();
         it != allObstacles.end();
         ++it) {
      RuntimeObject* obj = (*it)->GetObject();
      int topLeftCellX =
          floor((obj->GetDrawableX() - rightBorder) / (float)cellWidth);
      int topLeftCellY =
          floor((obj->GetDrawableY() - bottomBorder) / (float)cellHeight);
      int bottomRightCellX =
          ceil((obj->GetDrawableX() + obj->GetWidth() + leftBorder) /
               (float)cellWidth);
      int bottomRightCellY =
          ceil((obj->GetDrawableY() + obj->GetHeight() + topBorder) /
               (float)cellHeight);
      if (topLeftCellX < pos.x && pos.x < bottomRightCellX &&
          topLeftCellY < pos.y && pos.y < bottomRightCellY) {
        objectsOnCell = true;
        if ((*it)->IsImpassable()) {
          newNode.cost = -1;
          break;  // The cell is impassable, stop here.
        } else    // Superimpose obstacles
          newNode.cost += (*it)->GetCost();
      }
    }

    if (!objectsOnCell)
      newNode.cost = 1;  // Default cost when no objects put on the cell.

    allNodes[pos] = newNode;
    return allNodes[pos];
  }

  /**
   * Compute the euclidean distance between two positions.
   */
  static float EuclideanDistance(const NodePosition& a, const NodePosition& b) {
    return sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
  }

  /**
   * Compute the taxi distance between two positions.
   */
  static float ManhattanDistance(const NodePosition& a, const NodePosition& b) {
    return abs(a.x - b.x) + abs(a.y - b.y);
  }

  /**
   * Add a node to the openNodes (only if the cost to reach it is less than the
   * existing cost, if any).
   */
  void AddOrUpdateNode(const NodePosition& newNodePosition,
                       const Node& currentNode,
                       float factor) {
    Node& neighbor = GetNode(newNodePosition);
    if (!neighbor.open ||
        neighbor.cost < 0)  // cost < 0 means impassable obstacle
      return;

    // Update the node costs and parent if the path coming from currentNode is
    // better:
    if (neighbor.smallestCost == -1 ||
        neighbor.smallestCost >
            currentNode.smallestCost +
                (currentNode.cost + neighbor.cost) / 2.0 * factor) {
      if (neighbor.smallestCost != -1)  // The node is already in the open list:
      {
        // remove it as its estimate cost will be updated.
        auto it = openNodes.find(&neighbor);
        if (it !=
            openNodes.end())  // /!\ ALWAYS use an iterator with multiset::erase
          openNodes.erase(it);  // otherwise, other nodes which are equivalent
                                // get removed too.
      }

      neighbor.smallestCost = currentNode.smallestCost +
                              (currentNode.cost + neighbor.cost) / 2.0 * factor;
      neighbor.parent = &currentNode;
      neighbor.estimateCost =
          neighbor.smallestCost + distanceFunction(neighbor.pos, destination);

      openNodes.insert(&neighbor);
    }
  }

  std::unordered_map<NodePosition, Node> allNodes;  ///< All the nodes
  std::multiset<Node*, Node::NodeComparator>
      openNodes;  ///< Only the open nodes (Such that Node::open == true)
  const ScenePathfindingObstaclesManager&
      obstacles;    ///< A reference to all the obstacles of the scene
  Node* finalNode;  // If computation succeeded, the final node is stored here.
  NodePosition destination;
  int startX;  ///< The start X position, in "world" coordinates (not in "node"
               ///< coordinates!).
  int startY;  ///< The start Y position, in "world" coordinates (not in "node"
               ///< coordinates!).
  DistanceFunPtr distanceFunction;
  bool allowsDiagonal;  ///< True to allow diagonals when planning the path.
  std::size_t maxComplexityFactor;
  float cellWidth;
  float cellHeight;
  float leftBorder;
  float rightBorder;
  float topBorder;
  float bottomBorder;

  static const float sqrt2;
};

const float SearchContext::sqrt2 = 1.414213562;

}  // namespace

PathfindingRuntimeBehavior::PathfindingRuntimeBehavior(
    const gd::SerializerElement& behaviorContent)
    : RuntimeBehavior(behaviorContent),
      parentScene(NULL),
      sceneManager(NULL),
      pathFound(false),
      allowDiagonals(true),
      acceleration(400),
      maxSpeed(200),
      angularMaxSpeed(180),
      rotateObject(true),
      angleOffset(0),
      cellWidth(20),
      cellHeight(20),
      extraBorder(0),
      speed(0),
      angularSpeed(0),
      timeOnSegment(0),
      totalSegmentTime(0),
      currentSegment(0),
      reachedEnd(false) {
  allowDiagonals = behaviorContent.GetBoolAttribute("allowDiagonals");
  acceleration = behaviorContent.GetDoubleAttribute("acceleration");
  maxSpeed = behaviorContent.GetDoubleAttribute("maxSpeed");
  angularMaxSpeed = behaviorContent.GetDoubleAttribute("angularMaxSpeed");
  rotateObject = behaviorContent.GetBoolAttribute("rotateObject");
  angleOffset = behaviorContent.GetDoubleAttribute("angleOffset");
  extraBorder = behaviorContent.GetDoubleAttribute("extraBorder");
  {
    int value = behaviorContent.GetIntAttribute("cellWidth", 0);
    if (value > 0) cellWidth = value;
  }
  {
    int value = behaviorContent.GetIntAttribute("cellHeight", 0);
    if (value > 0) cellHeight = value;
  }
}

void PathfindingRuntimeBehavior::MoveTo(RuntimeScene& scene, float x, float y) {
  if (parentScene != &scene)  // Parent scene has changed
  {
    parentScene = &scene;
    sceneManager = parentScene
                       ? &ScenePathfindingObstaclesManager::managers[&scene]
                       : NULL;
  }

  path.clear();

  // First be sure that there is a path to compute.
  int targetCellX = GDRound(x / (float)cellWidth);
  int targetCellY = GDRound(y / (float)cellHeight);
  int startCellX = GDRound(object->GetX() / (float)cellWidth);
  int startCellY = GDRound(object->GetY() / (float)cellHeight);
  if (startCellX == targetCellX && startCellY == targetCellY) {
    path.push_back(sf::Vector2f(object->GetX(), object->GetY()));
    path.push_back(sf::Vector2f(x, y));
    EnterSegment(0);
    pathFound = true;
    return;
  }

  // Start searching for a path
  // TODO: Customizable heuristic.
  ::SearchContext ctx(*sceneManager, allowDiagonals);
  ctx.SetCellSize(cellWidth, cellHeight)
      .SetStartPosition(object->GetX(), object->GetY());
  ctx.SetObjectSize(object->GetX() - object->GetDrawableX() + extraBorder,
                    object->GetY() - object->GetDrawableY() + extraBorder,
                    object->GetWidth() -
                        (object->GetX() - object->GetDrawableX()) + extraBorder,
                    object->GetHeight() -
                        (object->GetY() - object->GetDrawableY()) +
                        extraBorder);
  if (ctx.ComputePathTo(x, y)) {
    // Path found: memorize it
    const ::Node* node = ctx.GetFinalNode();
    while (node) {
      path.push_back(sf::Vector2f(node->pos.x * (float)cellWidth,
                                  node->pos.y * (float)cellHeight));
      node = node->parent;
    }

    std::reverse(path.begin(), path.end());
    path[0] = sf::Vector2f(object->GetX(), object->GetY());
    EnterSegment(0);
    pathFound = true;
    return;
  }

  // Not path found
  pathFound = false;
}

void PathfindingRuntimeBehavior::EnterSegment(std::size_t segmentNumber) {
  if (path.empty()) return;

  currentSegment = segmentNumber;
  if (currentSegment < path.size() - 1) {
    sf::Vector2f newPath = (path[currentSegment + 1] - path[currentSegment]);
    totalSegmentTime = sqrtf(newPath.x * newPath.x + newPath.y * newPath.y);
    timeOnSegment = 0;
    reachedEnd = false;
  } else {
    reachedEnd = true;
    speed = 0;
  }
}

void PathfindingRuntimeBehavior::DoStepPreEvents(RuntimeScene& scene) {
  if (parentScene != &scene)  // Parent scene has changed
  {
    parentScene = &scene;
    sceneManager = parentScene
                       ? &ScenePathfindingObstaclesManager::managers[&scene]
                       : NULL;
  }

  if (!sceneManager) return;

  if (path.empty() || reachedEnd) return;

  // Update the speed of the object
  float timeDelta =
      static_cast<double>(object->GetElapsedTime(scene)) / 1000000.0;
  speed += acceleration * timeDelta;
  if (speed > maxSpeed) speed = maxSpeed;
  angularSpeed = angularMaxSpeed;  // No acceleration for angular speed for now

  // Update the time on the segment and change segment if needed
  timeOnSegment += speed * timeDelta;
  if (timeOnSegment >= totalSegmentTime && currentSegment < path.size())
    EnterSegment(currentSegment + 1);

  // Position object on the segment and update its angle
  sf::Vector2f newPos;
  float pathAngle = object->GetAngle();
  if (currentSegment < path.size() - 1) {
    newPos = path[currentSegment] +
             (path[currentSegment + 1] - path[currentSegment]) *
                 (timeOnSegment / totalSegmentTime);
    pathAngle = atan2(path[currentSegment + 1].y - path[currentSegment].y,
                      path[currentSegment + 1].x - path[currentSegment].x) *
                    180 / 3.14159 +
                angleOffset;
  } else
    newPos = path.back();

  object->SetX(newPos.x);
  object->SetY(newPos.y);

  // Also update angle if needed
  if (rotateObject) object->RotateTowardAngle(pathAngle, angularSpeed, scene);
}

void PathfindingRuntimeBehavior::DoStepPostEvents(RuntimeScene& scene) {
  if (parentScene != &scene)  // Parent scene has changed
  {
    parentScene = &scene;
    sceneManager = parentScene
                       ? &ScenePathfindingObstaclesManager::managers[&scene]
                       : NULL;
  }
}

float PathfindingRuntimeBehavior::GetNodeX(std::size_t index) const {
  if (index < path.size()) return path[index].x;
  return 0;
}
float PathfindingRuntimeBehavior::GetNodeY(std::size_t index) const {
  if (index < path.size()) return path[index].y;
  return 0;
}
std::size_t PathfindingRuntimeBehavior::GetNextNodeIndex() const {
  if (currentSegment + 1 < path.size())
    return currentSegment + 1;
  else
    return path.size() - 1;
}
float PathfindingRuntimeBehavior::GetNextNodeX() const {
  if (path.empty()) return 0;

  if (currentSegment + 1 < path.size())
    return path[currentSegment + 1].x;
  else
    return path.back().x;
}
float PathfindingRuntimeBehavior::GetNextNodeY() const {
  if (path.empty()) return 0;

  if (currentSegment + 1 < path.size())
    return path[currentSegment + 1].y;
  else
    return path.back().y;
}
float PathfindingRuntimeBehavior::GetLastNodeX() const {
  if (path.size() < 2) return 0;

  if (currentSegment < path.size() - 1)
    return path[currentSegment].x;
  else
    return path[path.size() - 1].x;
}
float PathfindingRuntimeBehavior::GetLastNodeY() const {
  if (path.size() < 2) return 0;

  if (currentSegment < path.size() - 1)
    return path[currentSegment].y;
  else
    return path[path.size() - 1].y;
}
float PathfindingRuntimeBehavior::GetDestinationX() const {
  if (path.empty()) return 0;
  return path.back().x;
}
float PathfindingRuntimeBehavior::GetDestinationY() const {
  if (path.empty()) return 0;
  return path.back().y;
}
