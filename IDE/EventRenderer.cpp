/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "EventRenderer.h"
#include "GDL/Event.h"
#include "GDL/ExtensionsManager.h"
#include <wx/dc.h>
#include <wx/dcbuffer.h>
#include <wx/brush.h>
#include <wx/settings.h>
#include <wx/fs_mem.h>
#include <wx/html/htmprint.h>

#include "TranslateCondition.h"
#include "TranslateAction.h"

EventRenderer::EventRenderer(wxBufferedPaintDC & dc_, const Event & event_, EventsRendererDatas & eventsRenderersDatas_) :
dc(dc_),
event(event_),
renderingDatas(eventsRenderersDatas_)
{
    //ctor
}

////////////////////////////////////////////////////////////
/// Rendu d'un évènement
////////////////////////////////////////////////////////////
void EventRenderer::Render() const
{
    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    //La classe de rendu de HTML
    renderingDatas.GetHTMLRenderer().SetDC(&dc);
    renderingDatas.GetHTMLRenderer().SetStandardFonts( 8 );
    const int iconWidth = 18;
    const int separation = 1;
    const int sideSeparation = 1;

    //Setup colors
    dc.SetFont(renderingDatas.GetFont());
    if ( !event.selected )
    {
        dc.SetPen(renderingDatas.GetRectangleOutlinePen());
        dc.SetBrush(renderingDatas.GetRectangleFillBrush());
    }
    else
    {
        dc.SetPen(renderingDatas.GetSelectedRectangleOutlinePen());
        dc.SetBrush(renderingDatas.GetSelectedRectangleFillBrush());
    }

    //Draw event rectangle
    dc.SetPen(*wxTRANSPARENT_PEN);
    dc.SetBrush(wxBrush(wxColour(255, 255, 255), wxBRUSHSTYLE_SOLID));
    {
        wxRect rect(renderingDatas.GetOrigineX(),
                         renderingDatas.GetOrigineY(),
                         renderingDatas.GetRenderZoneWidth()-renderingDatas.GetOrigineX(),
                         GetHeight());

        if ( !event.selected )
            DrawNiceRectangle(rect, renderingDatas.eventGradient1,
                                    renderingDatas.eventGradient2,
                                    renderingDatas.eventGradient3,
                                    renderingDatas.eventGradient4,
                                    renderingDatas.eventBorderColor);
        else
            DrawNiceRectangle(rect, renderingDatas.selectionColor,
                                    renderingDatas.eventGradient2,
                                    renderingDatas.eventGradient3,
                                    renderingDatas.selectionColor,
                                    renderingDatas.eventBorderColor);
    }

    dc.SetPen(renderingDatas.GetSelectedRectangleOutlinePen());

    //Draw conditions
    int yCondition = renderingDatas.GetOrigineY();
    if ( event.conditions.empty() )
    {
        //Pas de conditions, on affiche juste un petit message
        wxRect rect(renderingDatas.GetOrigineX(),
                         renderingDatas.GetOrigineY(),
                         renderingDatas.GetConditionsColumnWidth()-renderingDatas.GetOrigineX(),
                         17+1);
        DrawNiceRectangle(rect, renderingDatas.eventConditionsGradient1,
                                renderingDatas.eventConditionsGradient2,
                                renderingDatas.eventConditionsGradient3,
                                renderingDatas.eventConditionsGradient4,
                                renderingDatas.eventConditionsBorderColor);

        dc.SetFont( renderingDatas.GetItalicFont() );
        dc.DrawText( _("Pas de conditions"), renderingDatas.GetOrigineX() + 2, renderingDatas.GetOrigineY() + 1 );
    }
    else
    {
        //Draw Conditions rectangle
        wxRect rect(renderingDatas.GetOrigineX(),
                         renderingDatas.GetOrigineY(),
                         renderingDatas.GetConditionsColumnWidth()-renderingDatas.GetOrigineX(),
                         GetConditionsHeight());
        DrawNiceRectangle(rect, renderingDatas.eventConditionsGradient1,
                                renderingDatas.eventConditionsGradient2,
                                renderingDatas.eventConditionsGradient3,
                                renderingDatas.eventConditionsGradient4,
                                renderingDatas.eventConditionsBorderColor);

        //Draw each conditions
        int indentWidth = 0;
        yCondition += 1;
        for ( unsigned int j = 0;j < event.conditions.size();j++ )
        {
            const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(event.conditions[j].GetType());

            //"OR" text if needed
            if ( event.type == "OR" && j != 0 )
            {
                dc.SetFont( renderingDatas.GetItalicSmallFont() );
                dc.DrawText(_("ou"), renderingDatas.GetOrigineX() + indentWidth + sideSeparation, yCondition );
                yCondition += 9;
            }

            //Draw needed icons
            int leftIconsWidth = 0;
            if ( event.conditions[j].IsInverted() )
            {
                dc.DrawBitmap( wxBitmap( "res/contraire.png", wxBITMAP_TYPE_ANY ), renderingDatas.GetOrigineX() + indentWidth + sideSeparation + leftIconsWidth, yCondition, true );
                leftIconsWidth += 18;
            }
            if ( !event.conditions[j].IsLocal() )
            {
                dc.DrawBitmap( wxBitmap( "res/global.png", wxBITMAP_TYPE_ANY ), renderingDatas.GetOrigineX() + indentWidth + sideSeparation + leftIconsWidth, yCondition, true );
                leftIconsWidth += 18;
            }

            //Get the width available
            int freeWidth = (renderingDatas.GetConditionsColumnWidth() - renderingDatas.GetOrigineX()) - leftIconsWidth - indentWidth - iconWidth - sideSeparation*2;
            freeWidth = freeWidth <= 0 ? 1 : freeWidth;
            renderingDatas.GetHTMLRenderer().SetSize(freeWidth, 9999);

            yCondition += separation;

            if ( event.conditions[j].selected )
            {
                dc.SetBrush(renderingDatas.GetSelectedRectangleFillBrush());
                dc.SetPen(renderingDatas.GetSelectedRectangleOutlinePen());
                dc.DrawRectangle(renderingDatas.GetOrigineX() + indentWidth + sideSeparation + leftIconsWidth + iconWidth,
                                 yCondition,
                                 renderingDatas.GetConditionsColumnWidth()-(renderingDatas.GetOrigineX() + indentWidth + sideSeparation + leftIconsWidth + iconWidth)-2,
                                 event.conditions[j].renderedHeight);
            }

            //Draw the condition icon
            dc.DrawBitmap( instructionInfos.smallicon, renderingDatas.GetOrigineX() + indentWidth + sideSeparation + leftIconsWidth, yCondition, true );

            //Draw the condition text
            string TexteFinal = TranslateCondition::Translate(event.conditions[j], instructionInfos,  false, true);
            renderingDatas.GetHTMLRenderer().SetHtmlText(TexteFinal);
            wxArrayInt neededArray;
            renderingDatas.GetHTMLRenderer().Render(renderingDatas.GetOrigineX() + indentWidth + sideSeparation + leftIconsWidth + iconWidth, yCondition, neededArray);

            yCondition += renderingDatas.GetHTMLRenderer().GetTotalHeight()+separation+1;

            //Indentation
            if ( event.conditions[j].GetType() == "Repeat" ||
                 event.conditions[j].GetType() == "ForEach" ||
                 event.conditions[j].GetType() == "While" )
            {
                indentWidth += 15;
            }
        }
        yCondition += 3;
    }

    //Draw actions
    int yAction = renderingDatas.GetOrigineY();
    if ( event.actions.empty() )
    {
        dc.SetFont( renderingDatas.GetItalicFont() );
        dc.DrawText( _("Pas d'actions"), renderingDatas.GetOrigineX() + (renderingDatas.GetConditionsColumnWidth() - renderingDatas.GetOrigineX()) + 2, renderingDatas.GetOrigineY() +1 );
    }
    else
    {
        //Draw each actions
        int indentWidth = 0;
        yAction += 1;
        for ( unsigned int j = 0;j < event.actions.size();j++ )
        {
            const InstructionInfos & instructionInfos = extensionManager->GetActionInfos(event.actions[j].GetType());

            //Draw global icon, if needed.
            int leftIconsWidth = 0;
            if ( !event.actions[j].IsLocal() )
            {
                dc.DrawBitmap( wxBitmap( "res/global.png", wxBITMAP_TYPE_ANY ), renderingDatas.GetOrigineX() + (renderingDatas.GetConditionsColumnWidth() - renderingDatas.GetOrigineX()) + indentWidth + sideSeparation + leftIconsWidth, yAction, true );
                leftIconsWidth += 18;
            }

            //Get the width available
            int freeWidth = renderingDatas.GetRenderZoneWidth() - (renderingDatas.GetConditionsColumnWidth() - renderingDatas.GetOrigineX()) - leftIconsWidth - indentWidth - iconWidth - renderingDatas.GetOrigineX() - sideSeparation*2;
            freeWidth = freeWidth <= 0 ? 1 : freeWidth;
            renderingDatas.GetHTMLRenderer().SetSize(freeWidth, 9999);

            //Draw the bitmap of the action
            yAction += separation;

            if ( event.actions[j].selected )
            {
                dc.SetBrush(renderingDatas.GetSelectedRectangleFillBrush());
                dc.SetPen(renderingDatas.GetSelectedRectangleOutlinePen());
                dc.DrawRectangle(renderingDatas.GetOrigineX() + (renderingDatas.GetConditionsColumnWidth() - renderingDatas.GetOrigineX()) + indentWidth + leftIconsWidth + iconWidth + sideSeparation,
                                 yAction,
                                 renderingDatas.GetRenderZoneWidth() - (renderingDatas.GetOrigineX() + (renderingDatas.GetConditionsColumnWidth() - renderingDatas.GetOrigineX()) + indentWidth + leftIconsWidth + iconWidth + sideSeparation)-2,
                                 event.actions[j].renderedHeight);
            }

            dc.DrawBitmap( instructionInfos.smallicon, renderingDatas.GetOrigineX() + (renderingDatas.GetConditionsColumnWidth() - renderingDatas.GetOrigineX()) + indentWidth + sideSeparation + leftIconsWidth, yAction, true );

            //Draw the action text
            renderingDatas.GetHTMLRenderer().SetHtmlText(TranslateAction::Translate( event.actions[j], instructionInfos, false, true ));
            wxArrayInt neededArray;
            renderingDatas.GetHTMLRenderer().Render(renderingDatas.GetOrigineX() + (renderingDatas.GetConditionsColumnWidth() - renderingDatas.GetOrigineX()) + indentWidth + leftIconsWidth + iconWidth + sideSeparation, yAction, neededArray);

            yAction += renderingDatas.GetHTMLRenderer().GetTotalHeight()+separation+1;

            //Indentation
            if ( event.actions[j].GetType() == "Repeat" ||
                 event.actions[j].GetType() == "ForEach" )
            {
                indentWidth += 15;
            }
        }
        yAction += 3;
    }
}

