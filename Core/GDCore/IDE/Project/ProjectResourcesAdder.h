/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef PROJECTRESOURCESADDER_H
#define PROJECTRESOURCESADDER_H
#include <vector>
#include "GDCore/String.h"
namespace gd { class Project; }

namespace gd
{

/**
 * \brief Automatically add missing resources of a project.
 *
 * \ingroup IDE
 */
class GD_CORE_API ProjectResourcesAdder
{
public:
    /**
     * \brief Update the project so that all missing images are added, with an filename
     * that is equal to the missing resource name.
     *
     * \param project The project to be updated.
     *
     * \return true if no error happened
     */
    static bool AddAllMissingImages(gd::Project & project);

    /**
     * \brief Find all resources that are
     * not used in the project.
     *
     * \note For now, only images resources can be tracked and marked
     * as not used.
     *
     * \param project The project to be crawled.
     *
     * \return A vector containing the name of all unused resources
     */
    static std::vector<gd::String> GetAllUselessImages(gd::Project & project);

    /**
     * \brief Remove all resources that are not used
     * in the project.
     *
     * \note For now, only images resources can be tracked and marked
     * as not used.
     *
     * \param project The project to be crawled.
     */
    static void RemoveAllUselessImages(gd::Project & project);
};

}

#endif // PROJECTRESOURCESADDER_H
