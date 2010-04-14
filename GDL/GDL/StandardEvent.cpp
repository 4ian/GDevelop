/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "StandardEvent.h"
#include "ObjectsConcerned.h"
#include "Access.h"
#include "tinyxml.h"
#include "GDL/OpenSaveGame.h"
#if defined(GDE)
#include "EventsRenderingHelper.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/TranslateAction.h"
#include "GDL/TranslateCondition.h"
#endif

StandardEvent::StandardEvent() :
BaseEvent()
{
}

/**
 * Check the conditions, and launch actions and subevents if necessary
 */
void StandardEvent::Execute( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval )
{
    if ( ExecuteConditions( scene, objectsConcerned, eval ) == true )
    {
        ExecuteActions( scene, objectsConcerned, eval );

        for (unsigned int i = 0;i<events.size();++i)
        {
            ObjectsConcerned objectsConcernedForSubEvent;
            objectsConcernedForSubEvent.InheritsFrom(&objectsConcerned);

            events[i]->Execute(scene, objectsConcernedForSubEvent, eval);
        }
    }
}

/**
 * Check if all conditions are true
 */
bool StandardEvent::ExecuteConditions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval )
{
    for ( unsigned int k = 0; k < conditions.size(); ++k )
    {
        eval.SetObjectsConcerned(&objectsConcerned);
        if ( conditions[k].function != NULL &&
             !conditions[k].function( scene, objectsConcerned, conditions[k], eval ) )
            return false; //Return false as soon as a condition is false
    }

    return true;
}

/**
 * Run actions of the event
 */
//TODO : Make "Scene" and "Quit" real actions
void StandardEvent::ExecuteActions( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Evaluateur & eval )
{
    for ( unsigned int k = 0; k < actions.size();k++ )
    {
        eval.SetObjectsConcerned(&objectsConcerned);
        if ( actions[k].function != NULL )
            actions[k].function( scene, objectsConcerned, actions[k], eval );
    }

    return;
}

vector < vector<Instruction>* > StandardEvent::GetAllConditionsVectors()
{
    vector < vector<Instruction>* > allConditions;
    allConditions.push_back(&conditions);

    return allConditions;
}

vector < vector<Instruction>* > StandardEvent::GetAllActionsVectors()
{
    vector < vector<Instruction>* > allActions;
    allActions.push_back(&actions);

    return allActions;
}

