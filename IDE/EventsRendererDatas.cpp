/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "EventsRendererDatas.h"

EventsRendererDatas::EventsRendererDatas() :
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
    //ctor
}
