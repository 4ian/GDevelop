/*
 * freeglut_menu.c
 *
 * Pull-down menu creation and handling.
 *
 * Copyright (c) 1999-2000 Pawel W. Olszta. All Rights Reserved.
 * Written by Pawel W. Olszta, <olszta@sourceforge.net>
 * Creation date: Thu Dec 16 1999
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

#define FREEGLUT_BUILDING_LIB
#include <GL/freeglut.h>
#include "freeglut_internal.h"

/* -- DEFINITIONS ---------------------------------------------------------- */

/*
 * FREEGLUT_MENU_FONT can be any freeglut bitmapped font.
 * (Stroked fonts would not be out of the question, but we'd need to alter
 *  code, since GLUT (hence freeglut) does not quite unify stroked and
 *  bitmapped font handling.)
 * Old UNIX/X11 GLUT (BSD, UNIX, IRIX, LINUX, HPUX, ...) used a system
 * font best approximated by an 18-pixel HELVETICA, I think.  MS-WINDOWS
 * GLUT used something closest to the 8x13 fixed-width font.  (Old
 * GLUT apparently uses host-system menus rather than building its own.
 * freeglut is building its own menus from scratch.)
 *
 * FREEGLUT_MENU_HEIGHT gives the height of ONE menu box.  This should be
 * the distances between two adjacent menu entries.  It should scale
 * automatically with the font choice, so you needn't alter it---unless you
 * use a stroked font.
 *
 * FREEGLUT_MENU_BORDER says how many pixels to allow around the edge of a
 * menu.  (It also seems to be the same as the number of pixels used as
 * a border around *items* to separate them from neighbors.  John says
 * that that wasn't the original intent...if not, perhaps we need another
 * symbolic constant, FREEGLUT_MENU_ITEM_BORDER, or such.)
 */
#if TARGET_HOST_MS_WINDOWS
#define  FREEGLUT_MENU_FONT    GLUT_BITMAP_8_BY_13
#else
#define  FREEGLUT_MENU_FONT    GLUT_BITMAP_HELVETICA_18
#endif

#define  FREEGLUT_MENU_HEIGHT  (glutBitmapHeight(FREEGLUT_MENU_FONT) + \
                                FREEGLUT_MENU_BORDER)
#define  FREEGLUT_MENU_BORDER   2


/*
 * These variables are for rendering the freeglut menu items.
 *
 * The choices are fore- and background, with and without h for Highlighting.
 * Old GLUT appeared to be system-dependant for its colors (sigh) so we are
 * too.  These variables should be stuffed into global state and initialized
 * via the glutInit*() system.
 */
#if TARGET_HOST_MS_WINDOWS
static float menu_pen_fore  [4] = {0.0f,  0.0f,  0.0f,  1.0f};
static float menu_pen_back  [4] = {0.85f, 0.85f, 0.85f, 1.0f};
static float menu_pen_hfore [4] = {1.0f,  1.0f,  1.0f,  1.0f};
static float menu_pen_hback [4] = {0.15f, 0.15f, 0.45f, 1.0f};
#else
static float menu_pen_fore  [4] = {0.0f,  0.0f,  0.0f,  1.0f};
static float menu_pen_back  [4] = {0.70f, 0.70f, 0.70f, 1.0f};
static float menu_pen_hfore [4] = {0.0f,  0.0f,  0.0f,  1.0f};
static float menu_pen_hback [4] = {1.0f,  1.0f,  1.0f,  1.0f};
#endif

/* -- PRIVATE FUNCTIONS ---------------------------------------------------- */

/*
 * Private function to find a menu entry by index
 */
static SFG_MenuEntry *fghFindMenuEntry( SFG_Menu* menu, int index )
{
    SFG_MenuEntry *entry;
    int i = 1;

    for( entry = (SFG_MenuEntry *)menu->Entries.First;
         entry;
         entry = (SFG_MenuEntry *)entry->Node.Next )
    {
        if( i == index )
            break;
        ++i;
    }

    return entry;
}

/*
 * Deactivates a menu pointed by the function argument.
 */
