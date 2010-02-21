#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

#ifndef RELEASE
#define _MEMORY_TRACKER
#include "debugMem.h" //suivi mémoire
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
#include "GDL/Chercher.h"
#include "GDL/StdAlgo.h"
#include "GDL/needReload.h"
#include "MemTrace.h"
#include "Clipboard.h"
#include <algorithm>
#include <numeric>
#include "EditorObjetsGroups.h"
#include "GDL/BitmapGUIManager.h"

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

extern MemTrace MemTracer;

//(*IdInit(EditorObjets)
const long EditorObjets::ID_CUSTOM3 = wxNewId();
const long EditorObjets::ID_CUSTOM1 = wxNewId();
const long EditorObjets::ID_CUSTOM2 = wxNewId();
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

EditorObjets::EditorObjets(wxWindow* parent, Game & game_, Scene & scene_, vector < boost::shared_ptr<Object> > * objects_, MainEditorCommand & mainEditorCommand_) :
game(game_),
scene(scene_),
objects(objects_),
mainEditorCommand(mainEditorCommand_)
{
    MemTracer.AddObj( "Editeur d'objets", ( long )this );
    //(*Initialize(EditorObjets)
    Create(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("wxID_ANY"));
    Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxSize(128,168), wxNB_MULTILINE, _T("ID_NOTEBOOK1"));
    sceneObjectsEditor = new EditorObjectList(Notebook1, game, &scene.initialObjects, mainEditorCommand, &scene.wasModified);
    ObjetsGroups = new EditorObjetsGroups(Notebook1, game, scene, &scene.objectGroups, mainEditorCommand);
    globalObjectsEditor = new EditorObjectList(Notebook1, game, &game.globalObjects, mainEditorCommand, &scene.wasModified);
    Notebook1->AddPage(sceneObjectsEditor, _("Objets"), false);
    Notebook1->AddPage(ObjetsGroups, _("Groupes d\'objets"), false);
    Notebook1->AddPage(globalObjectsEditor, _("Objets globaux à toutes les scènes"), false);

    Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorObjets::OnResize);
    //*)

    imageList = new wxImageList( 16, 16 );
    imageList->Add(( wxBitmap( "res/objeticon.png", wxBITMAP_TYPE_ANY ) ) );
    imageList->Add(( wxBitmap( "res/groupeobjeticon.png", wxBITMAP_TYPE_ANY ) ) );
    Notebook1->AssignImageList(imageList);

    Notebook1->SetPageImage(0,0);
    Notebook1->SetPageImage(1,1);
    Notebook1->SetPageImage(2,0);

    //On vérifie si on est pas en mode simple.
    wxConfigBase * pConfig = wxConfigBase::Get();

    bool result = false;
    pConfig->Read("/ModeSimple", &result);

    if ( result )
    {
        Notebook1->RemovePage(2);
        Notebook1->RemovePage(1);
    }
}

EditorObjets::~EditorObjets()
{
    MemTracer.DelObj(( long )this );
    //(*Destroy(EditorObjets)
    //*)
}
////////////////////////////////////////////////////////////
/// Redimensionement de l'éditeur
///
/// Le notebook ne s'adapte pas automatiquement
////////////////////////////////////////////////////////////
void EditorObjets::OnResize(wxSizeEvent& event)
{
    Notebook1->SetSize(GetSize());
}
