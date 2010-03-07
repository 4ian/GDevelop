/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ExtensionBase.h"
#include <vector>
#include <string>
#include <iostream>

using namespace std;

std::map<std::string, InstructionInfos > ExtensionBase::badConditionsInfos;
std::map<std::string, InstructionInfos > ExtensionBase::badActionsInfos;
std::map<std::string, ExpressionInfos > ExtensionBase::badExpressionsInfos;

ExtensionObjectInfos::ExtensionObjectInfos() :
destroyFunPtr(NULL),
createFunPtr(NULL),
createByCopyFunPtr(NULL)
{
}

ExpressionInfos::ExpressionInfos() :
#if defined(GDE)
shown(true),
#endif
expressionFunPtr(NULL),
expressionObjectFunPtr(NULL)
{
}

InstructionInfos::InstructionInfos() :
instructionFunPtr(NULL),
instructionObjectFunPtr(NULL)
{
}

ParameterInfo::ParameterInfo() :
useObject(false)
#if defined(GDE)
,optional(false)
#endif
{
}

void ExtensionBase::SetNameSpace(std::string nameSpace_)
{
    //For backward compatibility
    if (name == "Sprite" ||
        name == "BuiltinObject" ||
        name == "BuiltinAudio" ||
        name == "BuiltinMouse" ||
        name == "BuiltinKeyboard"||
        name == "BuiltinJoystick" ||
        name == "BuiltinTime"||
        name == "BuiltinFile"||
        name == "BuiltinInterface"||
        name == "BuiltinVariables"||
        name == "BuiltinCamera"||
        name == "BuiltinWindow"||
        name == "BuiltinNetwork"||
        name == "BuiltinScene"||
        name == "BuiltinAdvanced" ||
        name == "CommonDialogs") //New name for BuiltinInterface
    {
        nameSpace = "";
        return;
    }


    nameSpace = nameSpace_+"::";
}

vector < std::string > ExtensionBase::GetExtensionObjectsTypes() const
{
    vector < string > objects;

    std::map<string, ExtensionObjectInfos>::const_iterator it;
    for(it = objectsInfos.begin(); it != objectsInfos.end(); ++it)
        objects.push_back(it->first);

    return objects;
}

const std::map<std::string, InstructionInfos > & ExtensionBase::GetAllActions() const
{
    return actionsInfos;
}

const std::map<std::string, InstructionInfos > & ExtensionBase::GetAllConditions() const
{
    return conditionsInfos;
}

const std::map<std::string, ExpressionInfos > & ExtensionBase::GetAllExpressions() const
{
    return expressionsInfos;
}

const std::map<std::string, InstructionInfos > & ExtensionBase::GetAllActionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.actionsInfos;

    return badActionsInfos;
}

const std::map<std::string, InstructionInfos > & ExtensionBase::GetAllConditionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.conditionsInfos;

    return badConditionsInfos;
}

const std::map<std::string, ExpressionInfos > & ExtensionBase::GetAllExpressionsForObject(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.expressionsInfos;

    return badExpressionsInfos;
}

#if defined(GDE)
/**
 * Get information for an object of the extension
 */
std::string ExtensionBase::GetExtensionObjectName(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.fullname;

    return "";
}

/**
 * Get information for an object of the extension
 */
std::string ExtensionBase::GetExtensionObjectInfo(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.informations;

    return "";
}

/**
 * Get the bitmap of an object of the extension
 */
wxBitmap ExtensionBase::GetExtensionObjectBitmap(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.icon;

    return wxBitmap(24,24);
}
#endif

InstructionFunPtr       ExtensionBase::GetConditionFunctionPtr(std::string conditionName) const
{
    if ( conditionsInfos.find(conditionName) != conditionsInfos.end())
        return conditionsInfos.find(conditionName)->second.instructionFunPtr;

    return NULL;
}

InstructionObjectFunPtr ExtensionBase::GetObjectConditionFunctionPtr(std::string objectType, std::string conditionName) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
    {
        if ( objectsInfos.find(objectType)->second.conditionsInfos.find(conditionName) != objectsInfos.find(objectType)->second.conditionsInfos.end())
            return objectsInfos.find(objectType)->second.conditionsInfos.find(conditionName)->second.instructionObjectFunPtr;
    }

    return NULL;
}

InstructionFunPtr ExtensionBase::GetActionFunctionPtr(std::string actionName) const
{
    if ( actionsInfos.find(actionName) != actionsInfos.end())
        return actionsInfos.find(actionName)->second.instructionFunPtr;

    return NULL;
}

InstructionObjectFunPtr ExtensionBase::GetObjectActionFunctionPtr(std::string objectType, std::string actionName) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
    {
        if ( objectsInfos.find(objectType)->second.actionsInfos.find(actionName) != objectsInfos.find(objectType)->second.actionsInfos.end())
            return objectsInfos.find(objectType)->second.actionsInfos.find(actionName)->second.instructionObjectFunPtr;
    }

    return NULL;
}

ExpressionFunPtr        ExtensionBase::GetExpressionFunctionPtr(std::string expressionName) const
{
    if ( expressionsInfos.find(expressionName) != expressionsInfos.end())
        return expressionsInfos.find(expressionName)->second.expressionFunPtr;

    return NULL;
}

ExpressionObjectFunPtr  ExtensionBase::GetObjectExpressionFunctionPtr(std::string objectType, std::string expressionName) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
    {
        if ( objectsInfos.find(objectType)->second.expressionsInfos.find(expressionName) != objectsInfos.find(objectType)->second.expressionsInfos.end())
            return objectsInfos.find(objectType)->second.expressionsInfos.find(expressionName)->second.expressionObjectFunPtr;
    }

    return NULL;
}

CreateFunPtr ExtensionBase::GetObjectCreationFunctionPtr(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.createFunPtr;

    return NULL;
}

CreateByCopyFunPtr ExtensionBase::GetObjectCreationByCopyFunctionPtr(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.createByCopyFunPtr;

    return NULL;
}

DestroyFunPtr ExtensionBase::GetDestroyObjectFunction(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.destroyFunPtr;

    return NULL;
}
