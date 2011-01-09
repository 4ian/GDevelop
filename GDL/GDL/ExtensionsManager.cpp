/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <map>
#include <string>

#include "GDL/ExtensionsManager.h"
#include "GDL/BaseObjectExtension.h"
#include "GDL/AudioExtension.h"
#include "GDL/MouseExtension.h"
#include "GDL/KeyboardExtension.h"
#include "GDL/JoystickExtension.h"
#include "GDL/TimeExtension.h"
#include "GDL/FileExtension.h"
#include "GDL/VariablesExtension.h"
#include "GDL/CameraExtension.h"
#include "GDL/WindowExtension.h"
#include "GDL/NetworkExtension.h"
#include "GDL/SpriteExtension.h"
#include "GDL/SceneExtension.h"
#include "GDL/AdvancedExtension.h"
#include "GDL/CommonInstructionsExtension.h"
#include "GDL/CommonConversionsExtension.h"
#include "GDL/StringInstructionsExtension.h"
#include "GDL/Object.h"

#if defined(GD_IDE_ONLY)
#include "GDL/Game.h"
#include "GDL/MainEditorCommand.h"
#endif


namespace GDpriv
{

ExtensionsManager *ExtensionsManager::_singleton = NULL;
InstructionInfos ExtensionsManager::badInstructionInfos;
ExpressionInfos ExtensionsManager::badExpressionInfos;
StrExpressionInfos ExtensionsManager::badStrExpressionInfos;
AutomatismInfo ExtensionsManager::badAutomatismInfo;

/**
 * Initializing Extension Manager
 */
ExtensionsManager::ExtensionsManager()
{
    //Load all extensions
    AddExtension(boost::shared_ptr<ExtensionBase>(new BaseObjectExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new CommonInstructionsExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new CommonConversionsExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new StringInstructionsExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new ExtensionSprite()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new VariablesExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new TimeExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new AudioExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new MouseExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new KeyboardExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new JoystickExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new CameraExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new WindowExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new FileExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new NetworkExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new SceneExtension()));
    AddExtension(boost::shared_ptr<ExtensionBase>(new AdvancedExtension()));

#if defined(GD_IDE_ONLY)
    badInstructionInfos.fullname = _("Instruction inconnue");
    badInstructionInfos.description = _("Instruction inconnue");
    badInstructionInfos.sentence = _("Instruction inconnue");
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
        //Adding object type
        unsigned int lastId = extObjectNameToTypeId.size(); //Needed for using correct size value
        extObjectNameToTypeId.insert( StringToTypeIdBiMap::value_type(objectsTypes[i], lastId) );

        //Adding creations and destruction functions
        creationFunctionTable.push_back( extension->GetObjectCreationFunctionPtr(objectsTypes[i]) );
        destroyFunctionTable.push_back( extension->GetDestroyObjectFunction(objectsTypes[i]) );
    }

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

bool ExtensionsManager::HasEventType(std::string eventType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->CreateEvent(eventType) != boost::shared_ptr<BaseEvent>() )
            return true;
    }

    return false;
}

boost::shared_ptr<BaseEvent> ExtensionsManager::CreateEvent(std::string eventType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        boost::shared_ptr<BaseEvent> event = extensionsLoaded[i]->CreateEvent(eventType);
        if ( event != boost::shared_ptr<BaseEvent>() )
            return event;
    }

    return boost::shared_ptr<BaseEvent>();
}

bool ExtensionsManager::HasAutomatism(std::string automatismType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->CreateAutomatism(automatismType) != boost::shared_ptr<Automatism>() )
            return true;
    }

    return false;
}

boost::shared_ptr<Automatism> ExtensionsManager::CreateAutomatism(std::string automatismType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        boost::shared_ptr<Automatism> automatism = extensionsLoaded[i]->CreateAutomatism(automatismType);
        if ( automatism != boost::shared_ptr<Automatism>() )
            return automatism;
    }

    return boost::shared_ptr<Automatism>();
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

const AutomatismInfo& ExtensionsManager::GetAutomatismInfo(std::string automatism) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        vector < string > automatismsTypes = extensionsLoaded[i]->GetAutomatismsTypes();
        if ( find(automatismsTypes.begin(), automatismsTypes.end(), automatism) != automatismsTypes.end())
            return extensionsLoaded[i]->GetAutomatismInfo(automatism);
    }

    return badAutomatismInfo;
}

