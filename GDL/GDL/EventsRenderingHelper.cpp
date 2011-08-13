/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include "EventsRenderingHelper.h"
#include <utility>
#include <vector>
#include <string>
#include <wx/renderer.h>
#include "GDL/Instruction.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/TranslateAction.h"
#include "GDL/TranslateCondition.h"
#include "GDL/CommonTools.h"
#include "GDL/EventsEditorItemsAreas.h"
#include "GDL/EventsEditorSelection.h"
#include "GDL/Event.h"

EventsRenderingHelper * EventsRenderingHelper::singleton = NULL;

wxPoint EventsRenderingHelper::DrawTextInArea(wxString text, wxDC & dc, wxRect rect, wxPoint point)
{
    if ( text.empty() || rect.width == 0) return point;

    //Insert artificial space to simulate starting from point indicated
    int spacesToInsert = static_cast<float>(point.x-rect.x)/static_cast<float>(fontCharacterWidth);
    if ( spacesToInsert < 0 ) spacesToInsert = 0;
    for (unsigned int i = 0;i<spacesToInsert;++i)
    {
        text = " "+text;
    }
    point.x = rect.x; //We can now start from rect.x as space have been inserted.

    unsigned int textSize = text.length()*fontCharacterWidth;
    int cutCount = ceil(static_cast<double>(textSize)/static_cast<double>(rect.width));
    int charactersInALine = static_cast<double>(rect.width)/static_cast<double>(textSize)*static_cast<double>(text.length());

    if ( cutCount == 0 ) cutCount = 1;
    if ( charactersInALine == 0) charactersInALine = 1;

    size_t lastCutPosition = 0;
    wxString displayedText;
    for (unsigned int i = 0;i<cutCount;++i)
    {
        if (i != 0 ) point.y += 15;

        displayedText = text.Mid(lastCutPosition, charactersInALine);
        dc.DrawText(displayedText, point);

        lastCutPosition += charactersInALine;
    }

    //Return position to lastest drawn character
    return wxPoint(point.x+displayedText.length()*fontCharacterWidth, point.y);
}

unsigned int EventsRenderingHelper::GetTextHeightInArea(wxString text, unsigned int widthAvailable)
{
    if ( text.empty() || widthAvailable == 0) return 0;

    int cutCount = ceil(static_cast<double>(text.length()*fontCharacterWidth)/static_cast<double>(widthAvailable));

    return cutCount*15;
}

EventsRenderingHelper::EventsRenderingHelper() :
eventGradient1(wxColour(209, 217, 255)),
eventGradient2(wxColour(196, 207, 255)),
eventGradient3(wxColour(233, 233, 255)),
eventGradient4(wxColour(205, 205, 255)),
eventBorderColor(wxColour(185, 185, 247)),
eventConditionsGradient1(wxColour(234, 242, 255)),
eventConditionsGradient2(wxColour(221, 232, 255)),
eventConditionsGradient3(wxColour(237, 237, 255)),
eventConditionsGradient4(wxColour(210, 210, 255)),
eventConditionsBorderColor(wxColour(185, 185, 247)),
selectionColor(wxColour(255,230,156)),
disabledColor(wxColour(245,245,254)),
disabledColor2(wxColour(245,245,245)),
instructionsListBorder(5),
separationBetweenInstructions(2),
conditionsColumnWidth(400),
selectionRectangleOutline(wxPen(wxColour(244,217,141), 1)),
selectionRectangleFill(wxBrush(wxColour(251,235,189))),
highlightRectangleOutline(wxPen(wxColour(226,226,226), 1)),
highlightRectangleFill(wxBrush(wxColour(226,226,226))),
niceRectangleFill1(wxColour(225,225,246)),
niceRectangleFill2(wxColour(198,198,246)),
niceRectangleOutline(wxPen(wxColour(205,205,246), 1)),
actionsRectangleOutline(wxPen(wxColour(205,205,246))),
conditionsRectangleOutline(wxPen(wxColour(185,185,247), 1)),
actionsRectangleFill(wxBrush(wxColour(230,230,230))),
conditionsRectangleFill(wxBrush(wxColour(252,252,255))),
niceFont(wxFont(8, wxFONTFAMILY_DEFAULT, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL))
{
    fakeBmp.Create(10,10,-1);
    //SetFont(wxFont(10, wxFONTFAMILY_DEFAULT, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL, false, "Arial"));
    SetFont(wxFont(9, wxFONTFAMILY_TELETYPE, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL, false, "Consolas"));
}