static void fghDeactivateSubMenu( SFG_MenuEntry *menuEntry )
{
    SFG_MenuEntry *subMenuIter;
    /* Hide the present menu's window */
    fgSetWindow( menuEntry->SubMenu->Window );
    glutHideWindow( );

    /* Forget about having that menu active anymore, now: */
    menuEntry->SubMenu->Window->ActiveMenu = NULL;
    menuEntry->SubMenu->IsActive = GL_FALSE;
    menuEntry->SubMenu->ActiveEntry = NULL;

    /* Hide all submenu windows, and the root menu's window. */
    for ( subMenuIter = (SFG_MenuEntry *)menuEntry->SubMenu->Entries.First;
          subMenuIter;
          subMenuIter = (SFG_MenuEntry *)subMenuIter->Node.Next )
    {
        subMenuIter->IsActive = GL_FALSE;

        /* Is that an active submenu by any case? */
        if( subMenuIter->SubMenu )
            fghDeactivateSubMenu( subMenuIter );
    }

    fgSetWindow ( menuEntry->SubMenu->ParentWindow ) ;
}

/*
 * Private function to get the virtual maximum screen extent
 */
static GLvoid fghGetVMaxExtent( SFG_Window* window, int* x, int* y )
{
    if( fgStructure.GameModeWindow )
    {
#if TARGET_HOST_POSIX_X11
        int wx, wy;
        Window w;

        XTranslateCoordinates(
            fgDisplay.Display,
            window->Window.Handle,
            fgDisplay.RootWindow,
            0, 0, &wx, &wy, &w);

        *x = fgState.GameModeSize.X + wx;
        *y = fgState.GameModeSize.Y + wy;
#else
        *x = glutGet ( GLUT_SCREEN_WIDTH );
        *y = glutGet ( GLUT_SCREEN_HEIGHT );
#endif
    }
    else
    {
        *x = fgDisplay.ScreenWidth;
        *y = fgDisplay.ScreenHeight;
    }
}

/*
 * Private function to check for the current menu/sub menu activity state
 */
