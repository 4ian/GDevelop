/*
 * freeglut_structure.c
 *
 * Windows and menus need tree structure
 *
 * Copyright (c) 1999-2000 Pawel W. Olszta. All Rights Reserved.
 * Written by Pawel W. Olszta, <olszta@sourceforge.net>
 * Creation date: Sat Dec 18 1999
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
 * PAWEL W. OLSZTA BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

#include <GL/freeglut.h>
#include "freeglut_internal.h"

/* -- GLOBAL EXPORTS ------------------------------------------------------- */

/*
 * The SFG_Structure container holds information about windows and menus
 * created between glutInit() and glutMainLoop() return.
 */

SFG_Structure fgStructure = { { NULL, NULL },  /* The list of windows       */
                              { NULL, NULL },  /* The list of menus         */
                              { NULL, NULL },  /* Windows to Destroy list   */
                              NULL,            /* The current window        */
                              NULL,            /* The current menu          */
                              NULL,            /* The menu OpenGL context   */
                              NULL,            /* The game mode window      */
                              0,               /* The current new window ID */
                              0 };             /* The current new menu ID   */


/* -- PRIVATE FUNCTIONS ---------------------------------------------------- */

static void fghClearCallBacks( SFG_Window *window )
{
    if( window )
    {
        int i;
        for( i = 0; i < TOTAL_CALLBACKS; ++i )
            window->CallBacks[ i ] = NULL;
    }
}

/*
 * This private function creates, opens and adds to the hierarchy
 * a freeglut window complete with OpenGL context and stuff...
 *
 * If parent is set to NULL, the window created will be a topmost one.
 */
SFG_Window* fgCreateWindow( SFG_Window* parent, const char* title,
                            GLboolean positionUse, int x, int y,
                            GLboolean sizeUse, int w, int h,
                            GLboolean gameMode, GLboolean isMenu )
{
    /* Have the window object created */
    SFG_Window *window = (SFG_Window *)calloc( sizeof(SFG_Window), 1 );

#if TARGET_HOST_UNIX_X11
    window->Window.FBConfig = NULL;
#endif
    fghClearCallBacks( window );

    /* Initialize the object properties */
    window->ID = ++fgStructure.WindowID;
    window->State.OldHeight = window->State.OldWidth = -1;

    fgListInit( &window->Children );
    if( parent )
    {
        fgListAppend( &parent->Children, &window->Node );
        window->Parent = parent;
    }
    else
        fgListAppend( &fgStructure.Windows, &window->Node );

    /* Set the default mouse cursor and reset the modifiers value */
    window->State.Cursor    = GLUT_CURSOR_INHERIT;

    window->IsMenu = isMenu;

    window->State.IgnoreKeyRepeat = GL_FALSE;
    window->State.KeyRepeating    = GL_FALSE;
    window->State.IsFullscreen    = GL_FALSE;

    /*
     * Open the window now. The fgOpenWindow() function is system
     * dependant, and resides in freeglut_window.c. Uses fgState.
     */
    fgOpenWindow( window, title, positionUse, x, y, sizeUse, w, h, gameMode,
                  (GLboolean)(parent ? GL_TRUE : GL_FALSE) );

    return window;
}

/*
 * This private function creates a menu and adds it to the menus list
 */
SFG_Menu* fgCreateMenu( FGCBMenu menuCallback )
{
    int x = 100, y = 100, w = 100, h = 100;
    SFG_Window *current_window = fgStructure.CurrentWindow;

    /* Have the menu object created */
    SFG_Menu* menu = (SFG_Menu *)calloc( sizeof(SFG_Menu), 1 );

    menu->ParentWindow = NULL;

    /* Create a window for the menu to reside in. */

    fgCreateWindow( NULL, "freeglut menu", GL_TRUE, x, y, GL_TRUE, w, h,
                    GL_FALSE, GL_TRUE );
    menu->Window = fgStructure.CurrentWindow;
    glutDisplayFunc( fgDisplayMenu );

    glutHideWindow( );  /* Hide the window for now */
    fgSetWindow( current_window );

    /* Initialize the object properties: */
    menu->ID       = ++fgStructure.MenuID;
    menu->Callback = menuCallback;
    menu->ActiveEntry = NULL;

    fgListInit( &menu->Entries );
    fgListAppend( &fgStructure.Menus, &menu->Node );

    /* Newly created menus implicitly become current ones */
    fgStructure.CurrentMenu = menu;

    return menu;
}

/*
 * Function to add a window to the linked list of windows to destroy.
 * Subwindows are automatically added because they hang from the window
 * structure.
 */
