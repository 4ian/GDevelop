/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if !defined(EMSCRIPTEN)
#include "ProjectResourcesCopier.h"
#include <map>
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/filename.h>
#include <wx/utils.h>
#include <wx/progdlg.h>
#include <wx/msgdlg.h>
#endif
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/IDE/ResourcesMergingHelper.h"
#include "GDCore/IDE/ResourcesAbsolutePathChecker.h"
#include "GDCore/IDE/wxTools/RecursiveMkDir.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"

using namespace std;

namespace gd
{

bool ProjectResourcesCopier::CopyAllResourcesTo(gd::Project & originalProject, std::string destinationDirectory, bool updateOriginalProject,
                                                wxProgressDialog * optionalProgressDialog, bool askAboutAbsoluteFilenames,
                                                bool preserveDirectoryStructure)
{
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    //Check if there are some resources with absolute filenames
    gd::ResourcesAbsolutePathChecker absolutePathChecker;
    originalProject.ExposeResources(absolutePathChecker);
    bool copyAlsoResourcesWithAbsolutePath = ( !askAboutAbsoluteFilenames ||
                                               (absolutePathChecker.HasResourceWithAbsoluteFilenames() &&
                                               wxMessageBox(_("Some resources are using absolute filenames.\nDo you want them to be copied in the new folder of the project? If you choose No, they won't be modified."),
                                                            _("Some resources are using absolute filenames."),
                                                            wxYES_NO | wxICON_QUESTION) == wxYES ));

    //Get the resources to be copied
    gd::ResourcesMergingHelper resourcesMergingHelper;
    resourcesMergingHelper.SetBaseDirectory(gd::ToString(wxFileName::FileName(originalProject.GetProjectFile()).GetPath()));
    resourcesMergingHelper.PreserveDirectoriesStructure(preserveDirectoryStructure);
    resourcesMergingHelper.PreserveAbsoluteFilenames(!copyAlsoResourcesWithAbsolutePath);

    if ( updateOriginalProject )
    {
        originalProject.ExposeResources(resourcesMergingHelper);
    }
    else
    {
        boost::shared_ptr<gd::Project> project(new gd::Project(originalProject));
        project->ExposeResources(resourcesMergingHelper);
    }

    //Copy resources
    map<string, string> & resourcesNewFilename = resourcesMergingHelper.GetAllResourcesOldAndNewFilename();
    unsigned int i = 0;
    for(map<string, string>::const_iterator it = resourcesNewFilename.begin(); it != resourcesNewFilename.end(); ++it)
    {
        if ( !it->first.empty() )
        {
            if ( optionalProgressDialog )
            {
                if ( !optionalProgressDialog->Update(i/static_cast<float>(resourcesNewFilename.size())*100.0f, _("Exporting ")+it->second) )
                    return false; //User choose to abort.
            }

            //Create the destination filename
            wxFileName destinationFile(destinationDirectory + "/" + it->second);
            destinationFile.Normalize();

            if ( destinationFile.GetFullPath() != it->first )
            {
                //Be sure the directory exists
                if ( !wxDirExists(destinationFile.GetPath()) ) gd::RecursiveMkDir::MkDir(destinationFile.GetPath());

                //We can now copy the file
                bool copySucceeded = false;
                {
                    wxLogNull noLogPlease;
                    copySucceeded = wxCopyFile( it->first, destinationFile.GetFullPath(), true );
                }
                if ( !copySucceeded )
                {
                    gd::LogWarning( gd::ToString(_( "Unable to copy \"")+it->first+_("\" to \"")+destinationFile.GetFullPath()+_("\".")));
                }
            }
        }

        ++i;
    }

    return true;
#else
    gd::LogError(_("You tried to use ProjectResourcesCopier::CopyAllResourcesTo which is currently unsupported when wxwidgets support is disabled."));
    return false;
#endif
}

}
#endif