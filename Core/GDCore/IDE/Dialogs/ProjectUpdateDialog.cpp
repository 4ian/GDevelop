
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "ProjectUpdateDialog.h"

//(*InternalHeaders(ProjectUpdateDialog)
#include <wx/string.h>
#include "GDCore/Tools/Localization.h"
//*)
#include "GDCore/String.h"

//(*IdInit(ProjectUpdateDialog)
const long ProjectUpdateDialog::ID_STATICTEXT1 = wxNewId();
const long ProjectUpdateDialog::ID_TEXTCTRL1 = wxNewId();
const long ProjectUpdateDialog::ID_STATICTEXT2 = wxNewId();
const long ProjectUpdateDialog::ID_STATICLINE1 = wxNewId();
const long ProjectUpdateDialog::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ProjectUpdateDialog, wxDialog)
//(*EventTable(ProjectUpdateDialog)
//*)
END_EVENT_TABLE()

ProjectUpdateDialog::ProjectUpdateDialog(wxWindow* parent,
                                         wxString updateText) {
  //(*Initialize(ProjectUpdateDialog)
  wxFlexGridSizer* FlexGridSizer2;
  wxFlexGridSizer* FlexGridSizer1;
  wxFlexGridSizer* FlexGridSizer17;

  Create(parent,
         wxID_ANY,
         _("Project updated"),
         wxDefaultPosition,
         wxDefaultSize,
         wxDEFAULT_DIALOG_STYLE,
         _T("wxID_ANY"));
  FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
  FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
  FlexGridSizer17->AddGrowableCol(0);
  FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
  StaticText1 =
      new wxStaticText(this,
                       ID_STATICTEXT1,
                       _("If you save your project using this version of "
                         "GDevelop, you won\'t be able to use it with\na "
                         "previous version of GDevelop due to these changes :"),
                       wxDefaultPosition,
                       wxDefaultSize,
                       0,
                       _T("ID_STATICTEXT1"));
  FlexGridSizer2->Add(
      StaticText1, 1, wxALL | wxALIGN_LEFT | wxALIGN_CENTER_VERTICAL, 5);
  updateTextEdit = new wxTextCtrl(this,
                                  ID_TEXTCTRL1,
                                  wxEmptyString,
                                  wxDefaultPosition,
                                  wxSize(432, 174),
                                  wxTE_MULTILINE | wxTE_READONLY,
                                  wxDefaultValidator,
                                  _T("ID_TEXTCTRL1"));
  FlexGridSizer2->Add(
      updateTextEdit,
      1,
      wxALL | wxEXPAND | wxALIGN_CENTER_HORIZONTAL | wxALIGN_CENTER_VERTICAL,
      5);
  StaticText2 = new wxStaticText(
      this,
      ID_STATICTEXT2,
      _("Remember to always make regular saves of your projects so as to have "
        "backup if something\ngoes wrong."),
      wxDefaultPosition,
      wxDefaultSize,
      0,
      _T("ID_STATICTEXT2"));
  FlexGridSizer2->Add(
      StaticText2, 1, wxALL | wxALIGN_LEFT | wxALIGN_CENTER_VERTICAL, 5);
  StaticLine1 = new wxStaticLine(this,
                                 ID_STATICLINE1,
                                 wxDefaultPosition,
                                 wxSize(10, -1),
                                 wxLI_HORIZONTAL,
                                 _T("ID_STATICLINE1"));
  FlexGridSizer2->Add(
      StaticLine1,
      1,
      wxALL | wxEXPAND | wxALIGN_CENTER_HORIZONTAL | wxALIGN_CENTER_VERTICAL,
      0);
  okBt = new wxButton(this,
                      ID_BUTTON1,
                      _("Ok"),
                      wxDefaultPosition,
                      wxDefaultSize,
                      0,
                      wxDefaultValidator,
                      _T("ID_BUTTON1"));
  FlexGridSizer2->Add(
      okBt, 1, wxALL | wxALIGN_RIGHT | wxALIGN_CENTER_VERTICAL, 5);
  FlexGridSizer17->Add(
      FlexGridSizer2,
      1,
      wxALL | wxEXPAND | wxALIGN_CENTER_HORIZONTAL | wxALIGN_CENTER_VERTICAL,
      0);
  FlexGridSizer1->Add(
      FlexGridSizer17,
      1,
      wxALL | wxEXPAND | wxALIGN_CENTER_HORIZONTAL | wxALIGN_CENTER_VERTICAL,
      0);
  SetSizer(FlexGridSizer1);
  FlexGridSizer1->Fit(this);
  FlexGridSizer1->SetSizeHints(this);

  Connect(ID_BUTTON1,
          wxEVT_COMMAND_BUTTON_CLICKED,
          (wxObjectEventFunction)&ProjectUpdateDialog::OnokBtClick);
  //*)
  updateTextEdit->SetValue(updateText);
}

ProjectUpdateDialog::~ProjectUpdateDialog() {
  //(*Destroy(ProjectUpdateDialog)
  //*)
}

void ProjectUpdateDialog::OnokBtClick(wxCommandEvent& event) { EndModal(0); }
#endif
