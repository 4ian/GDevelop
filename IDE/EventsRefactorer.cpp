#include "EventsRefactorer.h"
#include "GDL/Event.h"
#include "GDL/IDE/GDExpressionParser.h"
#include "GDL/ExtensionBase.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/StrExpressionInstruction.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExternalEvents.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/LinkEvent.h"
#include <boost/algorithm/string.hpp>
#include <boost/weak_ptr.hpp>

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
    virtual void OnNumber(std::string text)
    {
        plainExpression += text;
    };
    virtual void OnOperator(std::string text)
    {
        plainExpression += text;
    };

    virtual void OnStaticFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
    {
        std::string parametersStr;
        for (unsigned int i = 0;i<instruction.parameters.size();++i)
        {
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].codeOnly )
                continue; //Skip code only parameter which are not included in function calls.

            if ( !parametersStr.empty() ) parametersStr += ",";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        plainExpression += functionName+"("+parametersStr+")";
    };

    virtual void OnStaticFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
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
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].codeOnly )
                continue; //Skip code only parameter which are not included in function calls.

            if ( !parametersStr.empty() ) parametersStr += ",";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        plainExpression += functionName+"("+parametersStr+")";
    };

    virtual void OnObjectFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
    {
        if ( instruction.parameters.empty() ) return;

        std::string parametersStr;
        for (unsigned int i = 1;i<instruction.parameters.size();++i)
        {
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].codeOnly )
                continue; //Skip code only parameter which are not included in function calls.

            if ( !parametersStr.empty() ) parametersStr += ",";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        plainExpression += (instruction.parameters[0].GetPlainString() == oldName ? newName : instruction.parameters[0].GetPlainString())
                               +"."+functionName+"("+parametersStr+")";
    };

    virtual void OnObjectFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
    {
        if ( instruction.parameters.empty() ) return;

        std::string parametersStr;
        for (unsigned int i = 1;i<instruction.parameters.size();++i)
        {
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].codeOnly )
                continue; //Skip code only parameter which are not included in function calls.

            if ( !parametersStr.empty() ) parametersStr += ",";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        plainExpression += (instruction.parameters[0].GetPlainString() == oldName ? newName : instruction.parameters[0].GetPlainString())
                               +"."+functionName+"("+parametersStr+")";
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
    {
        if ( instruction.parameters.size() < 2 ) return;

        std::string parametersStr;
        for (unsigned int i = 2;i<instruction.parameters.size();++i)
        {
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].codeOnly )
                continue; //Skip code only parameter which are not included in function calls.

            if ( !parametersStr.empty() ) parametersStr += ",";
            parametersStr += instruction.parameters[i].GetPlainString();
        }
        plainExpression += (instruction.parameters[0].GetPlainString() == oldName ? newName : instruction.parameters[0].GetPlainString())
                               +"."+instruction.parameters[1].GetPlainString()+"::"+functionName+"("+parametersStr+")";
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
    {
        if ( instruction.parameters.size() < 2 ) return;

        std::string parametersStr;
        for (unsigned int i = 2;i<instruction.parameters.size();++i)
        {
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].codeOnly )
                continue; //Skip code only parameter which are not included in function calls.

            if ( !parametersStr.empty() ) parametersStr += ",";
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

    virtual void OnConstantToken(std::string text){};
    virtual void OnOperator(std::string text){};
    virtual void OnNumber(std::string text){};

    virtual void OnStaticFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
    {
    };

    virtual void OnStaticFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
    {
    };

    virtual void OnObjectFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
    {
        if ( instruction.parameters.empty() ) return;

        if ( instruction.parameters[0].GetPlainString() == name ) objectPresent = true;
    };

    virtual void OnObjectFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
    {
        if ( instruction.parameters.empty() ) return;

        if ( instruction.parameters[0].GetPlainString() == name ) objectPresent = true;
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo)
    {
        if ( instruction.parameters.empty() ) return;

        if ( instruction.parameters[0].GetPlainString() == name ) objectPresent = true;
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo)
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

