/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#if !defined(EMSCRIPTEN)
#include "ResourcesUnmergingHelper.h"
#include <string>

namespace gd
{

void gd::ResourcesUnmergingHelper::ExposeResource(std::string & resourceFilename)
{
    if ( resourceFilename.empty() ) return;

    resourceFilename = newDirectory + "/" + resourceFilename;
}

}
#endif