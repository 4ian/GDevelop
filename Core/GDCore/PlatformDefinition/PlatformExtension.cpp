/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <algorithm>
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/IDE/PlatformManager.h"
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/PlatformDefinition/AutomatismsSharedData.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/Events/ObjectMetadata.h"
#include "GDCore/Events/AutomatismMetadata.h"
#include "GDCore/Events/EventMetadata.h"
#include "GDCore/Events/Event.h"
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#endif

namespace gd
{

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::InstructionMetadata > PlatformExtension::badConditionsMetadata;
std::map<gd::String, gd::InstructionMetadata > PlatformExtension::badActionsMetadata;
std::map<gd::String, gd::ExpressionMetadata > PlatformExtension::badExpressionsMetadata;
std::map<gd::String, gd::ExpressionMetadata > PlatformExtension::badStrExpressionsMetadata;
#endif

gd::InstructionMetadata & PlatformExtension::AddCondition(const gd::String & name,
                                       const gd::String & fullname,
                                       const gd::String & description,
                                       const gd::String & sentence,
                                       const gd::String & group,
                                       const gd::String & icon,
                                       const gd::String & smallicon)
{
#if defined(GD_IDE_ONLY)
    gd::String nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    conditionsInfos[nameWithNamespace] = InstructionMetadata(GetNameSpace(), nameWithNamespace, fullname, description, sentence, group, icon, smallicon);
    return conditionsInfos[nameWithNamespace];
#endif
}

gd::InstructionMetadata & PlatformExtension::AddAction(const gd::String & name,
                                       const gd::String & fullname,
                                       const gd::String & description,
                                       const gd::String & sentence,
                                       const gd::String & group,
                                       const gd::String & icon,
                                       const gd::String & smallicon)
{
#if defined(GD_IDE_ONLY)
    gd::String nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    actionsInfos[nameWithNamespace] = InstructionMetadata(GetNameSpace(), nameWithNamespace, fullname, description, sentence, group, icon, smallicon);
    return actionsInfos[nameWithNamespace];
#endif
}

gd::ExpressionMetadata & PlatformExtension::AddExpression(const gd::String & name,
                                       const gd::String & fullname,
                                       const gd::String & description,
                                       const gd::String & group,
                                       const gd::String & smallicon)
{
#if defined(GD_IDE_ONLY)
    gd::String nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    expressionsInfos[nameWithNamespace] = ExpressionMetadata(GetNameSpace(), nameWithNamespace, fullname, description, group, smallicon);
    return expressionsInfos[nameWithNamespace];
#endif
}

gd::ExpressionMetadata & PlatformExtension::AddStrExpression(const gd::String & name,
                                       const gd::String & fullname,
                                       const gd::String & description,
                                       const gd::String & group,
                                       const gd::String & smallicon)
{
#if defined(GD_IDE_ONLY)
    gd::String nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    strExpressionsInfos[nameWithNamespace] = ExpressionMetadata(GetNameSpace(), nameWithNamespace, fullname, description, group, smallicon);
    return strExpressionsInfos[nameWithNamespace];
#endif
}

gd::ObjectMetadata & PlatformExtension::AddObject(const gd::String & name,
                               const gd::String & fullname,
                               const gd::String & informations,
                               const gd::String & icon24x24,
                               CreateFunPtr createFunPtrP)
{
    gd::String nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    objectsInfos[nameWithNamespace] = ObjectMetadata(GetNameSpace(), nameWithNamespace, fullname, informations, icon24x24, createFunPtrP);
    return objectsInfos[nameWithNamespace];
}

gd::AutomatismMetadata & PlatformExtension::AddAutomatism(const gd::String & name,
                                                      const gd::String & fullname,
                                                      const gd::String & defaultName,
                                                      const gd::String & description,
                                                      const gd::String & group,
                                                      const gd::String & icon24x24,
                                                      const gd::String & className,
                                                      std::shared_ptr<gd::Automatism> instance,
                                                      std::shared_ptr<gd::AutomatismsSharedData> sharedDatasInstance)
{
    gd::String nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    automatismsInfo[nameWithNamespace] = AutomatismMetadata(GetNameSpace(), nameWithNamespace, fullname, defaultName, description, group, icon24x24, className, instance, sharedDatasInstance);
    return automatismsInfo[nameWithNamespace];
}

gd::EventMetadata & PlatformExtension::AddEvent(const gd::String & name_,
                                                 const gd::String & fullname_,
                                                 const gd::String & description_,
                                                 const gd::String & group_,
                                                 const gd::String & smallicon_,
                                                 std::shared_ptr<gd::BaseEvent> instance_)
{
#if defined(GD_IDE_ONLY)
    gd::String nameWithNamespace = GetNameSpace().empty() ? name_ : GetNameSpace()+name_;
    eventsInfos[nameWithNamespace] = gd::EventMetadata(nameWithNamespace, fullname_, description_, group_, smallicon_, instance_);
    return eventsInfos[nameWithNamespace];
#endif
}

void PlatformExtension::SetExtensionInformation(const gd::String & name_,
                                                 const gd::String & fullname_,
                                                 const gd::String & description_,
                                                 const gd::String & author_,
                                                 const gd::String & license_)
{
    name = name_;
    fullname = fullname_;
    informations = description_;
    author = author_;
    license = license_;
    SetNameSpace(name_);
}

std::vector < gd::String > PlatformExtension::GetExtensionObjectsTypes() const
{
    std::vector < gd::String > objects;

    std::map<gd::String, gd::ObjectMetadata>::const_iterator it;
    for(it = objectsInfos.begin(); it != objectsInfos.end(); ++it)
        objects.push_back(it->first);

    return objects;
}

gd::ObjectMetadata & PlatformExtension::GetObjectMetadata(const gd::String & objectType)
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second;

