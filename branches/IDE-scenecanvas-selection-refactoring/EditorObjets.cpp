/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

#include "EditorObjets.h"

//(*InternalHeaders(EditorObjets)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/log.h>
#include <wx/textdlg.h>
#include <wx/help.h>
#include <wx/toolbar.h>
#include <wx/aui/aui.h>
#include <wx/config.h>

#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/Object.h"
#include "GDL/CommonTools.h"
#include "GDCore/IDE/Clipboard.h"
#include <algorithm>
#include <numeric>
#include "EditorObjetsGroups.h"
#include "GDCore/IDE/CommonBitmapManager.h"

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

//(*IdInit(EditorObjets)
const long EditorObjets::ID_CUSTOM3 = wxNewId();
const long EditorObjets::ID_CUSTOM1 = wxNewId();
const long EditorObjets::ID_NOTEBOOK2 = wxNewId();
const long EditorObjets::ID_CUSTOM2 = wxNewId();
const long EditorObjets::ID_CUSTOM4 = wxNewId();
const long EditorObjets::ID_NOTEBOOK3 = wxNewId();
const long EditorObjets::ID_NOTEBOOK1 = wxNewId();
//*)
const long EditorObjets::ID_BITMAPBUTTON1 = wxNewId();
const long EditorObjets::ID_BITMAPBUTTON2 = wxNewId();
const long EditorObjets::ID_BITMAPBUTTON3 = wxNewId();
const long EditorObjets::ID_BITMAPBUTTON6 = wxNewId();
const long EditorObjets::ID_BITMAPBUTTON7 = wxNewId();

BEGIN_EVENT_TABLE( EditorObjets, wxPanel )
    //(*EventTable(EditorObjets)
    //*)
END_EVENT_TABLE()

EditorObjets::EditorObjets(wxWindow* parent, Game & game_, Scene & scene_, gd::MainFrameWrapper & mainFrameWrapper_) :
game(game_),
scene(scene_),
mainFrameWrapper(mainFrameWrapper_)
{
    //(*Initialize(EditorObjets)
    Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
    Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxSize(128,168), 0, _T("ID_NOTEBOOK1"));
    sceneNotebook = new wxNotebook(Notebook1, ID_NOTEBOOK2, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK2"));
    sceneObjectsEditor = new EditorObjectList(sceneNotebook, game, scene, mainFrameWrapper, &scene);
    ObjetsGroups = new EditorObjetsGroups(sceneNotebook, game, scene, &scene.GetObjectGroups(), mainFrameWrapper);
    sceneNotebook->AddPage(sceneObjectsEditor, _("Objects"), false);
    sceneNotebook->AddPage(ObjetsGroups, _("Objects groups"), false);
    globalNotebook = new wxNotebook(Notebook1, ID_NOTEBOOK3, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK3"));
    globalObjectsEditor = new EditorObjectList(globalNotebook, game, game, mainFrameWrapper, &scene);
    globalObjectsGroups = new EditorObjetsGroups(globalNotebook, game, scene, &game.GetObjectGroups(), mainFrameWrapper);
    globalNotebook->AddPage(globalObjectsEditor, _("Global objects"), false);
    globalNotebook->AddPage(globalObjectsGroups, _("Global groups"), false);
    Notebook1->AddPage(sceneNotebook, _("Scene"), false);
    Notebook1->AddPage(globalNotebook, _("Global"), false);

    Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorObjets::OnResize);
    //*)

    globalNotebookImageList = new wxImageList( 16, 16 );
    globalNotebookImageList->Add(( wxBitmap( "res/objeticon.png", wxBITMAP_TYPE_ANY ) ) );
    globalNotebookImageList->Add(( wxBitmap( "res/groupeobjeticon.png", wxBITMAP_TYPE_ANY ) ) );
    globalNotebook->AssignImageList(globalNotebookImageList);

    sceneNotebookImageList = new wxImageList( 16, 16 );
    sceneNotebookImageList->Add(( wxBitmap( "res/objeticon.png", wxBITMAP_TYPE_ANY ) ) );
    sceneNotebookImageList->Add(( wxBitmap( "res/groupeobjeticon.png", wxBITMAP_TYPE_ANY ) ) );
    sceneNotebook->AssignImageList(sceneNotebookImageList);

    notebookImageList = new wxImageList( 16, 16 );
    notebookImageList->Add(wxBitmap("res/sceneeditor.png", wxBITMAP_TYPE_ANY));
    notebookImageList->Add(wxBitmap("res/window.png", wxBITMAP_TYPE_ANY));
    Notebook1->AssignImageList(notebookImageList);

    Notebook1->SetPageImage(0,0);
    Notebook1->SetPageImage(1,1);
    sceneNotebook->SetPageImage(0,0);
    sceneNotebook->SetPageImage(1,1);
    globalNotebook->SetPageImage(0,0);
    globalNotebook->SetPageImage(1,1);
}

EditorObjets::~EditorObjets()
{
    //(*Destroy(EditorObjets)
    //*)
}

void EditorObjets::Refresh()
{
    sceneObjectsEditor->Refresh();
    ObjetsGroups->Refresh();
    globalObjectsEditor->Refresh();
    globalObjectsGroups->Refresh();
}

/**
 * Need to resize manually notebook
 */
void EditorObjets::OnResize(wxSizeEvent& event)
{
    Notebook1->SetSize(GetSize());
}

