#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef RIBBONMETROARTPROVIDER_H
#define RIBBONMETROARTPROVIDER_H

#include <wx/defs.h>
#include <wx/brush.h>
#include <wx/colour.h>
#include <wx/font.h>
#include <wx/pen.h>
#include <wx/bitmap.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/art.h>
class wxDC;
class wxWindow;

namespace gd
{

class GD_CORE_API RibbonMetroArtProvider : public wxRibbonArtProvider
{
public:
    RibbonMetroArtProvider(bool set_colour_scheme = true);
    virtual ~RibbonMetroArtProvider();

    wxRibbonArtProvider* Clone() const;
    void SetFlags(long flags);
    long GetFlags() const;

    int GetMetric(int id) const;
    void SetMetric(int id, int new_val);
    void SetFont(int id, const wxFont& font);
    wxFont GetFont(int id) const;
    wxColour GetColour(int id) const;
    void SetColour(int id, const wxColor& colour);
    void GetColourScheme(wxColour* primary,
                         wxColour* secondary,
                         wxColour* tertiary) const;
    void SetColourScheme(const wxColour& primary,
                         const wxColour& secondary,
                         const wxColour& tertiary);

    int GetTabCtrlHeight(
                        wxDC& dc,
                        wxWindow* wnd,
                        const wxRibbonPageTabInfoArray& pages);

    void DrawTabCtrlBackground(
                        wxDC& dc,
                        wxWindow* wnd,
                        const wxRect& rect);

    void DrawTab(wxDC& dc,
                 wxWindow* wnd,
                 const wxRibbonPageTabInfo& tab);

    void DrawTabSeparator(
                        wxDC& dc,
                        wxWindow* wnd,
                        const wxRect& rect,
                        double visibility);

    void DrawPageBackground(
                        wxDC& dc,
                        wxWindow* wnd,
                        const wxRect& rect);

    void DrawScrollButton(
                        wxDC& dc,
                        wxWindow* wnd,
                        const wxRect& rect,
                        long style);

    void DrawPanelBackground(
                        wxDC& dc,
                        wxRibbonPanel* wnd,
                        const wxRect& rect);

    void DrawGalleryBackground(
                        wxDC& dc,
                        wxRibbonGallery* wnd,
                        const wxRect& rect);

    void DrawGalleryItemBackground(
                        wxDC& dc,
                        wxRibbonGallery* wnd,
                        const wxRect& rect,
                        wxRibbonGalleryItem* item);

    void DrawMinimisedPanel(
                        wxDC& dc,
                        wxRibbonPanel* wnd,
                        const wxRect& rect,
                        wxBitmap& bitmap);

    void DrawButtonBarBackground(
                        wxDC& dc,
                        wxWindow* wnd,
                        const wxRect& rect);

    void DrawButtonBarButton(
                        wxDC& dc,
                        wxWindow* wnd,
                        const wxRect& rect,
                        wxRibbonButtonKind kind,
                        long state,
                        const wxString& label,
                        const wxBitmap& bitmap_large,
                        const wxBitmap& bitmap_small);

    void DrawToolBarBackground(
                        wxDC& dc,
                        wxWindow* wnd,
                        const wxRect& rect);

    void DrawToolGroupBackground(
                        wxDC& dc,
                        wxWindow* wnd,
                        const wxRect& rect);

    void DrawTool(
                wxDC& dc,
                wxWindow* wnd,
                const wxRect& rect,
                const wxBitmap& bitmap,
                wxRibbonButtonKind kind,
                long state);

    void DrawToggleButton(
                        wxDC& dc,
                        wxRibbonBar* wnd,
                        const wxRect& rect,
                        wxRibbonDisplayMode mode);

    void DrawHelpButton(wxDC& dc,
                        wxRibbonBar* wnd,
                        const wxRect& rect);

    void GetBarTabWidth(
                        wxDC& dc,
                        wxWindow* wnd,
                        const wxString& label,
                        const wxBitmap& bitmap,
                        int* ideal,
                        int* small_begin_need_separator,
                        int* small_must_have_separator,
                        int* minimum);

    wxSize GetScrollButtonMinimumSize(
                        wxDC& dc,
                        wxWindow* wnd,
                        long style);

    wxSize GetPanelSize(
                        wxDC& dc,
                        const wxRibbonPanel* wnd,
                        wxSize client_size,
                        wxPoint* client_offset);

    wxSize GetPanelClientSize(
                        wxDC& dc,
                        const wxRibbonPanel* wnd,
                        wxSize size,
                        wxPoint* client_offset);

    wxRect GetPanelExtButtonArea(
                        wxDC& dc,
                        const wxRibbonPanel* wnd,
                        wxRect rect);

