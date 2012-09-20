#include "ExternalLayoutsTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/RuntimeGame.h"
#include "GDL/ExternalLayout.h"

namespace ExternalLayoutsTools
{

void GD_API CreateObjectsFromExternalLayout(RuntimeScene & scene, const std::string & externalLayoutName, float xOffset, float yOffset)
{
    for (unsigned int i = 0;i<scene.game->GetExternalLayouts().size();++i)
    {
        if ( scene.game->GetExternalLayouts()[i]->GetName() == externalLayoutName )
            scene.CreateObjectsFrom(scene.game->GetExternalLayouts()[i]->GetInitialInstances(), xOffset, yOffset);
    }
}

}