void fgAddToWindowDestroyList( SFG_Window* window )
{
    SFG_WindowList *new_list_entry =
        ( SFG_WindowList* )malloc( sizeof(SFG_WindowList ) );
    new_list_entry->window = window;
    fgListAppend( &fgStructure.WindowsToDestroy, &new_list_entry->node );

    /* Check if the window is the current one... */
    if( fgStructure.CurrentWindow == window )
        fgStructure.CurrentWindow = NULL;

    /*
     * Clear all window callbacks except Destroy, which will
     * be invoked later.  Right now, we are potentially carrying
     * out a freeglut operation at the behest of a client callback,
     * so we are reluctant to re-enter the client with the Destroy
     * callback, right now.  The others are all wiped out, however,
     * to ensure that they are no longer called after this point.
     */
    {
        FGCBDestroy destroy = (FGCBDestroy)FETCH_WCB( *window, Destroy );
        fghClearCallBacks( window );
        SET_WCB( *window, Destroy, destroy );
    }
}

/*
 * Function to close down all the windows in the "WindowsToDestroy" list
 */
void fgCloseWindows( )
{
    while( fgStructure.WindowsToDestroy.First )
    {
        SFG_WindowList *window_ptr = fgStructure.WindowsToDestroy.First;
        fgDestroyWindow( window_ptr->window );
        fgListRemove( &fgStructure.WindowsToDestroy, &window_ptr->node );
        free( window_ptr );
    }
}

/*
 * This function destroys a window and all of its subwindows. Actually,
 * another function, defined in freeglut_window.c is called, but this is
 * a whole different story...
 */
void fgDestroyWindow( SFG_Window* window )
{
    FREEGLUT_INTERNAL_ERROR_EXIT ( window, "Window destroy function called with null window",
                                   "fgDestroyWindow" );

    while( window->Children.First )
        fgDestroyWindow( ( SFG_Window * )window->Children.First );

    {
        SFG_Window *activeWindow = fgStructure.CurrentWindow;
        INVOKE_WCB( *window, Destroy, ( ) );
        fgSetWindow( activeWindow );
    }

    if( window->Parent )
        fgListRemove( &window->Parent->Children, &window->Node );
    else
        fgListRemove( &fgStructure.Windows, &window->Node );

    if( window->ActiveMenu )
      fgDeactivateMenu( window );

    fghClearCallBacks( window );
    fgCloseWindow( window );
    free( window );
    if( fgStructure.CurrentWindow == window )
        fgStructure.CurrentWindow = NULL;
}

/*
 * This is a helper static function that removes a menu (given its pointer)
 * from any windows that can be accessed from a given parent...
 */
static void fghRemoveMenuFromWindow( SFG_Window* window, SFG_Menu* menu )
{
    SFG_Window *subWindow;
    int i;

    /* Check whether this is the active menu in the window */
    if ( menu == window->ActiveMenu )
        window->ActiveMenu = NULL ;

    /*
     * Check if the menu is attached to the current window,
     * if so, have it detached (by overwriting with a NULL):
     */
    for( i = 0; i < FREEGLUT_MAX_MENUS; i++ )
        if( window->Menu[ i ] == menu )
            window->Menu[ i ] = NULL;

    /* Call this function for all of the window's children recursively: */
    for( subWindow = (SFG_Window *)window->Children.First;
         subWindow;
         subWindow = (SFG_Window *)subWindow->Node.Next)
        fghRemoveMenuFromWindow( subWindow, menu );
}

/*
 * This is a static helper function that removes menu references
 * from another menu, given two pointers to them...
 */
static void fghRemoveMenuFromMenu( SFG_Menu* from, SFG_Menu* menu )
{
    SFG_MenuEntry *entry;

    for( entry = (SFG_MenuEntry *)from->Entries.First;
         entry;
         entry = ( SFG_MenuEntry * )entry->Node.Next )
        if( entry->SubMenu == menu )
            entry->SubMenu = NULL;
}

/*
 * This function destroys a menu specified by the parameter. All menus
 * and windows are updated to make sure no ill pointers hang around.
 */
