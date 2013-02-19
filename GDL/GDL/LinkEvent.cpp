/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include <wx/dcmemory.h>
#include "GDL/LinkEvent.h"
#include "GDL/OpenSaveGame.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDL/CommonTools.h"
#include "GDL/EmptyEvent.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDL/Events/EventsCodeGenerationContext.h"
#include "GDL/Events/EventsCodeGenerator.h"
#include "GDL/Events/EventsCodeNameMangler.h"
#include "GDL/IDE/DependenciesAnalyzer.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Game.h"
#include "GDL/IDE/Dialogs/EditLink.h"
#include <iostream>
#include <fstream>

using namespace std;

void LinkEvent::SaveToXml(TiXmlElement * eventElem) const
{
    TiXmlElement * type = new TiXmlElement( "Type" );
    eventElem->LinkEndChild( type );
    type->SetAttribute( "value", "Link" );

    TiXmlElement * limitsElem;
    limitsElem = new TiXmlElement( "Limites" );
    eventElem->LinkEndChild( limitsElem );

    limitsElem->SetAttribute( "includeAll", IncludeAllEvents() ? "true" : "false" );
    limitsElem->SetDoubleAttribute( "start", GetIncludeStart() );
    limitsElem->SetDoubleAttribute( "end", GetIncludeEnd() );

    TiXmlElement * com1;
    com1 = new TiXmlElement( "Scene" );
    eventElem->LinkEndChild( com1 );
    com1->SetAttribute( "value", GetTarget().c_str() );
}

void LinkEvent::LoadFromXml(const TiXmlElement * eventElem)
{
    if ( eventElem->FirstChildElement( "Limites" ) )
    {
        if ( eventElem->FirstChildElement( "Limites" )->Attribute( "includeAll" ) )
        {
            SetIncludeAllEvents( !(ToString(eventElem->FirstChildElement( "Limites" )->Attribute( "includeAll" )) == "false") );
        }

        if ( eventElem->FirstChildElement( "Limites" )->Attribute( "start" ) != NULL && eventElem->FirstChildElement( "Limites" )->Attribute( "end" ) != NULL )
        {
            SetIncludeStartAndEnd(ToInt(eventElem->FirstChildElement( "Limites" )->Attribute( "start" )),
                                  ToInt(eventElem->FirstChildElement( "Limites" )->Attribute( "end" )));

            //Backward compatibility
            if ( ToInt(eventElem->FirstChildElement( "Limites" )->Attribute( "start" )) == -1 && ToInt(eventElem->FirstChildElement( "Limites" )->Attribute( "end" )) == -1  )
                SetIncludeAllEvents( true );
        }
    }

    if ( eventElem->FirstChildElement( "Scene" ) && eventElem->FirstChildElement( "Scene" )->Attribute( "value" ) != NULL ) { SetTarget(eventElem->FirstChildElement( "Scene" )->Attribute( "value" ));}
    else { cout <<"Les informations concernant le nom de la scène liée."; }
}

