#ifndef OPENFILE_H
#define OPENFILE_H

#include "dlib/gui_widgets.h"
#include "dlib/gui_core.h"
#include <string>
#include <sstream>
#include "dlib/timer.h"
#include "dlib/member_function_pointer.h"
#include "dlib/array.h"
#include "dlib/sequence.h"
#include "dlib/dir_nav.h"
#include "dlib/queue.h"
#include "dlib/smart_pointers.h"
#include "dlib/string.h"
#include "dlib/misc_api.h"
#include <sstream>
#include <string>

using namespace std;

namespace nw
{
class OpenFile : public dlib::drawable_window
{
public:
    OpenFile(const std::string& title, bool has_text_field, string & file_);

    ~OpenFile();

    template <
    typename T
    >
    void set_click_handler(
        T& object,
        void ( T::*event_handler_ )( const std::string& )
    )
    {
        dlib::auto_mutex M( wm );
        event_handler.set( object, event_handler_ );
    }

private:

    void set_sizes(
    );

    void on_window_resized(
    );

    void deleter_thread(
    );

    void enter_folder(
        const std::string& folder_name
    );

    void on_dirs_click(
        unsigned long idx
    );

    void on_files_click(
        unsigned long idx
    );

    void on_files_double_click(
        unsigned long
    );

    void on_cancel_click(
    );

    void on_open_click(
    );

    void on_path_button_click(
        dlib::toggle_button& btn
    );

    bool set_dir(
        const std::string& dir
    );

    void on_root_click(
    );

    on_close_return_code on_window_close(
    );

    dlib::label lbl_dirs;
    dlib::label lbl_files;
    dlib::label lbl_file_name;
    dlib::list_box lb_dirs;
    dlib::list_box lb_files;
    dlib::button btn_ok;
    dlib::button btn_cancel;
    dlib::toggle_button btn_root;
    dlib::text_field tf_file_name;
    std::string path;
    std::string prefix;
    int cur_dir;
    string & result;

    dlib::member_function_pointer<const std::string&>::kernel_1a event_handler;
    dlib::sequence<dlib::scoped_ptr<dlib::toggle_button> >::kernel_2a_c sob;
};
}
#endif // OPENFILE_H







