/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef LAYOUTEDITORCANVASASSOCIATEDEDITOR_H
#define LAYOUTEDITORCANVASASSOCIATEDEDITOR_H
namespace gd { class InitialInstance; }

namespace gd
{

/**
 * \brief Base class meant to be used by the IDE for its editors that are associated with a gd::LayoutEditorCanvas.
 *
 * When the IDE create a LayoutEditorCanvas and some others editors ( like an objects editor, also a layers editor probably ), the latter
 * must be aware of changes happening in the LayoutEditorCanvas ( and reciprocally, the LayoutEditorCanvas sometimes must be updated after
 * changes inside these editors. ). This class provides a simple interface to allow these notifications to be transmitted.
 *
 * \ingroup IDE
 * \ingroup IDE dialogs
 */
class LayoutEditorCanvasAssociatedEditor
{
public:
    LayoutEditorCanvasAssociatedEditor() {};
    virtual ~LayoutEditorCanvasAssociatedEditor() {};

    /**
     * Called when a full refresh of the editor must be done.
     */
    virtual void Refresh() =0;

    /**
     * Called by LayoutEditorCanvas when an initial instance is selected
     */
    virtual void SelectedInitialInstance(const gd::InitialInstance & instance) {};

    /**
     * Called by LayoutEditorCanvas when an initial instance is deselected
     */
    virtual void DeselectedInitialInstance(const gd::InitialInstance & instance) {};

    /**
     * Called by LayoutEditorCanvas when all initial instances are deselected.
     */
    virtual void DeselectedAllInitialInstance() {};

    /**
     * Called when the initial instances of the layout have been updated
     */
    virtual void InitialInstancesUpdated() {};

    /**
     * Called when the objects of the layout have been changed inside the gd::LayoutEditorCanvas.
     * ( Typically, LayoutEditorCanvas can allow the user to create a new object by choosing an option in a contextual menu )
     */
    virtual void ObjectsUpdated() {};

    /**
     * Ask the editor to go into a normal ( non greyed ) or disabled ( greyed ) state.
     */
    virtual bool Enable(bool enable=true) =0;
};

}

#endif // LAYOUTEDITORCANVASASSOCIATEDEDITOR_H
#endif
