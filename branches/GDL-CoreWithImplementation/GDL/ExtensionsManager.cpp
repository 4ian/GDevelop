/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <map>
#include <string>

#include "GDL/ExtensionsManager.h"
#include "GDL/BuiltinExtensions/BaseObjectExtension.h"
#include "GDL/BuiltinExtensions/CommonInstructionsExtension.h"
#include "GDL/BuiltinExtensions/CommonConversionsExtension.h"
#include "GDL/BuiltinExtensions/SceneExtension.h"
#include "GDL/BuiltinExtensions/StringInstructionsExtension.h"
#include "GDL/BuiltinExtensions/MouseExtension.h"
#include "GDL/BuiltinExtensions/TimeExtension.h"
#include "GDL/BuiltinExtensions/VariablesExtension.h"
#include "GDL/BuiltinExtensions/SpriteExtension.h"
#include "GDL/BuiltinExtensions/MathematicalToolsExtension.h"
#include "GDL/BuiltinExtensions/AdvancedExtension.h"
#include "GDL/BuiltinExtensions/KeyboardExtension.h"
#include "GDL/BuiltinExtensions/AudioExtension.h"
#include "GDL/BuiltinExtensions/CameraExtension.h"
#include "GDL/BuiltinExtensions/JoystickExtension.h"
#include "GDL/BuiltinExtensions/FileExtension.h"
#include "GDL/BuiltinExtensions/NetworkExtension.h"
#include "GDL/BuiltinExtensions/WindowExtension.h"
#include "GDL/BuiltinExtensions/ExternalLayoutsExtension.h"
#include "GDL/Object.h"
#include "GDL/IDE/CodeCompiler.h"

#if defined(GD_IDE_ONLY)
#include "GDL/Game.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#endif

ExtensionsManager *ExtensionsManager::_singleton = NULL;
#if defined(GD_IDE_ONLY)
gd::InstructionMetadata ExtensionsManager::badInstructionMetadata;
gd::ExpressionMetadata ExtensionsManager::badExpressionMetadata;
gd::StrExpressionMetadata ExtensionsManager::badStrExpressionMetadata;
#endif
AutomatismInfo ExtensionsManager::badAutomatismInfo;
ExtensionObjectInfos ExtensionsManager::badObjectInfo;

/**
 * Initializing Extension Manager
 */
ExtensionsManager::ExtensionsManager()
{
    //Load all extensions
    AddExtension(boost::shared_ptr<ExtensionBase>(new BaseObjectExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new SpriteExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new CommonInstructionsExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new CommonConversionsExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new VariablesExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new MouseExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new KeyboardExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new JoystickExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new SceneExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new TimeExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new MathematicalToolsExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new CameraExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new AudioExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new FileExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new NetworkExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new WindowExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new StringInstructionsExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new AdvancedExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new ExternalLayoutsExtension()));

#if defined(GD_IDE_ONLY)
    badInstructionMetadata.fullname = _("Unknown instruction");
    badInstructionMetadata.description = _("Unknown instruction");
    badInstructionMetadata.sentence = _("Unknown instruction");
#endif
}

////////////////////////////////////////////////////////////
/// Ajouter une extension au manager
////////////////////////////////////////////////////////////
bool ExtensionsManager::AddExtension(boost::shared_ptr<ExtensionBase> extension)
{
    cout << "New extension added to manager : " << extension->GetName() << endl;
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
    	if ( extensionsLoaded[i]->GetName() == extension->GetName() )
    	    return false;
    }

    //Load all objects provided by the extension
    vector < string > objectsTypes = extension->GetExtensionObjectsTypes();
    for ( unsigned int i = 0; i < objectsTypes.size();++i)
    {
        //Adding creations and destruction functions
        creationFunctionTable[objectsTypes[i]] = extension->GetObjectCreationFunctionPtr(objectsTypes[i]);
        destroyFunctionTable[objectsTypes[i]] = extension->GetDestroyObjectFunction(objectsTypes[i]);
    }

    #if defined(GD_IDE_ONLY)
    //Add include directories
    for (unsigned int i = 0;i<extension->GetSupplementaryIncludeDirectories().size();++i)
        CodeCompiler::GetInstance()->AddHeaderDirectory(extension->GetSupplementaryIncludeDirectories()[i]);
    #endif

    extensionsLoaded.push_back(extension);
    return true;
}

////////////////////////////////////////////////////////////
/// Une extension est elle chargée ?
/// -> Vérifie si elle est dans la liste des extensions
////////////////////////////////////////////////////////////
bool ExtensionsManager::IsExtensionLoaded(string name) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
    	if ( extensionsLoaded[i]->GetName() == name )
    	    return true;
    }

    return false;
}

