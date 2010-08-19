/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GDE)

#include <string>
#include <vector>
#include <sstream>
#include <wx/log.h>
#include "GDL/CommonTools.h"
#include "GDL/BitmapGUIManager.h"
#include "GDL/ExtensionBase.h"
#include "GDL/TranslateAction.h"
#include "tinyxml.h"
#include <wx/wx.h>
#include <wx/bitmap.h>
#include <iostream>
#include <map>

using namespace std;

////////////////////////////////////////////////////////////
/// Traduction complète
///
/// Traduction en une phrase complète d'une action et ses paramètres
////////////////////////////////////////////////////////////
string TranslateAction::Translate(const Instruction & action, const InstructionInfos & infos)
{
    string trad = infos.sentence;
    RemoveHTMLTags(trad);

    //Remplacement des _PARAMx_ par la valeur des paramètres
    for (unsigned int i =0;i<infos.parameters.size();++i)
    {
        while ( trad.find( "_PARAM"+ToString(i)+"_" ) != string::npos )
        {
            string parameter = action.GetParameterSafely( i ).GetPlainString();
            RemoveHTMLTags(parameter);
            AddHTMLToParameter(parameter, infos.parameters[i].type);

            trad.replace(   trad.find( "_PARAM"+ToString(i)+"_" ), //Chaine à remplacer
                            string("_PARAM"+ToString(i)+"_").length(), //Longueur de la chaine
                            parameter );
        }
    }

    return trad;
}

void TranslateAction::RemoveHTMLTags(string & str)
{
    size_t pos = 0;
    while ( str.find("&", pos) != string::npos)
    {
        str.replace( str.find( "&", pos), 1, "&amp;" );
        pos = str.find( "&", pos)+1;
    }

    while ( str.find("<") != string::npos)
        str.replace( str.find( "<" ), 1, "&lt;" );

    while ( str.find(">") != string::npos)
        str.replace( str.find( ">" ), 1, "&gt;" );
}

////////////////////////////////////////////////////////////
/// Renvoi le nom du bouton en fonction du type
////////////////////////////////////////////////////////////
string TranslateAction::LabelFromType(string type)
{
    if ( type == "" )
        return "";
    else if ( type == "expression" )
        return static_cast<string>(_("Expression"));
    else if ( type == "object" )
        return static_cast<string>(_("Choisir l'objet"));
    else if ( type == "automatism" )
        return static_cast<string>(_("Choisir l'automatisme"));
    else if ( type == "signe" )
        return static_cast<string>(_("Choisir le signe"));
    else if ( type == "file" )
        return static_cast<string>(_("Choisir le fichier"));
    else if ( type == "yesorno" )
        return static_cast<string>(_("Oui ou non"));
    else if ( type == "police" )
        return static_cast<string>(_("Choisir la police"));
    else if ( type == "color" )
        return static_cast<string>(_("Choisir la couleur"));
    else if ( type == "text" )
        return static_cast<string>(_("Editer le texte"));
    else if ( type == "musicfile" )
        return static_cast<string>(_("Choisir la musique"));
    else if ( type == "soundfile" )
        return static_cast<string>(_("Choisir le son"));
    else if ( type == "password" )
        return static_cast<string>(_("Créer un mot de passe"));
    else if ( type == "layer" )
        return static_cast<string>(_("Choisir le calque"));
    else if ( type == "joyaxis" )
        return static_cast<string>(_("Choisir l'axe"));
    else if ( type == "objectvar" )
        return static_cast<string>(_("Choisir la variable de l'objet"));
    else if ( type == "scenevar" )
        return static_cast<string>(_("Choisir la variable de la scène"));
    else if ( type == "globalvar" )
        return static_cast<string>(_("Choisir la variable globale"));

    wxLogWarning("Game Develop n'a pas pu trouver le nom d'un bouton suivant le type du paramètre");
    return "undefined";
}

////////////////////////////////////////////////////////////
/// Renvoi le bitmap du bouton en fonction du type
////////////////////////////////////////////////////////////
wxBitmap TranslateAction::BitmapFromType(string type)
{
    BitmapGUIManager * bitmapGUIManager = BitmapGUIManager::getInstance();

    if ( type == "" )
        return bitmapGUIManager->unknownBt;
    else if ( type == "expression" )
        return bitmapGUIManager->expressionBt;
    else if ( type == "object" )
        return bitmapGUIManager->objectBt;
    else if ( type == "automatism" )
        return bitmapGUIManager->automatismBt;
    else if ( type == "signe" )
        return bitmapGUIManager->signeBt;
    else if ( type == "file" )
        return bitmapGUIManager->fileBt;
    else if ( type == "yesorno" )
        return bitmapGUIManager->yesnoBt;
    else if ( type == "police" )
        return bitmapGUIManager->policeBt;
    else if ( type == "color" )
        return bitmapGUIManager->colorBt;
    else if ( type == "text" )
        return bitmapGUIManager->texteBt;
    else if ( type == "musicfile" )
        return bitmapGUIManager->musicBt;
    else if ( type == "soundfile" )
        return bitmapGUIManager->soundBt;
    else if ( type == "password" )
        return bitmapGUIManager->passwordBt;
    else if ( type == "layer" )
        return bitmapGUIManager->layerBt;
    else if ( type == "joyaxis" )
        return bitmapGUIManager->joyaxisBt;
    else if ( type == "objectvar" )
        return bitmapGUIManager->varBt;
    else if ( type == "scenevar" )
        return bitmapGUIManager->varBt;
    else if ( type == "globalvar" )
        return bitmapGUIManager->varBt;

    wxLogWarning("Game Develop n'a pas pu trouver le bitmap d'un bouton suivant le type du paramètre");
    return bitmapGUIManager->unknownBt;
}

////////////////////////////////////////////////////////////
/// Décore un paramètre avec du html, suivant son type
////////////////////////////////////////////////////////////
string TranslateAction::AddHTMLToParameter(string & parameter, string type)
{
    if ( type == "expression" )
        parameter = "<i>"+parameter+"</i>";
    else if ( type == "object" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "signe" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "file" )
        parameter = "<i>"+parameter+"</i>";
    else if ( type == "yesorno" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "police" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "musicfile" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "soundfile" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "layer" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "joyaxis" )
        parameter = "<b>"+parameter+"</b>";

    return parameter;
}



#endif
