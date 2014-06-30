/**

Game Develop - Common Dialogs Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/
/**
 *
 * MessageBox is a class allowing to show a message
 * with a "Ok" button.
 * The design use a white area and a grey line like
 * windows Vista Message Boxes.
 */

#include "MessageBox.h"
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
MsgBox::MsgBox( string title, string message ) :
        drawable_window( false ),
        whitePnl( *this, rectangle( 0, 0, 100, 200 ), 255, 255, 255 ),
        line( *this, rectangle( 0, 0, 0, 0 ), 223, 223, 223 ),
        messageTxt( *this ),
        okBt( *this )
{
    okBt.set_pos( 10, 60 );
    okBt.set_size( 50, 20 );
    okBt.set_name( "Ok" );
    BtStyle style;
    okBt.set_style(style);

    // lets put the label 5 pixels below the button
    messageTxt.set_pos( 5, 5 );
    messageTxt.set_text( message );
    rectangle msg_rect = messageTxt.get_rect();

    whitePnl.set_rect( rectangle( 0, 0, msg_rect.width() + 10, msg_rect.height() + 15 ) );

    line.set_rect( rectangle( 0, msg_rect.height() + 15, msg_rect.width() + 10, msg_rect.height() + 15 ) );

    if ( msg_rect.width() >= 60 )
        okBt.set_pos( msg_rect.width() / 2 + msg_rect.left() - okBt.width() / 2, msg_rect.bottom() + 20 );
    else
        okBt.set_pos( 20, msg_rect.bottom() + 20 );

    // set which function should get called when the button gets clicked.  In this case we want
    // the on_button_clicked member to be called on *this.
    okBt.set_click_handler( *this, &MsgBox::on_button_clicked );

    // set the size of this window
    rectangle size = okBt.get_rect() + msg_rect;
    set_size( size.width() + 200, size.height() + 150 );

    //Set the background of this window
    set_background_color( 240, 240, 240 );

    set_title( title );
    show();
}

////////////////////////////////////////////////////////////
/// Destructor
////////////////////////////////////////////////////////////
MsgBox::~MsgBox()
{
    close_window();
}

////////////////////////////////////////////////////////////
/// Fermeture
////////////////////////////////////////////////////////////
void MsgBox::on_button_clicked()
{
    close_window();
}

} //namespace nw