void fgDestroyMenu( SFG_Menu* menu )
{
    SFG_Window *window;
    SFG_Menu *from;

    FREEGLUT_INTERNAL_ERROR_EXIT ( menu, "Menu destroy function called with null menu",
                                   "fgDestroyMenu" );

    /* First of all, have all references to this menu removed from all windows: */
    for( window = (SFG_Window *)fgStructure.Windows.First;
         window;
         window = (SFG_Window *)window->Node.Next )
        fghRemoveMenuFromWindow( window, menu );

    /* Now proceed with removing menu entries that lead to this menu */
    for( from = ( SFG_Menu * )fgStructure.Menus.First;
         from;
         from = ( SFG_Menu * )from->Node.Next )
        fghRemoveMenuFromMenu( from, menu );

    /*
     * If the programmer defined a destroy callback, call it
     * A. Donev: But first make this the active menu
     */
    if( menu->Destroy )
    {
        SFG_Menu *activeMenu=fgStructure.CurrentMenu;
        fgStructure.CurrentMenu = menu;
        menu->Destroy( );
        fgStructure.CurrentMenu = activeMenu;
    }

    /*
     * Now we are pretty sure the menu is not used anywhere
     * and that we can remove all of its entries
     */
    while( menu->Entries.First )
    {
        SFG_MenuEntry *entry = ( SFG_MenuEntry * ) menu->Entries.First;

        fgListRemove( &menu->Entries, &entry->Node );

        if( entry->Text )
            free( entry->Text );
        entry->Text = NULL;

        free( entry );
    }

    if( fgStructure.CurrentWindow == menu->Window )
        fgSetWindow( NULL );
    fgDestroyWindow( menu->Window );
    fgListRemove( &fgStructure.Menus, &menu->Node );
    if( fgStructure.CurrentMenu == menu )
        fgStructure.CurrentMenu = NULL;

    free( menu );
}

/*
 * This function should be called on glutInit(). It will prepare the internal
 * structure of freeglut to be used in the application. The structure will be
 * destroyed using fgDestroyStructure() on glutMainLoop() return. In that
 * case further use of freeglut should be preceeded with a glutInit() call.
 */
void fgCreateStructure( void )
{
    /*
     * We will be needing two lists: the first containing windows,
     * and the second containing the user-defined menus.
     * Also, no current window/menu is set, as none has been created yet.
     */

    fgListInit(&fgStructure.Windows);
    fgListInit(&fgStructure.Menus);
    fgListInit(&fgStructure.WindowsToDestroy);

    fgStructure.CurrentWindow = NULL;
    fgStructure.CurrentMenu = NULL;
    fgStructure.MenuContext = NULL;
    fgStructure.GameModeWindow = NULL;
    fgStructure.WindowID = 0;
    fgStructure.MenuID = 0;
}

/*
 * This function is automatically called on glutMainLoop() return.
 * It should deallocate and destroy all remnants of previous
 * glutInit()-enforced structure initialization...
 */
void fgDestroyStructure( void )
{
    /* Clean up the WindowsToDestroy list. */
    fgCloseWindows( );

    /* Make sure all windows and menus have been deallocated */
    while( fgStructure.Menus.First )
        fgDestroyMenu( ( SFG_Menu * )fgStructure.Menus.First );

    while( fgStructure.Windows.First )
        fgDestroyWindow( ( SFG_Window * )fgStructure.Windows.First );
}

/*
 * Helper function to enumerate through all registered top-level windows
 */
void fgEnumWindows( FGCBenumerator enumCallback, SFG_Enumerator* enumerator )
{
    SFG_Window *window;

    FREEGLUT_INTERNAL_ERROR_EXIT ( enumCallback && enumerator,
                                   "Enumerator or callback missing from window enumerator call",
                                   "fgEnumWindows" );

    /* Check every of the top-level windows */
    for( window = ( SFG_Window * )fgStructure.Windows.First;
         window;
         window = ( SFG_Window * )window->Node.Next )
    {
        enumCallback( window, enumerator );
        if( enumerator->found )
            return;
    }
}

/*
 * Helper function to enumerate through all a window's subwindows
 * (single level descent)
 */
void fgEnumSubWindows( SFG_Window* window, FGCBenumerator enumCallback,
                       SFG_Enumerator* enumerator )
{
    SFG_Window *child;

    FREEGLUT_INTERNAL_ERROR_EXIT ( enumCallback && enumerator,
                                   "Enumerator or callback missing from subwindow enumerator call",
                                   "fgEnumSubWindows" );
    FREEGLUT_INTERNAL_ERROR_EXIT_IF_NOT_INITIALISED ( "Window Enumeration" );

    for( child = ( SFG_Window * )window->Children.First;
         child;
         child = ( SFG_Window * )child->Node.Next )
    {
        enumCallback( child, enumerator );
        if( enumerator->found )
            return;
    }
}