////////////////////////////////////////////////////////////
/// Renvoie l'extension voulue, si chargée
////////////////////////////////////////////////////////////
boost::shared_ptr<ExtensionBase> ExtensionsManager::GetExtension(string name) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
    	if ( extensionsLoaded[i]->GetName() == name )
    	    return extensionsLoaded[i];
    }

    return boost::shared_ptr<ExtensionBase> ();
}

#if defined(GD_IDE_ONLY)
bool ExtensionsManager::HasEventType(std::string eventType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->CreateEvent(eventType) != boost::shared_ptr<gd::BaseEvent>() )
            return true;
    }

    return false;
}

boost::shared_ptr<gd::BaseEvent> ExtensionsManager::CreateEvent(std::string eventType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        boost::shared_ptr<gd::BaseEvent> event = extensionsLoaded[i]->CreateEvent(eventType);
        if ( event != boost::shared_ptr<gd::BaseEvent>() )
            return event;
    }

    return boost::shared_ptr<gd::BaseEvent>();
}

bool ExtensionsManager::HasAutomatism(std::string automatismType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->CreateAutomatism(automatismType) != NULL )
            return true;
    }

    return false;
}
#endif

boost::shared_ptr<Object> ExtensionsManager::CreateObject(std::string type, std::string name)
{
    if ( creationFunctionTable.find(type) == creationFunctionTable.end() )
    {
        std::cout << "Tried to create an object with an unknown type: " << type << std::endl;
        type = "";
    }

    //Create a new object with the type we want.
    Object * object = creationFunctionTable[type](name);
    object->SetType(type);

    return boost::shared_ptr<Object> (object, destroyFunctionTable[type]);
}

Automatism* ExtensionsManager::CreateAutomatism(std::string automatismType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        Automatism* automatism = extensionsLoaded[i]->CreateAutomatism(automatismType);
        if ( automatism != NULL )
            return automatism;
    }

    return NULL;
}

boost::shared_ptr<AutomatismsSharedDatas> ExtensionsManager::CreateAutomatismSharedDatas(std::string automatismType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        boost::shared_ptr<AutomatismsSharedDatas> automatism = extensionsLoaded[i]->CreateAutomatismSharedDatas(automatismType);
        if ( automatism != boost::shared_ptr<AutomatismsSharedDatas>() )
            return automatism;
    }

    return boost::shared_ptr<AutomatismsSharedDatas>();
}

#if defined(GD_IDE_ONLY)
const AutomatismInfo& ExtensionsManager::GetAutomatismMetadata(std::string automatism) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        vector < string > automatismsTypes = extensionsLoaded[i]->GetAutomatismsTypes();
        if ( find(automatismsTypes.begin(), automatismsTypes.end(), automatism) != automatismsTypes.end())
            return extensionsLoaded[i]->GetAutomatismMetadata(automatism);
    }

    return badAutomatismInfo;
}

const gd::InstructionMetadata & ExtensionsManager::GetActionMetadata(string actionType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, gd::InstructionMetadata> & allActions = extensionsLoaded[i]->GetAllActions();
        if ( allActions.find(actionType) != allActions.end() )
            return allActions.find(actionType)->second;

        const vector < string > & objects = extensionsLoaded[i]->GetExtensionObjectsTypes();
        for (unsigned int j = 0;j<objects.size();++j)
        {
            const std::map<string, gd::InstructionMetadata> & allObjectsActions = extensionsLoaded[i]->GetAllActionsForObject(objects[j]);
            if ( allObjectsActions.find(actionType) != allObjectsActions.end() )
                return allObjectsActions.find(actionType)->second;
        }

        const vector < string > & autos = extensionsLoaded[i]->GetAutomatismsTypes();
        for (unsigned int j = 0;j<autos.size();++j)
        {
            const std::map<string, gd::InstructionMetadata> & allAutosActions = extensionsLoaded[i]->GetAllActionsForAutomatism(autos[j]);
            if ( allAutosActions.find(actionType) != allAutosActions.end() )
                return allAutosActions.find(actionType)->second;
        }
    }

    return badInstructionMetadata;
}