const InstructionInfos & ExtensionsManager::GetActionInfos(string actionType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, InstructionInfos> & allActions = extensionsLoaded[i]->GetAllActions();
        if ( allActions.find(actionType) != allActions.end() )
            return allActions.find(actionType)->second;

        const vector < string > & objects = extensionsLoaded[i]->GetExtensionObjectsTypes();
        for (unsigned int j = 0;j<objects.size();++j)
        {
            const std::map<string, InstructionInfos> & allObjectsActions = extensionsLoaded[i]->GetAllActionsForObject(objects[j]);
            if ( allObjectsActions.find(actionType) != allObjectsActions.end() )
                return allObjectsActions.find(actionType)->second;
        }

        const vector < string > & autos = extensionsLoaded[i]->GetAutomatismsTypes();
        for (unsigned int j = 0;j<autos.size();++j)
        {
            const std::map<string, InstructionInfos> & allAutosActions = extensionsLoaded[i]->GetAllActionsForAutomatism(autos[j]);
            if ( allAutosActions.find(actionType) != allAutosActions.end() )
                return allAutosActions.find(actionType)->second;
        }
    }

    return badInstructionInfos;
}

const InstructionInfos & ExtensionsManager::GetConditionInfos(string conditionType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, InstructionInfos> & allConditions = extensionsLoaded[i]->GetAllConditions();
        if ( allConditions.find(conditionType) != allConditions.end() )
            return allConditions.find(conditionType)->second;

        const vector < string > & objects = extensionsLoaded[i]->GetExtensionObjectsTypes();
        for (unsigned int j = 0;j<objects.size();++j)
        {
            const std::map<string, InstructionInfos> & allObjetsConditions = extensionsLoaded[i]->GetAllConditionsForObject(objects[j]);
            if ( allObjetsConditions.find(conditionType) != allObjetsConditions.end() )
                return allObjetsConditions.find(conditionType)->second;
        }

        const vector < string > & autos = extensionsLoaded[i]->GetAutomatismsTypes();
        for (unsigned int j = 0;j<autos.size();++j)
        {
            const std::map<string, InstructionInfos> & allAutosConditions = extensionsLoaded[i]->GetAllConditionsForAutomatism(autos[j]);
            if ( allAutosConditions.find(conditionType) != allAutosConditions.end() )
                return allAutosConditions.find(conditionType)->second;
        }
    }

    return badInstructionInfos;
}

const ExpressionInfos & ExtensionsManager::GetObjectExpressionInfos(string objectType, string exprType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const vector < string > & objects = extensionsLoaded[i]->GetExtensionObjectsTypes();
        if ( find(objects.begin(), objects.end(), objectType) != objects.end())
        {
            const std::map<string, ExpressionInfos> & allObjectExpressions = extensionsLoaded[i]->GetAllExpressionsForObject(objectType);
            if ( allObjectExpressions.find(exprType) != allObjectExpressions.end() )
                return allObjectExpressions.find(exprType)->second;
        }
    }

    //Then check base
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, ExpressionInfos> & allObjectExpressions = extensionsLoaded[i]->GetAllExpressionsForObject("");
        if ( allObjectExpressions.find(exprType) != allObjectExpressions.end() )
            return allObjectExpressions.find(exprType)->second;
    }

    return badExpressionInfos;
}

const ExpressionInfos & ExtensionsManager::GetAutomatismExpressionInfos(string autoType, string exprType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const vector < string > & autos = extensionsLoaded[i]->GetAutomatismsTypes();
        if ( find(autos.begin(), autos.end(), autoType) != autos.end())
        {
            const std::map<string, ExpressionInfos> & allAutoExpressions = extensionsLoaded[i]->GetAllExpressionsForAutomatism(autoType);
            if ( allAutoExpressions.find(exprType) != allAutoExpressions.end() )
                return allAutoExpressions.find(exprType)->second;
        }
    }

    //Then check base
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, ExpressionInfos> & allAutoExpressions = extensionsLoaded[i]->GetAllExpressionsForAutomatism("");
        if ( allAutoExpressions.find(exprType) != allAutoExpressions.end() )
            return allAutoExpressions.find(exprType)->second;
    }

    return badExpressionInfos;
}

