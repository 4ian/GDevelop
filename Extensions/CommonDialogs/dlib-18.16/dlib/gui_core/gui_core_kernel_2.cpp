// Copyright (C) 2005  Davis E. King (davis@dlib.net), Keita Mochizuki
// License: Boost Software License   See LICENSE.txt for the full license.
#ifndef DLIB_GUI_CORE_KERNEL_2_CPp_
#define DLIB_GUI_CORE_KERNEL_2_CPp_
#include "../platform.h"

#ifdef POSIX

#include "gui_core_kernel_2.h"


#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <X11/keysym.h>
#include <X11/Xlocale.h>
#include <X11/XKBlib.h>
#include <poll.h>
#include <iostream>
#include "../assert.h"
#include "../queue.h"
#include <cstring>
#include <cmath>
#include <X11/Xatom.h>
#include "../sync_extension.h"
#include "../logger.h"
#include <vector>
#include <set>
#include "../smart_pointers_thread_safe.h"

namespace dlib
{

// ----------------------------------------------------------------------------------------

    namespace gui_core_kernel_2_globals
    {
        void init_keyboard_mod_masks();
        struct user_event_type
        {
            Window w;
            void* p;
            int i;
        };

        typedef sync_extension<queue<user_event_type,memory_manager<char>::kernel_1b>::kernel_2a_c>::kernel_1a queue_of_user_events;

        typedef sync_extension<binary_search_tree<Window,base_window*>::kernel_1a>::kernel_1a 
            window_table_type;

    // ----------------------------------------------------------------------------------------

        const shared_ptr_thread_safe<dlib::mutex>& global_mutex()
        {
            static shared_ptr_thread_safe<dlib::mutex> m(new dlib::mutex);
            return m;
        }

        class event_handler_thread : public threaded_object
        {
        public:

            enum et_state
            {
                uninitialized,
                initialized,
                failure_to_init 
            };

            et_state status;
            logger dlog;


            int depth;
            Display* disp;
            XIM xim;
            XIMStyle xim_style;
            Screen* screen;

            Atom delete_window; 
            Window exit_window;
            std::wstring clipboard;

            int alt_mask;
            int meta_mask;
            int num_lock_mask;
            int scroll_lock_mask;

            // the mutex in this object is the global mutex used to protect everything
            // in the gui_core and gui_widgets components.
            window_table_type window_table;

            rsignaler window_close_signaler;
            rsignaler et_signaler;

            queue_of_user_events user_events;
            queue_of_user_events user_events_temp;

            shared_ptr_thread_safe<dlib::mutex> reference_to_global_mutex;

            event_handler_thread(
            ) :
                dlog("dlib.gui_core"),
                depth(0),
                disp(0),
                xim(0),
                screen(0),
                alt_mask(0),
                meta_mask(0),
                num_lock_mask(0),
                scroll_lock_mask(0),
                window_close_signaler(window_table.get_mutex()),
                et_signaler(window_table.get_mutex()),
                reference_to_global_mutex(global_mutex())
            {
                auto_mutex M(window_table.get_mutex());

                status = uninitialized;

                // start up the event handler thread
                start();

                // wait for the event thread to get up and running
                while (status == uninitialized)
                    et_signaler.wait();

                if (status == failure_to_init)
                    throw gui_error("Failed to initialize X11 resources");

                init_keyboard_mod_masks();
            }

            ~event_handler_thread ()
            {
                
                if (is_alive())
                {
                    
                    if (status != failure_to_init)
                    {
                        XConfigureEvent event;
                        event.type = ConfigureNotify;
                        event.send_event = True;
                        event.display = disp;
                        event.window = exit_window;
                        event.x = 1;
                        XFlush(disp);
                        XPutBackEvent(disp,reinterpret_cast<XEvent*>(&event));
                        XFlush(disp);

                        // This should cause XNextEvent() to unblock so that it will see 
                        // this ConfigureNotify event we are putting onto the event queue.
                        XSendEvent(disp,exit_window,False,0,reinterpret_cast<XEvent*>(&event));
                        XFlush(disp);

                        wait();

                        if (xim != NULL)
                        {
                            XCloseIM(xim);
                        }

                        XCloseDisplay(disp);


                    }
                    else
                    {

                        wait();
                    }
                }


            }

        private:

            void thread (
            )
            {
                using namespace std;
                using namespace dlib;
                try
                {

                    // You are supposed to call this if using XLib in a threaded program.  Note
                    // however that at one point I noticed that calling this causes a dead-lock 
                    // when using XIM.  But I can't reproduce that anymore and not calling it 
                    // sometimes causes XCloseDisplay() to hang.
                    if (XInitThreads() == 0)
                    {
                        dlog << LFATAL << "Unable to initialize threading support.";
                        // signal that an error has occurred
                        window_table.get_mutex().lock();
                        status = failure_to_init;
                        et_signaler.broadcast();
                        window_table.get_mutex().unlock();
                        return;
                    }

                    window_table.get_mutex().lock();
                    disp = XOpenDisplay(NULL);
                    window_table.get_mutex().unlock();
                    if (disp == 0)
                    {
                        window_table.get_mutex().lock();
                        disp = XOpenDisplay(":0.0");
                        window_table.get_mutex().unlock();
                        if (disp == 0)
                        {
                            dlog << LFATAL << "Unable to connect to the X display.";
                            // signal that an error has occurred
                            window_table.get_mutex().lock();
                            status = failure_to_init;
                            et_signaler.broadcast();
                            window_table.get_mutex().unlock();
                            return;
                        }
                    }

                    window_table.get_mutex().lock();
                    screen = DefaultScreenOfDisplay(disp);
                    depth = DefaultDepthOfScreen(screen);
                    delete_window = XInternAtom(disp,"WM_DELETE_WINDOW",1); 
                    window_table.get_mutex().unlock();

                    xim = NULL;
                    // I'm disabling XIM usage all together because calling XSetICValues()
                    // in set_im_pos() randomly hangs the application (on Ubuntu 13.10 at
                    // least).    
                    /*
                    window_table.get_mutex().lock();
                    std::string saved_locale(setlocale (LC_CTYPE, NULL));
                    if (setlocale( LC_CTYPE, "" ) && XSupportsLocale() && XSetLocaleModifiers(""))
                        xim = XOpenIM(disp, NULL, NULL, NULL);
                    else
                        setlocale( LC_CTYPE, saved_locale.c_str() );
                    window_table.get_mutex().unlock();
                    */
                    if (xim)
                    {
                        const static XIMStyle preedit_styles[] =
                            {XIMPreeditPosition, XIMPreeditNothing, XIMPreeditNone, 0};
                        const static XIMStyle status_styles[] =
                            {XIMStatusNothing, XIMStatusNone, 0};
                        xim_style = 0;

                        XIMStyles *xim_styles;
                        window_table.get_mutex().lock();

                        XGetIMValues (xim, XNQueryInputStyle, &xim_styles, (const void*)NULL);
                        window_table.get_mutex().unlock();
                        std::set<XIMStyle> xims;
                        for (int i = 0; i < xim_styles->count_styles; ++i){
                            xims.insert(xim_styles->supported_styles[i]);
                        }
                        for (int j = 0; status_styles[j]; ++j){
                            for (int i = 0; preedit_styles[i]; ++i){
                                xim_style = (status_styles[j] | preedit_styles[i]);
                                if (xims.count(xim_style)) break;
                            }
                            if (xim_style) break;
                        }
                        XFree(xim_styles);
                    }

                    // make this window just so we can send messages to it and trigger
                    // events in the event thread
                    XSetWindowAttributes attr;
                    window_table.get_mutex().lock();
                    exit_window = XCreateWindow(
                        disp,
                        DefaultRootWindow(disp),
                        0,
                        0,
                        10,  // this is the default width of a window
                        10,  // this is the default width of a window
                        0,
                        depth,
                        InputOutput,
                        CopyFromParent,
                        0,
                        &attr
                    );
                    window_table.get_mutex().unlock();

                    // signal that the event thread is now up and running
                    window_table.get_mutex().lock();
                    status = initialized;
                    et_signaler.broadcast();
                    window_table.get_mutex().unlock();

                    // start the event handler
                    event_handler();
                }
                catch (std::exception& e)
                {
                    cout << "\nEXCEPTION THROWN: \n" << e.what() << endl;
                    abort();
                }
                catch (...)
                {
                    cout << "UNKNOWN EXCEPTION THROWN.\n" << endl;
                    abort();
                }
            }

