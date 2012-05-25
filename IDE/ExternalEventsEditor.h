/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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
class Game;
class EventsEditor;
#include "GDL/Scene.h"
#include "GDL/IDE/MainEditorCommand.h"

class ExternalEventsEditor: public wxPanel
{
public:

    ExternalEventsEditor(wxWindow* parent, Game & game_, gd::ExternalEvents & events_, const MainEditorCommand & mainEditorCommand_);
    virtual ~ExternalEventsEditor();

    //(*Declarations(ExternalEventsEditor)
    wxFlexGridSizer* FlexGridSizer4;
    EventsEditor* eventsEditor;
    wxStaticText* StaticText1;
    wxComboBox* parentSceneComboBox;
    wxFlexGridSizer* FlexGridSizer1;
    //*)

    gd::ExternalEvents & events;
    Game & game;

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
    MainEditorCommand mainEditorCommand;

    DECLARE_EVENT_TABLE()
};

#endif
