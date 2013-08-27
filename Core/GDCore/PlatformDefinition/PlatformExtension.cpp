/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
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
#if defined(GD_IDE_ONLY)
#include <wx/bitmap.h>
#endif

namespace gd
{

#if defined(GD_IDE_ONLY)
std::map<std::string, gd::InstructionMetadata > PlatformExtension::badConditionsMetadata;
std::map<std::string, gd::InstructionMetadata > PlatformExtension::badActionsMetadata;
std::map<std::string, gd::ExpressionMetadata > PlatformExtension::badExpressionsMetadata;
std::map<std::string, gd::StrExpressionMetadata > PlatformExtension::badStrExpressionsMetadata;
#endif

gd::InstructionMetadata & PlatformExtension::AddCondition(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & sentence,
                                       const std::string & group,
                                       const std::string & icon,
                                       const std::string & smallicon)
{
#if defined(GD_IDE_ONLY)
    std::string nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    conditionsInfos[nameWithNamespace] = InstructionMetadata(GetNameSpace(), nameWithNamespace, fullname, description, sentence, group, icon, smallicon);
    return conditionsInfos[nameWithNamespace];
#endif
}

gd::InstructionMetadata & PlatformExtension::AddAction(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & sentence,
                                       const std::string & group,
                                       const std::string & icon,
                                       const std::string & smallicon)
{
#if defined(GD_IDE_ONLY)
    std::string nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    actionsInfos[nameWithNamespace] = InstructionMetadata(GetNameSpace(), nameWithNamespace, fullname, description, sentence, group, icon, smallicon);
    return actionsInfos[nameWithNamespace];
#endif
}

gd::ExpressionMetadata & PlatformExtension::AddExpression(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & group,
                                       const std::string & smallicon)
{
#if defined(GD_IDE_ONLY)
    std::string nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    expressionsInfos[nameWithNamespace] = ExpressionMetadata(GetNameSpace(), nameWithNamespace, fullname, description, group, smallicon);
    return expressionsInfos[nameWithNamespace];
#endif
}

gd::StrExpressionMetadata & PlatformExtension::AddStrExpression(const std::string & name,
                                       const std::string & fullname,
                                       const std::string & description,
                                       const std::string & group,
                                       const std::string & smallicon)
{
#if defined(GD_IDE_ONLY)
    std::string nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    strExpressionsInfos[nameWithNamespace] = StrExpressionMetadata(GetNameSpace(), nameWithNamespace, fullname, description, group, smallicon);
    return strExpressionsInfos[nameWithNamespace];
#endif
}

gd::ObjectMetadata & PlatformExtension::AddObject(const std::string & name,
                               const std::string & fullname,
                               const std::string & informations,
                               const std::string & icon24x24,
                               CreateFunPtr createFunPtrP,
                               DestroyFunPtr destroyFunPtrP)
{
    std::string nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    objectsInfos[nameWithNamespace] = ObjectMetadata(GetNameSpace(), nameWithNamespace, fullname, informations, icon24x24, createFunPtrP, destroyFunPtrP);
    return objectsInfos[nameWithNamespace];
}

gd::AutomatismMetadata & PlatformExtension::AddAutomatism(const std::string & name,
                                                      const std::string & fullname,
                                                      const std::string & defaultName,
                                                      const std::string & description,
                                                      const std::string & group,
                                                      const std::string & icon24x24,
                                                      const std::string & className,
                                                      boost::shared_ptr<gd::Automatism> instance,
                                                      boost::shared_ptr<gd::AutomatismsSharedData> sharedDatasInstance)
{
    std::string nameWithNamespace = GetNameSpace().empty() ? name : GetNameSpace()+name;
    automatismsInfo[nameWithNamespace] = AutomatismMetadata(GetNameSpace(), nameWithNamespace, fullname, defaultName, description, group, icon24x24, className, instance, sharedDatasInstance);
    return automatismsInfo[nameWithNamespace];
}

gd::EventMetadata & PlatformExtension::AddEvent(const std::string & name_,
                                                 const std::string & fullname_,
                                                 const std::string & description_,
                                                 const std::string & group_,
                                                 const std::string & smallicon_,
                                                 boost::shared_ptr<gd::BaseEvent> instance_)
{
#if defined(GD_IDE_ONLY)
    std::string nameWithNamespace = GetNameSpace().empty() ? name_ : GetNameSpace()+name_;
    eventsInfos[nameWithNamespace] = gd::EventMetadata(nameWithNamespace, fullname_, description_, group_, smallicon_, instance_);
    return eventsInfos[nameWithNamespace];
#endif
}

void PlatformExtension::SetExtensionInformation(const std::string & name_,
                                                 const std::string & fullname_,
                                                 const std::string & description_,
                                                 const std::string & author_,
                                                 const std::string & license_)
{
    name = name_;
    fullname = fullname_;
    informations = description_;
    author = author_;
    license = license_;
    SetNameSpace(name_);
}

std::vector < std::string > PlatformExtension::GetExtensionObjectsTypes() const
{
    std::vector < std::string > objects;

    std::map<std::string, gd::ObjectMetadata>::const_iterator it;
    for(it = objectsInfos.begin(); it != objectsInfos.end(); ++it)
        objects.push_back(it->first);

    return objects;
}

#if defined(GD_IDE_ONLY)
std::vector < std::string > PlatformExtension::GetAutomatismsTypes() const
{
    std::vector < std::string > automatisms;

    std::map<std::string, gd::AutomatismMetadata>::const_iterator it;
    for(it = automatismsInfo.begin(); it != automatismsInfo.end(); ++it)
        automatisms.push_back(it->first);

    return automatisms;
}

std::map<std::string, gd::InstructionMetadata > & PlatformExtension::GetAllActions()
{
    return actionsInfos;
}

std::map<std::string, gd::InstructionMetadata > & PlatformExtension::GetAllConditions()
{
    return conditionsInfos;
}

std::map<std::string, gd::ExpressionMetadata > & PlatformExtension::GetAllExpressions()
{
    return expressionsInfos;
}

std::map<std::string, gd::StrExpressionMetadata > & PlatformExtension::GetAllStrExpressions()
{
    return strExpressionsInfos;
}

std::map<std::string, gd::EventMetadata > & PlatformExtension::GetAllEvents()
{
    return eventsInfos;
}

std::map<std::string, gd::AutomatismMetadata > & PlatformExtension::GetAllAutomatisms()
{
    return automatismsInfo;
}
std::map<std::string, gd::InstructionMetadata > & PlatformExtension::GetAllActionsForObject(std::string objectType)
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.actionsInfos;

