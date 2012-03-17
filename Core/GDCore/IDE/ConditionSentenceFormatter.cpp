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
#include <wx/intl.h>
#include <wx/bitmap.h>
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/IDE/ConditionSentenceFormatter.h"
#include "GDCore/IDE/ActionSentenceFormatter.h"
#include "GDCore/CommonTools.h"

using namespace std;
using namespace gd;

string TranslateCondition::Translate(const Instruction & condition, const InstructionMetadata & infos)
{
    std::string trad = infos.sentence;

    //Remplacement des _PARAMx_ par la valeur des paramètres
    for (unsigned int i =0;i<infos.parameters.size();++i)
    {
        while ( trad.find( "_PARAM"+ToString(i)+"_" ) != std::string::npos )
        {
            std::string parameter = condition.GetParameter( i ).GetPlainString();

            trad.replace(   trad.find( "_PARAM"+ToString(i)+"_" ), //Chaine à remplacer
                            std::string("_PARAM"+ToString(i)+"_").length(), //Longueur de la chaine
                            parameter );
        }
    }

    std::replace( trad.begin(), trad.end(), '\n', ' ');

    return trad;
}

/**
 * Create a formatted sentence from a condition
 */
std::vector< std::pair<std::string, TextFormatting> > TranslateCondition::GetAsFormattedText(const Instruction & condition, const InstructionMetadata & infos)
{
    return TranslateAction::GetInstance()->GetAsFormattedText(condition, infos);
}

TextFormatting TranslateCondition::GetFormattingFromType(const std::string & type)
{
    return TranslateAction::GetInstance()->GetFormattingFromType(type);
}

std::string TranslateCondition::LabelFromType( const std::string & type )
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

wxBitmap TranslateCondition::BitmapFromType( const std::string & type )
{
    CommonBitmapManager * CommonBitmapManager = CommonBitmapManager::GetInstance();

    if ( type == "" )
        return CommonBitmapManager->unknownBt;
    else if ( type == "expression" )
        return CommonBitmapManager->expressionBt;
    else if ( type == "object" )
        return CommonBitmapManager->objectBt;
    else if ( type == "automatism" )
        return CommonBitmapManager->automatismBt;
    else if ( type == "relationalOperator" )
        return CommonBitmapManager->signeBt;
    else if ( type == "file" )
        return CommonBitmapManager->fileBt;
    else if ( type == "color" )
        return CommonBitmapManager->colorBt;
    else if ( type == "string" )
        return CommonBitmapManager->texteBt;
    else if ( type == "key" )
        return CommonBitmapManager->keyBt;
    else if ( type == "mouse" )
        return CommonBitmapManager->mouseBt;
    else if ( type == "trueorfalse" )
        return CommonBitmapManager->trueOrFalseBt;
    else if ( type == "yesorno" )
        return CommonBitmapManager->yesnoBt;
    else if ( type == "layer" )
        return CommonBitmapManager->layerBt;
    else if ( type == "joyaxis" )
        return CommonBitmapManager->joyaxisBt;
    else if ( type == "objectvar" )
        return CommonBitmapManager->varBt;
    else if ( type == "scenevar" )
        return CommonBitmapManager->varBt;
    else if ( type == "globalvar" )
        return CommonBitmapManager->varBt;

    wxLogWarning( "Game Develop n'a pas pu trouver le bitmap d'un bouton suivant le type du paramètre" );
    return CommonBitmapManager->unknownBt;
}
#endif
