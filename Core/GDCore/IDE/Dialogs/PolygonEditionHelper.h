/*
 * Game Develop Core
 * Copyright 2014 Florian Rival (Florian.Rival@gmail.com).
 * Copyright 2014 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the GNU Lesser General Public License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCORE_POLYGONEDITIONHELPER_H
#define GDCORE_POLYGONEDITIONHELPER_H

#include <cfloat>
#include <vector>
#include <wx/dcclient.h>
#include <wx/dcmemory.h>
#include <wx/dcbuffer.h>
#include <wx/event.h>
#include "GDCore/BuiltinExtensions/SpriteExtension/Polygon.h"

namespace gd
{

class GD_CORE_API PolygonEditionHelper
{
public:
    PolygonEditionHelper();
    ~PolygonEditionHelper();

    void OnPaint(std::vector<Polygon2d> &mask, wxDC &dc, wxPoint offset);
    void OnMouseLeftDown(std::vector<Polygon2d> &mask, wxMouseEvent &event, wxPoint offset);
    void OnMouseMove(std::vector<Polygon2d> &mask, wxMouseEvent &event, wxPoint offset, float maxX = FLT_MAX, float maxY = FLT_MAX);
    void OnMouseLeftUp(wxMouseEvent &event);

    bool IsMovingPoint() const {return movingPolygonPoint;};

private:
    PolygonEditionHelper(const PolygonEditionHelper&) {};
    PolygonEditionHelper& operator=(PolygonEditionHelper) {};

    bool movingPolygonPoint;
    int selectedPolygon;
    int selectedPolygonPoint;
    int xSelectionOffset;
    int ySelectionOffset;
};

}

#endif
#endif