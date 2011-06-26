/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "AutomatismsSharedDatas.h"

AutomatismsSharedDatas::AutomatismsSharedDatas(std::string typeName) :
type(typeName)
{
}

void AutomatismsSharedDatas::SetName(std::string name_)
{
    name = name_;
}