    return badActionsMetadata;
}

std::map<std::string, gd::InstructionMetadata > & PlatformExtension::GetAllConditionsForObject(std::string objectType)
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.conditionsInfos;

    return badConditionsMetadata;
}

std::map<std::string, gd::ExpressionMetadata > & PlatformExtension::GetAllExpressionsForObject(std::string objectType)
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.expressionsInfos;

    return badExpressionsMetadata;
}

std::map<std::string, gd::StrExpressionMetadata > & PlatformExtension::GetAllStrExpressionsForObject(std::string objectType)
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.strExpressionsInfos;

    return badStrExpressionsMetadata;
}

std::map<std::string, gd::InstructionMetadata > & PlatformExtension::GetAllActionsForAutomatism(std::string autoType)
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.actionsInfos;

    return badActionsMetadata;
}

std::map<std::string, gd::InstructionMetadata > & PlatformExtension::GetAllConditionsForAutomatism(std::string autoType)
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.conditionsInfos;

    return badConditionsMetadata;
}

std::map<std::string, gd::ExpressionMetadata > & PlatformExtension::GetAllExpressionsForAutomatism(std::string autoType)
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.expressionsInfos;

    return badExpressionsMetadata;
}

std::map<std::string, gd::StrExpressionMetadata > & PlatformExtension::GetAllStrExpressionsForAutomatism(std::string autoType)
{
    if ( automatismsInfo.find(autoType) != automatismsInfo.end())
        return automatismsInfo.find(autoType)->second.strExpressionsInfos;

    return badStrExpressionsMetadata;
}

