/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
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
#include "GDCore/IDE/MetadataProvider.h"

using namespace std;

namespace gd
{

class CallbacksForSearchingGlobalVariable : public gd::ParserCallbacks
{
    public:

    CallbacksForSearchingGlobalVariable(std::set<std::string> & results_, const std::string & parameterType_) :
    results(results_),
    parameterType(parameterType_)
    {};
    virtual ~CallbacksForSearchingGlobalVariable() {};

    virtual void OnConstantToken(std::string text) {}
    virtual void OnNumber(std::string text) {}
    virtual void OnOperator(std::string text) {}

    virtual void OnStaticFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) { SearchInParameters(parameters, expressionInfo); }
    virtual void OnStaticFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo) { SearchInParameters(parameters, expressionInfo); }
    virtual void OnObjectFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) { SearchInParameters(parameters, expressionInfo); }
    virtual void OnObjectFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo) { SearchInParameters(parameters, expressionInfo); }
    virtual void OnObjectAutomatismFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) { SearchInParameters(parameters, expressionInfo); }
    virtual void OnObjectAutomatismFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo) { SearchInParameters(parameters, expressionInfo); }

    virtual bool OnSubMathExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
    {
        CallbacksForSearchingGlobalVariable callbacks(results, parameterType);

        gd::ExpressionParser parser(expression.GetPlainString());
        parser.ParseMathExpression(platform, project, layout, callbacks);

        return true;
    }

    virtual bool OnSubTextExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
    {
        CallbacksForSearchingGlobalVariable callbacks(results, parameterType);

        gd::ExpressionParser parser(expression.GetPlainString());
        parser.ParseStringExpression(platform, project, layout, callbacks);

        return true;
    }

    void SearchInParameters(const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
    {
        for (unsigned int i = 0;i<parameters.size();++i)
        {
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].type == parameterType )
                results.insert(parameters[i].GetPlainString());
        }
    }
    void SearchInParameters(const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo)
    {
        for (unsigned int i = 0;i<parameters.size();++i)
        {
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].type == parameterType )
                results.insert(parameters[i].GetPlainString());
        }
    }

private:
    std::set< std::string > & results; ///< Reference to the std::set where arguments values must be stored.
    std::string parameterType; ///< The name of the parameter to be searched for
};

std::set < std::string > EventsVariablesFinder::FindAllGlobalVariables(const gd::Platform & platform, const gd::Project & project)
{
    std::set < std::string > results;

    for (unsigned int i = 0;i<project.GetLayoutCount();++i)
    {
        std::set < std::string > results2 = FindArgumentsInEvents(platform, project, project.GetLayout(i), project.GetLayout(i).GetEvents(), "globalvar");
        results.insert(results2.begin(), results2.end());
    }

    return results;
}

std::set < std::string > EventsVariablesFinder::FindAllLayoutVariables(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout)
{
    std::set < std::string > results;

    std::set < std::string > results2 = FindArgumentsInEvents(platform, project, layout, layout.GetEvents(), "scenevar");
    results.insert(results2.begin(), results2.end());

    return results;
}

std::set < std::string > EventsVariablesFinder::FindArgumentsInInstructions(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, const vector < gd::Instruction > & instructions, bool instructionsAreConditions, const std::string & parameterType)
{
    std::set < std::string > results;

    for (unsigned int aId = 0;aId < instructions.size();++aId)
    {
        gd::InstructionMetadata instrInfos = instructionsAreConditions ? MetadataProvider::GetConditionMetadata(platform, instructions[aId].GetType()) :
                                                                         MetadataProvider::GetActionMetadata(platform, instructions[aId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            //Search in global variables parameters
            if ( instrInfos.parameters[pNb].type == parameterType )
                results.insert(instructions[aId].GetParameter(pNb).GetPlainString());
            //Search in expressions
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                CallbacksForSearchingGlobalVariable callbacks(results, parameterType);

                gd::ExpressionParser parser(instructions[aId].GetParameter(pNb).GetPlainString());
                parser.ParseMathExpression(platform, project, layout, callbacks);
            }
            //Search in string expressions
            else if (instrInfos.parameters[pNb].type == "string"||instrInfos.parameters[pNb].type == "file" ||instrInfos.parameters[pNb].type == "joyaxis" ||instrInfos.parameters[pNb].type == "color"||instrInfos.parameters[pNb].type == "layer")
            {
                CallbacksForSearchingGlobalVariable callbacks(results, parameterType);

                gd::ExpressionParser parser(instructions[aId].GetParameter(pNb).GetPlainString());
                parser.ParseStringExpression(platform, project, layout, callbacks);
            }
        }

        if ( !instructions[aId].GetSubInstructions().empty() ) FindArgumentsInInstructions(platform, project, layout, instructions[aId].GetSubInstructions(), instructionsAreConditions, parameterType);
    }

    return results;
}

std::set < std::string > EventsVariablesFinder::FindArgumentsInEvents(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, const gd::EventsList & events, const std::string & parameterType)
{
    std::set < std::string > results;
    for (unsigned int i = 0;i<events.size();++i)
    {
        vector < const vector<gd::Instruction>* > conditionsVectors =  events[i].GetAllConditionsVectors();
        for (unsigned int j = 0;j < conditionsVectors.size();++j)
        {
            std::set < std::string > results2 = FindArgumentsInInstructions(platform, project, layout, *conditionsVectors[j], /*conditions=*/true, parameterType);
            results.insert(results2.begin(), results2.end());
        }

        vector < const vector<gd::Instruction>* > actionsVectors =  events[i].GetAllActionsVectors();
        for (unsigned int j = 0;j < actionsVectors.size();++j)
        {
            std::set < std::string > results2 = FindArgumentsInInstructions(platform, project, layout, *actionsVectors[j], /*conditions=*/false, parameterType);
            results.insert(results2.begin(), results2.end());
        }

        if ( events[i].CanHaveSubEvents() )
        {
            std::set < std::string > results2 = FindArgumentsInEvents(platform, project, layout, events[i].GetSubEvents(), parameterType);
            results.insert(results2.begin(), results2.end());
        }
    }

    return results;
}


}