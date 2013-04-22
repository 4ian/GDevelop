/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDcore/IDE/MetadataProvider.h"
#include "GDcore/PlatformDefinition/Platform.h"
#include "GDcore/PlatformDefinition/PlatformExtension.h"
#include "GDcore/Events/InstructionMetadata.h"
#include "GDcore/Events/AutomatismMetadata.h"
#include "GDcore/Events/ObjectMetadata.h"
#include <string>

using namespace std;

namespace gd
{

gd::AutomatismMetadata MetadataProvider::badAutomatismInfo;
gd::ObjectMetadata MetadataProvider::badObjectInfo;
gd::InstructionMetadata MetadataProvider::badInstructionMetadata;
gd::ExpressionMetadata MetadataProvider::badExpressionMetadata;
gd::StrExpressionMetadata MetadataProvider::badStrExpressionMetadata;


/**
 * Get the metadata about an automatism in a platform
 */
const AutomatismMetadata & MetadataProvider::GetAutomatismMetadata(const gd::Platform & platform, std::string automatismType)
{
	for (unsigned int i = 0;i<platform.GetAllPlatformExtensions().size();++i)
	{
	    vector<string> autosTypes = platform.GetAllPlatformExtensions()[i]->GetAutomatismsTypes();
	    for(unsigned int j = 0;j<autosTypes.size();++j)
	    {
	        if ( autosTypes[j] == automatismType )
                return platform.GetAllPlatformExtensions()[i]->GetAutomatismMetadata(automatismType);
	    }
	}

	return badAutomatismInfo;
}

/**
 * Get the metadata about an object in a platform
 */
const ObjectMetadata & MetadataProvider::GetObjectMetadata(const gd::Platform & platform, std::string objectType)
{
	for (unsigned int i = 0;i<platform.GetAllPlatformExtensions().size();++i)
	{
	    vector<string> objectsTypes = platform.GetAllPlatformExtensions()[i]->GetExtensionObjectsTypes();
	    for(unsigned int j = 0;j<objectsTypes.size();++j)
	    {
	        if ( objectsTypes[j] == objectType )
                return platform.GetAllPlatformExtensions()[i]->GetObjectMetadata(objectType);
	    }
	}

	return badObjectInfo;
}

const gd::InstructionMetadata & MetadataProvider::GetActionMetadata(const gd::Platform & platform, string actionType)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<string, gd::InstructionMetadata> & allActions = extensions[i]->GetAllActions();
        if ( allActions.find(actionType) != allActions.end() )
            return allActions.find(actionType)->second;

        const vector < string > & objects = extensions[i]->GetExtensionObjectsTypes();
        for (unsigned int j = 0;j<objects.size();++j)
        {
            const std::map<string, gd::InstructionMetadata> & allObjectsActions = extensions[i]->GetAllActionsForObject(objects[j]);
            if ( allObjectsActions.find(actionType) != allObjectsActions.end() )
                return allObjectsActions.find(actionType)->second;
        }

        const vector < string > & autos = extensions[i]->GetAutomatismsTypes();
        for (unsigned int j = 0;j<autos.size();++j)
        {
            const std::map<string, gd::InstructionMetadata> & allAutosActions = extensions[i]->GetAllActionsForAutomatism(autos[j]);
            if ( allAutosActions.find(actionType) != allAutosActions.end() )
                return allAutosActions.find(actionType)->second;
        }
    }

    return badInstructionMetadata;
}