static GLboolean fghCheckMenuStatus( SFG_Menu* menu )
{
    SFG_MenuEntry* menuEntry;
    int x, y;

    /* First of all check any of the active sub menus... */
    for( menuEntry = (SFG_MenuEntry *)menu->Entries.First;
         menuEntry;
         menuEntry = (SFG_MenuEntry *)menuEntry->Node.Next )
    {
        if( menuEntry->SubMenu && menuEntry->IsActive )
        {
            /*
             * OK, have the sub-menu checked, too. If it returns GL_TRUE, it
             * will mean that it caught the mouse cursor and we do not need
             * to regenerate the activity list, and so our parents do...
             */
            GLboolean return_status;

            menuEntry->SubMenu->Window->State.MouseX =
                menu->Window->State.MouseX + menu->X - menuEntry->SubMenu->X;
            menuEntry->SubMenu->Window->State.MouseY =
                menu->Window->State.MouseY + menu->Y - menuEntry->SubMenu->Y;
            return_status = fghCheckMenuStatus( menuEntry->SubMenu );

            if ( return_status )
                return GL_TRUE;
        }
    }

    /* That much about our sub menus, let's get to checking the current menu: */
    x = menu->Window->State.MouseX;
    y = menu->Window->State.MouseY;

    /* Check if the mouse cursor is contained within the current menu box */
    if( ( x >= FREEGLUT_MENU_BORDER ) &&
        ( x < menu->Width  - FREEGLUT_MENU_BORDER ) &&
        ( y >= FREEGLUT_MENU_BORDER ) &&
        ( y < menu->Height - FREEGLUT_MENU_BORDER )  )
    {
        int menuID = ( y - FREEGLUT_MENU_BORDER ) / FREEGLUT_MENU_HEIGHT;

        /* The mouse cursor is somewhere over our box, check it out. */
        menuEntry = fghFindMenuEntry( menu, menuID + 1 );
        FREEGLUT_INTERNAL_ERROR_EXIT( menuEntry, "Cannot find menu entry",
                                      "fghCheckMenuStatus" );

        menuEntry->IsActive = GL_TRUE;
        menuEntry->Ordinal = menuID;

        /*
         * If this is not the same as the last active menu entry, deactivate
         * the previous entry.  Specifically, if the previous active entry
         * was a submenu then deactivate it.
         */
        if( menu->ActiveEntry && ( menuEntry != menu->ActiveEntry ) )
            if( menu->ActiveEntry->SubMenu )
                fghDeactivateSubMenu( menu->ActiveEntry );

        if( menuEntry != menu->ActiveEntry )
        {
            menu->Window->State.Redisplay = GL_TRUE;
            if( menu->ActiveEntry )
                menu->ActiveEntry->IsActive = GL_FALSE;
        }

        menu->ActiveEntry = menuEntry;
        menu->IsActive = GL_TRUE;  /* XXX Do we need this? */

        /*
         * OKi, we have marked that entry as active, but it would be also
         * nice to have its contents updated, in case it's a sub menu.
         * Also, ignore the return value of the check function:
         */
        if( menuEntry->SubMenu )
        {
            if ( ! menuEntry->SubMenu->IsActive )
            {
                int max_x, max_y;
                SFG_Window *current_window = fgStructure.CurrentWindow;

                /* Set up the initial menu position now... */
                menuEntry->SubMenu->IsActive = GL_TRUE;

                /* Set up the initial submenu position now: */
                fghGetVMaxExtent(menu->ParentWindow, &max_x, &max_y);
                menuEntry->SubMenu->X = menu->X + menu->Width;
                menuEntry->SubMenu->Y = menu->Y +
                    menuEntry->Ordinal * FREEGLUT_MENU_HEIGHT;

                if( menuEntry->SubMenu->X + menuEntry->SubMenu->Width > max_x )
                    menuEntry->SubMenu->X = menu->X - menuEntry->SubMenu->Width;

                if( menuEntry->SubMenu->Y + menuEntry->SubMenu->Height > max_y )
                {
                    menuEntry->SubMenu->Y -= ( menuEntry->SubMenu->Height -
                                               FREEGLUT_MENU_HEIGHT -
                                               2 * FREEGLUT_MENU_BORDER );
                    if( menuEntry->SubMenu->Y < 0 )
                        menuEntry->SubMenu->Y = 0;
                }

                fgSetWindow( menuEntry->SubMenu->Window );
                glutPositionWindow( menuEntry->SubMenu->X,
                                    menuEntry->SubMenu->Y );
                glutReshapeWindow( menuEntry->SubMenu->Width,
                                   menuEntry->SubMenu->Height );
                glutPopWindow( );
                glutShowWindow( );
                menuEntry->SubMenu->Window->ActiveMenu = menuEntry->SubMenu;
                fgSetWindow( current_window );
                menuEntry->SubMenu->Window->State.MouseX =
                    x + menu->X - menuEntry->SubMenu->X;
                menuEntry->SubMenu->Window->State.MouseY =
                    y + menu->Y - menuEntry->SubMenu->Y;
                fghCheckMenuStatus( menuEntry->SubMenu );
            }

            /* Activate it because its parent entry is active */
            menuEntry->SubMenu->IsActive = GL_TRUE;  /* XXX Do we need this? */
        }

        /* Report back that we have caught the menu cursor */
        return GL_TRUE;
    }

    /* Looks like the menu cursor is somewhere else... */
    if( menu->ActiveEntry && menu->ActiveEntry->IsActive &&
        ( !menu->ActiveEntry->SubMenu ||
          !menu->ActiveEntry->SubMenu->IsActive ) )
    {
        menu->Window->State.Redisplay = GL_TRUE;
        menu->ActiveEntry->IsActive = GL_FALSE;
        menu->ActiveEntry = NULL;
    }

    return GL_FALSE;
}

/*
 * Displays a menu box and all of its submenus (if they are active)
 */