const ExpressionInfos & ExtensionsManager::GetExpressionInfos(string exprType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, ExpressionInfos> & allExpr = extensionsLoaded[i]->GetAllExpressions();
        if ( allExpr.find(exprType) != allExpr.end() )
            return allExpr.find(exprType)->second;
    }

    return badExpressionInfos;
}

const StrExpressionInfos & ExtensionsManager::GetObjectStrExpressionInfos(string objectType, string exprType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const vector < string > & objects = extensionsLoaded[i]->GetExtensionObjectsTypes();
        if ( find(objects.begin(), objects.end(), objectType) != objects.end())
        {
            const std::map<string, StrExpressionInfos> & allObjectStrExpressions = extensionsLoaded[i]->GetAllStrExpressionsForObject(objectType);
            if ( allObjectStrExpressions.find(exprType) != allObjectStrExpressions.end() )
                return allObjectStrExpressions.find(exprType)->second;
        }
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, StrExpressionInfos> & allObjectStrExpressions = extensionsLoaded[i]->GetAllStrExpressionsForObject("");
        if ( allObjectStrExpressions.find(exprType) != allObjectStrExpressions.end() )
            return allObjectStrExpressions.find(exprType)->second;
    }

    return badStrExpressionInfos;
}

const StrExpressionInfos & ExtensionsManager::GetAutomatismStrExpressionInfos(string autoType, string exprType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const vector < string > & autos = extensionsLoaded[i]->GetAutomatismsTypes();
        if ( find(autos.begin(), autos.end(), autoType) != autos.end())
        {
            const std::map<string, StrExpressionInfos> & allAutomatismStrExpressions = extensionsLoaded[i]->GetAllStrExpressionsForAutomatism(autoType);
            if ( allAutomatismStrExpressions.find(exprType) != allAutomatismStrExpressions.end() )
                return allAutomatismStrExpressions.find(exprType)->second;
        }
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, StrExpressionInfos> & allAutomatismStrExpressions = extensionsLoaded[i]->GetAllStrExpressionsForAutomatism("");
        if ( allAutomatismStrExpressions.find(exprType) != allAutomatismStrExpressions.end() )
            return allAutomatismStrExpressions.find(exprType)->second;
    }

    return badStrExpressionInfos;
}

const StrExpressionInfos & ExtensionsManager::GetStrExpressionInfos(string exprType) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        const std::map<string, StrExpressionInfos> & allExpr = extensionsLoaded[i]->GetAllStrExpressions();
        if ( allExpr.find(exprType) != allExpr.end() )
            return allExpr.find(exprType)->second;
    }

    return badStrExpressionInfos;
}

bool ExtensionsManager::HasAction(string name) const
{
    return (GetActionFunctionPtr(name) != NULL);
}

InstructionFunPtr ExtensionsManager::GetActionFunctionPtr(string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetActionFunctionPtr(name) != NULL )
            return extensionsLoaded[i]->GetActionFunctionPtr(name);
    }

    return NULL;
}


bool ExtensionsManager::HasObjectAction(unsigned int objectTypeId, string name) const
{
    return (GetObjectActionFunctionPtr(objectTypeId, name) != NULL);
}

InstructionObjectFunPtr ExtensionsManager::GetObjectActionFunctionPtr(unsigned int objectTypeId, string name) const
{
    //Need to find the name of the type associated with the typeId as
    //extensions are not aware of the typeId of the objects they provide.
    string objectType;
    if ( extObjectNameToTypeId.right.find(objectTypeId) != extObjectNameToTypeId.right.end() )
        objectType = extObjectNameToTypeId.right.find(objectTypeId)->second;

    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetObjectActionFunctionPtr(objectType, name) != NULL )
            return extensionsLoaded[i]->GetObjectActionFunctionPtr(objectType, name);
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        //All objects inherits from base object.
        if ( extensionsLoaded[i]->GetObjectActionFunctionPtr("", name) != NULL )
            return extensionsLoaded[i]->GetObjectActionFunctionPtr("", name);
    }

    return NULL;
}

bool ExtensionsManager::HasAutomatismAction(unsigned int automatismTypeId, string name) const
{
    return (GetAutomatismActionFunctionPtr(automatismTypeId, name) != NULL);
}

