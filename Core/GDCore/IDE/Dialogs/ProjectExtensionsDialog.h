/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef ProjectExtensionsDialog_H
#define ProjectExtensionsDialog_H

//(*Headers(ProjectExtensionsDialog)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checklst.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/htmllbox.h>
namespace gd { class Project; }

namespace gd
{

/**
 * \brief Dialog designed for editing the extensions used by a project.
 */
class GD_CORE_API ProjectExtensionsDialog: public wxDialog
{
	public:

		ProjectExtensionsDialog(wxWindow* parent, gd::Project & project_);
		virtual ~ProjectExtensionsDialog();

		//(*Declarations(ProjectExtensionsDialog)
		wxStaticText* authorTxt;
		wxStaticBitmap* StaticBitmap2;
		wxStaticBitmap* maccompatibleBmp;
		wxCheckListBox* ExtensionsList;
		wxStaticText* StaticText2;
		wxButton* FermerBt;
		wxStaticText* StaticText6;
		wxTextCtrl* infoEdit;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxHyperlinkCtrl* HyperlinkCtrl1;
		wxStaticText* StaticText5;
		wxStaticLine* StaticLine1;
		wxHyperlinkCtrl* helpBt;
		wxStaticText* licenseTxt;
		wxStaticText* StaticText4;
		wxStaticBitmap* StaticBitmap3;
		wxStaticBitmap* wincompatibleBmp;
		wxStaticBitmap* linuxcompatibleBmp;
		//*)

	protected:

		//(*Identifiers(ProjectExtensionsDialog)
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
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT8;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_STATICBITMAP5;
		static const long ID_HYPERLINKCTRL2;
		static const long ID_STATICTEXT2;
		static const long ID_BUTTON3;
		//*)

	private:

		//(*Handlers(ProjectExtensionsDialog)
		void OninstallNewExtensionBtClick(wxCommandEvent& event);
		void OnuninstallExtensionBtClick(wxCommandEvent& event);
		void OnExtensionsListSelect(wxCommandEvent& event);
		void OnFermerBtClick(wxCommandEvent& event);
		void OnHyperlinkCtrl2Click(wxCommandEvent& event);
		void OnhelpBtClick(wxCommandEvent& event);
		//*)
		void UpdateList();

		gd::Project & project;

		DECLARE_EVENT_TABLE()
};

}

#endif
