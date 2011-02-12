/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EDITTIMESCENE_H
#define EDITTIMESCENE_H

#include "GDL/RuntimeScene.h" // Must be placed first
#include "GDL/Game.h"
#include <SFML/Graphics.hpp>
#include <string>
#include <vector>

using namespace std;

/**
 * Used by a SceneCanvas to edit a scene
 */
class EdittimeScene : public RuntimeScene
{
    public:
        EdittimeScene(sf::RenderWindow * renderWindow_, RuntimeGame * game_);
        virtual ~EdittimeScene();
        void RenderEdittimeScene();

        bool editing; //Car une EdittimeScene peut aussi être jouée

        sf::View view; //Vue pour l'édition
        float zoom;

        //Ajout d'objet
        string objectToAdd;
        string addOnLayer;

        //Grille
        bool grid;
        bool snap;
        int gridWidth;
        int gridHeight;
        int gridR;
        int gridG;
        int gridB;
        bool windowMask;

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

        //Rectangle de selection
        float xRectangleSelection;
        float yRectangleSelection;
        float xEndRectangleSelection;
        float yEndRectangleSelection;

        //Affichage de rectangles autour des selections
        int colorGUI;
        bool colorPlus;

        //Remember cursor old position
        int oldMouseX;
        int oldMouseY;

        //Déplacement avec la souris ( clic molette )
        bool isMoving;
        bool isSelecting;
        int deplacementOX;
        int deplacementOY;

        ObjSPtr FindSmallestObject();

    protected:
    private:
        void UpdateGUI();
        void RenderGrid();
};

#endif // EDITTIMESCENE_H
