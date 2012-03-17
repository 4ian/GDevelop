/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#ifndef EventsRenderingHelper_H
#define EventsRenderingHelper_H
#include <wx/dc.h>
#include <wx/html/htmprint.h>
#include <vector>
class BaseEvent;
class Instruction;
class EventsEditorItemsAreas;
class EventsEditorSelection;
class InstructionInfos;

/**
 * \brief Provides tools to draw events.
 *
 * Class providing default colors, fonts and drawing functions so as to
 * render events.
 */
class GD_CORE_API EventsRenderingHelper
{
    public:
        static EventsRenderingHelper * GetInstance();
        static void DestroySingleton();

        void DrawNiceRectangle(wxDC & dc, const wxRect & rect) const;

        int DrawConditionsList(std::vector < Instruction > & conditions, wxDC & dc, int x, int y, int width, BaseEvent * event, EventsEditorItemsAreas & areas, EventsEditorSelection & selection);
        int DrawActionsList(std::vector < Instruction > & actions, wxDC & dc, int x, int y, int width, BaseEvent * event, EventsEditorItemsAreas & areas, EventsEditorSelection & selection);
        unsigned int GetRenderedConditionsListHeight(const std::vector < Instruction > & conditions, int width);
        unsigned int GetRenderedActionsListHeight(const std::vector < Instruction > & actions, int width);

        inline unsigned int GetConditionsColumnWidth() const {return conditionsColumnWidth;};
        inline void SetConditionsColumnWidth(unsigned int conditionsColumnWidth_) { conditionsColumnWidth = conditionsColumnWidth_; };

        /**
         * Draw a text in dc at point, without taking more than widthAvailable.
         * \return X position of the last character and total height taken by the text
         */
        wxPoint DrawTextInArea(std::string text, wxDC & dc, wxRect rect, wxPoint point);

        /**
         * \return Height taken by the text
         */
        unsigned int GetTextHeightInArea(const std::string & text, unsigned int widthAvailable);

        int DrawInstruction(Instruction & instruction, const InstructionInfos & instructionInfos, bool isCondition, wxDC & dc, wxPoint point, int freeWidth, BaseEvent * event, EventsEditorItemsAreas & areas, EventsEditorSelection & selection);

        /**
         * Change font. Only use a fixed width font.
         */
        void SetFont(const wxFont & font);

        inline const wxFont & GetFont() const {return font;};
        inline wxFont & GetFont() {return font;};

        inline const wxFont & GetNiceFont() const {return niceFont;};
        inline wxFont & GetNiceFont() {return niceFont;};

        inline const wxHtmlDCRenderer & GetHTMLRenderer() const {return htmlRenderer;};
        inline wxHtmlDCRenderer & GetHTMLRenderer() {return htmlRenderer;};

        const wxBrush & GetSelectedRectangleFillBrush() const { return selectionRectangleFill; }
        wxBrush & GetSelectedRectangleFillBrush() { return selectionRectangleFill; }

        const wxPen & GetSelectedRectangleOutlinePen() const { return selectionRectangleOutline; }
        wxPen & GetSelectedRectangleOutlinePen() { return selectionRectangleOutline; }

        const wxBrush & GetHighlightedRectangleFillBrush() const { return highlightRectangleFill; }
        wxBrush & GetHighlightedRectangleFillBrush() { return highlightRectangleFill; }

        const wxPen & GetHighlightedRectangleOutlinePen() const { return highlightRectangleOutline; }
        wxPen & GetHighlightedRectangleOutlinePen() { return highlightRectangleOutline; }

        const wxPen & GetConditionsRectangleOutlinePen() const { return conditionsRectangleOutline; }
        wxPen & GetConditionsRectangleOutlinePen() { return conditionsRectangleOutline; }

        const wxPen & GetActionsRectangleOutlinePen() const { return actionsRectangleOutline; }
        wxPen & GetActionsRectangleOutlinePen() { return actionsRectangleOutline; }

        const wxBrush & GetConditionsRectangleFillBrush() const { return conditionsRectangleFill; }
        wxBrush & GetConditionsRectangleFillBrush() { return conditionsRectangleFill; }

        const wxBrush & GetActionsRectangleFillBrush() const { return actionsRectangleFill; }
        wxBrush & GetActionsRectangleFillBrush() { return actionsRectangleFill; }

        /**
         * Make sure a text will be correctly display by replacing specials characters
         * and inserting tags like <br>.
         */
        std::string GetHTMLText(std::string text);

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
        wxColor disabledColor;
        wxColor disabledColor2;

        int instructionsListBorder;
        int separationBetweenInstructions;

    private:
        EventsRenderingHelper();
        virtual ~EventsRenderingHelper() {};

        unsigned int conditionsColumnWidth;

        wxPen selectionRectangleOutline;
        wxBrush selectionRectangleFill;
        wxPen highlightRectangleOutline;
        wxBrush highlightRectangleFill;

        wxPen niceRectangleOutline;
        wxColour niceRectangleFill1;
        wxColour niceRectangleFill2;

        wxPen actionsRectangleOutline;
        wxPen conditionsRectangleOutline;
        wxBrush actionsRectangleFill;
        wxBrush conditionsRectangleFill;

        wxFont font; ///< Fixed width font
        float fontCharacterWidth;

        wxFont niceFont;

        wxHtmlDCRenderer htmlRenderer;

        static EventsRenderingHelper *singleton;
        wxBitmap fakeBmp;
};

#endif // EventsRenderingHelper_H
#endif
