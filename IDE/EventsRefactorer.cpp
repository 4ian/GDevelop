#include "EventsRefactorer.h"
#include "GDL/Event.h"
#include "GDL/GDExpressionParser.h"
#include "GDL/ExtensionBase.h"
#include "GDL/ExtensionsManager.h"

class MathExpressionConstantTokenRenamer : public ConstantTokenFunctor
{
    public:

    MathExpressionConstantTokenRenamer(std::string & mathPlainExpression_) :
    mathPlainExpression(mathPlainExpression_)
    {};
    virtual ~MathExpressionConstantTokenRenamer() {};

    virtual void operator()(std::string text)
    {
        mathPlainExpression += text;
    };

    private :
        std::string & mathPlainExpression;
};

class MathExpressionStaticFunctionRenamer : public StaticFunctionFunctor
{
    public:

    MathExpressionStaticFunctionRenamer(std::string & mathPlainExpression_) :
    mathPlainExpression(mathPlainExpression_)
    {};
    virtual ~MathExpressionStaticFunctionRenamer() {};

    virtual void operator()(std::string functionName, const ExpressionInstruction & instruction)
    {
        std::string parametersStr;
        for (unsigned int i = 0;i<instruction.parameters.size();++i)
        {
            if ( i != 0 ) parametersStr += ", ";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        mathPlainExpression += functionName+"("+parametersStr+")";
    };

    private :
        std::string & mathPlainExpression;
};

class MathExpressionObjectFunctionRenamer : public ObjectFunctionFunctor
{
    public:

    MathExpressionObjectFunctionRenamer(std::string & mathPlainExpression_, std::string oldName_, std::string newName_) :
    mathPlainExpression(mathPlainExpression_),
    newName(newName_),
    oldName(oldName_)
    {};
    virtual ~MathExpressionObjectFunctionRenamer() {};

    virtual void operator()(std::string functionName, const ExpressionInstruction & instruction)
    {
        if ( instruction.parameters.empty() ) return;

        std::string parametersStr;
        for (unsigned int i = 1;i<instruction.parameters.size();++i)
        {
            if ( i != 1 ) parametersStr += ", ";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        mathPlainExpression += (instruction.parameters[0].GetPlainString() == oldName ? newName : instruction.parameters[0].GetPlainString())
                               +"."+functionName+"("+parametersStr+")";
    };

    private :
        std::string & mathPlainExpression;
        std::string newName;
        std::string oldName;
};

class MathExpressionAutomatismFunctionRenamer : public AutomatismFunctionFunctor
{
    public:

    MathExpressionAutomatismFunctionRenamer(std::string & mathPlainExpression_, std::string oldName_, std::string newName_) :
    mathPlainExpression(mathPlainExpression_),
    newName(newName_),
    oldName(oldName_)
    {};
    virtual ~MathExpressionAutomatismFunctionRenamer() {};

    virtual void operator()(std::string functionName, const ExpressionInstruction & instruction)
    {
        if ( instruction.parameters.size() < 2 ) return;

        std::string parametersStr;
        for (unsigned int i = 2;i<instruction.parameters.size();++i)
        {
            if ( i != 2 ) parametersStr += ", ";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        mathPlainExpression += (instruction.parameters[0].GetPlainString() == oldName ? newName : instruction.parameters[0].GetPlainString())
                               +"."+instruction.parameters[1].GetPlainString()+"::"+functionName+"("+parametersStr+")";
    };

    private :
        std::string & mathPlainExpression;
        std::string newName;
        std::string oldName;
};

void EventsRefactorer::RenameObjectInActions(Game & game, Scene & scene, vector < Instruction > & actions, std::string oldName, std::string newName)
{
    for (unsigned int aId = 0;aId < actions.size();++aId)
    {
        InstructionInfos instrInfos = gdp::ExtensionsManager::getInstance()->GetActionInfos(actions[aId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            if ( instrInfos.parameters[pNb].type == "object" && actions[aId].GetParameterSafely(pNb).GetPlainString() == oldName )
                actions[aId].SetParameter(pNb, GDExpression(newName));
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                std::string newExpression;

                MathExpressionConstantTokenRenamer constantTokenRenamer(newExpression);
                MathExpressionStaticFunctionRenamer staticFunctionRenamer(newExpression);
                MathExpressionObjectFunctionRenamer objectFunctionRenamer(newExpression, oldName, newName);
                MathExpressionAutomatismFunctionRenamer automatismFunctionRenamer(newExpression, oldName, newName);

                GDExpressionParser parser(actions[aId].GetParameterSafely(pNb).GetPlainString());
                parser.ParseMathExpression(game, scene, constantTokenRenamer, staticFunctionRenamer, objectFunctionRenamer, automatismFunctionRenamer);

                actions[aId].SetParameter(pNb, GDExpression(newExpression));
            }
        }

        if ( !actions[aId].GetSubInstructions().empty() ) RenameObjectInActions(game, scene, actions[aId].GetSubInstructions(), oldName, newName);
    }
}

void EventsRefactorer::RenameObjectInConditions(Game & game, Scene & scene, vector < Instruction > & conditions, std::string oldName, std::string newName)
{
    for (unsigned int aId = 0;aId < conditions.size();++aId)
    {
        InstructionInfos instrInfos = gdp::ExtensionsManager::getInstance()->GetConditionInfos(conditions[aId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            if ( instrInfos.parameters[pNb].type == "object" && conditions[aId].GetParameterSafely(pNb).GetPlainString() == oldName )
                conditions[aId].SetParameter(pNb, GDExpression(newName));
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                std::string newExpression;

                MathExpressionConstantTokenRenamer constantTokenRenamer(newExpression);
                MathExpressionStaticFunctionRenamer staticFunctionRenamer(newExpression);
                MathExpressionObjectFunctionRenamer objectFunctionRenamer(newExpression, oldName, newName);
                MathExpressionAutomatismFunctionRenamer automatismFunctionRenamer(newExpression, oldName, newName);

                GDExpressionParser parser(conditions[aId].GetParameterSafely(pNb).GetPlainString());
                parser.ParseMathExpression(game, scene, constantTokenRenamer, staticFunctionRenamer, objectFunctionRenamer, automatismFunctionRenamer);

                conditions[aId].SetParameter(pNb, GDExpression(newExpression));
            }
        }

        if ( !conditions[aId].GetSubInstructions().empty() ) RenameObjectInConditions(game, scene, conditions[aId].GetSubInstructions(), oldName, newName);
    }
}

void EventsRefactorer::RenameObjectInEvents(Game & game, Scene & scene, vector < BaseEventSPtr > & events, std::string oldName, std::string newName)
{
    for (unsigned int i = 0;i<events.size();++i)
    {
        vector < vector<Instruction>* > conditionsVectors =  events[i]->GetAllConditionsVectors();
        for (unsigned int j = 0;j < conditionsVectors.size();++j)
            RenameObjectInConditions(game, scene, *conditionsVectors[j], oldName, newName);

        vector < vector<Instruction>* > actionsVectors =  events[i]->GetAllActionsVectors();
        for (unsigned int j = 0;j < actionsVectors.size();++j)
            RenameObjectInActions(game, scene, *actionsVectors[j], oldName, newName);

        if ( events[i]->CanHaveSubEvents() ) RenameObjectInEvents(game, scene, events[i]->GetSubEvents(), oldName, newName);
    }
}
