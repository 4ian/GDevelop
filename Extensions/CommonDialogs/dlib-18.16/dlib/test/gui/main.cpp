#include "dlib/image_io.h"
#include "dlib/array2d.h"
#include "dlib/gui_core.h"
#include "dlib/assert.h"
#include "dlib/misc_api.h"
#include <string>
#include "dlib/image_transforms.h"

#include "dlib/timer.h"

#include "dlib/gui_widgets.h"
#include "dlib/queue.h"
#include <sstream>
#include <iostream>
#include <fstream>

using namespace dlib;
using namespace std;


typedef dlib::array2d<hsi_pixel> image;




#include "dlib/base64.h"




class color_box : public draggable 
{
    unsigned char red, green,blue;

public:
    color_box (
        drawable_window& w,
        rectangle area,
        unsigned char red_,
        unsigned char green_,
        unsigned char blue_
    ) :
        draggable(w, MOUSE_WHEEL),
        red(red_),
        green(green_),
        blue(blue_),
        t(*this,&color_box::action)
    {
        rect = area;

        t.set_delay_time(4);
        // t.start();

        set_draggable_area(rectangle(10,10,500,500));

        enable_events();
    }

    ~color_box()
    {
        disable_events();
    }

private:

    void action (
        )
    {
        ++red;
        parent.invalidate_rectangle(rect);
    }

    void draw (
        const canvas& c
    ) const
    {
        if (hidden == false )
        {
            fill_rect(c,rect,rgb_pixel(red,green,blue));
            std::vector<point> poly;
            poly.push_back((rect.tl_corner()+rect.tr_corner())/2);
            poly.push_back((rect.tr_corner()+rect.br_corner())/2);
            poly.push_back((rect.br_corner()+rect.bl_corner())/2);
            poly.push_back((rect.bl_corner()+rect.tl_corner())/2);
            draw_solid_convex_polygon(c,poly,rgb_alpha_pixel(0,0,0,70));
        }
    }

    void on_wheel_up(
        unsigned long state
    )
    {
        if (state == base_window::NONE)
            cout << "up scroll, NONE" << endl;
        else if (state&base_window::LEFT)
            cout << "up scroll, LEFT" << endl;
        else if (state&base_window::RIGHT)
            cout << "up scroll, RIGHT" << endl;
        else if (state&base_window::MIDDLE)
            cout << "up scroll, MIDDLE" << endl;
        else if (state&base_window::SHIFT)
            cout << "up scroll, SHIFT" << endl;
        else if (state&base_window::CONTROL)
            cout << "up scroll, CONTROL" << endl;

    }

    void on_wheel_down(
        unsigned long state
    )
    {
        
        if (state == base_window::NONE)
            cout << "down scroll, NONE" << endl;
        else if (state&base_window::LEFT)
            cout << "down scroll, LEFT" << endl;
        else if (state&base_window::RIGHT)
            cout << "down scroll, RIGHT" << endl;
        else if (state&base_window::MIDDLE)
            cout << "down scroll, MIDDLE" << endl;
        else if (state&base_window::SHIFT)
            cout << "down scroll, SHIFT" << endl;
        else if (state&base_window::CONTROL)
            cout << "down scroll, CONTROL" << endl;

    }


    void on_window_resized ()
    {
        draggable::on_window_resized();
    }
    timer<color_box> t;
};






class win : public drawable_window
{