static void fghDisplayMenuBox( SFG_Menu* menu )
{
    SFG_MenuEntry *menuEntry;
    int i;
    int border = FREEGLUT_MENU_BORDER;

    /*
     * Have the menu box drawn first. The +- values are
     * here just to make it more nice-looking...
     */
    /* a non-black dark version of the below. */
    glColor4f( 1.0f, 1.0f, 1.0f, 1.0f );
    glBegin( GL_QUAD_STRIP );
        glVertex2i( menu->Width         , 0                    );
        glVertex2i( menu->Width - border,                border);
        glVertex2i( 0                   , 0                    );
        glVertex2i(               border,                border);
        glVertex2i( 0                   , menu->Height         );
        glVertex2i(               border, menu->Height - border);
    glEnd( );

    /* a non-black dark version of the below. */
    glColor4f( 0.5f, 0.5f, 0.5f, 1.0f );
    glBegin( GL_QUAD_STRIP );
        glVertex2i( 0                   , menu->Height         );
        glVertex2i(               border, menu->Height - border);
        glVertex2i( menu->Width         , menu->Height         );
        glVertex2i( menu->Width - border, menu->Height - border);
        glVertex2i( menu->Width         , 0                    );
        glVertex2i( menu->Width - border,                border);
    glEnd( );

    glColor4fv( menu_pen_back );
    glBegin( GL_QUADS );
        glVertex2i(               border,                border);
        glVertex2i( menu->Width - border,                border);
        glVertex2i( menu->Width - border, menu->Height - border);
        glVertex2i(               border, menu->Height - border);
    glEnd( );

    /* Check if any of the submenus is currently active... */
    for( menuEntry = (SFG_MenuEntry *)menu->Entries.First;
         menuEntry;
         menuEntry = (SFG_MenuEntry *)menuEntry->Node.Next )
    {
        /* Has the menu been marked as active, maybe? */
        if( menuEntry->IsActive )
        {
            /*
             * That's truly right, and we need to have it highlighted.
             * There is an assumption that mouse cursor didn't move
             * since the last check of menu activity state:
             */
            int menuID = menuEntry->Ordinal;

            /* So have the highlight drawn... */
            glColor4fv( menu_pen_hback );
            glBegin( GL_QUADS );
                glVertex2i( border,
                            (menuID + 0)*FREEGLUT_MENU_HEIGHT + border );
                glVertex2i( menu->Width - border,
                            (menuID + 0)*FREEGLUT_MENU_HEIGHT + border );
                glVertex2i( menu->Width - border,
                            (menuID + 1)*FREEGLUT_MENU_HEIGHT + border );
                glVertex2i( border,
                            (menuID + 1)*FREEGLUT_MENU_HEIGHT + border );
            glEnd( );
        }
    }

    /* Print the menu entries now... */

    glColor4fv( menu_pen_fore );

    for( menuEntry = (SFG_MenuEntry *)menu->Entries.First, i = 0;
         menuEntry;
         menuEntry = (SFG_MenuEntry *)menuEntry->Node.Next, ++i )
    {
        /* If the menu entry is active, set the color to white */
        if( menuEntry->IsActive )
            glColor4fv( menu_pen_hfore );

        /* Move the raster into position... */
        /* Try to center the text - JCJ 31 July 2003*/
        glRasterPos2i(
            2 * border,
            ( i + 1 )*FREEGLUT_MENU_HEIGHT -
            ( int )( FREEGLUT_MENU_HEIGHT*0.3 - border )
        );

        /* Have the label drawn, character after character: */
        glutBitmapString( FREEGLUT_MENU_FONT,
                          (unsigned char *)menuEntry->Text);

        /* If it's a submenu, draw a right arrow */
        if( menuEntry->SubMenu )
        {
            int width = glutBitmapWidth( FREEGLUT_MENU_FONT, '_' );
            int x_base = menu->Width - 2 - width;
            int y_base = i*FREEGLUT_MENU_HEIGHT + border;
            glBegin( GL_TRIANGLES );
                glVertex2i( x_base, y_base + 2*border);
                glVertex2i( menu->Width - 2, y_base +
                            ( FREEGLUT_MENU_HEIGHT + border) / 2 );
                glVertex2i( x_base, y_base + FREEGLUT_MENU_HEIGHT - border );
            glEnd( );
        }

        /* If the menu entry is active, reset the color */
        if( menuEntry->IsActive )
            glColor4fv( menu_pen_fore );
    }
}

/*
 * Private static function to set the parent window of a submenu and all
 * of its submenus
 */
static void fghSetMenuParentWindow( SFG_Window *window, SFG_Menu *menu )
{
    SFG_MenuEntry *menuEntry;

    menu->ParentWindow = window;

    for( menuEntry = ( SFG_MenuEntry * )menu->Entries.First;
         menuEntry;
         menuEntry = ( SFG_MenuEntry * )menuEntry->Node.Next )
        if( menuEntry->SubMenu )
            fghSetMenuParentWindow( window, menuEntry->SubMenu );
}

/*
 * Function to check for menu entry selection on menu deactivation
 */
