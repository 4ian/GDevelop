/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/IDE/MetadataProvider.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/AutomatismMetadata.h"
#include "GDCore/Events/ObjectMetadata.h"
#include <algorithm>
#include <GDCore/Utf8String.h>

using namespace std;

namespace gd
{

gd::AutomatismMetadata MetadataProvider::badAutomatismInfo;
gd::ObjectMetadata MetadataProvider::badObjectInfo;
gd::InstructionMetadata MetadataProvider::badInstructionMetadata;
gd::ExpressionMetadata MetadataProvider::badExpressionMetadata;
gd::ExpressionMetadata MetadataProvider::badStrExpressionMetadata;


/**
 * Get the metadata about an automatism in a platform
 */
const AutomatismMetadata & MetadataProvider::GetAutomatismMetadata(const gd::Platform & platform, gd::String automatismType)
{
	for (unsigned int i = 0;i<platform.GetAllPlatformExtensions().size();++i)
	{
	    std::vector<gd::String> autosTypes = platform.GetAllPlatformExtensions()[i]->GetAutomatismsTypes();
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
const ObjectMetadata & MetadataProvider::GetObjectMetadata(const gd::Platform & platform, gd::String objectType)
{
	for (unsigned int i = 0;i<platform.GetAllPlatformExtensions().size();++i)
	{
	    std::vector<gd::String> objectsTypes = platform.GetAllPlatformExtensions()[i]->GetExtensionObjectsTypes();
	    for(unsigned int j = 0;j<objectsTypes.size();++j)
	    {
	        if ( objectsTypes[j] == objectType )
                return platform.GetAllPlatformExtensions()[i]->GetObjectMetadata(objectType);
	    }
	}

	return badObjectInfo;
}

const gd::InstructionMetadata & MetadataProvider::GetActionMetadata(const gd::Platform & platform, gd::String actionType)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::InstructionMetadata> & allActions = extensions[i]->GetAllActions();
        if ( allActions.find(actionType) != allActions.end() )
            return allActions.find(actionType)->second;

        const vector < gd::String > & objects = extensions[i]->GetExtensionObjectsTypes();
        for (unsigned int j = 0;j<objects.size();++j)
        {
            const std::map<gd::String, gd::InstructionMetadata> & allObjectsActions = extensions[i]->GetAllActionsForObject(objects[j]);
            if ( allObjectsActions.find(actionType) != allObjectsActions.end() )
                return allObjectsActions.find(actionType)->second;
        }

        const vector < gd::String > & autos = extensions[i]->GetAutomatismsTypes();
        for (unsigned int j = 0;j<autos.size();++j)
        {
            const std::map<gd::String, gd::InstructionMetadata> & allAutosActions = extensions[i]->GetAllActionsForAutomatism(autos[j]);
            if ( allAutosActions.find(actionType) != allAutosActions.end() )
                return allAutosActions.find(actionType)->second;
        }
    }

    return badInstructionMetadata;
}

const gd::InstructionMetadata & MetadataProvider::GetConditionMetadata(const gd::Platform & platform, gd::String conditionType)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::InstructionMetadata> & allConditions = extensions[i]->GetAllConditions();
        if ( allConditions.find(conditionType) != allConditions.end() )
            return allConditions.find(conditionType)->second;

        const vector < gd::String > & objects = extensions[i]->GetExtensionObjectsTypes();
        for (unsigned int j = 0;j<objects.size();++j)
        {
            const std::map<gd::String, gd::InstructionMetadata> & allObjetsConditions = extensions[i]->GetAllConditionsForObject(objects[j]);
            if ( allObjetsConditions.find(conditionType) != allObjetsConditions.end() )
                return allObjetsConditions.find(conditionType)->second;
        }

        const vector < gd::String > & autos = extensions[i]->GetAutomatismsTypes();
        for (unsigned int j = 0;j<autos.size();++j)
        {
            const std::map<gd::String, gd::InstructionMetadata> & allAutosConditions = extensions[i]->GetAllConditionsForAutomatism(autos[j]);
            if ( allAutosConditions.find(conditionType) != allAutosConditions.end() )
                return allAutosConditions.find(conditionType)->second;
        }
    }

    return badInstructionMetadata;
}