    wxSize GetGallerySize(
                        wxDC& dc,
                        const wxRibbonGallery* wnd,
                        wxSize client_size);

    wxSize GetGalleryClientSize(
                        wxDC& dc,
                        const wxRibbonGallery* wnd,
                        wxSize size,
                        wxPoint* client_offset,
                        wxRect* scroll_up_button,
                        wxRect* scroll_down_button,
                        wxRect* extension_button);

    wxRect GetPageBackgroundRedrawArea(
                        wxDC& dc,
                        const wxRibbonPage* wnd,
                        wxSize page_old_size,
                        wxSize page_new_size);

    bool GetButtonBarButtonSize(
                        wxDC& dc,
                        wxWindow* wnd,
                        wxRibbonButtonKind kind,
                        wxRibbonButtonBarButtonState size,
                        const wxString& label,
                        wxSize bitmap_size_large,
                        wxSize bitmap_size_small,
                        wxSize* button_size,
                        wxRect* normal_region,
                        wxRect* dropdown_region);

    wxSize GetMinimisedPanelMinimumSize(
                        wxDC& dc,
                        const wxRibbonPanel* wnd,
                        wxSize* desired_bitmap_size,
                        wxDirection* expanded_panel_direction);

    wxSize GetToolSize(
                        wxDC& dc,
                        wxWindow* wnd,
                        wxSize bitmap_size,
                        wxRibbonButtonKind kind,
                        bool is_first,
                        bool is_last,
                        wxRect* dropdown_region);

    wxRect GetBarToggleButtonArea(const wxRect& rect);

    wxRect GetRibbonHelpButtonArea(const wxRect& rect);

protected:
    void ReallyDrawTabSeparator(wxWindow* wnd, const wxRect& rect, double visibility);
    void DrawPartialPageBackground(wxDC& dc, wxWindow* wnd, const wxRect& rect,
        bool allow_hovered = true);
    void DrawPartialPageBackground(wxDC& dc, wxWindow* wnd, const wxRect& rect,
         wxRibbonPage* page, wxPoint offset, bool hovered = false);
    void DrawPanelBorder(wxDC& dc, const wxRect& rect, wxPen& primary_colour,
        wxPen& secondary_colour);
    void RemovePanelPadding(wxRect* rect);
    void DrawDropdownArrow(wxDC& dc, int x, int y, const wxColour& colour);
    void DrawGalleryBackgroundCommon(wxDC& dc, wxRibbonGallery* wnd,
                        const wxRect& rect);
    virtual void DrawGalleryButton(wxDC& dc, wxRect rect,
        wxRibbonGalleryButtonState state, wxBitmap* bitmaps);
    void DrawButtonBarButtonForeground(
                        wxDC& dc,
                        const wxRect& rect,
                        wxRibbonButtonKind kind,
                        long state,
                        const wxString& label,
                        const wxBitmap& bitmap_large,
                        const wxBitmap& bitmap_small);
    void DrawMinimisedPanelCommon(
                        wxDC& dc,
                        wxRibbonPanel* wnd,
                        const wxRect& rect,
                        wxRect* preview_rect);
    void CloneTo(RibbonMetroArtProvider* copy) const;

    wxBitmap m_cached_tab_separator;
    wxBitmap m_gallery_up_bitmap[4];
    wxBitmap m_gallery_down_bitmap[4];
    wxBitmap m_gallery_extension_bitmap[4];
    wxBitmap m_toolbar_drop_bitmap;
    wxBitmap m_panel_extension_bitmap[2];
    wxBitmap m_ribbon_toggle_up_bitmap[2];
    wxBitmap m_ribbon_toggle_down_bitmap[2];
    wxBitmap m_ribbon_toggle_pin_bitmap[2];
    wxBitmap m_ribbon_bar_help_button_bitmap[2];

    wxColour m_primary_scheme_colour;
    wxColour m_secondary_scheme_colour;
    wxColour m_tertiary_scheme_colour;