    label lbl_last_keydown;
    label lbl_mod_shift;
    label lbl_mod_control;
    label lbl_mod_alt;
    label lbl_mod_meta;
    label lbl_mod_caps_lock;
    label lbl_mod_num_lock;
    label lbl_mod_scroll_lock;
    void on_keydown (
        unsigned long key,
        bool is_printable,
        unsigned long state
    )
    {
        if (is_printable)
            lbl_last_keydown.set_text(string("last keydown: ") + (char)key);
        else
            lbl_last_keydown.set_text(string("last keydown: nonprintable"));

        if (state&base_window::KBD_MOD_SHIFT)
            lbl_mod_shift.set_text("shift is on");
        else
            lbl_mod_shift.set_text("shift is off");

        if (state&base_window::KBD_MOD_CONTROL)
            lbl_mod_control.set_text("control is on");
        else
            lbl_mod_control.set_text("control is off");

        if (state&base_window::KBD_MOD_ALT)
            lbl_mod_alt.set_text("alt is on");
        else
            lbl_mod_alt.set_text("alt is off");


        if (state&base_window::KBD_MOD_META)
            lbl_mod_meta.set_text("meta is on");
        else
            lbl_mod_meta.set_text("meta is off");

        if (state&base_window::KBD_MOD_CAPS_LOCK)
            lbl_mod_caps_lock.set_text("caps_lock is on");
        else
            lbl_mod_caps_lock.set_text("caps_lock is off");

        if (state&base_window::KBD_MOD_NUM_LOCK)
            lbl_mod_num_lock.set_text("num_lock is on");
        else
            lbl_mod_num_lock.set_text("num_lock is off");


        if (state&base_window::KBD_MOD_SCROLL_LOCK)
            lbl_mod_scroll_lock.set_text("scroll_lock is on");
        else
            lbl_mod_scroll_lock.set_text("scroll_lock is off");

        drawable_window::on_keydown(key,is_printable,state);
    }

    void rb_click (
    )
    {
        if (rb.is_checked())
            rb.set_name("radio button checked");
        else
            rb.set_name("radio button");
        rb.set_checked();
    }

    void cb_sb_enabled (
        toggle_button&
    )
    {
        if (sb_enabled.is_checked())
        { 
            sb.enable();
            lb.enable();
            b.enable();
        }
        else
        {
            lb.disable();
            sb.disable();
            b.disable();
        }

        if (sb_enabled.is_checked())
            rb.enable();
        else
            rb.disable();

        if (sb_enabled.is_checked())
            tabs.enable();
        else
            tabs.disable();

        if (sb_enabled.is_checked())
            tf.enable();
        else
            tf.disable();

        if (sb_enabled.is_checked())
            tb.enable();
        else
            tb.disable();

    }

    void cb_sb_shown (
    )
    {
        if (sb_shown.is_checked())
        {
            sb.show();
            tabs.show();
            lb.show();
        }
        else
        {
            sb.hide();
            tabs.hide();
            lb.hide();
        }
    }


    void tab_change (
        unsigned long new_idx,
        unsigned long 
    )
    {
        tab_label.set_text(tabs.tab_name(new_idx));
    }

    void scroll_handler (
    )
    {
        ostringstream sout;
        sout << "scroll bar pos: " << sb.slider_pos();
        sbl.set_text(sout.str());
    }

    void scroll2_handler (
    )
    {
        sb.set_length(sb2.slider_pos());
        ostringstream sout;
        sout << "scroll bar2 pos: " << sb2.slider_pos();
        sbl2.set_text(sout.str());
        scroll_handler();
    }

    void scroll3_handler (
    )
    {
        sb.set_max_slider_pos(sb3.slider_pos());
        ostringstream sout;
        sout << "scroll bar3 pos: " << sb3.slider_pos();
        sbl3.set_text(sout.str());
        scroll_handler();
    }

    void lb_double_click (
        unsigned long 
    )
    {
        dlib::queue<unsigned long>::kernel_2a_c sel;
        lb.get_selected(sel);
        sel.reset();
        while (sel.move_next())
        {
            cout << lb[sel.element()] << endl;
        }
        //message_box("list_box",lb[idx]);
    }

    void msg_box (
    )
    {
        message_box("title","you clicked the ok button!\n HURRAY!");
    }

	static void try_this_junk (
		void* param
		)
	{
		win& p = *reinterpret_cast<win*>(param);
        put_on_clipboard(p.tf.text() + "\nfoobar");

		
	}

