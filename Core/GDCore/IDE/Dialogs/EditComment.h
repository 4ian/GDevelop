
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCORE_EDITCOMMENT_H
#define GDCORE_EDITCOMMENT_H

//(*Headers(EditComment)
#include <wx/button.h>
#include <wx/checkbox.h>
#include <wx/dialog.h>
#include <wx/hyperlink.h>
#include <wx/sizer.h>
#include <wx/statbmp.h>
#include <wx/statline.h>
#include <wx/textctrl.h>
//*)
#include "GDCore/Events/Builtin/CommentEvent.h"

namespace gd {

/**
 * \brief Editor for the comments events.
 * \ingroup IDEDialogs
 */
class EditComment : public wxDialog {
 public:
  EditComment(wxWindow* parent, CommentEvent& event_);
  virtual ~EditComment();

  //(*Declarations(EditComment)
  wxButton* OkBt;
  wxButton* ColorBt;
  wxStaticBitmap* StaticBitmap1;
  wxTextCtrl* Com1Edit;
  wxHyperlinkCtrl* HyperlinkCtrl1;
  wxCheckBox* CheckBox1;
  wxTextCtrl* Com2Edit;
  wxStaticLine* StaticLine1;
  wxButton* AnnulerBt;
  wxButton* txtColorBt;
  //*)

  CommentEvent& commentEvent;

 protected:
  //(*Identifiers(EditComment)
  static const long ID_TEXTCTRL1;
  static const long ID_TEXTCTRL2;
  static const long ID_CHECKBOX1;
  static const long ID_BUTTON1;
  static const long ID_BUTTON5;
  static const long ID_STATICLINE1;
  static const long ID_STATICBITMAP2;
  static const long ID_HYPERLINKCTRL1;
  static const long ID_BUTTON2;
  static const long ID_BUTTON3;
  //*)

 private:
  //(*Handlers(EditComment)
  void OnColorBtClick(wxCommandEvent& event);
  void OnOkBtClick(wxCommandEvent& event);
  void OnAnnulerBtClick(wxCommandEvent& event);
  void OnAideBtClick(wxCommandEvent& event);
  void OntxtColorBtClick(wxCommandEvent& event);
  void OnCheckBox1Click(wxCommandEvent& event);
  //*)

  DECLARE_EVENT_TABLE()
};

}  // namespace gd

#endif  // GDCORE_EDITCOMMENT_H
#endif