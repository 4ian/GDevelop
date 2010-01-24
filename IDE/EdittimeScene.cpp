#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>

#include "EdittimeScene.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Game.h"
#include "GDL/Chercher.h"

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
colorGUI( 0 ),
colorPlus( true ),
selection( sf::Shape::Rectangle( 0, 0, 10, 10, sf::Color( 100, 255, 255 ), 1 ) ),
isMoving( false ),
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
    vector < PlanObjet > ordre;
    OrdreAffichageObjets(ordre);

    //Affichage des objets
    for (unsigned int layerIndex =0;layerIndex<layers.size();++layerIndex)
    {
        if ( layers.at(layerIndex).GetVisibility() )
        {
            for (unsigned int BoucleAffich = 0;BoucleAffich < ordre.size();++BoucleAffich)
            {
                if ( objets[ordre.at( BoucleAffich ).idObjet]->GetLayer() == layers.at(layerIndex).GetName())
                {
                    objets[ordre.at( BoucleAffich ).idObjet]->DrawEdittime(*renderWindow);

                    //Selection rectangle
                    if ( find(idObjectsSelected.begin(), idObjectsSelected.end(), ordre.at( BoucleAffich ).idObjet) != idObjectsSelected.end() )
                    {
                        sf::Shape selection = sf::Shape::Rectangle( 0, 0,
                                                                   objets[ordre.at( BoucleAffich ).idObjet]->GetWidth(),
                                                                   objets[ordre.at( BoucleAffich ).idObjet]->GetHeight(),
                                                                   sf::Color( 0, 0, 200, 40 ), 1, sf::Color( 0, 0, 255, 128 ) );

                        selection.SetPosition( objets[ordre.at( BoucleAffich ).idObjet]->GetDrawableX(),
                                              objets[ordre.at( BoucleAffich ).idObjet]->GetDrawableY() );
                        renderWindow->Draw( selection );
                    }
                }
            }
        }
    }
    //Affichage de l'objet à insérer en semi transparent
    if ( objectToAdd != "" )
    {
        try
        {
            ObjSPtr object = boost::shared_ptr<Object>();

            if ( Picker::PickOneObject( &objetsInitiaux, objectToAdd ) != -1)
                object = objetsInitiaux[Picker::PickOneObject( &objetsInitiaux, objectToAdd ) ];
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

    //Affichage de la grille
    if ( grid )
        RenderGrid();

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
int EdittimeScene::FindSmallestObject()
{
    vector < int > IDobjet;
    int x = renderWindow->ConvertCoords(input->GetMouseX(), 0).x;
    int y = renderWindow->ConvertCoords(0, input->GetMouseY()).y;

    unsigned int boucleTest = 0;
    //Test de chaque objet
    while ( boucleTest < objets.size() )
    {
        if ( objets[boucleTest]->GetDrawableX() < x &&
                objets[boucleTest]->GetDrawableY() < y &&
                objets[boucleTest]->GetDrawableX() + objets[boucleTest]->GetWidth() > x &&
                objets[boucleTest]->GetDrawableY() + objets[boucleTest]->GetHeight() > y &&
                GetLayer(objets[boucleTest]->GetLayer()).GetVisibility())
        {
            IDobjet.push_back( boucleTest );
        }

        boucleTest++;
    }
    if ( IDobjet.size() == 0 ) return -1; //Aucun objet trouvé

    int IDpluspetit = IDobjet.at( 0 ); //1er objet par défaut
    if ( IDobjet.size() > 1 )
    {
        int compare = 1;
        for ( unsigned int j = 0;j < IDobjet.size();j++ )
        {
            if (( objets[IDobjet[j]]->GetWidth() * objets[IDobjet[j]]->GetHeight() ) <
                    ( objets[IDobjet[compare]]->GetWidth() * objets[IDobjet[compare]]->GetHeight() ) )
            {
                IDpluspetit = IDobjet.at( j );

                compare = j;
            }
            else
            {
                IDpluspetit = IDobjet.at( compare );
            }
        }
    }

    return IDpluspetit;
}
