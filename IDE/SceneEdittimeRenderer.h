/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SceneEdittimeRenderer_H
#define SceneEdittimeRenderer_H

#include "GDL/RuntimeScene.h" // Must be placed first
#include "GDL/Game.h"
#include <SFML/Graphics.hpp>
#include <string>
#include <vector>

using namespace std;

/**
 * Used by a SceneCanvas to edit a scene
 */
class SceneEdittimeRenderer
{
    public:
        SceneEdittimeRenderer(sf::RenderWindow * renderWindow_, RuntimeGame * game_, Scene & sceneEdited_ );
        virtual ~SceneEdittimeRenderer();
        void RenderSceneEdittimeRenderer();

        RuntimeScene runtimeScene; ///< Base RuntimeScene
        Scene & sceneEdited; ///< associated Edited scene

        bool editing; //Car une SceneEdittimeRenderer peut aussi être jouée

        sf::View view; //Vue pour l'édition
        float zoom;

        //Ajout d'objet
        string objectToAdd;
        string addOnLayer;

        //Déplacement d'objets
        bool isMovingObject;
        bool isResizingX;
        bool isResizingY;
        bool isRotatingObject;
        vector < ObjSPtr > objectsSelected;
        vector < float > xObjectsSelected;
        vector < float > yObjectsSelected;
        int xDecalement;
        int yDecalement;
        ObjSPtr rightClickSelectedObject;

        //Rectangle de selection
        float xRectangleSelection;
        float yRectangleSelection;
        float xEndRectangleSelection;
        float yEndRectangleSelection;

        //Remember cursor old position
        int oldMouseX;
        int oldMouseY;

        //Déplacement avec la souris ( clic molette )
        bool isMoving;
        bool isSelecting;
        sf::Vector2i mouseStartPosition;
        sf::Vector2f viewStartPosition;

        ObjSPtr FindSmallestObject();

    private:
        void RenderGrid();
};

#endif // SceneEdittimeRenderer_H
