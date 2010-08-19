#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>

#include "EdittimeScene.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Game.h"
#include "GDL/Chercher.h"
#include <vector>

EdittimeScene::EdittimeScene(sf::RenderWindow * renderWindow_, RuntimeGame * game_) :
RuntimeScene(renderWindow_, game_),
editing(true),
view( sf::FloatRect( 0.0f, 0.0f, game->windowWidth, game->windowHeight ) ),
grid( false ),
snap( false),
gridWidth( 32 ),
gridHeight( 32 ),
gridR( 158 ),
gridG( 180 ),
gridB( 255 ),
isMovingObject( false ),
isResizingX( false ),
isResizingY( false ),
xRectangleSelection(0),
yRectangleSelection(0),
xEndRectangleSelection(0),
yEndRectangleSelection(0),
colorGUI( 0 ),
colorPlus( true ),
isMoving( false ),
isSelecting(false),
deplacementOX( 0 ),
deplacementOY( 0 )
{
    //ctor
    renderWindow->SetView(view);
    running = false;
}

EdittimeScene::~EdittimeScene()
{
    //dtor
}


////////////////////////////////////////////////////////////
/// Affichage de la scène en mode édition, à son départ.
////////////////////////////////////////////////////////////
void EdittimeScene::RenderEdittimeScene()
{
    ManageRenderTargetEvents();

    renderWindow->Clear( sf::Color( backgroundColorR, backgroundColorG, backgroundColorB ) );
    renderWindow->SetView(view);

    glClear(GL_DEPTH_BUFFER_BIT);
    renderWindow->SaveGLStates(); //To allow using OpenGL to draw

    UpdateGUI();

    //On trie les objets par leurs plans
    ObjList allObjects = objectsInstances.GetAllObjects();
    OrderObjectsByZOrder( allObjects );

    std::vector < sf::Shape > GUIelements;

    for (unsigned int layerIndex =0;layerIndex<layers.size();++layerIndex)
    {
        if ( layers.at(layerIndex).GetVisibility() )
        {
            //Prepare OpenGL rendering
            renderWindow->RestoreGLStates();

            glMatrixMode(GL_PROJECTION);
            glLoadIdentity();
            gluPerspective(oglFOV, static_cast<double>(renderWindow->GetWidth())/static_cast<double>(renderWindow->GetHeight()), oglZNear, oglZFar);

            glViewport(0,0, renderWindow->GetWidth(), renderWindow->GetHeight());

            renderWindow->SaveGLStates();

            //Render all objects
            for (unsigned int id = 0;id < allObjects.size();++id)
            {
                if ( allObjects[id]->GetLayer() == layers.at(layerIndex).GetName())
                {
                    allObjects[id]->DrawEdittime(*renderWindow);

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
                                                    +20*cos(allObjects[id]->GetAngle()/180.f*3.14),
                                                    allObjects[id]->GetDrawableY()+allObjects[id]->GetHeight()/2-2
                                                    +20*sin(allObjects[id]->GetAngle()/180.f*3.14) );

                            centerToAngle.Rotate(-allObjects[id]->GetAngle());
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
    if ( grid )
        RenderGrid();

    //Draw GUI Elements
    for (unsigned int i = 0;i<GUIelements.size();++i)
    	renderWindow->Draw(GUIelements[i]);

    if ( isSelecting )
    {
        sf::Shape selection = sf::Shape::Rectangle(xRectangleSelection, yRectangleSelection,
                                                   xEndRectangleSelection-xRectangleSelection, yEndRectangleSelection-yRectangleSelection,
                                                   sf::Color( 0, 0, 200, 40 ), 1, sf::Color( 0, 0, 255, 128 ) );
        renderWindow->Draw(selection);
    }

    //Affichage de l'objet à insérer en semi transparent
    if ( objectToAdd != "" )
    {
        try
        {
            ObjSPtr object = boost::shared_ptr<Object>();

            if ( Picker::PickOneObject( &initialObjects, objectToAdd ) != -1)
                object = initialObjects[Picker::PickOneObject( &initialObjects, objectToAdd ) ];
            else if ( Picker::PickOneObject( &game->globalObjects, objectToAdd ) != -1)
                object = game->globalObjects[Picker::PickOneObject( &game->globalObjects, objectToAdd ) ];

            if ( object != boost::shared_ptr<Object>() )
            {
                //Changing an initial object position is not dangerous,
                //as objects created from initial objects are always placed
                //to some coordinates just after their creations.
                if ( grid && snap )
                {
                    object->SetX( static_cast<int>(renderWindow->ConvertCoords(input->GetMouseX(), 0).x/gridWidth)*gridWidth );
                    object->SetY( static_cast<int>(renderWindow->ConvertCoords(0, input->GetMouseY()).y/gridHeight)*gridHeight );
                }
                else
                {
                    object->SetX( renderWindow->ConvertCoords(input->GetMouseX(), 0).x );
                    object->SetY( renderWindow->ConvertCoords(0, input->GetMouseY()).y );
                }

                object->DrawEdittime( *renderWindow );
            }
        }
        catch ( ... ) { }
    }


    renderWindow->RestoreGLStates();
    renderWindow->Display();
}

////////////////////////////////////////////////////////////
/// Affichage d'une grille
////////////////////////////////////////////////////////////
void EdittimeScene::RenderGrid()
{
    int departX = static_cast<int>((view.GetCenter().x-view.GetSize().x/2) / gridWidth)-gridWidth;
    departX *= gridWidth;
    int positionX = departX;
    int departY = static_cast<int>((view.GetCenter().y-view.GetSize().y/2) / gridHeight)-gridHeight;
    departY *= gridHeight;
    int positionY = departY;

    for ( positionX = departX;positionX < (view.GetCenter().x+view.GetSize().x/2) ; positionX += gridWidth )
    {
        sf::Shape line = sf::Shape::Line( positionX, departY, positionX, (view.GetCenter().y+view.GetSize().y/2), 1, sf::Color( gridR, gridG, gridB ));

        renderWindow->Draw( line );
    }

    for ( positionY = departY;positionY < (view.GetCenter().y+view.GetSize().y/2) ; positionY += gridHeight )
    {
        sf::Shape line = sf::Shape::Line( departX, positionY, (view.GetCenter().x+view.GetSize().x/2), positionY, 1, sf::Color( gridR, gridG, gridB ));

        renderWindow->Draw( line );
    }
}

////////////////////////////////////////////////////////////
/// Met à jour les couleurs de l'interface
////////////////////////////////////////////////////////////
void EdittimeScene::UpdateGUI()
{
    float elapsedTime = renderWindow->GetFrameTime();
    if ( colorPlus )
    {
        colorGUI += static_cast<int>(150 * elapsedTime);

        if ( colorGUI > 255 )
        {
            colorGUI = 255;
            colorPlus = false;
        }
    }
    else
    {
        colorGUI -= static_cast<int>(150 * elapsedTime);

        if ( colorGUI < 10 )
        {
            colorGUI = 10;
            colorPlus = true;
        }
    }
    return;
}

////////////////////////////////////////////////////////////
/// Cherche et renvoie l'ID du plus petit objet sous le curseur
////////////////////////////////////////////////////////////
ObjSPtr EdittimeScene::FindSmallestObject()
{
    ObjList potentialObjects;
    int x = renderWindow->ConvertCoords(input->GetMouseX(), 0).x;
    int y = renderWindow->ConvertCoords(0, input->GetMouseY()).y;

    unsigned int boucleTest = 0;

    ObjList allObjects = objectsInstances.GetAllObjects();

    for (unsigned int id = 0;id < allObjects.size();++id)
    {
        if ( allObjects[id]->GetDrawableX() < x &&
                allObjects[id]->GetDrawableY() < y &&
                allObjects[id]->GetDrawableX() + allObjects[id]->GetWidth() > x &&
                allObjects[id]->GetDrawableY() + allObjects[id]->GetHeight() > y &&
                GetLayer(allObjects[id]->GetLayer()).GetVisibility())
        {
            potentialObjects.push_back( allObjects[id] );
        }

        boucleTest++;
    }
    if ( potentialObjects.empty() ) return boost::shared_ptr<Object> (); //Aucun objet trouvé

    ObjSPtr smallest = potentialObjects[0]; //1er objet par défaut
    if ( potentialObjects.size() > 1 )
    {
        int compare = 1;
        for ( unsigned int j = 0;j < potentialObjects.size();j++ )
        {
            if (( potentialObjects[j]->GetWidth() * potentialObjects[j]->GetHeight() ) <
                    ( potentialObjects[compare]->GetWidth() * potentialObjects[compare]->GetHeight() ) )
            {
                smallest = potentialObjects.at( j );

                compare = j;
            }
            else
            {
                smallest = potentialObjects.at( compare );
            }
        }
    }

    return smallest;
}
