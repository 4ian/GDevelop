/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#ifndef SEARCHEVENTS_H
#define SEARCHEVENTS_H

//(*Headers(SearchEvents)
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <string>
#include <vector>
#include "GDCore/Events/Event.h"
namespace gd { class Project; };
namespace gd { class Layout; };
class EventsEditor;
namespace gd { class EventsSearchResult; };

/**
 * Search/Replace dialogs for events.
 * Intented to be only used by EventsEditor
 */
class SearchEvents: public wxDialog
{
public:

    SearchEvents(EventsEditor * parent_, gd::Project & project_, gd::Layout & layout_, gd::EventsList * events_);
    virtual ~SearchEvents();

    //(*Handlers(SearchEvents)
    void OnreplaceBtClick(wxCommandEvent& event);
    void OnsearchBtClick(wxCommandEvent& event);
    void OnsearchEditText(wxCommandEvent& event);
    void OnnextBtClick(wxCommandEvent& event);
    void OnpreviousBtClick(wxCommandEvent& event);
    void OnhelpBtClick(wxCommandEvent& event);
    void OnsearchToReplaceEditText(wxCommandEvent& event);
    void OnKeyDown(wxKeyEvent& event);
    //*)


private:

    //(*Identifiers(SearchEvents)
    static const long ID_STATICTEXT1;
    static const long ID_TEXTCTRL1;
    static const long ID_STATICTEXT4;
    static const long ID_CHECKBOX6;
    static const long ID_CHECKBOX1;
    static const long ID_CHECKBOX2;
    static const long ID_STATICBITMAP2;
    static const long ID_HYPERLINKCTRL1;
    static const long ID_BUTTON1;
    static const long ID_BUTTON2;
    static const long ID_BUTTON3;
    static const long ID_PANEL1;
    static const long ID_STATICTEXT2;
    static const long ID_TEXTCTRL2;
    static const long ID_STATICTEXT3;
    static const long ID_TEXTCTRL3;
    static const long ID_CHECKBOX8;
    static const long ID_CHECKBOX7;
    static const long ID_CHECKBOX9;
    static const long ID_CHECKBOX10;
    static const long ID_STATICBITMAP1;
    static const long ID_HYPERLINKCTRL2;
    static const long ID_BUTTON4;
    static const long ID_PANEL2;
    static const long ID_NOTEBOOK1;
    //*)

    //(*Declarations(SearchEvents)
    wxCheckBox* replaceCaseCheck;
    wxStaticBitmap* StaticBitmap2;
    wxButton* previousBt;
    wxCheckBox* actionsCheck;
    wxNotebook* Notebook1;
    wxCheckBox* replaceActionsCheck;
    wxCheckBox* caseCheck;
    wxStaticText* StaticText2;
    wxStaticBitmap* StaticBitmap1;
    wxPanel* Panel1;
    wxStaticText* StaticText1;
    wxStaticText* StaticText3;
    wxHyperlinkCtrl* HyperlinkCtrl1;
    wxCheckBox* replaceConditionsCheck;
    wxTextCtrl* searchEdit;
    wxTextCtrl* replaceEdit;
    wxCheckBox* onlySelectedEventCheck;
    wxCheckBox* conditionsCheck;
    wxTextCtrl* searchToReplaceEdit;
    wxStaticText* resultsCountTxt;
    wxButton* replaceBt;
    wxHyperlinkCtrl* helpBt;
    wxPanel* Panel2;
    wxButton* nextBt;
    wxButton* searchBt;
    //*)

    EventsEditor * parent;
    gd::Project & project;
    gd::Layout & layout;

    gd::EventsList * events;
    std::vector < gd::EventsSearchResult > searchResults;
    size_t currentResult;

    DECLARE_EVENT_TABLE()
};

#endif

