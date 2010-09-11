#include "EventsRefactorer.h"
#include "GDL/Event.h"
#include "GDL/GDExpressionParser.h"
#include "GDL/ExtensionBase.h"
#include "GDL/ExtensionsManager.h"

class CallbacksForRenamingObject : public ParserCallbacks
{
    public:

    CallbacksForRenamingObject(std::string & plainExpression_, std::string oldName_, std::string newName_) :
    plainExpression(plainExpression_),
    newName(newName_),
    oldName(oldName_)
    {};
    virtual ~CallbacksForRenamingObject() {};

    virtual void OnConstantToken(std::string text)
    {
        plainExpression += text;
    };

    virtual void OnStaticFunction(std::string functionName, const ExpressionInstruction & instruction)
    {
        std::string parametersStr;
        for (unsigned int i = 0;i<instruction.parameters.size();++i)
        {
            if ( i != 0 ) parametersStr += ", ";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        plainExpression += functionName+"("+parametersStr+")";
    };

    virtual void OnStaticFunction(std::string functionName, const StrExpressionInstruction & instruction)
    {
        //Special case : Function without name is a litteral string.
        if ( functionName.empty() )
        {
            if ( instruction.parameters.empty() ) return;
            plainExpression += "\""+instruction.parameters[0].GetPlainString()+"\"";

            return;
        }

        std::string parametersStr;
        for (unsigned int i = 0;i<instruction.parameters.size();++i)
        {
            if ( i != 0 ) parametersStr += ", ";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        plainExpression += functionName+"("+parametersStr+")";
    };

    virtual void OnObjectFunction(std::string functionName, const ExpressionInstruction & instruction)
    {
        if ( instruction.parameters.empty() ) return;

        std::string parametersStr;
        for (unsigned int i = 1;i<instruction.parameters.size();++i)
        {
            if ( i != 1 ) parametersStr += ", ";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        plainExpression += (instruction.parameters[0].GetPlainString() == oldName ? newName : instruction.parameters[0].GetPlainString())
                               +"."+functionName+"("+parametersStr+")";
    };

    virtual void OnObjectFunction(std::string functionName, const StrExpressionInstruction & instruction)
    {
        if ( instruction.parameters.empty() ) return;

        std::string parametersStr;
        for (unsigned int i = 1;i<instruction.parameters.size();++i)
        {
            if ( i != 1 ) parametersStr += ", ";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        plainExpression += (instruction.parameters[0].GetPlainString() == oldName ? newName : instruction.parameters[0].GetPlainString())
                               +"."+functionName+"("+parametersStr+")";
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const ExpressionInstruction & instruction)
    {
        if ( instruction.parameters.size() < 2 ) return;

        std::string parametersStr;
        for (unsigned int i = 2;i<instruction.parameters.size();++i)
        {
            if ( i != 2 ) parametersStr += ", ";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        plainExpression += (instruction.parameters[0].GetPlainString() == oldName ? newName : instruction.parameters[0].GetPlainString())
                               +"."+instruction.parameters[1].GetPlainString()+"::"+functionName+"("+parametersStr+")";
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const StrExpressionInstruction & instruction)
    {
        if ( instruction.parameters.size() < 2 ) return;

        std::string parametersStr;
        for (unsigned int i = 2;i<instruction.parameters.size();++i)
        {
            if ( i != 2 ) parametersStr += ", ";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        plainExpression += (instruction.parameters[0].GetPlainString() == oldName ? newName : instruction.parameters[0].GetPlainString())
                               +"."+instruction.parameters[1].GetPlainString()+"::"+functionName+"("+parametersStr+")";
    };

    virtual bool OnSubMathExpression(const Game & game, const Scene & scene, GDExpression & expression)
    {
        std::string newExpression;

        CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

        GDExpressionParser parser(expression.GetPlainString());
        if ( !parser.ParseMathExpression(game, scene, callbacks) )
            return false;

        expression = GDExpression(newExpression);
        return true;
    }

    virtual bool OnSubTextExpression(const Game & game, const Scene & scene, GDExpression & expression)
    {
        std::string newExpression;

        CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

        GDExpressionParser parser(expression.GetPlainString());
        if ( !parser.ParseTextExpression(game, scene, callbacks) )
            return false;

        expression = GDExpression(newExpression);
        return true;
    }


    private :
        std::string & plainExpression;
        std::string newName;
        std::string oldName;
};

class CallbacksForRemovingObject : public ParserCallbacks
{
    public:

    CallbacksForRemovingObject(std::string name_) :
    objectPresent(false),
    name(name_)
    {};
    virtual ~CallbacksForRemovingObject() {};

    bool objectPresent; //True if the object is present in the expression

    virtual void OnConstantToken(std::string text)
    {
    };

    virtual void OnStaticFunction(std::string functionName, const ExpressionInstruction & instruction)
    {
    };

    virtual void OnStaticFunction(std::string functionName, const StrExpressionInstruction & instruction)
    {
        //Special case : Function without name is a litteral string.
        if ( functionName.empty() )
            return;
    };

    virtual void OnObjectFunction(std::string functionName, const ExpressionInstruction & instruction)
    {
        if ( instruction.parameters.empty() ) return;

        if ( instruction.parameters[0].GetPlainString() == name ) objectPresent = true;
    };

    virtual void OnObjectFunction(std::string functionName, const StrExpressionInstruction & instruction)
    {
        if ( instruction.parameters.empty() ) return;

        if ( instruction.parameters[0].GetPlainString() == name ) objectPresent = true;
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const ExpressionInstruction & instruction)
    {
        if ( instruction.parameters.empty() ) return;

        if ( instruction.parameters[0].GetPlainString() == name ) objectPresent = true;
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const StrExpressionInstruction & instruction)
    {
        if ( instruction.parameters.empty() ) return;

        if ( instruction.parameters[0].GetPlainString() == name ) objectPresent = true;
    };

    virtual bool OnSubMathExpression(const Game & game, const Scene & scene, GDExpression & expression)
    {
        CallbacksForRemovingObject callbacks(name);

        GDExpressionParser parser(expression.GetPlainString());
        if ( !parser.ParseMathExpression(game, scene, callbacks) )
            return false;

        if(callbacks.objectPresent) objectPresent = true;
        return true;
    }

    virtual bool OnSubTextExpression(const Game & game, const Scene & scene, GDExpression & expression)
    {
        CallbacksForRemovingObject callbacks(name);

        GDExpressionParser parser(expression.GetPlainString());
        if ( !parser.ParseTextExpression(game, scene, callbacks) )
            return false;

        if(callbacks.objectPresent) objectPresent = true;
        return true;
    }


    private :
        std::string name;
};

void EventsRefactorer::RenameObjectInActions(Game & game, Scene & scene, vector < Instruction > & actions, std::string oldName, std::string newName)
{
    for (unsigned int aId = 0;aId < actions.size();++aId)
    {
        InstructionInfos instrInfos = gdp::ExtensionsManager::getInstance()->GetActionInfos(actions[aId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            //Replace object's name in parameters
            if ( instrInfos.parameters[pNb].type == "object" && actions[aId].GetParameterSafely(pNb).GetPlainString() == oldName )
                actions[aId].SetParameter(pNb, GDExpression(newName));
            //Replace object's name in expressions
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                std::string newExpression;

                CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

                GDExpressionParser parser(actions[aId].GetParameterSafely(pNb).GetPlainString());
                if ( parser.ParseMathExpression(game, scene, callbacks) )
                    actions[aId].SetParameter(pNb, GDExpression(newExpression));
            }
            //Replace object's name in text expressions
            else if (instrInfos.parameters[pNb].type == "text")
            {
                std::string newExpression;

                CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

                GDExpressionParser parser(actions[aId].GetParameterSafely(pNb).GetPlainString());
                if ( parser.ParseTextExpression(game, scene, callbacks))
                    actions[aId].SetParameter(pNb, GDExpression(newExpression));
            }
        }

        if ( !actions[aId].GetSubInstructions().empty() ) RenameObjectInActions(game, scene, actions[aId].GetSubInstructions(), oldName, newName);
    }
}

void EventsRefactorer::RenameObjectInConditions(Game & game, Scene & scene, vector < Instruction > & conditions, std::string oldName, std::string newName)
{
    for (unsigned int cId = 0;cId < conditions.size();++cId)
    {
        InstructionInfos instrInfos = gdp::ExtensionsManager::getInstance()->GetConditionInfos(conditions[cId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            //Replace object's name in parameters
            if ( instrInfos.parameters[pNb].type == "object" && conditions[cId].GetParameterSafely(pNb).GetPlainString() == oldName )
                conditions[cId].SetParameter(pNb, GDExpression(newName));
            //Replace object's name in expressions
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                std::string newExpression;

                CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

                GDExpressionParser parser(conditions[cId].GetParameterSafely(pNb).GetPlainString());
                if ( parser.ParseMathExpression(game, scene, callbacks) )
                    conditions[cId].SetParameter(pNb, GDExpression(newExpression));
            }
            //Replace object's name in text expressions
            else if (instrInfos.parameters[pNb].type == "text")
            {
                std::string newExpression;

                CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

                GDExpressionParser parser(conditions[cId].GetParameterSafely(pNb).GetPlainString());
                if ( parser.ParseMathExpression(game, scene, callbacks) )
                    conditions[cId].SetParameter(pNb, GDExpression(newExpression));
            }
        }

        if ( !conditions[cId].GetSubInstructions().empty() ) RenameObjectInConditions(game, scene, conditions[cId].GetSubInstructions(), oldName, newName);
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

void EventsRefactorer::RemoveObjectInActions(Game & game, Scene & scene, vector < Instruction > & actions, std::string name)
{
    for (unsigned int aId = 0;aId < actions.size();++aId)
    {
        bool deleteMe = false;

        InstructionInfos instrInfos = gdp::ExtensionsManager::getInstance()->GetActionInfos(actions[aId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            //Replace object's name in parameters
            if ( instrInfos.parameters[pNb].type == "object" && actions[aId].GetParameterSafely(pNb).GetPlainString() == name )
            {
                deleteMe = true;
                break;
            }
            //Replace object's name in expressions
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                CallbacksForRemovingObject callbacks(name);

                GDExpressionParser parser(actions[aId].GetParameterSafely(pNb).GetPlainString());
                if ( parser.ParseMathExpression(game, scene, callbacks) && callbacks.objectPresent )
                {
                    deleteMe = true;
                    break;
                }
            }
            //Replace object's name in text expressions
            else if (instrInfos.parameters[pNb].type == "text")
            {
                CallbacksForRemovingObject callbacks(name);

                GDExpressionParser parser(actions[aId].GetParameterSafely(pNb).GetPlainString());
                if ( parser.ParseTextExpression(game, scene, callbacks) && callbacks.objectPresent )
                {
                    deleteMe = true;
                    break;
                }
            }
        }


        if ( deleteMe )
        {
            actions.erase(actions.begin()+aId);
            aId--;
        }
        else if ( !actions[aId].GetSubInstructions().empty() ) RemoveObjectInActions(game, scene, actions[aId].GetSubInstructions(), name);
    }
}

void EventsRefactorer::RemoveObjectInConditions(Game & game, Scene & scene, vector < Instruction > & conditions, std::string name)
{
    for (unsigned int cId = 0;cId < conditions.size();++cId)
    {
        bool deleteMe = false;

        InstructionInfos instrInfos = gdp::ExtensionsManager::getInstance()->GetConditionInfos(conditions[cId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            //Replace object's name in parameters
            if ( instrInfos.parameters[pNb].type == "object" && conditions[cId].GetParameterSafely(pNb).GetPlainString() == name )
            {
                deleteMe = true; break;
            }
            //Replace object's name in expressions
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                CallbacksForRemovingObject callbacks(name);

                GDExpressionParser parser(conditions[cId].GetParameterSafely(pNb).GetPlainString());
                if ( parser.ParseMathExpression(game, scene, callbacks) && callbacks.objectPresent )
                {
                    deleteMe = true;
                    break;
                }
            }
            //Replace object's name in text expressions
            else if (instrInfos.parameters[pNb].type == "text")
            {
                CallbacksForRemovingObject callbacks(name);

                GDExpressionParser parser(conditions[cId].GetParameterSafely(pNb).GetPlainString());
                if ( parser.ParseTextExpression(game, scene, callbacks) && callbacks.objectPresent )
                {
                    deleteMe = true;
                    break;
                }
            }
        }

        if ( deleteMe )
        {
            conditions.erase(conditions.begin()+cId);
            cId--;
        }
        else if ( !conditions[cId].GetSubInstructions().empty() ) RemoveObjectInConditions(game, scene, conditions[cId].GetSubInstructions(), name);
    }
}

void EventsRefactorer::RemoveObjectInEvents(Game & game, Scene & scene, vector < BaseEventSPtr > & events, std::string name)
{
    for (unsigned int i = 0;i<events.size();++i)
    {
        vector < vector<Instruction>* > conditionsVectors =  events[i]->GetAllConditionsVectors();
        for (unsigned int j = 0;j < conditionsVectors.size();++j)
            RemoveObjectInConditions(game, scene, *conditionsVectors[j], name);

        vector < vector<Instruction>* > actionsVectors =  events[i]->GetAllActionsVectors();
        for (unsigned int j = 0;j < actionsVectors.size();++j)
            RemoveObjectInActions(game, scene, *actionsVectors[j], name);

        if ( events[i]->CanHaveSubEvents() ) RemoveObjectInEvents(game, scene, events[i]->GetSubEvents(), name);
    }
}
