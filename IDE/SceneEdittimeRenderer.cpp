#include "SceneEdittimeRenderer.h" //Must be placed first

#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>

#include "GDL/RuntimeScene.h"
#include "GDL/RuntimeGame.h"
#include "GDL/Game.h"
#include <vector>

SceneEdittimeRenderer::SceneEdittimeRenderer(sf::RenderWindow * renderWindow_, RuntimeGame * game_, Scene & sceneEdited_) :
runtimeScene(renderWindow_, game_),
sceneEdited(sceneEdited_),
editing(true),
view( sf::FloatRect( 0.0f, 0.0f, runtimeScene.game->windowWidth, runtimeScene.game->windowHeight ) ),
isMovingObject( false ),
isResizingX( false ),
isResizingY( false ),
xRectangleSelection(0),
yRectangleSelection(0),
xEndRectangleSelection(0),
yEndRectangleSelection(0),
isMoving( false ),
isSelecting(false)
{
    //ctor
    runtimeScene.renderWindow->SetView(view);
    runtimeScene.running = false;
}

SceneEdittimeRenderer::~SceneEdittimeRenderer()
{
    //dtor
}


////////////////////////////////////////////////////////////
/// Affichage de la scène en mode édition, à son départ.
////////////////////////////////////////////////////////////
void SceneEdittimeRenderer::RenderSceneEdittimeRenderer()
{
    runtimeScene.ManageRenderTargetEvents();

    runtimeScene.renderWindow->Clear( sf::Color( runtimeScene.backgroundColorR, runtimeScene.backgroundColorG, runtimeScene.backgroundColorB ) );
    runtimeScene.renderWindow->SetView(view);

    glClear(GL_DEPTH_BUFFER_BIT);
    runtimeScene.renderWindow->SaveGLStates(); //To allow using OpenGL to draw

    //On trie les objets par leurs plans
    ObjList allObjects = runtimeScene.objectsInstances.GetAllObjects();
    runtimeScene.OrderObjectsByZOrder( allObjects );

    std::vector < sf::Shape > GUIelements;

    for (unsigned int layerIndex =0;layerIndex<runtimeScene.layers.size();++layerIndex)
    {
        if ( runtimeScene.layers.at(layerIndex).GetVisibility() )
        {
            //Prepare OpenGL rendering
            runtimeScene.renderWindow->RestoreGLStates();

            glMatrixMode(GL_PROJECTION);
            glLoadIdentity();
            gluPerspective(runtimeScene.oglFOV, static_cast<double>(runtimeScene.renderWindow->GetWidth())/static_cast<double>(runtimeScene.renderWindow->GetHeight()), runtimeScene.oglZNear, runtimeScene.oglZFar);

            glViewport(0,0, runtimeScene.renderWindow->GetWidth(), runtimeScene.renderWindow->GetHeight());

            runtimeScene.renderWindow->SaveGLStates();

            //Render all objects
            for (unsigned int id = 0;id < allObjects.size();++id)
            {
                if ( allObjects[id]->GetLayer() == runtimeScene.layers.at(layerIndex).GetName())
                {
                    allObjects[id]->DrawEdittime(*runtimeScene.renderWindow);

                    //Selection rectangle
                    if ( find(objectsSelected.begin(), objectsSelected.end(), allObjects[id]) != objectsSelected.end() )
                    {
                        sf::Shape selection = sf::Shape::Rectangle( 0, 0,
                                                                   allObjects[id]->GetWidth(),
                                                                   allObjects[id]->GetHeight(),
                                                                   sf::Color( 0, 0, 200, 40 ), 1, sf::Color( 0, 0, 255, 128 ) );

                        selection.SetPosition( allObjects[id]->GetDrawableX(),
                                              allObjects[id]->GetDrawableY() );
                        GUIelements.push_back( selection );

                        if ( objectsSelected.size() == 1)
                        {
                            sf::Shape resizeXBt = sf::Shape::Rectangle( 0, 0, 4, 4, sf::Color( 255, 255, 255, 255 ), 1, sf::Color( 0, 0, 255, 255 ) );
                            sf::Shape resizeYBt = sf::Shape::Rectangle( 0, 0, 4, 4, sf::Color( 255, 255, 255, 255 ), 1, sf::Color( 0, 0, 255, 255 ) );
                            sf::Shape angleBt = sf::Shape::Rectangle( 0, 0, 4, 4, sf::Color( 255, 255, 255, 255 ), 1, sf::Color( 0, 0, 255, 255 ) );
                            sf::Shape center = sf::Shape::Circle( 0, 0, 2, sf::Color( 0, 0, 255, 255 ), 1, sf::Color( 0, 0, 255, 255 ) );
                            sf::Shape centerToAngle = sf::Shape::Line(0,0, 20, 0, 1, sf::Color( 0, 0, 255, 255 ), 0, sf::Color( 0, 0, 255, 255 ) );

                            resizeXBt.SetPosition( allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth()-4,
                                                  allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()/2-2 );

                            resizeYBt.SetPosition( allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth()/2-2,
                                                  allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()-4 );

                            center.SetPosition(allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth()/2,
                                               allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()/2);

                            angleBt.SetPosition(    allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth()/2-2
                                                    +20*cos(allObjects[id]->GetAngle()/180.f*3.14159),
                                                    allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()/2-2
                                                    +20*sin(allObjects[id]->GetAngle()/180.f*3.14159) );

                            centerToAngle.Rotate(allObjects[id]->GetAngle());
                            centerToAngle.SetPosition(  allObjects[id]->GetDrawableX()+allObjects[id]->GetWidth()/2,
                                                        allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()/2);

                            GUIelements.push_back( centerToAngle );
                            GUIelements.push_back( center );
                            GUIelements.push_back( angleBt );
                            GUIelements.push_back( resizeXBt );
                            GUIelements.push_back( resizeYBt );

                        }
                    }
                }
            }
        }
    }

    //Affichage de la grille
    if ( sceneEdited.grid )
        RenderGrid();

    //Draw GUI Elements
    for (unsigned int i = 0;i<GUIelements.size();++i)
    	runtimeScene.renderWindow->Draw(GUIelements[i]);

    if ( isSelecting )
    {
        sf::Shape selection = sf::Shape::Rectangle(xRectangleSelection, yRectangleSelection,
                                                   xEndRectangleSelection-xRectangleSelection, yEndRectangleSelection-yRectangleSelection,
                                                   sf::Color( 0, 0, 200, 40 ), 1, sf::Color( 0, 0, 255, 128 ) );
        runtimeScene.renderWindow->Draw(selection);
    }

    //Affichage de l'objet à insérer en semi transparent
    if ( !objectToAdd.empty() )
    {
        std::vector<ObjSPtr>::iterator sceneObject = std::find_if(runtimeScene.initialObjects.begin(), runtimeScene.initialObjects.end(), std::bind2nd(ObjectHasName(), objectToAdd));
        std::vector<ObjSPtr>::iterator globalObject = std::find_if(runtimeScene.game->globalObjects.begin(), runtimeScene.game->globalObjects.end(), std::bind2nd(ObjectHasName(), objectToAdd));

        ObjSPtr object = boost::shared_ptr<Object> ();

        if ( sceneObject != runtimeScene.initialObjects.end() ) //We check first scene's objects' list.
            object = *sceneObject;
        else if ( globalObject != runtimeScene.game->globalObjects.end() ) //Then the global object list
            object = *globalObject;

        if ( object != boost::shared_ptr<Object>() )
        {
            float mouseX = runtimeScene.renderWindow->ConvertCoords(sf::Mouse::GetPosition(*runtimeScene.renderWindow).x, sf::Mouse::GetPosition(*runtimeScene.renderWindow).y).x;
            float mouseY = runtimeScene.renderWindow->ConvertCoords(sf::Mouse::GetPosition(*runtimeScene.renderWindow).x, sf::Mouse::GetPosition(*runtimeScene.renderWindow).y).y;

            //Changing an initial object position is not dangerous,
            //as objects created from initial objects are always placed
            //to some coordinates just after their creations.
            if ( sceneEdited.grid && sceneEdited.snap )
            {
                object->SetX( static_cast<int>(mouseX/sceneEdited.gridWidth)*sceneEdited.gridWidth );
                object->SetY( static_cast<int>(mouseY/sceneEdited.gridHeight)*sceneEdited.gridHeight );
            }
            else
            {
                object->SetX( mouseX );
                object->SetY( mouseY );
            }

            object->DrawEdittime( *runtimeScene.renderWindow );
        }
    }


    if ( sceneEdited.windowMask )
    {
        sf::Shape windowMaskShape = sf::Shape::Rectangle(view.GetCenter().x-runtimeScene.game->windowWidth/2, view.GetCenter().y-runtimeScene.game->windowHeight/2,
                                                         runtimeScene.game->windowWidth, runtimeScene.game->windowHeight, sf::Color( 0, 0, 0, 0 ), 1, sf::Color( 255, 255, 255, 128 ) );

        runtimeScene.renderWindow->Draw(windowMaskShape);
    }

    runtimeScene.renderWindow->RestoreGLStates();
    runtimeScene.renderWindow->Display();
}