static void fghExecuteMenuCallback( SFG_Menu* menu )
{
    SFG_MenuEntry *menuEntry;

    /* First of all check any of the active sub menus... */
    for( menuEntry = (SFG_MenuEntry *)menu->Entries.First;
         menuEntry;
         menuEntry = (SFG_MenuEntry *)menuEntry->Node.Next)
    {
        if( menuEntry->IsActive )
        {
            if( menuEntry->SubMenu )
                fghExecuteMenuCallback( menuEntry->SubMenu );
            else
                if( menu->Callback )
                {
                    SFG_Menu *save_menu = fgStructure.CurrentMenu;
                    fgStructure.CurrentMenu = menu;
                    menu->Callback( menuEntry->ID );
                    fgStructure.CurrentMenu = save_menu;
                }

            return;
        }
    }
}


/*
 * Displays the currently active menu for the current window
 */
void fgDisplayMenu( void )
{
    SFG_Window* window = fgStructure.CurrentWindow;
    SFG_Menu* menu = NULL;

    FREEGLUT_INTERNAL_ERROR_EXIT ( fgStructure.CurrentWindow, "Displaying menu in nonexistent window",
                                   "fgDisplayMenu" );

    /* Check if there is an active menu attached to this window... */
    menu = window->ActiveMenu;
    freeglut_return_if_fail( menu );

    fgSetWindow( menu->Window );

    glPushAttrib( GL_DEPTH_BUFFER_BIT | GL_TEXTURE_BIT | GL_LIGHTING_BIT |
                  GL_POLYGON_BIT );

    glDisable( GL_DEPTH_TEST );
    glDisable( GL_TEXTURE_2D );
    glDisable( GL_LIGHTING   );
    glDisable( GL_CULL_FACE  );

    glMatrixMode( GL_PROJECTION );
    glPushMatrix( );
    glLoadIdentity( );
    glOrtho(
         0, glutGet( GLUT_WINDOW_WIDTH  ),
         glutGet( GLUT_WINDOW_HEIGHT ), 0,
        -1, 1
    );

    glMatrixMode( GL_MODELVIEW );
    glPushMatrix( );
    glLoadIdentity( );

    fghDisplayMenuBox( menu );

    glPopAttrib( );

    glMatrixMode( GL_PROJECTION );
    glPopMatrix( );
    glMatrixMode( GL_MODELVIEW );
    glPopMatrix( );

    glutSwapBuffers( );

    fgSetWindow ( window );
}

/*
 * Activates a menu pointed by the function argument
 */
static void fghActivateMenu( SFG_Window* window, int button )
{
    int max_x, max_y;

    /* We'll be referencing this menu a lot, so remember its address: */
    SFG_Menu* menu = window->Menu[ button ];
    SFG_Window* current_window = fgStructure.CurrentWindow;

    /* If the menu is already active in another window, deactivate it there */
    if ( menu->ParentWindow )
      menu->ParentWindow->ActiveMenu = NULL ;

    /* Mark the menu as active, so that it gets displayed: */
    window->ActiveMenu = menu;
    menu->IsActive = GL_TRUE;
    fghSetMenuParentWindow ( window, menu );
    fgState.ActiveMenus++;

    /* Set up the initial menu position now: */
    fghGetVMaxExtent(menu->ParentWindow, &max_x, &max_y);
    fgSetWindow( window );
    menu->X = window->State.MouseX + glutGet( GLUT_WINDOW_X );
    menu->Y = window->State.MouseY + glutGet( GLUT_WINDOW_Y );

    if( menu->X + menu->Width > max_x )
        menu->X -=menu->Width;

    if( menu->Y + menu->Height > max_y )
    {
        menu->Y -=menu->Height;
        if( menu->Y < 0 )
            menu->Y = 0;
    }

    menu->Window->State.MouseX =
        window->State.MouseX + glutGet( GLUT_WINDOW_X ) - menu->X;
    menu->Window->State.MouseY =
        window->State.MouseY + glutGet( GLUT_WINDOW_Y ) - menu->Y;

    fgSetWindow( menu->Window );
    glutPositionWindow( menu->X, menu->Y );
    glutReshapeWindow( menu->Width, menu->Height );
    glutPopWindow( );
    glutShowWindow( );
    menu->Window->ActiveMenu = menu;
    fghCheckMenuStatus( menu );
    fgSetWindow( current_window );
}

/*
 * Update Highlight states of the menu
 *
 * Current mouse position is in menu->Window->State.MouseX/Y.
 */
void fgUpdateMenuHighlight ( SFG_Menu *menu )
{
    fghCheckMenuStatus( menu );
}

/*
 * Check whether an active menu absorbs a mouse click
 */
