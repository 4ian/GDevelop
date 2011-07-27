/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#ifndef EventsRenderingHelper_H
#define EventsRenderingHelper_H

#include <wx/dc.h>
#include <wx/html/htmprint.h>
#include <vector>
class Instruction;

/**
 * \brief Provides tools to draw events.
 *
 * Class providing default colors, fonts and drawing functions so as to
 * render events.
 */
class GD_API EventsRenderingHelper
{
    public:
        static EventsRenderingHelper * GetInstance();
        static void DestroySingleton();

        void DrawNiceRectangle(wxDC & dc, const wxRect & rect) const;

        int DrawConditionsList(const std::vector < Instruction > & conditions, wxDC & dc, const int x, const int y, const int width, bool disabled);
        int DrawActionsList(const std::vector < Instruction > & actions, wxDC & dc, int x, int y, int width, bool disabled);
        unsigned int GetRenderedConditionsListHeight(const std::vector < Instruction > & conditions, int width);
        unsigned int GetRenderedActionsListHeight(const std::vector < Instruction > & actions, int width);


        /**
         * Get a condition under a point in a list.
         * Return true if a condition was found, in which case conditionList and conditionIdInList are completed
         */
        bool GetConditionAt(std::vector < Instruction > & conditions, int x, int y, std::vector < Instruction > *& conditionList, unsigned int & conditionIdInList);

        /**
         * Get an action under a point in a list.
         * Return true if an action was found, in which case actionList and actionIdInList are completed
         */
        bool GetActionAt(std::vector < Instruction > & actions, int x, int y, std::vector < Instruction > *& actionList, unsigned int & actionIdInList);

        unsigned int GetRenderedInstructionAndSubInstructionsHeight(const Instruction & instr);

        inline unsigned int GetConditionsColumnWidth() const {return conditionsColumnWidth;};
        inline void SetConditionsColumnWidth(unsigned int conditionsColumnWidth_) { conditionsColumnWidth = conditionsColumnWidth_; };

        inline const wxFont & GetBigFont() const {return bigFont;};
        inline wxFont & GetBigFont() {return bigFont;};

        inline const wxFont & GetBoldFont() const {return boldFont;};
        inline wxFont & GetBoldFont() {return boldFont;};

        inline const wxFont & GetFont() const {return font;};
        inline wxFont & GetFont() {return font;};

        inline const wxFont & GetItalicFont() const {return italicFont;};
        inline wxFont & GetItalicFont() {return italicFont;};

        inline const wxFont & GetItalicSmallFont() const {return italicSmallFont;};
        inline wxFont & GetItalicSmallFont() {return italicSmallFont;};

        inline const wxHtmlDCRenderer & GetHTMLRenderer() const {return htmlRenderer;};
        inline wxHtmlDCRenderer & GetHTMLRenderer() {return htmlRenderer;};

        const wxBrush & GetSelectedRectangleFillBrush() const { return selectionRectangleFill; }
        wxBrush & GetSelectedRectangleFillBrush() { return selectionRectangleFill; }

        const wxPen & GetSelectedRectangleOutlinePen() const { return selectionRectangleOutline; }
        wxPen & GetSelectedRectangleOutlineBrush() { return selectionRectangleOutline; }

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

    private:
        EventsRenderingHelper();
        virtual ~EventsRenderingHelper() {};

        unsigned int conditionsColumnWidth;

        wxPen selectionRectangleOutline;
        wxBrush selectionRectangleFill;

        wxPen niceRectangleOutline;
        wxColour niceRectangleFill1;
        wxColour niceRectangleFill2;

        wxPen actionsRectangleOutline;
        wxPen conditionsRectangleOutline;
        wxBrush actionsRectangleFill;
        wxBrush conditionsRectangleFill;
        wxFont font;
        wxFont bigFont;
        wxFont boldFont;
        wxFont italicFont;
        wxFont italicSmallFont;
        wxHtmlDCRenderer htmlRenderer;

        static EventsRenderingHelper *singleton;
        wxBitmap fakeBmp;
};

#endif // EventsRenderingHelper_H
#endif
