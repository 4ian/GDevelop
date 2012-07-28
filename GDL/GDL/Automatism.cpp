/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include <iostream>
#include "Automatism.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"

Automatism::Automatism(std::string automatismTypeName) :
activated(true),
type(automatismTypeName)
{
}

void Automatism::SetName(const std::string & name_)
{
    name = name_;
}

#if defined(GD_IDE_ONLY)
void Automatism::EditAutomatism( wxWindow* parent, gd::Project & project, gd::Layout * optionalLayout, gd::MainFrameWrapper & mainFrameWrapper_ )
{
    try
    {
        EditAutomatism(parent, dynamic_cast<Game &>(project), dynamic_cast<Scene *>(optionalLayout), mainFrameWrapper_);
    }
    catch(...)
    {
        std::cout << "Unable to edit automatism: IDE probably passed a gd::Project which is not a GD C++ Platform project" << std::endl;
    }
}
#endif