GLboolean fgCheckActiveMenu ( SFG_Window *window, int button, GLboolean pressed,
                              int mouse_x, int mouse_y )
{
    /*
     * Near as I can tell, this is the menu behaviour:
     *  - Down-click the menu button, menu not active:  activate
     *    the menu with its upper left-hand corner at the mouse
     *    location.
     *  - Down-click any button outside the menu, menu active:
     *    deactivate the menu
     *  - Down-click any button inside the menu, menu active:
     *    select the menu entry and deactivate the menu
     *  - Up-click the menu button, menu not active:  nothing happens
     *  - Up-click the menu button outside the menu, menu active:
     *    nothing happens
     *  - Up-click the menu button inside the menu, menu active:
     *    select the menu entry and deactivate the menu
     * Since menus can have submenus, we need to check this recursively.
     */
    if( window->ActiveMenu )
    {
        if( window == window->ActiveMenu->ParentWindow )
        {
            window->ActiveMenu->Window->State.MouseX =
                                       mouse_x - window->ActiveMenu->X;
            window->ActiveMenu->Window->State.MouseY =
                                       mouse_y - window->ActiveMenu->Y;
        }

        /* In the menu, invoke the callback and deactivate the menu */
        if( fghCheckMenuStatus( window->ActiveMenu ) )
        {
            /*
             * Save the current window and menu and set the current
             * window to the window whose menu this is
             */
            SFG_Window *save_window = fgStructure.CurrentWindow;
            SFG_Menu *save_menu = fgStructure.CurrentMenu;
            SFG_Window *parent_window = window->ActiveMenu->ParentWindow;
            fgSetWindow( parent_window );
            fgStructure.CurrentMenu = window->ActiveMenu;

            /* Execute the menu callback */
            fghExecuteMenuCallback( window->ActiveMenu );
            fgDeactivateMenu( parent_window );

            /* Restore the current window and menu */
            fgSetWindow( save_window );
            fgStructure.CurrentMenu = save_menu;
        }
        else if( pressed )
            /*
             * Outside the menu, deactivate if it's a downclick
             *
             * XXX This isn't enough.  A downclick outside of
             * XXX the interior of our freeglut windows should also
             * XXX deactivate the menu.  This is more complicated.
             */
            fgDeactivateMenu( window->ActiveMenu->ParentWindow );

        /*
         * XXX Why does an active menu require a redisplay at
         * XXX this point?  If this can come out cleanly, then
         * XXX it probably should do so; if not, a comment should
         * XXX explain it.
         */
        if( ! window->IsMenu )
            window->State.Redisplay = GL_TRUE;

        return GL_TRUE;
    }

    /* No active menu, let's check whether we need to activate one. */
    if( ( 0 <= button ) &&
        ( FREEGLUT_MAX_MENUS > button ) &&
        ( window->Menu[ button ] ) &&
        pressed )
    {
        /* XXX Posting a requisite Redisplay seems bogus. */
        window->State.Redisplay = GL_TRUE;
        fghActivateMenu( window, button );
        return GL_TRUE;
    }

    return GL_FALSE;
}

/*
 * Deactivates a menu pointed by the function argument.
 */
void fgDeactivateMenu( SFG_Window *window )
{
    SFG_Window *parent_window = NULL;

    /* Check if there is an active menu attached to this window... */
    SFG_Menu* menu = window->ActiveMenu;
    SFG_MenuEntry *menuEntry;

    /* Did we find an active window? */
    freeglut_return_if_fail( menu );

    parent_window = menu->ParentWindow;

    /* Hide the present menu's window */
    fgSetWindow( menu->Window );
    glutHideWindow( );

    /* Forget about having that menu active anymore, now: */
    menu->Window->ActiveMenu = NULL;
    menu->ParentWindow->ActiveMenu = NULL;
    fghSetMenuParentWindow ( NULL, menu );
    menu->IsActive = GL_FALSE;
    menu->ActiveEntry = NULL;

    fgState.ActiveMenus--;

    /* Hide all submenu windows, and the root menu's window. */
    for ( menuEntry = ( SFG_MenuEntry * )menu->Entries.First;
          menuEntry;
          menuEntry = ( SFG_MenuEntry * )menuEntry->Node.Next )
    {
        menuEntry->IsActive = GL_FALSE;

        /* Is that an active submenu by any case? */
        if( menuEntry->SubMenu )
            fghDeactivateSubMenu( menuEntry );
    }

    fgSetWindow ( parent_window ) ;
}

