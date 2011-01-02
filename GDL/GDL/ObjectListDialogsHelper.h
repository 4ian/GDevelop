/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

 #if defined(GDE)

#ifndef OBJECTLISTDIALOGSHELPER_H
#define OBJECTLISTDIALOGSHELPER_H

#include <wx/treectrl.h>
#include <string>
class Game;
class Scene;

/**
 * Class containing utility functions for displaying objects lists in tree controls.
 */
class GD_API ObjectListDialogsHelper
{
    public:
        ObjectListDialogsHelper(const Game & game_, const Scene & scene_) : game(game_), scene(scene_) {};
        virtual ~ObjectListDialogsHelper() {};

        void RefreshLists(wxTreeCtrl * sceneObjectsList, wxTreeCtrl * sceneGroupsList, wxTreeCtrl * globalObjectsList, wxTreeCtrl * globalGroupsList, std::string objectTypeAllowed = "", std::string searchText = "");

    private:
        const Game & game;
        const Scene & scene;
};

#endif // OBJECTLISTDIALOGSHELPER_H
#endif