////////////////////////////////////////////////////////////
/// Renvoie la hauteur de l'évènement
////////////////////////////////////////////////////////////
int EventRenderer::GetHeight() const
{
    int conditionsHeight = GetConditionsHeight();
    int actionsHeight = GetActionsHeight();

    return conditionsHeight > actionsHeight ? conditionsHeight : actionsHeight;
}

////////////////////////////////////////////////////////////
/// Renvoie la hauteur des conditions de l'évènement
////////////////////////////////////////////////////////////
int EventRenderer::GetConditionsHeight() const
{
    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    const int separation = 1;
    const int sideSeparation = 1;

    for ( unsigned int j = 0;j < event.conditions.size();j++ )
    {
        if (event.conditions[j].renderedHeightNeedUpdate == true)
            event.conditionsHeightNeedUpdate = true;
    }

    if ( event.conditionsHeightNeedUpdate )
    {
        if (  event.conditions.empty() )
            event.conditionsHeight = 17+1; //Taille nécessaire pour afficher "Pas de conditions" et "Pas d'actions"
        else
        {
            //La classe de rendu de HTML
            renderingDatas.GetHTMLRenderer().SetDC(&dc); //On a besoin du même DC que pour le rendu
            renderingDatas.GetHTMLRenderer().SetStandardFonts( 8 );
            const int iconWidth = 18;

            int yCondition = 0;
            int indentWidth = 0;
            yCondition += 1;
            for ( unsigned int j = 0;j < event.conditions.size();j++ )
            {
                const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(event.conditions[j].GetType());

                //Petit espace pour le "ou" si besoin
                if ( event.type == "OR" && j != 0 )
                    yCondition += 9;

                //Largeur prise par les icones
                int leftIconsWidth = 0;
                if ( event.conditions[j].IsInverted() )
                    leftIconsWidth += 18;

                if ( !event.conditions[j].IsLocal() )
                    leftIconsWidth += 18;

                //Largeur libre pour le texte
                int freeWidth = (renderingDatas.GetConditionsColumnWidth() - renderingDatas.GetOrigineX()) - leftIconsWidth - indentWidth - iconWidth - sideSeparation*2;
                freeWidth = freeWidth <= 0 ? 1 : freeWidth;
                renderingDatas.GetHTMLRenderer().SetSize(freeWidth, 9999);

                yCondition += separation;

                //Calcul de la hauteur prise par le texte
                renderingDatas.GetHTMLRenderer().SetHtmlText(TranslateCondition::Translate(event.conditions[j], instructionInfos, false, true));
                yCondition += renderingDatas.GetHTMLRenderer().GetTotalHeight()+separation+1;

                event.conditions[j].renderedHeight = renderingDatas.GetHTMLRenderer().GetTotalHeight();
                event.conditions[j].renderedHeightNeedUpdate = false;

                //Indentation
                if ( event.conditions[j].GetType() == "Repeat" ||
                     event.conditions[j].GetType() == "ForEach" ||
                     event.conditions[j].GetType() == "While" )
                {
                    indentWidth += 15;
                }
            }
            yCondition += 3;
            event.conditionsHeight = yCondition;
        }
        event.conditionsHeightNeedUpdate = false;
    }

    return event.conditionsHeight;
}