const gd::InstructionMetadata & MetadataProvider::GetConditionMetadata(const gd::Platform & platform, string conditionType)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<string, gd::InstructionMetadata> & allConditions = extensions[i]->GetAllConditions();
        if ( allConditions.find(conditionType) != allConditions.end() )
            return allConditions.find(conditionType)->second;

        const vector < string > & objects = extensions[i]->GetExtensionObjectsTypes();
        for (unsigned int j = 0;j<objects.size();++j)
        {
            const std::map<string, gd::InstructionMetadata> & allObjetsConditions = extensions[i]->GetAllConditionsForObject(objects[j]);
            if ( allObjetsConditions.find(conditionType) != allObjetsConditions.end() )
                return allObjetsConditions.find(conditionType)->second;
        }

        const vector < string > & autos = extensions[i]->GetAutomatismsTypes();
        for (unsigned int j = 0;j<autos.size();++j)
        {
            const std::map<string, gd::InstructionMetadata> & allAutosConditions = extensions[i]->GetAllConditionsForAutomatism(autos[j]);
            if ( allAutosConditions.find(conditionType) != allAutosConditions.end() )
                return allAutosConditions.find(conditionType)->second;
        }
    }

    return badInstructionMetadata;
}

const gd::ExpressionMetadata & MetadataProvider::GetObjectExpressionMetadata(const gd::Platform & platform, string objectType, string exprType)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const vector < string > & objects = extensions[i]->GetExtensionObjectsTypes();
        if ( find(objects.begin(), objects.end(), objectType) != objects.end())
        {
            const std::map<string, gd::ExpressionMetadata> & allObjectExpressions = extensions[i]->GetAllExpressionsForObject(objectType);
            if ( allObjectExpressions.find(exprType) != allObjectExpressions.end() )
                return allObjectExpressions.find(exprType)->second;
        }
    }

    //Then check base
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<string, gd::ExpressionMetadata> & allObjectExpressions = extensions[i]->GetAllExpressionsForObject("");
        if ( allObjectExpressions.find(exprType) != allObjectExpressions.end() )
            return allObjectExpressions.find(exprType)->second;
    }

    return badExpressionMetadata;
}

const gd::ExpressionMetadata & MetadataProvider::GetAutomatismExpressionMetadata(const gd::Platform & platform, string autoType, string exprType)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const vector < string > & autos = extensions[i]->GetAutomatismsTypes();
        if ( find(autos.begin(), autos.end(), autoType) != autos.end())
        {
            const std::map<string, gd::ExpressionMetadata> & allAutoExpressions = extensions[i]->GetAllExpressionsForAutomatism(autoType);
            if ( allAutoExpressions.find(exprType) != allAutoExpressions.end() )
                return allAutoExpressions.find(exprType)->second;
        }
    }

    //Then check base
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<string, gd::ExpressionMetadata> & allAutoExpressions = extensions[i]->GetAllExpressionsForAutomatism("");
        if ( allAutoExpressions.find(exprType) != allAutoExpressions.end() )
            return allAutoExpressions.find(exprType)->second;
    }

    return badExpressionMetadata;
}

const gd::ExpressionMetadata & MetadataProvider::GetExpressionMetadata(const gd::Platform & platform, string exprType)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<string, gd::ExpressionMetadata> & allExpr = extensions[i]->GetAllExpressions();
        if ( allExpr.find(exprType) != allExpr.end() )
            return allExpr.find(exprType)->second;
    }

    return badExpressionMetadata;
}

const gd::StrExpressionMetadata & MetadataProvider::GetObjectStrExpressionMetadata(const gd::Platform & platform, string objectType, string exprType)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const vector < string > & objects = extensions[i]->GetExtensionObjectsTypes();
        if ( find(objects.begin(), objects.end(), objectType) != objects.end())
        {
            const std::map<string, gd::StrExpressionMetadata> & allObjectStrExpressions = extensions[i]->GetAllStrExpressionsForObject(objectType);
            if ( allObjectStrExpressions.find(exprType) != allObjectStrExpressions.end() )
                return allObjectStrExpressions.find(exprType)->second;
        }
    }

    //Then check bases
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<string, gd::StrExpressionMetadata> & allObjectStrExpressions = extensions[i]->GetAllStrExpressionsForObject("");
        if ( allObjectStrExpressions.find(exprType) != allObjectStrExpressions.end() )
            return allObjectStrExpressions.find(exprType)->second;
    }

    return badStrExpressionMetadata;
}

