/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "ProjectResourcesAdder.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/IDE/ImagesUsedInventorizer.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"

using namespace std;

namespace gd
{

bool ProjectResourcesAdder::AddAllMissingImages(gd::Project & project)
{
    ImagesUsedInventorizer inventorizer;
    project.ExposeResources(inventorizer);
    std::set<std::string> & allImages = inventorizer.GetAllUsedImages();

    ResourcesManager & resourcesManager = project.GetResourcesManager();
    for (std::set<std::string>::const_iterator it = allImages.begin(); it != allImages.end(); ++it)
    {
        if (!resourcesManager.HasResource(*it))
        {
            std::cout << "Adding missing resource \""<<*it<<"\"to the project.";
            resourcesManager.AddResource(*it, /*filename=*/*it); //Note that AddResource add a image resource by default.
        }
    }

    return true;
}

}
