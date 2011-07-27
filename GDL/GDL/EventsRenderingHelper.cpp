/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include "EventsRenderingHelper.h"
#include "GDL/Instruction.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/TranslateAction.h"
#include "GDL/TranslateCondition.h"
#include "GDL/CommonTools.h"

EventsRenderingHelper * EventsRenderingHelper::singleton = NULL;

unsigned int DrawTextInArea(wxString text, wxDC & dc, wxPoint point, unsigned int widthAvailable)
{
    if ( text.empty() || widthAvailable == 0) return 0;

    wxSize textSize = dc.GetTextExtent(text);
    int cutCount = ceil(static_cast<double>(textSize.GetWidth())/static_cast<double>(widthAvailable));
    int charactersInALine = static_cast<double>(widthAvailable)/static_cast<double>(textSize.GetWidth())*static_cast<double>(text.length());

    if ( cutCount == 0 ) cutCount = 1;
    if ( charactersInALine == 0) charactersInALine = 1;

    size_t lastCutPosition = 0;
    for (unsigned int i = 0;i<cutCount;++i)
    {
        wxString displayedText = text.Mid(lastCutPosition, charactersInALine);

        dc.DrawText(displayedText, point);

        lastCutPosition += charactersInALine;
        point.y += 15;
    }

    return cutCount*15;
}

