/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include <string>
#include "GDCore/PlatformDefinition/ResourcesManager.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/CommonTools.h"
#include <wx/filename.h>

namespace gd
{
std::string Resource::badStr;

std::string Resource::GetAbsoluteFile(const gd::Project & project) const
{
    wxString projectDir = wxFileName::FileName(project.GetProjectFile()).GetPath();
    wxFileName filename = wxFileName::FileName(GetFile());
    filename.MakeAbsolute(projectDir);
    return ToString(filename.GetFullPath());
}

}