////////////////////////////////////////////////////////////
/// Affichage d'une grille
////////////////////////////////////////////////////////////
void SceneEdittimeRenderer::RenderGrid()
{
    int departX = static_cast<int>((view.GetCenter().x-view.GetSize().x/2) / sceneEdited.gridWidth)-sceneEdited.gridWidth;
    departX *= sceneEdited.gridWidth;
    int positionX = departX;
    int departY = static_cast<int>((view.GetCenter().y-view.GetSize().y/2) / sceneEdited.gridHeight)-sceneEdited.gridHeight;
    departY *= sceneEdited.gridHeight;
    int positionY = departY;

    for ( positionX = departX;positionX < (view.GetCenter().x+view.GetSize().x/2) ; positionX += sceneEdited.gridWidth )
    {
        sf::Shape line = sf::Shape::Line( positionX, departY, positionX, (view.GetCenter().y+view.GetSize().y/2), 1, sf::Color( sceneEdited.gridR, sceneEdited.gridG, sceneEdited.gridB ));

        runtimeScene.renderWindow->Draw( line );
    }

    for ( positionY = departY;positionY < (view.GetCenter().y+view.GetSize().y/2) ; positionY += sceneEdited.gridHeight )
    {
        sf::Shape line = sf::Shape::Line( departX, positionY, (view.GetCenter().x+view.GetSize().x/2), positionY, 1, sf::Color( sceneEdited.gridR, sceneEdited.gridG, sceneEdited.gridB ));

        runtimeScene.renderWindow->Draw( line );
    }
}

