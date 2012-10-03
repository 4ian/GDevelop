/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "ProjectResourcesCopier.h"
#include <map>
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/IDE/ResourcesMergingHelper.h"
#include "GDCore/IDE/wxTools/RecursiveMkDir.h"
#include "GDCore/CommonTools.h"
#include <wx/filename.h>
#include <wx/log.h>
#include <wx/utils.h>
#include <wx/progdlg.h>

using namespace std;

namespace gd
{

bool ProjectResourcesCopier::CopyAllResourcesTo(gd::Project & originalProject, std::string destinationDirectory, wxProgressDialog * optionalProgressDialog)
{
    boost::shared_ptr<gd::Project> project = boost::shared_ptr<gd::Project>(originalProject.Clone());

    //Get the resources to be copied
    gd::ResourcesMergingHelper resourcesMergingHelper;
    resourcesMergingHelper.SetBaseDirectory(gd::ToString(wxFileName::FileName(originalProject.GetProjectFile()).GetPath()));
    resourcesMergingHelper.PreserveDirectoriesStructure(true);

    project->ExposeResources(resourcesMergingHelper);

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
                    wxLogWarning( _( "Unable to copy \"")+it->first+_("\" to \"")+destinationFile.GetFullPath()+_("\"."));
                }
            }
        }

        ++i;
    }

    return true;
}

}
