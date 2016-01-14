/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "ProjectResourcesAdder.h"
#include "GDCore/Project/Project.h"
#include "GDCore/IDE/Project/ImagesUsedInventorizer.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"

using namespace std;

namespace gd
{

bool ProjectResourcesAdder::AddAllMissingImages(gd::Project & project)
{
    gd::ImagesUsedInventorizer inventorizer;
    project.ExposeResources(inventorizer);
    std::set<gd::String> & allImages = inventorizer.GetAllUsedImages();

    ResourcesManager & resourcesManager = project.GetResourcesManager();
    for (std::set<gd::String>::const_iterator it = allImages.begin(); it != allImages.end(); ++it)
    {
        if (!resourcesManager.HasResource(*it))
        {
            std::cout << "Adding missing resource \""<<*it<<"\"to the project.";
            resourcesManager.AddResource(*it, /*filename=*/*it, "image");
        }
    }

    return true;
}

std::vector<gd::String> ProjectResourcesAdder::GetAllUselessImages(gd::Project & project)
{
    std::vector<gd::String> unusedResources;

    //Search for used images
    gd::ImagesUsedInventorizer inventorizer;

    project.ExposeResources(inventorizer);
    std::set<gd::String> & usedImages = inventorizer.GetAllUsedImages();

    //Search all images resources not used
    std::vector<gd::String> resources = project.GetResourcesManager().GetAllResourcesList();
    for (std::size_t i = 0;i < resources.size();i++)
    {
        if (project.GetResourcesManager().GetResource(resources[i]).GetKind() != "image")
            continue;

        if (usedImages.find(resources[i]) == usedImages.end())
            unusedResources.push_back(resources[i]);
    }

    return unusedResources;
}

void ProjectResourcesAdder::RemoveAllUselessImages(gd::Project & project)
{
    std::vector<gd::String> unusedResources = GetAllUselessImages(project);

    for(std::size_t i = 0;i < unusedResources.size();++i) {
        project.GetResourcesManager().RemoveResource(unusedResources[i]);
    }
}

}