bool EventsRefactorer::RenameObjectInActions(Game & game, Scene & scene, vector < Instruction > & actions, std::string oldName, std::string newName)
{
    bool somethingModified = false;

    for (unsigned int aId = 0;aId < actions.size();++aId)
    {
        InstructionInfos instrInfos = GDpriv::ExtensionsManager::GetInstance()->GetActionInfos(actions[aId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            //Replace object's name in parameters
            if ( instrInfos.parameters[pNb].type == "object" && actions[aId].GetParameterSafely(pNb).GetPlainString() == oldName )
                actions[aId].SetParameter(pNb, GDExpression(newName));
            //Replace object's name in expressions
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                std::string newExpression;
                std::string oldExpression = actions[aId].GetParameterSafely(pNb).GetPlainString();

                CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

                GDExpressionParser parser(oldExpression);
                if ( parser.ParseMathExpression(game, scene, callbacks) && newExpression != oldExpression )
                {
                    somethingModified = true;
                    actions[aId].SetParameter(pNb, GDExpression(newExpression));
                }
            }
            //Replace object's name in text expressions
            else if (instrInfos.parameters[pNb].type == "string"||instrInfos.parameters[pNb].type == "file" ||instrInfos.parameters[pNb].type == "joyaxis" ||instrInfos.parameters[pNb].type == "color"||instrInfos.parameters[pNb].type == "layer")
            {
                std::string newExpression;
                std::string oldExpression = actions[aId].GetParameterSafely(pNb).GetPlainString();

                CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

                GDExpressionParser parser(oldExpression);
                if ( parser.ParseTextExpression(game, scene, callbacks) && newExpression != oldExpression )
                {
                    somethingModified = true;
                    actions[aId].SetParameter(pNb, GDExpression(newExpression));
                }
            }
        }

        if ( !actions[aId].GetSubInstructions().empty() )
            somethingModified = RenameObjectInActions(game, scene, actions[aId].GetSubInstructions(), oldName, newName) || somethingModified;
    }

    return somethingModified;
}

bool EventsRefactorer::RenameObjectInConditions(Game & game, Scene & scene, vector < Instruction > & conditions, std::string oldName, std::string newName)
{
    bool somethingModified = false;

    for (unsigned int cId = 0;cId < conditions.size();++cId)
    {
        InstructionInfos instrInfos = GDpriv::ExtensionsManager::GetInstance()->GetConditionInfos(conditions[cId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            //Replace object's name in parameters
            if ( instrInfos.parameters[pNb].type == "object" && conditions[cId].GetParameterSafely(pNb).GetPlainString() == oldName )
                conditions[cId].SetParameter(pNb, GDExpression(newName));
            //Replace object's name in expressions
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                std::string newExpression;
                std::string oldExpression = conditions[cId].GetParameterSafely(pNb).GetPlainString();

                CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

                GDExpressionParser parser(oldExpression);
                if ( parser.ParseMathExpression(game, scene, callbacks) )
                {
                    somethingModified = true;
                    conditions[cId].SetParameter(pNb, GDExpression(newExpression));
                }
            }
            //Replace object's name in text expressions
            else if (instrInfos.parameters[pNb].type == "string" ||instrInfos.parameters[pNb].type == "file" ||instrInfos.parameters[pNb].type == "joyaxis" ||instrInfos.parameters[pNb].type == "color"||instrInfos.parameters[pNb].type == "layer")
            {
                std::string newExpression;
                std::string oldExpression = conditions[cId].GetParameterSafely(pNb).GetPlainString();

                CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

                GDExpressionParser parser(oldExpression);
                if ( parser.ParseMathExpression(game, scene, callbacks) )
                {
                    somethingModified = true;
                    conditions[cId].SetParameter(pNb, GDExpression(newExpression));
                }
            }
        }

        if ( !conditions[cId].GetSubInstructions().empty() )
            somethingModified = RenameObjectInConditions(game, scene, conditions[cId].GetSubInstructions(), oldName, newName) || somethingModified;
    }

    return somethingModified;
}