////////////////////////////////////////////////////////////
/// Renvoie la hauteur des actions de l'évènement
////////////////////////////////////////////////////////////
int EventRenderer::GetActionsHeight() const
{
    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    const int separation = 1;
    const int sideSeparation = 1;

    for ( unsigned int j = 0;j < event.actions.size();j++ )
    {
        if (event.actions[j].renderedHeightNeedUpdate == true)
            event.actionsHeightNeedUpdate = true;
    }

    if ( event.actionsHeightNeedUpdate )
    {
        if ( event.actions.empty() )
            event.actionsHeightNeedUpdate = 17+1; //Taille nécessaire pour afficher "Pas de conditions" et "Pas d'actions"
        else
        {
            //La classe de rendu de HTML
            renderingDatas.GetHTMLRenderer().SetDC(&dc); //On a besoin du même DC que pour le rendu
            renderingDatas.GetHTMLRenderer().SetStandardFonts( 8 );
            const int iconWidth = 18;

            int yAction = 0;
            int indentWidth = 0;
            yAction += 1;
            for ( unsigned int j = 0;j < event.actions.size();j++ )
            {
                const InstructionInfos & instructionInfos = extensionManager->GetActionInfos(event.actions[j].GetType());

                //Largeur prise par les icones
                int leftIconsWidth = 0;
                if ( !event.actions[j].IsLocal() )
                    leftIconsWidth += 18;

                //Largeur libre pour le texte
                int freeWidth = renderingDatas.GetRenderZoneWidth() - (renderingDatas.GetConditionsColumnWidth() - renderingDatas.GetOrigineX()) - leftIconsWidth - indentWidth - iconWidth - renderingDatas.GetOrigineX() - sideSeparation*2;
                freeWidth = freeWidth <= 0 ? 1 : freeWidth;
                renderingDatas.GetHTMLRenderer().SetSize(freeWidth, 9999);

                yAction += separation;

                //Calcul de la hauteur prise par le texte
                renderingDatas.GetHTMLRenderer().SetHtmlText(TranslateAction::Translate( event.actions[j], instructionInfos, false, true ));
                yAction += renderingDatas.GetHTMLRenderer().GetTotalHeight()+separation+1;

                event.actions[j].renderedHeight = renderingDatas.GetHTMLRenderer().GetTotalHeight();
                event.actions[j].renderedHeightNeedUpdate = false;

                //Indentation
                if ( event.actions[j].GetType() == "Repeat" ||
                     event.actions[j].GetType() == "ForEach" )
                {
                    indentWidth += 15;
                }
            }
            yAction += 3;
            event.actionsHeight = yAction;
        }
        event.actionsHeightNeedUpdate = false;
    }

    return event.actionsHeight;
}

void EventRenderer::DrawNiceRectangle(const wxRect & rect, const wxColor & color1, const wxColor & color2,const wxColor & color3,const wxColor & color4,const wxColor & color5) const
{
    {
        wxRect background(rect);
        background.x += 2;
        background.width -= 4;
        background.height -= 2;

        background.height = 3;
        dc.GradientFillLinear(background, color1, color2, wxSOUTH);

        background.y += background.height;
        background.height = rect.height - 2 - background.height;
        dc.GradientFillLinear(background, color3, color4, wxSOUTH);
    }
    {
        wxPoint border_points[8];
        border_points[0] = wxPoint(2, 0);
        border_points[1] = wxPoint(1, 1);
        border_points[2] = wxPoint(1, rect.height - 4);
        border_points[3] = wxPoint(3, rect.height - 2);
        border_points[4] = wxPoint(rect.width - 4, rect.height - 2);
        border_points[5] = wxPoint(rect.width - 2, rect.height - 4);
        border_points[6] = wxPoint(rect.width - 2, 1);
        border_points[7] = wxPoint(rect.width - 4, -1);

        dc.SetPen(wxPen(color5));
        dc.DrawLines(sizeof(border_points)/sizeof(wxPoint), border_points, rect.x, rect.y);
    }
}
