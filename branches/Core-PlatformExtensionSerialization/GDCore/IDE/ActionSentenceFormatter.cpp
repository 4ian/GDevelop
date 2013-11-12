/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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

namespace gd
{

ActionSentenceFormatter *ActionSentenceFormatter::_singleton = NULL;

/**
 * Generate the sentence describing an action.
 */
string ActionSentenceFormatter::Translate(const gd::Instruction & action, const gd::InstructionMetadata & infos)
{
    std::string trad = infos.GetSentence();

    //Format special
    /*if ( trad.substr(0, 3) == "Do " && infos.parameters.size() >  ) 
    {

    }*/

    //Replace _PARAMx_ by values
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
std::vector< std::pair<std::string, gd::TextFormatting> > ActionSentenceFormatter::GetAsFormattedText(const Instruction & action, const gd::InstructionMetadata & infos)
{
    std::vector< std::pair<std::string, gd::TextFormatting> > formattedStr;

    std::string sentence = infos.GetSentence();
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

TextFormatting ActionSentenceFormatter::GetFormattingFromType(const std::string & type)
{
    TextFormatting format;

    return typesFormatting[type];
}

void ActionSentenceFormatter::LoadTypesFormattingFromConfig()
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

void ActionSentenceFormatter::SaveTypesFormattingToConfig()
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
string ActionSentenceFormatter::LabelFromType(const std::string & type)
{
    if ( type == "" )
        return "";
    else if ( type == "expression" )
        return ToString(_("Expression"));
    else if ( gd::ParameterMetadata::IsObject(type) )
        return ToString(_("Choose the object"));
    else if ( type == "automatism" )
        return ToString(_("Choose automatism"));
    else if ( type == "operator" )
        return ToString(_("Choose the sign"));
    else if ( type == "file" )
        return ToString(_("Choose the file"));
    else if ( type == "yesorno" )
        return ToString(_("Yes or no"));
    else if ( type == "police" )
        return ToString(_("Choose the font"));
    else if ( type == "color" )
        return ToString(_("Choose the color"));
    else if ( type == "string" )
        return ToString(_("Edit the text"));
    else if ( type == "musicfile" )
        return ToString(_("Choose the music"));
    else if ( type == "soundfile" )
        return ToString(_("Choose the sound"));
    else if ( type == "password" )
        return ToString(_("Create a password"));
    else if ( type == "layer" )
        return ToString(_("Choose the layer"));
    else if ( type == "joyaxis" )
        return ToString(_("Choose axis"));
    else if ( type == "objectvar" )
        return ToString(_("Choose a variable of the object"));
    else if ( type == "scenevar" )
        return ToString(_("Choose the scene variable"));
    else if ( type == "globalvar" )
        return ToString(_("Choose the global variable"));

    return "undefined";
}

////////////////////////////////////////////////////////////
/// Renvoi le bitmap du bouton en fonction du type
////////////////////////////////////////////////////////////
wxBitmap ActionSentenceFormatter::BitmapFromType(const std::string & type)
{
    gd::CommonBitmapManager * CommonBitmapManager = gd::CommonBitmapManager::GetInstance();

    if ( type == "" )
        return CommonBitmapManager->unknownBt;
    else if ( type == "expression" )
        return CommonBitmapManager->expressionBt;
    else if ( gd::ParameterMetadata::IsObject(type) )
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


}

#endif
