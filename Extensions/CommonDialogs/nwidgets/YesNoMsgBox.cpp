/**
 * nWidgets
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 * MessageBox is a class allowing to show a message
 * with a "Ok" button.
 * The design use a white area and a grey line like
 * windows Vista Message Boxes.
 */

#include "YesNoMsgBox.h"
#include "nStyle.h"
#include "dlib/gui_widgets.h"
#include "ColorBox.h"
#include <sstream>
#include <string>

using namespace std;
using namespace dlib;

namespace nw
{
////////////////////////////////////////////////////////////
/// Constructor
////////////////////////////////////////////////////////////
YesNoMsgBox::YesNoMsgBox( string title, string message, string & result_ ) :
        drawable_window( false ),
        result(result_),
        whitePnl( *this, rectangle( 0, 0, 100, 200 ), 255, 255, 255 ),
        line( *this, rectangle( 0, 0, 0, 0 ), 223, 223, 223 ),
        messageTxt( *this ),
        yesBt( *this ),
        noBt( *this)
{
    yesBt.set_pos( 10, 60 );
    yesBt.set_size( 50, 20 );
    yesBt.set_name( "Yes" );
    BtStyle style;
    yesBt.set_style(style);

    noBt.set_pos( 40, 40 );
    noBt.set_size( 50, 20 );
    noBt.set_name( "No" );
    noBt.set_style(style);

    // lets put the label 5 pixels below the button
    messageTxt.set_pos( 5, 5 );
    messageTxt.set_text( message );

    rectangle msg_rect = messageTxt.get_rect();
    if ( msg_rect.width() < 120 )
    {
        msg_rect.set_right(150);
    }

    whitePnl.set_rect( rectangle( 0, 0, msg_rect.width() + 10, msg_rect.height() + 15 ) );
    line.set_rect( rectangle( 0, msg_rect.height() + 15, msg_rect.width() + 10, msg_rect.height() + 15 ) );

    yesBt.set_pos( msg_rect.width()/2-5-yesBt.get_rect().width(), msg_rect.bottom() + 20 );
    noBt.set_pos( msg_rect.width()/2+5, msg_rect.bottom() + 20 );

    // set which function should get called when the button gets clicked.  In this case we want
    // the on_button_clicked member to be called on *this.
    yesBt.set_click_handler( *this, &YesNoMsgBox::on_button_yes_clicked );
    noBt.set_click_handler( *this, &YesNoMsgBox::on_button_no_clicked );

    // set the size of this window
    rectangle size = yesBt.get_rect() + msg_rect;
    set_size( size.width() + 200, size.height() + 150 );

    //Set the background of this window
    set_background_color( 240, 240, 240 );

    set_title( title );
    show();
}

////////////////////////////////////////////////////////////
/// Destructor
////////////////////////////////////////////////////////////
YesNoMsgBox::~YesNoMsgBox()
{
    close_window();
}

////////////////////////////////////////////////////////////
/// Click on yes button
////////////////////////////////////////////////////////////
void YesNoMsgBox::on_button_yes_clicked()
{
    result = "yes";
    close_window();
}

////////////////////////////////////////////////////////////
/// Click on no button
////////////////////////////////////////////////////////////
void YesNoMsgBox::on_button_no_clicked()
{
    result = "no";
    close_window();
}

} //namespace nw