void EventsRenderingHelper::SetFont(const wxFont & font_)
{
    font = font_;

    wxMemoryDC dc;
    dc.SelectObject(fakeBmp);
    dc.SetFont(font);

    fontCharacterWidth = static_cast<float>(dc.GetTextExtent("abcdef").GetWidth())/6.0f;
}

int EventsRenderingHelper::DrawConditionsList(vector < Instruction > & conditions, wxDC & dc, int x, int y, int width, BaseEvent * event, EventsEditorItemsAreas & areas, EventsEditorSelection & selection)
{
    int initialYPosition = y;

    dc.SetFont(font);
    const int iconWidth = 18;
    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();

    //Draw Conditions rectangle
    const int conditionsHeight = GetRenderedConditionsListHeight(conditions, width);
    wxRect rect(x-1, y-1, width+2, conditionsHeight+2);
    dc.SetPen(conditionsRectangleOutline);
    dc.SetBrush(conditionsRectangleFill);
    dc.DrawRectangle(rect);

    InstructionListItem item(/**isCondition=*/true, &conditions, event);
    areas.AddInstructionListArea(rect, item);

    if ( conditions.empty() )
    {
        dc.SetTextForeground( wxColour(0,0,0) );
        dc.SetFont( niceFont.Italic() );
        dc.DrawText( _("Pas de conditions"), x + 2, y + 1 );

        return 15;
    }

    //Draw each conditions
    for ( unsigned int j = 0;j < conditions.size();j++ )
    {
        if ( j != 0 ) y += separationBetweenInstructions;

        const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(conditions[j].GetType());
        InstructionItem accessor(&conditions[j], /*isCondition=*/true, &conditions, j, event);

        //Get the width available
        int leftIconsWidth = conditions[j].IsInverted() ? iconWidth*2 : iconWidth;
        int freeWidth = width - leftIconsWidth;
        freeWidth = freeWidth <= 0 ? 1 : freeWidth;

        //Draw
        int height = 0;
        if ( selection.InstructionSelected(accessor) )
        {
            std::string text = TranslateCondition::Translate(conditions[j], instructionInfos);
            height = GetTextHeightInArea(text, freeWidth);

            dc.SetPen(selectionRectangleOutline);
            dc.SetBrush(selectionRectangleFill);
            dc.DrawRectangle(x, y, width, height);
            DrawInstruction(conditions[j], instructionInfos, /*isCondition=*/true, dc, wxPoint(x + leftIconsWidth, y), freeWidth, event, areas, selection);
        }
        else if ( selection.InstructionHighlighted(accessor) )
        {
            std::string text = TranslateCondition::Translate(conditions[j], instructionInfos);
            height = GetTextHeightInArea(text, freeWidth);

            dc.SetPen(highlightRectangleOutline);
            dc.SetBrush(highlightRectangleFill);
            dc.DrawRectangle(x, y, width, height);
            DrawInstruction(conditions[j], instructionInfos, /*isCondition=*/true, dc, wxPoint(x + leftIconsWidth, y), freeWidth, event, areas, selection);

            if ( selection.IsDraggingInstruction() )
            {
                dc.SetPen(wxPen(wxColour(0,0,0)));
                dc.SetBrush(wxBrush(wxColour(0,0,0)));
                dc.DrawRectangle(x + leftIconsWidth+2, y, width-2 -iconWidth -2, 2);
            }
        }
        else
            height = DrawInstruction(conditions[j], instructionInfos, /*isCondition=*/true, dc, wxPoint(x + leftIconsWidth, y), freeWidth, event, areas, selection);

        //Draw needed icons
        if ( conditions[j].IsInverted() )
        {
            dc.DrawBitmap( wxBitmap( "res/contraire.png", wxBITMAP_TYPE_ANY ), x + 1, y, true );
            if ( instructionInfos.smallicon.IsOk() ) dc.DrawBitmap( instructionInfos.smallicon, x + iconWidth + 1, y, true );
        }
        else if ( instructionInfos.smallicon.IsOk() ) dc.DrawBitmap( instructionInfos.smallicon, x + 1, y, true );

        areas.AddInstructionArea(wxRect(x,y, width, height), accessor);
        y+=height;

        //Draw sub conditions
        if ( instructionInfos.canHaveSubInstructions )
            y += DrawConditionsList(conditions[j].GetSubInstructions(), dc, x + 18, y, width-18, event, areas, selection);
    }

    return y-initialYPosition;
}

