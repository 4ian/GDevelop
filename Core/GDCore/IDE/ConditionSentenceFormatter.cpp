/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include <stdexcept>
#include <iostream>
#include <string>
#include <vector>
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"
#include <wx/bitmap.h>
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/IDE/ConditionSentenceFormatter.h"
#include "GDCore/IDE/ActionSentenceFormatter.h"
#include "GDCore/CommonTools.h"

using namespace std;
using namespace gd;

namespace gd
{

string ConditionSentenceFormatter::Translate(const gd::Instruction & condition, const gd::InstructionMetadata & infos)
{
    return ActionSentenceFormatter::GetInstance()->Translate(condition, infos);
}

std::vector< std::pair<std::string, TextFormatting> > ConditionSentenceFormatter::GetAsFormattedText(const gd::Instruction & condition, const gd::InstructionMetadata & infos)
{
    return ActionSentenceFormatter::GetInstance()->GetAsFormattedText(condition, infos);
}

TextFormatting ConditionSentenceFormatter::GetFormattingFromType(const std::string & type)
{
    return ActionSentenceFormatter::GetInstance()->GetFormattingFromType(type);
}

std::string ConditionSentenceFormatter::LabelFromType( const std::string & type )
{
    if ( type == "" )
        return "";
    else if ( type == "expression" )
        return static_cast<string>(_( "Expression" ));
    else if ( gd::ParameterMetadata::IsObject(type) )
        return static_cast<string>(_( "Choose the object" ));
    else if ( type == "automatism" )
        return static_cast<string>(_( "Choose automatism" ));
    else if ( type == "relationalOperator" )
        return static_cast<string>(_( "Choose the sign" ));
    else if ( type == "file" )
        return static_cast<string>(_( "Choose the file" ));
    else if ( type == "color" )
        return static_cast<string>(_( "Choose the color" ));
    else if ( type == "string" )
        return static_cast<string>(_( "Choose the text" ));
    else if ( type == "key" )
        return static_cast<string>(_( "Choose the key" ));
    else if ( type == "mouse" )
        return static_cast<string>(_( "Choose the button" ));
    else if ( type == "trueorfalse" )
        return static_cast<string>(_( "True or False" ));
    else if ( type == "yesorno" )
        return static_cast<string>(_( "Yes or no" ));
    else if ( type == "layer" )
        return static_cast<string>(_( "Choose the layer" ));
    else if ( type == "joyaxis" )
        return static_cast<string>(_( "Choose axis" ));
    else if ( type == "objectvar" )
        return static_cast<string>(_("Choose a variable of the object"));
    else if ( type == "scenevar" )
        return static_cast<string>(_("Choose the scene variable"));
    else if ( type == "globalvar" )
        return static_cast<string>(_("Choose the global variable"));

    return "undefined";
}

wxBitmap ConditionSentenceFormatter::BitmapFromType( const std::string & type )
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

    return CommonBitmapManager->unknownBt;
}

}
#endif