const gd::StrExpressionMetadata & MetadataProvider::GetAutomatismStrExpressionMetadata(const gd::Platform & platform, string autoType, string exprType)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const vector < string > & autos = extensions[i]->GetAutomatismsTypes();
        if ( find(autos.begin(), autos.end(), autoType) != autos.end())
        {
            const std::map<string, gd::StrExpressionMetadata> & allAutomatismStrExpressions = extensions[i]->GetAllStrExpressionsForAutomatism(autoType);
            if ( allAutomatismStrExpressions.find(exprType) != allAutomatismStrExpressions.end() )
                return allAutomatismStrExpressions.find(exprType)->second;
        }
    }

    //Then check bases
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<string, gd::StrExpressionMetadata> & allAutomatismStrExpressions = extensions[i]->GetAllStrExpressionsForAutomatism("");
        if ( allAutomatismStrExpressions.find(exprType) != allAutomatismStrExpressions.end() )
            return allAutomatismStrExpressions.find(exprType)->second;
    }

    return badStrExpressionMetadata;
}

const gd::StrExpressionMetadata & MetadataProvider::GetStrExpressionMetadata(const gd::Platform & platform, string exprType)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<string, gd::StrExpressionMetadata> & allExpr = extensions[i]->GetAllStrExpressions();
        if ( allExpr.find(exprType) != allExpr.end() )
            return allExpr.find(exprType)->second;
    }

    return badStrExpressionMetadata;
}

bool MetadataProvider::HasAction(const gd::Platform & platform, std::string name)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();

    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & actions = extensions[i]->GetAllActions();
        if ( actions.find(name) != actions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasObjectAction(const gd::Platform & platform, std::string objectType, string name)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & actions = extensions[i]->GetAllActionsForObject(objectType);
        if ( actions.find(name) != actions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & actions = extensions[i]->GetAllActionsForObject("");
        if ( actions.find(name) != actions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasAutomatismAction(const gd::Platform & platform, std::string automatismType, string name)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & actions = extensions[i]->GetAllActionsForAutomatism(automatismType);
        if ( actions.find(name) != actions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & actions = extensions[i]->GetAllActionsForAutomatism("");
        if ( actions.find(name) != actions.end() )
            return true;
    }

    return false;
}


bool MetadataProvider::HasCondition(const gd::Platform & platform, std::string name)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & conditions = extensions[i]->GetAllConditions();
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasObjectCondition(const gd::Platform & platform, std::string objectType, string name)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & conditions = extensions[i]->GetAllConditionsForObject(objectType);
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & conditions = extensions[i]->GetAllConditionsForObject("");
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasAutomatismCondition(const gd::Platform & platform, std::string automatismType, string name)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & conditions = extensions[i]->GetAllConditionsForAutomatism(automatismType);
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::InstructionMetadata > & conditions = extensions[i]->GetAllConditionsForAutomatism("");
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasExpression(const gd::Platform & platform, std::string name)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllExpressions();
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasObjectExpression(const gd::Platform & platform, std::string objectType, string name)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllExpressionsForObject(objectType);
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllExpressionsForObject("");
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasAutomatismExpression(const gd::Platform & platform, std::string automatismType, string name)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllExpressionsForAutomatism(automatismType);
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllExpressionsForAutomatism("");
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}


bool MetadataProvider::HasStrExpression(const gd::Platform & platform, std::string name)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::StrExpressionMetadata > & expressions = extensions[i]->GetAllStrExpressions();
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasObjectStrExpression(const gd::Platform & platform, std::string objectType, string name)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::StrExpressionMetadata > & expressions = extensions[i]->GetAllStrExpressionsForObject(objectType);
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::StrExpressionMetadata > & expressions = extensions[i]->GetAllStrExpressionsForObject("");
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasAutomatismStrExpression(const gd::Platform & platform, std::string automatismType, string name)
{
    std::vector < boost::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::StrExpressionMetadata > & expressions = extensions[i]->GetAllStrExpressionsForAutomatism(automatismType);
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    //Then check bases
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<std::string, gd::StrExpressionMetadata > & expressions = extensions[i]->GetAllStrExpressionsForAutomatism("");
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

}
