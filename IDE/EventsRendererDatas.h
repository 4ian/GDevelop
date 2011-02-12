/** \file
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EVENTSRENDERERDATAS_H
#define EVENTSRENDERERDATAS_H

#include <wx/dc.h>
#include <wx/dcbuffer.h>
#include <wx/html/htmprint.h>

/**
 * Contains information for events renderers, like the position where to render,
 * and some objects like the pen and brush to use.
 */
class EventsRendererDatas
{
    public:
        EventsRendererDatas();
        virtual ~EventsRendererDatas() {};

        inline int GetOrigineX() const {return origineX;};
        inline void SetOrigineX(int origineX_) { origineX = origineX_; };

        inline int GetOrigineY() const {return origineY;};
        inline void SetOrigineY(int origineY_) { origineY = origineY_; };

        inline unsigned int GetRenderZoneWidth() const {return renderZoneWidth;};
        inline void SetRenderZoneWidth(unsigned int renderZoneWidth_) { renderZoneWidth = renderZoneWidth_; };

        inline unsigned int GetConditionsColumnWidth() const {return conditionsColumnWidth;};
        inline void SetConditionsColumnWidth(unsigned int conditionsColumnWidth_) { conditionsColumnWidth = conditionsColumnWidth_; };

        inline const wxPen & GetRectangleOutlinePen() const {return rectangleOutline;};
        inline void SetRectangleOutlinePen(wxPen & outlinePen_) { rectangleOutline = outlinePen_; };

        inline const wxBrush & GetRectangleFillBrush() const {return rectangleFill;};
        inline void SetRectangleFillBrush(wxBrush & brush_) { rectangleFill = brush_; };

        inline const wxPen & GetSelectedRectangleOutlinePen() const {return selectedRectangleOutline;};
        inline void SetSelectedRectangleOutlinePen(wxPen & outlinePen_) { selectedRectangleOutline = outlinePen_; };

        inline const wxBrush & GetSelectedRectangleFillBrush() const {return selectedRectangleFill;};
        inline void SetSelectedRectangleFillBrush(wxBrush & brush_) { selectedRectangleFill = brush_; };

        inline const wxFont & GetBigFont() const {return bigFont;};
        inline wxFont & GetBigFont() {return bigFont;};

        inline const wxFont & GetFont() const {return font;};
        inline wxFont & GetFont() {return font;};

        inline const wxFont & GetItalicFont() const {return italicFont;};
        inline wxFont & GetItalicFont() {return italicFont;};

        inline const wxFont & GetItalicSmallFont() const {return italicSmallFont;};
        inline wxFont & GetItalicSmallFont() {return italicSmallFont;};

        inline const wxHtmlDCRenderer & GetHTMLRenderer() const {return htmlRenderer;};
        inline wxHtmlDCRenderer & GetHTMLRenderer() {return htmlRenderer;};

        wxColor eventGradient1;
        wxColor eventGradient2;
        wxColor eventGradient3;
        wxColor eventGradient4;
        wxColor eventBorderColor;
        wxColor eventConditionsGradient1;
        wxColor eventConditionsGradient2;
        wxColor eventConditionsGradient3;
        wxColor eventConditionsGradient4;
        wxColor eventConditionsBorderColor;
        wxColor selectionColor;

    protected:
    private:

        int origineX;
        int origineY;
        unsigned int renderZoneWidth;
        unsigned int conditionsColumnWidth;

        wxPen rectangleOutline;
        wxBrush rectangleFill;
        wxBrush conditionsRectangleFill;
        wxPen selectedRectangleOutline;
        wxBrush selectedRectangleFill;
        wxFont font;
        wxFont bigFont;
        wxFont italicFont;
        wxFont italicSmallFont;
        wxHtmlDCRenderer htmlRenderer;
};

#endif // EVENTSRENDERERDATAS_H