////////////////////////////////////////////////////////////
/// Cherche et renvoie l'ID du plus petit objet sous le curseur
////////////////////////////////////////////////////////////
ObjSPtr SceneEdittimeRenderer::FindSmallestObject()
{
    ObjList potentialObjects;
    float x = runtimeScene.renderWindow->ConvertCoords(sf::Mouse::GetPosition(*runtimeScene.renderWindow).x, sf::Mouse::GetPosition(*runtimeScene.renderWindow).y).x;
    float y = runtimeScene.renderWindow->ConvertCoords(sf::Mouse::GetPosition(*runtimeScene.renderWindow).x, sf::Mouse::GetPosition(*runtimeScene.renderWindow).y).y;

    ObjList allObjects = runtimeScene.objectsInstances.GetAllObjects();

    for (unsigned int id = 0;id < allObjects.size();++id)
    {
        if ( allObjects[id]->GetDrawableX() < x &&
                allObjects[id]->GetDrawableY() < y &&
                allObjects[id]->GetDrawableX() + allObjects[id]->GetWidth() > x &&
                allObjects[id]->GetDrawableY() + allObjects[id]->GetHeight() > y &&
                runtimeScene.GetLayer(allObjects[id]->GetLayer()).GetVisibility())
        {
            potentialObjects.push_back( allObjects[id] );
            std::cout << "potential:" << potentialObjects.back()->GetName() << std::endl;
        }
    }
    if ( potentialObjects.empty() ) return boost::shared_ptr<Object> (); //Aucun objet trouvé

    ObjSPtr smallest = potentialObjects[0]; //1er objet par défaut
    for ( unsigned int j = 0;j < potentialObjects.size();j++ )
    {
        std::cout << "potential size:" << potentialObjects[j]->GetName() << ":" << potentialObjects[j]->GetWidth() * potentialObjects[j]->GetHeight() << std::endl;
        if (( potentialObjects[j]->GetWidth() * potentialObjects[j]->GetHeight() ) < ( smallest->GetWidth() * smallest->GetHeight() ) )
        {
            smallest = potentialObjects[j];
            std::cout << "smallest";
        }
    }

    std::cout << "Returned smallest :" << smallest->GetName() << std::endl;
    return smallest;
}