void EventsRefactorer::RenameObjectInEvents(Game & game, Scene & scene, vector < BaseEventSPtr > & events, std::string oldName, std::string newName)
{
    for (unsigned int i = 0;i<events.size();++i)
    {
        vector < vector<Instruction>* > conditionsVectors =  events[i]->GetAllConditionsVectors();
        for (unsigned int j = 0;j < conditionsVectors.size();++j)
        {
            bool somethingModified = RenameObjectInConditions(game, scene, *conditionsVectors[j], oldName, newName);
            #if defined(GD_IDE_ONLY)
            if ( somethingModified )  events[i]->eventHeightNeedUpdate = true;
            #endif
        }

        vector < vector<Instruction>* > actionsVectors =  events[i]->GetAllActionsVectors();
        for (unsigned int j = 0;j < actionsVectors.size();++j)
        {
            bool somethingModified = RenameObjectInActions(game, scene, *actionsVectors[j], oldName, newName);
            #if defined(GD_IDE_ONLY)
            if ( somethingModified )  events[i]->eventHeightNeedUpdate = true;
            #endif
        }

        if ( events[i]->CanHaveSubEvents() ) RenameObjectInEvents(game, scene, events[i]->GetSubEvents(), oldName, newName);
    }
}

bool EventsRefactorer::RemoveObjectInActions(Game & game, Scene & scene, vector < Instruction > & actions, std::string name)
{
    bool somethingModified = false;

    for (unsigned int aId = 0;aId < actions.size();++aId)
    {
        bool deleteMe = false;

        InstructionInfos instrInfos = GDpriv::ExtensionsManager::GetInstance()->GetActionInfos(actions[aId].GetType());
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
            else if (instrInfos.parameters[pNb].type == "string"||instrInfos.parameters[pNb].type == "file" ||instrInfos.parameters[pNb].type == "joyaxis" ||instrInfos.parameters[pNb].type == "color"||instrInfos.parameters[pNb].type == "layer")
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
            somethingModified = true;
            actions.erase(actions.begin()+aId);
            aId--;
        }
        else if ( !actions[aId].GetSubInstructions().empty() ) somethingModified = RemoveObjectInActions(game, scene, actions[aId].GetSubInstructions(), name) || somethingModified;
    }

    return somethingModified;
}

bool EventsRefactorer::RemoveObjectInConditions(Game & game, Scene & scene, vector < Instruction > & conditions, std::string name)
{
    bool somethingModified = false;

    for (unsigned int cId = 0;cId < conditions.size();++cId)
    {
        bool deleteMe = false;

        InstructionInfos instrInfos = GDpriv::ExtensionsManager::GetInstance()->GetConditionInfos(conditions[cId].GetType());
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
            else if (instrInfos.parameters[pNb].type == "string"||instrInfos.parameters[pNb].type == "file" ||instrInfos.parameters[pNb].type == "joyaxis" ||instrInfos.parameters[pNb].type == "color"||instrInfos.parameters[pNb].type == "layer")
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
            somethingModified = true;
            conditions.erase(conditions.begin()+cId);
            cId--;
        }
        else if ( !conditions[cId].GetSubInstructions().empty() ) somethingModified = RemoveObjectInConditions(game, scene, conditions[cId].GetSubInstructions(), name) || somethingModified;
    }

    return somethingModified;
}

void EventsRefactorer::RemoveObjectInEvents(Game & game, Scene & scene, vector < BaseEventSPtr > & events, std::string name)
{
    for (unsigned int i = 0;i<events.size();++i)
    {
        vector < vector<Instruction>* > conditionsVectors =  events[i]->GetAllConditionsVectors();
        for (unsigned int j = 0;j < conditionsVectors.size();++j)
        {
            bool conditionsModified = RemoveObjectInConditions(game, scene, *conditionsVectors[j], name);
            #if defined(GD_IDE_ONLY)
            if ( conditionsModified ) events[i]->eventHeightNeedUpdate = true;
            #endif
        }

        vector < vector<Instruction>* > actionsVectors =  events[i]->GetAllActionsVectors();
        for (unsigned int j = 0;j < actionsVectors.size();++j)
        {
            bool actionsModified = RemoveObjectInActions(game, scene, *actionsVectors[j], name);
            #if defined(GD_IDE_ONLY)
            if ( actionsModified ) events[i]->eventHeightNeedUpdate = true;
            #endif
        }

        if ( events[i]->CanHaveSubEvents() ) RemoveObjectInEvents(game, scene, events[i]->GetSubEvents(), name);
    }
}

