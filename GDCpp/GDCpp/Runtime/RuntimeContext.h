#ifndef RUNTIMECONTEXT_H
#define RUNTIMECONTEXT_H

#include <vector>
#include <string>
#include <map>
#include "GDCpp/Runtime/String.h"
class RuntimeObject;
class RuntimeScene;
class RuntimeVariablesContainer;

/**
 * \brief Helper class used by events generated code to get access to
 * various things without including "heavy" classes such as RuntimeScene.
 */
class GD_API RuntimeContext
{
public:
    /**
     * \brief Construct the context for a scene.
     * \param scene The scene associated to the context.
     */
    RuntimeContext(RuntimeScene * scene_) : scene(scene_) {};
    virtual ~RuntimeContext() {};

    /**
     * \brief Shortcut to get a "raw pointers" list to objects with a specific name.
     * Equivalent to :
     * \code
     * scene->objectsInstances.GetObjectsRawPointers(name)
     * \endcode
     */
    std::vector<RuntimeObject*> GetObjectsRawPointers(const gd::String & name);

    /**
     * \brief Shortcut for scene->GetVariables();
     */
    RuntimeVariablesContainer & GetSceneVariables();

    /**
     * \brief Shortcut for scene.game->GetVariables();
     */
    RuntimeVariablesContainer & GetGameVariables();

    /**
     * \brief Used by "Trigger once" conditions: Return true only if
     * this method was not called with the same identifier during the last frame.
     */
    bool TriggerOnce(std::size_t conditionId);

    /**
     * \brief To be called when events begin so that "Trigger once" conditions
     * are properly handled.
     */
    void StartNewFrame();

    RuntimeContext & ClearObjectListsMap();
    RuntimeContext & AddObjectListToMap(const gd::String & objectName, std::vector<RuntimeObject*> & list);
    std::map <gd::String, std::vector<RuntimeObject*> *> ReturnObjectListsMap();

    RuntimeScene * scene; ///< The associated scene.

private:
    std::map <gd::String, std::vector<RuntimeObject*> *> temporaryMap;
    std::map <std::size_t, bool> onceConditionsTriggered;
    std::map <std::size_t, bool> onceConditionsTriggeredLastFrame;
};

#endif // RUNTIMECONTEXT_H
