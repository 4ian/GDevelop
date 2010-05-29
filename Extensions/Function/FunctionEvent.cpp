
#include "GDL/OpenSaveGame.h"
#include "FunctionEvent.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"
#include "GDL/tinyxml.h"

#if defined(GDE)
#include "GDL/EventsRenderingHelper.h"
#endif

std::map < const Game*, std::map < const Scene* , std::map < std::string, FunctionEvent* > > > FunctionEvent::functionsList;

FunctionEvent::FunctionEvent() :
BaseEvent(),
name("MyFunction")
#if defined(GDE)
,nameSelected(false)
#endif
{
}

/**
 * Check the conditions, and launch actions and subevents if necessary
 */
void FunctionEvent::Launch( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    if ( ExecuteConditions( scene, objectsConcerned) == true )
    {
        ExecuteActions( scene, objectsConcerned);

        for (unsigned int i = 0;i<events.size();++i)
        {
            ObjectsConcerned objectsConcernedForSubEvent;
            objectsConcernedForSubEvent.InheritsFrom(&objectsConcerned);

            events[i]->Execute(scene, objectsConcernedForSubEvent);
        }
    }
}

/**
 * Check if all conditions are true
 */
bool FunctionEvent::ExecuteConditions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    for ( unsigned int k = 0; k < conditions.size(); ++k )
    {
        if ( conditions[k].function != NULL &&
             !conditions[k].function( scene, objectsConcerned, conditions[k]) )
            return false; //Return false as soon as a condition is false
    }

    return true;
}

/**
 * Run actions of the event
 */
void FunctionEvent::ExecuteActions( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    for ( unsigned int k = 0; k < actions.size();k++ )
    {
        if ( actions[k].function != NULL )
            actions[k].function( scene, objectsConcerned, actions[k]);
    }

    return;
}

