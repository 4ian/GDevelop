/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef SoundObjectEDITOR_H
#define SoundObjectEDITOR_H

//(*Headers(SoundObjectEditor)
#include <wx/button.h>
#include <wx/checkbox.h>
#include <wx/dialog.h>
#include <wx/notebook.h>
#include <wx/panel.h>
#include <wx/radiobut.h>
#include <wx/sizer.h>
#include <wx/spinctrl.h>
#include <wx/statline.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
//*)
namespace gd {
class MainFrameWrapper;
}
namespace gd {
class Project;
}
class SoundObject;

class SoundObjectEditor : public wxDialog {
 public:
  SoundObjectEditor(wxWindow* parent, gd::Project& game_, SoundObject& object_);
  virtual ~SoundObjectEditor();

  //(*Declarations(SoundObjectEditor)
  wxSpinCtrl* MinDistanceSpinCtrl;
  wxButton* ValidateButton;
  wxNotebook* Notebook1;
  wxStaticText* StaticText2;
  wxTextCtrl* FileNameTextCtrl;
  wxCheckBox* LoopCheckBox;
  wxButton* Button1;
  wxStaticText* StaticText6;
  wxPanel* Panel1;
  wxStaticText* StaticText1;
  wxStaticText* StaticText3;
  wxButton* Button2;
  wxStaticText* StaticText5;
  wxTextCtrl* AttenuationSpinCtrl;
  wxStaticText* StaticText7;
  wxTextCtrl* pitchTextCtrl;
  wxSpinCtrl* VolumeSpinCtrl;
  wxStaticLine* StaticLine1;
  wxRadioButton* SoundRadioBt;
  wxPanel* Panel2;
  wxRadioButton* MusicRadioBt;
  wxStaticText* StaticText4;
  //*)

 protected:
  //(*Identifiers(SoundObjectEditor)
  static const long ID_RADIOBUTTON2;
  static const long ID_RADIOBUTTON1;
  static const long ID_STATICTEXT6;
  static const long ID_STATICTEXT7;
  static const long ID_PANEL1;
  static const long ID_STATICTEXT1;
  static const long ID_SPINCTRL1;
  static const long ID_STATICTEXT2;
  static const long ID_TEXTCTRL3;
  static const long ID_STATICTEXT3;
  static const long ID_SPINCTRL3;
  static const long ID_STATICTEXT4;
  static const long ID_TEXTCTRL2;
  static const long ID_CHECKBOX1;
  static const long ID_STATICTEXT5;
  static const long ID_TEXTCTRL1;
  static const long ID_BUTTON2;
  static const long ID_PANEL2;
  static const long ID_NOTEBOOK1;
  static const long ID_STATICLINE1;
  static const long ID_BUTTON1;
  static const long ID_BUTTON3;
  //*)

 private:
  //(*Handlers(SoundObjectEditor)
  void OnValidateButtonClick(wxCommandEvent& event);
  void OnButton1Click(wxCommandEvent& event);
  void OnButton2Click(wxCommandEvent& event);
  //*)

  gd::Project& game;
  SoundObject& object;

  DECLARE_EVENT_TABLE()
};

#endif
#endif
