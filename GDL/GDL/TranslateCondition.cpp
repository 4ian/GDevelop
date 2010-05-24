/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GDE)

#include <stdexcept>
#include <iostream>
#include <string>
#include <vector>
#include <wx/log.h>
#include <wx/wx.h>
#include <wx/bitmap.h>
#include "tinyxml.h"
#include "GDL/ExtensionBase.h"
#include "GDL/BitmapGUIManager.h"
#include "GDL/TranslateCondition.h"
#include "MemTrace.h"
#include "GDL/CommonTools.h"

using namespace std;


////////////////////////////////////////////////////////////
/// Traduction complète
///
/// Traduction en une phrase complète d'une condition et ses paramètres
////////////////////////////////////////////////////////////
string TranslateCondition::Translate(const Instruction & condition, const InstructionInfos & infos, bool afficherPlus, bool useHTML)
{
    string trad = "";
    //Dois t on tout afficher ?
    if ( afficherPlus && !condition.IsLocal() ) trad += "(Global) ";
    if ( afficherPlus && condition.IsInverted() ) trad += " (Contraire) ";

    trad += infos.sentence;
    if ( useHTML ) RemoveHTMLTags(trad);

    //Remplacement des _PARAMx_ par la valeur des paramètres
    for (unsigned int i =0;i<infos.parameters.size();++i)
    {
        while ( trad.find( "_PARAM"+ToString(i)+"_" ) != string::npos )
        {
            string parameter = condition.GetParameter( i ).GetPlainString();
            if ( useHTML ) RemoveHTMLTags(parameter);
            if ( useHTML ) AddHTMLToParameter(parameter, infos.parameters[i].type); //Mise en forme du paramètre

            trad.replace(   trad.find( "_PARAM"+ToString(i)+"_" ), //Chaine à remplacer
                            string("_PARAM"+ToString(i)+"_").length(), //Longueur de la chaine
                            parameter );
        }
    }

    return trad;
}

void TranslateCondition::RemoveHTMLTags(string & str)
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
string TranslateCondition::LabelFromType( string type )
{
    if ( type == "" )
        return "";
    else if ( type == "expression" )
        return static_cast<string>(_( "Expression" ));
    else if ( type == "objet" )
        return static_cast<string>(_( "Choisir l'objet" ));
    else if ( type == "signe" )
        return static_cast<string>(_( "Choisir le signe" ));
    else if ( type == "file" )
        return static_cast<string>(_( "Choisir le fichier" ));
    else if ( type == "color" )
        return static_cast<string>(_( "Choisir la couleur" ));
    else if ( type == "text" )
        return static_cast<string>(_( "Choisir le texte" ));
    else if ( type == "key" )
        return static_cast<string>(_( "Choisir la touche" ));
    else if ( type == "mouse" )
        return static_cast<string>(_( "Choisir le bouton" ));
    else if ( type == "trueorfalse" )
        return static_cast<string>(_( "Vrai ou Faux" ));
    else if ( type == "yesorno" )
        return static_cast<string>(_( "Oui ou non" ));
    else if ( type == "layer" )
        return static_cast<string>(_( "Choisir le calque" ));
    else if ( type == "joyaxis" )
        return static_cast<string>(_( "Choisir l'axe" ));
    else if ( type == "objectvar" )
        return static_cast<string>(_("Choisir la variable de l'objet"));
    else if ( type == "scenevar" )
        return static_cast<string>(_("Choisir la variable de la scène"));
    else if ( type == "globalvar" )
        return static_cast<string>(_("Choisir la variable globale"));

    wxLogWarning( "Game Develop n'a pas pu trouver le nom d'un bouton suivant le type du paramètre" );
    return "undefined";
}

////////////////////////////////////////////////////////////
/// Renvoi le bitmap du bouton en fonction du type
////////////////////////////////////////////////////////////
wxBitmap TranslateCondition::BitmapFromType( string type )
{
    BitmapGUIManager * bitmapGUIManager = BitmapGUIManager::getInstance();

    if ( type == "" )
        return bitmapGUIManager->unknownBt;
    else if ( type == "expression" )
        return bitmapGUIManager->expressionBt;
    else if ( type == "objet" )
        return bitmapGUIManager->objetBt;
    else if ( type == "signe" )
        return bitmapGUIManager->signeBt;
    else if ( type == "file" )
        return bitmapGUIManager->fileBt;
    else if ( type == "color" )
        return bitmapGUIManager->colorBt;
    else if ( type == "text" )
        return bitmapGUIManager->texteBt;
    else if ( type == "key" )
        return bitmapGUIManager->keyBt;
    else if ( type == "mouse" )
        return bitmapGUIManager->mouseBt;
    else if ( type == "trueorfalse" )
        return bitmapGUIManager->trueOrFalseBt;
    else if ( type == "yesorno" )
        return bitmapGUIManager->yesnoBt;
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

    wxLogWarning( "Game Develop n'a pas pu trouver le bitmap d'un bouton suivant le type du paramètre" );
    return bitmapGUIManager->unknownBt;
}

////////////////////////////////////////////////////////////
/// Décore un paramètre avec du html, suivant son type
////////////////////////////////////////////////////////////
string TranslateCondition::AddHTMLToParameter(string & parameter, string type)
{
    if ( type == "expression" )
        parameter = "<i>"+parameter+"</i>";
    else if ( type == "objet" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "signe" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "file" )
        parameter = "<i>"+parameter+"</i>";
    /*else if ( type == "color" )
        parameter = parameter;
    else if ( type == "text" )
        return bitmapGUIManager->texteBt;*/
    else if ( type == "key" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "mouse" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "trueorfalse" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "yesorno" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "layer" )
        parameter = "<b>"+parameter+"</b>";
    else if ( type == "joyaxis" )
        parameter = "<b>"+parameter+"</b>";

    return parameter;
}

#endif