/*
 * A static helper function to look for a window given its handle
 */
static void fghcbWindowByHandle( SFG_Window *window,
                                 SFG_Enumerator *enumerator )
{
    if ( enumerator->found )
        return;

    /* Check the window's handle. Hope this works. Looks ugly. That's for sure. */
    if( window->Window.Handle == (SFG_WindowHandleType) (enumerator->data) )
    {
        enumerator->found = GL_TRUE;
        enumerator->data = window;

        return;
    }

    /* Otherwise, check this window's children */
    fgEnumSubWindows( window, fghcbWindowByHandle, enumerator );
}

/*
 * fgWindowByHandle returns a (SFG_Window *) value pointing to the
 * first window in the queue matching the specified window handle.
 * The function is defined in freeglut_structure.c file.
 */
SFG_Window* fgWindowByHandle ( SFG_WindowHandleType hWindow )
{
    SFG_Enumerator enumerator;

    /* This is easy and makes use of the windows enumeration defined above */
    enumerator.found = GL_FALSE;
    enumerator.data = (void *)hWindow;
    fgEnumWindows( fghcbWindowByHandle, &enumerator );

    if( enumerator.found )
        return( SFG_Window *) enumerator.data;
    return NULL;
}

/*
 * A static helper function to look for a window given its ID
 */
static void fghcbWindowByID( SFG_Window *window, SFG_Enumerator *enumerator )
{
    /* Make sure we do not overwrite our precious results... */
    if( enumerator->found )
        return;

    /* Check the window's handle. Hope this works. Looks ugly. That's for sure. */
    if( window->ID == *( int *)(enumerator->data) )
    {
        enumerator->found = GL_TRUE;
        enumerator->data = window;

        return;
    }

    /* Otherwise, check this window's children */
    fgEnumSubWindows( window, fghcbWindowByID, enumerator );
}

/*
 * This function is similiar to the previous one, except it is
 * looking for a specified (sub)window identifier. The function
 * is defined in freeglut_structure.c file.
 */
SFG_Window* fgWindowByID( int windowID )
{
    SFG_Enumerator enumerator;

    /* Uses a method very similiar for fgWindowByHandle... */
    enumerator.found = GL_FALSE;
    enumerator.data = ( void * )&windowID;
    fgEnumWindows( fghcbWindowByID, &enumerator );
    if( enumerator.found )
        return ( SFG_Window * )enumerator.data;
    return NULL;
}

/*
 * Looks up a menu given its ID. This is easier that fgWindowByXXX
 * as all menus are placed in one doubly linked list...
 */
SFG_Menu* fgMenuByID( int menuID )
{
    SFG_Menu *menu = NULL;

    /* It's enough to check all entries in fgStructure.Menus... */
    for( menu = (SFG_Menu *)fgStructure.Menus.First;
         menu;
         menu = (SFG_Menu *)menu->Node.Next )
        if( menu->ID == menuID )
            return menu;
    return NULL;
}

/*
 * List functions...
 */
void fgListInit(SFG_List *list)
{
    list->First = NULL;
    list->Last = NULL;
}

void fgListAppend(SFG_List *list, SFG_Node *node)
{
    if ( list->Last )
    {
        SFG_Node *ln = (SFG_Node *) list->Last;
        ln->Next = node;
        node->Prev = ln;
    }
    else
    {
        node->Prev = NULL;
        list->First = node;
    }

    node->Next = NULL;
    list->Last = node;
}

void fgListRemove(SFG_List *list, SFG_Node *node)
{
    if( node->Next )
        ( ( SFG_Node * )node->Next )->Prev = node->Prev;
    if( node->Prev )
        ( ( SFG_Node * )node->Prev )->Next = node->Next;
    if( ( ( SFG_Node * )list->First ) == node )
        list->First = node->Next;
    if( ( ( SFG_Node * )list->Last ) == node )
        list->Last = node->Prev;
}

int fgListLength(SFG_List *list)
{
    SFG_Node *node;
    int length = 0;

    for( node =( SFG_Node * )list->First;
         node;
         node = ( SFG_Node * )node->Next )
        ++length;

    return length;
}


void fgListInsert(SFG_List *list, SFG_Node *next, SFG_Node *node)
{
    SFG_Node *prev;

    if( (node->Next = next) )
    {
        prev = next->Prev;
        next->Prev = node;
    }
    else
    {
        prev = list->Last;
        list->Last = node;
    }

    if( (node->Prev = prev) )
        prev->Next = node;
    else
        list->First = node;
}

/*** END OF FILE ***/
