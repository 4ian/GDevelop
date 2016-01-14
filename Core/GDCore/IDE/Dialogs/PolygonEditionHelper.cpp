/*
 * GDevelop Core
 * Copyright 2014-2016 Florian Rival (Florian.Rival@gmail.com).
 * Copyright 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCore/IDE/Dialogs/PolygonEditionHelper.h"

namespace gd
{

PolygonEditionHelper::PolygonEditionHelper() :
    movingPolygonPoint(false),
    selectedPolygon(0),
    selectedPolygonPoint(0),
    xSelectionOffset(0),
    ySelectionOffset(0)
{

}

PolygonEditionHelper::~PolygonEditionHelper()
{

}

void PolygonEditionHelper::OnPaint(std::vector<Polygon2d> &mask, wxDC &dc, wxPoint offset)
{
    for (std::size_t i = 0; i<mask.size();++i)
    {
        wxPointList list;
        for (std::size_t j = 0;j<mask[i].vertices.size();++j)
            list.push_back(new wxPoint(mask[i].vertices[j].x, mask[i].vertices[j].y));

        dc.SetBrush(wxBrush(wxColour(128,128,128), wxBRUSHSTYLE_FDIAGONAL_HATCH));
        dc.SetPen(wxPen(wxColour(100,100,100)));
        if ( i == selectedPolygon )
            dc.SetBrush(wxBrush(wxColour(255,255,255), wxBRUSHSTYLE_FDIAGONAL_HATCH));

        dc.DrawPolygon(&list, offset.x, offset.y);
        for (std::size_t j = 0; j<mask[i].vertices.size();++j)
        {
            dc.SetBrush(wxBrush(wxColour(128,128,228), wxBRUSHSTYLE_SOLID));
            dc.SetPen(wxPen(wxColour(j == selectedPolygonPoint ? 180 : 100,100,100)));
            dc.DrawRectangle(offset.x+mask[i].vertices[j].x-3, offset.y+mask[i].vertices[j].y-3, 5, 5);
        }
    }
}

void PolygonEditionHelper::OnMouseLeftDown(std::vector<Polygon2d> &mask, wxMouseEvent &event, wxPoint offset)
{
    for (std::size_t i = 0;i<mask.size();++i)
    {
        for (std::size_t j = 0;j<mask[i].vertices.size();++j)
        {
            if ( offset.x+mask[i].vertices[j].x-3 <= event.GetX() &&
                             offset.y+mask[i].vertices[j].y-3 <=  event.GetY() &&
                             offset.x+mask[i].vertices[j].x+2 >=  event.GetX() &&
                             offset.y+mask[i].vertices[j].y+2 >=  event.GetY() )
             {
                movingPolygonPoint = true;
                selectedPolygon = i;
                selectedPolygonPoint = j;
                xSelectionOffset = offset.x+mask[i].vertices[j].x-event.GetX();
                ySelectionOffset = offset.y+mask[i].vertices[j].y-event.GetY();
             }
        }
    }
}

void PolygonEditionHelper::OnMouseMove(std::vector<Polygon2d> &mask, wxMouseEvent &event, wxPoint offset, float minX, float minY, float maxX, float maxY)
{
    if(!movingPolygonPoint)
        return;

    if ( selectedPolygon < mask.size())
    {
        if ( selectedPolygonPoint < mask[selectedPolygon].vertices.size() )
        {
            mask[selectedPolygon].vertices[selectedPolygonPoint].x =
                std::max(minX, std::min(maxX, event.GetX()-(float)offset.x+xSelectionOffset));
            mask[selectedPolygon].vertices[selectedPolygonPoint].y =
                std::max(minY, std::min(maxY, event.GetY()-(float)offset.y+ySelectionOffset));
        }
    }
}

void PolygonEditionHelper::OnMouseLeftUp(wxMouseEvent &event)
{
    movingPolygonPoint = false;
}

}

#endif
