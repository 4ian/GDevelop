#if defined(GDE)
#ifndef EventsRenderingHelper_H
#define EventsRenderingHelper_H

#include <wx/dc.h>
#include <wx/html/htmprint.h>

/**
 * Class providing default colors, fonts, infos and drawing functions so as to
 * render events.
 */
class GD_API EventsRenderingHelper
{
    public:
        static EventsRenderingHelper * getInstance();
        static void kill();

        void DrawNiceRectangle(wxDC & dc, const wxRect & rect, const wxColor & color1, const wxColor & color2,const wxColor & color3,const wxColor & color4,const wxColor & color5) const;

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
        EventsRenderingHelper();
        virtual ~EventsRenderingHelper() {};

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

        static EventsRenderingHelper *singleton;
};

#endif // EventsRenderingHelper_H
#endif
