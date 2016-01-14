/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef AdvancedTextEntryDialog_H
#define AdvancedTextEntryDialog_H

//(*Headers(AdvancedTextEntryDialog)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
namespace gd { class Project; }
namespace gd { class Layout; }

namespace gd
{

/**
 * \brief Dialog used to enter a math or gd::String expression, with a button to open
 * a full editor.
 *
 * \ingroup IDEDialogs
 */
class AdvancedTextEntryDialog: public wxDialog
{
public:
    enum MoreButtonType { None,  MathExpression, TextExpression };

	AdvancedTextEntryDialog(wxWindow* parent, gd::String caption, gd::String description, gd::String defaultText, MoreButtonType moreButtonType = None, gd::Project * project_ = NULL, gd::Layout * layout_ = NULL);
	virtual ~AdvancedTextEntryDialog();

	//(*Declarations(AdvancedTextEntryDialog)
	wxStaticText* descriptionTxt;
	wxTextCtrl* textEdit;
	wxButton* cancelBt;
	wxButton* moreBt;
	wxStaticLine* StaticLine1;
	wxButton* okBt;
	//*)

	gd::String text;

protected:
	//(*Identifiers(AdvancedTextEntryDialog)
	static const long ID_STATICTEXT1;
	static const long ID_TEXTCTRL1;
	static const long ID_STATICLINE1;
	static const long ID_BUTTON1;
	static const long ID_BUTTON2;
	static const long ID_BUTTON3;
	//*)

private:
	//(*Handlers(AdvancedTextEntryDialog)
	void OnmoreBtClick(wxCommandEvent& event);
	void OnokBtClick(wxCommandEvent& event);
	void OncancelBtClick(wxCommandEvent& event);
	//*)

	MoreButtonType moreButtonType;
	gd::Project * project;
	gd::Layout * layout;

	DECLARE_EVENT_TABLE()
};

}
#endif
#endif
