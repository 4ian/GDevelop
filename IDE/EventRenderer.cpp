/**
 * Game Develop
 *    Editeur
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Affiche un évènement sur une zone de dessin
 */

#ifdef DEBUG
#include "nommgr.h"
#endif

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
#ifdef DEBUG

#endif

EventRenderer::EventRenderer(wxBufferedPaintDC & dc_, const Event & event_, int origineX_, int origineY_, int editorWidth_, int conditionsColumnWidth_) :
dc(dc_),
event(event_),
origineX(origineX_),
origineY(origineY_),
editorWidth(editorWidth_),
conditionsColumnWidth(conditionsColumnWidth_)
{
    //ctor
}

EventRenderer::~EventRenderer()
{
    //dtor
}

////////////////////////////////////////////////////////////
/// Rendu d'un évènement
////////////////////////////////////////////////////////////
void EventRenderer::Render() const
{
    gdp::ExtensionsManager * extensionManager = gdp::ExtensionsManager::getInstance();

    //La classe de rendu de HTML
    htmlRenderer.SetDC(&dc);
    htmlRenderer.SetStandardFonts( 8 );
    const int iconWidth = 18;
    const int separation = 1;
    const int sideSeparation = 1;

    //Préparation
    dc.SetFont( wxFont( 8, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    dc.SetPen(wxPen(wxColour(242/2,242/2,242/2), 1));
    dc.SetBrush(wxBrush(wxColour(242,242,242)));
    if ( selected ) dc.SetPen(wxPen(wxColour(0, 0, 0), 1));
    if ( selected ) dc.SetBrush(wxBrush(wxSystemSettings::GetColour(wxSYS_COLOUR_HIGHLIGHT)));

    dc.DrawRectangle(origineX, origineY, editorWidth-origineX, GetHeight());

    dc.SetPen(wxPen(wxColour(0,0,0), 1));
    dc.SetBrush(wxBrush(wxColour(230,235,239)));
    if ( selected ) dc.SetBrush(wxBrush(wxSystemSettings::GetColour(wxSYS_COLOUR_HIGHLIGHT)));

    int yCondition = origineY;
    if ( event.conditions.empty() )
    {
        //Pas de conditions, on affiche juste un petit message
        dc.SetFont( wxFont( 8, wxDEFAULT, wxFONTSTYLE_ITALIC, wxNORMAL ) );
        dc.DrawRectangle(origineX, origineY, (conditionsColumnWidth - origineX), 17+1);
        dc.DrawText( _("Pas de conditions"), origineX + 2, origineY + 1 );
    }
    else
    {
        dc.DrawRectangle(origineX, origineY, (conditionsColumnWidth - origineX), GetConditionsHeight());

        int indentWidth = 0;
        yCondition += 1;
        for ( unsigned int j = 0;j < event.conditions.size();j++ )
        {
            const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(event.conditions[j].GetType());

            //Petit texte "ou" si besoin
            if ( event.type == "OR" && j != 0 )
            {
                dc.SetFont( wxFont( 5, wxDEFAULT, wxFONTSTYLE_ITALIC, wxNORMAL ) );
                dc.DrawText(_("ou"), origineX + indentWidth + sideSeparation, yCondition );
                yCondition += 9;
            }

            //Icones
            int leftIconsWidth = 0;
            if ( event.conditions[j].IsInverted() )
            {
                dc.DrawBitmap( wxBitmap( "res/contraire.png", wxBITMAP_TYPE_ANY ), origineX + indentWidth + sideSeparation + leftIconsWidth, yCondition, true );
                leftIconsWidth += 18;
            }
            if ( !event.conditions[j].IsLocal() )
            {
                dc.DrawBitmap( wxBitmap( "res/global.png", wxBITMAP_TYPE_ANY ), origineX + indentWidth + sideSeparation + leftIconsWidth, yCondition, true );
                leftIconsWidth += 18;
            }

            //Largeur libre pour le texte
            int freeWidth = (conditionsColumnWidth - origineX) - leftIconsWidth - indentWidth - iconWidth - sideSeparation*2;
            freeWidth = freeWidth <= 0 ? 1 : freeWidth;
            htmlRenderer.SetSize(freeWidth, 9999);

            yCondition += separation;

            //Image
            dc.DrawBitmap( instructionInfos.smallicon, origineX + indentWidth + sideSeparation + leftIconsWidth, yCondition, true );

            //Calcul de la hauteur prise par le texte
            string TexteFinal = TranslateCondition::Translate(event.conditions[j], instructionInfos,  false, true);
            htmlRenderer.SetHtmlText(TexteFinal);
            wxArrayInt neededArray;
            htmlRenderer.Render(origineX + indentWidth + sideSeparation + leftIconsWidth + iconWidth, yCondition, neededArray);

            yCondition += htmlRenderer.GetTotalHeight()+separation+1;

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

    int yAction = origineY;
    if ( event.actions.empty() )
    {
        dc.SetFont( wxFont( 8, wxDEFAULT, wxFONTSTYLE_ITALIC, wxNORMAL ) );
        dc.DrawText( _("Pas d'actions"), origineX + (conditionsColumnWidth - origineX) + 2, origineY +1 );
    }
    else
    {
        int indentWidth = 0;
        yAction += 1;
        for ( unsigned int j = 0;j < event.actions.size();j++ )
        {
            const InstructionInfos & instructionInfos = extensionManager->GetActionInfos(event.actions[j].GetType());

            //Largeur prise par les icones
            int leftIconsWidth = 0;
            if ( !event.actions[j].IsLocal() )
            {
                dc.DrawBitmap( wxBitmap( "res/global.png", wxBITMAP_TYPE_ANY ), origineX + (conditionsColumnWidth - origineX) + indentWidth + sideSeparation + leftIconsWidth, yAction, true );
                leftIconsWidth += 18;
            }

            //Largeur libre pour le texte
            int freeWidth = editorWidth - (conditionsColumnWidth - origineX) - leftIconsWidth - indentWidth - iconWidth - origineX - sideSeparation*2;
            freeWidth = freeWidth <= 0 ? 1 : freeWidth;
            htmlRenderer.SetSize(freeWidth, 9999);

            yAction += separation;

            dc.DrawBitmap( instructionInfos.smallicon, origineX + (conditionsColumnWidth - origineX) + indentWidth + sideSeparation + leftIconsWidth, yAction, true );

            //Calcul de la hauteur prise par le texte
            htmlRenderer.SetHtmlText(TranslateAction::Translate( event.actions[j], instructionInfos, false, true ));
            wxArrayInt neededArray;
            htmlRenderer.Render(origineX + (conditionsColumnWidth - origineX) + indentWidth + leftIconsWidth + iconWidth + sideSeparation, yAction, neededArray);

            yAction += htmlRenderer.GetTotalHeight()+separation+1;

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

    if ( event.conditionsHeightNeedUpdate )
    {
        if (  event.conditions.empty() )
            event.conditionsHeight = 17+1; //Taille nécessaire pour afficher "Pas de conditions" et "Pas d'actions"
        else
        {
            //La classe de rendu de HTML
            htmlRenderer.SetDC(&dc); //On a besoin du même DC que pour le rendu
            htmlRenderer.SetStandardFonts( 8 );
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
                int freeWidth = (conditionsColumnWidth - origineX) - leftIconsWidth - indentWidth - iconWidth - sideSeparation*2;
                freeWidth = freeWidth <= 0 ? 1 : freeWidth;
                htmlRenderer.SetSize(freeWidth, 9999);

                yCondition += separation;

                //Calcul de la hauteur prise par le texte
                htmlRenderer.SetHtmlText(TranslateCondition::Translate(event.conditions[j], instructionInfos, false, true));
                yCondition += htmlRenderer.GetTotalHeight()+separation+1;

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

    if ( event.actionsHeightNeedUpdate )
    {
        if ( event.actions.empty() )
            event.actionsHeightNeedUpdate = 17+1; //Taille nécessaire pour afficher "Pas de conditions" et "Pas d'actions"
        else
        {
            //La classe de rendu de HTML
            htmlRenderer.SetDC(&dc); //On a besoin du même DC que pour le rendu
            htmlRenderer.SetStandardFonts( 8 );
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
                int freeWidth = editorWidth - (conditionsColumnWidth - origineX) - leftIconsWidth - indentWidth - iconWidth - origineX - sideSeparation*2;
                freeWidth = freeWidth <= 0 ? 1 : freeWidth;
                htmlRenderer.SetSize(freeWidth, 9999);

                yAction += separation;

                //Calcul de la hauteur prise par le texte
                htmlRenderer.SetHtmlText(TranslateAction::Translate( event.actions[j], instructionInfos, false, true ));
                yAction += htmlRenderer.GetTotalHeight()+separation+1;

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
