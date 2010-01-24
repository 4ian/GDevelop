#include "GDL/aGUI.h"
#include <vector>
#include <string>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include <nwidgets/MessageBox.h>
#include <nwidgets/YesNoMsgBox.h>
#include <nwidgets/OpenFile.h>
#include <nwidgets/TextInput.h>
#include <string>
#include <vector>

using namespace std;

////////////////////////////////////////////////////////////
/// Affiche une boite de dialogue
///
/// Type : ShowMsgBox
/// Paramètre 1 : Message
/// Paramètre 2 : Titre
////////////////////////////////////////////////////////////
bool ActShowMsgBox( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    sf::Clock Latence;

    //Affichage du message
    nw::MsgBox msgBox(eval.EvalTxt(action.GetParameter(1)), eval.EvalTxt(action.GetParameter(0)));
    msgBox.wait_until_closed();

    scene->pauseTime += Latence.GetElapsedTime();

    return true;
}

////////////////////////////////////////////////////////////
/// Affiche une boite de dialogue d'ouverture de fichier
///
/// Type : ShowOpenFile
/// Paramètre 1 : Variable de la scène où enregistrer le fichier
/// Paramètre 2 : Titre
////////////////////////////////////////////////////////////
bool ActShowOpenFile( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    sf::Clock Latence;

    string result;

    //Affichage de la fenêtre de choix de fichier
    nw::OpenFile * dialog = new nw::OpenFile(eval.EvalTxt(action.GetParameter(1)), true, result);
    dialog->wait_until_closed();

    scene->pauseTime += Latence.GetElapsedTime();

    //On cherche la variable
    int ID = scene->variables.FindVariable( action.GetParameter( 0 ).GetPlainString() );
    if ( ID == -1 )
    {
        //Si elle n'existe pas, on la créé
        scene->variables.variables.push_back( Variable(action.GetParameter( 0 ).GetPlainString()) );
        ID = scene->variables.variables.size() - 1; //On reprend l'identifiant
    }

    scene->variables.variables.at( ID ) = result;

    return true;
}

////////////////////////////////////////////////////////////
/// Affiche une boite de dialogue oui/non
///
/// Type : ShowYesNoMsgBox
/// Paramètre 1 : Variable de la scène où enregistrer la réponse
/// Paramètre 2 : Message
/// Paramètre 3 : Titre
////////////////////////////////////////////////////////////
bool ActShowYesNoMsgBox( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    sf::Clock Latence;

    string result;

    //Affichage de la fenêtre de choix de fichier
    nw::YesNoMsgBox dialog(eval.EvalTxt(action.GetParameter(2)), eval.EvalTxt(action.GetParameter(1)), result);
    dialog.wait_until_closed();

    scene->pauseTime += Latence.GetElapsedTime();

    //On cherche la variable
    int ID = scene->variables.FindVariable( action.GetParameter( 0 ).GetPlainString() );
    if ( ID == -1 )
    {
        //Si elle n'existe pas, on la créé
        scene->variables.variables.push_back( Variable(action.GetParameter( 0 ).GetPlainString()) );
        ID = scene->variables.variables.size() - 1; //On reprend l'identifiant
    }

    scene->variables.variables.at( ID ) = result;

    return true;
}


////////////////////////////////////////////////////////////
/// Affiche une boite de dialogue pour entrer un texte
///
/// Type : ShowTextInput
/// Paramètre 1 : Variable de la scène où enregistrer le texte
/// Paramètre 2 : Message
/// Paramètre 3 : Titre
////////////////////////////////////////////////////////////
bool ActShowTextInput( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    sf::Clock Latence;

    string result;

    //Affichage de la fenêtre pour entrer un texte
    nw::TextInput dialog(eval.EvalTxt(action.GetParameter(2)), eval.EvalTxt(action.GetParameter(1)), result);
    dialog.wait_until_closed();

    scene->pauseTime += Latence.GetElapsedTime();

    //On cherche la variable
    int ID = scene->variables.FindVariable( action.GetParameter( 0 ).GetPlainString() );
    if ( ID == -1 )
    {
        //Si elle n'existe pas, on la créé
        scene->variables.variables.push_back( Variable(action.GetParameter( 0 ).GetPlainString()) );
        ID = scene->variables.variables.size() - 1; //On reprend l'identifiant
    }

    scene->variables.variables.at( ID ) = result;

    return true;
}
