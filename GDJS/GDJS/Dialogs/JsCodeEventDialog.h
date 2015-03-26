/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef JSCODEEVENTDIALOG_H
#define JSCODEEVENTDIALOG_H
#include "GDJSDialogs.h"
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gdjs { class JsCodeEvent; }

class JsCodeEventDialog : public BaseJsCodeEventDialog
{
public:
    JsCodeEventDialog(wxWindow* parent, gdjs::JsCodeEvent & event_, gd::Project & project_, gd::Layout & layout_);
    virtual ~JsCodeEventDialog();

protected:
    virtual void onCancelBtClick(wxCommandEvent& event);
    virtual void onHelpBtClick(wxHyperlinkEvent& event);
    virtual void onObjectsButtonClick(wxCommandEvent& event);
    virtual void onOkBtClick(wxCommandEvent& event);

private:
	gdjs::JsCodeEvent & event;
	gd::Project & project;
	gd::Layout & layout;

};
#endif // JSCODEEVENTDIALOG_H
#endif
