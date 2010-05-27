/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
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

#ifdef GDE
#include "GDL/Game.h"
#include "GDL/MainEditorCommand.h"
#endif


namespace gdp
{

ExtensionsManager *ExtensionsManager::_singleton = NULL;
InstructionInfos ExtensionsManager::badInstructionInfos;
ExpressionInfos ExtensionsManager::badExpressionInfos;
StrExpressionInfos ExtensionsManager::badStrExpressionInfos;

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
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetActionFunctionPtr(name) != NULL )
            return true;
    }

    return false;
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
    //Need to find the name of the type associated with the typeId as
    //extensions are not aware of the typeId of the objects they provide.
    string objectType;
    if ( extObjectNameToTypeId.right.find(objectTypeId) != extObjectNameToTypeId.right.end() )
        objectType = extObjectNameToTypeId.right.find(objectTypeId)->second;

    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetObjectActionFunctionPtr(objectType, name) != NULL )
            return true;

        //All objects inherits from base object.
        if ( extensionsLoaded[i]->GetObjectActionFunctionPtr("", name) != NULL )
            return true;
    }

    return false;
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


bool ExtensionsManager::HasCondition(string name) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetConditionFunctionPtr(name) != NULL )
            return true;
    }

    return false;
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
    //Need to find the name of the type associated with the typeId as
    //extensions are not aware of the typeId of the objects they provide.
    string objectType;
    if ( extObjectNameToTypeId.right.find(objectTypeId) != extObjectNameToTypeId.right.end() )
        objectType = extObjectNameToTypeId.right.find(objectTypeId)->second;

    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetObjectConditionFunctionPtr(objectType, name) != NULL )
            return true;

        //All objects inherits from base object
        if ( extensionsLoaded[i]->GetObjectConditionFunctionPtr("", name) != NULL )
            return true;
    }

    return false;
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

bool ExtensionsManager::HasExpression(string name) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetExpressionFunctionPtr(name) != NULL )
            return true;
    }

    return false;
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
    //Need to find the name of the type associated with the typeId as
    //extensions are not aware of the typeId of the objects they provide.
    string objectType;
    if ( extObjectNameToTypeId.right.find(objectTypeId) != extObjectNameToTypeId.right.end() )
        objectType = extObjectNameToTypeId.right.find(objectTypeId)->second;

    //First check in extensions that really define the object
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetObjectExpressionFunctionPtr(objectType, name) != NULL )
            return true;

        //All objects inherit from base object
        if ( extensionsLoaded[i]->GetObjectExpressionFunctionPtr("", name) != NULL )
            return true;
    }

    return false;
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


bool ExtensionsManager::HasStrExpression(string name) const
{
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetStrExpressionFunctionPtr(name) != NULL )
            return true;
    }

    return false;
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
    //Need to find the name of the type associated with the typeId as
    //extensions are not aware of the typeId of the objects they provide.
    string objectType;
    if ( extObjectNameToTypeId.right.find(objectTypeId) != extObjectNameToTypeId.right.end() )
        objectType = extObjectNameToTypeId.right.find(objectTypeId)->second;

    //First check in extensions that really define the object
    for (unsigned int i =0;i<extensionsLoaded.size();++i)
    {
        if ( extensionsLoaded[i]->GetObjectStrExpressionFunctionPtr(objectType, name) != NULL )
            return true;

        //All objects inherit from base object
        if ( extensionsLoaded[i]->GetObjectStrExpressionFunctionPtr("", name) != NULL )
            return true;
    }

    return false;
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
