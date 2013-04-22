/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "EventsRenderingHelper.h"
#include <utility>
#include <vector>
#include <string>
#include <wx/dcclient.h>
#include <wx/dcmemory.h>
#include <wx/renderer.h>
#include "GDCore/Events/Instruction.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/IDE/MetadataProvider.h"
#include "GDCore/IDE/ActionSentenceFormatter.h"
#include "GDCore/IDE/ConditionSentenceFormatter.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/IDE/EventsEditorSelection.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "GDCore/Events/Event.h"

using namespace std;

namespace gd
{

EventsRenderingHelper * EventsRenderingHelper::singleton = NULL;

wxPoint EventsRenderingHelper::DrawTextInArea(std::string text, wxDC & dc, wxRect rect, wxPoint point)
{
    if ( text.empty() || rect.width == 0) return point;

    //Insert artificial space to simulate starting from point indicated
    int spacesToInsert = static_cast<float>(point.x-rect.x)/static_cast<float>(fontCharacterWidth);
    if ( spacesToInsert < 0 ) spacesToInsert = 0;
    for (unsigned int i = 0;i<spacesToInsert;++i)
    {
        text = " "+text;
    }
    point.x = rect.x; //We can now start from rect.x as spaces have been inserted.

    int charactersInALine = floor(static_cast<double>(rect.width)/static_cast<double>(fontCharacterWidth));
    if ( charactersInALine <= 0) charactersInALine = 1;

    int cutCount = ceil(static_cast<double>(text.length())/static_cast<double>(charactersInALine));
    if ( cutCount <= 0 ) cutCount = 1;

    size_t lastCutPosition = 0;
    wxString displayedText;
    for (unsigned int i = 0;i<cutCount;++i)
    {
        if (i != 0 ) point.y += 15;

        #if defined(LINUX)
        try
        {
        #endif
        displayedText = text.substr(lastCutPosition, charactersInALine);
        #if defined(LINUX)
        }
        catch(...)
        {
            std::cout << "Error rendering:" << text << ";" << std::endl;
        }
        #endif

        dc.DrawText(displayedText, point);

        lastCutPosition += charactersInALine;
    }

    //Return position to latest drawn character
    return wxPoint(point.x+displayedText.length()*fontCharacterWidth, point.y);
}

unsigned int EventsRenderingHelper::GetTextHeightInArea(const std::string & text, unsigned int widthAvailable)
{
    if ( text.empty() || widthAvailable == 0) return 0;

    int charactersInALine = floor(static_cast<double>(widthAvailable)/static_cast<double>(fontCharacterWidth));
    if ( charactersInALine <= 0) charactersInALine = 1;

    int cutCount = ceil(static_cast<double>(text.length())/static_cast<double>(charactersInALine));
    if ( cutCount <= 0 ) cutCount = 1;

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
highlightRectangleOutline(wxPen(wxColour(206,206,206), 1)),
highlightRectangleFill(wxBrush(wxColour(226,226,226))),
niceRectangleFill1(wxColour(225,225,246)),
niceRectangleFill2(wxColour(198,198,246)),
niceRectangleOutline(wxPen(wxColour(205,205,246), 1)),
actionsRectangleOutline(wxPen(wxColour(205,205,246))),
conditionsRectangleOutline(wxPen(wxColour(185,185,247), 1)),
actionsRectangleFill(*wxWHITE_BRUSH),
conditionsRectangleFill(wxBrush(wxColour(252,252,255))),
niceFont(wxFont(8, wxFONTFAMILY_DEFAULT, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL))
{
    fakeBmp.Create(10,10,-1);
    #if defined(WINDOWS)
    SetFont(wxFont(9, wxFONTFAMILY_TELETYPE, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL, false, "Consolas"));
    #else
    SetFont(wxFont(9, wxFONTFAMILY_TELETYPE, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL, false));
    #endif
}

void EventsRenderingHelper::SetFont(const wxFont & font_)
{
    font = font_;

    //Update the character width
    wxMemoryDC dc;
    dc.SelectObject(fakeBmp);
    dc.SetFont(font);
    fontCharacterWidth = static_cast<float>(dc.GetTextExtent("abcdef").GetWidth())/6.0f;
}

int EventsRenderingHelper::DrawConditionsList(vector < gd::Instruction > & conditions, wxDC & dc, int x, int y, int width, gd::BaseEvent * event,
                                              EventsEditorItemsAreas & areas, EventsEditorSelection & selection, const gd::Platform & platform)
{
    int initialYPosition = y;

    dc.SetFont(font);
    const int iconWidth = 18;

    //Draw Conditions rectangle
    const int conditionsHeight = GetRenderedConditionsListHeight(conditions, width, platform);
    wxRect rect(x-1, y-1, width+2, conditionsHeight+2);
    dc.SetPen(conditionsRectangleOutline);
    dc.SetBrush(conditionsRectangleFill);
    dc.DrawRectangle(rect);

    InstructionListItem item(/**isCondition=*/true, &conditions, event);
    areas.AddInstructionListArea(rect, item);

    if ( conditions.empty() )
    {
        if ( selection.IsDraggingInstruction() && selection.InstructionListHighlighted(item) )
        {
            dc.SetPen(wxPen(wxColour(0,0,0)));
            dc.SetBrush(wxBrush(wxColour(0,0,0)));
            dc.DrawRectangle(x + 2, y, width-2, 2);
        }

        dc.SetTextForeground( wxColour(0,0,0) );
        dc.SetFont( niceFont.Italic() );
        dc.DrawText( _("No conditions"), x + 2, y + 1 );

        return 15;
    }

    //Draw each conditions
    for ( unsigned int j = 0;j < conditions.size();j++ )
    {
        if ( j != 0 ) y += separationBetweenInstructions;

        const gd::InstructionMetadata & InstructionMetadata = MetadataProvider::GetConditionMetadata(platform, conditions[j].GetType());
        InstructionItem accessor(&conditions[j], /*isCondition=*/true, &conditions, j, event);

        //Get the width available
        int leftIconsWidth = conditions[j].IsInverted() ? iconWidth*2 : iconWidth;
        int freeWidth = width - leftIconsWidth;
        freeWidth = freeWidth <= 0 ? 1 : freeWidth;

        //Draw
        int height = 0;
        if ( selection.InstructionSelected(accessor) )
        {
            std::string text = ConditionSentenceFormatter::Translate(conditions[j], InstructionMetadata);
            height = GetTextHeightInArea(text, freeWidth);

            dc.SetPen(selectionRectangleOutline);
            dc.SetBrush(selectionRectangleFill);
            dc.DrawRectangle(x, y, width, height);
            DrawInstruction(conditions[j], InstructionMetadata, /*isCondition=*/true, dc, wxPoint(x + leftIconsWidth, y), freeWidth, event, areas, selection);
        }
        else if ( selection.InstructionHighlighted(accessor) )
        {
            std::string text = ConditionSentenceFormatter::Translate(conditions[j], InstructionMetadata);
            height = GetTextHeightInArea(text, freeWidth);

            dc.SetPen(highlightRectangleOutline);
            dc.SetBrush(highlightRectangleFill);
            dc.DrawRectangle(x, y, width, height);
            DrawInstruction(conditions[j], InstructionMetadata, /*isCondition=*/true, dc, wxPoint(x + leftIconsWidth, y), freeWidth, event, areas, selection);

            if ( selection.IsDraggingInstruction() )
            {
                dc.SetPen(wxPen(wxColour(0,0,0)));
                dc.SetBrush(wxBrush(wxColour(0,0,0)));
                dc.DrawRectangle(x + leftIconsWidth+2, selection.IsInstructionHighlightedOnBottomPart() ? y+height :y, width-2 -iconWidth -2, 2);
            }
        }
        else
            height = DrawInstruction(conditions[j], InstructionMetadata, /*isCondition=*/true, dc, wxPoint(x + leftIconsWidth, y), freeWidth, event, areas, selection);

        //Draw needed icons
        if ( conditions[j].IsInverted() )
        {
            dc.DrawBitmap( gd::CommonBitmapManager::GetInstance()->invertedCondition, x + 1, y, true );
            if ( InstructionMetadata.GetSmallBitmapIcon().IsOk() ) dc.DrawBitmap( InstructionMetadata.GetSmallBitmapIcon(), x + iconWidth + 1, y, true );
        }
        else if ( InstructionMetadata.GetSmallBitmapIcon().IsOk() ) dc.DrawBitmap( InstructionMetadata.GetSmallBitmapIcon(), x + 1, y, true );

        areas.AddInstructionArea(wxRect(x,y, width, height), accessor);
        y+=height;

        //Draw sub conditions
        if ( InstructionMetadata.CanHaveSubInstructions() )
            y += DrawConditionsList(conditions[j].GetSubInstructions(), dc, x + 18, y, width-18, event, areas, selection, platform);
    }

    return y-initialYPosition;
}

int EventsRenderingHelper::DrawActionsList(vector < gd::Instruction > & actions, wxDC & dc, int x, int y, int width, gd::BaseEvent * event,
                                           EventsEditorItemsAreas & areas, EventsEditorSelection & selection, const gd::Platform & platform)
{
    int initialYPosition = y;

    dc.SetFont(font);
    const int iconWidth = 18;

    //Draw Actions rectangle
    const int actionsHeight = GetRenderedActionsListHeight(actions, width, platform);
    wxRect rect(x-1, y-1, width+2, actionsHeight+2);
    dc.SetPen(actionsRectangleOutline);
    dc.SetBrush(actionsRectangleFill);
    dc.DrawRectangle(rect);

    InstructionListItem item(/**isCondition=*/false, &actions, event);
    areas.AddInstructionListArea(rect, item);

    if ( actions.empty() )
    {
        if ( selection.IsDraggingInstruction() && selection.InstructionListHighlighted(item) )
        {
            dc.SetPen(wxPen(wxColour(0,0,0)));
            dc.SetBrush(wxBrush(wxColour(0,0,0)));
            dc.DrawRectangle(x + 2, y, width-2, 2);
        }

        dc.SetTextForeground( wxColour(0,0,0) );
        dc.SetFont( niceFont.Italic() );
        dc.DrawText( _("No actions"), x + 2, y + 1 );

        return 15;
    }

    //Draw each actions
    for ( unsigned int j = 0;j < actions.size();j++ )
    {
        if ( j != 0 ) y += separationBetweenInstructions;

        const gd::InstructionMetadata & instructionMetadata = MetadataProvider::GetActionMetadata(platform, actions[j].GetType());
        InstructionItem accessor(&actions[j], /*isCondition=*/false, &actions, j, event);

        //Get the width available
        int freeWidth = width - iconWidth;
        freeWidth = freeWidth <= 0 ? 1 : freeWidth;

        int height = 0;
        if ( selection.InstructionSelected(accessor) )
        {
            std::string text = ActionSentenceFormatter::GetInstance()->Translate(actions[j], instructionMetadata);
            height = GetTextHeightInArea(text, freeWidth);

            dc.SetPen(selectionRectangleOutline);
            dc.SetBrush(selectionRectangleFill);
            dc.DrawRectangle(x, y, width, height);
            DrawInstruction(actions[j], instructionMetadata, /*isCondition=*/false, dc, wxPoint(x + iconWidth, y), freeWidth, event, areas, selection);
        }
        else if ( selection.InstructionHighlighted(accessor) )
        {
            std::string text = ActionSentenceFormatter::GetInstance()->Translate(actions[j], instructionMetadata);
            height = GetTextHeightInArea(text, freeWidth);

            dc.SetPen(highlightRectangleOutline);
            dc.SetBrush(highlightRectangleFill);
            dc.DrawRectangle(x, y, width, height);
            DrawInstruction(actions[j], instructionMetadata, /*isCondition=*/false, dc, wxPoint(x + iconWidth, y), freeWidth, event, areas, selection);

            if ( selection.IsDraggingInstruction() )
            {
                dc.SetPen(wxPen(wxColour(0,0,0)));
                dc.SetBrush(wxBrush(wxColour(0,0,0)));
                dc.DrawRectangle(x + iconWidth + 2, selection.IsInstructionHighlightedOnBottomPart() ? y+height :y , width -2 - iconWidth - 2, 2);
            }
        }
        else
            height = DrawInstruction(actions[j], instructionMetadata, /*isCondition=*/false, dc, wxPoint(x + iconWidth, y), freeWidth, event, areas, selection);

        //Draw needed icons
        if ( instructionMetadata.GetSmallBitmapIcon().IsOk() ) dc.DrawBitmap( instructionMetadata.GetSmallBitmapIcon(), x + 1, y, true );

        areas.AddInstructionArea(wxRect(x,y, width, height), accessor);
        y+=height;

        //Draw sub actions
        if ( instructionMetadata.CanHaveSubInstructions() )
            y += DrawActionsList(actions[j].GetSubInstructions(), dc, x + 18, y, width-18, event, areas, selection, platform);
    }

    return y-initialYPosition;
}

unsigned int EventsRenderingHelper::GetRenderedConditionsListHeight(const vector < gd::Instruction > & conditions, int width, const gd::Platform & platform)
{
    int y = 0;

    const int iconWidth = 18;

    if ( conditions.empty() )
        return 15;

    for ( unsigned int j = 0;j < conditions.size();j++ )
    {
        if ( j != 0 ) y += separationBetweenInstructions;

        const gd::InstructionMetadata & instructionMetadata = MetadataProvider::GetConditionMetadata(platform, conditions[j].GetType());

        //Get the width available
        int leftIconsWidth = conditions[j].IsInverted() ? iconWidth*2 : iconWidth;
        int freeWidth = width - leftIconsWidth;
        freeWidth = freeWidth <= 0 ? 1 : freeWidth;

        int height = GetTextHeightInArea(ConditionSentenceFormatter::Translate(conditions[j], instructionMetadata), freeWidth);
        y += height;

        //Sub conditions
        if ( instructionMetadata.CanHaveSubInstructions() )
            y += GetRenderedConditionsListHeight(conditions[j].GetSubInstructions(), width-18, platform);
    }

    return y;
}

unsigned int EventsRenderingHelper::GetRenderedActionsListHeight(const vector < gd::Instruction > & actions, int width, const gd::Platform & platform)
{
    int y = 0;

    const int iconWidth = 18;

    //Draw Actions rectangle
    if ( actions.empty() )
        return 15;

    //Draw each actions
    for ( unsigned int j = 0;j < actions.size();j++ )
    {
        if ( j != 0 ) y += separationBetweenInstructions;

        const gd::InstructionMetadata & instructionMetadata = MetadataProvider::GetActionMetadata(platform, actions[j].GetType());

        //Get the width available
        int freeWidth = width - iconWidth;
        freeWidth = freeWidth <= 0 ? 1 : freeWidth;

        int height = GetTextHeightInArea(ActionSentenceFormatter::GetInstance()->Translate(actions[j], instructionMetadata), freeWidth);
        y+=height;

        //Draw sub actions
        if ( instructionMetadata.CanHaveSubInstructions() )
            y += GetRenderedActionsListHeight(actions[j].GetSubInstructions(), width-18, platform);
    }

    return y;
}

int EventsRenderingHelper::DrawInstruction(gd::Instruction & instruction, const gd::InstructionMetadata & instructionMetadata, bool isCondition,
                                           wxDC & dc, wxPoint point, int freeWidth, gd::BaseEvent * event, EventsEditorItemsAreas & areas, EventsEditorSelection & selection)
{
    std::vector< std::pair<std::string, TextFormatting > > formattedStr = isCondition ? ConditionSentenceFormatter::GetAsFormattedText(instruction, instructionMetadata) :
                                                                                        ActionSentenceFormatter::GetInstance()->GetAsFormattedText(instruction, instructionMetadata);

    wxPoint lastPos = point;
    //size_t alreadyWrittenCharCount = 0;
    for (unsigned int i = 0;i<formattedStr.size();++i)
    {
        //Update font and properties
        dc.SetTextForeground(!event->IsDisabled() ? formattedStr[i].second.color : wxColour(160,160,160));
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

}
