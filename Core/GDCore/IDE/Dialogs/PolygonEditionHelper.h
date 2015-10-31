/*
 * GDevelop Core
 * Copyright 2014-2015 Florian Rival (Florian.Rival@gmail.com).
 * Copyright 2014-2015 Victor Levasseur (victorlevasseur52@gmail.com).
 * This project is released under the MIT License.
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
#include "GDCore/Extensions/Builtin/SpriteExtension/Polygon2d.h"

namespace gd
{

/**
 * \brief PolygonEditionHelper provides features to make the polygon edition easier.
 * Can be easily integrated into a wxPanel of a wxScrolledWindow.
 * \ingroup IDEDialogs
 */
class GD_CORE_API PolygonEditionHelper
{
public:
    PolygonEditionHelper();
    ~PolygonEditionHelper();

    /**
     * Draw the polygons (and anchors) on a DC.
     * \param mask the collision mask
     * \param dc the drawing context to draw the polygons on
     * \param offset the real origin position (the polygons will be drawn relatively to that position)
     */
    void OnPaint(std::vector<Polygon2d> &mask, wxDC &dc, wxPoint offset);

    /**
     * Simulate a left click.
     * \param mask the collision mask
     * \param event the mouse event
     * \param offset the real origin position
     * \note When using PolygonEditionHelper with a wxScrolledPanel, you will need to change the mouse position in the wxMouseEvent
     * by the unscrolled mouse position before using that function.
     */
    void OnMouseLeftDown(std::vector<Polygon2d> &mask, wxMouseEvent &event, wxPoint offset);

    /**
     * Simulate a mouse move.
     * \param mask the collision mask
     * \param event the mouse event
     * \param offset the real origin position
     * \param minX the minimum X position where a point can be moved
     * \param minY the minimum Y position
     * \param maxX the maximum X position
     * \param maxY the maximum Y position
     * \note When using PolygonEditionHelper with a wxScrolledPanel, you will need to change the mouse position in the wxMouseEvent
     * by the unscrolled mouse position before using that function.
     */
    void OnMouseMove(std::vector<Polygon2d> &mask, wxMouseEvent &event, wxPoint offset, float minX = -FLT_MAX, float minY = -FLT_MAX, float maxX = FLT_MAX, float maxY = FLT_MAX);

    /**
     * Simulate the end of a left click.
     * \param event the mouse event
     * \note When using PolygonEditionHelper with a wxScrolledPanel, you will need to change the mouse position in the wxMouseEvent
     * by the unscrolled mouse position before using that function.
     */
    void OnMouseLeftUp(wxMouseEvent &event);

    /**
     * \return true if a point is currently being moved
     */
    bool IsMovingPoint() const {return movingPolygonPoint;};

    /**
     * \return the selected polygon index
     */
    std::size_t GetSelectedPolygon() const {return selectedPolygon;};

    /**
     * \return the selected point index
     */
    std::size_t GetSelectedPoint() const {return selectedPolygonPoint;};

    /**
     * Change the selected polygon.
     * \param polygon polygon index
     */
    void SetSelectedPolygon(std::size_t polygon) {selectedPolygon = polygon;};

    /**
     * Change the selected point.
     * \param point point index
     */
    void SetSelectedPoint(std::size_t point) {selectedPolygonPoint = point;};

private:
    PolygonEditionHelper(const PolygonEditionHelper&);
    PolygonEditionHelper& operator=(PolygonEditionHelper);

    bool movingPolygonPoint;
    std::size_t selectedPolygon;
    std::size_t selectedPolygonPoint;
    int xSelectionOffset;
    int ySelectionOffset;
};

}

#endif
#endif
