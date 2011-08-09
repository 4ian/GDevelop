/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include <string>
#include <vector>
#include <utility>
#include <sstream>
#include <wx/log.h>
#include "GDL/CommonTools.h"
#include "GDL/BitmapGUIManager.h"
#include "GDL/ExtensionBase.h"
#include "GDL/TranslateAction.h"
#include "GDL/tinyxml.h"
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

    //Remplacement des _PARAMx_ par la valeur des paramètres
    for (unsigned int i =0;i<infos.parameters.size();++i)
    {
        while ( trad.find( "_PARAM"+ToString(i)+"_" ) != string::npos )
        {
            string parameter = action.GetParameterSafely( i ).GetPlainString();

            trad.replace(   trad.find( "_PARAM"+ToString(i)+"_" ), //Chaine à remplacer
                            string("_PARAM"+ToString(i)+"_").length(), //Longueur de la chaine
                            parameter );
        }
    }

    std::replace( trad.begin(), trad.end(), '\n', ' ');

    return trad;
}

/**
 * Create a formatted sentence from an action
 */
std::vector< std::pair<std::string, TextFormatting> > TranslateAction::GetAsFormattedText(const Instruction & action, const InstructionInfos & infos)
{
    std::vector< std::pair<std::string, TextFormatting> > formattedStr;

    string sentence = infos.sentence;
    bool parse = true;

    while ( parse )
    {
        //Search first parameter
        parse = false;
        size_t firstParamPosition = std::string::npos;
        size_t firstParamIndex = std::string::npos;
        for (unsigned int i =0;i<infos.parameters.size();++i)
        {
            size_t paramPosition = sentence.find( "_PARAM"+ToString(i)+"_" );
            if ( paramPosition < firstParamPosition )
            {
                firstParamPosition = paramPosition;
                firstParamIndex = i;
                parse = true;
            }
        }

        //When a parameter is found, complete formatted string.
        if ( parse )
        {
            if ( firstParamPosition != 0 ) //Add constant text before the parameter if any
            {
                TextFormatting format;
                formattedStr.push_back(std::make_pair(sentence.substr(0, firstParamPosition), format));
            }
            formattedStr.push_back(std::make_pair(action.GetParameterSafely( firstParamIndex ).GetPlainString(), GetFormattingFromType(infos.parameters[firstParamIndex].type)));

            sentence = sentence.substr(firstParamPosition+ToString("_PARAM"+ToString(firstParamIndex)+"_").length());
        }
        else if ( !sentence.empty() )//No more parameter found : Add the end of the sentence
        {
            TextFormatting format;
            formattedStr.push_back(std::make_pair(sentence, format));
        }
    }

    return formattedStr;
}

TextFormatting TranslateAction::GetFormattingFromType(const std::string & type)
{
    TextFormatting format;

    if ( type == "expression" )
        format.color = wxColour(99,0,0); //Red
    else if ( type == "object" )
        format.color = wxColour(19,81,0); //Green
    else if ( type == "automatism" )
        format.color = wxColour(19,81,0); //Green
    else if ( type == "operator" )
        format.color = wxColour(64,81,79); //Violet
    else if ( type == "objectvar" )
        format.color = wxColour(44,69,99); //Gray/Blue
    else if ( type == "scenevar" )
        format.color = wxColour(44,69,99); //Gray/Blue
    else if ( type == "globalvar" )
        format.color = wxColour(44,69,99); //Gray/Blue

    return format;
}


////////////////////////////////////////////////////////////
/// Renvoi le nom du bouton en fonction du type
////////////////////////////////////////////////////////////
string TranslateAction::LabelFromType(const string & type)
{
    if ( type == "" )
        return "";
    else if ( type == "expression" )
        return ToString(_("Expression"));
    else if ( type == "object" )
        return ToString(_("Choisir l'objet"));
    else if ( type == "automatism" )
        return ToString(_("Choisir l'automatisme"));
    else if ( type == "operator" )
        return ToString(_("Choisir le signe"));
    else if ( type == "file" )
        return ToString(_("Choisir le fichier"));
    else if ( type == "yesorno" )
        return ToString(_("Oui ou non"));
    else if ( type == "police" )
        return ToString(_("Choisir la police"));
    else if ( type == "color" )
        return ToString(_("Choisir la couleur"));
    else if ( type == "string" )
        return ToString(_("Editer le texte"));
    else if ( type == "musicfile" )
        return ToString(_("Choisir la musique"));
    else if ( type == "soundfile" )
        return ToString(_("Choisir le son"));
    else if ( type == "password" )
        return ToString(_("Créer un mot de passe"));
    else if ( type == "layer" )
        return ToString(_("Choisir le calque"));
    else if ( type == "joyaxis" )
        return ToString(_("Choisir l'axe"));
    else if ( type == "objectvar" )
        return ToString(_("Choisir la variable de l'objet"));
    else if ( type == "scenevar" )
        return ToString(_("Choisir la variable de la scène"));
    else if ( type == "globalvar" )
        return ToString(_("Choisir la variable globale"));

    return "undefined";
}

////////////////////////////////////////////////////////////
/// Renvoi le bitmap du bouton en fonction du type
////////////////////////////////////////////////////////////
wxBitmap TranslateAction::BitmapFromType(const string & type)
{
    BitmapGUIManager * bitmapGUIManager = BitmapGUIManager::GetInstance();

    if ( type == "" )
        return bitmapGUIManager->unknownBt;
    else if ( type == "expression" )
        return bitmapGUIManager->expressionBt;
    else if ( type == "object" )
        return bitmapGUIManager->objectBt;
    else if ( type == "automatism" )
        return bitmapGUIManager->automatismBt;
    else if ( type == "operator" )
        return bitmapGUIManager->signeBt;
    else if ( type == "file" )
        return bitmapGUIManager->fileBt;
    else if ( type == "yesorno" )
        return bitmapGUIManager->yesnoBt;
    else if ( type == "police" )
        return bitmapGUIManager->policeBt;
    else if ( type == "color" )
        return bitmapGUIManager->colorBt;
    else if ( type == "string" )
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

    return bitmapGUIManager->unknownBt;
}

#endif