            void event_handler();
            void init_keyboard_mod_masks();
        };

        struct x11_base_windowstuff
        {
            Window hwnd;
            Time last_click_time;
            XIC xic;
            XFontSet fs;
            shared_ptr_thread_safe<event_handler_thread> globals;
        };

        // Do all this just to make sure global_mutex() is initialized at program start
        // and thus hopefully before any threads have the chance to startup and call
        // global_data() concurrently.
        struct call_global_mutex { call_global_mutex() { global_mutex(); } };
        static call_global_mutex call_global_mutex_instance;

        const shared_ptr_thread_safe<event_handler_thread>& global_data()
        {
            auto_mutex M(*global_mutex());
            static shared_ptr_thread_safe<event_handler_thread> p;
            if (p.get() == 0)
                p.reset(new event_handler_thread());
            return p;
        }

    // ----------------------------------------------------------------------------------------

        Bool XCheckIfEventPredicate (
            Display* ,
            XEvent* event,
            XPointer arg
        )
        /*!
            ensures
                - if (event is an Expose event for the window pointed to by arg) then
                    - returns true
                - else
                    - returns false
        !*/
        {
            if (event->type == Expose)
            {
                XExposeEvent* e = reinterpret_cast<XExposeEvent*>(event);
                Window* win= reinterpret_cast<Window*>(arg);
                if (e->window == *win)
                {
                    return 1;
                }
            }
            return 0;
        }

    // ----------------------------------------------------------------------------------------
    
        static bool map_keys (
            KeySym keycode,
            bool ,
            bool ,
            unsigned long& result,
            bool& is_printable
        )
        /*!
            requires
                - if (shift was down for this key) then
                    - shift == true
                - if (caps lock was on for this key) then
                    - caps == true
                - keycode == the keycode from windows that we are to process
                - keycode < keyboard_keys_size
            ensures
                - if (this key should be ignored) then
                    - returns false
                - else
                    - returns true
                    - #is_printable == true if result is a printable ascii character
                    - #result == the keycode converted into the proper number to tbe 
                      returned by the event handler.
        !*/
        {
            is_printable = true;
            if ((keycode <= 'z' && keycode >= 'a') || 
                (keycode <= 'Z' && keycode >= 'A') || 
                (keycode <= '9' && keycode >= '0'))
            {
                result = keycode;
            }
            else
            {
                is_printable = false;
                switch (keycode)
                {
                case XK_Home:   result = base_window::KEY_HOME; break;
                case XK_Left:   result = base_window::KEY_LEFT; break;
                case XK_Right:  result = base_window::KEY_RIGHT; break;
                case XK_Down:   result = base_window::KEY_DOWN; break;
                case XK_Up:     result = base_window::KEY_UP; break;
                case XK_Prior:  result = base_window::KEY_PAGE_UP; break;
                case XK_Next:   result = base_window::KEY_PAGE_DOWN;     break;
                case XK_End:    result = base_window::KEY_END; break;
                case XK_Escape:    result = base_window::KEY_ESC; break;
                
                case XK_KP_Delete:    result = base_window::KEY_DELETE; break;
                case XK_KP_Prior:    result = base_window::KEY_PAGE_UP; break;
                case XK_KP_Next:    result = base_window::KEY_PAGE_DOWN; break;


                case XK_F1:    result = base_window::KEY_F1; break;
                case XK_F2:    result = base_window::KEY_F2; break;
                case XK_F3:    result = base_window::KEY_F3; break;
                case XK_F4:    result = base_window::KEY_F4; break;
                case XK_F5:    result = base_window::KEY_F5; break;
                case XK_F6:    result = base_window::KEY_F6; break;
                case XK_F7:    result = base_window::KEY_F7; break;
                case XK_F8:    result = base_window::KEY_F8; break;
                case XK_F9:    result = base_window::KEY_F9; break;
                case XK_F10:    result = base_window::KEY_F10; break;
                case XK_F11:    result = base_window::KEY_F11; break;
                case XK_F12:    result = base_window::KEY_F12; break;
                    
                    
                case XK_Shift_L:    result = base_window::KEY_SHIFT; break;
                case XK_Shift_R:    result = base_window::KEY_SHIFT; break;
                case XK_Control_L:    result = base_window::KEY_CTRL; break;
                case XK_Control_R:    result = base_window::KEY_CTRL; break;
                case XK_Caps_Lock:    result = base_window::KEY_CAPS_LOCK; break;
                case XK_Alt_L:    result = base_window::KEY_ALT; break;
                case XK_Alt_R:    result = base_window::KEY_ALT; break;

                    
                case XK_BackSpace:    result = base_window::KEY_BACKSPACE; break;
                case XK_Delete:    result = base_window::KEY_DELETE; break;
                case XK_Scroll_Lock:    result = base_window::KEY_SCROLL_LOCK; break;
                case XK_Pause:    result = base_window::KEY_PAUSE; break;
                case XK_Insert:    result = base_window::KEY_INSERT; break;
                case XK_KP_Insert:    result = base_window::KEY_INSERT; break;




                case XK_exclam:    
                    is_printable = true;
                    result = '!'; break;
                case XK_quotedbl:    
                    is_printable = true;
                    result = '"'; break;
                case XK_numbersign:    
                    is_printable = true;
                    result = '#'; break;
                case XK_dollar:    
                    is_printable = true;
                    result = '$'; break;
                case XK_percent:    
                    is_printable = true;
                    result = '%'; break;
                case XK_ampersand:    
                    is_printable = true;
                    result = '&'; break;
                case XK_apostrophe:    
                    is_printable = true;
                    result = '\''; break;
                case XK_parenleft:    
                    is_printable = true;
                    result = '('; break;
                case XK_parenright:    
                    is_printable = true;
                    result = ')'; break;
                case XK_asterisk:    
                    is_printable = true;
                    result = '*'; break;
                case XK_plus:    
                    is_printable = true;
                    result = '+'; break;
                case XK_comma:    
                    is_printable = true;
                    result = ','; break;
                case XK_minus:    
                    is_printable = true;
                    result = '-'; break;
                case XK_period:    
                    is_printable = true;
                    result = '.'; break;
                case XK_slash:    
                    is_printable = true;
                    result = '/'; break;
                case XK_colon:    
                    is_printable = true;
                    result = ':'; break;
                case XK_semicolon:    
                    is_printable = true;
                    result = ';'; break;
                case XK_less:    
                    is_printable = true;
                    result = '<'; break;
                case XK_equal:    
                    is_printable = true;
                    result = '='; break;
                case XK_greater:    
                    is_printable = true;
                    result = '>'; break;
                case XK_question:    
                    is_printable = true;
                    result = '?'; break;
                case XK_at:    
                    is_printable = true;
                    result = '@'; break;
                case XK_grave:    
                    is_printable = true;
                    result = '`'; break;
                case XK_underscore:    
                    is_printable = true;
                    result = '_'; break;
                case XK_asciicircum:    
                    is_printable = true;
                    result = '^'; break;
                case XK_bracketleft:    
                    is_printable = true;
                    result = '['; break;
                case XK_backslash:    
                    is_printable = true;
                    result = '\\'; break;
                case XK_bracketright:    
                    is_printable = true;
                    result = ']'; break;
                case XK_asciitilde:    
                    is_printable = true;
                    result = '~'; break;
                case XK_braceleft:    
                    is_printable = true;
                    result = '{'; break;
                case XK_bar:    
                    is_printable = true;
                    result = '|'; break;
                case XK_braceright:    
                    is_printable = true;
                    result = '}'; break;
            



                case XK_space:    
                    is_printable = true;
                    result = ' '; break;
                case XK_Return:    
                    is_printable = true;
                    result = '\n'; break;
                case XK_Tab:    
                    is_printable = true;
                    result = '\t'; break;
                case XK_KP_Divide: 
                    is_printable = true;
                    result = '/'; break;
                case XK_KP_Decimal: 
                    is_printable = true;
                    result = '.'; break;
                case XK_KP_Subtract: 
                    is_printable = true;
                    result = '-'; break;
                case XK_KP_Add: 
                    is_printable = true;
                    result = '+'; break;
                case XK_KP_Multiply: 
                    is_printable = true;
                    result = '*'; break;
                case XK_KP_Equal: 
                    is_printable = true;
                    result = '='; break;

                case XK_KP_0: 
                    is_printable = true;
                    result = '0'; break;
                case XK_KP_1: 
                    is_printable = true;
                    result = '1'; break;
                case XK_KP_2: 
                    is_printable = true;
                    result = '2'; break;
                case XK_KP_3: 
                    is_printable = true;
                    result = '3'; break;
                case XK_KP_4: 
                    is_printable = true;
                    result = '4'; break;
                case XK_KP_5: 
                    is_printable = true;
                    result = '5'; break;
                case XK_KP_6: 
                    is_printable = true;
                    result = '6'; break;
                case XK_KP_7: 
                    is_printable = true;
                    result = '7'; break;
                case XK_KP_8: 
                    is_printable = true;
                    result = '8'; break;
                case XK_KP_9: 
                    is_printable = true;
                    result = '9'; break;

                default:
                    return false;
                }
            }

            return true;
        }

