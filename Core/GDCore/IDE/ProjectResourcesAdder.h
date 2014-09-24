/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef PROJECTRESOURCESADDER_H
#define PROJECTRESOURCESADDER_H
#include <string>
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
     * \param project The project to be update.
     *
     * \return true if no error happened
     */
    static bool AddAllMissingImages(gd::Project & project);
};

}

#endif // PROJECTRESOURCESADDER_H
