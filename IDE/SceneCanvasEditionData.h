/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef SCENECANVASEDITIONDATA_H
#define SCENECANVASEDITIONDATA_H
#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>
#include <SFML/Graphics.hpp>
class Object;

class SceneCanvasEditionData
{
public:
    SceneCanvasEditionData();
    virtual ~SceneCanvasEditionData() {};

    bool editing; //Store the state of the ScenCanvas

    sf::View view; //sf::View used at edtitime

    //Ajout d'objet
    std::string objectToAdd;
    std::string currentLayer;

    //Déplacement d'objets
    bool isMovingObject;
    bool isResizingX;
    bool isResizingY;
    bool isRotatingObject;
    std::vector < boost::shared_ptr<Object> > objectsSelected;
    std::vector < float > xObjectsSelected;
    std::vector < float > yObjectsSelected;
    int xDecalement;
    int yDecalement;
    boost::shared_ptr<Object> rightClickSelectedObject;

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
};

#endif // SCENECANVASEDITIONDATA_H