/*
 * Recalculates current menu's box size
 */
void fghCalculateMenuBoxSize( void )
{
    SFG_MenuEntry* menuEntry;
    int width = 0, height = 0;

    /* Make sure there is a current menu set */
    freeglut_return_if_fail( fgStructure.CurrentMenu );

    /* The menu's box size depends on the menu entries: */
    for( menuEntry = ( SFG_MenuEntry * )fgStructure.CurrentMenu->Entries.First;
         menuEntry;
         menuEntry = ( SFG_MenuEntry * )menuEntry->Node.Next )
    {
        /* Update the menu entry's width value */
        menuEntry->Width = glutBitmapLength(
            FREEGLUT_MENU_FONT,
            (unsigned char *)menuEntry->Text
        );

        /*
         * If the entry is a submenu, then it needs to be wider to
         * accomodate the arrow. JCJ 31 July 2003
         */
        if (menuEntry->SubMenu )
            menuEntry->Width += glutBitmapLength(
                FREEGLUT_MENU_FONT,
                (unsigned char *)"_"
            );

        /* Check if it's the biggest we've found */
        if( menuEntry->Width > width )
            width = menuEntry->Width;

        height += FREEGLUT_MENU_HEIGHT;
    }

    /* Store the menu's box size now: */
    fgStructure.CurrentMenu->Height = height + 2 * FREEGLUT_MENU_BORDER;
    fgStructure.CurrentMenu->Width  = width  + 4 * FREEGLUT_MENU_BORDER;
}


/* -- INTERFACE FUNCTIONS -------------------------------------------------- */

/*
 * Creates a new menu object, adding it to the freeglut structure
 */
int FGAPIENTRY glutCreateMenu( void(* callback)( int ) )
{
    /* The menu object creation code resides in freeglut_structure.c */
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutCreateMenu" );
    return fgCreateMenu( callback )->ID;
}

#if TARGET_HOST_MS_WINDOWS
int FGAPIENTRY __glutCreateMenuWithExit( void(* callback)( int ), void (__cdecl *exit_function)(int) )
{
  __glutExitFunc = exit_function;
  return glutCreateMenu( callback );
}
#endif

/*
 * Destroys a menu object, removing all references to it
 */
void FGAPIENTRY glutDestroyMenu( int menuID )
{
    SFG_Menu* menu;

    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutDestroyMenu" );
    menu = fgMenuByID( menuID );

    freeglut_return_if_fail( menu );

    /* The menu object destruction code resides in freeglut_structure.c */
    fgDestroyMenu( menu );
}

/*
 * Returns the ID number of the currently active menu
 */
int FGAPIENTRY glutGetMenu( void )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutGetMenu" );

    if( fgStructure.CurrentMenu )
        return fgStructure.CurrentMenu->ID;

    return 0;
}

/*
 * Sets the current menu given its menu ID
 */
void FGAPIENTRY glutSetMenu( int menuID )
{
    SFG_Menu* menu;

    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutSetMenu" );
    menu = fgMenuByID( menuID );

    freeglut_return_if_fail( menu );

    fgStructure.CurrentMenu = menu;
}

/*
 * Adds a menu entry to the bottom of the current menu
 */
void FGAPIENTRY glutAddMenuEntry( const char* label, int value )
{
    SFG_MenuEntry* menuEntry;
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutAddMenuEntry" );
    menuEntry = (SFG_MenuEntry *)calloc( sizeof(SFG_MenuEntry), 1 );
    freeglut_return_if_fail( fgStructure.CurrentMenu );

    menuEntry->Text = strdup( label );
    menuEntry->ID   = value;

    /* Have the new menu entry attached to the current menu */
    fgListAppend( &fgStructure.CurrentMenu->Entries, &menuEntry->Node );

    fghCalculateMenuBoxSize( );
}

/*
 * Add a sub menu to the bottom of the current menu
 */
void FGAPIENTRY glutAddSubMenu( const char *label, int subMenuID )
{
    SFG_MenuEntry *menuEntry;
    SFG_Menu *subMenu;

    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutAddSubMenu" );
    menuEntry = ( SFG_MenuEntry * )calloc( sizeof( SFG_MenuEntry ), 1 );
    subMenu = fgMenuByID( subMenuID );

    freeglut_return_if_fail( fgStructure.CurrentMenu );
    freeglut_return_if_fail( subMenu );

    menuEntry->Text    = strdup( label );
    menuEntry->SubMenu = subMenu;
    menuEntry->ID      = -1;

    fgListAppend( &fgStructure.CurrentMenu->Entries, &menuEntry->Node );
    fghCalculateMenuBoxSize( );
}

