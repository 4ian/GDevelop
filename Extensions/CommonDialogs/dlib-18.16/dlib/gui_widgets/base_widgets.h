// Copyright (C) 2005  Davis E. King (davis@dlib.net), Keita Mochizuki
// License: Boost Software License   See LICENSE.txt for the full license.

#ifndef DLIB_BASE_WIDGETs_
#define DLIB_BASE_WIDGETs_

#include "base_widgets_abstract.h"
#include "drawable.h"
#include "../gui_core.h"
#include "../algs.h"
#include "../member_function_pointer.h"
#include "../timer.h"
#include "../map.h"
#include "../set.h"
#include "../array2d.h"
#include "../pixel.h"
#include "../image_transforms/assign_image.h"
#include "../array.h" 
#include "style.h"
#include "../smart_pointers.h"
#include "../unicode.h"
#include <cctype>
#include "../any.h"


namespace dlib
{


// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class draggable
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class draggable : public drawable
    {
        /*!
            INITIAL VALUE
                - drag == false

            CONVENTION
                - if (the user is holding the left button down over this object) then
                    - drag == true
                    - x == the x position of the mouse relative to the upper left corner
                      of this object.
                    - y == the y position of the mouse relative to the upper left corner
                      of this object.
                - else
                    - drag == false
        !*/

    public:

        draggable(  
            drawable_window& w,
            unsigned long events = 0
        ) : 
            drawable(w,events | MOUSE_MOVE | MOUSE_CLICK),
            drag(false)
        {}

        virtual ~draggable(
        ) = 0;

        rectangle draggable_area (
        ) const { auto_mutex M(m); return area; }

        void set_draggable_area (
            const rectangle& area_ 
        ) { auto_mutex M(m); area = area_; } 

    protected:

        bool is_being_dragged (
        ) const { return drag; }

        virtual void on_drag (
        ){}

        virtual void on_drag_stop (
        ){}

        void on_mouse_move (
            unsigned long state,
            long x,
            long y
        );

        void on_mouse_down (
            unsigned long btn,
            unsigned long ,
            long x,
            long y,
            bool 
        );

        void on_mouse_up (
            unsigned long btn,
            unsigned long state,
            long x,
            long y
        );

    private:

        rectangle area;
        bool drag;
        long x, y;

        // restricted functions
        draggable(draggable&);        // copy constructor
        draggable& operator=(draggable&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class mouse_over_event 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class mouse_over_event : public drawable
    {
        /*!
            INITIAL VALUE
                - is_mouse_over_ == false

            CONVENTION
                - is_mouse_over_ == is_mouse_over()
        !*/

    public:

        mouse_over_event(  
            drawable_window& w,
            unsigned long events = 0
        ) :
            drawable(w,events | MOUSE_MOVE),
            is_mouse_over_(false)
        {}


        virtual ~mouse_over_event(
        ) = 0;

        int next_free_user_event_number() const
        {
            return drawable::next_free_user_event_number()+1;
        }

    protected:

        bool is_mouse_over (
        ) const;

        virtual void on_mouse_over (
        ){}

        virtual void on_mouse_not_over (
        ){}

        void on_mouse_leave (
        );

        void on_mouse_move (
            unsigned long state,
            long x,
            long y
        );

        void on_user_event (
            int num
        );

    private:
        mutable bool is_mouse_over_;

        // restricted functions
        mouse_over_event(mouse_over_event&);        // copy constructor
        mouse_over_event& operator=(mouse_over_event&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class button_action 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class button_action : public mouse_over_event 
    {
        /*!
            INITIAL VALUE
                - is_depressed_ == false
                - seen_click == false

            CONVENTION
                - is_depressed_ == is_depressed()
                - if (the user has clicked the button but hasn't yet released the
                      left mouse button) then
                    - seen_click == true
                - else 
                    - seen_click == false
        !*/

    public:

        button_action(  
            drawable_window& w,
            unsigned long events = 0
        ) :
            mouse_over_event(w,events | MOUSE_MOVE | MOUSE_CLICK),
            is_depressed_(false),
            seen_click(false)
        {}


        virtual ~button_action(
        ) = 0;

        int next_free_user_event_number() const
        {
            return mouse_over_event::next_free_user_event_number()+1;
        }

    protected:

        bool is_depressed (
        ) const;

        virtual void on_button_down (
        ){}

        virtual void on_button_up (
            bool 
        ){}

        void on_mouse_not_over (
        );

        void on_mouse_down (
            unsigned long btn,
            unsigned long ,
            long x,
            long y,
            bool
        );

        void on_mouse_move (
            unsigned long state,
            long x,
            long y
        );

        void on_mouse_up (
            unsigned long btn,
            unsigned long,
            long x,
            long y
        );


    private:
        mutable bool is_depressed_;
        bool seen_click;

        void on_user_event (
            int num
        );

        // restricted functions
        button_action(button_action&);        // copy constructor
        button_action& operator=(button_action&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class widget_group 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class widget_group : public drawable
    {
        /*!
            INITIAL VALUE
                widgets.size() == 0

            CONVENTION
                - widgets contains all the drawable objects and their relative positions
                  that are in *this.
                - wg_widgets contains pointers to just the widgets that happen
                  to be widget_group objects.  
        !*/

        struct relpos
        {
            unsigned long x;
            unsigned long y;
        };

    public:
        widget_group(  
            drawable_window& w
        ) : drawable(w) { rect = rectangle(0,0,-1,-1); enable_events();}

        virtual ~widget_group(
        ){ disable_events(); }

        void empty (
        );

        void add (
            drawable& widget,
            unsigned long x,
            unsigned long y
        );

        void add (
            widget_group& widget,
            unsigned long x,
            unsigned long y
        );

        bool is_member (
            const drawable& widget
        ) const;

        void remove (
            const drawable& widget
        );

        unsigned long size (
        ) const; 

        void set_pos (
            long x,
            long y
        );

        void set_z_order (
            long order
        );

        void show (
        );

        void hide (
        );

        void enable (
        );

        void disable (
        );

        void fit_to_contents (
        );

    protected:

        // this object doesn't draw anything but also isn't abstract
        void draw (
            const canvas& 
        ) const {}

    private:

        map<drawable*,relpos>::kernel_1a_c widgets;
        set<widget_group*>::kernel_1a_c wg_widgets;


        // restricted functions
        widget_group(widget_group&);        // copy constructor
        widget_group& operator=(widget_group&);    // assignment operator
    };


// ----------------------------------------------------------------------------------------

    class image_widget : public draggable
    {
        /*!
            INITIAL VALUE
                - img.size() == 0

            CONVENTION
                - img == the image this object displays
        !*/

    public:

        image_widget(  
            drawable_window& w
        ): draggable(w)  { enable_events(); }

        ~image_widget(
        )
        {
            disable_events();
            parent.invalidate_rectangle(rect); 
        }

        template <
            typename image_type
            >
        void set_image (
            const image_type& new_img
        )
        {
            auto_mutex M(m);
            assign_image_scaled(img,new_img);
            rectangle old(rect);
            rect.set_right(rect.left()+img.nc()-1); 
            rect.set_bottom(rect.top()+img.nr()-1);
            parent.invalidate_rectangle(rect+old);
        }

    private:

        void draw (
            const canvas& c
        ) const
        {
            rectangle area = rect.intersect(c);
            if (area.is_empty())
                return;

            draw_image(c, point(rect.left(),rect.top()), img);
        }

        array2d<rgb_alpha_pixel> img;

        // restricted functions
        image_widget(image_widget&);        // copy constructor
        image_widget& operator=(image_widget&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class tooltip 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class tooltip : public mouse_over_event 
    {
        /*!
            INITIAL VALUE
                - stuff.get() == 0
                - events_are_enabled() == false

            CONVENTION
                - if (events_are_enabled() == true) then
                    - stuff.get() != 0
        !*/

    public:

        tooltip(  
            drawable_window& w
        ) : 
            mouse_over_event(w,MOUSE_CLICK)
        {}

        ~tooltip(
        ){ disable_events();}

        void set_size (
            unsigned long width, 
            unsigned long height 
        )
        {
            auto_mutex M(m);
            rect = resize_rect(rect,width,height);
        }


        void set_text (
            const std::string& str
        )
        {
            set_text(convert_mbstring_to_wstring(str));
        }

        void set_text (
            const std::wstring& str
        )
        {
            set_text(convert_wstring_to_utf32(str));
        }

        void set_text (
            const ustring& str
        )
        {
            auto_mutex M(m);
            if (!stuff)
            {
                stuff.reset(new data(*this));
                enable_events();
            }

            stuff->win.set_text(str);
        }

        const std::string text (
        ) const
        {
            return convert_wstring_to_mbstring(wtext());
        }

        const std::wstring wtext (
        ) const
        {
            return convert_utf32_to_wstring(utext());
        }

        const dlib::ustring utext (
        ) const
        {
            auto_mutex M(m);
            dlib::ustring temp;
            if (stuff)
            {
                temp = stuff->win.text;
            }
            return temp.c_str();
        }

        void hide (
        )
        {
            auto_mutex M(m);
            mouse_over_event::hide();
            if (stuff)
            {
                stuff->tt_timer.stop();
                stuff->win.hide();
            }
        }

        void disable (
        )
        {
            auto_mutex M(m);
            mouse_over_event::disable();
            if (stuff)
            {
                stuff->tt_timer.stop();
                stuff->win.hide();
            }
        }

    protected:

        void on_mouse_over()
        {
            stuff->x = lastx;
            stuff->y = lasty;
            stuff->tt_timer.start();
        }

        void on_mouse_not_over ()
        {
            stuff->tt_timer.stop();
            stuff->win.hide();
        }

        void on_mouse_down (
            unsigned long btn,
            unsigned long state,
            long x,
            long y,
            bool is_double_click
        )
        {
            mouse_over_event::on_mouse_down(btn,state,x,y,is_double_click);
            stuff->tt_timer.stop();
            stuff->win.hide();
        }

        void draw (
            const canvas& 
        ) const{}

    private:

        class tooltip_window : public base_window 
        {
        public:
            tooltip_window (const shared_ptr_thread_safe<font>& f) : base_window(false,true), pad(3), mfont(f)
            {
            }

            ustring text;
            rectangle rect_all;
            rectangle rect_text;
            const unsigned long pad;
            const shared_ptr_thread_safe<font> mfont;
            
            void set_text (
                const std::string& str
            )
            {
                set_text(convert_mbstring_to_wstring(str));
            }

            void set_text (
                const std::wstring& str
            )
            {
                set_text(convert_wstring_to_utf32(str));
            }

            void set_text (
                const dlib::ustring& str
            )
            {
                text = str.c_str();

                unsigned long width, height;
                mfont->compute_size(text,width,height);

                set_size(width+pad*2, height+pad*2);
                rect_all.set_left(0);
                rect_all.set_top(0);
                rect_all.set_right(width+pad*2-1);
                rect_all.set_bottom(height+pad*2-1);

                rect_text = move_rect(rectangle(width,height),pad,pad);
            }

            void paint(const canvas& c)
            {
                c.fill(255,255,150);
                draw_rectangle(c, rect_all);
                mfont->draw_string(c,rect_text,text);
            }
        };

        void show_tooltip (
        )
        {
            auto_mutex M(m);
            long x, y;
            // if the mouse has moved since we started the timer then 
            // keep waiting until the user stops moving it
            if (lastx != stuff->x || lasty != stuff->y)
            {
                stuff->x = lastx;
                stuff->y = lasty;
                return;
            }

            unsigned long display_width, display_height;
            // stop the timer
            stuff->tt_timer.stop();
            parent.get_pos(x,y);
            x += lastx+15;
            y += lasty+15;

            // make sure the tooltip isn't going to be off the screen
            parent.get_display_size(display_width, display_height);
            rectangle wrect(move_rect(stuff->win.rect_all,x,y));
            rectangle srect(display_width, display_height); 
            if (srect.contains(wrect) == false)
            {
                rectangle temp(srect.intersect(wrect));
                x -= wrect.width()-temp.width();
                y -= wrect.height()-temp.height();
            }

            stuff->win.set_pos(x,y);
            stuff->win.show();
        }

        // put all this stuff in data so we can arrange to only
        // construct it when someone is actually using the tooltip widget 
        // rather than just instantiating it.
        struct data
        {
            data(
                tooltip& self
            ) : 
                x(-1), 
                y(-1),
                win(self.mfont),
                tt_timer(self,&tooltip::show_tooltip) 
            { 
                tt_timer.set_delay_time(400); 
            }

            long x, y;
            tooltip_window win;
            timer<tooltip> tt_timer;

        };
        friend struct data;
        scoped_ptr<data> stuff;



        // restricted functions
        tooltip(tooltip&);        // copy constructor
        tooltip& operator=(tooltip&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class button  
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class button : public button_action 
    {
    public:
        button(
            drawable_window& w
        ) : 
            button_action(w),
            btn_tooltip(w)
        {
            style.reset(new button_style_default());
            enable_events();
        }
        
        ~button() { disable_events(); parent.invalidate_rectangle(style->get_invalidation_rect(rect)); }

        void set_size (
            unsigned long width,
            unsigned long height
        );

        void set_name (
            const std::string& name_
        );

        void set_name (
            const std::wstring& name_
        );

        void set_name (
            const dlib::ustring& name_
        );

        const std::string name (
        ) const;

        const std::wstring wname (
        ) const;

        const dlib::ustring uname (
        ) const;

        void set_tooltip_text (
            const std::string& text
        );

        void set_tooltip_text (
            const std::wstring& text
        );

        void set_tooltip_text (
            const dlib::ustring& text
        );

        void set_pos(
            long x,
            long y
        );

        const std::string tooltip_text (
        ) const;

        const std::wstring tooltip_wtext (
        ) const;

        const dlib::ustring tooltip_utext (
        ) const;

        void set_main_font (
            const shared_ptr_thread_safe<font>& f
        );

        void show (
        );

        void hide (
        );

        void enable (
        );

        void disable (
        );

        template <
            typename style_type
            >
        void set_style (
            const style_type& style_
        )
        {
            auto_mutex M(m);
            style.reset(new style_type(style_));
            rect = move_rect(style->get_min_size(name_,*mfont), rect.left(), rect.top());
            parent.invalidate_rectangle(style->get_invalidation_rect(rect));
        }

        template <
            typename T
            >
        void set_click_handler (
            T& object,
            void (T::*event_handler_)()
        )
        {
            auto_mutex M(m);
            event_handler = make_mfp(object,event_handler_);
            event_handler_self.clear();
        }

        void set_click_handler (
            const any_function<void()>& event_handler_
        )
        {
            auto_mutex M(m);
            event_handler = event_handler_;
            event_handler_self.clear();
        }

        template <
            typename T
            >
        void set_click_handler (
            T& object,
            void (T::*event_handler_)(button&)
        )
        {
            auto_mutex M(m);
            event_handler_self = make_mfp(object,event_handler_);
            event_handler.clear();
        }

        void set_sourced_click_handler (
            const any_function<void(button&)>& event_handler_
        )
        {
            auto_mutex M(m);
            event_handler_self = event_handler_;
            event_handler.clear();
        }

        bool is_depressed (
        ) const
        {
            auto_mutex M(m);
            return button_action::is_depressed();
        }

        template <
            typename T
            >
        void set_button_down_handler (
            T& object,
            void (T::*event_handler)()
        )
        {
            auto_mutex M(m);
            button_down_handler = make_mfp(object,event_handler);
        }

        void set_button_down_handler (
            const any_function<void()>& event_handler
        )
        {
            auto_mutex M(m);
            button_down_handler = event_handler;
        }

        template <
            typename T
            >
        void set_button_up_handler (
            T& object,
            void (T::*event_handler)(bool mouse_over)
        )
        {
            auto_mutex M(m);
            button_up_handler = make_mfp(object,event_handler);
        }

        void set_button_up_handler (
            const any_function<void(bool)>& event_handler
        )
        {
            auto_mutex M(m);
            button_up_handler = event_handler;
        }

        template <
            typename T
            >
        void set_button_down_handler (
            T& object,
            void (T::*event_handler)(button&)
        )
        {
            auto_mutex M(m);
            button_down_handler_self = make_mfp(object,event_handler);
        }

        void set_sourced_button_down_handler (
            const any_function<void(button&)>& event_handler
        )
        {
            auto_mutex M(m);
            button_down_handler_self = event_handler;
        }

        template <
            typename T
            >
        void set_button_up_handler (
            T& object,
            void (T::*event_handler)(bool mouse_over, button&)
        )
        {
            auto_mutex M(m);
            button_up_handler_self = make_mfp(object,event_handler);
        }

        void set_sourced_button_up_handler (
            const any_function<void(bool,button&)>& event_handler
        )
        {
            auto_mutex M(m);
            button_up_handler_self = event_handler;
        }

    private:

        // restricted functions
        button(button&);        // copy constructor
        button& operator=(button&);    // assignment operator

        dlib::ustring name_;
        tooltip btn_tooltip;

        any_function<void()> event_handler;
        any_function<void(button&)> event_handler_self;
        any_function<void()> button_down_handler;
        any_function<void(bool)> button_up_handler;
        any_function<void(button&)> button_down_handler_self;
        any_function<void(bool,button&)> button_up_handler_self;

        scoped_ptr<button_style> style;

    protected:

        void draw (
            const canvas& c
        ) const { style->draw_button(c,rect,enabled,*mfont,lastx,lasty,name_,is_depressed()); }

        void on_button_up (
            bool mouse_over
        );

        void on_button_down (
        );

        void on_mouse_over (
        ){ if (style->redraw_on_mouse_over()) parent.invalidate_rectangle(style->get_invalidation_rect(rect)); }

        void on_mouse_not_over (
        ){ if (style->redraw_on_mouse_over()) parent.invalidate_rectangle(style->get_invalidation_rect(rect)); }
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class scroll_bar 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class scroll_bar : public drawable 
    {
        /*!
            INITIAL VALUE
                - ori == a value given by the constructor
                - style == a scroll_bar_style_default object
                - pos == 0
                - max_pos == 0
                - js == 10

            CONVENTION
                - ori == orientation()
                - b1 == the button that is near the 0 end of the scroll bar
                - b2 == the button that is near the max_pos() end of the scroll bar

                - max_pos == max_slider_pos()
                - pos == slider_pos()
                - js == jump_size()
        !*/

    public:
        enum bar_orientation 
        {
            HORIZONTAL,
            VERTICAL
        };

        scroll_bar(  
            drawable_window& w,
            bar_orientation orientation_
        );

        virtual ~scroll_bar(
        );

        bar_orientation orientation (
        ) const;

        void set_length (
            unsigned long length
        );

        long max_slider_pos (
        ) const;

        void set_max_slider_pos (
            long mpos
        );

        void set_slider_pos (
            long pos
        );

        long slider_pos (
        ) const;

        template <
            typename T
            >
        void set_scroll_handler (
            T& object,
            void (T::*eh)()
        ) { auto_mutex M(m); scroll_handler = make_mfp(object,eh); }

        void set_scroll_handler (
            const any_function<void()>& eh
        ) { auto_mutex M(m); scroll_handler = eh; }

        void set_pos (
            long x,
            long y
        );

        void enable (
        )
        {
            auto_mutex M(m);
            if (!hidden)
                show_slider();
            if (max_pos != 0)
            {
                b1.enable();
                b2.enable();
            }
            drawable::enable();
        }

        void disable (
        )
        {
            auto_mutex M(m);
            hide_slider();
            b1.disable();
            b2.disable();
            drawable::disable();
        }
            
        void hide (
        )
        {
            auto_mutex M(m);
            hide_slider();
            top_filler.hide();
            bottom_filler.hide();
            b1.hide();
            b2.hide();
            drawable::hide();
        }
            
        void show (
        )
        {
            auto_mutex M(m);
            b1.show();
            b2.show();
            drawable::show();
            top_filler.show();
            if (enabled)
                show_slider();
        }

        void set_z_order (
            long order
        )
        {
            auto_mutex M(m);
            slider.set_z_order(order);
            top_filler.set_z_order(order);
            bottom_filler.set_z_order(order);
            b1.set_z_order(order);
            b2.set_z_order(order);
            drawable::set_z_order(order);
        }

        void set_jump_size (
            long js
        );

        long jump_size (
        ) const;

        template <
            typename style_type
            >
        void set_style (
            const style_type& style_
        )
        {
            auto_mutex M(m);
            style.reset(new style_type(style_));

            if (ori == HORIZONTAL)
            {
                b1.set_style(style_.get_left_button_style());
                b2.set_style(style_.get_right_button_style());
                set_length(rect.width());
            }
            else
            {
                b1.set_style(style_.get_up_button_style());
                b2.set_style(style_.get_down_button_style());
                set_length(rect.height());
            }

        }

    private:

        void hide_slider (
        );
        /*!
            ensures
                - hides the slider and makes any other changes needed so that the
                  scroll_bar still looks right.
        !*/

        void show_slider (
        );
        /*!
            ensures
                - shows the slider and makes any other changes needed so that the
                  scroll_bar still looks right.
        !*/


        void on_slider_drag (
        ); 
        /*!
            requires
                - is called whenever the user drags the slider
        !*/

        void draw (
            const canvas& c
        ) const;

        void b1_down (
        );

        void b1_up (
            bool mouse_over
        );

        void b2_down (
        );

        void b2_up (
            bool mouse_over
        );

        void top_filler_down (
        );

        void top_filler_up (
            bool mouse_over
        );

        void bottom_filler_down (
        );

        void bottom_filler_up (
            bool mouse_over
        );

        void on_user_event (
            int i
        );

        void delayed_set_slider_pos (
            unsigned long dpos
        );

        void b1_down_t (
        );

        void b2_down_t (
        );

        void top_filler_down_t (
        );

        void bottom_filler_down_t (
        );

        friend class filler;
        class filler : public button_action
        {
            friend class scroll_bar;
        public:
            filler (
                drawable_window& w,
                scroll_bar& object,
                void (scroll_bar::*down)(),
                void (scroll_bar::*up)(bool)
            ):
                button_action(w),
                my_scroll_bar(object)
            {
                bup = make_mfp(object,up);
                bdown = make_mfp(object,down);

                enable_events();
            }

            ~filler (
            )
            {
               disable_events();
            }

            void set_size (
                unsigned long width,
                unsigned long height
            )
            {
                rectangle old(rect);
                const unsigned long x = rect.left();
                const unsigned long y = rect.top();
                rect.set_right(x+width-1);
                rect.set_bottom(y+height-1);

                parent.invalidate_rectangle(rect+old);
            }

        private:

            void draw (
                const canvas& c
            ) const
            {
                my_scroll_bar.style->draw_scroll_bar_background(c,rect,enabled,lastx,lasty,is_depressed());
            }

            void on_button_down (
            ) { bdown(); } 

            void on_button_up (
                bool mouse_over
            ) { bup(mouse_over); } 

            scroll_bar& my_scroll_bar;
            any_function<void()> bdown;
            any_function<void(bool)> bup;
        };

        friend class slider_class;
        class slider_class : public draggable
        {
            friend class scroll_bar;
        public:
            slider_class ( 
                drawable_window& w,
                scroll_bar& object,
                void (scroll_bar::*handler)()
            ) :
                draggable(w, MOUSE_MOVE),
                mouse_in_widget(false),
                my_scroll_bar(object)
            {
                callback = make_mfp(object,handler);
                enable_events();
            }

            ~slider_class (
            )
            {
               disable_events();
            }

            void set_size (
                unsigned long width,
                unsigned long height
            )
            {
                rectangle old(rect);
                const unsigned long x = rect.left();
                const unsigned long y = rect.top();
                rect.set_right(x+width-1);
                rect.set_bottom(y+height-1);

                parent.invalidate_rectangle(rect+old);
            }

        private:
            virtual void on_mouse_move (
                unsigned long state,
                long x,
                long y
            )
            {
                draggable::on_mouse_move(state,x,y);
                if (!hidden && my_scroll_bar.style->redraw_on_mouse_over_slider())
                {
                    if (rect.contains(x,y) && !mouse_in_widget)
                    {
                        mouse_in_widget = true;
                        parent.invalidate_rectangle(rect);
                    }
                    else if (rect.contains(x,y) == false && mouse_in_widget)
                    {
                        mouse_in_widget = false;
                        parent.invalidate_rectangle(rect);
                    }
                }
            }

            void on_mouse_leave (
            )
            {
                if (mouse_in_widget && my_scroll_bar.style->redraw_on_mouse_over_slider())
                {
                    mouse_in_widget = false;
                    parent.invalidate_rectangle(rect);
                }
            }

            void on_drag_stop (
            ) 
            {
                if (my_scroll_bar.style->redraw_on_mouse_over_slider())
                    parent.invalidate_rectangle(rect);
            }

            void on_drag (
            )
            {
                callback();
            }

            void draw (
                const canvas& c
            ) const
            {
                my_scroll_bar.style->draw_scroll_bar_slider(c,rect,enabled,lastx,lasty, is_being_dragged());
            }

            bool mouse_in_widget;
            scroll_bar& my_scroll_bar;
            any_function<void()> callback;
        };


        void adjust_fillers (
        );
        /*!
            ensures
                - top_filler and bottom_filler appear in their correct positions
                  relative to the current positions of the slider and the b1 and
                  b2 buttons
        !*/

        unsigned long get_slider_size (
        ) const;
        /*!
            ensures
                - returns the length in pixels the slider should have based on the current
                  state of this scroll bar
        !*/


        button b1, b2;
        slider_class slider;
        bar_orientation ori; 
        filler top_filler, bottom_filler;
        any_function<void()> scroll_handler;

        long pos;
        long max_pos; 
        long js;

        timer<scroll_bar> b1_timer;
        timer<scroll_bar> b2_timer;
        timer<scroll_bar> top_filler_timer;
        timer<scroll_bar> bottom_filler_timer;
        long delayed_pos;
        scoped_ptr<scroll_bar_style> style;

        // restricted functions
        scroll_bar(scroll_bar&);        // copy constructor
        scroll_bar& operator=(scroll_bar&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class popup_menu 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class menu_item
    {
    public:
        virtual ~menu_item() {}

        virtual rectangle get_left_size (
        ) const { return rectangle(); }
        virtual rectangle get_middle_size (
        ) const = 0; 
        virtual rectangle get_right_size (
        ) const { return rectangle(); }

        virtual unichar get_hot_key (
        ) const { return 0; }

        virtual void draw_background (
            const canvas& ,
            const rectangle& ,
            const bool ,
            const bool 
        ) const {}

        virtual void draw_left (
            const canvas& ,
            const rectangle& ,
            const bool ,
            const bool 
        ) const {}

        virtual void draw_middle (
            const canvas& ,
            const rectangle& ,
            const bool ,
            const bool 
        ) const = 0;

        virtual void draw_right (
            const canvas& ,
            const rectangle& ,
            const bool ,
            const bool 
        ) const {}

        virtual void on_click (
        ) const {}

        virtual bool has_click_event (
        ) const { return false; }

    };

// ----------------------------------------------------------------------------------------

    class menu_item_submenu : public menu_item
    {
        void initialize (
            unichar hk
        )
        {
            const dlib::ustring &str = text;
            if (hk != 0)
            {
                std::string::size_type pos = str.find_first_of(hk);
                if (pos != std::string::npos)
                {
                    // now compute the location of the underline bar
                    rectangle r1 = f->compute_cursor_rect( rectangle(100000,100000), str, pos);
                    rectangle r2 = f->compute_cursor_rect( rectangle(100000,100000), str, pos+1);

                    underline_p1.x() = r1.left()+1;
                    underline_p2.x() = r2.left()-1;
                    underline_p1.y() = r1.bottom()-f->height()+f->ascender()+2;
                    underline_p2.y() = r2.bottom()-f->height()+f->ascender()+2;
                }
            }
        }
    public:
        menu_item_submenu (
            const std::string& str,
            unichar hk = 0
        ) : 
            text(convert_wstring_to_utf32(convert_mbstring_to_wstring(str))),
            f(default_font::get_font()),
            hotkey(hk)
        {
            initialize(hk);
        }

        menu_item_submenu (
            const std::wstring& str,
            unichar hk = 0
        ) : 
            text(convert_wstring_to_utf32(str)),
            f(default_font::get_font()),
            hotkey(hk)
        {
            initialize(hk);
        }

        menu_item_submenu (
            const dlib::ustring& str,
            unichar hk = 0
        ) : 
            text(str),
            f(default_font::get_font()),
            hotkey(hk)
        {
            initialize(hk);
        }

        virtual unichar get_hot_key (
        ) const { return hotkey; }

        virtual rectangle get_middle_size (
        ) const  
        {
            unsigned long width, height;
            f->compute_size(text,width,height);
            return rectangle(width+30,height);
        }

        virtual rectangle get_right_size (
        ) const  
        {
            return rectangle(15, 5);
        }

        virtual void draw_background (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const bool is_selected
        ) const 
        {
            if (c.intersect(rect).is_empty())
                return;

            if (enabled && is_selected)
            {
                fill_rect_with_vertical_gradient(c, rect,rgb_alpha_pixel(0,200,0,100), rgb_alpha_pixel(0,0,0,100));
                draw_rectangle(c, rect,rgb_alpha_pixel(0,0,0,100));
            }
        }

        virtual void draw_right (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const bool 
        ) const 
        {
            if (c.intersect(rect).is_empty())
                return;

            unsigned char color = 0;

            if (enabled == false)
                color = 128;

            long x, y;
            x = rect.right() - 7;
            y = rect.top() + rect.height()/2;

            for ( unsigned long i = 0; i < 5; ++i)
                draw_line (c, point(x - i, y + i), point(x - i, y - i), color);
        }

        virtual void draw_middle (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const bool 
        ) const 
        {
            if (c.intersect(rect).is_empty())
                return;

            if (enabled)
            {
                f->draw_string(c,rect,text);
            }
            else
            {
                f->draw_string(c,rect,text,128);
            }

            if (underline_p1 != underline_p2)
            {
                point base(rect.left(),rect.top());
                draw_line(c, base+underline_p1, base+underline_p2);
            }
        }

    private:
        dlib::ustring text;
        const shared_ptr_thread_safe<font> f;
        any_function<void()> action;
        unichar hotkey;
        point underline_p1;
        point underline_p2;
    };

// ----------------------------------------------------------------------------------------

    class menu_item_text : public menu_item
    {
        void initialize (
            const any_function<void()>& event_handler_,
            unichar hk
        )
        {
            dlib::ustring &str = text;
            action = event_handler_;

            if (hk != 0)
            {
                std::string::size_type pos = str.find_first_of(hk);
                if (pos != std::string::npos)
                {
                    // now compute the location of the underline bar
                    rectangle r1 = f->compute_cursor_rect( rectangle(100000,100000), str, pos);
                    rectangle r2 = f->compute_cursor_rect( rectangle(100000,100000), str, pos+1);

                    underline_p1.x() = r1.left()+1;
                    underline_p2.x() = r2.left()-1;
                    underline_p1.y() = r1.bottom()-f->height()+f->ascender()+2;
                    underline_p2.y() = r2.bottom()-f->height()+f->ascender()+2;
                }
            }
        }

    public:
        template <typename T>
        menu_item_text (
            const std::string& str,
            T& object,
            void (T::*event_handler_)(),
            unichar hk = 0
        ) : 
            text(convert_wstring_to_utf32(convert_mbstring_to_wstring(str))),
            f(default_font::get_font()),
            hotkey(hk)
        {
            initialize(make_mfp(object, event_handler_), hk);
        }

        menu_item_text (
            const std::string& str,
            const any_function<void()>& event_handler_,
            unichar hk = 0
        ) : 
            text(convert_wstring_to_utf32(convert_mbstring_to_wstring(str))),
            f(default_font::get_font()),
            hotkey(hk)
        {
            initialize(event_handler_, hk);
        }

        template <typename T>
        menu_item_text (
            const std::wstring& str,
            T& object,
            void (T::*event_handler_)(),
            unichar hk = 0
        ) : 
            text(convert_wstring_to_utf32(str)),
            f(default_font::get_font()),
            hotkey(hk)
        {
            initialize(make_mfp(object, event_handler_), hk);
        }

        menu_item_text (
            const std::wstring& str,
            const any_function<void()>& event_handler_,
            unichar hk = 0
        ) : 
            text(convert_wstring_to_utf32(str)),
            f(default_font::get_font()),
            hotkey(hk)
        {
            initialize(event_handler_, hk);
        }

        template <typename T>
        menu_item_text (
            const dlib::ustring& str,
            T& object,
            void (T::*event_handler_)(),
            unichar hk = 0
        ) : 
            text(str),
            f(default_font::get_font()),
            hotkey(hk)
        {
            initialize(make_mfp(object, event_handler_), hk);
        }

        menu_item_text (
            const dlib::ustring& str,
            const any_function<void()>& event_handler_,
            unichar hk = 0
        ) : 
            text(str),
            f(default_font::get_font()),
            hotkey(hk)
        {
            initialize(event_handler_, hk);
        }

        virtual unichar get_hot_key (
        ) const { return hotkey; }

        virtual rectangle get_middle_size (
        ) const  
        {
            unsigned long width, height;
            f->compute_size(text,width,height);
            return rectangle(width,height);
        }

        virtual void draw_background (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const bool is_selected
        ) const 
        {
            if (c.intersect(rect).is_empty())
                return;

            if (enabled && is_selected)
            {
                fill_rect_with_vertical_gradient(c, rect,rgb_alpha_pixel(0,200,0,100), rgb_alpha_pixel(0,0,0,100));
                draw_rectangle(c, rect,rgb_alpha_pixel(0,0,0,100));
            }
        }

        virtual void draw_middle (
            const canvas& c,
            const rectangle& rect,
            const bool enabled,
            const bool 
        ) const 
        {
            if (c.intersect(rect).is_empty())
                return;

            unsigned char color = 0;

            if (enabled == false)
                color = 128;

            f->draw_string(c,rect,text,color);

            if (underline_p1 != underline_p2)
            {
                point base(rect.left(),rect.top());
                draw_line(c, base+underline_p1, base+underline_p2, color);
            }
        }

        virtual void on_click (
        ) const 
        {
            action();
        }

        virtual bool has_click_event (
        ) const { return true; }

    private:
        dlib::ustring text;
        const shared_ptr_thread_safe<font> f;
        any_function<void()> action;
        unichar hotkey;
        point underline_p1;
        point underline_p2;
    };

// ----------------------------------------------------------------------------------------

    class menu_item_separator : public menu_item
    {
    public:
        virtual rectangle get_middle_size (
        ) const  
        {
            return rectangle(10,4);
        }

        virtual void draw_background (
            const canvas& c,
            const rectangle& rect,
            const bool ,
            const bool 
        ) const 
        {
            if (c.intersect(rect).is_empty())
                return;

            point p1(rect.left(),rect.top()+rect.height()/2-1);
            point p2(rect.right(),rect.top()+rect.height()/2-1);

            point p3(rect.left(),rect.top()+rect.height()/2);
            point p4(rect.right(),rect.top()+rect.height()/2);
            draw_line(c, p1,p2,128);
            draw_line(c, p3,p4,255);
        }

        virtual void draw_middle (
            const canvas& ,
            const rectangle& ,
            const bool ,
            const bool 
        ) const 
        {
        }
    };

// ----------------------------------------------------------------------------------------

    class popup_menu : public base_window
    {
        /*!
            INITIAL VALUE
                - pad == 2
                - item_pad == 3
                - cur_rect == rectangle(pad,pad,pad-1,pad-1)
                - left_width == 0
                - middle_width == 0
                - selected_item == 0 
                - submenu_open == false
                - items.size() == 0
                - item_enabled.size() == 0
                - left_rects.size() == 0
                - middle_rects.size() == 0
                - right_rects.size() == 0
                - line_rects.size() == 0
                - submenus.size() == 0
                - hide_handlers.size() == 0

            CONVENTION
                - pad = 2
                - item_pad = 3
                - all of the following arrays have the same size:
                    - items.size() 
                    - item_enabled.size() 
                    - left_rects.size() 
                    - middle_rects.size() 
                    - right_rects.size() 
                    - line_rects.size() 
                    - submenus.size() 

                - win_rect == a rectangle that is the exact size of this window and with
                  its upper left corner at (0,0)
                - cur_rect == the rect inside which all the menu items are drawn

                - if (a menu_item is supposed to be selected) then
                    - selected_item == the index in menus of the menu_item
                - else
                    - selected_item == submenus.size()

                - if (there is a selected submenu and it is currently open) then
                    - submenu_open == true
                - else 
                    - submenu_open == false

                - for all valid i:
                    - items[i] == a pointer to the ith menu_item
                    - item_enabled[i] == true if the ith menu_item is enabled, false otherwise
                    - left_rects[i] == the left rectangle for the ith menu item
                    - middle_rects[i] == the middle rectangle for the ith menu item
                    - right_rects[i] == the right rectangle for the ith menu item
                    - line_rects[i] == the rectangle for the entire line on which the ith menu
                      item appears. 
                    - if (submenus[i] != 0) then
                        - the ith menu item has a submenu and it is pointed to by submenus[i]

                - hide_handlers == an array of all the on_hide events registered for
                  this popup_menu
        !*/

    public:

        popup_menu (
        );

        template <
            typename menu_item_type
            >
        unsigned long add_menu_item (
            const menu_item_type& new_item
        )
        {
            auto_mutex M(wm);
            bool t = true;
            scoped_ptr<menu_item> item(new menu_item_type(new_item));
            items.push_back(item);
            item_enabled.push_back(t);

            // figure out how big the window should be now and what not
            rectangle left = new_item.get_left_size();
            rectangle middle = new_item.get_middle_size();
            rectangle right = new_item.get_right_size();

            bool recalc_rect_positions = false;
            const rectangle all = left+middle+right;


            // make sure left_width contains the max of all the left rectangles
            if (left.width() > left_width)
            {
                left_width = left.width();
                recalc_rect_positions = true;
            }
            // make sure middle_width contains the max of all the middle rectangles
            if (middle.width() > middle_width)
            {
                middle_width = middle.width();
                recalc_rect_positions = true;
            }

            // make the current rectangle wider if necessary
            if (cur_rect.width() < left_width + middle_width + right.width() + 2*item_pad)
            {
                cur_rect = resize_rect_width(cur_rect, left_width + middle_width + right.width() + 2*item_pad);
                recalc_rect_positions = true;
            }

            const long y = cur_rect.bottom()+1 + item_pad;
            const long x = cur_rect.left() + item_pad;

            // make the current rectangle taller to account for this new menu item
            cur_rect.set_bottom(cur_rect.bottom()+all.height() + 2*item_pad);

            // adjust all the saved rectangles since the width of the window changed
            // or left_width changed
            if (recalc_rect_positions)
            {
                long y = cur_rect.top() + item_pad;
                for (unsigned long i = 0; i < left_rects.size(); ++i)
                {
                    middle_rects[i] = move_rect(middle_rects[i], x+left_width, y);
                    right_rects[i] = move_rect(right_rects[i], x+cur_rect.width()-right_rects[i].width()-item_pad, y);
                    line_rects[i] = resize_rect_width(line_rects[i], cur_rect.width());

                    y += line_rects[i].height();
                }
            }

            // save the rectangles for later use.  Also position them at the
            // right spots
            left = move_rect(left,x,y);
            middle = move_rect(middle,x+left_width,y);
            right = move_rect(right,x+cur_rect.width()-right.width()-item_pad,y);
            rectangle line(move_rect(rectangle(cur_rect.width(),all.height()+2*item_pad), x-item_pad, y-item_pad));

            // make sure the left, middle, and right rectangles are centered in the
            // line. 
            if (left.height() < all.height())
                left = translate_rect(left,0, (all.height()-left.height())/2);
            if (middle.height() < all.height())
                middle = translate_rect(middle,0, (all.height()-middle.height())/2);
            if (right.height() < all.height())
                right = translate_rect(right,0, (all.height()-right.height())/2);

            left_rects.push_back(left);
            middle_rects.push_back(middle);
            right_rects.push_back(right);
            line_rects.push_back(line);

            popup_menu* junk = 0;
            submenus.push_back(junk);

            win_rect.set_right(cur_rect.right()+pad);
            win_rect.set_bottom(cur_rect.bottom()+pad);
            set_size(win_rect.width(),win_rect.height());

            // make it so that nothing is selected
            selected_item = submenus.size();

            return items.size()-1;
        }
        
        template <
            typename menu_item_type
            >
        unsigned long add_submenu (
            const menu_item_type& new_item,
            popup_menu& submenu
        )
        {
            auto_mutex M(wm);

            submenus[add_menu_item(new_item)] = &submenu;

            submenu.set_on_hide_handler(*this,&popup_menu::on_submenu_hide);

            return items.size()-1;
        }

        void enable_menu_item (
            unsigned long idx
        );

        void disable_menu_item (
            unsigned long idx
        );

        unsigned long size (
        ) const;

        void clear (
        );
        
        void show (
        );

        void hide (
        );

        template <typename T>
        void set_on_hide_handler (
            T& object,
            void (T::*event_handler)()
        )
        {
            auto_mutex M(wm);

            member_function_pointer<> temp;
            temp.set(object,event_handler);

            // if this handler isn't already registered then add it
            bool found_handler = false;
            for (unsigned long i = 0; i < hide_handlers.size(); ++i)
            {
                if (hide_handlers[i] == temp)
                {
                    found_handler = true;
                    break;
                }
            }

            if (found_handler == false)
            {
                hide_handlers.push_back(temp);
            }
        }

        void select_first_item (
        );

        bool forwarded_on_keydown (
            unsigned long key,
            bool is_printable,
            unsigned long state
        );

    private:

        void on_submenu_hide (
        );

        void on_window_resized(
        );

        void on_mouse_up (
            unsigned long btn,
            unsigned long,
            long x,
            long y
        );

        void on_mouse_move (
            unsigned long state,
            long x,
            long y
        );

        void close_submenu (
        );

        bool display_selected_submenu (
        );
        /*!
            ensures
                - if (submenus[selected_item] isn't null) then
                    - displays the selected submenu
                    - returns true
                - else
                    - returns false
        !*/

        void on_mouse_leave (
        );

        void paint (
            const canvas& c
        );

        const long pad;
        const long item_pad;
        rectangle cur_rect; 
        rectangle win_rect; 
        unsigned long left_width;    
        unsigned long middle_width;    
        array<scoped_ptr<menu_item> > items;
        array<bool> item_enabled;
        array<rectangle> left_rects;
        array<rectangle> middle_rects;
        array<rectangle> right_rects;
        array<rectangle> line_rects;
        array<popup_menu*> submenus;
        unsigned long selected_item;
        bool submenu_open;
        array<member_function_pointer<> > hide_handlers;

        // restricted functions
        popup_menu(popup_menu&);        // copy constructor
        popup_menu& operator=(popup_menu&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

    class zoomable_region : public drawable 
    {
        /*!
            INITIAL VALUE
                - min_scale == 0.15
                - max_scale == 1.0
                - zoom_increment_ == 0.02
                - scale == 1.0
                - mouse_drag_screen == false


            CONVENTION
                - zoom_increment() == zoom_increment_
                - min_zoom_scale() == min_scale
                - max_zoom_scale() == max_scale
                - zoom_scale() == scale
                - if (the user is currently dragging the graph around via the mouse) then 
                    - mouse_drag_screen == true
                - else
                    - mouse_drag_screen == false 

                - max_graph_point() == lr_point
                - display_rect() == display_rect_
                - gui_to_graph_space(point(display_rect.left(),display_rect.top())) == gr_orig
        !*/

    public:

        zoomable_region (
            drawable_window& w,
            unsigned long events = 0
        );

        virtual ~zoomable_region (
        )= 0;

        virtual void set_pos (
            long x,
            long y
        );

        template <
            typename style_type
            >
        void set_style (
            const style_type& style_
        )
        {
            auto_mutex M(m);
            style.reset(new style_type(style_));
            hsb.set_style(style_.get_horizontal_scroll_bar_style());
            vsb.set_style(style_.get_vertical_scroll_bar_style());

            // do this just so that everything gets redrawn right
            set_size(rect.width(), rect.height());
        }

        void set_zoom_increment (
            double zi
        );

        double zoom_increment (
        ) const;

        void set_max_zoom_scale (
            double ms 
        );

        void set_min_zoom_scale (
            double ms 
        );

        double min_zoom_scale (
        ) const;

        double max_zoom_scale (
        ) const;

        virtual void set_size (
            unsigned long width,
            unsigned long height
        );

        void show (
        );

        void hide (
        );

        void enable (
        );

        void disable (
        );

        void set_z_order (
            long order
        );

    protected:

        virtual void on_view_changed () {}

        point graph_to_gui_space (
            const vector<double,2>& p
        ) const;

        vector<double,2> gui_to_graph_space (
            const point& p
        ) const;

        point max_graph_point (
        ) const;

        rectangle display_rect (
        ) const;

        double zoom_scale (
        ) const;

        void set_zoom_scale (
            double new_scale
        );

        void center_display_at_graph_point (
            const vector<double,2>& p
        );

    // ----------- event handlers ---------------

        void on_wheel_down (
            unsigned long state
        );

        void on_wheel_up (
            unsigned long state
        );

        void on_mouse_move (
            unsigned long state,
            long x,
            long y
        );

        void on_mouse_up (
            unsigned long btn,
            unsigned long state,
            long x,
            long y
        );

        void on_mouse_down (
            unsigned long btn,
            unsigned long state,
            long x,
            long y,
            bool is_double_click
        );

        void draw (
            const canvas& c
        ) const;

    private:

        void on_h_scroll (
        );

        void on_v_scroll (
        );

        void redraw_graph (
        );

        void adjust_origin (
            const point& gui_p,
            const vector<double,2>& graph_p
        );
        /*!
            ensures
                - adjusts gr_orig so that we are as close to the following as possible:
                    - graph_to_gui_space(graph_p) == gui_p
                    - gui_to_graph_space(gui_p) == graph_p
        !*/


        vector<double,2> gr_orig; // point in graph space such that it's gui space point is the upper left of display_rect_
        vector<double,2> lr_point; // point in graph space such that it is at the lower right corner of the screen at max zoom

        mutable std::ostringstream sout;

        double scale; // 0 < scale <= 1
        double min_scale;
        double max_scale;
        double zoom_increment_;
        rectangle display_rect_;

        bool mouse_drag_screen;  // true if the user is dragging the white background area
        vector<double,2> drag_screen_point; // the starting point the mouse was at in graph space for the background area drag

        scroll_bar vsb;
        scroll_bar hsb;

        scoped_ptr<scrollable_region_style> style;

        // restricted functions
        zoomable_region(zoomable_region&);        // copy constructor
        zoomable_region& operator=(zoomable_region&);    // assignment operator

    };

// ----------------------------------------------------------------------------------------

    class scrollable_region : public drawable 
    {
        /*!
            INITIAL VALUE
                - hscroll_bar_inc == 1
                - vscroll_bar_inc == 1
                - h_wheel_scroll_bar_inc == 1
                - v_wheel_scroll_bar_inc == 1
                - mouse_drag_enabled_ == false
                - user_is_dragging_mouse == false

            CONVENTION
                - mouse_drag_enabled() == mouse_drag_enabled_
                - horizontal_scroll_increment() == hscroll_bar_inc
                - vertical_scroll_increment() == vscroll_bar_inc
                - horizontal_mouse_wheel_scroll_increment() == h_wheel_scroll_bar_inc
                - vertical_mouse_wheel_scroll_increment() == v_wheel_scroll_bar_inc
                - vertical_scroll_pos() == vsb.slider_pos()
                - horizontal_scroll_pos() == hsb.slider_pos()
                - total_rect() == total_rect_
                - display_rect() == display_rect_

                - if (the user is currently dragging the total_rect around with a mouse drag) then
                    - user_is_dragging_mouse == true
                    - drag_origin == the point the mouse was at, with respect to total_rect, 
                      when the dragging started
                - else
                    - user_is_dragging_mouse == false 
        !*/

    public:

        scrollable_region (
            drawable_window& w,
            unsigned long events = 0
        );

        virtual ~scrollable_region (
        ) = 0;

        template <
            typename style_type
            >
        void set_style (
            const style_type& style_
        )
        {
            auto_mutex M(m);
            style.reset(new style_type(style_));
            hsb.set_style(style_.get_horizontal_scroll_bar_style());
            vsb.set_style(style_.get_vertical_scroll_bar_style());

            // do this just so that everything gets redrawn right
            set_size(rect.width(), rect.height());
        }

        void show (
        );

        void hide (
        );

        void enable (
        );

        void disable (
        );

        void set_z_order (
            long order
        );

        virtual void set_size (
            unsigned long width,
            unsigned long height
        );

        unsigned long horizontal_mouse_wheel_scroll_increment (
        ) const;

        unsigned long vertical_mouse_wheel_scroll_increment (
        ) const;

        void set_horizontal_mouse_wheel_scroll_increment (
            unsigned long inc
        );

        void set_vertical_mouse_wheel_scroll_increment (
            unsigned long inc
        );

        unsigned long horizontal_scroll_increment (
        ) const;

        unsigned long vertical_scroll_increment (
        ) const;

        void set_horizontal_scroll_increment (
            unsigned long inc
        );

        void set_vertical_scroll_increment (
            unsigned long inc
        );

        long horizontal_scroll_pos (
        ) const;

        long vertical_scroll_pos (
        ) const;

        void set_horizontal_scroll_pos (
            long pos
        );

        void set_vertical_scroll_pos (
            long pos
        );

        virtual void set_pos (
            long x,
            long y
        );

        bool mouse_drag_enabled (
        ) const;

        void enable_mouse_drag (
        );

        void disable_mouse_drag (
        );

    protected:

        virtual void on_view_changed () {}

        const rectangle& display_rect (
        ) const;

        void set_total_rect_size (
            unsigned long width,
            unsigned long height
        );

        const rectangle& total_rect (
        ) const;

        void scroll_to_rect (
            const rectangle& r_
        );

        void on_wheel_down (
            unsigned long state
        );

        void on_mouse_move (
            unsigned long state,
            long x,
            long y
        );

        void on_mouse_down (
            unsigned long btn,
            unsigned long state,
            long x,
            long y,
            bool is_double_click
        );

        void on_mouse_up   (
            unsigned long btn,
            unsigned long state,
            long x,
            long y
        );

        void on_wheel_up (
            unsigned long state
        );

        void draw (
            const canvas& c
        ) const;

    private:

        bool need_h_scroll (
        ) const;
        
        bool need_v_scroll (
        ) const;

        void on_h_scroll (
        );

        void on_v_scroll (
        );

        rectangle total_rect_;
        rectangle display_rect_;
        scroll_bar hsb;
        scroll_bar vsb;
        unsigned long hscroll_bar_inc;
        unsigned long vscroll_bar_inc;
        unsigned long h_wheel_scroll_bar_inc;
        unsigned long v_wheel_scroll_bar_inc;
        bool mouse_drag_enabled_;
        bool user_is_dragging_mouse;
        point drag_origin;
        scoped_ptr<scrollable_region_style> style;

    };

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
    // class popup_menu_region 
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------

    class popup_menu_region : public drawable 
    {
        /*!
            CONVENTION
                popup_menu_visible() == popup_menu_shown
        !*/

    public:

        popup_menu_region(  
            drawable_window& w
        );

        virtual ~popup_menu_region(
        );

        void set_size (
            unsigned long width, 
            unsigned long height
        );

        void set_rect (
            const rectangle& new_rect
        );

        popup_menu& menu (
        );

        void hide (
        );

        void disable (
        );

        bool popup_menu_visible (
        ) const { auto_mutex M(m); return popup_menu_shown; }

    protected:

        void on_keydown (
            unsigned long key,
            bool is_printable,
            unsigned long state
        );

        void on_focus_lost (
        );

        void on_focus_gained (
        );

        void on_window_moved(
        );

        void on_mouse_down (
            unsigned long btn,
            unsigned long state,
            long x,
            long y,
            bool is_double_click
        );

        void on_menu_becomes_hidden (
        );

        void draw (
            const canvas& 
        ) const;

    private:

        popup_menu menu_;
        bool popup_menu_shown;

        // restricted functions
        popup_menu_region(popup_menu_region&);        // copy constructor
        popup_menu_region& operator=(popup_menu_region&);    // assignment operator
    };

// ----------------------------------------------------------------------------------------

}

#ifdef NO_MAKEFILE
#include "base_widgets.cpp"
#endif

#endif // DLIB_BASE_WIDGETs_

