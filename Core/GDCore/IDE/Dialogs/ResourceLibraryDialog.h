/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef RESOURCELIBRARYDIALOG_H
#define RESOURCELIBRARYDIALOG_H

//(*Headers(ResourceLibraryDialog)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/treelist.h>

namespace gd
{

/**
 * \brief Dialog used to display "resource libraries" located in a folder
 *
 * A resource library is a folder containing the resources ( i.e. images ) and a Readme.txt file
 * The dialog allows the user to browse the libraries located in a root folder and choose some resources
 * ( The caller of the dialog must take care of adding selected resources to the project )
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API ResourceLibraryDialog: public wxDialog
{
	public:

		ResourceLibraryDialog(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
		virtual ~ResourceLibraryDialog();

		//(*Declarations(ResourceLibraryDialog)
		wxStaticText* StaticText2;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxStaticLine* StaticLine2;
		wxButton* closeBt;
		wxStaticLine* StaticLine1;
		wxTextCtrl* insertionFolderEdit;
		wxListCtrl* listCtrl;
		//*)

	protected:

		//(*Identifiers(ResourceLibraryDialog)
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE1;
		static const long ID_LISTCTRL1;
		static const long ID_STATICTEXT3;
		static const long ID_STATICTEXT2;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON1;
		//*)

	private:

		//(*Handlers(ResourceLibraryDialog)
		void OnInit(wxInitDialogEvent& event);
		void OnlistCtrlItemActivated(wxListEvent& event);
		void OnButton1Click(wxCommandEvent& event);
		void OncloseBtClick(wxCommandEvent& event);
		void OnlistCtrlBeginDrag(wxListEvent& event);
		//*)
		void OnSelectionChanged(wxTreeListEvent& event);
		void OnItemChecked(wxTreeListEvent& event);

		void ConstructList();

		wxString currentDir;

		DECLARE_EVENT_TABLE()
};

}

#endif
#endif