gd::ObjectMetadata & PlatformExtension::GetObjectMetadata(const std::string & objectType)
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second;

    std::cout << "Warning: Object type \"" << objectType << "\" not found in an extension!" << std::endl;
    return badObjectMetadata;
}

gd::AutomatismMetadata & PlatformExtension::GetAutomatismMetadata(const std::string & automatismType)
{
    if ( automatismsInfo.find(automatismType) != automatismsInfo.end())
        return automatismsInfo.find(automatismType)->second;

    std::cout << "Warning: Automatism type \"" << automatismType << "\" not found in an extension!" << std::endl;
    return badAutomatismMetadata;
}

gd::BaseEventSPtr PlatformExtension::CreateEvent(std::string eventType) const
{
    if ( eventsInfos.find(eventType) != eventsInfos.end())
        return eventsInfos.find(eventType)->second.instance->Clone();

    return boost::shared_ptr<gd::BaseEvent>();
}
#endif

CreateFunPtr PlatformExtension::GetObjectCreationFunctionPtr(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.createFunPtr;

    return NULL;
}

DestroyFunPtr PlatformExtension::GetDestroyObjectFunction(std::string objectType) const
{
    if ( objectsInfos.find(objectType) != objectsInfos.end())
        return objectsInfos.find(objectType)->second.destroyFunPtr;

    return NULL;
}

Automatism* PlatformExtension::CreateAutomatism(std::string type) const
{
    if ( automatismsInfo.find(type) != automatismsInfo.end())
        return automatismsInfo.find(type)->second.GetInstance()->Clone();

    return NULL;
}


boost::shared_ptr<gd::AutomatismsSharedData> PlatformExtension::CreateAutomatismSharedDatas(std::string type) const
{
    if ( automatismsInfo.find(type) != automatismsInfo.end() && automatismsInfo.find(type)->second.GetSharedDataInstance())
        return automatismsInfo.find(type)->second.GetSharedDataInstance()->Clone();

    return boost::shared_ptr<gd::AutomatismsSharedData>();
}


void PlatformExtension::SetNameSpace(std::string nameSpace_)
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

std::vector<std::string> PlatformExtension::GetBuiltinExtensionsNames()
{
    std::vector<std::string> builtinExtensions;
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
    std::vector<std::string > builtinExtensions = GetBuiltinExtensionsNames();
    return std::find(builtinExtensions.begin(), builtinExtensions.end(), name) != builtinExtensions.end();
}