void LinkEvent::Preprocess(Game & game, Scene & scene, std::vector < gd::BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList)
{
    if ( IsDisabled() ) return;

    //Finding what to link to.
    const vector< gd::BaseEventSPtr > * eventsToInclude = NULL;
    ExternalEvents * linkedExternalEvents = NULL;
    if ( game.HasExternalEventsNamed(GetTarget()) )
    {
        linkedExternalEvents = &game.GetExternalEvents(GetTarget());
        std::cout << "linkedExternalEvents: " << linkedExternalEvents->GetName();
        eventsToInclude = &game.GetExternalEvents(GetTarget()).GetEvents();
    }
    else if ( game.HasLayoutNamed(GetTarget()) ) eventsToInclude = &game.GetLayout(GetTarget()).GetEvents();

    //Check if the link refers to external events compiled separately
    DependenciesAnalyzer analyzer(game);
    if (linkedExternalEvents != NULL &&
        analyzer.ExternalEventsCanBeCompiledForAScene(linkedExternalEvents->GetName()) == scene.GetName()) //Check if the link refers to events
    {                                                                                                      //compiled separately.
        //There is nothing more to do for now: The code calling the external events will be generated in LinkEvent::GenerateEventCode.
        return;
    }

    if ( eventsToInclude != NULL )
    {
        unsigned int firstEvent = IncludeAllEvents() ? 0 : GetIncludeStart();
        unsigned int lastEvent = IncludeAllEvents() ? eventsToInclude->size() - 1 : GetIncludeEnd();

        //Check bounds
        if ( firstEvent >= eventsToInclude->size() )
        {
            std::cout << "Unable to get events from a link ( Invalid start )" << std::endl;
            linkWasInvalid = true;
            return;
        }
        if ( lastEvent >= eventsToInclude->size() )
        {
            std::cout << "Unable to get events from a link ( Invalid end )" << std::endl;
            linkWasInvalid = true;
            return;
        }
        if ( firstEvent > lastEvent )
        {
            std::cout << "Unable to get events from a link ( End is before start )" << std::endl;
            linkWasInvalid = true;
            return;
        }

        //Insert an empty event to replace the link event ( we'll delete the link event at the end )
        //( If we just erase the link event without adding a blank event to replace it,
        //the first event inserted by the link will not be preprocessed ( and it can be annoying if it require preprocessing, such as another link event ). )
        eventList.insert(eventList.begin() + indexOfTheEventInThisList, boost::shared_ptr<gd::BaseEvent>(new EmptyEvent));

        //Insert linked events
        for ( unsigned int insertion = 0;insertion <= static_cast<unsigned>(lastEvent-firstEvent);insertion++ )
        {
            //Profiling can be enabled in editor, so we use CloneRememberingOriginalEvent.
            eventList.insert( eventList.begin() + indexOfTheEventInThisList + 1 + insertion, /*Start inserted at indexOfTheEventInThisList+1 ( after the empty event ) */
                             CloneRememberingOriginalEvent(eventsToInclude->at( firstEvent+insertion )));
        }

        //Delete the link event ( which is now at the end of the list of events we've just inserted )
        eventList.erase( eventList.begin() + indexOfTheEventInThisList + 1 + static_cast<unsigned>(lastEvent-firstEvent)+1 );
    }
    else
    {
        std::cout << "Unable to get events from a link." << std::endl;
        linkWasInvalid = true;

        //Delete the link event
        eventList.erase( eventList.begin() + indexOfTheEventInThisList );
        return;
    }

    linkWasInvalid = false;
}

std::string LinkEvent::GenerateEventCode(Game & game, Scene & scene, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & parentContext)
{
    //This function is called only when the link refers to external events compiled separately. ( See LinkEvent::Preprocess )
    //We must generate code to call these external events.
    std::string outputCode;

    std::string functionCall = EventsCodeNameMangler::GetInstance()->GetExternalEventsFunctionMangledName(GetTarget())+"(runtimeContext);";
    std::string functionDeclaration = "void "+EventsCodeNameMangler::GetInstance()->GetExternalEventsFunctionMangledName(GetTarget())+"(RuntimeContext * context);";
    outputCode += functionCall+"\n";
    codeGenerator.AddGlobalDeclaration(functionDeclaration);

    return outputCode;
}

gd::BaseEvent::EditEventReturnType LinkEvent::EditEvent(wxWindow* parent_, Game & game, Scene & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
    EditLink dialog(parent_, *this, game);
    if ( dialog.ShowModal() == 0 ) return Cancelled;

    return ChangesMade;
}

/**
 * Render the event in the bitmap
 */
void LinkEvent::Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection)
{
    dc.SetBrush( wxBrush( wxColour( 255, 255, 255 ) ) );
    dc.SetPen( wxPen( wxColour( 0, 0, 0 ), 1) );
    wxRect rect(x+1, y, width, GetRenderedHeight(width)-2);
    dc.DrawRectangle(rect);

    dc.DrawBitmap( wxBitmap( "res/link48.png", wxBITMAP_TYPE_ANY ), x+4, y + 4, true);

    dc.SetTextForeground( wxColour( 0, 0, 0 ) );
    dc.SetTextBackground( wxColour( 255, 255, 255 ) );
    dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    dc.DrawText( _("Link to ")+GetTarget(), x+56, y + 16 );
    wxRect lien = dc.GetTextExtent(_("Link to ")+GetTarget());

    dc.SetFont( wxFont( 10, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    if ( IncludeAllEvents() )
        dc.DrawText( _("Include all events"), x+lien.GetWidth()+56+10, y + 18 );
    else
        dc.DrawText( _("Include events ")+ToString(GetIncludeStart()+1)+_(" to ")+ToString(GetIncludeEnd()+1), x+lien.GetWidth()+56+10, y + 18 );
}

/**
 * Precompute height for the link
 */
unsigned int LinkEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        wxMemoryDC dc;
        wxBitmap fakeBmp(1,1);
        dc.SelectObject(fakeBmp);

        dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
        wxRect lien = dc.GetTextExtent(_("Link to "));

        renderedHeight = lien.GetHeight()+32;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
}

#endif