    // ----------------------------------------------------------------------------------------

        void event_handler_thread::
        event_handler (
        )
        /*!
            ensures
                - will handle all events and event dispatching            
        !*/
        {       
            try
            {
                std::vector<unsigned char> bitmap_buffer;
                bool quit_event_loop = false;
                while (quit_event_loop == false)
                {
                    // get a lock on the window_table's mutex
                    auto_mutex window_table_locker(window_table.get_mutex());

                    XEvent ev;                
                    memset(&ev, 0, sizeof(ev));
                    while (XPending(disp) == 0){
                        window_table.get_mutex().unlock();
                        // wait until receiving X11 next event
                        struct pollfd pfd;
                        pfd.fd = ConnectionNumber(disp);
                        pfd.events = POLLIN | POLLPRI;
                        poll(&pfd, 1, -1);  
                        
                        window_table.get_mutex().lock();
                    }
                    XNextEvent(disp,&ev);

                    // pass events to input method.
                    // if this event is needed by input method, XFilterEvent returns True
                    if (XFilterEvent(&ev, None) == True){
                        continue;
                    }

                    // if this event is for one of the windows in the window_table
                    // then get that window out of the table and put it into win.
                    XAnyEvent* _ae = reinterpret_cast<XAnyEvent*>(&ev);
                    base_window** win_ = window_table[_ae->window];
                    base_window* win = 0;
                    if (win_)
                        win = *win_;


                    // ignore messages for unmapped windows
                    if (ev.type != MapNotify && win != 0) 
                    {
                        if (win->is_mapped == false)
                           continue;
                    }


                    switch (ev.type)
                    {

                    case SelectionRequest:
                        {
                            Atom a_ct = XInternAtom(disp, "COMPOUND_TEXT", False);
                            XSelectionRequestEvent* req = reinterpret_cast<XSelectionRequestEvent*>(&ev.xselectionrequest);
                            XEvent respond;

                            if (req->target == XA_STRING)
                            {
                                XChangeProperty (disp,
                                                 req->requestor,
                                                 req->property,
                                                 XA_STRING,
                                                 8,
                                                 PropModeReplace,
                                                 reinterpret_cast<const unsigned char*>(convert_wstring_to_mbstring(clipboard).c_str()),
                                                 clipboard.size()+1);
                                respond.xselection.property=req->property;
                            }
                            else if (req->target == a_ct)
                            {
                                XChangeProperty (disp,
                                                 req->requestor,
                                                 req->property,
                                                 a_ct,
                                                 sizeof(wchar_t)*8,
                                                 PropModeReplace,
                                                 reinterpret_cast<const unsigned char*>(clipboard.c_str()),
                                                 clipboard.size()+1);
                                respond.xselection.property=req->property;
                            }
                            else 
                            {
                                respond.xselection.property= None;
                            }
                            respond.xselection.type= SelectionNotify;
                            respond.xselection.display= req->display;
                            respond.xselection.requestor= req->requestor;
                            respond.xselection.selection=req->selection;
                            respond.xselection.target= req->target;
                            respond.xselection.time = req->time;
                            XSendEvent (disp, req->requestor,0,0,&respond);
                            XFlush (disp);

                        } break;

                    case MapNotify:
                        {
                            if (win == 0)
                                break;

                            win->is_mapped = true;

                            if (win->resizable == false)
                            {
                                XSizeHints* hints = XAllocSizeHints();
                                hints->flags = PMinSize|PMaxSize;
                                hints->min_width = win->width;
                                hints->max_width = win->width;
                                hints->max_height = win->height; 
                                hints->min_height = win->height; 
                                XSetNormalHints(disp,win->x11_stuff.hwnd,hints);
                                XFree(hints);
                            }



                            if (win->has_been_resized)
                            {
                                XResizeWindow(disp,win->x11_stuff.hwnd,win->width,win->height);
                                win->has_been_resized = false;
                                win->on_window_resized();
                            }

                            if (win->has_been_moved)
                            {
                                XMoveWindow(disp,win->x11_stuff.hwnd,win->x,win->y);
                                win->has_been_moved = false;
                                win->on_window_moved();
                            }
                            XFlush(disp);


                        } break;


                    case KeyPress:
                        {
                            XKeyPressedEvent* e = reinterpret_cast<XKeyPressedEvent*>(&ev);

                            if (win == 0)
                                break;

                            unsigned long state = 0;
                            bool shift = ((e->state & ShiftMask)!=0);
                            bool ctrl = ((e->state & ControlMask)!=0);
                            bool caps = ((e->state & LockMask)!=0);
                            if(shift)
                                state |= base_window::KBD_MOD_SHIFT;
                            if(ctrl)
                                state |= base_window::KBD_MOD_CONTROL;
                            if(caps)
                                state |= base_window::KBD_MOD_CAPS_LOCK;
                            if((e->state & alt_mask)!=0)
                                state |= base_window::KBD_MOD_ALT;
                            if((e->state & meta_mask)!=0)
                                state |= base_window::KBD_MOD_META;
                            if((e->state & num_lock_mask)!=0)
                                state |= base_window::KBD_MOD_NUM_LOCK;
                            if((e->state & scroll_lock_mask)!=0)
                                state |= base_window::KBD_MOD_SCROLL_LOCK;

                            KeySym key;
                            Status status;

                            if (win->x11_stuff.xic) {
                                std::wstring wstr;
                                wstr.resize(2);
                                int len = XwcLookupString(win->x11_stuff.xic,e,&wstr[0],wstr.size(),&key,&status);
                                if (status == XBufferOverflow){
                                    wstr.resize(len);
                                    len = XwcLookupString(win->x11_stuff.xic,e,&wstr[0],wstr.size(),&key,&status);
                                }
                                if (status == XLookupChars){
                                    win->on_string_put(wstr);
                                }
                            } else {
                                char buffer[2];
                                XLookupString(e, buffer, sizeof(buffer), &key, NULL);
                                status = XLookupKeySym;
                            }

                            if (status == XLookupKeySym || status == XLookupBoth){

                                bool is_printable;
                                unsigned long result;

                                if (map_keys(key,shift,caps,result,is_printable))
                                {
                                    // signal the keyboard event
                                    win->on_keydown(result,is_printable,state);
                                }
                            }
                            
                        } break;

                    case FocusIn:
                        {
                            if (win == 0)
                                break;

                            // signal the focus event 
                            win->on_focus_gained();
                        } break;

                    case FocusOut:
                        {
                            if (win == 0)
                                break;

                            // signal the focus event 
                            win->on_focus_lost();
                        } break;

                    case ButtonPress:
                    case ButtonRelease:
                        {
                            XButtonEvent* e = reinterpret_cast<XButtonEvent*>(&ev);

                            if (win == 0)
                                break;

                            unsigned long btn = base_window::NONE;
                            if (e->button == Button1)
                                btn = base_window::LEFT;
                            else if (e->button == Button3)
                                btn = base_window::RIGHT;
                            else if (e->button == Button2)
                                btn = base_window::MIDDLE;

                            unsigned long state = 0;
                            if (e->state & ControlMask)
                                state |= base_window::CONTROL;
                            if (e->state & Button1Mask)
                                state |= base_window::LEFT;
                            if (e->state & Button2Mask)
                                state |= base_window::MIDDLE;
                            if (e->state & Button3Mask)
                                state |= base_window::RIGHT;
                            if (e->state & ShiftMask)
                                state |= base_window::SHIFT;

                            // only send the event if this is a button we support
                            if (btn != (unsigned long)base_window::NONE)
                            {


                                if (ev.type == ButtonPress)
                                {
                                    bool is_double_click = false;
                                    if (win->last_click_button == btn &&
                                        std::abs((long)win->last_click_x - (long)e->x) < 5 &&
                                        std::abs((long)win->last_click_y - (long)e->y) < 5 &&
                                        e->time - win->x11_stuff.last_click_time <= 400)
                                    {
                                        // this is a double click
                                        is_double_click = true;
                                        // set this to make sure the next click can't be
                                        // interpreted as a double click
                                        win->last_click_button = base_window::NONE;
                                    }
                                    else
                                    {
                                        win->last_click_button = btn;
                                        win->last_click_x = e->x;
                                        win->last_click_y = e->y;
                                        win->x11_stuff.last_click_time = e->time;
                                    }

                                    // remove the clicked button from the state
                                    state &= (~btn);
                                    win->on_mouse_down(btn,state,e->x,e->y,is_double_click);

                                }
                                else
                                {
                                    // remove the clicked button from the state
                                    state &= (~btn);
                                    win->on_mouse_up(btn,state,e->x,e->y);
                                }
                            }
                            else if (e->button == Button4 && ev.type == ButtonPress)
                            {
                                win->on_wheel_up(state);
                            }
                            else if (e->button == Button5 && ev.type == ButtonPress)
                            {
                                win->on_wheel_down(state);
                            }
                            
                        } break;
 
                    case LeaveNotify:
                        {
                            if (win == 0)
                                break;

                            win->on_mouse_leave();
                            
                        } break;

                    case EnterNotify:
                        {
                            if (win == 0)
                                break;

                            win->on_mouse_enter();
                        } break;

                    case MotionNotify:
                        {
                            XMotionEvent* e = reinterpret_cast<XMotionEvent*>(&ev);

                            if (win == 0)
                                break;

                            unsigned long state = 0;
                            if (e->state & ControlMask)
                                state |= base_window::CONTROL;
                            if (e->state & Button1Mask)
                                state |= base_window::LEFT;
                            if (e->state & Button2Mask)
                                state |= base_window::MIDDLE;
                            if (e->state & Button3Mask)
                                state |= base_window::RIGHT;
                            if (e->state & ShiftMask)
                                state |= base_window::SHIFT;

                            win->on_mouse_move(state,e->x,e->y);
                            
                        } break;

                    case ConfigureNotify:
                        {
                            XConfigureEvent* e = reinterpret_cast<XConfigureEvent*>(&ev);
                            if (e->window == exit_window)
                            {
                                // this is the signal to quit the event handler
                                quit_event_loop = true;
                                break;
                            }

                            if (win == 0)
                                break;

                            if (win->width != e->width ||
                                win->height != e->height ||
                                win->has_been_resized)
                            {
                                win->has_been_resized = false;
                                // this is a resize
                                win->width = e->width;
                                win->height = e->height;
                                win->on_window_resized();
                            }
                            if (win->x != e->x ||
                                win->y != e->y ||
                                win->has_been_moved)
                            {
                                win->has_been_moved = false;
                                // this is a move
                                win->x = e->x;
                                win->y = e->y;
                                win->on_window_moved();
                            }
                            
                        } break;

                    case ClientMessage:
                        {
                            XClientMessageEvent* e = reinterpret_cast<XClientMessageEvent*>(&ev);
                            if ((Atom)e->data.l[0] == delete_window)
                            {
                                if (win == 0)
                                    break;


                                if (win->on_window_close() == base_window::DO_NOT_CLOSE_WINDOW)
                                {
                                    DLIB_ASSERT(win->has_been_destroyed == false,
                                        "\tYou called close_window() inside the on_window_close() event but" 
                                        << "\n\tthen returned DO_NOT_CLOSE_WINDOW.  You can do one or the other but not both."
                                        << "\n\tthis:     " << win 
                                        );
                                    // the client has decided not to close the window
                                    // after all
                                }
                                else
                                {                                
                                    if (window_table[e->window])
                                    {
                                        window_table.destroy(e->window);
                                        XDestroyWindow(disp,e->window);
                                        win->has_been_destroyed = true;
                                        window_close_signaler.broadcast();
                                    }
                                    else
                                    {
                                        // in this case the window must have self destructed by
                                        // calling delete this;  so we don't have to do anything.
                                    }
                                }
                            }
                        } break;

                    case Expose:
                        {
                            XExposeEvent* e = reinterpret_cast<XExposeEvent*>(&ev);

                            if (win == 0)
                                break;

                            // take all the expose events for this window out
                            XEvent etemp;
                            int x = e->x;
                            int y = e->y;
                            int width = e->width;
                            int height = e->height;  



                            // What we are doing here with this loop is we are combining
                            // all of the Expose events for this window that are 
                            // currently in the queue.  
                            while (XCheckIfEvent(disp,&etemp,XCheckIfEventPredicate,reinterpret_cast<XPointer>(&(e->window))))
                            {
                                XExposeEvent* e2 = reinterpret_cast<XExposeEvent*>(&etemp);
                                if (e2->x < x)
                                {
                                    width += x - e2->x;
                                    x = e2->x;                                
                                }
                                if (e2->y < y)
                                {
                                    height += y - e2->y;
                                    y = e2->y;
                                }
                                if (e2->width + e2->x > width + x)
                                {
                                    width = e2->width + e2->x - x;
                                }
                                if (e2->height + e2->y > height + y)
                                {
                                    height = e2->height + e2->y - y;
                                }                                
                            }

                            // I'm not sure if this sort of thing can happen but
                            // if it does then just ignore this entire event.
                            if (width == 0 || height == 0)
                            {
                                break;
                            }

                            if (bitmap_buffer.size() < static_cast<unsigned long>(width*height*4))
                                bitmap_buffer.resize(width*height*4);

                            unsigned char* const bitmap = &bitmap_buffer[0];
                            unsigned char* const end = bitmap + width*height*4;

                            unsigned char* temp;
                            canvas c(bitmap,x,y,x+width-1,y+height-1);


                            win->paint(c);

                            // the user might have called win->close_window() and if they did
                            // then just stop right here.  We don't want to paint the window.
                            if (win->has_been_destroyed)
                                break;

                            // if the color depth we are working with isn't 24bits then we need
                            // to transform our image into whatever it is supposed to be.
                            if (depth != 24)
                            {
                                // convert this image into an 8 bit image
                                unsigned int red_bits = 0;
                                unsigned int green_bits = 0;
                                unsigned int blue_bits = 0;
                                if (depth != 16)
                                {
                                    unsigned int bits = depth/3;
                                    unsigned int extra = depth%3;
                                    red_bits = bits;
                                    green_bits = bits;
                                    blue_bits = bits;
                                    if (extra)
                                    {
                                        ++red_bits;
                                        --extra;
                                    }
                                    if (extra)
                                    {
                                        ++green_bits;
                                    }
                                }
                                else if (depth == 16)
                                {
                                    red_bits = 5;
                                    green_bits = 6;
                                    blue_bits = 5;
                                }

                                if (depth == 16) 
                                { 
                                    temp = bitmap;
                                    unsigned char *red, *green, *blue;
                                    while (temp != end)
                                    {
                                        blue = temp;
                                        ++temp;
                                        green = temp;
                                        ++temp;
                                        red = temp;
                                        ++temp;
                                        ++temp;

                                        const unsigned long r = static_cast<unsigned long>(*red)>>(8-red_bits);
                                        const unsigned long g = static_cast<unsigned long>(*green)>>(8-green_bits);
                                        const unsigned long b = static_cast<unsigned long>(*blue)>>(8-blue_bits);

                                        unsigned long color = (r<<(depth-red_bits))| (g<<(depth-red_bits-green_bits))| b;

                                        *blue  = (color>>0)&0xFF;
                                        *green = (color>>8)&0xFF;
                                    }
                                }
                                else if (depth < 24)
                                {
                                    temp = bitmap;
                                    unsigned char *red, *green, *blue;
                                    while (temp != end)
                                    {
                                        blue = temp;
                                        ++temp;
                                        green = temp;
                                        ++temp;
                                        red = temp;
                                        ++temp;
                                        ++temp;

                                        const unsigned long r = static_cast<unsigned long>(*red)>>(8-red_bits);
                                        const unsigned long g = static_cast<unsigned long>(*green)>>(8-green_bits);
                                        const unsigned long b = static_cast<unsigned long>(*blue)>>(8-blue_bits);

                                        unsigned long color = (b<<(depth-blue_bits))| (g<<(depth-blue_bits-green_bits))| r;

                                        *blue  = (color>>0)&0xFF;
                                        *green = (color>>8)&0xFF;
                                        *red   = (color>>16)&0xFF;
                                    }
                                }
                                else if (depth > 24)
                                {
                                    temp = bitmap;
                                    unsigned char *red, *green, *blue, *four;
                                    while (temp != end)
                                    {
                                        blue = temp;
                                        ++temp;
                                        green = temp;
                                        ++temp;
                                        red = temp;
                                        ++temp;
                                        four = temp;
                                        ++temp;

                                        const unsigned long r = static_cast<unsigned long>(*red)<<(red_bits-8);
                                        const unsigned long g = static_cast<unsigned long>(*green)<<(green_bits-8);
                                        const unsigned long b = static_cast<unsigned long>(*blue)<<(blue_bits-8);

                                        unsigned long color = (b<<(depth-blue_bits))| (g<<(depth-blue_bits-green_bits))| r;

                                        *blue  = (color>>0)&0xFF;
                                        *green = (color>>8)&0xFF;
                                        *red   = (color>>16)&0xFF;
                                        *four  = (color>>24)&0xFF;
                                    }
                                }
                            } // if (depth != 24)



                            XImage img;
                            memset(&img,0,sizeof(img));
                            img.width = width;
                            img.height = height;
                            img.depth = depth;
                            img.data = reinterpret_cast<char*>(bitmap);
                            img.bitmap_bit_order = LSBFirst;
                            img.byte_order = LSBFirst;
                            img.format = ZPixmap;
                            img.bitmap_pad = 32;
                            img.bitmap_unit = 32;
                            img.bits_per_pixel = 32;


                            XInitImage(&img);

                            GC gc = XCreateGC(disp, e->window, 0, NULL);

                            XPutImage(disp,e->window,gc,&img,0,0,x,y,width,height);

                            XFreeGC(disp,gc);
                        } break;
                    } // switch (ev.type)
                }
            }
            catch (std::exception& e)
            {
                dlog << LFATAL << "Exception thrown in event handler: " << e.what();
            }
            catch (...)
            {
                dlog << LFATAL << "Unknown exception thrown in event handler.";
            }
        }
 