    std::cout << "Warning: Object type \"" << objectType << "\" not found in an extension!" << std::endl;
    return badObjectMetadata;
}

gd::AutomatismMetadata & PlatformExtension::GetAutomatismMetadata(const gd::String & automatismType)
{
    if ( automatismsInfo.find(automatismType) != automatismsInfo.end())
        return automatismsInfo.find(automatismType)->second;

    std::cout << "Warning: Automatism type \"" << automatismType << "\" not found in an extension!" << std::endl;
    return badAutomatismMetadata;
}

#if defined(GD_IDE_ONLY)
std::vector < gd::String > PlatformExtension::GetAutomatismsTypes() const
{
    std::vector < gd::String > automatisms;

    std::map<gd::String, gd::AutomatismMetadata>::const_iterator it;
    for(it = automatismsInfo.begin(); it != automatismsInfo.end(); ++it)
        automatisms.push_back(it->first);

    return automatisms;
}

std::map<gd::String, gd::InstructionMetadata > & PlatformExtension::GetAllActions()
{
    return actionsInfos;
}

std::map<gd::String, gd::InstructionMetadata > & PlatformExtension::GetAllConditions()
{
    return conditionsInfos;
}

std::map<gd::String, gd::ExpressionMetadata > & PlatformExtension::GetAllExpressions()
{
    return expressionsInfos;
}

std::map<gd::String, gd::ExpressionMetadata > & PlatformExtension::GetAllStrExpressions()
{
    return strExpressionsInfos;
}

std::map<gd::String, gd::EventMetadata > & PlatformExtension::GetAllEvents()
{
    return eventsInfos;
}
std::map<gd::String, gd::InstructionMetadata > & PlatformExtension::GetAllActionsForObject(gd::String objectType)
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.actionsInfos;

    return badActionsMetadata;
}

std::map<gd::String, gd::InstructionMetadata > & PlatformExtension::GetAllConditionsForObject(gd::String objectType)
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.conditionsInfos;

    return badConditionsMetadata;
}

std::map<gd::String, gd::ExpressionMetadata > & PlatformExtension::GetAllExpressionsForObject(gd::String objectType)
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.expressionsInfos;

    return badExpressionsMetadata;
}

std::map<gd::String, gd::ExpressionMetadata > & PlatformExtension::GetAllStrExpressionsForObject(gd::String objectType)
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.strExpressionsInfos;

    return badStrExpressionsMetadata;
}

std::map<gd::String, gd::InstructionMetadata > & PlatformExtension::GetAllActionsForAutomatism(gd::String autoType)
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.actionsInfos;

    return badActionsMetadata;
}

std::map<gd::String, gd::InstructionMetadata > & PlatformExtension::GetAllConditionsForAutomatism(gd::String autoType)
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.conditionsInfos;

    return badConditionsMetadata;
}

std::map<gd::String, gd::ExpressionMetadata > & PlatformExtension::GetAllExpressionsForAutomatism(gd::String autoType)
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.expressionsInfos;

    return badExpressionsMetadata;
}

