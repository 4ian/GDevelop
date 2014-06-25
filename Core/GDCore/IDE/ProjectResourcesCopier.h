/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef PROJECTRESOURCESCOPIER_H
#define PROJECTRESOURCESCOPIER_H
#include <string>
namespace gd { class Project; }
namespace gd { class AbstractFileSystem; }
class wxProgressDialog;

namespace gd
{

/**
 * \brief Copy all resources files of a project to a directory.
 *
 * \ingroup IDE
 */
class GD_CORE_API ProjectResourcesCopier
{
public:
    /**
     * \brief Copy all resources files of a \a project to a the specified \a destinationDirectory.
     *
     * \param project The project to be used
     * \param fs The abstract file system to be used
     * \param destinationDirectory The directory where resources must be copied to
     * \param updateOriginalProject If set to true, \a project will be updated with the new resources filenames.
     * \param optionalProgressDialog An optional pointer to a wxProgressDialog. Can be NULL.
     * \param askAboutAbsoluteFilenames If set to false, the users won't be asked anything and the files
     * with absolutes filenames will be copied into the destination directory and their filenames updated.
     * \param preserveDirectoryStructure If set to true (default), the directories of the resources will be preserved
     * when copying. Otherwise, everything will be send in the destinationDirectory.
     *
     * \return true if no error happened
     */
    static bool CopyAllResourcesTo(gd::Project & project, gd::AbstractFileSystem & fs,
        std::string destinationDirectory, bool updateOriginalProject, wxProgressDialog * optionalProgressDialog = NULL,
        bool askAboutAbsoluteFilenames = true, bool preserveDirectoryStructure = true);
};

}

#endif // PROJECTRESOURCESCOPIER_H