int EventsRenderingHelper::DrawActionsList(vector < Instruction > & actions, wxDC & dc, int x, int y, int width, BaseEvent * event, EventsEditorItemsAreas & areas, EventsEditorSelection & selection)
{
    int initialYPosition = y;

    dc.SetFont(font);
    const int iconWidth = 18;
    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();

    //Draw Actions rectangle
    const int actionsHeight = GetRenderedActionsListHeight(actions, width);
    wxRect rect(x-1, y-1, width+2, actionsHeight+2);
    dc.SetPen(actionsRectangleOutline);
    //dc.SetBrush(actionsRectangleFill);
    //dc.GradientFillLinear(rect, wxColour(235,235,235), wxColour(250,250,250), wxSOUTH);
    dc.SetBrush(*wxWHITE_BRUSH);
    dc.DrawRectangle(rect);

    InstructionListItem item(/**isCondition=*/false, &actions, event);
    areas.AddInstructionListArea(rect, item);

    if ( actions.empty() )
    {
        dc.SetTextForeground( wxColour(0,0,0) );
        dc.SetFont( niceFont.Italic() );
        dc.DrawText( _("Pas d'actions"), x + 2, y + 1 );

        return 15;
    }

    //Draw each actions
    for ( unsigned int j = 0;j < actions.size();j++ )
    {
        if ( j != 0 ) y += separationBetweenInstructions;

        const InstructionInfos & instructionInfos = extensionManager->GetActionInfos(actions[j].GetType());
        InstructionItem accessor(&actions[j], /*isCondition=*/false, &actions, j, event);

        //Get the width available
        int freeWidth = width - iconWidth;
        freeWidth = freeWidth <= 0 ? 1 : freeWidth;

        int height = 0;
        if ( selection.InstructionSelected(accessor) )
        {
            std::string text = TranslateAction::GetInstance()->Translate(actions[j], instructionInfos);
            height = GetTextHeightInArea(text, freeWidth);

            dc.SetPen(selectionRectangleOutline);
            dc.SetBrush(selectionRectangleFill);
            dc.DrawRectangle(x, y, width, height);
            DrawInstruction(actions[j], instructionInfos, /*isCondition=*/false, dc, wxPoint(x + iconWidth, y), freeWidth, event, areas, selection);
        }
        else if ( selection.InstructionHighlighted(accessor) )
        {
            std::string text = TranslateAction::GetInstance()->Translate(actions[j], instructionInfos);
            height = GetTextHeightInArea(text, freeWidth);

            dc.SetPen(highlightRectangleOutline);
            dc.SetBrush(highlightRectangleFill);
            dc.DrawRectangle(x, y, width, height);
            wxRendererNative::Get().DrawItemSelectionRect(NULL, dc, wxRect(x,y, width,height), wxCONTROL_CURRENT);
            DrawInstruction(actions[j], instructionInfos, /*isCondition=*/false, dc, wxPoint(x + iconWidth, y), freeWidth, event, areas, selection);

            if ( selection.IsDraggingInstruction() )
            {
                dc.SetPen(wxPen(wxColour(0,0,0)));
                dc.SetBrush(wxBrush(wxColour(0,0,0)));
                dc.DrawRectangle(x + iconWidth + 2, y, width -2 - iconWidth - 2, 2);
            }
        }
        else
            height = DrawInstruction(actions[j], instructionInfos, /*isCondition=*/false, dc, wxPoint(x + iconWidth, y), freeWidth, event, areas, selection);

        //Draw needed icons
        if ( instructionInfos.smallicon.IsOk() ) dc.DrawBitmap( instructionInfos.smallicon, x + 1, y, true );

        areas.AddInstructionArea(wxRect(x,y, width, height), accessor);
        y+=height;

        //Draw sub actions
        if ( instructionInfos.canHaveSubInstructions )
            y += DrawActionsList(actions[j].GetSubInstructions(), dc, x + 18, y, width-18, event, areas, selection);
    }

    return y-initialYPosition;
}

