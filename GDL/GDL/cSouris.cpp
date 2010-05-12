
#include <vector>
#include <string>
#include "GDL/Object.h"
#include "GDL/SpriteObject.h"
#include <cmath>
#include "GDL/cADS.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include <SFML/Window.hpp>
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"

////////////////////////////////////////////////////////////
/// Test de la position X de la souris
///
/// Type : SourisX
/// Paramètre 1 : Position à tester
/// Paramètre 2 : Signe du test
/// Paramètre 3 : Calque
////////////////////////////////////////////////////////////
bool CondSourisX( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( condition.GetParameters().size() >= 3 )
        layer = condition.GetParameter(2).GetPlainString();

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( condition.GetParameters().size() >= 4 )
        camera = eval.EvalExp(condition.GetParameter(3));

    sf::View & view = scene->GetLayer(layer).GetCamera(camera).GetSFMLView();

    //On calcule la position de la souris dans le calque donné
    int mouseX = scene->renderWindow->ConvertCoords(scene->input->GetMouseX(), scene->input->GetMouseY(), view).x;

    //Enfin, on teste vraiment.
    //optimisation : test du signe en premier
    if (( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Equal && ( mouseX ) == eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Inferior && ( mouseX ) < eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Superior && ( mouseX ) > eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && ( mouseX ) <= eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && ( mouseX ) >= eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Different && ( mouseX ) != eval.EvalExp( condition.GetParameter( 0 ) ) )
       )
    {
        if ( !condition.IsInverted()) return true;
    }
    else
    {
        if ( condition.IsInverted()) return true;
    }

    return false;
}

////////////////////////////////////////////////////////////
/// Test de la position Y de la souris
///
/// Type : SourisY
/// Paramètre 2 : Position à tester
/// Paramètre 3 : Signe du test
////////////////////////////////////////////////////////////
bool CondSourisY( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( condition.GetParameters().size() >= 3 )
        layer = condition.GetParameter(2).GetPlainString();

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( condition.GetParameters().size() >= 4 )
        camera = eval.EvalExp(condition.GetParameter(3));

    sf::View & view = scene->GetLayer(layer).GetCamera(camera).GetSFMLView();

    //On calcule la position de la souris dans le calque donné
    int mouseY = scene->renderWindow->ConvertCoords(scene->input->GetMouseX(), scene->input->GetMouseY(), view).y;

    //optimisation : test du signe en premier
    if (( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Equal && ( mouseY ) == eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Inferior && ( mouseY ) < eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Superior && ( mouseY ) > eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && ( mouseY ) <= eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && ( mouseY ) >= eval.EvalExp( condition.GetParameter( 0 ) ) ) ||
            ( condition.GetParameter( 1 ).GetAsCompOperator() == GDExpression::Different && ( mouseY ) != eval.EvalExp( condition.GetParameter( 0 ) ) )
       )
    {
        if ( !condition.IsInverted()) return true;
    }
    else
    {
        if ( condition.IsInverted()) return true;
    }

    return false;
}


////////////////////////////////////////////////////////////
/// Test d'appui sur un bouton de la souris
///
/// Type : SourisBouton
/// Paramètre 1 : Bouton à tester
////////////////////////////////////////////////////////////
bool CondSourisBouton( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    bool Ok = false;

    string Key = condition.GetParameter( 0 ).GetPlainString();

    if ( Key == "Left" ) { Ok = scene->input->IsMouseButtonDown( sf::Mouse::Left ); }
    if ( Key == "Right" ) { Ok = scene->input->IsMouseButtonDown( sf::Mouse::Right ); }
    if ( Key == "Middle" ) { Ok = scene->input->IsMouseButtonDown( sf::Mouse::Middle ); }
    if ( Key == "XButton1" ) { Ok = scene->input->IsMouseButtonDown( sf::Mouse::XButton1 ); }
    if ( Key == "XButton2" ) { Ok = scene->input->IsMouseButtonDown( sf::Mouse::XButton2 ); }

    if ( condition.IsInverted() ) return !Ok;
    return Ok;
}


////////////////////////////////////////////////////////////
/// Test si la souris est sur un objet
///
/// Type : SourisSurObjet
/// Paramètre 1 : Objet à tester
////////////////////////////////////////////////////////////
bool CondSourisSurObjet( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), condition.IsGlobal());
    bool isTrue = false;

    //Précision
    bool accurate = true;
    if ( condition.GetParameters().size() > 1 &&
         (condition.GetParameter( 1 ).GetPlainString() == "no" || condition.GetParameter( 1 ).GetPlainString() == "non") )
        accurate = false;

    //Pour chaque objet concerné
    for (unsigned int layerIndex = 0;layerIndex < scene->layers.size();++layerIndex)
    {
        for (unsigned int cameraIndex = 0;cameraIndex < scene->layers[layerIndex].GetCamerasNumber();++cameraIndex)
        {
            int mouseXInTheLayer = scene->renderWindow->ConvertCoords(scene->input->GetMouseX(), scene->input->GetMouseY(), scene->layers[layerIndex].GetCamera(cameraIndex).GetSFMLView()).x;
            int mouseYInTheLayer = scene->renderWindow->ConvertCoords(scene->input->GetMouseX(), scene->input->GetMouseY(), scene->layers[layerIndex].GetCamera(cameraIndex).GetSFMLView()).y;

            ObjList::iterator obj = list.begin();
            ObjList::const_iterator obj_end = list.end();
            for ( ; obj != obj_end; ++obj )
            {
                if ( (*obj)->GetLayer() == scene->layers[layerIndex].GetName())
                {
                    if  ( (*obj)->GetDrawableX() < mouseXInTheLayer &&
                        ( (*obj)->GetDrawableX() + (*obj)->GetWidth() ) > mouseXInTheLayer &&
                        (*obj)->GetDrawableY() < mouseYInTheLayer &&
                        ( (*obj)->GetDrawableY() + (*obj)->GetHeight() ) > mouseYInTheLayer )
                    {
                        int ClicX = static_cast<int>( mouseXInTheLayer - (*obj)->GetDrawableX() );
                        int ClicY = static_cast<int>( mouseYInTheLayer - (*obj)->GetDrawableY() );

                        if ( !accurate || (  boost::static_pointer_cast<SpriteObject>(*obj)->GetCurrentSprite().GetPixel( ClicX , ClicY ).a != 0 ) )
                        {
                            if ( !condition.IsInverted() )
                            {
                                isTrue = true;
                                objectsConcerned.objectsPicked.AddObject( *obj ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                            }
                        }
                        else
                        {
                            if ( condition.IsInverted() )
                            {
                                isTrue = true;
                                objectsConcerned.objectsPicked.AddObject( *obj ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                            }
                        }
                    }
                    else
                    {
                        if ( condition.IsInverted() )
                        {
                            isTrue = true;
                            objectsConcerned.objectsPicked.AddObject( *obj ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                        }
                    }
                }
            }
        }
    }

    return isTrue;
}
