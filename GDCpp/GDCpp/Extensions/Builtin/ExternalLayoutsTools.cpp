#include "ExternalLayoutsTools.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/Project/ExternalLayout.h"
#include "GDCpp/RuntimeGame.h"

namespace ExternalLayoutsTools
{

void GD_API CreateObjectsFromExternalLayout(RuntimeScene & scene, const gd::String & externalLayoutName, float xOffset, float yOffset)
{
    for (std::size_t i = 0;i<scene.game->GetExternalLayoutsCount();++i)
    {
        if ( scene.game->GetExternalLayout(i).GetName() == externalLayoutName )
            scene.CreateObjectsFrom(scene.game->GetExternalLayout(i).GetInitialInstances(), xOffset, yOffset);
    }
}

}