InstructionAutomatismFunPtr ExtensionsManager::GetAutomatismActionFunctionPtr(unsigned int automatismTypeId, string name) const
{
    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
    std::string automatismType = objectIdentifiersManager->GetNamefromOID(automatismTypeId);

    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetAutomatismActionFunctionPtr(automatismType, name) != NULL )
            return extensionsLoaded[i]->GetAutomatismActionFunctionPtr(automatismType, name);
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        //All automatisms inherits from base automatism.
        if ( extensionsLoaded[i]->GetAutomatismActionFunctionPtr("", name) != NULL )
            return extensionsLoaded[i]->GetAutomatismActionFunctionPtr("", name);
    }

    return NULL;
}

bool ExtensionsManager::HasCondition(string name) const
{
    return (GetConditionFunctionPtr(name) != NULL);
}

InstructionFunPtr ExtensionsManager::GetConditionFunctionPtr(string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetConditionFunctionPtr(name) != NULL )
            return extensionsLoaded[i]->GetConditionFunctionPtr(name);
    }

    return NULL;
}


bool ExtensionsManager::HasObjectCondition(unsigned int objectTypeId, string name) const
{
    return (GetObjectConditionFunctionPtr(objectTypeId, name) != NULL);
}

InstructionObjectFunPtr ExtensionsManager::GetObjectConditionFunctionPtr(unsigned int objectTypeId, string name) const
{
    //Need to find the name of the type associated with the typeId as
    //extensions are not aware of the typeId of the objects they provide.
    string objectType;
    if ( extObjectNameToTypeId.right.find(objectTypeId) != extObjectNameToTypeId.right.end() )
        objectType = extObjectNameToTypeId.right.find(objectTypeId)->second;

    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetObjectConditionFunctionPtr(objectType, name) != NULL )
            return extensionsLoaded[i]->GetObjectConditionFunctionPtr(objectType, name);
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        //All objects inherits from base object
        if ( extensionsLoaded[i]->GetObjectConditionFunctionPtr("", name) != NULL )
            return extensionsLoaded[i]->GetObjectConditionFunctionPtr("", name);
    }

    return NULL;
}

bool ExtensionsManager::HasAutomatismCondition(unsigned int automatismTypeId, string name) const
{
    return (GetAutomatismConditionFunctionPtr(automatismTypeId, name) != NULL);
}

InstructionAutomatismFunPtr ExtensionsManager::GetAutomatismConditionFunctionPtr(unsigned int automatismTypeId, string name) const
{
    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
    std::string automatismType = objectIdentifiersManager->GetNamefromOID(automatismTypeId);

    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetAutomatismConditionFunctionPtr(automatismType, name) != NULL )
            return extensionsLoaded[i]->GetAutomatismConditionFunctionPtr(automatismType, name);
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        //All automatisms inherits from base automatism
        if ( extensionsLoaded[i]->GetAutomatismConditionFunctionPtr("", name) != NULL )
            return extensionsLoaded[i]->GetAutomatismConditionFunctionPtr("", name);
    }

    return NULL;
}

bool ExtensionsManager::HasExpression(string name) const
{
    return (GetExpressionFunctionPtr(name) != NULL);
}

ExpressionFunPtr ExtensionsManager::GetExpressionFunctionPtr(string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetExpressionFunctionPtr(name) != NULL )
            return extensionsLoaded[i]->GetExpressionFunctionPtr(name);
    }

    return NULL;
}


bool ExtensionsManager::HasObjectExpression(unsigned int objectTypeId, string name) const
{
    return (GetObjectExpressionFunctionPtr(objectTypeId, name) != NULL);
}

ExpressionObjectFunPtr ExtensionsManager::GetObjectExpressionFunctionPtr(unsigned int objectTypeId, string name) const
{
    //Need to find the name of the type associated with the typeId as
    //extensions are not aware of the typeId of the objects they provide.
    string objectType;
    if ( extObjectNameToTypeId.right.find(objectTypeId) != extObjectNameToTypeId.right.end() )
        objectType = extObjectNameToTypeId.right.find(objectTypeId)->second;

    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to expressions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        //Check first extensions that really provide the object
        if ( extensionsLoaded[i]->GetObjectExpressionFunctionPtr(objectType, name) != NULL )
            return extensionsLoaded[i]->GetObjectExpressionFunctionPtr(objectType, name);
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        //All objects inherit from base object
        if ( extensionsLoaded[i]->GetObjectExpressionFunctionPtr("", name) != NULL )
            return extensionsLoaded[i]->GetObjectExpressionFunctionPtr("", name);
    }

    return NULL;
}

