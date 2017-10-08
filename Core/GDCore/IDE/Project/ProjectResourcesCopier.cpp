/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "ProjectResourcesCopier.h"
#include <map>
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/filename.h>
#include <wx/utils.h>
#include <wx/progdlg.h>
#include <wx/msgdlg.h>
#endif
#include "GDCore/Project/Project.h"
#include "GDCore/IDE/Project/ResourcesMergingHelper.h"
#include "GDCore/IDE/Project/ResourcesAbsolutePathChecker.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/wxTools/RecursiveMkDir.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"

using namespace std;

namespace gd
{

bool ProjectResourcesCopier::CopyAllResourcesTo(gd::Project & originalProject, AbstractFileSystem & fs,
    gd::String destinationDirectory, bool updateOriginalProject, wxProgressDialog * optionalProgressDialog,
    bool askAboutAbsoluteFilenames, bool preserveDirectoryStructure)
{
    //Check if there are some resources with absolute filenames
    gd::ResourcesAbsolutePathChecker absolutePathChecker(fs);
    originalProject.ExposeResources(absolutePathChecker);
    bool copyAlsoResourcesWithAbsolutePath = !askAboutAbsoluteFilenames;


    #if !defined(GD_NO_WX_GUI)
    if ( !copyAlsoResourcesWithAbsolutePath )
    {
        copyAlsoResourcesWithAbsolutePath = absolutePathChecker.HasResourceWithAbsoluteFilenames() &&
            wxMessageBox(_("Some resources are using absolute filenames.\nDo you want them to be copied in the new folder of the project? If you choose No, they won't be modified."),
            _("Some resources are using absolute filenames."), wxYES_NO | wxICON_QUESTION) == wxYES;
    }
    #endif

    auto projectDirectory = fs.DirNameFrom(originalProject.GetProjectFile());
    std::cout << "Copying all ressources from " << projectDirectory << " to " << destinationDirectory;

    //Get the resources to be copied
    gd::ResourcesMergingHelper resourcesMergingHelper(fs);
    resourcesMergingHelper.SetBaseDirectory(projectDirectory);
    resourcesMergingHelper.PreserveDirectoriesStructure(preserveDirectoryStructure);
    resourcesMergingHelper.PreserveAbsoluteFilenames(!copyAlsoResourcesWithAbsolutePath);

    if ( updateOriginalProject )
    {
        originalProject.ExposeResources(resourcesMergingHelper);
    }
    else
    {
        std::shared_ptr<gd::Project> project(new gd::Project(originalProject));
        project->ExposeResources(resourcesMergingHelper);
    }

    //Copy resources
    map<gd::String, gd::String> & resourcesNewFilename = resourcesMergingHelper.GetAllResourcesOldAndNewFilename();
    unsigned int i = 0;
    for(map<gd::String, gd::String>::const_iterator it = resourcesNewFilename.begin(); it != resourcesNewFilename.end(); ++it)
    {
        if ( !it->first.empty() )
        {
            #if !defined(GD_NO_WX_GUI)
            if ( optionalProgressDialog )
            {
                if ( !optionalProgressDialog->Update(i/static_cast<float>(resourcesNewFilename.size())*100.0f, _("Exporting ")+it->second) )
                    return false; //User choose to abort.
            }
            #endif

            //Create the destination filename
            gd::String destinationFile = it->second;
            fs.MakeAbsolute(destinationFile, destinationDirectory);

            //Be sure the directory exists
            gd::String dir = fs.DirNameFrom(destinationFile);
            if ( !fs.DirExists(dir) ) fs.MkDir(dir);

            //We can now copy the file
            if ( !fs.CopyFile(it->first, destinationFile) )
            {
                gd::LogWarning( _( "Unable to copy \"")+it->first+_("\" to \"")+destinationFile+_("\"."));
            }
        }

        ++i;
    }

    return true;
}

}
