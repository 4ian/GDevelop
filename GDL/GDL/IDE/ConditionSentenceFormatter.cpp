/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include <stdexcept>
#include <iostream>
#include <string>
#include <vector>
#include <wx/log.h>
#include <wx/wx.h>
#include <wx/bitmap.h>
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/ExtensionBase.h"
#include "GDL/IDE/BitmapGUIManager.h"
#include "GDL/IDE/ConditionSentenceFormatter.h"
#include "GDL/IDE/ActionSentenceFormatter.h"
#include "GDL/CommonTools.h"

using namespace std;


////////////////////////////////////////////////////////////
/// Traduction complète
///
/// Traduction en une phrase complète d'une condition et ses paramètres
////////////////////////////////////////////////////////////
string TranslateCondition::Translate(const Instruction & condition, const InstructionInfos & infos)
{
    string trad = infos.sentence;

    //Remplacement des _PARAMx_ par la valeur des paramètres
    for (unsigned int i =0;i<infos.parameters.size();++i)
    {
        while ( trad.find( "_PARAM"+ToString(i)+"_" ) != string::npos )
        {
            string parameter = condition.GetParameterSafely( i ).GetPlainString();

            trad.replace(   trad.find( "_PARAM"+ToString(i)+"_" ), //Chaine à remplacer
                            string("_PARAM"+ToString(i)+"_").length(), //Longueur de la chaine
                            parameter );
        }
    }

    std::replace( trad.begin(), trad.end(), '\n', ' ');

    return trad;
}

/**
 * Create a formatted sentence from a condition
 */
std::vector< std::pair<std::string, TextFormatting> > TranslateCondition::GetAsFormattedText(const Instruction & condition, const InstructionInfos & infos)
{
    return TranslateAction::GetInstance()->GetAsFormattedText(condition, infos);
}

TextFormatting TranslateCondition::GetFormattingFromType(const std::string & type)
{
    return TranslateAction::GetInstance()->GetFormattingFromType(type);
}

////////////////////////////////////////////////////////////
/// Renvoi le nom du bouton en fonction du type
////////////////////////////////////////////////////////////
std::string TranslateCondition::LabelFromType( const string & type )
{
    if ( type == "" )
        return "";
    else if ( type == "expression" )
        return static_cast<string>(_( "Expression" ));
    else if ( type == "object" )
        return static_cast<string>(_( "Choisir l'objet" ));
    else if ( type == "automatism" )
        return static_cast<string>(_( "Choisir l'automatisme" ));
    else if ( type == "relationalOperator" )
        return static_cast<string>(_( "Choisir le signe" ));
    else if ( type == "file" )
        return static_cast<string>(_( "Choisir le fichier" ));
    else if ( type == "color" )
        return static_cast<string>(_( "Choisir la couleur" ));
    else if ( type == "string" )
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
wxBitmap TranslateCondition::BitmapFromType( const string & type )
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
    else if ( type == "relationalOperator" )
        return bitmapGUIManager->signeBt;
    else if ( type == "file" )
        return bitmapGUIManager->fileBt;
    else if ( type == "color" )
        return bitmapGUIManager->colorBt;
    else if ( type == "string" )
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
#endif