    wxColour m_button_bar_label_colour;
    wxColour m_button_bar_label_disabled_colour;
    wxColour m_tab_label_colour;
    wxColour m_tab_separator_colour;
    wxColour m_tab_separator_gradient_colour;
    wxColour m_tab_active_background_colour;
    wxColour m_tab_active_background_gradient_colour;
    wxColour m_tab_hover_background_colour;
    wxColour m_tab_hover_background_gradient_colour;
    wxColour m_tab_hover_background_top_colour;
    wxColour m_tab_hover_background_top_gradient_colour;
    wxColour m_panel_label_colour;
    wxColour m_panel_minimised_label_colour;
    wxColour m_panel_hover_label_colour;
    wxColour m_panel_active_background_colour;
    wxColour m_panel_active_background_gradient_colour;
    wxColour m_panel_active_background_top_colour;
    wxColour m_panel_active_background_top_gradient_colour;
    wxColour m_panel_button_face_colour;
    wxColour m_panel_button_hover_face_colour;
    wxColour m_page_toggle_face_colour;
    wxColour m_page_toggle_hover_face_colour;
    wxColour m_page_background_colour;
    wxColour m_page_background_gradient_colour;
    wxColour m_page_background_top_colour;
    wxColour m_page_background_top_gradient_colour;
    wxColour m_page_hover_background_colour;
    wxColour m_page_hover_background_gradient_colour;
    wxColour m_page_hover_background_top_colour;
    wxColour m_page_hover_background_top_gradient_colour;
    wxColour m_button_bar_hover_background_colour;
    wxColour m_button_bar_hover_background_gradient_colour;
    wxColour m_button_bar_hover_background_top_colour;
    wxColour m_button_bar_hover_background_top_gradient_colour;
    wxColour m_button_bar_active_background_colour;
    wxColour m_button_bar_active_background_gradient_colour;
    wxColour m_button_bar_active_background_top_colour;
    wxColour m_button_bar_active_background_top_gradient_colour;
    wxColour m_gallery_button_background_colour;
    wxColour m_gallery_button_background_gradient_colour;
    wxColour m_gallery_button_hover_background_colour;
    wxColour m_gallery_button_hover_background_gradient_colour;
    wxColour m_gallery_button_active_background_colour;
    wxColour m_gallery_button_active_background_gradient_colour;
    wxColour m_gallery_button_disabled_background_colour;
    wxColour m_gallery_button_disabled_background_gradient_colour;
    wxColour m_gallery_button_face_colour;
    wxColour m_gallery_button_hover_face_colour;
    wxColour m_gallery_button_active_face_colour;
    wxColour m_gallery_button_disabled_face_colour;

    wxColour m_tool_face_colour;
    wxColour m_tool_background_top_colour;
    wxColour m_tool_background_top_gradient_colour;
    wxColour m_tool_background_colour;
    wxColour m_tool_background_gradient_colour;
    wxColour m_tool_hover_background_top_colour;
    wxColour m_tool_hover_background_top_gradient_colour;
    wxColour m_tool_hover_background_colour;
    wxColour m_tool_hover_background_gradient_colour;
    wxColour m_tool_active_background_top_colour;
    wxColour m_tool_active_background_top_gradient_colour;
    wxColour m_tool_active_background_colour;
    wxColour m_tool_active_background_gradient_colour;

    wxBrush m_tab_ctrl_background_brush;
    wxBrush m_panel_label_background_brush;
    wxBrush m_panel_hover_label_background_brush;
    wxBrush m_panel_hover_button_background_brush;
    wxBrush m_gallery_hover_background_brush;
    wxBrush m_gallery_button_background_top_brush;
    wxBrush m_gallery_button_hover_background_top_brush;
    wxBrush m_gallery_button_active_background_top_brush;
    wxBrush m_gallery_button_disabled_background_top_brush;
    wxBrush m_ribbon_toggle_brush;

    wxFont m_tab_label_font;
    wxFont m_panel_label_font;
    wxFont m_button_bar_label_font;

    wxPen m_page_border_pen;
    wxPen m_panel_border_pen;
    wxPen m_panel_border_gradient_pen;
    wxPen m_panel_minimised_border_pen;
    wxPen m_panel_minimised_border_gradient_pen;
    wxPen m_panel_hover_button_border_pen;
    wxPen m_tab_border_pen;
    wxPen m_button_bar_hover_border_pen;
    wxPen m_button_bar_active_border_pen;
    wxPen m_gallery_border_pen;
    wxPen m_gallery_item_border_pen;
    wxPen m_toolbar_border_pen;
    wxPen m_ribbon_toggle_pen;

    double m_cached_tab_separator_visibility;
    long m_flags;

    int m_tab_separation_size;
    int m_page_border_left;
    int m_page_border_top;
    int m_page_border_right;
    int m_page_border_bottom;
    int m_panel_x_separation_size;
    int m_panel_y_separation_size;
    int m_tool_group_separation_size;
    int m_gallery_bitmap_padding_left_size;
    int m_gallery_bitmap_padding_right_size;
    int m_gallery_bitmap_padding_top_size;
    int m_gallery_bitmap_padding_bottom_size;
    int m_toggle_button_offset;
    int m_help_button_offset;

    wxBitmap helpBitmap;
};

}

#endif
#endif