    // ----------------------------------------------------------------------------------------


        int index_to_modmask(unsigned long n)
        {
            switch ( n )
            {
                case 0:
                    return Mod1Mask;
                case 1:
                    return Mod2Mask;
                case 2:
                    return Mod3Mask;
                case 3:
                    return Mod4Mask;
            }
            return Mod5Mask;
        }

        void event_handler_thread::
        init_keyboard_mod_masks()
        {
            XModifierKeymap* map = XGetModifierMapping( disp );
            KeyCode* codes = map->modifiermap + map->max_keypermod * Mod1MapIndex;
            for (int n = 0; n < 5 * map->max_keypermod; n++ )
            {
                if ( codes[n] == 0 )
                    continue;
                switch(XkbKeycodeToKeysym( disp, codes[n], 0, 0 ))
                {
                    case XK_Alt_L:
                        alt_mask = index_to_modmask(n / map->max_keypermod);
                        continue;
                    case XK_Alt_R:
                        if(alt_mask == 0)
                            alt_mask = index_to_modmask(n / map->max_keypermod);
                        continue;
                    case XK_Meta_L:
                    case XK_Meta_R:
                        meta_mask = index_to_modmask(n / map->max_keypermod);
                        continue;
                    case XK_Scroll_Lock:
                        scroll_lock_mask = index_to_modmask(n / map->max_keypermod);
                        continue;
                    case XK_Num_Lock:
                        num_lock_mask = index_to_modmask(n / map->max_keypermod);
                    default:
                        continue;
                }
            }
            XFreeModifiermap( map );
            if ( alt_mask == 0 )
            {
                dlog << LWARN << "Search for Alt-key faild.";
                if ( meta_mask != 0 )
                    alt_mask = meta_mask;
                else
                    alt_mask = Mod1Mask; // resort to guessing
            }
        }