const gd::InstructionMetadata & ExtensionsManager::GetConditionMetadata(string conditionType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, gd::InstructionMetadata> & allConditions = extensionsLoaded[i]->GetAllConditions();
        if ( allConditions.find(conditionType) != allConditions.end() )
            return allConditions.find(conditionType)->second;

        const vector < string > & objects = extensionsLoaded[i]->GetExtensionObjectsTypes();
        for (unsigned int j = 0;j<objects.size();++j)
        {
            const std::map<string, gd::InstructionMetadata> & allObjetsConditions = extensionsLoaded[i]->GetAllConditionsForObject(objects[j]);
            if ( allObjetsConditions.find(conditionType) != allObjetsConditions.end() )
                return allObjetsConditions.find(conditionType)->second;
        }

        const vector < string > & autos = extensionsLoaded[i]->GetAutomatismsTypes();
        for (unsigned int j = 0;j<autos.size();++j)
        {
            const std::map<string, gd::InstructionMetadata> & allAutosConditions = extensionsLoaded[i]->GetAllConditionsForAutomatism(autos[j]);
            if ( allAutosConditions.find(conditionType) != allAutosConditions.end() )
                return allAutosConditions.find(conditionType)->second;
        }
    }

    return badInstructionMetadata;
}

const gd::ExpressionMetadata & ExtensionsManager::GetObjectExpressionMetadata(string objectType, string exprType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const vector < string > & objects = extensionsLoaded[i]->GetExtensionObjectsTypes();
        if ( find(objects.begin(), objects.end(), objectType) != objects.end())
        {
            const std::map<string, gd::ExpressionMetadata> & allObjectExpressions = extensionsLoaded[i]->GetAllExpressionsForObject(objectType);
            if ( allObjectExpressions.find(exprType) != allObjectExpressions.end() )
                return allObjectExpressions.find(exprType)->second;
        }
    }

    //Then check base
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, gd::ExpressionMetadata> & allObjectExpressions = extensionsLoaded[i]->GetAllExpressionsForObject("");
        if ( allObjectExpressions.find(exprType) != allObjectExpressions.end() )
            return allObjectExpressions.find(exprType)->second;
    }

    return badExpressionMetadata;
}

const gd::ExpressionMetadata & ExtensionsManager::GetAutomatismExpressionMetadata(string autoType, string exprType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const vector < string > & autos = extensionsLoaded[i]->GetAutomatismsTypes();
        if ( find(autos.begin(), autos.end(), autoType) != autos.end())
        {
            const std::map<string, gd::ExpressionMetadata> & allAutoExpressions = extensionsLoaded[i]->GetAllExpressionsForAutomatism(autoType);
            if ( allAutoExpressions.find(exprType) != allAutoExpressions.end() )
                return allAutoExpressions.find(exprType)->second;
        }
    }

    //Then check base
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, gd::ExpressionMetadata> & allAutoExpressions = extensionsLoaded[i]->GetAllExpressionsForAutomatism("");
        if ( allAutoExpressions.find(exprType) != allAutoExpressions.end() )
            return allAutoExpressions.find(exprType)->second;
    }

    return badExpressionMetadata;
}

const gd::ExpressionMetadata & ExtensionsManager::GetExpressionMetadata(string exprType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, gd::ExpressionMetadata> & allExpr = extensionsLoaded[i]->GetAllExpressions();
        if ( allExpr.find(exprType) != allExpr.end() )
            return allExpr.find(exprType)->second;
    }

    return badExpressionMetadata;
}

const gd::StrExpressionMetadata & ExtensionsManager::GetObjectStrExpressionMetadata(string objectType, string exprType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const vector < string > & objects = extensionsLoaded[i]->GetExtensionObjectsTypes();
        if ( find(objects.begin(), objects.end(), objectType) != objects.end())
        {
            const std::map<string, gd::StrExpressionMetadata> & allObjectStrExpressions = extensionsLoaded[i]->GetAllStrExpressionsForObject(objectType);
            if ( allObjectStrExpressions.find(exprType) != allObjectStrExpressions.end() )
                return allObjectStrExpressions.find(exprType)->second;
        }
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, gd::StrExpressionMetadata> & allObjectStrExpressions = extensionsLoaded[i]->GetAllStrExpressionsForObject("");
        if ( allObjectStrExpressions.find(exprType) != allObjectStrExpressions.end() )
            return allObjectStrExpressions.find(exprType)->second;
    }

    return badStrExpressionMetadata;
}

const gd::StrExpressionMetadata & ExtensionsManager::GetAutomatismStrExpressionMetadata(string autoType, string exprType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const vector < string > & autos = extensionsLoaded[i]->GetAutomatismsTypes();
        if ( find(autos.begin(), autos.end(), autoType) != autos.end())
        {
            const std::map<string, gd::StrExpressionMetadata> & allAutomatismStrExpressions = extensionsLoaded[i]->GetAllStrExpressionsForAutomatism(autoType);
            if ( allAutomatismStrExpressions.find(exprType) != allAutomatismStrExpressions.end() )
                return allAutomatismStrExpressions.find(exprType)->second;
        }
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, gd::StrExpressionMetadata> & allAutomatismStrExpressions = extensionsLoaded[i]->GetAllStrExpressionsForAutomatism("");
        if ( allAutomatismStrExpressions.find(exprType) != allAutomatismStrExpressions.end() )
            return allAutomatismStrExpressions.find(exprType)->second;
    }

    return badStrExpressionMetadata;
}