    void on_set_clipboard (
    )
    {
        create_new_thread(try_this_junk,this);
		//try_this_junk(this);
    }

	static void try_this_junk2 (
		void* 
		)
	{

        string temp;
        get_from_clipboard(temp);
        message_box("clipboard",temp);
		
	}
    void on_get_clipboard (
    )
    {
        create_new_thread(try_this_junk2,this);
    }


    void on_show_msg_click (
    )
    {
        message_box("title","This is a test message.",*this,&win::msg_box);
    }

    void on_menu_help (
    )
    {
        message_box("About","This is the messy dlib gui regression test program");
    }

public:

    ~win()
    {
        close_window();
    }

    void cbox_clicked (
    )
    {
        if (cbox.is_checked())
            cbl.set_text(cbox.name() + " box is checked");
        else
            cbl.set_text("box NOT is checked");
    }

    win (
    ): 
        drawable_window(true),
        lbl_last_keydown(*this),
        lbl_mod_shift(*this),
        lbl_mod_control(*this),
        lbl_mod_alt(*this),
        lbl_mod_meta(*this),
        lbl_mod_caps_lock(*this),
        lbl_mod_num_lock(*this),
        lbl_mod_scroll_lock(*this),
        b(*this),
        btn_count(*this),
        btn_get_clipboard(*this),
        btn_set_clipboard(*this),
        btn_show_message(*this),
        cb1(*this,rectangle(100,100,200,200),255,0,0),
        cb2(*this,rectangle(150,150,250,240),0,255,0),
        cbl(*this),
        cbox(*this),
        group1(*this),
        group2(*this),
        group3(*this),
        keyboard_count(1),
        keydown(*this),
        keyup(*this),
        l1(*this),
        l2(*this),
        l3(*this),
        lb(*this),
        leave_count(*this),
        left_down(*this),
        left_up(*this),
        middle_down(*this),
        middle_up(*this),
        mouse_state(*this),
        mt(*this),
        nrect(*this),
        pos(*this),
        rb(*this),
        right_down(*this),
        right_up(*this),
        sb2(*this,scroll_bar::VERTICAL),
        sb3(*this,scroll_bar::VERTICAL),
        sb_enabled(*this),
        sbl2(*this),
        sbl3(*this),
        sbl(*this),
        sb_shown(*this),
        sb(*this,scroll_bar::HORIZONTAL),
        scroll(*this),
        tab_label(*this),
        tabs(*this),
        tf(*this),
        tb(*this),
        mbar(*this)
    {
        bool use_bdf_fonts = false;

        shared_ptr_thread_safe<bdf_font> f(new bdf_font);
        
        if (use_bdf_fonts)
        {

            ifstream fin("/home/davis/source/10x20.bdf");
            f->read_bdf_file(fin,0xFFFF);

            mt.set_main_font(f);
        }
        //mt.hide();
        mt.set_pos(5,200);


        lbl_last_keydown.set_text("?");
        lbl_mod_shift.set_text("?");
        lbl_mod_control.set_text("?");
        lbl_mod_alt.set_text("?");
        lbl_mod_meta.set_text("?");
        lbl_mod_caps_lock.set_text("?");
        lbl_mod_num_lock.set_text("?");
        lbl_mod_scroll_lock.set_text("?");

        lbl_last_keydown.set_pos(20,420);
        lbl_mod_shift.set_pos(20,lbl_last_keydown.bottom()+5);
        lbl_mod_control.set_pos(20,lbl_mod_shift.bottom()+5);
        lbl_mod_alt.set_pos(20,lbl_mod_control.bottom()+5);
        lbl_mod_meta.set_pos(20,lbl_mod_alt.bottom()+5);
        lbl_mod_caps_lock.set_pos(20,lbl_mod_meta.bottom()+5);
        lbl_mod_num_lock.set_pos(20,lbl_mod_caps_lock.bottom()+5);
        lbl_mod_scroll_lock.set_pos(20,lbl_mod_num_lock.bottom()+5);

        lb.set_pos(580,200);
        lb.set_size(200,300);
        if (use_bdf_fonts)
            lb.set_main_font(f);

        dlib::queue<string>::kernel_2a_c qos;
        string a;
        a = "Davis"; qos.enqueue(a);
        a = "king"; qos.enqueue(a);
        a = "one"; qos.enqueue(a);
        a = "two"; qos.enqueue(a);
        a = "three"; qos.enqueue(a);
        a = "yo yo yo alsdkjf asfj lsa jfsf\n this is a long phrase"; qos.enqueue(a);
        a = "four"; qos.enqueue(a);
        a = "five"; qos.enqueue(a);
        a = "six"; qos.enqueue(a);
        a = "seven"; qos.enqueue(a);
        a = "eight"; qos.enqueue(a);
        a = "nine"; qos.enqueue(a);
        a = "ten"; qos.enqueue(a);
        a = "eleven"; qos.enqueue(a);
        a = "twelve"; qos.enqueue(a);
        for (int i = 0; i < 1000; ++i)
        {
            a = "thirteen"; qos.enqueue(a);
        }
        lb.load(qos);
        lb.select(1);
        lb.select(2);
        lb.select(3);
        lb.select(5);
        lb.enable_multiple_select();
        lb.set_double_click_handler(*this,&win::lb_double_click);
        //        lb.disable_multiple_select();

        btn_show_message.set_pos(50,350);
        btn_show_message.set_name("message_box()");
        mbar.set_number_of_menus(2);
        mbar.set_menu_name(0,"File",'F');
        mbar.set_menu_name(1,"Help",'H');
        mbar.menu(0).add_menu_item(menu_item_text("show msg click",*this,&win::on_show_msg_click,'s'));
        mbar.menu(0).add_menu_item(menu_item_text("get clipboard",*this,&win::on_get_clipboard,'g'));
        mbar.menu(0).add_menu_item(menu_item_text("set clipboard",*this,&win::on_set_clipboard,'c'));
        mbar.menu(0).add_menu_item(menu_item_separator());
        mbar.menu(0).add_submenu(menu_item_submenu("submenu",'m'), submenu);
        submenu.add_menu_item(menu_item_separator());
        submenu.add_menu_item(menu_item_separator());
        submenu.add_menu_item(menu_item_text("show msg click",*this,&win::on_show_msg_click,'s'));
        submenu.add_menu_item(menu_item_text("get clipboard",*this,&win::on_get_clipboard,'g'));
        submenu.add_menu_item(menu_item_text("set clipboard",*this,&win::on_set_clipboard,'c'));
        submenu.add_menu_item(menu_item_separator());
        submenu.add_menu_item(menu_item_separator());
        mbar.menu(1).add_menu_item(menu_item_text("About",*this,&win::on_menu_help,'A'));

        btn_show_message.set_click_handler(*this,&win::on_show_msg_click);
        btn_get_clipboard.set_pos(btn_show_message.right()+5,btn_show_message.top());
        btn_get_clipboard.set_name("get_from_clipboard()");
        btn_get_clipboard.set_click_handler(*this,&win::on_get_clipboard);

        btn_get_clipboard.set_style(button_style_toolbar1());
        btn_set_clipboard.set_pos(btn_get_clipboard.right()+5,btn_get_clipboard.top());
        btn_set_clipboard.set_name("put_on_clipboard()");
        btn_set_clipboard.set_click_handler(*this,&win::on_set_clipboard);

        nrect.set_size(700,500);
        nrect.set_name("test widgets");
        nrect.set_pos(2,mbar.bottom()+2);

        //throw dlib::error("holy crap batman");
        tab_label.set_pos(10,440);

        tabs.set_click_handler(*this,&win::tab_change); 
        tabs.set_pos(5,mbar.bottom()+10);
        tabs.set_size(280,100);
        tabs.set_number_of_tabs(3);
        tabs.set_tab_name(0,"davis");
        tabs.set_tab_name(1,"edward");
        tabs.set_tab_name(2,"king alsklsdkfj asfd");
        tabs.set_tab_group(0,group1);
        tabs.set_tab_group(1,group2);
        tabs.set_tab_group(2,group3);

        l1.set_text("group one");
        l2.set_text("group two");
        l3.set_text("group three");

        group1.add(l1,0,0);
        group2.add(l2,20,10);
        group3.add(l3,0,0);



        sb_enabled.set_name("enabled");
        sb_shown.set_name("shown");
        sb_shown.set_checked();
        sb_enabled.set_checked();
        sb_shown.set_click_handler(*this,&win::cb_sb_shown);
        sb_enabled.set_click_handler(*this,&win::cb_sb_enabled);
        
        sb_shown.set_tooltip_text("I'm a checkbox");

        rb.set_click_handler(*this,&win::rb_click);


        sb3.set_pos(440,mbar.bottom()+10);
        sb3.set_max_slider_pos(300);
        sb3.set_slider_pos(150);
        sb3.set_length(300);
        sb2.set_pos(470,mbar.bottom()+10);
        sb2.set_max_slider_pos(300);
        sb2.set_length(300);
        sb.set_pos(500,mbar.bottom()+10);
        sb.set_max_slider_pos(30);
        sb.set_length(300);


        sb.set_scroll_handler(*this,&win::scroll_handler);
        sb2.set_scroll_handler(*this,&win::scroll2_handler);
        sb3.set_scroll_handler(*this,&win::scroll3_handler);
        sbl.set_pos(540,mbar.bottom()+20);
        sbl2.set_pos(540,mbar.bottom()+40);
        sbl3.set_pos(540,mbar.bottom()+60);

        cbox.set_pos(300,mbar.bottom()+30);
        cbox.set_name("davis king");
        cbox.set_click_handler(*this,&win::cbox_clicked);

        cbl.set_pos(300,cbox.get_rect().bottom()+1);
        cbox.set_checked();
        sb_enabled.set_pos(cbox.get_rect().left(),cbox.get_rect().bottom()+20);
        sb_shown.set_pos(sb_enabled.get_rect().left(),sb_enabled.get_rect().bottom()+2);



        if (use_bdf_fonts)
            rb.set_main_font(f);
        rb.set_name("radio button");
        rb.set_pos(sb_shown.get_rect().left(),sb_shown.get_rect().bottom()+2);


        cb1.set_z_order(10);
        cb2.set_z_order(20);

        pos.set_pos(50,50);
        left_up.set_pos(50,70);
        left_down.set_pos(50,90);
        middle_up.set_pos(50,110);
        middle_down.set_pos(50,130);
        right_up.set_pos(50,150);
        right_down.set_pos(50,170);

        mouse_state.set_pos(50,190);

        leave_count.set_pos(50,210);

        scroll_count = 0;
        scroll.set_pos(50,230);

        btn_count.set_pos(50,250);


        keydown.set_pos(50,270);
        keyup.set_pos(50,290);

        tf.set_pos(50,310);
        tf.set_text("Davis685g@");
        tf.set_width(500);
        tf.set_text_color(rgb_pixel(255,0,0));
        tf.set_enter_key_handler(*this,&win::on_enter_key);
        tf.set_focus_lost_handler(*this,&win::on_tf_focus_lost);
        
        tb.set_pos(250,400);
        tb.set_text("initial test\nstring");
        tb.set_size(300,300);
        tb.set_text_color(rgb_pixel(255,0,0));
        tb.set_enter_key_handler(*this,&win::on_enter_key);
        tb.set_focus_lost_handler(*this,&win::on_tf_focus_lost);
        

        button_count = 0;
        count = 0;
        b.set_name("button");
        b.set_pos(540,100);
        b.set_click_handler(*this,&win::on_click);
        b.set_tooltip_text("hurray i'm a button!");
        if (use_bdf_fonts)
            b.set_main_font(f);


        set_size(815,730);

        nrect.wrap_around(
            cbox.get_rect() +
            rb.get_rect() + 
            sb_enabled.get_rect() + 
            sb_shown.get_rect());

        flip = 0;
        open_file_box(*this,&win::on_open_file);
        open_existing_file_box(*this,&win::on_open_file);
        save_file_box(*this,&win::on_open_file);

        if (use_bdf_fonts)
        {
            tf.set_main_font(f);
            tb.set_main_font(f);
        }
        if (use_bdf_fonts)
            tabs.set_main_font(f);

    }

private:


