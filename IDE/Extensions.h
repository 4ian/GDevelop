#ifndef Extensions_H
#define Extensions_H

//(*Headers(Extensions)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checklst.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <boost/shared_ptr.hpp>
#include <string>
#include <vector>

class ExtensionBase;
class Game;

using namespace std;

class Extensions: public wxDialog
{
	public:

		Extensions(wxWindow* parent, Game & game_);
		virtual ~Extensions();

		//(*Declarations(Extensions)
		wxStaticText* authorTxt;
		wxCheckListBox* ExtensionsList;
		wxButton* FermerBt;
		wxTextCtrl* infoEdit;
		wxButton* uninstallExtensionBt;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxStaticText* StaticText5;
		wxStaticLine* StaticLine1;
		wxButton* installNewExtensionBt;
		wxStaticText* licenseTxt;
		wxStaticText* StaticText4;
		wxStaticBitmap* StaticBitmap3;
		wxStaticBitmap* wincompatibleBmp;
		wxStaticBitmap* linuxcompatibleBmp;
		//*)

	protected:

		//(*Identifiers(Extensions)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_CHECKLISTBOX1;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT6;
		static const long ID_STATICTEXT4;
		static const long ID_STATICTEXT7;
		static const long ID_STATICBITMAP2;
		static const long ID_STATICBITMAP4;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(Extensions)
		void OninstallNewExtensionBtClick(wxCommandEvent& event);
		void OnuninstallExtensionBtClick(wxCommandEvent& event);
		void OnExtensionsListSelect(wxCommandEvent& event);
		void OnFermerBtClick(wxCommandEvent& event);
		//*)
		void UpdateList();

		Game & game;

		DECLARE_EVENT_TABLE()
};

#endif
