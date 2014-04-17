#include "RuntimeContext.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/profile.h"
#include <vector>

bool RuntimeContext::TriggerOnce(unsigned int conditionId)
{
	onceConditionsTriggered[conditionId] = true; //Remember that we triggered this condition.

	//Return true only if the condition was not triggered the last frame.
	std::map <unsigned int, bool>::iterator lastFrame = onceConditionsTriggeredLastFrame.find(conditionId);
	return lastFrame == onceConditionsTriggeredLastFrame.end() || lastFrame->second == false;
}

void RuntimeContext::StartNewFrame()
{
	onceConditionsTriggeredLastFrame = onceConditionsTriggered;
	onceConditionsTriggered.clear();
}

std::vector<RuntimeObject*> RuntimeContext::GetObjectsRawPointers(const std::string & name)
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

RuntimeContext & RuntimeContext::AddObjectListToMap(const std::string & objectName, std::vector<RuntimeObject*> & list)
{
    temporaryMap[objectName] = &list;

    return *this;
}

std::map <std::string, std::vector<RuntimeObject*> *> RuntimeContext::ReturnObjectListsMap()
{
    return temporaryMap;
}