    void on_enter_key()
    {
        cout << "enter key pressed" << endl;
    }

    void on_tf_focus_lost()
    {
        cout << "text field/box lost focus" << endl;
    }


    void on_open_file (const std::string& file)
    {
        message_box("file opened",file);
    }




    void on_click (
    )
    {
        ostringstream sout;
        sout << "text field: " << tf.text();
        ++button_count;
        btn_count.set_text(sout.str());

        if (flip == 0)
        {
            flip = 1;
            lb.set_size(200,200);
        }
        else if (flip == 1)
        {
            flip = 2;
            lb.set_size(150,200);
        }
        else if (flip == 2)
        {
            flip = 3;
            lb.set_size(150,300);
        }
        else
        {
            flip = 0;
            lb.set_size(200,300);
        }
    }


    button b;
    label btn_count;
    button btn_get_clipboard;
    button btn_set_clipboard;
    button btn_show_message;
    int button_count;
    color_box cb1;
    color_box cb2;
    label cbl;
    check_box cbox;
    int count;
    int flip;
    widget_group group1;
    widget_group group2;
    widget_group group3;
    int keyboard_count;
    label keydown;
    label keyup;
    label l1;
    label l2;
    label l3;
    list_box lb;
    label leave_count;
    label left_down;
    label left_up;
    label middle_down;
    label middle_up;
    label mouse_state;
    mouse_tracker mt;
    named_rectangle nrect;
    label pos;
    radio_button rb;
    label right_down;
    label right_up;
    scroll_bar sb2;
    scroll_bar sb3;
    check_box sb_enabled;
    label sbl2;
    label sbl3;
    label sbl;
    check_box sb_shown;
    scroll_bar sb;
    int scroll_count;
    label scroll;
    label tab_label;
    tabbed_display tabs;
    text_field tf;
    text_box tb;
    menu_bar mbar;
    popup_menu submenu;

};


win w;

int main()
{

    try
    {

        image_window win;

        array2d<unsigned char> img;
        img.set_size(100,100);
        assign_all_pixels(img,0);

        fill_rect(img, rectangle(1,1,1,1), 255);
        fill_rect(img, rectangle(1,3,2,5), 255);
        fill_rect(img, rectangle(4,3,5,4), 255);
        fill_rect(img, rectangle(9,9,13,10), 255);

        win.set_image(img);

        win.add_overlay(image_display::overlay_rect(rectangle(1,1,1,1), rgb_pixel(255,0,0)));
        win.add_overlay(image_display::overlay_rect(rectangle(1,3,2,5), rgb_pixel(255,0,0)));
        win.add_overlay(image_display::overlay_rect(rectangle(4,3,5,4), rgb_pixel(255,0,0)));
        win.add_overlay(image_display::overlay_rect(rectangle(9,9,13,10), rgb_pixel(255,0,0)));



        w.set_pos (100,200);
        w.set_title("test window");
        w.show();

        w.wait_until_closed();
    }
    catch (exception& e)
    {
        cout << e.what() << endl;
    }

}
