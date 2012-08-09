/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef EDITOROBJECTLIST_H
#define EDITOROBJECTLIST_H

//(*Headers(EditorObjectList)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/textctrl.h>
#include <wx/panel.h>
//*)
#include <wx/toolbar.h>
#include <wx/image.h>
#include <string>
#include <vector>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>
#include <wx/srchctrl.h>
namespace gd {class ClassWithObjects;}
#include "GDL/Object.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"

class EditorObjectList: public wxPanel
{
public:

    /**
     * Default constructor
     * \param parent wxWidgets parent window
     * \param game Project the objects belong to
     * \param objects The class with the objects to edit ( i.e. The project or a layout )
     * \param mainFrameWrapper gd::MainFrameWrapper object
     * \param scene optional pointer to the layout the objects belong to. Can be NULL.
     */
    EditorObjectList(wxWindow* parent, Game & game_, gd::ClassWithObjects & objects, gd::MainFrameWrapper & mainFrameWrapper, Scene * scene_);
    virtual ~EditorObjectList();

    //(*Declarations(EditorObjectList)
    wxMenuItem* renameAutomatism;
    wxMenuItem* effectsMenuI;
    wxMenuItem* addAutomatismItem;
    wxSearchCtrl* searchCtrl;
    wxMenu* automatismsMenu;
    wxMenuItem* MenuItem2;
    wxMenuItem* MenuItem1;
    wxTreeCtrl* objectsList;
    wxMenuItem* deleteAutomatismItem;
    wxMenuItem* copyMenuI;
    wxMenu ContextMenu;
    wxMenuItem* moveUpMenuI;
    wxMenuItem* MenuItem3;
    wxMenu rootContextMenu;
    wxMenuItem* moveDownMenuI;
    wxMenuItem* cutMenuI;
    wxMenu multipleContextMenu;
    wxMenuItem* pasteMenuI;
    //*)

    static void CreateRibbonPage(wxRibbonPage * page);
    void ConnectEvents();

    void Refresh();

    gd::ClassWithObjects & objects;

protected:

    //(*Identifiers(EditorObjectList)
    static const long ID_TREECTRL1;
    static const long ID_TEXTCTRL1;
    static const long idMenuModObj;
    static const long idMenuModVar;
    static const long ID_MENUITEM2;
    static const long ID_MENUITEM5;
    static const long ID_MENUITEM3;
    static const long ID_MENUITEM1;
    static const long idMenuEffects;
    static const long idMenuModName;
    static const long idMenuAddObj;
    static const long idMenuDelObj;
    static const long idMoveUp;
    static const long idMoveDown;
    static const long idMenuCopy;
    static const long idMenuCut;
    static const long idMenuPaste;
    static const long ID_MENUITEM4;
    static const long ID_MENUITEM6;
    static const long ID_MENUITEM7;
    //*)
    static const long ID_BITMAPBUTTON1;
    static const long ID_BITMAPBUTTON2;
    static const long ID_BITMAPBUTTON3;
    static const long ID_BITMAPBUTTON6;
    static const long ID_BITMAPBUTTON7;
    static const long idRibbonAdd;
    static const long idRibbonDel;
    static const long idRibbonUp;
    static const long idRibbonDown;
    static const long idRibbonModProp;
    static const long idRibbonModName;
    static const long idRibbonCopy;
    static const long idRibbonCut;
    static const long idRibbonPaste;
    static const long idRibbonHelp;
    static const long idRibbonRefresh;

private:

    //(*Handlers(EditorObjectList)
    void OneditMenuISelected(wxCommandEvent& event);
    void OneditNameMenuISelected(wxCommandEvent& event);
    void OnaddObjMenuISelected(wxCommandEvent& event);
    void OndelObjMenuISelected(wxCommandEvent& event);
    void OntoolbarPanelResize(wxSizeEvent& event);
    void OnobjectsListSelectionChanged(wxTreeEvent& event);
    void OnobjectsListItemActivated(wxTreeEvent& event);
    void OnobjectsListBeginLabelEdit(wxTreeEvent& event);
    void OnobjectsListEndLabelEdit(wxTreeEvent& event);
    void OnobjectsListItemMenu(wxTreeEvent& event);
    void OnCopySelected(wxCommandEvent& event);
    void OnMoveDownSelected(wxCommandEvent& event);
    void OnMoveUpSelected(wxCommandEvent& event);
    void OnPasteSelected(wxCommandEvent& event);
    void OnCutSelected(wxCommandEvent& event);
    void OnSetFocus(wxFocusEvent& event);
    void OnobjectsListBeginDrag(wxTreeEvent& event);
    void OneditVarMenuISelected(wxCommandEvent& event);
    void OnobjectsListItemRightClick(wxTreeEvent& event);
    void OnaddAutomatismItemSelected(wxCommandEvent& event);
    void OndeleteAutomatismItemSelected(wxCommandEvent& event);
    void OnrenameAutomatismSelected(wxCommandEvent& event);
    void OnobjectsListKeyDown(wxTreeEvent& event);
    void OnsearchCtrlText(wxCommandEvent& event);
    //*)
    void OnAutomatismSelected(wxCommandEvent & event);
    void OnRefreshBtClick(wxCommandEvent& event);
    void OnAideBtClick(wxCommandEvent& event);
    void OnMoreOptions(wxCommandEvent& event);
    void RemoveSharedDatasIfNecessary(std::string automatismType);
    void CreateSharedDatasIfNecessary(gd::Automatism & automatism);
    bool CheckObjectName(std::string name);

    wxImageList* imageList;
    wxImageList* objectsImagesList;

    Game & game;
    Scene * scene; ///< Scene edited. Can be NULL, in which case objects are considered to be global.
    bool globalObjects; ///< If true, the objects edited are global. Automatically deduced (in the constructor) by checking if &game == &objects.

    gd::MainFrameWrapper & mainFrameWrapper;

    vector < std::pair<long, std::string> > idForAutomatism;

    wxTreeItemId item; ///< Selected item in the list
    string ancienNom;

    DECLARE_EVENT_TABLE()
};

#endif