    // ----------------------------------------------------------------------------------------





    } // namespace gui_core_kernel_2_globals

// ----------------------------------------------------------------------------------------

    void canvas::
    fill (
        unsigned char red_,
        unsigned char green_,
        unsigned char blue_
    ) const
    {
        pixel pixel_value;
        pixel_value.red = red_;
        pixel_value.green = green_;
        pixel_value.blue = blue_;
        pixel_value._padding = 0;

        pixel* start = reinterpret_cast<pixel*>(bits);
        pixel* end = start + width_*height_;

        while (start != end)
        {
            *start = pixel_value;
            ++start;
        }
    }

// ----------------------------------------------------------------------------------------

    void put_on_clipboard (
        const std::string& str
    )
    {
        put_on_clipboard(convert_mbstring_to_wstring(str));
    }

    void put_on_clipboard (
        const dlib::ustring& str
    )
    {
        put_on_clipboard(convert_utf32_to_wstring(str));
    }

    void put_on_clipboard (
        const std::wstring& str
    )
    {
        using namespace gui_core_kernel_2_globals;

        shared_ptr_thread_safe<event_handler_thread> globals(global_data());

        auto_mutex M(globals->window_table.get_mutex());
        globals->clipboard = str.c_str();

        XSetSelectionOwner(globals->disp,XA_PRIMARY,globals->exit_window,CurrentTime);
    }

// ----------------------------------------------------------------------------------------

