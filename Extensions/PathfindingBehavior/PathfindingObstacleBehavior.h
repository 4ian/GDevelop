/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef PATHFINDINGOBSTACLEBEHAVIOR_H
#define PATHFINDINGOBSTACLEBEHAVIOR_H

#include "GDCpp/Behavior.h"
#include "GDCpp/RuntimeObject.h"
class ScenePathfindingObstaclesManager;
class RuntimeScene;
namespace gd { class SerializerElement; }
#if defined(GD_IDE_ONLY)
#include <map>
namespace gd { class PropertyDescriptor; }
namespace gd { class Project; }
namespace gd { class Layout; }
#endif

/**
 * \brief Behavior that mark object as being obstacles for objects using
 * pathfinding behavior.
 */
class GD_EXTENSION_API PathfindingObstacleBehavior : public Behavior
{
public:
    PathfindingObstacleBehavior();
    virtual ~PathfindingObstacleBehavior();
    virtual Behavior* Clone() const { return new PathfindingObstacleBehavior(*this); }

    /**
     * \brief Return the object owning this behavior.
     */
    RuntimeObject * GetObject() const { return object; }

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

    virtual void UnserializeFrom(const gd::SerializerElement & element);
    #if defined(GD_IDE_ONLY)
    virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(gd::Project & project) const;
    virtual bool UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project);
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

private:
    virtual void OnActivate();
    virtual void OnDeActivate();

    virtual void DoStepPreEvents(RuntimeScene & scene);
    virtual void DoStepPostEvents(RuntimeScene & scene);

    RuntimeScene * parentScene; ///< The scene the object belongs to.
    ScenePathfindingObstaclesManager * sceneManager; ///< The obstacles manager associated to the scene.
    bool registeredInManager; ///< True if the behavior is registered in the list of obstacles of the scene.
    bool impassable;
    float cost; ///< The cost of moving on the obstacle (for when impassable == false)
};

#endif // PATHFINDINGOBSTACLEBEHAVIOR_H