void EventsRefactorer::ReplaceStringInEvents(Game & game, Scene & scene, std::vector < BaseEventSPtr > & events,
                                              std::string toReplace,
                                              std::string newString,
                                              bool matchCase,
                                              bool inConditions,
                                              bool inActions)
{
    for (unsigned int i = 0;i<events.size();++i)
    {
        if ( inConditions )
        {
            vector < vector<Instruction>* > conditionsVectors =  events[i]->GetAllConditionsVectors();
            for (unsigned int j = 0;j < conditionsVectors.size();++j)
            {
                bool conditionsModified = ReplaceStringInConditions(game, scene, *conditionsVectors[j], toReplace, newString, matchCase);
                #if defined(GD_IDE_ONLY)
                if ( conditionsModified ) events[i]->eventHeightNeedUpdate = true;
                #endif
            }
        }

        if ( inActions )
        {
            vector < vector<Instruction>* > actionsVectors =  events[i]->GetAllActionsVectors();
            for (unsigned int j = 0;j < actionsVectors.size();++j)
            {
                bool actionsModified = ReplaceStringInActions(game, scene, *actionsVectors[j], toReplace, newString, matchCase);
                #if defined(GD_IDE_ONLY)
                if ( actionsModified ) events[i]->eventHeightNeedUpdate = true;
                #endif
            }
        }

        if ( events[i]->CanHaveSubEvents() ) ReplaceStringInEvents(game, scene, events[i]->GetSubEvents(), toReplace, newString, matchCase, inConditions, inActions);
    }
}

std::string ReplaceAllOccurences(string context, const string& from, const string& to)
{
    size_t lookHere = 0;
    size_t foundHere;
    while((foundHere = context.find(from, lookHere)) != string::npos)
    {
          context.replace(foundHere, from.size(), to);
          lookHere = foundHere + to.size();
    }

    return context;
}

std::string ReplaceAllOccurencesCaseUnsensitive(string context, string from, const string& to)
{
    boost::to_upper(from);

    size_t lookHere = 0;
    size_t foundHere;
    while((foundHere = boost::to_upper_copy(context).find(from, lookHere)) != string::npos)
    {
          context.replace(foundHere, from.size(), to);
          lookHere = foundHere + to.size();
    }

    return context;
}

bool EventsRefactorer::ReplaceStringInActions(Game & game, Scene & scene, vector < Instruction > & actions, std::string toReplace, std::string newString, bool matchCase)
{
    bool somethingModified = false;

    for (unsigned int aId = 0;aId < actions.size();++aId)
    {
        for (unsigned int pNb = 0;pNb < actions[aId].GetParameters().size();++pNb)
        {
            std::string newParameter = matchCase ? ReplaceAllOccurences(actions[aId].GetParameterSafely(pNb).GetPlainString(), toReplace, newString)
                                                 : ReplaceAllOccurencesCaseUnsensitive(actions[aId].GetParameterSafely(pNb).GetPlainString(), toReplace, newString);

            if ( newParameter != actions[aId].GetParameterSafely(pNb).GetPlainString())
            {
                actions[aId].SetParameter(pNb, GDExpression(newParameter));
                somethingModified = true;
                #if defined(GD_IDE_ONLY)
                actions[aId].renderedHeightNeedUpdate = true;
                #endif
            }
        }

        if ( !actions[aId].GetSubInstructions().empty() ) ReplaceStringInActions(game, scene, actions[aId].GetSubInstructions(), toReplace, newString, matchCase);
    }

    return somethingModified;
}

