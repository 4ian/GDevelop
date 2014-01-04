/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ResourcesAbsolutePathChecker.h"
#include <wx/filename.h>
#include <string>

namespace gd
{

void gd::ResourcesAbsolutePathChecker::ExposeResource(std::string & resourceFilename)
{
    if ( wxFileName::FileName(resourceFilename).IsAbsolute() )
        hasAbsoluteFilenames = true;
}

}
