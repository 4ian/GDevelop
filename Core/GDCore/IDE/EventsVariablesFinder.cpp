/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "EventsVariablesFinder.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/Events/ExpressionParser.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/IDE/MetadataProvider.h"

using namespace std;

namespace gd
{

class CallbacksForSearchingVariable : public gd::ParserCallbacks
{
public:

    CallbacksForSearchingVariable(std::set<gd::String> & results_, const gd::String & parameterType_, const gd::String & objectName_ = "") :
    results(results_),
    parameterType(parameterType_),
    objectName(objectName_)
    {};
    virtual ~CallbacksForSearchingVariable() {};

    virtual void OnConstantToken(gd::String text) {}

    virtual void OnStaticFunction(gd::String functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) { SearchInParameters(parameters, expressionInfo); }
    virtual void OnObjectFunction(gd::String functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) { SearchInParameters(parameters, expressionInfo); }
    virtual void OnObjectBehaviorFunction(gd::String functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) { SearchInParameters(parameters, expressionInfo); }

    virtual bool OnSubMathExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
    {
        CallbacksForSearchingVariable callbacks(results, parameterType, objectName);

        gd::ExpressionParser parser(expression.GetPlainString());
        parser.ParseMathExpression(platform, project, layout, callbacks);

        return true;
    }

    virtual bool OnSubTextExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
    {
        CallbacksForSearchingVariable callbacks(results, parameterType, objectName);

        gd::ExpressionParser parser(expression.GetPlainString());
        parser.ParseStringExpression(platform, project, layout, callbacks);

        return true;
    }

    void SearchInParameters(const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
    {
        gd::String lastObjectParameter = "";
        for (unsigned int i = 0;i<parameters.size();++i)
        {
            if (i >= expressionInfo.parameters.size()) break;

            //The parameter has the searched type...
            if ( expressionInfo.parameters[i].type == parameterType )
            {
                //...remember the value of the parameter.
                if ( objectName.empty() || objectName == lastObjectParameter)
                    results.insert(parameters[i].GetPlainString());
            }
            //Remember the value of the last "object" parameter.
            else if (gd::ParameterMetadata::IsObject(expressionInfo.parameters[i].type))
                lastObjectParameter = parameters[i].GetPlainString();
        }
    }

private:
    std::set< gd::String > & results; ///< Reference to the std::set where arguments values must be stored.
    gd::String parameterType; ///< The name of the parameter to be searched for
    gd::String objectName; ///< If not empty, parameters will be taken into account only if the last object parameter is filled with this value.
};

std::set < gd::String > EventsVariablesFinder::FindAllGlobalVariables(const gd::Platform & platform, const gd::Project & project)
{
    std::set < gd::String > results;

    for (unsigned int i = 0;i<project.GetLayoutsCount();++i)
    {
        std::set < gd::String > results2 = FindArgumentsInEvents(platform, project, project.GetLayout(i), project.GetLayout(i).GetEvents(), "globalvar");
        results.insert(results2.begin(), results2.end());
    }

    return results;
}

std::set < gd::String > EventsVariablesFinder::FindAllLayoutVariables(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout)
{
    std::set < gd::String > results;

    std::set < gd::String > results2 = FindArgumentsInEvents(platform, project, layout, layout.GetEvents(), "scenevar");
    results.insert(results2.begin(), results2.end());

    return results;
}

std::set < gd::String > EventsVariablesFinder::FindAllObjectVariables(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, const gd::Object & object)
{
    std::set < gd::String > results;

    std::set < gd::String > results2 = FindArgumentsInEvents(platform, project, layout, layout.GetEvents(), "objectvar", object.GetName());
    results.insert(results2.begin(), results2.end());

    return results;
}

std::set < gd::String > EventsVariablesFinder::FindArgumentsInInstructions(const gd::Platform & platform,
    const gd::Project & project, const gd::Layout & layout, const gd::InstructionsList & instructions,
    bool instructionsAreConditions, const gd::String & parameterType, const gd::String & objectName)
{
    std::set < gd::String > results;

    for (unsigned int aId = 0;aId < instructions.size();++aId)
    {
        gd::String lastObjectParameter = "";
        gd::InstructionMetadata instrInfos = instructionsAreConditions ? MetadataProvider::GetConditionMetadata(platform, instructions[aId].GetType()) :
                                                                         MetadataProvider::GetActionMetadata(platform, instructions[aId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            //The parameter has the searched type...
            if ( instrInfos.parameters[pNb].type == parameterType )
            {
                //...remember the value of the parameter.
                if (objectName.empty() || lastObjectParameter == objectName)
                    results.insert(instructions[aId].GetParameter(pNb).GetPlainString());
            }
            //Search in expressions
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                CallbacksForSearchingVariable callbacks(results, parameterType, objectName);

                gd::ExpressionParser parser(instructions[aId].GetParameter(pNb).GetPlainString());
                parser.ParseMathExpression(platform, project, layout, callbacks);
            }
            //Search in gd::String expressions
            else if (instrInfos.parameters[pNb].type == "string"||instrInfos.parameters[pNb].type == "file" ||instrInfos.parameters[pNb].type == "joyaxis" ||instrInfos.parameters[pNb].type == "color"||instrInfos.parameters[pNb].type == "layer")
            {
                CallbacksForSearchingVariable callbacks(results, parameterType, objectName);

                gd::ExpressionParser parser(instructions[aId].GetParameter(pNb).GetPlainString());
                parser.ParseStringExpression(platform, project, layout, callbacks);
            }
            //Remember the value of the last "object" parameter.
            else if (gd::ParameterMetadata::IsObject(instrInfos.parameters[pNb].type))
            {
                lastObjectParameter = instructions[aId].GetParameter(pNb).GetPlainString();
            }
        }

        if ( !instructions[aId].GetSubInstructions().empty() )
            FindArgumentsInInstructions(platform, project, layout, instructions[aId].GetSubInstructions(),
                instructionsAreConditions, parameterType);
    }

    return results;
}

std::set < gd::String > EventsVariablesFinder::FindArgumentsInEvents(const gd::Platform & platform,
    const gd::Project & project, const gd::Layout & layout, const gd::EventsList & events,
    const gd::String & parameterType, const gd::String & objectName)
{
    std::set < gd::String > results;
    for (unsigned int i = 0;i<events.size();++i)
    {
        vector < const gd::InstructionsList* > conditionsVectors =  events[i].GetAllConditionsVectors();
        for (unsigned int j = 0;j < conditionsVectors.size();++j)
        {
            std::set < gd::String > results2 = FindArgumentsInInstructions(platform, project, layout, *conditionsVectors[j], /*conditions=*/true, parameterType, objectName);
            results.insert(results2.begin(), results2.end());
        }

        vector < const gd::InstructionsList* > actionsVectors =  events[i].GetAllActionsVectors();
        for (unsigned int j = 0;j < actionsVectors.size();++j)
        {
            std::set < gd::String > results2 = FindArgumentsInInstructions(platform, project, layout, *actionsVectors[j], /*conditions=*/false, parameterType, objectName);
            results.insert(results2.begin(), results2.end());
        }

        if ( events[i].CanHaveSubEvents() )
        {
            std::set < gd::String > results2 = FindArgumentsInEvents(platform, project, layout, events[i].GetSubEvents(), parameterType, objectName);
            results.insert(results2.begin(), results2.end());
        }
    }

    return results;
}


}