unsigned int EventsRenderingHelper::GetRenderedConditionsListHeight(const vector < Instruction > & conditions, int width)
{
    int y = 0;

    const int iconWidth = 18;
    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();

    if ( conditions.empty() )
        return 15;

    for ( unsigned int j = 0;j < conditions.size();j++ )
    {
        if ( j != 0 ) y += separationBetweenInstructions;

        const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(conditions[j].GetType());

        //Get the width available
        int leftIconsWidth = conditions[j].IsInverted() ? iconWidth*2 : iconWidth;
        int freeWidth = width - leftIconsWidth;
        freeWidth = freeWidth <= 0 ? 1 : freeWidth;

        int height = GetTextHeightInArea(TranslateCondition::Translate(conditions[j], instructionInfos), freeWidth);
        y += height;

        //Sub conditions
        if ( instructionInfos.canHaveSubInstructions )
            y += GetRenderedConditionsListHeight(conditions[j].GetSubInstructions(), width-18);
    }

    return y;
}

unsigned int EventsRenderingHelper::GetRenderedActionsListHeight(const vector < Instruction > & actions, int width)
{
    int y = 0;

    const int iconWidth = 18;
    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();

    //Draw Actions rectangle
    if ( actions.empty() )
        return 15;

    //Draw each actions
    for ( unsigned int j = 0;j < actions.size();j++ )
    {
        if ( j != 0 ) y += separationBetweenInstructions;

        const InstructionInfos & instructionInfos = extensionManager->GetActionInfos(actions[j].GetType());

        //Get the width available
        int freeWidth = width - iconWidth;
        freeWidth = freeWidth <= 0 ? 1 : freeWidth;

        int height = GetTextHeightInArea(TranslateAction::GetInstance()->Translate(actions[j], instructionInfos), freeWidth);
        y+=height;

        //Draw sub actions
        if ( instructionInfos.canHaveSubInstructions )
            y += GetRenderedActionsListHeight(actions[j].GetSubInstructions(), width-18);
    }

    return y;
}

