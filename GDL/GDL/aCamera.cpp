/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <SFML/System.hpp>
#include <iostream>
#include <SFML/Graphics.hpp>
#include <cmath>
#include "GDL/aCamera.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"



////////////////////////////////////////////////////////////
/// Fixe la caméra sur un objet, sans dépasser un cadre
///
/// Type : FixCamera
/// Paramètre 1 : Objet
/// Paramètre 2 : Xmin
/// Paramètre 3 : Ymin
/// Paramètre 4 : Xmax
/// Paramètre 5 : Ymax
/// Paramètre 6 : Calque
////////////////////////////////////////////////////////////
bool ActFixCamera( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    ObjList list = objectsConcerned.Pick(action.GetParameter( 0 ).GetAsObjectIdentifier(), action.IsGlobal());

    if ( list.empty() ) return false;

    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( action.GetParameters().size() >= 6 )
        layer = action.GetParameter(5).GetPlainString();

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( action.GetParameters().size() >= 7 )
        camera = eval.EvalExp(action.GetParameter(6));

    sf::View & view = scene->GetLayer(layer).GetCamera(camera).GetSFMLView();

    float decalementX = 0;
    float decalementY = 0;

    //Prise en compte des déplacements de l'objet
    if ( action.GetParameters().size() < 6 )
    {
        decalementX = ( list[0]->TotalForceX() * scene->GetElapsedTime() );
        decalementY = ( list[0]->TotalForceY() * scene->GetElapsedTime() );
    }
    else if ( action.GetParameter(5).GetPlainString() != "no" && action.GetParameter(5).GetPlainString() != "non")
    {
        decalementX = ( list[0]->TotalForceX() * scene->GetElapsedTime() );
        decalementY = ( list[0]->TotalForceY() * scene->GetElapsedTime() );
    }

    //Si on est dans le cadre
    if ( list[0]->GetX() > eval.EvalExp(action.GetParameter( 1 ))
        && list[0]->GetX() < eval.EvalExp(action.GetParameter( 3 ))
        && list[0]->GetY() > eval.EvalExp(action.GetParameter( 2 ))
        && list[0]->GetY() < eval.EvalExp(action.GetParameter( 4 ))
        )
    {
        view.SetCenter(list[0]->GetX() + decalementX, list[0]->GetY() + decalementY);
    }

    //Si on n'est pas dedans.
    if ( ( list[0]->GetX() < eval.EvalExp(action.GetParameter( 1 ))
        || list[0]->GetX() > eval.EvalExp(action.GetParameter( 3 )) )
        && list[0]->GetY() > eval.EvalExp(action.GetParameter( 2 ))
        && list[0]->GetY() < eval.EvalExp(action.GetParameter( 4 )) )

    {
        view.SetCenter(view.GetCenter().x, list[0]->GetY() + decalementY);
    }
    if ( ( list[0]->GetY() < eval.EvalExp(action.GetParameter( 2 ))
        || list[0]->GetY() > eval.EvalExp(action.GetParameter( 4 )) )
        && list[0]->GetX() > eval.EvalExp(action.GetParameter( 1 ))
        && list[0]->GetX() < eval.EvalExp(action.GetParameter( 3 )))
    {
        view.SetCenter(list[0]->GetX() + decalementX, view.GetCenter().y);
    }

    return true;
}


////////////////////////////////////////////////////////////
/// Fixe la caméra sur un objet
///
/// Type : FixCamera
/// Paramètre 1 : Objet
/// Paramètre 2 : Prise en compte du déplacement ( Oui/Non )
/// Paramètre 3 : Calque
////////////////////////////////////////////////////////////
bool ActCentreCamera( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    ObjList list = objectsConcerned.Pick(action.GetParameter( 0 ).GetAsObjectIdentifier(), action.IsGlobal());

    if ( list.empty() ) return false;

    float decalementX = 0;
    float decalementY = 0;

    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( action.GetParameters().size() >= 3 )
        layer = action.GetParameter(2).GetPlainString();

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( action.GetParameters().size() >= 4 )
        camera = eval.EvalExp(action.GetParameter(3));

    sf::View & view = scene->GetLayer(layer).GetCamera(camera).GetSFMLView();

    //Prise en compte des déplacements de l'objet
    if ( action.GetParameters().size() < 2 )
    {
        decalementX = ( list[0]->TotalForceX() * scene->GetElapsedTime() );
        decalementY = ( list[0]->TotalForceY() * scene->GetElapsedTime() );
    }
    else if ( action.GetParameter(1).GetPlainString() != "no" && action.GetParameter(1).GetPlainString() != "non")
    {
        decalementX = ( list[0]->TotalForceX() * scene->GetElapsedTime() );
        decalementY = ( list[0]->TotalForceY() * scene->GetElapsedTime() );
    }

    view.SetCenter(list[0]->GetX() + decalementX,
                    list[0]->GetY() + decalementY);

    return true;
}

////////////////////////////////////////////////////////////
/// Zoomer / Dézoomer
///
/// Type : ZoomCamera
/// Paramètre 1 : Nouvelle valeur
/// Paramètre 2 : Calque
////////////////////////////////////////////////////////////
bool ActZoomCamera( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( action.GetParameters().size() >= 2 )
        layer = action.GetParameter(1).GetPlainString();

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( action.GetParameters().size() >= 3 )
        camera = eval.EvalExp(action.GetParameter(2));

    sf::View & view = scene->GetLayer(layer).GetCamera(camera).GetSFMLView();

    float newZoom = eval.EvalExp( action.GetParameter( 0 ) );
    if ( newZoom == 0 ) return false;

    view.SetSize((scene->game->windowWidth/newZoom), (scene->game->windowHeight/newZoom));

    return true;
}

////////////////////////////////////////////////////////////
/// Faire tourner la caméra
///
/// Type : RotateCamera
/// Paramètre 1 : Nouvelle valeur
/// Paramètre 2 : Signe de la modification
/// Paramètre 3 : Calque
////////////////////////////////////////////////////////////
bool ActRotateCamera( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    //Compatibilité Game Develop < 1.1.5429 :
    std::string layer = "";
    if ( action.GetParameters().size() >= 3 )
        layer = action.GetParameter(2).GetPlainString();

    //Compatibilité Game Develop < 1.2.8699 :
    unsigned int camera = 0;
    if ( action.GetParameters().size() >= 4 )
        camera = eval.EvalExp(action.GetParameter(3));

    sf::View & view = scene->GetLayer(layer).GetCamera(camera).GetSFMLView();

    float value = eval.EvalExp( action.GetParameter( 0 ) );
    if ( action.GetParameter( 1 ).GetPlainString().empty() || action.GetParameter( 1 ).GetAsModOperator() == GDExpression::Set ) view.SetRotation(value);
    else if ( action.GetParameter( 1 ).GetAsModOperator() == GDExpression::Add ) view.SetRotation(view.GetRotation()+value);
    else if ( action.GetParameter( 1 ).GetAsModOperator() == GDExpression::Substract ) view.SetRotation(view.GetRotation()-value);
    else if ( action.GetParameter( 1 ).GetAsModOperator() == GDExpression::Multiply ) view.SetRotation(view.GetRotation()*value);
    else if ( action.GetParameter( 1 ).GetAsModOperator() == GDExpression::Divide ) view.SetRotation(view.GetRotation()/value);

    return true;
}

#undef PARAM
