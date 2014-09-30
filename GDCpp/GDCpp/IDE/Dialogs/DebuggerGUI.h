#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef DEBUGGERGUI_H
#define DEBUGGERGUI_H
#include "GDCppDialogs.h"
/*#ifdef ___WXMSW___
#include <wx/msw/winundef.h>
#endif*/

#include <wx/toolbar.h>

#include "GDCpp/RuntimeScene.h"
#include "GDCpp/Project.h"
#include "GDCpp/IDE/BaseDebugger.h"

class GD_API DebuggerGUI : public DebuggerGUIBase, public BaseDebugger
{
public:
    DebuggerGUI(wxWindow* parent, RuntimeScene &scene_);
    virtual ~DebuggerGUI();

    void Pause();
    void Play(); 

protected:
    static const long ID_EXTLIST;

    void OntoolbarPanelResize(wxSizeEvent& event);
    void OnobjectsTreeSelectionChanged(wxTreeEvent& event);
    void OnobjectsTreeItemActivated(wxTreeEvent& event);
    void OnobjectListItemActivated(wxListEvent& event);
    void OnBitmapButton1Click(wxCommandEvent& event);
    void OndeleteBtClick(wxCommandEvent& event);
    void OngeneralListItemActivated(wxListEvent& event);
    void OnResize(wxSizeEvent& event);
    void OnPlayBtClick(wxCommandEvent& event);
    void OnPauseBtClick(wxCommandEvent& event);
    void OnStepBtClick(wxCommandEvent& event);
    void OnAddObjBtClick(wxCommandEvent& event);
    void OnAddVarGlobalBtClick(wxCommandEvent& event);
    void OnAddVarSceneBtClick(wxCommandEvent& event);

private:
    void UpdateGUI();
    void OnExtensionListItemActivated(wxListEvent& event);
    void UpdateListCtrlColumnsWidth();

    void RecreateListForObject(const RuntimeObjSPtr & object);

    RuntimeScene & scene;

    std::map < boost::weak_ptr<RuntimeObject>, std::pair<std::string, wxTreeItemId> > objectsInTree;
    std::map < std::string, wxTreeItemId > initialObjects;
    bool mustRecreateTree;

    std::vector<wxListCtrl*> extensionsListCtrls; ///< Contains wxListCtrl used to display properties of each extensions.

    unsigned int baseItemCount;
    unsigned int generalBaseItemCount;
    unsigned int generalBaseAndVariablesItemCount;
    bool doMAJ;
    bool objectChanged;

    wxFont font;
};

#endif // DEBUGGERGUI_H
#endif