int EventsRenderingHelper::DrawInstruction(Instruction & instruction, const InstructionInfos & instructionInfos, bool isCondition, wxDC & dc, wxPoint point, int freeWidth, BaseEvent * event, EventsEditorItemsAreas & areas, EventsEditorSelection & selection)
{
    std::vector< std::pair<std::string, TextFormatting > > formattedStr = isCondition ? TranslateCondition::GetAsFormattedText(instruction, instructionInfos) :
                                                                                        TranslateAction::GetInstance()->GetAsFormattedText(instruction, instructionInfos);

    wxPoint lastPos = point;
    //size_t alreadyWrittenCharCount = 0;
    for (unsigned int i = 0;i<formattedStr.size();++i)
    {
        dc.SetTextForeground(formattedStr[i].second.color);
        font.SetWeight(formattedStr[i].second.bold ? wxFONTWEIGHT_BOLD : wxFONTWEIGHT_NORMAL);
        font.SetStyle(formattedStr[i].second.italic ? wxFONTSTYLE_ITALIC : wxFONTSTYLE_NORMAL);
        std::string text = formattedStr[i].first;

        //Verify if we are drawing a parameter
        if ( formattedStr[i].second.userData != std::string::npos)
        {
            ParameterItem item( formattedStr[i].second.userData < instruction.GetParameters().size() ? &instruction.GetParameter(formattedStr[i].second.userData) : NULL, event );

            int parameterWidth = (text.length()*fontCharacterWidth <= freeWidth-lastPos.x+point.x ? text.length()*fontCharacterWidth : freeWidth-lastPos.x+point.x);
            if ( selection.ParameterHighLighted(item) )
            {
                dc.SetBrush(wxBrush(wxColour(255, 163, 163)));
                dc.SetPen(wxPen(wxColour(209, 0, 0)));
                dc.DrawRectangle(lastPos.x, lastPos.y,  parameterWidth, 15);
            }

            areas.AddParameterArea(wxRect(lastPos.x, lastPos.y, parameterWidth,15) ,item);
        }

        dc.SetFont(font);
        lastPos = DrawTextInArea(text, dc, wxRect(point.x, point.y, freeWidth, 0/*Useless*/), lastPos);
    }

    font.SetWeight(wxFONTWEIGHT_NORMAL);
    font.SetStyle(wxFONTSTYLE_NORMAL);
    dc.SetFont(font);

    return lastPos.y-point.y+15;
}

void EventsRenderingHelper::DrawNiceRectangle(wxDC & dc, const wxRect & rect) const
{
    {
        wxRect background(rect);

        background.x += 2;
        background.y += 2;
        background.width -= 4;
        background.height -= 4;
        dc.GradientFillLinear(background, niceRectangleFill1, niceRectangleFill2, wxSOUTH);
    }

    wxPoint border_points[9];
    border_points[0] = wxPoint(1, rect.height - 4);
    border_points[1] = wxPoint(1, 3);
    border_points[2] = wxPoint(3, 1);
    border_points[3] = wxPoint(rect.width - 4, 1);
    border_points[4] = wxPoint(rect.width - 2, 3);
    border_points[5] = wxPoint(rect.width - 2, rect.height - 4);
    border_points[6] = wxPoint(rect.width - 4, rect.height - 2);
    border_points[7] = wxPoint(3, rect.height - 2);
    border_points[8] = wxPoint(1, rect.height - 4);

    dc.SetPen(niceRectangleOutline);
    dc.DrawLines(sizeof(border_points)/sizeof(wxPoint), border_points, rect.x, rect.y);
}

EventsRenderingHelper * EventsRenderingHelper::GetInstance()
{
    if ( NULL == singleton )
        singleton = new EventsRenderingHelper;

    return singleton;
}

void EventsRenderingHelper::DestroySingleton()
{
    if ( NULL != singleton )
    {
        delete singleton;
        singleton = NULL;
    }
}

std::string EventsRenderingHelper::GetHTMLText(std::string str)
{
    size_t pos = 0;
    while ( str.find("&", pos) != string::npos)
    {
        str.replace( str.find( "&", pos), 1, "&amp;" );
        pos = str.find( "&", pos)+1;
    }

    while ( str.find("<") != string::npos)
        str.replace( str.find( "<" ), 1, "&lt;" );

    while ( str.find(">") != string::npos)
        str.replace( str.find( ">" ), 1, "&gt;" );

    while ( str.find("\n") != string::npos)
        str.replace( str.find( "\n" ), 1, "<br>" );

    return str;
}

#endif
