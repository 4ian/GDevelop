/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#ifndef EXTERNALEVENTSEDITOR_H
#define EXTERNALEVENTSEDITOR_H

//(*Headers(ExternalEventsEditor)
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/panel.h>
#include <wx/combobox.h>
//*)
namespace gd { class ExternalEvents; };
namespace gd { class Project; }
class EventsEditor;
#include "GDCore/Project/Layout.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/String.h"

/**
 * \brief A panel displaying an events editor to edit
 * an external events sheet.
 */
class ExternalEventsEditor: public wxPanel
{
public:

    ExternalEventsEditor(wxWindow* parent, gd::Project & game_, gd::ExternalEvents & events_, const gd::MainFrameWrapper & mainFrameWrapper_);
    virtual ~ExternalEventsEditor();

    //(*Declarations(ExternalEventsEditor)
    wxFlexGridSizer* FlexGridSizer4;
    EventsEditor* eventsEditor;
    wxStaticText* StaticText1;
    wxComboBox* parentSceneComboBox;
    wxFlexGridSizer* FlexGridSizer1;
    //*)

    gd::ExternalEvents & events;
    gd::Project & game;

    /**
     * Can be called by parent so as to refresh ribbon for this editor.
     */
    void ForceRefreshRibbonAndConnect();

protected:

    //(*Identifiers(ExternalEventsEditor)
    static const long ID_STATICTEXT1;
    static const long ID_COMBOBOX1;
    static const long ID_CUSTOM2;
    //*)

private:

    //(*Handlers(ExternalEventsEditor)
    void OnComboBox1Select(wxCommandEvent& event);
    void OnparentSceneComboBoxSelect(wxCommandEvent& event);
    //*)
    void OnparentSceneComboBoxDropDown(wxCommandEvent& event);

    Scene emptyScene;
    gd::MainFrameWrapper mainFrameWrapper;

    DECLARE_EVENT_TABLE()
};

#endif