#if defined(GD_IDE_ONLY)
void PlatformExtension::CloneExtension(const std::string & platformName, const std::string & extensionName, bool stripFunctionsNameAndCodeGeneration)
{
    gd::Platform* platform = gd::PlatformManager::GetInstance()->GetPlatform(platformName);
    if ( !platform ) {
        std::cout << "Unable to clone extension \""<< extensionName << "\" from " << platformName << ": This platform doesn't exist.";
        return;
    }

    boost::shared_ptr<gd::PlatformExtension> extension = platform->GetExtension(extensionName);
    if ( !extension ) {
        std::cout << "Unable to clone extension \""<< extensionName << "\" from " << platformName << ": This extension doesn't exist.";
        return;
    }

    *this = *extension;

    if ( stripFunctionsNameAndCodeGeneration )
    {
        for (std::map<std::string, gd::InstructionMetadata >::iterator it = GetAllActions().begin();it != GetAllActions().end();++it)
            it->second.codeExtraInformation.SetFunctionName("").SetAssociatedGetter("")
                .SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>());

        for (std::map<std::string, gd::InstructionMetadata >::iterator it = GetAllConditions().begin();it != GetAllConditions().end();++it)
            it->second.codeExtraInformation.SetFunctionName("").SetAssociatedGetter("")
                .SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>());

        for (std::map<std::string, gd::ExpressionMetadata >::iterator it = GetAllExpressions().begin();it != GetAllExpressions().end();++it)
            it->second.codeExtraInformation.SetFunctionName("")
                .SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>());

        for (std::map<std::string, gd::StrExpressionMetadata >::iterator it = GetAllStrExpressions().begin();it != GetAllStrExpressions().end();++it)
            it->second.codeExtraInformation.SetFunctionName("")
                .SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>());

        for(std::map<std::string, gd::ObjectMetadata >::iterator objIt = objectsInfos.begin();objIt!=objectsInfos.end();++objIt)
        {
            gd::ObjectMetadata & obj = objIt->second;

            for (std::map<std::string, gd::InstructionMetadata >::iterator it = obj.actionsInfos.begin();it != obj.actionsInfos.end();++it)
                it->second.codeExtraInformation.SetFunctionName("").SetAssociatedGetter("")
                    .SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>());

            for (std::map<std::string, gd::InstructionMetadata >::iterator it = obj.conditionsInfos.begin();it != obj.conditionsInfos.end();++it)
                it->second.codeExtraInformation.SetFunctionName("").SetAssociatedGetter("")
                    .SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>());

            for (std::map<std::string, gd::ExpressionMetadata >::iterator it = obj.expressionsInfos.begin();it != obj.expressionsInfos.end();++it)
                it->second.codeExtraInformation.SetFunctionName("")
                    .SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>());

            for (std::map<std::string, gd::StrExpressionMetadata >::iterator it = obj.strExpressionsInfos.begin();it != obj.strExpressionsInfos.end();++it)
                it->second.codeExtraInformation.SetFunctionName("")
                    .SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>());
        }

        for(std::map<std::string, gd::AutomatismMetadata >::iterator objIt = automatismsInfo.begin();objIt!=automatismsInfo.end();++objIt)
        {
            gd::AutomatismMetadata & obj = objIt->second;

            for (std::map<std::string, gd::InstructionMetadata >::iterator it = obj.actionsInfos.begin();it != obj.actionsInfos.end();++it)
                it->second.codeExtraInformation.SetFunctionName("").SetAssociatedGetter("")
                    .SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>());

            for (std::map<std::string, gd::InstructionMetadata >::iterator it = obj.conditionsInfos.begin();it != obj.conditionsInfos.end();++it)
                it->second.codeExtraInformation.SetFunctionName("").SetAssociatedGetter("")
                    .SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>());

            for (std::map<std::string, gd::ExpressionMetadata >::iterator it = obj.expressionsInfos.begin();it != obj.expressionsInfos.end();++it)
                it->second.codeExtraInformation.SetFunctionName("")
                    .SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>());

            for (std::map<std::string, gd::StrExpressionMetadata >::iterator it = obj.strExpressionsInfos.begin();it != obj.strExpressionsInfos.end();++it)
                it->second.codeExtraInformation.SetFunctionName("")
                    .SetCustomCodeGenerator(boost::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>());
        }

        for(std::map<std::string, gd::EventMetadata >::iterator it = eventsInfos.begin();it!=eventsInfos.end();++it)
            it->second.codeGeneration = boost::shared_ptr<gd::EventMetadata::CodeGenerator>();
    }
}

