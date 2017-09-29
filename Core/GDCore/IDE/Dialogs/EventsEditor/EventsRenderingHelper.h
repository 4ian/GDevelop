/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if !defined(GD_NO_WX_GUI)
#ifndef EventsRenderingHelper_H
#define EventsRenderingHelper_H
#include <wx/dc.h>
#include <wx/html/htmprint.h>
#include <vector>
#include "GDCore/Events/InstructionsList.h"
namespace gd { class String; }
namespace gd { class BaseEvent; }
namespace gd { class Instruction; }
namespace gd { class Platform; }
namespace gd { class EventsEditorItemsAreas; }
namespace gd { class EventsEditorSelection; }
namespace gd { class InstructionMetadata;}
namespace gd {class InstructionsMetadataHolder;}

namespace gd
{

/**

 * \brief Provides tools to draw events using wxWidgets toolkit.
 *
 * Class providing default colors, fonts and drawing functions so as to
 * render events using wxWidgets toolkit.
 *
 * \ingroup IDEDialogsEventsEditor
 */
class GD_CORE_API EventsRenderingHelper
{
public:
    static EventsRenderingHelper * Get();
    static void DestroySingleton();

    /**
     * Draw a nice rectangle, often used as conditions background, on a wxDC.
     */
    void DrawNiceRectangle(wxDC & dc, const wxRect & rect) const;

    /**
     * \brief Draw the specified condition list
     * \param conditions Conditions to be rendered
     * \param dc wxWidgets DC to be used
     * \param x x position of the drawing
     * \param y y position of the drawing
     * \param width Width available for the drawing
     * \param event Event owning the condition list
     * \param areas EventsEditorItemsAreas object when drawn areas will be registered
     * \param selection EventsEditorSelection object providing information about selection
     * \param platform The platform currently used
     * \return Height used for the drawing
     */
    int DrawConditionsList(gd::InstructionsList & conditions, wxDC & dc, int x, int y, int width, gd::BaseEvent * event,
                           gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform);

    /**
     * \brief Draw the specified action list
     * \see gd::EventsRenderingHelper::DrawConditionsList
     */
    int DrawActionsList(gd::InstructionsList & actions, wxDC & dc, int x, int y, int width, gd::BaseEvent * event,
                        gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform);

    /**
     * \brief Get the height taken by drawing a condition list
     * \param conditions Conditions to be rendered
     * \param width Width available for the drawing
     * \param platform The platform currently used
     * \return Height used for the drawing
     */
    unsigned int GetRenderedConditionsListHeight(const gd::InstructionsList & conditions, int width, const gd::Platform & platform);
    /**
     * \brief Get the height taken by drawing a condition list
     * \see gd::EventsRenderingHelper::GetRenderedConditionsListHeight
     */
    unsigned int GetRenderedActionsListHeight(const gd::InstructionsList & actions, int width, const gd::Platform & platform);

    inline unsigned int GetConditionsColumnWidth() const {return conditionsColumnWidth;};
    inline void SetConditionsColumnWidth(unsigned int conditionsColumnWidth_) { conditionsColumnWidth = conditionsColumnWidth_; };

    /**
     * Draw a text in dc at point, without taking more than widthAvailable.
     * \return X position of the last character and total height taken by the text
     */
    wxPoint DrawTextInArea(gd::String text, wxDC & dc, wxRect rect, wxPoint point);

    /**
     * \return Height taken by the text
     */
    unsigned int GetTextHeightInArea(const gd::String & text, unsigned int widthAvailable);

    /**
     * Draw a specific instruction
     * \param instruction Instruction to be rendered
     * \param instructionMetadata Instruction metadata
     * \param isCondition true if the instruction is a condition
     * \param dc The wxWidgets DC to be used for rendering
     * \param point The drawing position
     * \param freeWidth Width available
     * \param event Event owning the condition list
     * \param areas EventsEditorItemsAreas object when drawn areas will be registered
     * \param selection EventsEditorSelection object providing information about selection
     * \return Height used for the drawing
     */
    int DrawInstruction(gd::Instruction & instruction,
                        const gd::InstructionMetadata & instructionMetadata,
                        bool isCondition, wxDC & dc, wxPoint point, int freeWidth,
                        gd::BaseEvent * event, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection);

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
    gd::String GetHTMLText(gd::String text);

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
    float fontCharacterHeight;

    wxFont niceFont;

    wxHtmlDCRenderer htmlRenderer;

    static EventsRenderingHelper *singleton;
    wxBitmap fakeBmp;
};

}

#endif // EventsRenderingHelper_H
#endif
