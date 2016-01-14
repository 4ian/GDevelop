/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef EDITCPPCODEEVENT_H
#define EDITCPPCODEEVENT_H

//(*Headers(EditCppCodeEvent)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checklst.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/bmpbuttn.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
#include <wx/stc/stc.h>
//*)
class CppCodeEvent;
namespace gd { class Project; }
namespace gd { class Layout; }

class EditCppCodeEvent: public wxDialog
{
	public:

		EditCppCodeEvent(wxWindow* parent, CppCodeEvent & event_, gd::Project & game_, gd::Layout & scene_);
		virtual ~EditCppCodeEvent();

		//(*Declarations(EditCppCodeEvent)
		wxTextCtrl* displayedNameEdit;
		wxStaticText* functionPrototypeTxt;
		wxCheckBox* objectsListCheck;
		wxCheckBox* displayCodeCheck;
		wxTextCtrl* objectPassedAsParameterEdit;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxButton* cancelBt;
		wxCheckBox* sceneRefCheck;
		wxStaticLine* StaticLine2;
		wxBitmapButton* objectBt;
		wxCheckListBox* dependenciesList;
		wxStaticLine* StaticLine1;
		wxStyledTextCtrl* codeEdit;
		wxTextCtrl* includeTextCtrl;
		wxStaticText* StaticText4;
		wxButton* okBt;
		wxStaticBitmap* StaticBitmap3;
		//*)

	protected:

		//(*Identifiers(EditCppCodeEvent)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT3;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_CHECKBOX2;
		static const long ID_CHECKBOX1;
		static const long ID_TEXTCTRL3;
		static const long ID_BITMAPBUTTON1;
		static const long ID_CHECKLISTBOX1;
		static const long ID_STATICTEXT1;
		static const long ID_TEXTCTRL1;
		static const long ID_CHECKBOX3;
		static const long ID_TEXTCTRL2;
		static const long ID_STATICTEXT5;
		static const long ID_CUSTOM1;
		static const long ID_STATICTEXT4;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(EditCppCodeEvent)
		void OnokBtClick(wxCommandEvent& event);
		void OncancelBtClick(wxCommandEvent& event);
		void OnobjectBtClick(wxCommandEvent& event);
		void OnobjectPassedAsParameterEditText(wxCommandEvent& event);
		void OnobjectsListCheckClick(wxCommandEvent& event);
		void OnsceneRefCheckClick(wxCommandEvent& event);
		//*)
		void UpdateTextCtrl(wxStyledTextEvent& event);

        void UpdateFunctionPrototype();

		CppCodeEvent & editedEvent;
		gd::Project & game;
		gd::Layout & scene;

		DECLARE_EVENT_TABLE()
};

#endif
#endif