/*
 * Changes the specified menu item in the current menu into a menu entry
 */
void FGAPIENTRY glutChangeToMenuEntry( int item, const char* label, int value )
{
    SFG_MenuEntry* menuEntry = NULL;

    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutChangeToMenuEntry" );
    freeglut_return_if_fail( fgStructure.CurrentMenu );

    /* Get n-th menu entry in the current menu, starting from one: */
    menuEntry = fghFindMenuEntry( fgStructure.CurrentMenu, item );

    freeglut_return_if_fail( menuEntry );

    /* We want it to become a normal menu entry, so: */
    if( menuEntry->Text )
        free( menuEntry->Text );

    menuEntry->Text    = strdup( label );
    menuEntry->ID      = value;
    menuEntry->SubMenu = NULL;
    fghCalculateMenuBoxSize( );
}

/*
 * Changes the specified menu item in the current menu into a sub-menu trigger.
 */
void FGAPIENTRY glutChangeToSubMenu( int item, const char* label,
                                     int subMenuID )
{
    SFG_Menu*      subMenu;
    SFG_MenuEntry* menuEntry;

    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutChangeToSubMenu" );
    subMenu = fgMenuByID( subMenuID );
    menuEntry = NULL;

    freeglut_return_if_fail( fgStructure.CurrentMenu );
    freeglut_return_if_fail( subMenu );

    /* Get n-th menu entry in the current menu, starting from one: */
    menuEntry = fghFindMenuEntry( fgStructure.CurrentMenu, item );

    freeglut_return_if_fail( menuEntry );

    /* We want it to become a sub menu entry, so: */
    if( menuEntry->Text )
        free( menuEntry->Text );

    menuEntry->Text    = strdup( label );
    menuEntry->SubMenu = subMenu;
    menuEntry->ID      = -1;
    fghCalculateMenuBoxSize( );
}

/*
 * Removes the specified menu item from the current menu
 */
void FGAPIENTRY glutRemoveMenuItem( int item )
{
    SFG_MenuEntry* menuEntry;

    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutRemoveMenuItem" );
    freeglut_return_if_fail( fgStructure.CurrentMenu );

    /* Get n-th menu entry in the current menu, starting from one: */
    menuEntry = fghFindMenuEntry( fgStructure.CurrentMenu, item );

    freeglut_return_if_fail( menuEntry );

    fgListRemove( &fgStructure.CurrentMenu->Entries, &menuEntry->Node );
    if ( menuEntry->Text )
      free( menuEntry->Text );

    free( menuEntry );
    fghCalculateMenuBoxSize( );
}

/*
 * Attaches a menu to the current window
 */
void FGAPIENTRY glutAttachMenu( int button )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutAttachMenu" );

    freeglut_return_if_fail( fgStructure.CurrentWindow );
    freeglut_return_if_fail( fgStructure.CurrentMenu );

    freeglut_return_if_fail( button >= 0 );
    freeglut_return_if_fail( button < FREEGLUT_MAX_MENUS );

    fgStructure.CurrentWindow->Menu[ button ] = fgStructure.CurrentMenu;
}

/*
 * Detaches a menu from the current window
 */
void FGAPIENTRY glutDetachMenu( int button )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutDetachMenu" );

    freeglut_return_if_fail( fgStructure.CurrentWindow );
    freeglut_return_if_fail( fgStructure.CurrentMenu );

    freeglut_return_if_fail( button >= 0 );
    freeglut_return_if_fail( button < FREEGLUT_MAX_MENUS );

    fgStructure.CurrentWindow->Menu[ button ] = NULL;
}

/*
 * A.Donev: Set and retrieve the menu's user data
 */
void* FGAPIENTRY glutGetMenuData( void )
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutGetMenuData" );
    return fgStructure.CurrentMenu->UserData;
}

void FGAPIENTRY glutSetMenuData(void* data)
{
    FREEGLUT_EXIT_IF_NOT_INITIALISED ( "glutSetMenuData" );
    fgStructure.CurrentMenu->UserData=data;
}

/*** END OF FILE ***/
