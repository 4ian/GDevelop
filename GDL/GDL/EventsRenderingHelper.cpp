#if defined(GDE)
#include "EventsRenderingHelper.h"

EventsRenderingHelper * EventsRenderingHelper::singleton = NULL;

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
conditionsColumnWidth(200),
rectangleOutline(wxPen(wxColour(242/2,242/2,242/2), 1)),
rectangleFill(wxBrush(wxColour(242,242,242))),
conditionsRectangleFill(wxBrush(wxColour(230,235,239))),
selectedRectangleOutline(wxPen(wxColour(255, 85, 17), 1)),
selectedRectangleFill(wxBrush(wxColour(255,230,156))),
font( 8, wxDEFAULT, wxNORMAL, wxNORMAL ),
bigFont(12, wxDEFAULT, wxNORMAL, wxNORMAL ),
italicFont( 8, wxDEFAULT, wxFONTSTYLE_ITALIC, wxNORMAL ),
italicSmallFont( 5, wxDEFAULT, wxFONTSTYLE_ITALIC, wxNORMAL )
{
}

void EventsRenderingHelper::DrawNiceRectangle(wxDC & dc, const wxRect & rect, const wxColor & color1, const wxColor & color2,const wxColor & color3,const wxColor & color4,const wxColor & color5) const
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

EventsRenderingHelper * EventsRenderingHelper::getInstance()
{
    if ( NULL == singleton )
        singleton = new EventsRenderingHelper;

    return singleton;
}

void EventsRenderingHelper::kill()
{
    if ( NULL != singleton )
    {
        delete singleton;
        singleton = NULL;
    }
}
#endif
