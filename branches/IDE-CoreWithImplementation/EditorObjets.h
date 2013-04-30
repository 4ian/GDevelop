/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef EDITOROBJETS_H
#define EDITOROBJETS_H

//(*Headers(EditorObjets)
#include <wx/notebook.h>
#include <wx/panel.h>
#include "EditorObjectList.h"
//*)
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasAssociatedEditor.h"
#include <wx/aui/aui.h>
#include <wx/imaglist.h>
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include "EditorObjetsGroups.h"

/**
 * \brief Editor composed of 4 sub editors allowing to edit objects and groups of the scene and of the game.
 */
class EditorObjets: public wxPanel, public gd::LayoutEditorCanvasAssociatedEditor
{
public:

    EditorObjets(wxWindow* parent, gd::Project & game_, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_);
    virtual ~EditorObjets();

    /**
     * Refresh the objects and groups lists
     */
    void Refresh();

    /**
     * Enable or disable the editor.
     */
    virtual bool Enable(bool enable=true) { return wxWindow::Enable(enable); };

    /**
     * Can be called by another editor ( Typically a gd::LayoutEditorCanvas, which has a list of editors
     * of type gd::LayoutEditorCanvasAssociatedEditor ) to notify that objects have been changed.
     */
    virtual void ObjectsUpdated() { Refresh(); };

protected:

    //(*Identifiers(EditorObjets)
    static const long ID_CUSTOM3;
    static const long ID_CUSTOM1;
    static const long ID_NOTEBOOK2;
    static const long ID_CUSTOM2;
    static const long ID_CUSTOM4;
    static const long ID_NOTEBOOK3;
    static const long ID_NOTEBOOK1;
    //*)
    static const long ID_BITMAPBUTTON1;
    static const long ID_BITMAPBUTTON2;
    static const long ID_BITMAPBUTTON3;
    static const long ID_BITMAPBUTTON6;
    static const long ID_BITMAPBUTTON7;

private:

    //(*Handlers(EditorObjets)
    void OnResize(wxSizeEvent& event);
    //*)

    //(*Declarations(EditorObjets)
    wxNotebook* sceneNotebook;
    wxNotebook* Notebook1;
    EditorObjetsGroups* ObjetsGroups;
    EditorObjectList* sceneObjectsEditor;
    EditorObjetsGroups* globalObjectsGroups;
    wxNotebook* globalNotebook;
    EditorObjectList* globalObjectsEditor;
    //*)
    wxImageList* sceneNotebookImageList;
    wxImageList* globalNotebookImageList;
    wxImageList* notebookImageList;

    gd::Project & game;
    gd::Layout & scene;

    gd::MainFrameWrapper & mainFrameWrapper;

    DECLARE_EVENT_TABLE()
};

#endif

