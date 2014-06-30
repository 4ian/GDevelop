#include "OpenFile.h"
#include "nStyle.h"

using namespace dlib;

namespace nw
{
OpenFile::OpenFile( const std::string& title, bool has_text_field, string & file_ ) :
        lbl_dirs( *this ),
        lbl_files( *this ),
        lbl_file_name( *this ),
        lb_dirs( *this ),
        lb_files( *this ),
        btn_ok( *this ),
        btn_cancel( *this ),
        btn_root( *this ),
        tf_file_name( *this ),
        result(file_)
{
    if ( has_text_field == false )
    {
        tf_file_name.hide();
        lbl_file_name.hide();
    }
    else
    {
        lbl_file_name.set_text( "File: " );
    }

    BtStyle btStyle;
    TBtStyle tBtStyle;
    LbStyle lbStyle;

    cur_dir = -1;
    set_size( 500, 300 );

    lbl_dirs.set_text( "Directories:" );
    lbl_files.set_text( "Files:" );
    btn_ok.set_name( "Ok" );
    btn_ok.set_style(btStyle);
    btn_cancel.set_name( "Cancel" );
    btn_cancel.set_style(btStyle);
    btn_root.set_name( "/" );
    btn_root.set_style(tBtStyle);

    btn_root.set_click_handler( *this, &OpenFile::on_root_click );
    btn_cancel.set_click_handler( *this, &OpenFile::on_cancel_click );
    btn_ok.set_click_handler( *this, &OpenFile::on_open_click );
    lb_dirs.set_double_click_handler( *this, &OpenFile::on_dirs_click );
    lb_dirs.set_style(lbStyle);
    lb_files.set_click_handler( *this, &OpenFile::on_files_click );
    lb_files.set_double_click_handler( *this, &OpenFile::on_files_double_click );
    lb_files.set_style(lbStyle);


    btn_root.set_pos( 5, 5 );

    set_sizes();
    set_title( title );

    on_root_click();

    // make it so that the file box starts out in our current working
    // directory
    std::string full_name( get_current_dir() );

    while ( full_name.size() > 0 )
    {
        std::string::size_type pos = full_name.find_first_of( "\\/" );
        std::string left( full_name.substr( 0, pos ) );
        if ( pos != std::string::npos )
            full_name = full_name.substr( pos + 1 );
        else
            full_name.clear();

        if ( left.size() > 0 )
            enter_folder( left );
    }

    set_background_color( 240, 240, 240 );

    show();
}

// ------------------------------------------------------------------------------------

OpenFile::
~OpenFile(
)
{
    close_window();
}

// ------------------------------------------------------------------------------------

void OpenFile::
set_sizes(
)
{
    unsigned long width, height;
    get_size( width, height );


    if ( lbl_file_name.is_hidden() )
    {
        lbl_dirs.set_pos( 0, btn_root.bottom() + 5 );
        lb_dirs.set_pos( 0, lbl_dirs.bottom() );
        lb_dirs.set_size( width / 2, height - lb_dirs.top() - btn_cancel.height() - 10 );

        lbl_files.set_pos( lb_dirs.right(), btn_root.bottom() + 5 );
        lb_files.set_pos( lb_dirs.right(), lbl_files.bottom() );
        lb_files.set_size( width - lb_files.left(), height - lb_files.top() - btn_cancel.height() - 10 );

        btn_ok.set_pos( width - btn_ok.width() - 25, lb_files.bottom() + 5 );
        btn_cancel.set_pos( btn_ok.left() - btn_cancel.width() - 5, lb_files.bottom() + 5 );
    }
    else
    {

        lbl_dirs.set_pos( 0, btn_root.bottom() + 5 );
        lb_dirs.set_pos( 0, lbl_dirs.bottom() );
        lb_dirs.set_size( width / 2, height - lb_dirs.top() - btn_cancel.height() - 10 - tf_file_name.height() );

        lbl_files.set_pos( lb_dirs.right(), btn_root.bottom() + 5 );
        lb_files.set_pos( lb_dirs.right(), lbl_files.bottom() );
        lb_files.set_size( width - lb_files.left(), height - lb_files.top() - btn_cancel.height() - 10 - tf_file_name.height() );

        lbl_file_name.set_pos( lb_files.left(), lb_files.bottom() + 8 );
        tf_file_name.set_pos( lbl_file_name.right(), lb_files.bottom() + 5 );
        tf_file_name.set_width( width - tf_file_name.left() - 5 );

        btn_ok.set_pos( width - btn_ok.width() - 25, tf_file_name.bottom() + 5 );
        btn_cancel.set_pos( btn_ok.left() - btn_cancel.width() - 5, tf_file_name.bottom() + 5 );
    }

}

// ------------------------------------------------------------------------------------

void OpenFile::
on_window_resized(
)
{
    set_sizes();
}

// ------------------------------------------------------------------------------------

void OpenFile::
deleter_thread(
)
{
    close_window();
    delete this;
}

// ------------------------------------------------------------------------------------

void OpenFile::
enter_folder(
    const std::string& folder_name
)
{
    if ( btn_root.is_checked() )
        btn_root.set_unchecked();
    if ( cur_dir != -1 )
        sob[cur_dir]->set_unchecked();


    const std::string old_path = path;
    const long old_cur_dir = cur_dir;

    scoped_ptr<toggle_button> new_btn( new toggle_button( *this ) );
    new_btn->set_name( folder_name );
    TBtStyle tBtStyle;
    new_btn->set_style(tBtStyle);
    new_btn->set_click_handler( *this, &OpenFile::on_path_button_click );

    // remove any path buttons that won't be part of the path anymore
    if ( sob.size() )
    {
        while ( sob.size() > ( unsigned long )( cur_dir + 1 ) )
        {
            scoped_ptr<toggle_button> junk;
            sob.remove( cur_dir + 1, junk );
        }
    }

    if ( sob.size() )
        new_btn->set_pos( sob[sob.size()-1]->right() + 5, sob[sob.size()-1]->top() );
    else
        new_btn->set_pos( btn_root.right() + 5, btn_root.top() );

    cur_dir = sob.size();
    sob.add( sob.size(), new_btn );

    path += folder_name + directory::get_separator();
    if ( set_dir( prefix + path ) == false )
    {
        sob.remove( sob.size() - 1, new_btn );
        path = old_path;
        cur_dir = old_cur_dir;
    }
    else
    {

        sob[cur_dir]->set_checked();
    }
}

// ------------------------------------------------------------------------------------

void OpenFile::
on_dirs_click(
    unsigned long idx
)
{
    enter_folder( lb_dirs[idx] );
}

// ------------------------------------------------------------------------------------

void OpenFile::
on_files_click(
    unsigned long idx
)
{
    if ( tf_file_name.is_hidden() == false )
    {
        tf_file_name.set_text( lb_files[idx] );
    }
}

// ------------------------------------------------------------------------------------

void OpenFile::
on_files_double_click(
    unsigned long
)
{
    on_open_click();
}

// ------------------------------------------------------------------------------------

void OpenFile::
on_cancel_click(
)
{
    hide();
    create_new_thread<OpenFile, &OpenFile::deleter_thread>( *this );
}

// ------------------------------------------------------------------------------------

void OpenFile::
on_open_click(
)
{
    if ( lb_files.get_selected() != lb_files.size() || tf_file_name.text().size() > 0 )
    {
        if ( event_handler.is_set() )
        {
            if ( tf_file_name.is_hidden() )
                event_handler( prefix + path + lb_files[lb_files.get_selected()] );
            else if ( tf_file_name.text().size() > 0 )
                event_handler( prefix + path + tf_file_name.text() );
        }

        if ( tf_file_name.is_hidden() )
            result = prefix + path + lb_files[lb_files.get_selected()];
        else if ( tf_file_name.text().size() > 0 )
            result = prefix + path + tf_file_name.text();

        hide();
        create_new_thread<OpenFile, &OpenFile::deleter_thread>( *this );
    }
}

// ------------------------------------------------------------------------------------

void OpenFile::
on_path_button_click(
    toggle_button& btn
)
{
    if ( btn_root.is_checked() )
        btn_root.set_unchecked();
    if ( cur_dir != -1 )
        sob[cur_dir]->set_unchecked();
    std::string new_path;

    for ( unsigned long i = 0; i < sob.size(); ++i )
    {
        new_path += sob[i]->name() + directory::get_separator();
        if ( sob[i].get() == &btn )
        {
            cur_dir = i;
            sob[i]->set_checked();
            break;
        }
    }
    if ( path != new_path )
    {
        path = new_path;
        set_dir( prefix + path );
    }
}

// ------------------------------------------------------------------------------------

struct case_insensitive_compare
{
    bool operator()(
        const std::string& a,
        const std::string& b
    ) const
    {
        std::string::size_type i, size;
        size = std::min( a.size(), b.size() );
        for ( i = 0; i < size; ++i )
        {
            if ( std::tolower( a[i] ) < std::tolower( b[i] ) )
                return true;
            else if ( std::tolower( a[i] ) > std::tolower( b[i] ) )
                return false;
        }
        if ( a.size() < b.size() )
            return true;
        else
            return false;
    }
};

// ------------------------------------------------------------------------------------

bool OpenFile::
set_dir(
    const std::string& dir
)
{
    try
    {
        directory d( dir );
        queue<directory>::kernel_1a_c qod;
        queue<file>::kernel_1a_c qof;
        queue<std::string>::sort_1a_c qos;
        d.get_dirs( qod );
        d.get_files( qof );

        qod.reset();
        while ( qod.move_next() )
        {
            std::string temp = qod.element().name();
            qos.enqueue( temp );
        }
        qos.sort( case_insensitive_compare() );
        lb_dirs.load( qos );
        qos.clear();

        qof.reset();
        while ( qof.move_next() )
        {
            std::string temp = qof.element().name();
            qos.enqueue( temp );
        }
        qos.sort( case_insensitive_compare() );
        lb_files.load( qos );
        return true;
    }
    catch ( directory::listing_error& )
    {
        return false;
    }
    catch ( directory::dir_not_found& )
    {
        return false;
    }
}

// ------------------------------------------------------------------------------------

void OpenFile::
on_root_click(
)
{
    btn_root.set_checked();
    if ( cur_dir != -1 )
        sob[cur_dir]->set_unchecked();

    queue<directory>::kernel_1a_c qod, qod2;
    queue<file>::kernel_1a_c qof;
    queue<std::string>::sort_1a_c qos;
    get_filesystem_roots( qod );
    path.clear();
    cur_dir = -1;
    if ( qod.size() == 1 )
    {
        qod.current().get_files( qof );
        qod.current().get_dirs( qod2 );
        prefix = qod.current().full_name();

        qod2.reset();
        while ( qod2.move_next() )
        {
            std::string temp = qod2.element().name();
            qos.enqueue( temp );
        }
        qos.sort( case_insensitive_compare() );
        lb_dirs.load( qos );
        qos.clear();

        qof.reset();
        while ( qof.move_next() )
        {
            std::string temp = qof.element().name();
            qos.enqueue( temp );
        }
        qos.sort( case_insensitive_compare() );
        lb_files.load( qos );
    }
    else
    {
        prefix.clear();
        qod.reset();
        while ( qod.move_next() )
        {
            std::string temp = qod.element().full_name();
            temp = temp.substr( 0, temp.size() - 1 );
            qos.enqueue( temp );
        }
        qos.sort( case_insensitive_compare() );
        lb_dirs.load( qos );
        qos.clear();
        lb_files.load( qos );
    }
}

// ------------------------------------------------------------------------------------

base_window::on_close_return_code OpenFile::
on_window_close(
)
{
    delete this;
    return CLOSE_WINDOW;
}

}







