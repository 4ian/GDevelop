
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GRIDSETUP_H
#define GRIDSETUP_H

//(*Headers(GridSetupDialog)
#include <wx/button.h>
#include <wx/checkbox.h>
#include <wx/dialog.h>
#include <wx/hyperlink.h>
#include <wx/panel.h>
#include <wx/sizer.h>
#include <wx/statbmp.h>
#include <wx/statline.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
//*)

namespace gd {

/**
 * \brief Tiny dialog used to parameter the grid showed on a layout editor
 * canvas.
 *
 * \see LayoutEditorCanvas
 * \ingroup IDEDialogs
 */
class GridSetupDialog : public wxDialog {
 public:
  GridSetupDialog(wxWindow* parent,
                  int& width,
                  int& height,
                  int& x,
                  int& y,
                  bool& snap_,
                  int& r_,
                  int& g_,
                  int& b_);
  virtual ~GridSetupDialog();

  //(*Declarations(GridSetupDialog)
  wxStaticText* StaticText9;
  wxStaticBitmap* StaticBitmap2;
  wxTextCtrl* widthEdit;
  wxTextCtrl* offsetYEdit;
  wxStaticText* StaticText2;
  wxStaticText* StaticText6;
  wxTextCtrl* heightEdit;
  wxStaticText* StaticText8;
  wxStaticText* StaticText1;
  wxStaticText* StaticText3;
  wxButton* cancelBt;
  wxPanel* colorPanel;
  wxTextCtrl* offsetXEdit;
  wxStaticText* StaticText5;
  wxStaticText* StaticText7;
  wxStaticLine* StaticLine1;
  wxHyperlinkCtrl* helpBt;
  wxStaticText* StaticText4;
  wxButton* okBt;
  wxCheckBox* snapCheck;
  //*)
  int& gridWidth;
  int& gridHeight;
  int& gridOffsetX;
  int& gridOffsetY;
  bool& snap;
  int& r;
  int& g;
  int& b;

 protected:
  //(*Identifiers(GridSetupDialog)
  static const long ID_STATICTEXT2;
  static const long ID_TEXTCTRL1;
  static const long ID_STATICTEXT7;
  static const long ID_STATICTEXT8;
  static const long ID_TEXTCTRL4;
  static const long ID_STATICTEXT9;
  static const long ID_STATICTEXT3;
  static const long ID_TEXTCTRL2;
  static const long ID_STATICTEXT4;
  static const long ID_STATICTEXT5;
  static const long ID_TEXTCTRL3;
  static const long ID_STATICTEXT6;
  static const long ID_CHECKBOX1;
  static const long ID_STATICTEXT1;
  static const long ID_PANEL1;
  static const long ID_STATICLINE1;
  static const long ID_STATICBITMAP2;
  static const long ID_HYPERLINKCTRL1;
  static const long ID_BUTTON1;
  static const long ID_BUTTON2;
  //*)

 private:
  //(*Handlers(GridSetupDialog)
  void OnokBtClick(wxCommandEvent& event);
  void OncancelBtClick(wxCommandEvent& event);
  void OncolorPanelLeftUp(wxMouseEvent& event);
  void OnhelpBtClick(wxCommandEvent& event);
  //*)

  DECLARE_EVENT_TABLE()
};

}  // namespace gd
#endif
#endif