vector < vector<Instruction>* > FunctionEvent::GetAllConditionsVectors()
{
    vector < vector<Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < vector<Instruction>* > FunctionEvent::GetAllActionsVectors()
{
    vector < vector<Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

void FunctionEvent::SaveToXml(TiXmlElement * eventElem) const
{
    TiXmlElement * objectElem = new TiXmlElement( "Name" );
    eventElem->LinkEndChild( objectElem );
    objectElem->SetAttribute("value", name.c_str());

    //Les conditions
    TiXmlElement * conditionsElem = new TiXmlElement( "Conditions" );
    eventElem->LinkEndChild( conditionsElem );
    OpenSaveGame::SaveConditions(conditions, conditionsElem);

    //Les actions
    TiXmlElement * actionsElem = new TiXmlElement( "Actions" );
    eventElem->LinkEndChild( actionsElem );
    OpenSaveGame::SaveActions(actions, actionsElem);

    //Sous évènements
    if ( !GetSubEvents().empty() )
    {
        TiXmlElement * subeventsElem;
        subeventsElem = new TiXmlElement( "Events" );
        eventElem->LinkEndChild( subeventsElem );

        OpenSaveGame::SaveEvents(events, subeventsElem);
    }
}

void FunctionEvent::LoadFromXml(const TiXmlElement * eventElem)
{
    if ( eventElem->FirstChildElement( "Name" ) != NULL )
        name = eventElem->FirstChildElement("Name")->Attribute("value");

    //Conditions
    if ( eventElem->FirstChildElement( "Conditions" ) != NULL )
        OpenSaveGame::OpenConditions(conditions, eventElem->FirstChildElement( "Conditions" ));
    else
        cout << "Aucune informations sur les conditions d'un évènement";

    //Actions
    if ( eventElem->FirstChildElement( "Actions" ) != NULL )
        OpenSaveGame::OpenActions(actions, eventElem->FirstChildElement( "Actions" ));
    else
        cout << "Aucune informations sur les actions d'un évènement";

    //Subevents
    if ( eventElem->FirstChildElement( "Events" ) != NULL )
        OpenSaveGame::OpenEvents(events, eventElem->FirstChildElement( "Events" ));
}

/**
 * Register function during preprocessing
 */
void FunctionEvent::Preprocess(const Game & game, RuntimeScene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList)
{
    ReferenceFunction(&game, &scene);
}

/**
 * Unregister function when object is destroyed
 */
FunctionEvent::~FunctionEvent()
{
    UnreferenceFunction();
}

/**
 * Add function to functions list
 */
void FunctionEvent::ReferenceFunction(const Game * game, Scene * scene)
{
    functionsList[game][scene][name] = this;
}

/**
 * Suppress function from functions list
 */
void FunctionEvent::UnreferenceFunction()
{
    std::map < const Game*, std::map < const Scene* , std::map < std::string, FunctionEvent* > > >::iterator giter = functionsList.begin();
    std::map < const Game*, std::map < const Scene* , std::map < std::string, FunctionEvent* > > >::const_iterator gend = functionsList.end();
    for (;giter!=gend;++giter)
    {
        std::map < const Scene* , std::map < std::string, FunctionEvent* > >::iterator siter = giter->second.begin();
        std::map < const Scene* , std::map < std::string, FunctionEvent* > >::const_iterator send = giter->second.end();
        for (;siter!=send;++siter)
        {
            std::map < std::string, FunctionEvent* >::iterator fiter = siter->second.begin();
            std::map < std::string, FunctionEvent* >::const_iterator fend = siter->second.end();
            for (;fiter!=fend;++fiter)
            {
                if ( fiter->second == this ) fiter->second = NULL;
            }
        }
    }
}

#if defined(GDE)
void FunctionEvent::OnSingleClick(int x, int y, vector < boost::tuple< vector < BaseEventSPtr > *, unsigned int, vector < Instruction > *, unsigned int > > & eventsSelected,
                         bool & conditionsSelected, bool & instructionsSelected)
{
    const int forEachTextHeight = 20;
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();

    //Test selection for the name
    if ( y <= forEachTextHeight )
    {
        nameSelected = true;
        return;
    }

    //Test selection of actions/conditions
    nameSelected = false;
    y -= forEachTextHeight; //Substract the height of the "For Each object ..." text so as to simplify the tests
    if ( x <= renderingHelper->GetConditionsColumnWidth())
    {
        conditionsSelected = true;

        vector < Instruction > * conditionsListSelected = NULL;
        unsigned int conditionIdInList = 0;

        bool found = renderingHelper->GetConditionAt(conditions, x-0, y-0, conditionsListSelected, conditionIdInList);

        if ( found )
        {
            //Update event and conditions selection information
            if ( conditionIdInList < conditionsListSelected->size() ) (*conditionsListSelected)[conditionIdInList].selected = true;
            eventRenderingNeedUpdate = true;

            //Update editor selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = conditionsListSelected;
            boost::tuples::get<3>(eventsSelected.back()) = conditionIdInList;

            return;
        }
        else if ( y <= 18 )
        {
            //Update event selection information
            eventRenderingNeedUpdate = true;

            //Update selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = &conditions;
            boost::tuples::get<3>(eventsSelected.back()) = 0;

            return;
        }
    }
    else
    {
        conditionsSelected = false;

        vector < Instruction > * actionsListSelected = NULL;
        unsigned int actionIdInList = 0;

        bool found = renderingHelper->GetActionAt(actions, x-0, y-0, actionsListSelected, actionIdInList);

        if ( found )
        {
            //Update event and action selection information
            if ( actionIdInList < actionsListSelected->size() ) (*actionsListSelected)[actionIdInList].selected = true;
            eventRenderingNeedUpdate = true;

            //Update selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = actionsListSelected;
            boost::tuples::get<3>(eventsSelected.back()) = actionIdInList;
        }
        else
        {
            //Update event selection information
            eventRenderingNeedUpdate = true;

            //Update selection information
            instructionsSelected = true;
            boost::tuples::get<2>(eventsSelected.back()) = &actions;
            boost::tuples::get<3>(eventsSelected.back()) = 0;
        }
    }
}

/**
 * Render the event in the bitmap
 */
void FunctionEvent::RenderInBitmap() const
{
    cout << "renderFunction";
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();
    const int forEachTextHeight = 20;

    //Get sizes and recreate the bitmap
    int conditionsHeight = renderingHelper->GetRenderedConditionsListHeight(conditions, renderingHelper->GetConditionsColumnWidth());
    int actionsHeight = renderingHelper->GetRenderedActionsListHeight(actions, renderedWidth-renderingHelper->GetConditionsColumnWidth());
    renderedEventBitmap.Create(renderedWidth, ( conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight ) + forEachTextHeight, -1);

    //Prepare renderers and constants
    wxMemoryDC dc;
    dc.SelectObject(renderedEventBitmap);

    //Draw event rectangle
    dc.SetPen(*wxTRANSPARENT_PEN);
    dc.SetBrush(wxBrush(wxColour(255, 255, 255), wxBRUSHSTYLE_SOLID));
    dc.Clear();
    {
        wxRect rect(0, 0, renderedWidth, renderedEventBitmap.GetHeight());

        if ( !selected )
            renderingHelper->DrawNiceRectangle(dc, rect, renderingHelper->eventGradient1, renderingHelper->eventGradient2, renderingHelper->eventGradient3,
                                                renderingHelper->eventGradient4, renderingHelper->eventBorderColor);
        else
            renderingHelper->DrawNiceRectangle(dc, rect, renderingHelper->selectionColor, renderingHelper->eventGradient2, renderingHelper->eventGradient3,
                                                renderingHelper->selectionColor, renderingHelper->eventBorderColor);
    }

    //Name Selection
    if ( nameSelected )
    {
        dc.SetBrush(renderingHelper->GetSelectedRectangleFillBrush());
        dc.SetPen(renderingHelper->GetSelectedRectangleOutlinePen());
        dc.DrawRectangle(1, 1, renderedWidth-2, forEachTextHeight-2);
    }

    //Name
    dc.SetFont( renderingHelper->GetBoldFont() );
    dc.DrawText( _("Fonction") + " " + name, 0 + 2, 0 + 1 );

    //Draw actions and conditions
    renderingHelper->DrawConditionsList(conditions, dc, 0, forEachTextHeight, renderingHelper->GetConditionsColumnWidth());
    renderingHelper->DrawActionsList(actions, dc, renderingHelper->GetConditionsColumnWidth(), forEachTextHeight, renderedWidth-renderingHelper->GetConditionsColumnWidth());

    eventRenderingNeedUpdate = false;
}

void FunctionEvent::EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_)
{
    string newName = string(wxGetTextFromUser(_("Entrez le nom de la fonction"), _("Nom de la fonction"), name).mb_str());
    if ( newName != "" ) name = newName;
}
#endif

/**
 * Initialize from another FunctionEvent.
 * Used by copy ctor and assignement operator
 */
void FunctionEvent::Init(const FunctionEvent & event)
{
    events.clear();
    for (unsigned int i =0;i<event.events.size();++i)
    	events.push_back( event.events[i]->Clone() );

    name = event.name;
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
