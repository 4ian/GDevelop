#include "RuntimeContext.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/profile.h"
#include <vector>

bool RuntimeContext::TriggerOnce(std::size_t conditionId)
{
	onceConditionsTriggered[conditionId] = true; //Remember that we triggered this condition.

	//Return true only if the condition was not triggered the last frame.
	std::map <std::size_t, bool>::iterator lastFrame = onceConditionsTriggeredLastFrame.find(conditionId);
	return lastFrame == onceConditionsTriggeredLastFrame.end() || lastFrame->second == false;
}

void RuntimeContext::StartNewFrame()
{
	onceConditionsTriggeredLastFrame = onceConditionsTriggered;
	onceConditionsTriggered.clear();
}

std::vector<RuntimeObject*> RuntimeContext::GetObjectsRawPointers(const gd::String & name)
{
    return scene->objectsInstances.GetObjectsRawPointers(name);
}

RuntimeVariablesContainer & RuntimeContext::GetSceneVariables()
{
	return scene->GetVariables();
}

RuntimeVariablesContainer & RuntimeContext::GetGameVariables()
{
	return scene->game->GetVariables();
}

RuntimeContext & RuntimeContext::ClearObjectListsMap()
{
    temporaryMap.clear();

    return *this;
}

RuntimeContext & RuntimeContext::AddObjectListToMap(const gd::String & objectName, std::vector<RuntimeObject*> & list)
{
    temporaryMap[objectName] = &list;

    return *this;
}

std::map <gd::String, std::vector<RuntimeObject*> *> RuntimeContext::ReturnObjectListsMap()
{
    return temporaryMap;
}