bool ExtensionsManager::HasAutomatismExpression(unsigned int automatismTypeId, string name) const
{
    return (GetAutomatismExpressionFunctionPtr(automatismTypeId, name) != NULL);
}

ExpressionAutomatismFunPtr ExtensionsManager::GetAutomatismExpressionFunctionPtr(unsigned int automatismTypeId, string name) const
{
    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
    std::string automatismType = objectIdentifiersManager->GetNamefromOID(automatismTypeId);

    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to expressions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        //Check first extensions that really provide the automatism
        if ( extensionsLoaded[i]->GetAutomatismExpressionFunctionPtr(automatismType, name) != NULL )
            return extensionsLoaded[i]->GetAutomatismExpressionFunctionPtr(automatismType, name);
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        //All automatisms inherit from base automatism
        if ( extensionsLoaded[i]->GetAutomatismExpressionFunctionPtr("", name) != NULL )
            return extensionsLoaded[i]->GetAutomatismExpressionFunctionPtr("", name);
    }

    return NULL;
}

bool ExtensionsManager::HasStrExpression(string name) const
{
    return (GetStrExpressionFunctionPtr(name) != NULL);
}

StrExpressionFunPtr ExtensionsManager::GetStrExpressionFunctionPtr(string name) const
{
    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to instructions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetStrExpressionFunctionPtr(name) != NULL )
            return extensionsLoaded[i]->GetStrExpressionFunctionPtr(name);
    }

    return NULL;
}

bool ExtensionsManager::HasObjectStrExpression(unsigned int objectTypeId, string name) const
{
    return (GetObjectStrExpressionFunctionPtr(objectTypeId, name) != NULL);
}

StrExpressionObjectFunPtr ExtensionsManager::GetObjectStrExpressionFunctionPtr(unsigned int objectTypeId, string name) const
{
    //Need to find the name of the type associated with the typeId as
    //extensions are not aware of the typeId of the objects they provide.
    string objectType;
    if ( extObjectNameToTypeId.right.find(objectTypeId) != extObjectNameToTypeId.right.end() )
        objectType = extObjectNameToTypeId.right.find(objectTypeId)->second;

    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to expressions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        //Check first extensions that really provide the object
        if ( extensionsLoaded[i]->GetObjectStrExpressionFunctionPtr(objectType, name) != NULL )
            return extensionsLoaded[i]->GetObjectStrExpressionFunctionPtr(objectType, name);
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        //All objects inherit from base object
        if ( extensionsLoaded[i]->GetObjectStrExpressionFunctionPtr("", name) != NULL )
            return extensionsLoaded[i]->GetObjectStrExpressionFunctionPtr("", name);
    }

    return NULL;
}

bool ExtensionsManager::HasAutomatismStrExpression(unsigned int automatismTypeId, string name) const
{
    return (GetAutomatismStrExpressionFunctionPtr(automatismTypeId, name) != NULL);
}

StrExpressionAutomatismFunPtr ExtensionsManager::GetAutomatismStrExpressionFunctionPtr(unsigned int automatismTypeId, string name) const
{
    ObjectIdentifiersManager * objectIdentifiersManager = ObjectIdentifiersManager::getInstance();
    std::string automatismType = objectIdentifiersManager->GetNamefromOID(automatismTypeId);

    //We can afford performing a search each time this function is called,
    //as the function ptr will be stocked in a map and attributed to expressions
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        //Check first extensions that really provide the automatism
        if ( extensionsLoaded[i]->GetAutomatismStrExpressionFunctionPtr(automatismType, name) != NULL )
            return extensionsLoaded[i]->GetAutomatismStrExpressionFunctionPtr(automatismType, name);
    }

    //Then check bases
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        //All automatisms inherit from base automatism
        if ( extensionsLoaded[i]->GetAutomatismStrExpressionFunctionPtr("", name) != NULL )
            return extensionsLoaded[i]->GetAutomatismStrExpressionFunctionPtr("", name);
    }

    return NULL;
}

boost::shared_ptr<Object> ExtensionsManager::CreateObject(unsigned int typeId, std::string name)
{
    if ( typeId >= creationFunctionTable.size() )
    {
        cout << "Tried to create an object with a bad typeId ( " << typeId << " )." << endl;
        typeId = 0;
    }

    //Create a new object with the type we want.
    Object * object = creationFunctionTable[typeId](name);
    object->SetTypeId(typeId);

    return boost::shared_ptr<Object> (object, destroyFunctionTable[typeId]);
}

}