std::map<gd::String, gd::ExpressionMetadata > & PlatformExtension::GetAllStrExpressionsForAutomatism(gd::String autoType)
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.strExpressionsInfos;

    return badStrExpressionsMetadata;
}

gd::BaseEventSPtr PlatformExtension::CreateEvent(gd::String eventType) const
{
    if ( eventsInfos.find(eventType) != eventsInfos.end()) {

        if (eventsInfos.find(eventType)->second.instance == std::shared_ptr<BaseEvent>()) {
            std::cout << "ERROR: Extension " << name << " (" << nameSpace << ")"
                << " claims to have event of type " << eventType
                << " but the instance provided is NULL." << std::endl;
            return std::shared_ptr<gd::BaseEvent>();
        }

        return gd::BaseEventSPtr(eventsInfos.find(eventType)->second.instance->Clone());
    }

    return std::shared_ptr<gd::BaseEvent>();
}
#endif

CreateFunPtr PlatformExtension::GetObjectCreationFunctionPtr(gd::String objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.createFunPtr;

    return NULL;
}

Automatism* PlatformExtension::CreateAutomatism(gd::String type) const
{
    if ( automatismsInfo.find(type) != automatismsInfo.end())
        return automatismsInfo.find(type)->second.Get()->Clone();

    return NULL;
}


std::shared_ptr<gd::AutomatismsSharedData> PlatformExtension::CreateAutomatismSharedDatas(gd::String type) const
{
    if ( automatismsInfo.find(type) != automatismsInfo.end() && automatismsInfo.find(type)->second.GetSharedDataInstance())
        return automatismsInfo.find(type)->second.GetSharedDataInstance()->Clone();

    return std::shared_ptr<gd::AutomatismsSharedData>();
}


void PlatformExtension::SetNameSpace(gd::String nameSpace_)
{
    //Most of the builtin extensions do not have namespace
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
        name == "BuiltinCommonConversions" ||
        name == "BuiltinStringInstructions" ||
        name == "BuiltinMathematicalTools" ||
        name == "CommonDialogs") //New name for BuiltinInterface
    {
        nameSpace = "";
        return;
    }


    nameSpace = nameSpace_+"::";
}

std::vector<gd::String> PlatformExtension::GetBuiltinExtensionsNames()
{
    std::vector<gd::String> builtinExtensions;
    builtinExtensions.push_back("Sprite");
    builtinExtensions.push_back("BuiltinObject");
    builtinExtensions.push_back("BuiltinAudio");
    builtinExtensions.push_back("BuiltinMouse");
    builtinExtensions.push_back("BuiltinKeyboard");
    builtinExtensions.push_back("BuiltinJoystick");
    builtinExtensions.push_back("BuiltinTime");
    builtinExtensions.push_back("BuiltinFile");
    builtinExtensions.push_back("BuiltinVariables");
    builtinExtensions.push_back("BuiltinCamera");
    builtinExtensions.push_back("BuiltinWindow");
    builtinExtensions.push_back("BuiltinNetwork");
    builtinExtensions.push_back("BuiltinScene");
    builtinExtensions.push_back("BuiltinAdvanced");
    builtinExtensions.push_back("BuiltinCommonConversions");
    builtinExtensions.push_back("BuiltinStringInstructions");
    builtinExtensions.push_back("BuiltinMathematicalTools");
    builtinExtensions.push_back("BuiltinExternalLayouts");
    builtinExtensions.push_back("BuiltinCommonInstructions");

    return builtinExtensions;
}

bool PlatformExtension::IsBuiltin() const
{
    std::vector<gd::String > builtinExtensions = GetBuiltinExtensionsNames();
    return std::find(builtinExtensions.begin(), builtinExtensions.end(), name) != builtinExtensions.end();
}