    Bool clip_peek_helper (
        Display*,
        XEvent* event,
        XPointer 
    )
    {
        if ( event->type == SelectionNotify)
        {
            return True;
        }
        else
        {
            return False;
        }
    }

    void get_from_clipboard (
        std::string& str
    )
    {
        std::wstring wstr;
        get_from_clipboard(wstr);
        str = convert_wstring_to_mbstring(wstr);
    }

    void get_from_clipboard (
        dlib::ustring& str
    )
    {
        std::wstring wstr;
        get_from_clipboard(wstr);
        str = convert_wstring_to_utf32(wstr);
    }

    void get_from_clipboard (
        std::wstring& str
    )
    {
        using namespace gui_core_kernel_2_globals;
        shared_ptr_thread_safe<event_handler_thread> globals(global_data());

        auto_mutex M(globals->window_table.get_mutex());
        str.clear();
        unsigned char *data = 0;
        wchar_t **plist = 0;
        Window sown;
        Atom  type;
        int format, result;
        unsigned long len, bytes_left, dummy;
        XEvent e;

        try
        {
            Atom atom_ct = XInternAtom(globals->disp, "COMPOUND_TEXT", False);
            sown = XGetSelectionOwner (globals->disp, XA_PRIMARY);
            if (sown == globals->exit_window)
            {
                // if we are copying from ourselfs then don't fool with the Xwindows junk.
                str = globals->clipboard.c_str();
            }
            else if (sown != None)
            {
                // request that the selection be copied into the XA_PRIMARY property
                // of the exit_window.  It doesn't matter what window we put it in 
                // so long as it is one under the control of this process and exit_window
                // is easy to use here so that is what I'm using.
                XConvertSelection (globals->disp, XA_PRIMARY, atom_ct, XA_PRIMARY,
                                   globals->exit_window, CurrentTime);

                // This will wait until we get a SelectionNotify event which should happen
                // really soon.
                XPeekIfEvent(globals->disp,&e,clip_peek_helper,0);

                // See how much data we got
                XGetWindowProperty (globals->disp, globals->exit_window, 
                                    XA_PRIMARY,    // Tricky..
                                    0, 0,         // offset - len
                                    0,        // Delete 0==FALSE
                                    AnyPropertyType,  //flag
                                    &type,        // return type
                                    &format,      // return format
                                    &len, &bytes_left,  //that 
                                    &data);             
                if (data)
                {
                    XFree(data);
                    data = 0;
                }
                if (bytes_left > 0 && type == atom_ct)
                {
                    XTextProperty p;
                    result = XGetWindowProperty (globals->disp, globals->exit_window, 
                                                 XA_PRIMARY, 0,bytes_left,0,
                                                 AnyPropertyType, &p.encoding,&p.format,
                                                 &p.nitems, &dummy, &p.value);
                    if (result == Success && p.encoding == atom_ct)
                    {
                        int n;
                        XwcTextPropertyToTextList(globals->disp, &p, &plist, &n);
                        str = plist[0];
                    }
                    if (plist)
                    {
                        XwcFreeStringList(plist);
                        plist = 0;
                    }
                }
            }
        }
        catch (...)
        {
            if (data) 
                XFree(data);
            if (plist)
            {
                XwcFreeStringList(plist);
                plist = 0;
            }
        }
    }

// ----------------------------------------------------------------------------------------

