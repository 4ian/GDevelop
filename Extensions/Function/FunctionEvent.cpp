/**

Game Develop - Function Extension
Copyright (c) 2008-2013 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#if defined(GD_IDE_ONLY)

#include "GDCore/Events/Serialization.h"
#include "FunctionEvent.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/CommonTools.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCpp/XmlMacros.h"
#include "GDCpp/tinyxml/tinyxml.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/IDE/EventsEditorSelection.h"
#include "FunctionEventEditorDlg.h"
#include <wx/textdlg.h>
namespace gd { class Project; }

using namespace std;

FunctionEvent::FunctionEvent() :
BaseEvent(),
name("MyFunction"),
nameSelected(false)
{
}

//Functions need some additionals "tools"
const std::string FunctionEvent::globalDeclaration = "std::vector<std::string> * currentFunctionParameters;\n";

vector < vector<gd::Instruction>* > FunctionEvent::GetAllConditionsVectors()
{
    vector < vector<gd::Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < vector<gd::Instruction>* > FunctionEvent::GetAllActionsVectors()
{
    vector < vector<gd::Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

void FunctionEvent::SaveToXml(TiXmlElement * elem) const
{
    TiXmlElement * objectElem = new TiXmlElement( "Name" );
    elem->LinkEndChild( objectElem );
    objectElem->SetAttribute("value", name.c_str());

    //Les conditions
    TiXmlElement * conditionsElem = new TiXmlElement( "Conditions" );
    elem->LinkEndChild( conditionsElem );
    gd::EventsListSerialization::SaveConditions(conditions, conditionsElem);

    //Les actions
    TiXmlElement * actionsElem = new TiXmlElement( "Actions" );
    elem->LinkEndChild( actionsElem );
    gd::EventsListSerialization::SaveActions(actions, actionsElem);

    //Sous évènements
    if ( !GetSubEvents().empty() )
    {
        TiXmlElement * subeventsElem;
        subeventsElem = new TiXmlElement( "Events" );
        elem->LinkEndChild( subeventsElem );

        gd::EventsListSerialization::SaveEventsToXml(events, subeventsElem);
    }

    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("objectsPassedAsArgument", objectsPassedAsArgument);
}

void FunctionEvent::LoadFromXml(gd::Project & project, const TiXmlElement * elem)
{
    if ( elem->FirstChildElement( "Name" ) != NULL )
        name = elem->FirstChildElement("Name")->Attribute("value");

    //Conditions
    if ( elem->FirstChildElement( "Conditions" ) != NULL )
        gd::EventsListSerialization::OpenConditions(project, conditions, elem->FirstChildElement( "Conditions" ));
    else
        cout << "Aucune informations sur les conditions d'un évènement";

    //Actions
    if ( elem->FirstChildElement( "Actions" ) != NULL )
        gd::EventsListSerialization::OpenActions(project, actions, elem->FirstChildElement( "Actions" ));
    else
        cout << "Aucune informations sur les actions d'un évènement";

    //Subevents
    if ( elem->FirstChildElement( "Events" ) != NULL )
        gd::EventsListSerialization::LoadEventsFromXml(project, events, elem->FirstChildElement( "Events" ));

    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("objectsPassedAsArgument", objectsPassedAsArgument);
}

/**
 * Render the event in the bitmap
 */
void FunctionEvent::Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection, const gd::Platform & platform)
{
    gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::GetInstance();
    int border = renderingHelper->instructionsListBorder;
    const int functionTextHeight = 20;

    //Draw header rectangle
    wxRect headerRect(x, y, width, functionTextHeight);
    renderingHelper->DrawNiceRectangle(dc, headerRect);

    //Name
    dc.SetFont( renderingHelper->GetNiceFont().Bold()  );
    dc.SetTextForeground(wxColour(0,0,0));
    wxString caption = _("Function") + " " + name;
    if ( !objectsPassedAsArgument.empty() ) caption += " "+_("( Objects passed as parameters : ")+objectsPassedAsArgument+_(")");
    dc.DrawText( caption, x + 4, y + 3 );

    //Draw conditions rectangle
    wxRect rect(x, y+functionTextHeight, renderingHelper->GetConditionsColumnWidth()+border, GetRenderedHeight(width, platform)-functionTextHeight);
    renderingHelper->DrawNiceRectangle(dc, rect);

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc,
                                        x+border,
                                        y+functionTextHeight+border,
                                        renderingHelper->GetConditionsColumnWidth()-border, this, areas, selection, platform);
    renderingHelper->DrawActionsList(actions, dc,
                                     x+renderingHelper->GetConditionsColumnWidth()+border,
                                     y+functionTextHeight+border,
                                     width-renderingHelper->GetConditionsColumnWidth()-border*2, this, areas, selection, platform);
}