const gd::StrExpressionMetadata & ExtensionsManager::GetStrExpressionMetadata(string exprType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, gd::StrExpressionMetadata> & allExpr = extensionsLoaded[i]->GetAllStrExpressions();
        if ( allExpr.find(exprType) != allExpr.end() )
            return allExpr.find(exprType)->second;
    }

    return badStrExpressionMetadata;
}

bool ExtensionsManager::HasAction(string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & actions = extensionsLoaded[i]->GetAllActions();
        if ( actions.find(name) != actions.end() )
            return true;
    }

    return false;
}

bool ExtensionsManager::HasObjectAction(std::string objectType, string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & actions = extensionsLoaded[i]->GetAllActionsForObject(objectType);
        if ( actions.find(name) != actions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & actions = extensionsLoaded[i]->GetAllActionsForObject("");
        if ( actions.find(name) != actions.end() )
            return true;
    }

    return false;
}

bool ExtensionsManager::HasAutomatismAction(std::string automatismType, string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & actions = extensionsLoaded[i]->GetAllActionsForAutomatism(automatismType);
        if ( actions.find(name) != actions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & actions = extensionsLoaded[i]->GetAllActionsForAutomatism("");
        if ( actions.find(name) != actions.end() )
            return true;
    }

    return false;
}


bool ExtensionsManager::HasCondition(string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & conditions = extensionsLoaded[i]->GetAllConditions();
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    return false;
}

bool ExtensionsManager::HasObjectCondition(std::string objectType, string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & conditions = extensionsLoaded[i]->GetAllConditionsForObject(objectType);
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & conditions = extensionsLoaded[i]->GetAllConditionsForObject("");
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    return false;
}

bool ExtensionsManager::HasAutomatismCondition(std::string automatismType, string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & conditions = extensionsLoaded[i]->GetAllConditionsForAutomatism(automatismType);
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & conditions = extensionsLoaded[i]->GetAllConditionsForAutomatism("");
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    return false;
}

bool ExtensionsManager::HasExpression(string name) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::ExpressionMetadata > & expressions = extensionsLoaded[i]->GetAllExpressions();
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

bool ExtensionsManager::HasObjectExpression(std::string objectType, string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::ExpressionMetadata > & expressions = extensionsLoaded[i]->GetAllExpressionsForObject(objectType);
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::ExpressionMetadata > & expressions = extensionsLoaded[i]->GetAllExpressionsForObject("");
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

bool ExtensionsManager::HasAutomatismExpression(std::string automatismType, string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::ExpressionMetadata > & expressions = extensionsLoaded[i]->GetAllExpressionsForAutomatism(automatismType);
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::ExpressionMetadata > & expressions = extensionsLoaded[i]->GetAllExpressionsForAutomatism("");
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}


bool ExtensionsManager::HasStrExpression(string name) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::StrExpressionMetadata > & expressions = extensionsLoaded[i]->GetAllStrExpressions();
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

bool ExtensionsManager::HasObjectStrExpression(std::string objectType, string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::StrExpressionMetadata > & expressions = extensionsLoaded[i]->GetAllStrExpressionsForObject(objectType);
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::StrExpressionMetadata > & expressions = extensionsLoaded[i]->GetAllStrExpressionsForObject("");
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

bool ExtensionsManager::HasAutomatismStrExpression(std::string automatismType, string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::StrExpressionMetadata > & expressions = extensionsLoaded[i]->GetAllStrExpressionsForAutomatism(automatismType);
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<std::string, gd::StrExpressionMetadata > & expressions = extensionsLoaded[i]->GetAllStrExpressionsForAutomatism("");
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

/**
 * Get information about an object
 */
const ExtensionObjectInfos & ExtensionsManager::GetObjectMetadata(std::string objectType)
{
	for (unsigned int i = 0;i<extensionsLoaded.size();++i)
	{
	    vector<string> objectsTypes = extensionsLoaded[i]->GetExtensionObjectsTypes();
	    for(unsigned int j = 0;j<objectsTypes.size();++j)
	    {
	        if ( objectsTypes[j] == objectType )
                return extensionsLoaded[i]->GetObjectMetadata(objectType);
	    }
	}

	return badObjectInfo;
}
#endif

