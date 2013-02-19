#ifndef IMPORTIMAGE_H
#define IMPORTIMAGE_H

//(*Headers(ImportImage)
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/colordlg.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)

class ImportImage: public wxDialog
{
	public:

		ImportImage(wxWindow* parent, int pageSelected);
		virtual ~ImportImage();

		//(*Declarations(ImportImage)
		wxStaticText* StaticText10;
		wxStaticText* StaticText9;
		wxCheckBox* hasMaskSSCheck;
		wxButton* browseRPGBt;
		wxTextCtrl* decomposeRPGEdit;
		wxNotebook* Notebook1;
		wxStaticText* StaticText13;
		wxButton* BrowseSSBt;
		wxStaticText* StaticText2;
		wxPanel* Panel4;
		wxButton* FermerBt;
		wxButton* chooseColorMaskSSBt;
		wxStaticText* StaticText14;
		wxTextCtrl* origineYEdit;
		wxTextCtrl* spaceHSSEdit;
		wxStaticText* StaticText6;
		wxStaticText* StaticText19;
		wxStaticText* StaticText8;
		wxStaticText* StaticText11;
		wxStaticText* StaticText18;
		wxTextCtrl* FileGIFEdit;
		wxTextCtrl* fileSSEdit;
		wxTextCtrl* columnsSSEdit;
		wxButton* DecomposeRPGBt;
		wxTextCtrl* decomposeSSEdit;
		wxStaticText* StaticText3;
		wxPanel* Panel3;
		wxStaticLine* StaticLine2;
		wxTextCtrl* fileRPGEdit;
		wxTextCtrl* linesSSEdit;
		wxStaticText* StaticText5;
		wxStaticText* StaticText7;
		wxTextCtrl* widthSSEdit;
		wxColourDialog* colorDialog;
		wxButton* DecomposeGIFBt;
		wxButton* BrowseGIFBt;
		wxButton* DecomposeSSBt;
		wxStaticText* colorSSTxt;
		wxStaticText* StaticText15;
		wxStaticText* StaticText12;
		wxTextCtrl* heightSSEdit;
		wxPanel* Panel2;
		wxStaticText* tailleImageRPGEdit;
		wxStaticText* StaticText17;
		wxStaticText* StaticText4;
		wxTextCtrl* spaceVSSEdit;
		wxStaticText* nbImageGIFBt;
		wxTextCtrl* DecomposeGIFEdit;
		wxStaticText* StaticText16;
		wxTextCtrl* origineXEdit;
		//*)

	protected:

		//(*Identifiers(ImportImage)
		static const long ID_STATICTEXT3;
		static const long ID_TEXTCTRL1;
		static const long ID_BUTTON1;
		static const long ID_STATICTEXT4;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT2;
		static const long ID_BUTTON2;
		static const long ID_PANEL2;
		static const long ID_STATICTEXT10;
		static const long ID_STATICTEXT6;
		static const long ID_TEXTCTRL3;
		static const long ID_BUTTON4;
		static const long ID_STATICTEXT7;
		static const long ID_TEXTCTRL4;
		static const long ID_STATICTEXT8;
		static const long ID_STATICTEXT9;
		static const long ID_BUTTON5;
		static const long ID_PANEL3;
		static const long ID_STATICTEXT11;
		static const long ID_TEXTCTRL5;
		static const long ID_BUTTON6;
		static const long ID_STATICTEXT14;
		static const long ID_TEXTCTRL8;
		static const long ID_STATICTEXT15;
		static const long ID_TEXTCTRL9;
		static const long ID_STATICTEXT12;
		static const long ID_TEXTCTRL6;
		static const long ID_STATICTEXT13;
		static const long ID_TEXTCTRL7;
		static const long ID_STATICTEXT16;
		static const long ID_TEXTCTRL10;
		static const long ID_STATICTEXT17;
		static const long ID_TEXTCTRL11;
		static const long ID_STATICTEXT18;
		static const long ID_TEXTCTRL12;
		static const long ID_STATICTEXT19;
		static const long ID_TEXTCTRL13;
		static const long ID_CHECKBOX1;
		static const long ID_STATICTEXT22;
		static const long ID_BUTTON8;
		static const long ID_STATICTEXT20;
		static const long ID_TEXTCTRL14;
		static const long ID_STATICTEXT21;
		static const long ID_BUTTON7;
		static const long ID_PANEL4;
		static const long ID_NOTEBOOK1;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(ImportImage)
		void OnBrowseGIFBtClick(wxCommandEvent& event);
		void OnFileGIFEditText(wxCommandEvent& event);
		void OnDecomposeGIFBtClick(wxCommandEvent& event);
		void OnFermerBtClick(wxCommandEvent& event);
		void OnbrowseRPGBtClick(wxCommandEvent& event);
		void OnfileRPGEditText(wxCommandEvent& event);
		void OnDecomposeRPGEditClick(wxCommandEvent& event);
		void OnBrowseSSBtClick(wxCommandEvent& event);
		void OnDecomposeSSBtClick(wxCommandEvent& event);
		void OnhasMaskSSCheckClick(wxCommandEvent& event);
		void OnchooseColorMaskSSBtClick(wxCommandEvent& event);
		//*)

		unsigned char maskR;
		unsigned char maskG;
		unsigned char maskB;

		DECLARE_EVENT_TABLE()
};

#endif