bool EventsRefactorer::ReplaceStringInConditions(Game & game, Scene & scene, vector < Instruction > & conditions, std::string toReplace, std::string newString, bool matchCase)
{
    bool somethingModified = false;

    for (unsigned int cId = 0;cId < conditions.size();++cId)
    {
        for (unsigned int pNb = 0;pNb < conditions[cId].GetParameters().size();++pNb)
        {
            std::string newParameter = matchCase ? ReplaceAllOccurences(conditions[cId].GetParameterSafely(pNb).GetPlainString(), toReplace, newString)
                                                 : ReplaceAllOccurencesCaseUnsensitive(conditions[cId].GetParameterSafely(pNb).GetPlainString(), toReplace, newString);

            if ( newParameter != conditions[cId].GetParameterSafely(pNb).GetPlainString())
            {
                conditions[cId].SetParameter(pNb, GDExpression(newParameter));
                somethingModified = true;
                #if defined(GD_IDE_ONLY)
                conditions[cId].renderedHeightNeedUpdate = true;
                #endif
            }
        }

        if ( !conditions[cId].GetSubInstructions().empty() ) ReplaceStringInConditions(game, scene, conditions[cId].GetSubInstructions(), toReplace, newString, matchCase);
    }

    return somethingModified;
}

vector < boost::weak_ptr<BaseEvent> > EventsRefactorer::SearchInEvents(Game & game, Scene & scene, std::vector < BaseEventSPtr > & events,
                                  std::string search,
                                  bool matchCase,
                                  bool inConditions,
                                  bool inActions)
{
    vector < boost::weak_ptr<BaseEvent> > results;

    for (unsigned int i = 0;i<events.size();++i)
    {
        bool eventAddedInResults = false;

        if ( inConditions )
        {
            vector < vector<Instruction>* > conditionsVectors =  events[i]->GetAllConditionsVectors();
            for (unsigned int j = 0;j < conditionsVectors.size();++j)
            {
                if (!eventAddedInResults && SearchStringInConditions(game, scene, *conditionsVectors[j], search, matchCase))
                {
                    results.push_back(boost::weak_ptr<BaseEvent>(events[i]));
                }
            }
        }

        if ( inActions )
        {
            vector < vector<Instruction>* > actionsVectors =  events[i]->GetAllActionsVectors();
            for (unsigned int j = 0;j < actionsVectors.size();++j)
            {
                if (!eventAddedInResults && SearchStringInActions(game, scene, *actionsVectors[j], search, matchCase))
                {
                    results.push_back(boost::weak_ptr<BaseEvent>(events[i]));
                }
            }
        }

        if ( events[i]->CanHaveSubEvents() )
        {
            vector < boost::weak_ptr<BaseEvent> > subResults = SearchInEvents(game, scene, events[i]->GetSubEvents(), search, matchCase, inConditions, inActions);
            std::copy(subResults.begin(), subResults.end(), std::back_inserter(results));
        }
    }

    return results;
}

bool EventsRefactorer::SearchStringInActions(Game & game, Scene & scene, vector < Instruction > & actions, std::string search, bool matchCase)
{
    if ( !matchCase ) boost::to_upper(search);

    for (unsigned int aId = 0;aId < actions.size();++aId)
    {
        for (unsigned int pNb = 0;pNb < actions[aId].GetParameters().size();++pNb)
        {
            size_t foundPosition = matchCase ? actions[aId].GetParameterSafely(pNb).GetPlainString().find(search) :
                                     boost::to_upper_copy(actions[aId].GetParameterSafely(pNb).GetPlainString()).find(search);

            if ( foundPosition != std::string::npos ) return true;
        }

        if ( !actions[aId].GetSubInstructions().empty() && SearchStringInActions(game, scene, actions[aId].GetSubInstructions(), search, matchCase) )
            return true;
    }

    return false;
}

bool EventsRefactorer::SearchStringInConditions(Game & game, Scene & scene, vector < Instruction > & conditions, std::string search, bool matchCase)
{
    if ( !matchCase ) boost::to_upper(search);

    for (unsigned int cId = 0;cId < conditions.size();++cId)
    {
        for (unsigned int pNb = 0;pNb < conditions[cId].GetParameters().size();++pNb)
        {
            size_t foundPosition = matchCase ? conditions[cId].GetParameterSafely(pNb).GetPlainString().find(search) :
                                     boost::to_upper_copy(conditions[cId].GetParameterSafely(pNb).GetPlainString()).find(search);

            if ( foundPosition != std::string::npos ) return true;
        }

        if ( !conditions[cId].GetSubInstructions().empty() && SearchStringInConditions(game, scene, conditions[cId].GetSubInstructions(), search, matchCase) )
            return true;
    }

    return false;
}

