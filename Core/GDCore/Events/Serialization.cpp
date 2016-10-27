/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/Project/Project.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/CommonTools.h"

using namespace std;

namespace gd
{

void EventsListSerialization::UpdateInstructionsFromGD31x(gd::Project & project, gd::InstructionsList & list, bool instructionsAreActions)
{
    for (std::size_t i = 0;i<list.size();++i)
    {
        gd::Instruction & instr = list[i];

        if (instr.GetType() == "VarScene" ||
            instr.GetType() == "VarSceneTxt" ||
            instr.GetType() == "VarGlobal" ||
            instr.GetType() == "VarGlobalTxt" ||
            instr.GetType() == "ModVarScene" ||
            instr.GetType() == "ModVarSceneTxt" ||
            instr.GetType() == "ModVarGlobal" ||
            instr.GetType() == "ModVarGlobalTxt" )
        {
            std::vector< gd::Expression > parameters = instr.GetParameters();
            if ( parameters.size() >= 1 ) parameters.erase(parameters.begin()+0);
            instr.SetParameters(parameters);
        }

        if (instr.GetType() == "VarSceneDef" ||
            instr.GetType() == "VarGlobalDef" ||
            instr.GetType() == "VarObjetDef" )
        {
            instr.SetParameter(1, gd::Expression("\""+instr.GetParameter(1).GetPlainString()+"\""));
        }

        //UpdateInstructionsFromGD31x(project, instr.GetSubInstructions(), instructionsAreActions);
    }
}

void EventsListSerialization::UpdateInstructionsFromGD2x(gd::Project & project, gd::InstructionsList & list, bool instructionsAreActions)
{
    for (std::size_t i = 0;i<list.size();++i)
    {
        gd::Instruction & instr = list[i];

        const gd::InstructionMetadata & metadata = instructionsAreActions ?
                                             MetadataProvider::GetActionMetadata(project.GetCurrentPlatform(), instr.GetType()) :
                                             MetadataProvider::GetConditionMetadata(project.GetCurrentPlatform(), instr.GetType());

        //Specific updates for some instructions
        if ( instr.GetType() == "LinkedObjects::LinkObjects" || instr.GetType() == "LinkedObjects::RemoveLinkBetween" )
        {
            instr.SetParameter(1, instr.GetParameter(3));
            instr.SetParameter(2, instr.GetParameter(4));
        }
        else if (instr.GetType() == "LinkedObjects::RemoveAllLinksOf")
        {
            instr.SetParameter(1, instr.GetParameter(2));
        }
        else if (instr.GetType() == "LinkedObjects::PickObjectsLinkedTo")
        {
            instr.SetParameter(1, instr.GetParameter(5));
            instr.SetParameter(2, instr.GetParameter(3));
        }
        else if (instr.GetType() == "PhysicsBehavior::AddRevoluteJointBetweenObjects")
        {
            instr.SetParameter(4, instr.GetParameter(5));
            instr.SetParameter(5, instr.GetParameter(6));
        }
        else if (instr.GetType() == "FixCamera" || instr.GetType() == "CentreCamera")
        {
            std::vector< gd::Expression > parameters = instr.GetParameters();
            if ( parameters.size() >= 3 ) parameters.erase(parameters.begin()+2);
            instr.SetParameters(parameters);
        }
        else if (instr.GetType() == "AjoutObjConcern" || instr.GetType() == "AjoutHasard")
        {
            instr.SetParameter(1, instr.GetParameter(3));
        }
        else if (instr.GetType() == "SeDirige" || instr.GetType() == "EstTourne" )
        {
            std::vector< gd::Expression > parameters = instr.GetParameters();
            if ( parameters.size() >= 3 ) parameters.erase(parameters.begin()+2);
            if ( parameters.size() >= 3 ) parameters.erase(parameters.begin()+2);
            instr.SetParameters(parameters);
        }
        else if (instr.GetType() == "Create")
        {
            std::vector< gd::Expression > parameters = instr.GetParameters();
            if ( parameters.size() >= 2 ) parameters.erase(parameters.begin()+1);
            if ( parameters.size() >= 2 ) parameters.erase(parameters.begin()+1);
            instr.SetParameters(parameters);
        }
        else if (instr.GetType() == "CreateByName")
        {
            std::vector< gd::Expression > parameters = instr.GetParameters();
            if ( parameters.size() >= 2 ) parameters.erase(parameters.begin()+1);
            instr.SetParameters(parameters);
        }
        else if (instr.GetType() == "NbObjet")
        {
            std::vector< gd::Expression > parameters = instr.GetParameters();
            if ( parameters.size() >= 2 ) parameters.erase(parameters.begin()+1);
            instr.SetParameters(parameters);
        }
        else if (instr.GetType() == "Distance")
        {
            std::vector< gd::Expression > parameters = instr.GetParameters();
            if ( parameters.size() >= 3 ) parameters.erase(parameters.begin()+2);
            if ( parameters.size() >= 3 ) parameters.erase(parameters.begin()+2);
            if ( parameters.size() >= 4 && (parameters[3].GetPlainString() == ">=" || parameters[3].GetPlainString() == ">") )
            {
                instr.SetInverted(true);
            }
            else
            {
                instr.SetInverted(false);
            }
            instr.SetParameters(parameters);
        }

        //Common updates for some parameters
        const std::vector< gd::Expression > & parameters = instr.GetParameters();
        for (std::size_t j = 0;j<parameters.size() && j<metadata.parameters.size();++j)
        {
            if ( metadata.parameters[j].type == "relationalOperator" ||
                 metadata.parameters[j].type == "operator" )
            {
                if ( j == parameters.size()-1 )
                {
                    std::cout << "ERROR: No more parameters after a [relational]operator when trying to update an instruction from GD2.x";
                }
                else
                {
                    //Exchange parameters
                    gd::String op = parameters[j+1].GetPlainString();
                    instr.SetParameter(j+1, parameters[j] );
                    instr.SetParameter(j, gd::Expression(op));
                }
            }
        }

        //UpdateInstructionsFromGD2x(project, instr.GetSubInstructions(), instructionsAreActions);
    }
}

void EventsListSerialization::UnserializeEventsFrom(gd::Project & project, EventsList & list, const SerializerElement & events)
{
    events.ConsiderAsArrayOf("event", "Event");
    for(std::size_t i = 0; i<events.GetChildrenCount(); ++i)
    {
        SerializerElement & eventElem = events.GetChild(i);
        gd::String type = eventElem.GetChild("type", 0, "Type").GetValue().GetString();
        gd::BaseEventSPtr event = project.CreateEvent(type);
        if ( event != std::shared_ptr<gd::BaseEvent>())
            event->UnserializeFrom(project, eventElem);
        else
        {
            std::cout << "WARNING: Unknown event of type " << type << std::endl;
            event = std::make_shared<EmptyEvent>();
        }

        event->SetDisabled(eventElem.GetBoolAttribute("disabled"));
        event->SetFolded(eventElem.GetBoolAttribute("folded"));

        list.InsertEvent(event, list.GetEventsCount());
    }
}

void EventsListSerialization::SerializeEventsTo(const EventsList & list, SerializerElement & events)
{
    events.ConsiderAsArrayOf("event");
    for ( std::size_t j = 0;j < list.size();j++ )
    {
        const gd::BaseEvent & event = list.GetEvent(j);
        SerializerElement & eventElem = events.AddChild("event");

        eventElem.SetAttribute("disabled", event.IsDisabled());
        eventElem.SetAttribute("folded", event.IsFolded());
        eventElem.AddChild("type").SetValue(event.GetType());

        event.SerializeTo(eventElem);
    }
}

using namespace std;

void gd::EventsListSerialization::OpenConditions(gd::Project & project, gd::InstructionsList & conditions, const SerializerElement & elem)
{
    elem.ConsiderAsArrayOf("condition", "Condition");
    for(std::size_t i = 0; i<elem.GetChildrenCount(); ++i)
    {
        gd::Instruction instruction;
        const SerializerElement & conditionElem = elem.GetChild(i);

        instruction.SetType(conditionElem.GetChild("type", 0, "Type").GetStringAttribute("value")
                .FindAndReplace("Automatism", "Behavior")); //Compatibility with GD <= 4
        instruction.SetInverted(conditionElem.GetChild("type", 0, "Type").GetBoolAttribute("inverted", false, "Contraire"));

        //Read parameters
        vector < gd::Expression > parameters;

        //Compatibility with GD <= 3.3
        if (conditionElem.HasChild("Parametre")) {

            for (std::size_t j = 0;j<conditionElem.GetChildrenCount("Parametre");++j)
                parameters.push_back(gd::Expression(conditionElem.GetChild("Parametre", j).GetValue().GetString()));

        }
        //end of compatibility code
        else
        {
            const SerializerElement & parametersElem = conditionElem.GetChild("parameters");
            parametersElem.ConsiderAsArrayOf("parameter");
            for (std::size_t j = 0;j<parametersElem.GetChildrenCount();++j)
                parameters.push_back(gd::Expression(parametersElem.GetChild(j).GetValue().GetString()));
        }

        instruction.SetParameters( parameters );

        //Read sub conditions
        if ( conditionElem.HasChild("subConditions", "SubConditions") )
            OpenConditions(project, instruction.GetSubInstructions(), conditionElem.GetChild("subConditions", 0, "SubConditions" ));

        conditions.Insert( instruction );
    }

    if ( project.GetLastSaveGDMajorVersion() < 3 ||
         (project.GetLastSaveGDMajorVersion() == 3 && project.GetLastSaveGDMinorVersion() <= 1 ) )
        UpdateInstructionsFromGD31x(project, conditions, false);

    if ( project.GetLastSaveGDMajorVersion() < 3 )
        UpdateInstructionsFromGD2x(project, conditions, false);
}

void gd::EventsListSerialization::OpenActions(gd::Project & project, gd::InstructionsList & actions, const SerializerElement & elem)
{
    elem.ConsiderAsArrayOf("action", "Action");
    for(std::size_t i = 0; i<elem.GetChildrenCount(); ++i)
    {
        gd::Instruction instruction;
        const SerializerElement & actionElem = elem.GetChild(i);

        instruction.SetType(actionElem.GetChild("type", 0, "Type").GetStringAttribute("value")
            .FindAndReplace("Automatism", "Behavior")); //Compatibility with GD <= 4

        //Read parameters
        vector < gd::Expression > parameters;

        //Compatibility with GD <= 3.3
        if (actionElem.HasChild("Parametre")) {

            for (std::size_t j = 0;j<actionElem.GetChildrenCount("Parametre");++j)
                parameters.push_back(gd::Expression(actionElem.GetChild("Parametre", j).GetValue().GetString()));

        }
        //end of compatibility code
        else
        {
            const SerializerElement & parametersElem = actionElem.GetChild("parameters");
            parametersElem.ConsiderAsArrayOf("parameter");
            for (std::size_t j = 0;j<parametersElem.GetChildrenCount();++j)
                parameters.push_back(gd::Expression(parametersElem.GetChild(j).GetValue().GetString()));
        }

        instruction.SetParameters( parameters );

        //Read sub actions
        if ( actionElem.HasChild("subActions", "SubActions") )
            OpenActions(project, instruction.GetSubInstructions(), actionElem.GetChild("subActions", 0, "SubActions" ));

        actions.Insert( instruction );
    }

    if ( project.GetLastSaveGDMajorVersion() < 3 ||
         (project.GetLastSaveGDMajorVersion() == 3 && project.GetLastSaveGDMinorVersion() <= 1 ) )
        UpdateInstructionsFromGD31x(project, actions, true);

    if ( project.GetLastSaveGDMajorVersion() < 3 )
        UpdateInstructionsFromGD2x(project, actions, true);
}

void gd::EventsListSerialization::SaveActions(const gd::InstructionsList & list, SerializerElement & actions)
{
    actions.ConsiderAsArrayOf("action");
    for ( std::size_t k = 0;k < list.size();k++ )
    {
        SerializerElement & action = actions.AddChild("action");
        action.AddChild("type")
            .SetAttribute("value", list[k].GetType())
            .SetAttribute("inverted", list[k].IsInverted());

        //Parameters
        SerializerElement & parameters = action.AddChild("parameters");
        parameters.ConsiderAsArrayOf("parameter");
        for ( std::size_t l = 0;l < list[k].GetParameters().size();l++ )
            parameters.AddChild("parameter").SetValue(list[k].GetParameter(l).GetPlainString());

        //Sub instructions
        SerializerElement & subActions = action.AddChild("subActions");
        SaveActions(list[k].GetSubInstructions(), subActions);
    }
}

void gd::EventsListSerialization::SaveConditions(const gd::InstructionsList & list, SerializerElement & conditions)
{
    conditions.ConsiderAsArrayOf("condition");
    for ( std::size_t k = 0;k < list.size();k++ )
    {
        SerializerElement & condition = conditions.AddChild("condition");
        condition.AddChild("type")
            .SetAttribute("value", list[k].GetType())
            .SetAttribute("inverted", list[k].IsInverted());

        //Parameters
        SerializerElement & parameters = condition.AddChild("parameters");
        parameters.ConsiderAsArrayOf("parameter");
        for ( std::size_t l = 0;l < list[k].GetParameters().size();l++ )
            parameters.AddChild("parameter").SetValue(list[k].GetParameter(l).GetPlainString());

        //Sub instructions
        SerializerElement & subConditions = condition.AddChild("subConditions");
        SaveConditions(list[k].GetSubInstructions(), subConditions);
    }
}

}