void StandardEvent::SaveToXml(TiXmlElement * eventElem) const
{
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

void StandardEvent::LoadFromXml(const TiXmlElement * eventElem)
{
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

#if defined(GDE)

/**
 * Render the event in the bitmap
 */
void StandardEvent::RenderInBitmap() const
{
    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();

    //Get sizes and recreate the bitmap
    int conditionsHeight = GetConditionsHeight();
    int actionsHeight = GetActionsHeight();
    renderedEventBitmap.Create(renderedWidth, conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight, -1);

    //Prepare renderers and constants
    wxMemoryDC dc;
    dc.SelectObject(renderedEventBitmap);
    renderingHelper->GetHTMLRenderer().SetDC(&dc);
    renderingHelper->GetHTMLRenderer().SetStandardFonts( 8 );
    const int iconWidth = 18;
    const int separation = 1;
    const int sideSeparation = 1;

    //Setup colors
    dc.SetFont(renderingHelper->GetFont());
    if ( !selected )
    {
        dc.SetPen(renderingHelper->GetRectangleOutlinePen());
        dc.SetBrush(renderingHelper->GetRectangleFillBrush());
    }
    else
    {
        dc.SetPen(renderingHelper->GetSelectedRectangleOutlinePen());
        dc.SetBrush(renderingHelper->GetSelectedRectangleFillBrush());
    }

    //Draw event rectangle
    dc.SetPen(*wxTRANSPARENT_PEN);
    dc.SetBrush(wxBrush(wxColour(255, 255, 255), wxBRUSHSTYLE_SOLID));
    dc.Clear();
    {
        wxRect rect(0, 0, renderedWidth, renderedEventBitmap.GetHeight());

        if ( !selected )
            renderingHelper->DrawNiceRectangle(dc, rect, renderingHelper->eventGradient1,
                                    renderingHelper->eventGradient2,
                                    renderingHelper->eventGradient3,
                                    renderingHelper->eventGradient4,
                                    renderingHelper->eventBorderColor);
        else
            renderingHelper->DrawNiceRectangle(dc, rect, renderingHelper->selectionColor,
                                    renderingHelper->eventGradient2,
                                    renderingHelper->eventGradient3,
                                    renderingHelper->selectionColor,
                                    renderingHelper->eventBorderColor);
    }

    dc.SetPen(renderingHelper->GetSelectedRectangleOutlinePen());

    //Draw conditions
    int yCondition = 0;
    if ( GetConditions().empty() )
    {
        //Pas de conditions, on affiche juste un petit message
        wxRect rect(0, 0, renderingHelper->GetConditionsColumnWidth(), 17+1);
        renderingHelper->DrawNiceRectangle(dc, rect, renderingHelper->eventConditionsGradient1,
                                renderingHelper->eventConditionsGradient2,
                                renderingHelper->eventConditionsGradient3,
                                renderingHelper->eventConditionsGradient4,
                                renderingHelper->eventConditionsBorderColor);

        dc.SetFont( renderingHelper->GetItalicFont() );
        dc.DrawText( _("Pas de conditions"), 0 + 2, 0 + 1 );
    }
    else
    {
        //Draw Conditions rectangle
        wxRect rect(0, 0, renderingHelper->GetConditionsColumnWidth(), conditionsHeight);
        renderingHelper->DrawNiceRectangle(dc, rect, renderingHelper->eventConditionsGradient1,
                                renderingHelper->eventConditionsGradient2,
                                renderingHelper->eventConditionsGradient3,
                                renderingHelper->eventConditionsGradient4,
                                renderingHelper->eventConditionsBorderColor);

        //Draw each conditions
        int indentWidth = 0;
        yCondition += 1;
        for ( unsigned int j = 0;j < GetConditions().size();j++ )
        {
            const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(GetConditions()[j].GetType());

            //Draw needed icons
            int leftIconsWidth = 0;
            if ( GetConditions()[j].IsInverted() )
            {
                dc.DrawBitmap( wxBitmap( "res/contraire.png", wxBITMAP_TYPE_ANY ), 0 + indentWidth + sideSeparation + leftIconsWidth, yCondition, true );
                leftIconsWidth += 18;
            }
            if ( !GetConditions()[j].IsLocal() )
            {
                dc.DrawBitmap( wxBitmap( "res/global.png", wxBITMAP_TYPE_ANY ), 0 + indentWidth + sideSeparation + leftIconsWidth, yCondition, true );
                leftIconsWidth += 18;
            }

            //Get the width available
            int freeWidth = (renderingHelper->GetConditionsColumnWidth() - 0) - leftIconsWidth - indentWidth - iconWidth - sideSeparation*2;
            freeWidth = freeWidth <= 0 ? 1 : freeWidth;
            renderingHelper->GetHTMLRenderer().SetSize(freeWidth, 9999);

            yCondition += separation;

            if ( GetConditions()[j].selected )
            {
                dc.SetBrush(renderingHelper->GetSelectedRectangleFillBrush());
                dc.SetPen(renderingHelper->GetSelectedRectangleOutlinePen());
                dc.DrawRectangle(0 + indentWidth + sideSeparation + leftIconsWidth + iconWidth,
                                 yCondition,
                                 renderingHelper->GetConditionsColumnWidth()-(0 + indentWidth + sideSeparation + leftIconsWidth + iconWidth)-2,
                                 GetConditions()[j].renderedHeight);
            }

            //Draw the condition icon
            dc.DrawBitmap( instructionInfos.smallicon, 0 + indentWidth + sideSeparation + leftIconsWidth, yCondition, true );

            //Draw the condition text
            string TexteFinal = TranslateCondition::Translate(GetConditions()[j], instructionInfos,  false, true);
            renderingHelper->GetHTMLRenderer().SetHtmlText(TexteFinal);
            wxArrayInt neededArray;
            renderingHelper->GetHTMLRenderer().Render(0 + indentWidth + sideSeparation + leftIconsWidth + iconWidth, yCondition, neededArray);

            yCondition += renderingHelper->GetHTMLRenderer().GetTotalHeight()+separation+1;

            //Indentation
            if ( GetConditions()[j].GetType() == "Repeat" ||
                 GetConditions()[j].GetType() == "ForEach" ||
                 GetConditions()[j].GetType() == "While" )
            {
                indentWidth += 15;
            }
        }
        yCondition += 3;
    }

    //Draw actions
    int yAction = 0;
    if ( GetActions().empty() )
    {
        dc.SetFont( renderingHelper->GetItalicFont() );
        dc.DrawText( _("Pas d'actions"), 0 + (renderingHelper->GetConditionsColumnWidth() - 0) + 2, 0 +1 );
    }
    else
    {
        //Draw each actions
        int indentWidth = 0;
        yAction += 1;
        for ( unsigned int j = 0;j < GetActions().size();j++ )
        {
            const InstructionInfos & instructionInfos = extensionManager->GetActionInfos(GetActions()[j].GetType());

            //Draw global icon, if needed.
            int leftIconsWidth = 0;
            if ( !GetActions()[j].IsLocal() )
            {
                dc.DrawBitmap( wxBitmap( "res/global.png", wxBITMAP_TYPE_ANY ), 0 + (renderingHelper->GetConditionsColumnWidth() - 0) + indentWidth + sideSeparation + leftIconsWidth, yAction, true );
                leftIconsWidth += 18;
            }

            //Get the width available
            int freeWidth = renderedWidth - (renderingHelper->GetConditionsColumnWidth() - 0) - leftIconsWidth - indentWidth - iconWidth - 0 - sideSeparation*2;
            freeWidth = freeWidth <= 0 ? 1 : freeWidth;
            renderingHelper->GetHTMLRenderer().SetSize(freeWidth, 9999);

            //Draw the bitmap of the action
            yAction += separation;

            if ( GetActions()[j].selected )
            {
                dc.SetBrush(renderingHelper->GetSelectedRectangleFillBrush());
                dc.SetPen(renderingHelper->GetSelectedRectangleOutlinePen());
                dc.DrawRectangle(0 + (renderingHelper->GetConditionsColumnWidth() - 0) + indentWidth + leftIconsWidth + iconWidth + sideSeparation,
                                 yAction,
                                 renderedWidth - (0 + (renderingHelper->GetConditionsColumnWidth() - 0) + indentWidth + leftIconsWidth + iconWidth + sideSeparation)-2,
                                 GetActions()[j].renderedHeight);
            }

            dc.DrawBitmap( instructionInfos.smallicon, 0 + (renderingHelper->GetConditionsColumnWidth() - 0) + indentWidth + sideSeparation + leftIconsWidth, yAction, true );

            //Draw the action text
            renderingHelper->GetHTMLRenderer().SetHtmlText(TranslateAction::Translate( GetActions()[j], instructionInfos, false, true ));
            wxArrayInt neededArray;
            renderingHelper->GetHTMLRenderer().Render(0 + (renderingHelper->GetConditionsColumnWidth() - 0) + indentWidth + leftIconsWidth + iconWidth + sideSeparation, yAction, neededArray);

            yAction += renderingHelper->GetHTMLRenderer().GetTotalHeight()+separation+1;

            //Indentation
            if ( GetActions()[j].GetType() == "Repeat" ||
                 GetActions()[j].GetType() == "ForEach" )
            {
                indentWidth += 15;
            }
        }
        yAction += 3;
    }

    eventRenderingNeedUpdate = false;
}

////////////////////////////////////////////////////////////
/// Renvoie la hauteur des conditions de l'évènement
////////////////////////////////////////////////////////////
int StandardEvent::GetConditionsHeight() const
{
    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();

    unsigned int conditionsHeight = 0;

    const int separation = 1;
    const int sideSeparation = 1;

    if ( GetConditions().empty() )
        conditionsHeight = 17+1; //Taille nécessaire pour afficher "Pas de conditions" et "Pas d'actions"
    else
    {
        wxMemoryDC dc;
        dc.SelectObject(renderedEventBitmap);

        //La classe de rendu de HTML
        renderingHelper->GetHTMLRenderer().SetDC(&dc); //On a besoin du même DC que pour le rendu
        renderingHelper->GetHTMLRenderer().SetStandardFonts( 8 );
        const int iconWidth = 18;

        int yCondition = 0;
        int indentWidth = 0;
        yCondition += 1;
        for ( unsigned int j = 0;j < GetConditions().size();j++ )
        {
            const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(GetConditions()[j].GetType());

            //Largeur prise par les icones
            int leftIconsWidth = 0;
            if ( GetConditions()[j].IsInverted() )
                leftIconsWidth += 18;

            if ( !GetConditions()[j].IsLocal() )
                leftIconsWidth += 18;

            //Largeur libre pour le texte
            int freeWidth = (renderingHelper->GetConditionsColumnWidth() - 0) - leftIconsWidth - indentWidth - iconWidth - sideSeparation*2;
            freeWidth = freeWidth <= 0 ? 1 : freeWidth;
            renderingHelper->GetHTMLRenderer().SetSize(freeWidth, 9999);

            yCondition += separation;

            //Calcul de la hauteur prise par le texte
            renderingHelper->GetHTMLRenderer().SetHtmlText(TranslateCondition::Translate(GetConditions()[j], instructionInfos, false, true));
            yCondition += renderingHelper->GetHTMLRenderer().GetTotalHeight()+separation+1;

            GetConditions()[j].renderedHeight = renderingHelper->GetHTMLRenderer().GetTotalHeight();
            GetConditions()[j].renderedHeightNeedUpdate = false;

            //Indentation
            if ( GetConditions()[j].GetType() == "Repeat" ||
                 GetConditions()[j].GetType() == "ForEach" ||
                 GetConditions()[j].GetType() == "While" )
            {
                indentWidth += 15;
            }
        }
        yCondition += 3;
        conditionsHeight = yCondition;
    }

    return conditionsHeight;
}

////////////////////////////////////////////////////////////
/// Renvoie la hauteur des actions de l'évènement
////////////////////////////////////////////////////////////
int StandardEvent::GetActionsHeight() const
{
    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();

    const int separation = 1;
    const int sideSeparation = 1;

    unsigned int actionsHeight = 0;

    if ( GetActions().empty() )
        actionsHeight = 17+1; //Taille nécessaire pour afficher "Pas de conditions" et "Pas d'actions"
    else
    {
        wxMemoryDC dc;
        dc.SelectObject(renderedEventBitmap);

        //La classe de rendu de HTML
        renderingHelper->GetHTMLRenderer().SetDC(&dc); //On a besoin du même DC que pour le rendu
        renderingHelper->GetHTMLRenderer().SetStandardFonts( 8 );
        const int iconWidth = 18;

        int yAction = 0;
        int indentWidth = 0;
        yAction += 1;
        for ( unsigned int j = 0;j < GetActions().size();j++ )
        {
            const InstructionInfos & instructionInfos = extensionManager->GetActionInfos(GetActions()[j].GetType());

            //Largeur prise par les icones
            int leftIconsWidth = 0;
            if ( !GetActions()[j].IsLocal() )
                leftIconsWidth += 18;

            //Largeur libre pour le texte
            int freeWidth = renderedWidth - (renderingHelper->GetConditionsColumnWidth() - 0) - leftIconsWidth - indentWidth - iconWidth - 0 - sideSeparation*2;
            freeWidth = freeWidth <= 0 ? 1 : freeWidth;
            renderingHelper->GetHTMLRenderer().SetSize(freeWidth, 9999);

            yAction += separation;

            //Calcul de la hauteur prise par le texte
            renderingHelper->GetHTMLRenderer().SetHtmlText(TranslateAction::Translate( GetActions()[j], instructionInfos, false, true ));
            yAction += renderingHelper->GetHTMLRenderer().GetTotalHeight()+separation+1;

            GetActions()[j].renderedHeight = renderingHelper->GetHTMLRenderer().GetTotalHeight();
            GetActions()[j].renderedHeightNeedUpdate = false;

            //Indentation
            if ( GetActions()[j].GetType() == "Repeat" ||
                 GetActions()[j].GetType() == "ForEach" )
            {
                indentWidth += 15;
            }
        }
        yAction += 3;
        actionsHeight = yAction;
    }

    return actionsHeight;
}

#endif

/**
 * Initialize from another StandardEvent.
 * Used by copy ctor and assignement operator
 */
void StandardEvent::Init(const StandardEvent & event)
{
    events.clear();
    for (unsigned int i =0;i<events.size();++i)
    	events.push_back( events[i]->Clone() );

    conditions = conditions;
    actions = actions;
}

/**
 * Custom copy operator
 */
StandardEvent::StandardEvent(const StandardEvent & event) :
BaseEvent(event)
{
    Init(event);
}

/**
 * Custom assignement operator
 */
StandardEvent& StandardEvent::operator=(const StandardEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}