unsigned int FunctionEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
{
    if ( eventHeightNeedUpdate )
    {
        gd::EventsRenderingHelper * renderingHelper = gd::EventsRenderingHelper::GetInstance();
        int border = renderingHelper->instructionsListBorder;
        const int functionTextHeight = 20;

        //Get maximum height needed
        int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth()-border*2, platform);
        int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, width-renderingHelper->GetConditionsColumnWidth()-border*2, platform);

        renderedHeight = (( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + functionTextHeight)+border*2;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
}

gd::BaseEvent::EditEventReturnType FunctionEvent::EditEvent(wxWindow* parent_, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
    FunctionEventEditorDlg dialog(parent_, *this, game_, scene_);
    if ( dialog.ShowModal() == 0 ) return Cancelled;

    return ChangesMade;
}

/**
 * Initialize from another FunctionEvent.
 * Used by copy ctor and assignement operator
 */
void FunctionEvent::Init(const FunctionEvent & event)
{
    events = CloneVectorOfEvents(event.events);
    name = event.name;
    objectsPassedAsArgument = event.objectsPassedAsArgument;
    conditions = event.conditions;
    actions = event.actions;
}

/**
 * Custom copy operator
 */
FunctionEvent::FunctionEvent(const FunctionEvent & event) :
BaseEvent(event)
{
    Init(event);
}

/**
 * Custom assignement operator
 */
FunctionEvent& FunctionEvent::operator=(const FunctionEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}

boost::shared_ptr<FunctionEvent> FunctionEvent::SearchForFunctionInEvents(const std::vector < boost::shared_ptr<gd::BaseEvent> > & events, const std::string & functionName)
{
    for (unsigned int i = 0;i<events.size();++i)
    {
        boost::shared_ptr<FunctionEvent> functionEvent = boost::dynamic_pointer_cast<FunctionEvent>(events[i]);
        if ( functionEvent != boost::shared_ptr<FunctionEvent>() )
        {
            if ( functionEvent->GetName() == functionName )
                return functionEvent;
        }

        if ( events[i]->CanHaveSubEvents() )
        {
            boost::shared_ptr<FunctionEvent> result = SearchForFunctionInEvents(events[i]->GetSubEvents(), functionName);
            if ( result != boost::shared_ptr<FunctionEvent>() ) return result;
        }
    }

    return boost::shared_ptr<FunctionEvent>();
}

std::vector< boost::shared_ptr<FunctionEvent> > FunctionEvent::GetAllFunctionsInEvents(const std::vector < boost::shared_ptr<gd::BaseEvent> > & events)
{
    std::vector< boost::shared_ptr<FunctionEvent> > results;

    for (unsigned int i = 0;i<events.size();++i)
    {
        boost::shared_ptr<FunctionEvent> functionEvent = boost::dynamic_pointer_cast<FunctionEvent>(events[i]);
        if ( functionEvent != boost::shared_ptr<FunctionEvent>() ) results.push_back(functionEvent);

        if ( events[i]->CanHaveSubEvents() )
        {
            std::vector< boost::shared_ptr<FunctionEvent> >  subResults = GetAllFunctionsInEvents(events[i]->GetSubEvents());
            std::copy(subResults.begin(), subResults.end(), std::back_inserter(results));
        }
    }

    return results;
}

#endif