#if defined(GD_IDE_ONLY)
void PlatformExtension::CloneExtension(const gd::String & platformName, const gd::String & extensionName, bool stripFunctionsNameAndCodeGeneration)
{
    gd::Platform* platform = gd::PlatformManager::Get()->GetPlatform(platformName);
    if ( !platform ) {
        std::cout << "Unable to clone extension \""<< extensionName << "\" from " << platformName << ": This platform doesn't exist.";
        return;
    }

    std::shared_ptr<gd::PlatformExtension> extension = platform->GetExtension(extensionName);
    if ( !extension ) {
        std::cout << "Unable to clone extension \""<< extensionName << "\" from " << platformName << ": This extension doesn't exist.";
        return;
    }

    *this = *extension;

    if ( stripFunctionsNameAndCodeGeneration )
    {
        for (std::map<gd::String, gd::InstructionMetadata >::iterator it = GetAllActions().begin();it != GetAllActions().end();++it)
            it->second.SetFunctionName("").SetGetter("")
                .SetCustomCodeGenerator(std::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>());

        for (std::map<gd::String, gd::InstructionMetadata >::iterator it = GetAllConditions().begin();it != GetAllConditions().end();++it)
            it->second.SetFunctionName("").SetGetter("")
                .SetCustomCodeGenerator(std::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>());

        for (std::map<gd::String, gd::ExpressionMetadata >::iterator it = GetAllExpressions().begin();it != GetAllExpressions().end();++it)
            it->second.SetFunctionName("")
                .SetCustomCodeGenerator(std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>());

        for (std::map<gd::String, gd::ExpressionMetadata >::iterator it = GetAllStrExpressions().begin();it != GetAllStrExpressions().end();++it)
            it->second.SetFunctionName("")
                .SetCustomCodeGenerator(std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>());

        for(std::map<gd::String, gd::ObjectMetadata >::iterator objIt = objectsInfos.begin();objIt!=objectsInfos.end();++objIt)
        {
            gd::ObjectMetadata & obj = objIt->second;

            for (std::map<gd::String, gd::InstructionMetadata >::iterator it = obj.actionsInfos.begin();it != obj.actionsInfos.end();++it)
                it->second.SetFunctionName("").SetGetter("")
                    .SetCustomCodeGenerator(std::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>());

            for (std::map<gd::String, gd::InstructionMetadata >::iterator it = obj.conditionsInfos.begin();it != obj.conditionsInfos.end();++it)
                it->second.SetFunctionName("").SetGetter("")
                    .SetCustomCodeGenerator(std::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>());

            for (std::map<gd::String, gd::ExpressionMetadata >::iterator it = obj.expressionsInfos.begin();it != obj.expressionsInfos.end();++it)
                it->second.SetFunctionName("")
                    .SetCustomCodeGenerator(std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>());

            for (std::map<gd::String, gd::ExpressionMetadata >::iterator it = obj.strExpressionsInfos.begin();it != obj.strExpressionsInfos.end();++it)
                it->second.SetFunctionName("")
                    .SetCustomCodeGenerator(std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>());
        }

        for(std::map<gd::String, gd::AutomatismMetadata >::iterator objIt = automatismsInfo.begin();objIt!=automatismsInfo.end();++objIt)
        {
            gd::AutomatismMetadata & obj = objIt->second;

            for (std::map<gd::String, gd::InstructionMetadata >::iterator it = obj.actionsInfos.begin();it != obj.actionsInfos.end();++it)
                it->second.SetFunctionName("").SetGetter("")
                    .SetCustomCodeGenerator(std::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>());

            for (std::map<gd::String, gd::InstructionMetadata >::iterator it = obj.conditionsInfos.begin();it != obj.conditionsInfos.end();++it)
                it->second.SetFunctionName("").SetGetter("")
                    .SetCustomCodeGenerator(std::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>());

            for (std::map<gd::String, gd::ExpressionMetadata >::iterator it = obj.expressionsInfos.begin();it != obj.expressionsInfos.end();++it)
                it->second.SetFunctionName("")
                    .SetCustomCodeGenerator(std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>());

            for (std::map<gd::String, gd::ExpressionMetadata >::iterator it = obj.strExpressionsInfos.begin();it != obj.strExpressionsInfos.end();++it)
                it->second.SetFunctionName("")
                    .SetCustomCodeGenerator(std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>());
        }

        for(std::map<gd::String, gd::EventMetadata >::iterator it = eventsInfos.begin();it!=eventsInfos.end();++it)
            it->second.codeGeneration = std::shared_ptr<gd::EventMetadata::CodeGenerator>();
    }
}

