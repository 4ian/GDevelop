/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include <string>
#include <vector>
#include <utility>
#include <sstream>
#include <wx/log.h>
#include <wx/intl.h>
#include <wx/config.h>
#include "GDCore/CommonTools.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/IDE/ActionSentenceFormatter.h"
#include <wx/bitmap.h>
#include <iostream>
#include <map>

using namespace std;
using namespace gd;

TranslateAction *TranslateAction::_singleton = NULL;

////////////////////////////////////////////////////////////
/// Traduction complète
///
/// Traduction en une phrase complète d'une action et ses paramètres
////////////////////////////////////////////////////////////
string TranslateAction::Translate(const Instruction & action, const gd::InstructionMetadata & infos)
{
    std::string trad = infos.sentence;

    //Remplacement des _PARAMx_ par la valeur des paramètres
    for (unsigned int i =0;i<infos.parameters.size();++i)
    {
        while ( trad.find( "_PARAM"+ToString(i)+"_" ) != std::string::npos )
        {
            std::string parameter = action.GetParameter( i ).GetPlainString();

            trad.replace(   trad.find( "_PARAM"+ToString(i)+"_" ), //Chaine à remplacer
                            std::string("_PARAM"+ToString(i)+"_").length(), //Longueur de la chaine
                            parameter );
        }
    }

    std::replace( trad.begin(), trad.end(), '\n', ' ');

    return trad;
}

/**
 * Create a formatted sentence from an action
 */
std::vector< std::pair<std::string, TextFormatting> > TranslateAction::GetAsFormattedText(const Instruction & action, const gd::InstructionMetadata & infos)
{
    std::vector< std::pair<std::string, TextFormatting> > formattedStr;

    std::string sentence = infos.sentence;
    std::replace( sentence.begin(), sentence.end(), '\n', ' ');
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

        //When a parameter is found, complete formatted std::string.
        if ( parse )
        {
            if ( firstParamPosition != 0 ) //Add constant text before the parameter if any
            {
                TextFormatting format;
                formattedStr.push_back(std::make_pair(sentence.substr(0, firstParamPosition), format));
            }

            //Add the parameter
            TextFormatting format = GetFormattingFromType(infos.parameters[firstParamIndex].type);
            format.userData = firstParamIndex;

            std::string text = action.GetParameter( firstParamIndex ).GetPlainString();
            std::replace( text.begin(), text.end(), '\n', ' ');

            formattedStr.push_back(std::make_pair(text, format));

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

    return typesFormatting[type];
}

void TranslateAction::LoadTypesFormattingFromConfig()
{
    wxConfigBase * config = wxConfigBase::Get();

    typesFormatting.clear();

    {
    typesFormatting["expression"].color = config->ReadObject("EventsEditor/expressionColor", wxColour(99,0,0));
    typesFormatting["expression"].bold = config->ReadBool("EventsEditor/expressionBold", true);
    typesFormatting["expression"].italic = config->ReadBool("EventsEditor/expressionItalic", false);
    }
    {
    typesFormatting["object"].color = config->ReadObject("EventsEditor/objectColor", wxColour(19,81,0));
    typesFormatting["object"].bold = config->ReadBool("EventsEditor/objectBold", true);
    typesFormatting["object"].italic = config->ReadBool("EventsEditor/objectItalic", false);
    }
    {
    typesFormatting["automatism"].color = config->ReadObject("EventsEditor/automatismColor", wxColour(19,81,0));
    typesFormatting["automatism"].bold = config->ReadBool("EventsEditor/automatismBold", true);
    typesFormatting["automatism"].italic = config->ReadBool("EventsEditor/automatismItalic", false);
    }
    {
    typesFormatting["operator"].color = config->ReadObject("EventsEditor/operatorColor", wxColour(64,81,79));
    typesFormatting["operator"].bold = config->ReadBool("EventsEditor/operatorBold", true);
    typesFormatting["operator"].italic = config->ReadBool("EventsEditor/operatorItalic", false);
    }
    {
    typesFormatting["objectvar"].color = config->ReadObject("EventsEditor/objectvarColor", wxColour(44,69,99));
    typesFormatting["objectvar"].bold = config->ReadBool("EventsEditor/objectvarBold", true);
    typesFormatting["objectvar"].italic = config->ReadBool("EventsEditor/objectvarItalic", false);
    }
    {
    typesFormatting["scenevar"].color = config->ReadObject("EventsEditor/scenevarColor", wxColour(44,69,99));
    typesFormatting["scenevar"].bold = config->ReadBool("EventsEditor/scenevarBold", true);
    typesFormatting["scenevar"].italic = config->ReadBool("EventsEditor/scenevarItalic", false);
    }
    {
    typesFormatting["globalvar"].color = config->ReadObject("EventsEditor/globalvarColor", wxColour(44,69,99));
    typesFormatting["globalvar"].bold = config->ReadBool("EventsEditor/globalvarBold", true);
    typesFormatting["globalvar"].italic = config->ReadBool("EventsEditor/globalvarItalic", false);
    }
}

void TranslateAction::SaveTypesFormattingToConfig()
{
    wxConfigBase * config = wxConfigBase::Get();

    for (std::map<std::string, TextFormatting>::iterator it = typesFormatting.begin();it!=typesFormatting.end();++it)
    {
        config->Write("EventsEditor/"+it->first+"Color", typesFormatting[it->first].color);
        config->Write("EventsEditor/"+it->first+"Bold", typesFormatting[it->first].bold);
        config->Write("EventsEditor/"+it->first+"Italic", typesFormatting[it->first].italic);
    }
}

////////////////////////////////////////////////////////////
/// Renvoi le nom du bouton en fonction du type
////////////////////////////////////////////////////////////
string TranslateAction::LabelFromType(const std::string & type)
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
wxBitmap TranslateAction::BitmapFromType(const std::string & type)
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
    else if ( type == "operator" )
        return CommonBitmapManager->signeBt;
    else if ( type == "file" )
        return CommonBitmapManager->fileBt;
    else if ( type == "yesorno" )
        return CommonBitmapManager->yesnoBt;
    else if ( type == "police" )
        return CommonBitmapManager->policeBt;
    else if ( type == "color" )
        return CommonBitmapManager->colorBt;
    else if ( type == "string" )
        return CommonBitmapManager->texteBt;
    else if ( type == "musicfile" )
        return CommonBitmapManager->musicBt;
    else if ( type == "soundfile" )
        return CommonBitmapManager->soundBt;
    else if ( type == "password" )
        return CommonBitmapManager->passwordBt;
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

    return CommonBitmapManager->unknownBt;
}

#endif