const gd::ExpressionMetadata & MetadataProvider::GetObjectExpressionMetadata(const gd::Platform & platform, gd::String objectType, gd::String exprType)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const vector < gd::String > & objects = extensions[i]->GetExtensionObjectsTypes();
        if ( find(objects.begin(), objects.end(), objectType) != objects.end())
        {
            const std::map<gd::String, gd::ExpressionMetadata> & allObjectExpressions = extensions[i]->GetAllExpressionsForObject(objectType);
            if ( allObjectExpressions.find(exprType) != allObjectExpressions.end() )
                return allObjectExpressions.find(exprType)->second;
        }
    }

    //Then check base
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata> & allObjectExpressions = extensions[i]->GetAllExpressionsForObject("");
        if ( allObjectExpressions.find(exprType) != allObjectExpressions.end() )
            return allObjectExpressions.find(exprType)->second;
    }

    return badExpressionMetadata;
}

const gd::ExpressionMetadata & MetadataProvider::GetAutomatismExpressionMetadata(const gd::Platform & platform, gd::String autoType, gd::String exprType)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const vector < gd::String > & autos = extensions[i]->GetAutomatismsTypes();
        if ( find(autos.begin(), autos.end(), autoType) != autos.end())
        {
            const std::map<gd::String, gd::ExpressionMetadata> & allAutoExpressions = extensions[i]->GetAllExpressionsForAutomatism(autoType);
            if ( allAutoExpressions.find(exprType) != allAutoExpressions.end() )
                return allAutoExpressions.find(exprType)->second;
        }
    }

    //Then check base
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata> & allAutoExpressions = extensions[i]->GetAllExpressionsForAutomatism("");
        if ( allAutoExpressions.find(exprType) != allAutoExpressions.end() )
            return allAutoExpressions.find(exprType)->second;
    }

    return badExpressionMetadata;
}

const gd::ExpressionMetadata & MetadataProvider::GetExpressionMetadata(const gd::Platform & platform, gd::String exprType)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata> & allExpr = extensions[i]->GetAllExpressions();
        if ( allExpr.find(exprType) != allExpr.end() )
            return allExpr.find(exprType)->second;
    }

    return badExpressionMetadata;
}

const gd::ExpressionMetadata & MetadataProvider::GetObjectStrExpressionMetadata(const gd::Platform & platform, gd::String objectType, gd::String exprType)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const vector < gd::String > & objects = extensions[i]->GetExtensionObjectsTypes();
        if ( find(objects.begin(), objects.end(), objectType) != objects.end())
        {
            const std::map<gd::String, gd::ExpressionMetadata> & allObjectStrExpressions = extensions[i]->GetAllStrExpressionsForObject(objectType);
            if ( allObjectStrExpressions.find(exprType) != allObjectStrExpressions.end() )
                return allObjectStrExpressions.find(exprType)->second;
        }
    }

    //Then check in functions of "Base object".
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata> & allObjectStrExpressions = extensions[i]->GetAllStrExpressionsForObject("");
        if ( allObjectStrExpressions.find(exprType) != allObjectStrExpressions.end() )
            return allObjectStrExpressions.find(exprType)->second;
    }

    return badStrExpressionMetadata;
}

const gd::ExpressionMetadata & MetadataProvider::GetAutomatismStrExpressionMetadata(const gd::Platform & platform, gd::String autoType, gd::String exprType)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const vector < gd::String > & autos = extensions[i]->GetAutomatismsTypes();
        if ( find(autos.begin(), autos.end(), autoType) != autos.end())
        {
            const std::map<gd::String, gd::ExpressionMetadata> & allAutomatismStrExpressions = extensions[i]->GetAllStrExpressionsForAutomatism(autoType);
            if ( allAutomatismStrExpressions.find(exprType) != allAutomatismStrExpressions.end() )
                return allAutomatismStrExpressions.find(exprType)->second;
        }
    }

    //Then check in functions of "Base object".
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata> & allAutomatismStrExpressions = extensions[i]->GetAllStrExpressionsForAutomatism("");
        if ( allAutomatismStrExpressions.find(exprType) != allAutomatismStrExpressions.end() )
            return allAutomatismStrExpressions.find(exprType)->second;
    }

    return badStrExpressionMetadata;
}

