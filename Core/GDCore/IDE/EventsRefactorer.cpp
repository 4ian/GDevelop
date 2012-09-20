/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include <boost/algorithm/string.hpp>
#include <boost/weak_ptr.hpp>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/ExpressionParser.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/InstructionsMetadataHolder.h"
#include "GDCore/IDE/EventsRefactorer.h"

using namespace std;

namespace gd
{

class CallbacksForRenamingObject : public gd::ParserCallbacks
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

    virtual void OnStaticFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
    {
        std::string parametersStr;
        for (unsigned int i = 0;i<parameters.size();++i)
        {
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].codeOnly )
                continue; //Skip code only parameter which are not included in function calls.

            if ( !parametersStr.empty() ) parametersStr += ",";
            parametersStr += parameters[i].GetPlainString();
        }
        plainExpression += functionName+"("+parametersStr+")";
    };

    virtual void OnStaticFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo)
    {
        //Special case : Function without name is a litteral string.
        if ( functionName.empty() )
        {
            if ( parameters.empty() ) return;
            plainExpression += "\""+parameters[0].GetPlainString()+"\"";

            return;
        }

        std::string parametersStr;
        for (unsigned int i = 0;i<parameters.size();++i)
        {
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].codeOnly )
                continue; //Skip code only parameter which are not included in function calls.

            if ( !parametersStr.empty() ) parametersStr += ",";
            parametersStr += parameters[i].GetPlainString();
        }
        plainExpression += functionName+"("+parametersStr+")";
    };

    virtual void OnObjectFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
    {
        if ( parameters.empty() ) return;

        std::string parametersStr;
        for (unsigned int i = 1;i<parameters.size();++i)
        {
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].codeOnly )
                continue; //Skip code only parameter which are not included in function calls.

            if ( !parametersStr.empty() ) parametersStr += ",";
            parametersStr += parameters[i].GetPlainString();
        }
        plainExpression += (parameters[0].GetPlainString() == oldName ? newName : parameters[0].GetPlainString())
                               +"."+functionName+"("+parametersStr+")";
    };

    virtual void OnObjectFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo)
    {
        if ( parameters.empty() ) return;

        std::string parametersStr;
        for (unsigned int i = 1;i<parameters.size();++i)
        {
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].codeOnly )
                continue; //Skip code only parameter which are not included in function calls.

            if ( !parametersStr.empty() ) parametersStr += ",";
            parametersStr += parameters[i].GetPlainString();
        }
        plainExpression += (parameters[0].GetPlainString() == oldName ? newName : parameters[0].GetPlainString())
                               +"."+functionName+"("+parametersStr+")";
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
    {
        if ( parameters.size() < 2 ) return;

        std::string parametersStr;
        for (unsigned int i = 2;i<parameters.size();++i)
        {
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].codeOnly )
                continue; //Skip code only parameter which are not included in function calls.

            if ( !parametersStr.empty() ) parametersStr += ",";
            parametersStr += parameters[i].GetPlainString();
        }
        plainExpression += (parameters[0].GetPlainString() == oldName ? newName : parameters[0].GetPlainString())
                               +"."+parameters[1].GetPlainString()+"::"+functionName+"("+parametersStr+")";
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo)
    {
        if ( parameters.size() < 2 ) return;

        std::string parametersStr;
        for (unsigned int i = 2;i<parameters.size();++i)
        {
            if ( i < expressionInfo.parameters.size() && expressionInfo.parameters[i].codeOnly )
                continue; //Skip code only parameter which are not included in function calls.

            if ( !parametersStr.empty() ) parametersStr += ",";
            parametersStr += parameters[i].GetPlainString();
        }
        plainExpression += (parameters[0].GetPlainString() == oldName ? newName : parameters[0].GetPlainString())
                               +"."+parameters[1].GetPlainString()+"::"+functionName+"("+parametersStr+")";
    };

    virtual bool OnSubMathExpression(const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
    {
        std::string newExpression;

        CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

        gd::ExpressionParser parser(expression.GetPlainString());
        if ( !parser.ParseMathExpression(project, layout, callbacks) )
            return false;

        expression = gd::Expression(newExpression);
        return true;
    }

    virtual bool OnSubTextExpression(const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
    {
        std::string newExpression;

        CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

        gd::ExpressionParser parser(expression.GetPlainString());
        if ( !parser.ParseStringExpression(project, layout, callbacks) )
            return false;

        expression = gd::Expression(newExpression);
        return true;
    }


    private :
        std::string & plainExpression;
        std::string newName;
        std::string oldName;
};

class CallbacksForRemovingObject : public gd::ParserCallbacks
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

    virtual void OnStaticFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
    {
    };

    virtual void OnStaticFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo)
    {
    };

    virtual void OnObjectFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
    {
        if ( parameters.empty() ) return;

        if ( parameters[0].GetPlainString() == name ) objectPresent = true;
    };

    virtual void OnObjectFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo)
    {
        if ( parameters.empty() ) return;

        if ( parameters[0].GetPlainString() == name ) objectPresent = true;
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo)
    {
        if ( parameters.empty() ) return;

        if ( parameters[0].GetPlainString() == name ) objectPresent = true;
    };

    virtual void OnObjectAutomatismFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo)
    {
        if ( parameters.empty() ) return;

        if ( parameters[0].GetPlainString() == name ) objectPresent = true;
    };

    virtual bool OnSubMathExpression(const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
    {
        CallbacksForRemovingObject callbacks(name);

        gd::ExpressionParser parser(expression.GetPlainString());
        if ( !parser.ParseMathExpression(project, layout, callbacks) )
            return false;

        if(callbacks.objectPresent) objectPresent = true;
        return true;
    }

    virtual bool OnSubTextExpression(const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
    {
        CallbacksForRemovingObject callbacks(name);

        gd::ExpressionParser parser(expression.GetPlainString());
        if ( !parser.ParseStringExpression(project, layout, callbacks) )
            return false;

        if(callbacks.objectPresent) objectPresent = true;
        return true;
    }


    private :
        std::string name;
};

bool EventsRefactorer::RenameObjectInActions(gd::Project & project, gd::Layout & layout, vector < gd::Instruction > & actions, std::string oldName, std::string newName)
{
    bool somethingModified = false;

    for (unsigned int aId = 0;aId < actions.size();++aId)
    {
        gd::InstructionMetadata instrInfos = project.GetPlatform().GetInstructionsMetadataHolder().GetActionMetadata(actions[aId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            //Replace object's name in parameters
            if ( instrInfos.parameters[pNb].type == "object" && actions[aId].GetParameter(pNb).GetPlainString() == oldName )
                actions[aId].SetParameter(pNb, gd::Expression(newName));
            //Replace object's name in expressions
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                std::string newExpression;
                std::string oldExpression = actions[aId].GetParameter(pNb).GetPlainString();

                CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

                gd::ExpressionParser parser(oldExpression);
                if ( parser.ParseMathExpression(project, layout, callbacks) && newExpression != oldExpression )
                {
                    somethingModified = true;
                    actions[aId].SetParameter(pNb, gd::Expression(newExpression));
                }
            }
            //Replace object's name in text expressions
            else if (instrInfos.parameters[pNb].type == "string"||instrInfos.parameters[pNb].type == "file" ||instrInfos.parameters[pNb].type == "joyaxis" ||instrInfos.parameters[pNb].type == "color"||instrInfos.parameters[pNb].type == "layer")
            {
                std::string newExpression;
                std::string oldExpression = actions[aId].GetParameter(pNb).GetPlainString();

                CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

                gd::ExpressionParser parser(oldExpression);
                if ( parser.ParseStringExpression(project, layout, callbacks) && newExpression != oldExpression )
                {
                    somethingModified = true;
                    actions[aId].SetParameter(pNb, gd::Expression(newExpression));
                }
            }
        }

        if ( !actions[aId].GetSubInstructions().empty() )
            somethingModified = RenameObjectInActions(project, layout, actions[aId].GetSubInstructions(), oldName, newName) || somethingModified;
    }

    return somethingModified;
}

bool EventsRefactorer::RenameObjectInConditions(gd::Project & project, gd::Layout & layout, vector < gd::Instruction > & conditions, std::string oldName, std::string newName)
{
    bool somethingModified = false;

    for (unsigned int cId = 0;cId < conditions.size();++cId)
    {
        gd::InstructionMetadata instrInfos = project.GetPlatform().GetInstructionsMetadataHolder().GetConditionMetadata(conditions[cId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            //Replace object's name in parameters
            if ( instrInfos.parameters[pNb].type == "object" && conditions[cId].GetParameter(pNb).GetPlainString() == oldName )
                conditions[cId].SetParameter(pNb, gd::Expression(newName));
            //Replace object's name in expressions
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                std::string newExpression;
                std::string oldExpression = conditions[cId].GetParameter(pNb).GetPlainString();

                CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

                gd::ExpressionParser parser(oldExpression);
                if ( parser.ParseMathExpression(project, layout, callbacks) )
                {
                    somethingModified = true;
                    conditions[cId].SetParameter(pNb, gd::Expression(newExpression));
                }
            }
            //Replace object's name in text expressions
            else if (instrInfos.parameters[pNb].type == "string" ||instrInfos.parameters[pNb].type == "file" ||instrInfos.parameters[pNb].type == "joyaxis" ||instrInfos.parameters[pNb].type == "color"||instrInfos.parameters[pNb].type == "layer")
            {
                std::string newExpression;
                std::string oldExpression = conditions[cId].GetParameter(pNb).GetPlainString();

                CallbacksForRenamingObject callbacks(newExpression, oldName, newName);

                gd::ExpressionParser parser(oldExpression);
                if ( parser.ParseMathExpression(project, layout, callbacks) )
                {
                    somethingModified = true;
                    conditions[cId].SetParameter(pNb, gd::Expression(newExpression));
                }
            }
        }

        if ( !conditions[cId].GetSubInstructions().empty() )
            somethingModified = RenameObjectInConditions(project, layout, conditions[cId].GetSubInstructions(), oldName, newName) || somethingModified;
    }

    return somethingModified;
}

void EventsRefactorer::RenameObjectInEvents(gd::Project & project, gd::Layout & layout, vector < gd::BaseEventSPtr > & events, std::string oldName, std::string newName)
{
    for (unsigned int i = 0;i<events.size();++i)
    {
        vector < vector<gd::Instruction>* > conditionsVectors =  events[i]->GetAllConditionsVectors();
        for (unsigned int j = 0;j < conditionsVectors.size();++j)
        {
            bool somethingModified = RenameObjectInConditions(project, layout, *conditionsVectors[j], oldName, newName);
            #if defined(GD_IDE_ONLY)
            if ( somethingModified )  events[i]->eventHeightNeedUpdate = true;
            #endif
        }

        vector < vector<gd::Instruction>* > actionsVectors =  events[i]->GetAllActionsVectors();
        for (unsigned int j = 0;j < actionsVectors.size();++j)
        {
            bool somethingModified = RenameObjectInActions(project, layout, *actionsVectors[j], oldName, newName);
            #if defined(GD_IDE_ONLY)
            if ( somethingModified )  events[i]->eventHeightNeedUpdate = true;
            #endif
        }

        if ( events[i]->CanHaveSubEvents() ) RenameObjectInEvents(project, layout, events[i]->GetSubEvents(), oldName, newName);
    }
}

bool EventsRefactorer::RemoveObjectInActions(gd::Project & project, gd::Layout & layout, vector < gd::Instruction > & actions, std::string name)
{
    bool somethingModified = false;

    for (unsigned int aId = 0;aId < actions.size();++aId)
    {
        bool deleteMe = false;

        gd::InstructionMetadata instrInfos = project.GetPlatform().GetInstructionsMetadataHolder().GetActionMetadata(actions[aId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            //Replace object's name in parameters
            if ( instrInfos.parameters[pNb].type == "object" && actions[aId].GetParameter(pNb).GetPlainString() == name )
            {
                deleteMe = true;
                break;
            }
            //Replace object's name in expressions
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                CallbacksForRemovingObject callbacks(name);

                gd::ExpressionParser parser(actions[aId].GetParameter(pNb).GetPlainString());
                if ( parser.ParseMathExpression(project, layout, callbacks) && callbacks.objectPresent )
                {
                    deleteMe = true;
                    break;
                }
            }
            //Replace object's name in text expressions
            else if (instrInfos.parameters[pNb].type == "string"||instrInfos.parameters[pNb].type == "file" ||instrInfos.parameters[pNb].type == "joyaxis" ||instrInfos.parameters[pNb].type == "color"||instrInfos.parameters[pNb].type == "layer")
            {
                CallbacksForRemovingObject callbacks(name);

                gd::ExpressionParser parser(actions[aId].GetParameter(pNb).GetPlainString());
                if ( parser.ParseStringExpression(project, layout, callbacks) && callbacks.objectPresent )
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
        else if ( !actions[aId].GetSubInstructions().empty() ) somethingModified = RemoveObjectInActions(project, layout, actions[aId].GetSubInstructions(), name) || somethingModified;
    }

    return somethingModified;
}

bool EventsRefactorer::RemoveObjectInConditions(gd::Project & project, gd::Layout & layout, vector < gd::Instruction > & conditions, std::string name)
{
    bool somethingModified = false;

    for (unsigned int cId = 0;cId < conditions.size();++cId)
    {
        bool deleteMe = false;

        gd::InstructionMetadata instrInfos = project.GetPlatform().GetInstructionsMetadataHolder().GetConditionMetadata(conditions[cId].GetType());
        for (unsigned int pNb = 0;pNb < instrInfos.parameters.size();++pNb)
        {
            //Replace object's name in parameters
            if ( instrInfos.parameters[pNb].type == "object" && conditions[cId].GetParameter(pNb).GetPlainString() == name )
            {
                deleteMe = true; break;
            }
            //Replace object's name in expressions
            else if (instrInfos.parameters[pNb].type == "expression")
            {
                CallbacksForRemovingObject callbacks(name);

                gd::ExpressionParser parser(conditions[cId].GetParameter(pNb).GetPlainString());
                if ( parser.ParseMathExpression(project, layout, callbacks) && callbacks.objectPresent )
                {
                    deleteMe = true;
                    break;
                }
            }
            //Replace object's name in text expressions
            else if (instrInfos.parameters[pNb].type == "string"||instrInfos.parameters[pNb].type == "file" ||instrInfos.parameters[pNb].type == "joyaxis" ||instrInfos.parameters[pNb].type == "color"||instrInfos.parameters[pNb].type == "layer")
            {
                CallbacksForRemovingObject callbacks(name);

                gd::ExpressionParser parser(conditions[cId].GetParameter(pNb).GetPlainString());
                if ( parser.ParseStringExpression(project, layout, callbacks) && callbacks.objectPresent )
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
        else if ( !conditions[cId].GetSubInstructions().empty() ) somethingModified = RemoveObjectInConditions(project, layout, conditions[cId].GetSubInstructions(), name) || somethingModified;
    }

    return somethingModified;
}

void EventsRefactorer::RemoveObjectInEvents(gd::Project & project, gd::Layout & layout, vector < gd::BaseEventSPtr > & events, std::string name)
{
    for (unsigned int i = 0;i<events.size();++i)
    {
        vector < vector<gd::Instruction>* > conditionsVectors =  events[i]->GetAllConditionsVectors();
        for (unsigned int j = 0;j < conditionsVectors.size();++j)
        {
            bool conditionsModified = RemoveObjectInConditions(project, layout, *conditionsVectors[j], name);
            #if defined(GD_IDE_ONLY)
            if ( conditionsModified ) events[i]->eventHeightNeedUpdate = true;
            #endif
        }

        vector < vector<gd::Instruction>* > actionsVectors =  events[i]->GetAllActionsVectors();
        for (unsigned int j = 0;j < actionsVectors.size();++j)
        {
            bool actionsModified = RemoveObjectInActions(project, layout, *actionsVectors[j], name);
            #if defined(GD_IDE_ONLY)
            if ( actionsModified ) events[i]->eventHeightNeedUpdate = true;
            #endif
        }

        if ( events[i]->CanHaveSubEvents() ) RemoveObjectInEvents(project, layout, events[i]->GetSubEvents(), name);
    }
}

void EventsRefactorer::ReplaceStringInEvents(gd::Project & project, gd::Layout & layout, std::vector < gd::BaseEventSPtr > & events,
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
            vector < vector<gd::Instruction>* > conditionsVectors =  events[i]->GetAllConditionsVectors();
            for (unsigned int j = 0;j < conditionsVectors.size();++j)
            {
                bool conditionsModified = ReplaceStringInConditions(project, layout, *conditionsVectors[j], toReplace, newString, matchCase);
                #if defined(GD_IDE_ONLY)
                if ( conditionsModified ) events[i]->eventHeightNeedUpdate = true;
                #endif
            }
        }

        if ( inActions )
        {
            vector < vector<gd::Instruction>* > actionsVectors =  events[i]->GetAllActionsVectors();
            for (unsigned int j = 0;j < actionsVectors.size();++j)
            {
                bool actionsModified = ReplaceStringInActions(project, layout, *actionsVectors[j], toReplace, newString, matchCase);
                #if defined(GD_IDE_ONLY)
                if ( actionsModified ) events[i]->eventHeightNeedUpdate = true;
                #endif
            }
        }

        if ( events[i]->CanHaveSubEvents() ) ReplaceStringInEvents(project, layout, events[i]->GetSubEvents(), toReplace, newString, matchCase, inConditions, inActions);
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

bool EventsRefactorer::ReplaceStringInActions(gd::Project & project, gd::Layout & layout, vector < gd::Instruction > & actions, std::string toReplace, std::string newString, bool matchCase)
{
    bool somethingModified = false;

    for (unsigned int aId = 0;aId < actions.size();++aId)
    {
        for (unsigned int pNb = 0;pNb < actions[aId].GetParameters().size();++pNb)
        {
            std::string newParameter = matchCase ? ReplaceAllOccurences(actions[aId].GetParameter(pNb).GetPlainString(), toReplace, newString)
                                                 : ReplaceAllOccurencesCaseUnsensitive(actions[aId].GetParameter(pNb).GetPlainString(), toReplace, newString);

            if ( newParameter != actions[aId].GetParameter(pNb).GetPlainString())
            {
                actions[aId].SetParameter(pNb, gd::Expression(newParameter));
                somethingModified = true;
                #if defined(GD_IDE_ONLY)
                actions[aId].renderedHeightNeedUpdate = true;
                #endif
            }
        }

        if ( !actions[aId].GetSubInstructions().empty() ) ReplaceStringInActions(project, layout, actions[aId].GetSubInstructions(), toReplace, newString, matchCase);
    }

    return somethingModified;
}

bool EventsRefactorer::ReplaceStringInConditions(gd::Project & project, gd::Layout & layout, vector < gd::Instruction > & conditions, std::string toReplace, std::string newString, bool matchCase)
{
    bool somethingModified = false;

    for (unsigned int cId = 0;cId < conditions.size();++cId)
    {
        for (unsigned int pNb = 0;pNb < conditions[cId].GetParameters().size();++pNb)
        {
            std::string newParameter = matchCase ? ReplaceAllOccurences(conditions[cId].GetParameter(pNb).GetPlainString(), toReplace, newString)
                                                 : ReplaceAllOccurencesCaseUnsensitive(conditions[cId].GetParameter(pNb).GetPlainString(), toReplace, newString);

            if ( newParameter != conditions[cId].GetParameter(pNb).GetPlainString())
            {
                conditions[cId].SetParameter(pNb, gd::Expression(newParameter));
                somethingModified = true;
                #if defined(GD_IDE_ONLY)
                conditions[cId].renderedHeightNeedUpdate = true;
                #endif
            }
        }

        if ( !conditions[cId].GetSubInstructions().empty() ) ReplaceStringInConditions(project, layout, conditions[cId].GetSubInstructions(), toReplace, newString, matchCase);
    }

    return somethingModified;
}

vector < EventsSearchResult > EventsRefactorer::SearchInEvents(gd::Project & project, gd::Layout & layout, std::vector < gd::BaseEventSPtr > & events,
                                  std::string search,
                                  bool matchCase,
                                  bool inConditions,
                                  bool inActions)
{
    vector < EventsSearchResult > results;

    for (unsigned int i = 0;i<events.size();++i)
    {
        bool eventAddedInResults = false;

        if ( inConditions )
        {
            vector < vector<gd::Instruction>* > conditionsVectors =  events[i]->GetAllConditionsVectors();
            for (unsigned int j = 0;j < conditionsVectors.size();++j)
            {
                if (!eventAddedInResults && SearchStringInConditions(project, layout, *conditionsVectors[j], search, matchCase))
                {
                    results.push_back(EventsSearchResult(boost::weak_ptr<gd::BaseEvent>(events[i]), &events, i));
                }
            }
        }

        if ( inActions )
        {
            vector < vector<gd::Instruction>* > actionsVectors =  events[i]->GetAllActionsVectors();
            for (unsigned int j = 0;j < actionsVectors.size();++j)
            {
                if (!eventAddedInResults && SearchStringInActions(project, layout, *actionsVectors[j], search, matchCase))
                {
                    results.push_back(EventsSearchResult(boost::weak_ptr<gd::BaseEvent>(events[i]), &events, i));
                }
            }
        }

        if ( events[i]->CanHaveSubEvents() )
        {
            vector < EventsSearchResult > subResults = SearchInEvents(project, layout, events[i]->GetSubEvents(), search, matchCase, inConditions, inActions);
            std::copy(subResults.begin(), subResults.end(), std::back_inserter(results));
        }
    }

    return results;
}

bool EventsRefactorer::SearchStringInActions(gd::Project & project, gd::Layout & layout, vector < gd::Instruction > & actions, std::string search, bool matchCase)
{
    if ( !matchCase ) boost::to_upper(search);

    for (unsigned int aId = 0;aId < actions.size();++aId)
    {
        for (unsigned int pNb = 0;pNb < actions[aId].GetParameters().size();++pNb)
        {
            size_t foundPosition = matchCase ? actions[aId].GetParameter(pNb).GetPlainString().find(search) :
                                     boost::to_upper_copy(actions[aId].GetParameter(pNb).GetPlainString()).find(search);

            if ( foundPosition != std::string::npos ) return true;
        }

        if ( !actions[aId].GetSubInstructions().empty() && SearchStringInActions(project, layout, actions[aId].GetSubInstructions(), search, matchCase) )
            return true;
    }

    return false;
}

bool EventsRefactorer::SearchStringInConditions(gd::Project & project, gd::Layout & layout, vector < gd::Instruction > & conditions, std::string search, bool matchCase)
{
    if ( !matchCase ) boost::to_upper(search);

    for (unsigned int cId = 0;cId < conditions.size();++cId)
    {
        for (unsigned int pNb = 0;pNb < conditions[cId].GetParameters().size();++pNb)
        {
            size_t foundPosition = matchCase ? conditions[cId].GetParameter(pNb).GetPlainString().find(search) :
                                     boost::to_upper_copy(conditions[cId].GetParameter(pNb).GetPlainString()).find(search);

            if ( foundPosition != std::string::npos ) return true;
        }

        if ( !conditions[cId].GetSubInstructions().empty() && SearchStringInConditions(project, layout, conditions[cId].GetSubInstructions(), search, matchCase) )
            return true;
    }

    return false;
}

EventsSearchResult::EventsSearchResult(boost::weak_ptr<gd::BaseEvent> event_, std::vector<boost::shared_ptr<gd::BaseEvent> > * eventsList_, unsigned int positionInList_ ) :
    event(event_),
    eventsList(eventsList_),
    positionInList(positionInList_)
{

}

EventsSearchResult::EventsSearchResult() :
    eventsList(NULL),
    positionInList(0)
{

}

}