unsigned int GetTextHeightInArea(wxString text, wxDC & dc, unsigned int widthAvailable)
{
    if ( text.empty() || widthAvailable == 0) return 0;

    int cutCount = ceil(static_cast<double>(dc.GetTextExtent(text).GetWidth())/static_cast<double>(widthAvailable));

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
conditionsColumnWidth(200),
selectionRectangleOutline(wxPen(wxColour(255,230,156), 1)),
selectionRectangleFill(wxBrush(wxColour(255/2,230/2,156/2))),
niceRectangleFill1(wxColour(205,205,246)),
niceRectangleFill2(wxColour(198,198,246)),
niceRectangleOutline(wxPen(wxColour(185,185,247), 1)),
actionsRectangleOutline(wxPen(wxColour(185,185,247), 1)),
conditionsRectangleOutline(wxPen(wxColour(185,185,247), 1)),
actionsRectangleFill(wxBrush(wxColour(255,255,255))),
conditionsRectangleFill(wxBrush(wxColour(255,255,255))),
font( 8, wxDEFAULT, wxNORMAL, wxNORMAL ),
bigFont(12, wxDEFAULT, wxNORMAL, wxNORMAL ),
boldFont(8, wxDEFAULT, wxNORMAL, wxBOLD ),
italicFont( 8, wxDEFAULT, wxFONTSTYLE_ITALIC, wxNORMAL ),
italicSmallFont( 5, wxDEFAULT, wxFONTSTYLE_ITALIC, wxNORMAL )
{
    fakeBmp.Create(10,10,-1);
}

void EventsRenderingHelper::DrawNiceRectangle(wxDC & dc, const wxRect & rect) const
{
    const int shadowWidth = 3;
    {
        wxRect background(rect);

        background.x += shadowWidth;
        background.y += shadowWidth;
        background.width -= shadowWidth*2;
        background.height -= shadowWidth*2;
        dc.SetPen(niceRectangleOutline);
        dc.DrawRectangle(background);

        background.x += 1;
        background.y += 1;
        background.width -= 2;
        background.height -= 2;
        dc.GradientFillLinear(background, niceRectangleFill1, niceRectangleFill2, wxSOUTH);
    }
    {
        wxRect shadowRect(rect);
        shadowRect.y += 1;
        shadowRect.height -= 2;
        shadowRect.width = shadowWidth;

        dc.GradientFillLinear(shadowRect, wxColour(190,190,190), wxColour(240,240,240,0), wxLEFT);
    }
    {
        wxRect shadowRect(rect);
        shadowRect.x += shadowRect.width-shadowWidth;
        shadowRect.y += 1;
        shadowRect.height -= 2;
        shadowRect.width = shadowWidth;

        dc.GradientFillLinear(shadowRect, wxColour(190,190,190), wxColour(240,240,240,0), wxRIGHT);
    }
    {
        wxRect shadowRect(rect);
        shadowRect.x += 1;
        shadowRect.width -= 2;
        shadowRect.height = shadowWidth;

        dc.GradientFillLinear(shadowRect, wxColour(190,190,190), wxColour(230,230,230,0), wxNORTH);
    }
    {
        wxRect shadowRect(rect);
        shadowRect.y += shadowRect.height-shadowWidth;
        shadowRect.x += 1;
        shadowRect.width -= 2;
        shadowRect.height = shadowWidth;

        dc.GradientFillLinear(shadowRect, wxColour(190,190,190), wxColour(230,230,230,0), wxSOUTH);
    }
}

int EventsRenderingHelper::DrawConditionsList(const vector < Instruction > & conditions, wxDC & dc, const int x, const int y, const int width, bool disabled)
{
    dc.SetFont(wxFont(10, wxFONTFAMILY_TELETYPE, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL, false, "Consolas"));
    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const int iconWidth = 18;
    const int separation = 1;
    const int sideSeparation = 1;

    const wxColor & color1 = disabled ? disabledColor2 : eventGradient1;
    const wxColor & color2 = disabled ? disabledColor : eventGradient2;
    const wxColor & color3 = disabled ? disabledColor : eventGradient3;
    const wxColor & color4 = disabled ? disabledColor2 : eventGradient4;

    //Draw Conditions rectangle
    const int conditionsRectangleSeparation = 2;
    const int conditionsHeight = GetRenderedConditionsListHeight(conditions, width);
    wxRect rect(x+conditionsRectangleSeparation,
                y+conditionsRectangleSeparation,
                width-conditionsRectangleSeparation,
                conditions.empty() ? 18-conditionsRectangleSeparation : conditionsHeight-conditionsRectangleSeparation);
    dc.SetPen(conditionsRectangleOutline);
    dc.SetBrush(conditionsRectangleFill);
    dc.DrawRectangle(rect);

    if ( conditions.empty() )
    {
        dc.SetFont( GetItalicFont() );
        dc.DrawText( _("Pas de conditions"), x + 2, y + 1 );

        return 18;
    }

    //Draw each conditions
    int yCondition = y + 1;
    for ( unsigned int j = 0;j < conditions.size();j++ )
    {
        const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(conditions[j].GetType());

        //Prepare html renderer. Need to be do for each conditions as dc can have been changed by sub conditions.
        /*GetHTMLRenderer().SetDC(&dc);
        GetHTMLRenderer().SetStandardFonts( 8 );*/

        //Draw needed icons
        int leftIconsWidth = 0;
        if ( conditions[j].IsInverted() )
        {
            dc.DrawBitmap( wxBitmap( "res/contraire.png", wxBITMAP_TYPE_ANY ), x  + sideSeparation + leftIconsWidth, yCondition, true );
            leftIconsWidth += 18;
        }
        if ( !conditions[j].IsLocal() )
        {
            dc.DrawBitmap( wxBitmap( "res/global.png", wxBITMAP_TYPE_ANY ), x  + sideSeparation + leftIconsWidth, yCondition, true );
            leftIconsWidth += 18;
        }

        //Get the width available
        int freeWidth = width - leftIconsWidth - iconWidth - sideSeparation*2;
        freeWidth = freeWidth <= 0 ? 1 : freeWidth;
        GetHTMLRenderer().SetSize(freeWidth, 9999);

        yCondition += separation;

        if ( conditions[j].selected )
        {
            dc.SetBrush(GetSelectedRectangleFillBrush());
            dc.SetPen(GetSelectedRectangleOutlinePen());
            dc.DrawRectangle(x + sideSeparation + leftIconsWidth + iconWidth,
                             yCondition,
                             width - (sideSeparation + leftIconsWidth + iconWidth),
                             conditions[j].renderedHeight);
        }

        //Draw the condition icon
        if ( instructionInfos.smallicon.IsOk() )
            dc.DrawBitmap( instructionInfos.smallicon, x + sideSeparation + leftIconsWidth, yCondition, true );

        //Draw the condition text
        //std::string beginTag = disabled ? "<FONT color=#BDBDBD>" : "";
        //std::string endTag = disabled ? "</FONT>" : "";
        //string TexteFinal = beginTag+TranslateCondition::Translate(conditions[j], instructionInfos)+endTag;
        //GetHTMLRenderer().SetHtmlText(TexteFinal);
        wxArrayInt neededArray;
        //GetHTMLRenderer().Render(x + sideSeparation + leftIconsWidth + iconWidth, yCondition, neededArray);

        yCondition += DrawTextInArea(TranslateCondition::Translate(conditions[j], instructionInfos),dc, wxPoint(x + sideSeparation + leftIconsWidth + iconWidth, yCondition), freeWidth)+separation+1;//GetHTMLRenderer().GetTotalHeight()+separation+1;

        //Draw sub conditions
        if ( !conditions[j].GetSubInstructions().empty() )
            yCondition += DrawConditionsList(conditions[j].GetSubInstructions(), dc, x + sideSeparation + leftIconsWidth + iconWidth + 18, yCondition, width-(sideSeparation + leftIconsWidth + iconWidth + 18), disabled);
        else if ( instructionInfos.canHaveSubInstructions )
        {
            dc.SetFont( GetItalicFont() );
            dc.DrawText( _("Pas de sous conditions"), x + sideSeparation + leftIconsWidth + iconWidth + 18, yCondition );
            yCondition += 18;
        }
    }
    yCondition += 3;

    return yCondition-y;
}

int EventsRenderingHelper::DrawActionsList(const vector < Instruction > & actions, wxDC & dc, const int x, const int y, const int width, bool disabled)
{
    dc.SetFont(wxFont(10, wxFONTFAMILY_TELETYPE, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL, false, "Consolas"));
    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const int iconWidth = 18;
    const int separation = 1;
    const int sideSeparation = 1;

    //Draw Conditions rectangle
    const int actionsRectangleSeparation = 2;
    const int actionsHeight = GetRenderedActionsListHeight(actions, width);
    wxRect rect(x+actionsRectangleSeparation,
                y+actionsRectangleSeparation,
                width-actionsRectangleSeparation,
                actions.empty() ? 18-actionsRectangleSeparation : actionsHeight-actionsRectangleSeparation);
    dc.SetPen(actionsRectangleOutline);
    dc.SetBrush(actionsRectangleFill);
    dc.DrawRectangle(rect);


    if ( actions.empty() )
    {
        dc.SetFont( GetItalicFont() );
        dc.DrawText( _("Pas d'actions"), x+ 2, y + 1 );
        return 18;
    }

    //Draw each actions
    int yAction = y + 1;
    for ( unsigned int j = 0;j < actions.size();j++ )
    {
        const InstructionInfos & instructionInfos = extensionManager->GetActionInfos(actions[j].GetType());

        //Prepare html renderer. Need to be do for each actions as dc can have been changed by sub actions.
        GetHTMLRenderer().SetDC(&dc);
        GetHTMLRenderer().SetStandardFonts( 8 );

        //Draw global icon, if needed.
        int leftIconsWidth = 0;
        if ( !actions[j].IsLocal() )
        {
            dc.DrawBitmap( wxBitmap( "res/global.png", wxBITMAP_TYPE_ANY ), x + sideSeparation + leftIconsWidth, yAction, true );
            leftIconsWidth += 18;
        }

        //Get the width available
        int freeWidth = width - leftIconsWidth - iconWidth - sideSeparation*2;
        freeWidth = freeWidth <= 0 ? 1 : freeWidth;
        GetHTMLRenderer().SetSize(freeWidth, 9999);

        //Draw the bitmap of the action
        yAction += separation;

        if ( actions[j].selected )
        {
            dc.SetBrush(GetSelectedRectangleFillBrush());
            dc.SetPen(GetSelectedRectangleOutlinePen());
            dc.DrawRectangle(x + leftIconsWidth + iconWidth + sideSeparation,
                             yAction,
                             width - (leftIconsWidth + iconWidth + sideSeparation)-2,
                             actions[j].renderedHeight);
        }

        if ( instructionInfos.smallicon.IsOk() )
            dc.DrawBitmap( instructionInfos.smallicon, x + sideSeparation + leftIconsWidth, yAction, true );

        //Draw the action text
        //std::string beginTag = disabled ? "<FONT color=#BDBDBD>" : "";
        //std::string endTag = disabled ? "</FONT>" : "";
        //GetHTMLRenderer().SetHtmlText(beginTag+TranslateAction::Translate( actions[j], instructionInfos )+endTag);
        wxArrayInt neededArray;
        //GetHTMLRenderer().Render(x + leftIconsWidth + iconWidth + sideSeparation, yAction, neededArray);

        yAction += DrawTextInArea(TranslateAction::Translate( actions[j], instructionInfos ),dc, wxPoint(x + sideSeparation + leftIconsWidth + iconWidth+sideSeparation, yAction), freeWidth)+separation+1; //GetHTMLRenderer().GetTotalHeight()+separation+1;
    }
    yAction += 3;

    return yAction-y;
}

unsigned int EventsRenderingHelper::GetRenderedConditionsListHeight(const vector < Instruction > & conditions, int width)
{
    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();

    const int separation = 1;
    const int sideSeparation = 1;
    const int iconWidth = 18;

    if ( conditions.empty() )
        return 18; //Taille nécessaire pour afficher "Pas de conditions" et "Pas d'actions"

    wxMemoryDC dc;
    dc.SelectObject(fakeBmp);
    dc.SetFont(wxFont(10, wxFONTFAMILY_TELETYPE, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL, false, "Consolas"));


    int yCondition = 1;
    for ( unsigned int j = 0;j < conditions.size();j++ )
    {
        const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(conditions[j].GetType());

        //Prepare html renderer. Need to be do for each conditions as dc can have been changed by sub conditions.
        GetHTMLRenderer().SetDC(&dc);
        GetHTMLRenderer().SetStandardFonts( 8 );

        //Largeur prise par les icones
        int leftIconsWidth = 0;
        if ( conditions[j].IsInverted() )
            leftIconsWidth += 18;

        if ( !conditions[j].IsLocal() )
            leftIconsWidth += 18;

        //Largeur libre pour le texte
        int freeWidth = width - leftIconsWidth - iconWidth - sideSeparation*2;
        freeWidth = freeWidth <= 0 ? 1 : freeWidth;
        GetHTMLRenderer().SetSize(freeWidth, 9999);

        yCondition += separation;

        //Calcul de la hauteur prise par le texte
        //GetHTMLRenderer().SetHtmlText(TranslateCondition::Translate(conditions[j], instructionInfos));
        unsigned int textTotalHeight = GetTextHeightInArea(TranslateCondition::Translate(conditions[j], instructionInfos),dc, freeWidth);//GetHTMLRenderer().GetTotalHeight();
        yCondition += textTotalHeight+separation+1;

        conditions[j].renderedHeight = textTotalHeight;
        conditions[j].renderedHeightNeedUpdate = false;

        if ( !conditions[j].GetSubInstructions().empty() )
            yCondition += GetRenderedConditionsListHeight(conditions[j].GetSubInstructions(), width-18);
        else if ( instructionInfos.canHaveSubInstructions )
            yCondition += 18;
    }
    yCondition += 3;
    return yCondition;
}

unsigned int EventsRenderingHelper::GetRenderedActionsListHeight(const vector < Instruction > & actions, int width)
{
    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();

    const int separation = 1;
    const int sideSeparation = 1;
    const int iconWidth = 18;

    if ( actions.empty() )
        return 18; //Taille nécessaire pour afficher "Pas d'actions"

    wxMemoryDC dc;
    dc.SelectObject(fakeBmp);
    dc.SetFont(wxFont(10, wxFONTFAMILY_TELETYPE, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL, false, "Consolas"));

    //La classe de rendu de HTML

    int yAction = 1;
    for ( unsigned int j = 0;j < actions.size();j++ )
    {
        const InstructionInfos & instructionInfos = extensionManager->GetActionInfos(actions[j].GetType());

        //Prepare html renderer. Need to be do for each actions as dc can have been changed by sub actions.
        GetHTMLRenderer().SetDC(&dc);
        GetHTMLRenderer().SetStandardFonts( 8 );

        //Largeur prise par les icones
        int leftIconsWidth = 0;
        if ( !actions[j].IsLocal() )
            leftIconsWidth += 18;

        //Largeur libre pour le texte
        int freeWidth = width - leftIconsWidth - iconWidth - 0 - sideSeparation*2;
        freeWidth = freeWidth <= 0 ? 1 : freeWidth;
        GetHTMLRenderer().SetSize(freeWidth, 9999);

        yAction += separation;

        //Calcul de la hauteur prise par le texte
        //GetHTMLRenderer().SetHtmlText(TranslateAction::Translate( actions[j], instructionInfos ));
        unsigned int textTotalHeight = GetTextHeightInArea(TranslateAction::Translate( actions[j], instructionInfos ),dc, freeWidth);//GetHTMLRenderer().GetTotalHeight();
        yAction += textTotalHeight+separation+1;

        actions[j].renderedHeight = textTotalHeight;
        actions[j].renderedHeightNeedUpdate = false;
    }
    yAction += 3;

    return yAction;
}

bool EventsRenderingHelper::GetConditionAt(vector < Instruction > & conditions, int x, int y, vector < Instruction > *& conditionList, unsigned int & conditionIdInList)
{
    const int separation = 1;
    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();

    int conditionsY = 1;
    for (unsigned int c = 0;c<conditions.size();++c)
    {
        const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(conditions[c].GetType());

        conditionsY += separation;
        if ( y >= conditionsY && y <= conditionsY+conditions[c].renderedHeight)
        {
            conditionList = &conditions;
            conditionIdInList = c;
            return true;
        }

        conditionsY += conditions[c].renderedHeight+separation+1;

        //Check also sub conditions
        if ( !conditions[c].GetSubInstructions().empty() )
        {
            if ( GetConditionAt(conditions[c].GetSubInstructions(), x-18, y-conditionsY, conditionList, conditionIdInList) )
                return true;

            //Add subconditions height
            conditionsY += 1;
            for (unsigned int sc = 0;sc<conditions[c].GetSubInstructions().size();++sc)
                conditionsY += GetRenderedInstructionAndSubInstructionsHeight(conditions[c].GetSubInstructions()[sc]); //TODO : Fail with Sub sub conditions
            conditionsY += 3;
        }
        else if ( instructionInfos.canHaveSubInstructions )
        {
            if ( y >= conditionsY && y <= conditionsY+18 )
            {
                conditionList = &conditions[c].GetSubInstructions();
                conditionIdInList = 0;
                return true;
            }
            conditionsY += 18;
        }
    }
    return false;
}

unsigned int EventsRenderingHelper::GetRenderedInstructionAndSubInstructionsHeight(const Instruction & instr)
{
    const int separation = 1;
    GDpriv::ExtensionsManager * extensionManager = GDpriv::ExtensionsManager::GetInstance();
    const InstructionInfos & instructionInfos = extensionManager->GetConditionInfos(instr.GetType());

    int conditionsY = 0;

    //Condition height
    conditionsY += separation;
    conditionsY += instr.renderedHeight+separation+1;

    //Check also sub conditions
    if ( !instr.GetSubInstructions().empty() )
    {
        //Add subconditions height
        conditionsY += 1;
        for (unsigned int sc = 0;sc<instr.GetSubInstructions().size();++sc)
            conditionsY += GetRenderedInstructionAndSubInstructionsHeight(instr.GetSubInstructions()[sc]); //TODO : Fail with Sub sub conditions
        conditionsY += 3;
    }
    else if ( instructionInfos.canHaveSubInstructions )
        conditionsY += 18;

    return conditionsY;
}

bool EventsRenderingHelper::GetActionAt(vector < Instruction > & actions, int x, int y, vector < Instruction > *& actionList, unsigned int & actionIdInList)
{
    int actionsY = 1;
    for (unsigned int a = 0;a<actions.size();++a)
    {
        actionsY += 1;
        if ( y >= actionsY && y <= actionsY+actions[a].renderedHeight)
         {
            actionList = &actions;
            actionIdInList = a;
            return true;
         }
        actionsY += actions[a].renderedHeight+2;
    }
    return false;
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
