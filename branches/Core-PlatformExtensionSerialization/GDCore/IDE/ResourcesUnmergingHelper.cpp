/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ResourcesUnmergingHelper.h"
#include <wx/filename.h>
#include <string>

namespace gd
{

void gd::ResourcesUnmergingHelper::ExposeResource(std::string & resourceFilename)
{
    if ( resourceFilename.empty() ) return;

    resourceFilename = newDirectory + "/" + resourceFilename;
}

}