    namespace gui_core_kernel_2_globals
    {
        void trigger_user_event_threadproc (
            void*
        )
        {
            shared_ptr_thread_safe<event_handler_thread> globals(global_data());
            auto_mutex M(globals->window_table.get_mutex());

            globals->user_events.lock();
            globals->user_events.swap(globals->user_events_temp);
            globals->user_events.unlock();


            globals->user_events_temp.reset();
            // now dispatch all these user events
            while (globals->user_events_temp.move_next())
            {
                base_window** win_ = globals->window_table[globals->user_events_temp.element().w];
                base_window* win;
                // if this window exists in the window table then dispatch
                // its event.
                if (win_)
                {
                    win = *win_;
                    win->on_user_event(
                        globals->user_events_temp.element().p,
                        globals->user_events_temp.element().i
                    );
                }
            }
            globals->user_events_temp.clear();
        }
    }

    void base_window::
    trigger_user_event (
        void* p,
        int i
    )
    {
        using namespace gui_core_kernel_2_globals;
        user_event_type e;
        e.w = x11_stuff.hwnd;
        e.p = p;
        e.i = i;
        {
            shared_ptr_thread_safe<event_handler_thread> globals(global_data());
            auto_mutex M(globals->user_events.get_mutex());
            globals->user_events.enqueue(e);

            // we only need to start a thread to deal with this if there isn't already
            // one out working on the queue
            if (globals->user_events.size() == 1)
                create_new_thread (trigger_user_event_threadproc,0);
        }
    }

// ----------------------------------------------------------------------------------------

    base_window::
    base_window (
        bool resizable_,
        bool undecorated
    ) :
        x11_stuff(*(new gui_core_kernel_2_globals::x11_base_windowstuff)),
        is_mapped(false),
        resizable(resizable_),
        has_been_destroyed(false),
        has_been_resized(false),
        has_been_moved(false),
        wm(gui_core_kernel_2_globals::global_data()->window_table.get_mutex())
    {
        DLIB_ASSERT(!(undecorated == true && resizable_ == true),
            "\tbase_window::base_window()"
            << "\n\tThere is no such thing as an undecorated window that is resizable by the user."
            << "\n\tthis:     " << this
            );
        using namespace gui_core_kernel_2_globals;

        auto_mutex M(wm);

        x11_stuff.globals = global_data();
        
        x11_stuff.last_click_time = 0;
        last_click_x = 0;
        last_click_y = 0;
        last_click_button = NONE;

        XSetWindowAttributes attr;
        memset(&attr,'\0',sizeof(attr));

        unsigned long valuemask = 0;
        if (undecorated)
        {
            attr.override_redirect = True;
            valuemask = CWOverrideRedirect;
        }


        x11_stuff.hwnd = XCreateWindow(
                        x11_stuff.globals->disp,
                        DefaultRootWindow(x11_stuff.globals->disp),
                        0,
                        0,
                        10,  // this is the default width of a window
                        10,  // this is the default width of a window
                        0,
                        x11_stuff.globals->depth,
                        InputOutput,
                        CopyFromParent,
                        valuemask,
                        &attr
                        );

        x11_stuff.xic = NULL;
        if (x11_stuff.globals->xim)
        {
            XVaNestedList   xva_nlist;
            XPoint          xpoint;

            char **mlist;
            int mcount;
            char *def_str;
            char fontset[256];
            const long native_font_height = 12;
            sprintf(fontset, "-*-*-medium-r-normal--%lu-*-*-*-", native_font_height);
            x11_stuff.fs = XCreateFontSet(x11_stuff.globals->disp, fontset, &mlist, &mcount, &def_str);
            xpoint.x = 0;
            xpoint.y = 0;
            xva_nlist = XVaCreateNestedList(0, XNSpotLocation, &xpoint, XNFontSet, x11_stuff.fs, (const void*)NULL);
            x11_stuff.xic = XCreateIC(
                x11_stuff.globals->xim,
                XNInputStyle, x11_stuff.globals->xim_style,
                XNClientWindow, x11_stuff.hwnd,
                XNPreeditAttributes, xva_nlist,
                (const void*)NULL
                );
            XFree(xva_nlist);
            XFreeStringList(mlist);
        }

        Window temp = x11_stuff.hwnd;
        base_window* ttemp = this;
        x11_stuff.globals->window_table.add(temp,ttemp);
        
        // query event mask required by input method
        unsigned long event_xim = 0;
        if (x11_stuff.xic)
             XGetICValues( x11_stuff.xic, XNFilterEvents, &event_xim, (const void*)NULL );
        
        XSelectInput(
            x11_stuff.globals->disp,
            x11_stuff.hwnd,
            StructureNotifyMask|ExposureMask|ButtonPressMask|ButtonReleaseMask|
            PointerMotionMask|LeaveWindowMask|EnterWindowMask|KeyPressMask|
            KeyReleaseMask| FocusChangeMask | event_xim
            );

        XSetWMProtocols(
            x11_stuff.globals->disp,
            x11_stuff.hwnd,
            &x11_stuff.globals->delete_window,
            1
            );


        // these are just default values
        x = 0;
        y = 0;
        width = 10;
        height = 10;

        if (resizable == false)
        {
            XSizeHints* hints = XAllocSizeHints();
            hints->flags = PMinSize|PMaxSize;
            hints->min_width = width;
            hints->max_width = width;
            hints->max_height = height; 
            hints->min_height = height; 
            XSetNormalHints(x11_stuff.globals->disp,x11_stuff.hwnd,hints);
            XFree(hints);
        }
    }

// ----------------------------------------------------------------------------------------

    base_window::
    ~base_window (
    )
    {
        using namespace gui_core_kernel_2_globals;
        close_window();

        if (x11_stuff.globals->xim != NULL)
        {
            XDestroyIC(x11_stuff.xic);
            x11_stuff.xic = 0;
            XFreeFontSet(x11_stuff.globals->disp,x11_stuff.fs);
        }

        delete &x11_stuff;
    }

// ----------------------------------------------------------------------------------------

    void base_window::
    close_window (
    )
    {
        using namespace gui_core_kernel_2_globals;
        auto_mutex M(wm);
        if (has_been_destroyed == false)
        {
            has_been_destroyed = true;

            x11_stuff.globals->window_table.destroy(x11_stuff.hwnd);           

            XDestroyWindow(x11_stuff.globals->disp,x11_stuff.hwnd);
            x11_stuff.hwnd = 0;
            x11_stuff.globals->window_close_signaler.broadcast();
        }   
    }

// ----------------------------------------------------------------------------------------

