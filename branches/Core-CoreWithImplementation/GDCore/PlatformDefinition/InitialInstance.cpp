/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "InitialInstance.h"
#if !defined(GD_IDE_ONLY) //TODO : C++ Platform Specific Code
#include "GDL/Scene.h"
#include "GDL/Game.h"
#endif

namespace gd
{

InitialInstance::InitialInstance() :
    objectName(""),
    x(0),
    y(0),
    angle(0),
    zOrder(0),
    layer(""),
    personalizedSize(false),
    width(0),
    height(0),
    locked(false)
{
}


#if defined(GD_IDE_ONLY) //TODO : C++ Platform Specific Code
std::map<std::string, std::string> gd::InitialInstance::GetCustomProperties(gd::Project & project, gd::Layout & layout)
{
    //TODO
    /*
    try
    {
        Scene & scene = dynamic_cast<Scene&>(layout);
        Game & game = dynamic_cast<Game&>(project);

        //Find an object
        std::vector<ObjSPtr>::const_iterator sceneObject = std::find_if(scene.GetInitialObjects().begin(), scene.GetInitialObjects().end(), std::bind2nd(ObjectHasName(), GetObjectName()));
        std::vector<ObjSPtr>::const_iterator globalObject = std::find_if(game.GetGlobalObjects().begin(), game.GetGlobalObjects().end(), std::bind2nd(ObjectHasName(), GetObjectName()));

        ObjSPtr object = boost::shared_ptr<Object> ();

        if ( sceneObject != scene.GetInitialObjects().end() ) //We check first scene's objects' list.
            return (*sceneObject)->GetInitialInstanceProperties(*this, game, scene);
        else if ( globalObject != game.GetGlobalObjects().end() ) //Then the global object list
            return (*globalObject)->GetInitialInstanceProperties(*this, game, scene);
    }
    catch (...) { std::cout << "Warning: IDE probably sent a wrong project or layout to a GD C++ InitialInstance."; std::cout << char(7); }

    std::map<std::string, std::string> nothing;
    return nothing;*/
}

bool gd::InitialInstance::UpdateCustomProperty(const std::string & name, const std::string & value, gd::Project & project, gd::Layout & layout)
{
    //TODO
    /*
    try
    {
        Scene & scene = dynamic_cast<Scene&>(layout);
        Game & game = dynamic_cast<Game&>(project);

        //Find an object
        std::vector<ObjSPtr>::const_iterator sceneObject = std::find_if(scene.GetInitialObjects().begin(), scene.GetInitialObjects().end(), std::bind2nd(ObjectHasName(), GetObjectName()));
        std::vector<ObjSPtr>::const_iterator globalObject = std::find_if(game.GetGlobalObjects().begin(), game.GetGlobalObjects().end(), std::bind2nd(ObjectHasName(), GetObjectName()));

        ObjSPtr object = boost::shared_ptr<Object> ();

        if ( sceneObject != scene.GetInitialObjects().end() ) //We check first scene's objects' list.
            return (*sceneObject)->UpdateInitialInstanceProperty(*this, name, value, game, scene);
        else if ( globalObject != game.GetGlobalObjects().end() ) //Then the global object list
            return (*globalObject)->UpdateInitialInstanceProperty(*this, name, value, game, scene);
    }
    catch (...) { std::cout << "Warning: IDE probably sent a wrong project or layout to a GD C++ InitialInstance ."; std::cout << char(7); }

    return false;*/
}

#endif

}