void PlatformExtension::StripUnimplementedInstructionsAndExpressions()
{
    for (std::map<std::string, gd::InstructionMetadata >::iterator it = GetAllActions().begin();it != GetAllActions().end();)
    {
        if ( it->second.codeExtraInformation.functionCallName.empty() &&
             it->second.codeExtraInformation.optionalCustomCodeGenerator == boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>())
        {
            GetAllActions().erase(it++);
        }
        else ++it;
    }

    for (std::map<std::string, gd::InstructionMetadata >::iterator it = GetAllConditions().begin();it != GetAllConditions().end();)
    {
        if ( it->second.codeExtraInformation.functionCallName.empty() &&
             it->second.codeExtraInformation.optionalCustomCodeGenerator == boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>())
        {
            GetAllConditions().erase(it++);
        }
        else ++it;
    }

    for (std::map<std::string, gd::ExpressionMetadata >::iterator it = GetAllExpressions().begin();it != GetAllExpressions().end();)
    {
        if ( it->second.codeExtraInformation.functionCallName.empty() &&
             it->second.codeExtraInformation.optionalCustomCodeGenerator == boost::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>())
        {
            GetAllExpressions().erase(it++);
        }
        else ++it;
    }

    for (std::map<std::string, gd::StrExpressionMetadata >::iterator it = GetAllStrExpressions().begin();it != GetAllStrExpressions().end();)
    {
        if ( it->second.codeExtraInformation.functionCallName.empty() &&
             it->second.codeExtraInformation.optionalCustomCodeGenerator == boost::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>())
        {
            GetAllStrExpressions().erase(it++);
        }
        else ++it;
    }

    for(std::map<std::string, gd::ObjectMetadata >::iterator objIt = objectsInfos.begin();objIt!=objectsInfos.end();++objIt)
    {
        gd::ObjectMetadata & obj = objIt->second;

        for (std::map<std::string, gd::InstructionMetadata >::iterator it = obj.actionsInfos.begin();it != obj.actionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>())
            {
                obj.actionsInfos.erase(it++);
            }
            else ++it;
        }

        for (std::map<std::string, gd::InstructionMetadata >::iterator it = obj.conditionsInfos.begin();it != obj.conditionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>())
            {
                obj.conditionsInfos.erase(it++);
            }
            else ++it;
        }

        for (std::map<std::string, gd::ExpressionMetadata >::iterator it = obj.expressionsInfos.begin();it != obj.expressionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == boost::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>())
            {
                obj.expressionsInfos.erase(it++);
            }
            else ++it;
        }

        for (std::map<std::string, gd::StrExpressionMetadata >::iterator it = obj.strExpressionsInfos.begin();it != obj.strExpressionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == boost::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>())
            {
                obj.strExpressionsInfos.erase(it++);
            }
            else ++it;
        }
    }

    for(std::map<std::string, gd::AutomatismMetadata >::iterator objIt = automatismsInfo.begin();objIt!=automatismsInfo.end();++objIt)
    {
        gd::AutomatismMetadata & obj = objIt->second;

        for (std::map<std::string, gd::InstructionMetadata >::iterator it = obj.actionsInfos.begin();it != obj.actionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>())
            {
                obj.actionsInfos.erase(it++);
            }
            else ++it;
        }

        for (std::map<std::string, gd::InstructionMetadata >::iterator it = obj.conditionsInfos.begin();it != obj.conditionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>())
            {
                obj.conditionsInfos.erase(it++);
            }
            else ++it;
        }

        for (std::map<std::string, gd::ExpressionMetadata >::iterator it = obj.expressionsInfos.begin();it != obj.expressionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == boost::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>())
            {
                obj.expressionsInfos.erase(it++);
            }
            else ++it;
        }

        for (std::map<std::string, gd::StrExpressionMetadata >::iterator it = obj.strExpressionsInfos.begin();it != obj.strExpressionsInfos.end();)
        {
            if ( it->second.codeExtraInformation.functionCallName.empty() &&
                 it->second.codeExtraInformation.optionalCustomCodeGenerator == boost::shared_ptr<gd::ExpressionCodeGenerationInformation::CustomCodeGenerator>())
            {
                obj.strExpressionsInfos.erase(it++);
            }
            else ++it;
        }
    }

    for(std::map<std::string, gd::EventMetadata >::iterator it = eventsInfos.begin();it!=eventsInfos.end();)
    {
        if ( it->second.codeGeneration == boost::shared_ptr<gd::EventMetadata::CodeGenerator>())
            eventsInfos.erase(it++);
        else ++it;
    }
}
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