const gd::ExpressionMetadata & MetadataProvider::GetStrExpressionMetadata(const gd::Platform & platform, gd::String exprType)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata> & allExpr = extensions[i]->GetAllStrExpressions();
        if ( allExpr.find(exprType) != allExpr.end() )
            return allExpr.find(exprType)->second;
    }

    return badStrExpressionMetadata;
}

bool MetadataProvider::HasAction(const gd::Platform & platform, gd::String name)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();

    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::InstructionMetadata > & actions = extensions[i]->GetAllActions();
        if ( actions.find(name) != actions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasObjectAction(const gd::Platform & platform, gd::String objectType, gd::String name)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::InstructionMetadata > & actions = extensions[i]->GetAllActionsForObject(objectType);
        if ( actions.find(name) != actions.end() )
            return true;
    }

    //Then check in functions of "Base object".
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::InstructionMetadata > & actions = extensions[i]->GetAllActionsForObject("");
        if ( actions.find(name) != actions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasAutomatismAction(const gd::Platform & platform, gd::String automatismType, gd::String name)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::InstructionMetadata > & actions = extensions[i]->GetAllActionsForAutomatism(automatismType);
        if ( actions.find(name) != actions.end() )
            return true;
    }

    //Then check in functions of "Base object".
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::InstructionMetadata > & actions = extensions[i]->GetAllActionsForAutomatism("");
        if ( actions.find(name) != actions.end() )
            return true;
    }

    return false;
}


bool MetadataProvider::HasCondition(const gd::Platform & platform, gd::String name)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::InstructionMetadata > & conditions = extensions[i]->GetAllConditions();
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasObjectCondition(const gd::Platform & platform, gd::String objectType, gd::String name)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::InstructionMetadata > & conditions = extensions[i]->GetAllConditionsForObject(objectType);
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    //Then check in functions of "Base object".
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::InstructionMetadata > & conditions = extensions[i]->GetAllConditionsForObject("");
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasAutomatismCondition(const gd::Platform & platform, gd::String automatismType, gd::String name)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::InstructionMetadata > & conditions = extensions[i]->GetAllConditionsForAutomatism(automatismType);
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    //Then check in functions of "Base object".
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::InstructionMetadata > & conditions = extensions[i]->GetAllConditionsForAutomatism("");
        if ( conditions.find(name) != conditions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasExpression(const gd::Platform & platform, gd::String name)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllExpressions();
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasObjectExpression(const gd::Platform & platform, gd::String objectType, gd::String name)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllExpressionsForObject(objectType);
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    //Then check in functions of "Base object".
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllExpressionsForObject("");
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasAutomatismExpression(const gd::Platform & platform, gd::String automatismType, gd::String name)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllExpressionsForAutomatism(automatismType);
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    //Then check in functions of "Base object".
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllExpressionsForAutomatism("");
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}


bool MetadataProvider::HasStrExpression(const gd::Platform & platform, gd::String name)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllStrExpressions();
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasObjectStrExpression(const gd::Platform & platform, gd::String objectType, gd::String name)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllStrExpressionsForObject(objectType);
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    //Then check in functions of "Base object".
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllStrExpressionsForObject("");
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

bool MetadataProvider::HasAutomatismStrExpression(const gd::Platform & platform, gd::String automatismType, gd::String name)
{
    std::vector < std::shared_ptr<PlatformExtension> > extensions = platform.GetAllPlatformExtensions();
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllStrExpressionsForAutomatism(automatismType);
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    //Then check in functions of "Base object".
    for (unsigned int i =0;i<extensions.size();++i)
    {
        const std::map<gd::String, gd::ExpressionMetadata > & expressions = extensions[i]->GetAllStrExpressionsForAutomatism("");
        if ( expressions.find(name) != expressions.end() )
            return true;
    }

    return false;
}

MetadataProvider::~MetadataProvider() {}
MetadataProvider::MetadataProvider() {}

}