void PlatformExtension::StripUnimplementedInstructionsAndExpressions()
{
    for (std::map<gd::String, gd::InstructionMetadata >::iterator it = GetAllActions().begin();it != GetAllActions().end();)
    {
        if ( it->second.codeExtraInformation.functionCallName.empty() &&
             it->second.codeExtraInformation.optionalCustomCodeGenerator == std::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>())
        {
            GetAllActions().erase(it++);
        }
        else ++it;
    }

    for (std::map<gd::String, gd::InstructionMetadata >::iterator it = GetAllConditions().begin();it != GetAllConditions().end();)
    {
        if ( it->second.codeExtraInformation.functionCallName.empty() &&
             it->second.codeExtraInformation.optionalCustomCodeGenerator == std::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>())
        {
            GetAllConditions().erase(it++);
        }
        else ++it;
    }

    for (std::map<gd::String, gd::ExpressionMetadata >::iterator it = GetAllExpressions().begin();it != GetAllExpressions().end();)
    {
        if ( it->second.codeExtraInformation.functionCallName.empty() &&
             it->second.codeExtraInformation.optionalCustomCodeGenerator == std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>())
        {
            GetAllExpressions().erase(it++);
        }
        else ++it;
    }

    for (std::map<gd::String, gd::ExpressionMetadata >::iterator it = GetAllStrExpressions().begin();it != GetAllStrExpressions().end();)
    {
        if ( it->second.codeExtraInformation.functionCallName.empty() &&
             it->second.codeExtraInformation.optionalCustomCodeGenerator == std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>())
        {
            GetAllStrExpressions().erase(it++);
        }
        else ++it;
    }

    for(std::map<gd::String, gd::ObjectMetadata >::iterator objIt = objectsInfos.begin();objIt!=objectsInfos.end();++objIt)
    {
        gd::ObjectMetadata & obj = objIt->second;

        for (std::map<gd::String, gd::InstructionMetadata >::iterator it = obj.actionsInfos.begin();it != obj.actionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == std::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>())
            {
                obj.actionsInfos.erase(it++);
            }
            else ++it;
        }

        for (std::map<gd::String, gd::InstructionMetadata >::iterator it = obj.conditionsInfos.begin();it != obj.conditionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == std::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>())
            {
                obj.conditionsInfos.erase(it++);
            }
            else ++it;
        }

        for (std::map<gd::String, gd::ExpressionMetadata >::iterator it = obj.expressionsInfos.begin();it != obj.expressionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>())
            {
                obj.expressionsInfos.erase(it++);
            }
            else ++it;
        }

        for (std::map<gd::String, gd::ExpressionMetadata >::iterator it = obj.strExpressionsInfos.begin();it != obj.strExpressionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>())
            {
                obj.strExpressionsInfos.erase(it++);
            }
            else ++it;
        }
    }

    for(std::map<gd::String, gd::AutomatismMetadata >::iterator objIt = automatismsInfo.begin();objIt!=automatismsInfo.end();++objIt)
    {
        gd::AutomatismMetadata & obj = objIt->second;

        for (std::map<gd::String, gd::InstructionMetadata >::iterator it = obj.actionsInfos.begin();it != obj.actionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == std::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>())
            {
                obj.actionsInfos.erase(it++);
            }
            else ++it;
        }

        for (std::map<gd::String, gd::InstructionMetadata >::iterator it = obj.conditionsInfos.begin();it != obj.conditionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == std::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>())
            {
                obj.conditionsInfos.erase(it++);
            }
            else ++it;
        }

        for (std::map<gd::String, gd::ExpressionMetadata >::iterator it = obj.expressionsInfos.begin();it != obj.expressionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>())
            {
                obj.expressionsInfos.erase(it++);
            }
            else ++it;
        }

        for (std::map<gd::String, gd::ExpressionMetadata >::iterator it = obj.strExpressionsInfos.begin();it != obj.strExpressionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == std::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>())
            {
                obj.strExpressionsInfos.erase(it++);
            }
            else ++it;
        }
    }

    for(std::map<gd::String, gd::EventMetadata >::iterator it = eventsInfos.begin();it!=eventsInfos.end();)
    {
        if ( it->second.codeGeneration == std::shared_ptr<gd::EventMetadata::CodeGenerator>())
            eventsInfos.erase(it++);
        else ++it;
    }
}
/*
template<class Archive>
void PlatformExtension::Serialize(Archive & archive)
{
    archive(CEREAL_NVP(name), CEREAL_NVP(nameSpace), CEREAL_NVP(fullname),
        CEREAL_NVP(informations), CEREAL_NVP(author), CEREAL_NVP(license));
}*/
#endif

PlatformExtension::PlatformExtension()
{
    //ctor
}

PlatformExtension::~PlatformExtension()
{
    //dtor
}

}