void EventsRefactorer::NotifyChangesInEventsOfScene(Game & game, Scene & scene)
{
    scene.eventsModified = true; //Notify that events have changed in the scene

    //Notify others scenes, which include the changed scene ( even indirectly ), that their events has changed
    for (unsigned int i = 0;i<game.scenes.size();++i)
    {
        if ( game.scenes[i].get() == &scene ) continue;

        std::vector< boost::shared_ptr<Scene> > linkedScenes;
        std::vector< boost::shared_ptr<ExternalEvents> > notUsed;

        GetScenesAndExternalEventsLinkedTo(game.scenes[i]->events, game, linkedScenes, notUsed);

        if( find_if(linkedScenes.begin(), linkedScenes.end(), bind2nd(SceneHasName(), scene.GetName())) != linkedScenes.end() )
            game.scenes[i]->eventsModified = true;
    }
}

void EventsRefactorer::NotifyChangesInEventsOfExternalEvents(Game & game, ExternalEvents & externalEvents)
{
    //Notify scenes, which include the external events ( even indirectly ), that their events has changed
    for (unsigned int i = 0;i<game.scenes.size();++i)
    {
        std::vector< boost::shared_ptr<Scene> > notUsed;
        std::vector< boost::shared_ptr<ExternalEvents> > linkedExternalEvents;

        GetScenesAndExternalEventsLinkedTo(game.scenes[i]->events, game, notUsed, linkedExternalEvents);

        if( find_if(linkedExternalEvents.begin(), linkedExternalEvents.end(), bind2nd(ExternalEventsHasName(), externalEvents.GetName())) != linkedExternalEvents.end())
            game.scenes[i]->eventsModified = true;
    }
}

void EventsRefactorer::GetScenesAndExternalEventsLinkedTo(const std::vector< boost::shared_ptr<BaseEvent> > & events, Game & game, std::vector< boost::shared_ptr<Scene> > & scenes, std::vector< boost::shared_ptr<ExternalEvents> > & externalEvents)
{
    for (unsigned int i = 0;i<events.size();++i)
    {
        boost::shared_ptr<LinkEvent> linkEvent = boost::dynamic_pointer_cast<LinkEvent>(events[i]);
        if ( linkEvent != boost::shared_ptr<LinkEvent>() )
        {
            //We've got a link event, search now linked scene/external events
            vector< boost::shared_ptr<Scene> >::iterator linkedScene =
                find_if(game.scenes.begin(), game.scenes.end(), bind2nd(SceneHasName(), linkEvent->sceneLinked));

            vector< boost::shared_ptr<ExternalEvents> >::iterator linkedExternalEvents =
                find_if(game.externalEvents.begin(), game.externalEvents.end(), bind2nd(ExternalEventsHasName(), linkEvent->sceneLinked));

            if ( linkedExternalEvents != game.externalEvents.end() )
            {
                //Protect against circular references
                if ( find(externalEvents.begin(), externalEvents.end(), *linkedExternalEvents) == externalEvents.end() )
                {
                    externalEvents.push_back(*linkedExternalEvents);
                    GetScenesAndExternalEventsLinkedTo((*linkedExternalEvents)->events, game, scenes, externalEvents);
                }
            }
            else if ( linkedScene != game.scenes.end() )
            {
                //Protect against circular references
                if ( find(scenes.begin(), scenes.end(), *linkedScene) == scenes.end() )
                {
                    scenes.push_back(*linkedScene);
                    GetScenesAndExternalEventsLinkedTo((*linkedScene)->events, game, scenes, externalEvents);
                }
            }
        }

        if ( events[i]->CanHaveSubEvents() )
            GetScenesAndExternalEventsLinkedTo(events[i]->GetSubEvents(), game, scenes, externalEvents);
    }
}