    bool base_window::
    is_closed (
    ) const
    {
        auto_mutex M(wm);
        return has_been_destroyed;
    }

// ----------------------------------------------------------------------------------------

    void base_window::
    set_title (
        const std::string& title_
    )
    {
        set_title(convert_mbstring_to_wstring(title_));
    }

    void base_window::
    set_title (
        const ustring& title_
    )
    {
        set_title(convert_utf32_to_wstring(title_));
    }

    void base_window::
    set_title (
        const std::wstring& title_
    )
    {
        using namespace gui_core_kernel_2_globals;
        auto_mutex M(wm);
        if (has_been_destroyed == true)
            return;

        // I'm pretty sure the pointer won't be modified even though
        // it isn't const anymore.
        wchar_t *title = const_cast<wchar_t *>(title_.c_str());
        XTextProperty property;
        XwcTextListToTextProperty(x11_stuff.globals->disp,&title,1,XStdICCTextStyle, &property);
        XSetWMName(x11_stuff.globals->disp,x11_stuff.hwnd,&property);
        XFree(property.value);
        XFlush(x11_stuff.globals->disp);
    }

// ----------------------------------------------------------------------------------------

    void base_window::
    show (
    )    
    {
        using namespace gui_core_kernel_2_globals;
        auto_mutex M(wm);
        if (has_been_destroyed == true)
            return;

        XMapRaised(x11_stuff.globals->disp,x11_stuff.hwnd);
        XFlush(x11_stuff.globals->disp);
    }

// ----------------------------------------------------------------------------------------

    void base_window::
    wait_until_closed (
    ) const
    {
        using namespace gui_core_kernel_2_globals;
        auto_mutex M(wm);
        while (has_been_destroyed == false)
            x11_stuff.globals->window_close_signaler.wait();
    }

// ----------------------------------------------------------------------------------------

    void base_window::
    hide (
    )    
    {
        using namespace gui_core_kernel_2_globals;
        auto_mutex M(wm);
        if (has_been_destroyed == true)
            return;

        XUnmapWindow(x11_stuff.globals->disp,x11_stuff.hwnd);
        XFlush(x11_stuff.globals->disp);
    }

// ----------------------------------------------------------------------------------------

    void base_window::
    set_size (
        int width_,
        int height_
    )
    {
        using namespace gui_core_kernel_2_globals;
        auto_mutex a(wm);
        if (has_been_destroyed == true)
            return;


        // do some sanity checking on these values
        if (width_ < 1)
            width_ = 1;
        if (height_ < 1)
            height_ = 1;

        width = width_;
        height = height_;
        has_been_resized = true;

        if (resizable == false)
        {
            XSizeHints* hints = XAllocSizeHints();
            hints->flags = PMinSize|PMaxSize;
            hints->min_width = width;
            hints->max_width = width;
            hints->max_height = height; 
            hints->min_height = height; 
            XSetNormalHints(x11_stuff.globals->disp,x11_stuff.hwnd,hints);
            XFree(hints);
        }

        XResizeWindow(x11_stuff.globals->disp,x11_stuff.hwnd,width,height);
        
        XFlush(x11_stuff.globals->disp);
    }

// ----------------------------------------------------------------------------------------

    void base_window::
    set_pos (
        long x_,
        long y_
    )
    {
        using namespace gui_core_kernel_2_globals;
        auto_mutex a(wm);
        if (has_been_destroyed == true)
            return;


        x = x_;
        y = y_;

        has_been_moved = true;

        XMoveWindow(x11_stuff.globals->disp,x11_stuff.hwnd,x,y);
        XFlush(x11_stuff.globals->disp);
    }

// ----------------------------------------------------------------------------------------

    void base_window::
    get_pos (
        long& x_,
        long& y_
    )
    {
        using namespace gui_core_kernel_2_globals;
        auto_mutex a(wm);
        x_ = 0;
        y_ = 0;
        if (has_been_destroyed == true)
            return;

        // we can't really trust the values we have for x and y because some window managers
        // will have reported bogus values back in the ConfigureNotify event.  So just to be
        // on the safe side we will use XTranslateCoordinates() 
        int rx, ry;
        Window desktop_window = DefaultRootWindow(x11_stuff.globals->disp);
        Window junk;
        XTranslateCoordinates(x11_stuff.globals->disp,x11_stuff.hwnd,desktop_window,0,0,&rx, &ry, &junk);
        x_ = rx;
        y_ = ry;
        x = rx;
        y = ry;
    }

// ----------------------------------------------------------------------------------------

    void base_window::
    get_size (
        unsigned long& width_,
        unsigned long& height_
    ) const
    {
        auto_mutex M(wm);
        width_ = 0;
        height_ = 0;
        if (has_been_destroyed == true)
            return;


        width_ = width;
        height_ = height;
    }

// ----------------------------------------------------------------------------------------

    void base_window::
    get_display_size (
        unsigned long& width_,
        unsigned long& height_
    ) const
    {
        using namespace gui_core_kernel_2_globals;
        auto_mutex M(wm);
        width_ = 0;
        height_ = 0;
        if (has_been_destroyed == true)
            return;

        int screen_number = XScreenNumberOfScreen(x11_stuff.globals->screen);
        width_ = DisplayWidth(x11_stuff.globals->disp, screen_number);
        height_ = DisplayHeight(x11_stuff.globals->disp, screen_number);
    }

// ----------------------------------------------------------------------------------------

    void base_window::
    invalidate_rectangle (
        const rectangle& rect
    )
    {
        using namespace gui_core_kernel_2_globals;
        auto_mutex a(wm);
        if (is_mapped == false)
            return;

        if (rect.is_empty() == false && !has_been_destroyed)
        {
            const long x = rect.left();
            const long y = rect.top();
            const unsigned long width = rect.width();
            const unsigned long height = rect.height();
            
            XClearArea(x11_stuff.globals->disp,x11_stuff.hwnd,x,y,width,height,1);
            XFlush(x11_stuff.globals->disp);
        }
    }

// ----------------------------------------------------------------------------------------

    void base_window::
    set_im_pos (
        long x,
        long y
    )
    {
        using namespace gui_core_kernel_2_globals;
        auto_mutex a(wm);
        if (has_been_destroyed == true)
            return;

        if (!x11_stuff.xic || !(x11_stuff.globals->xim_style & XIMPreeditPosition)) return;

        XVaNestedList   xva_nlist;
        XPoint          xpoint;

        xpoint.x = x;
        xpoint.y = y;

        xva_nlist = XVaCreateNestedList(0, XNSpotLocation, &xpoint, (const void*)NULL);
        XSetICValues(x11_stuff.xic, XNPreeditAttributes, xva_nlist, (const void*)NULL);
        XFree(xva_nlist);
    }

}

// ----------------------------------------------------------------------------------------

#endif // POSIX

#endif // DLIB_GUI_CORE_KERNEL_2_CPp_

