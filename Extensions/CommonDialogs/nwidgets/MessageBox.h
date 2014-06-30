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

#ifndef MESSAGEBOX_H
#define MESSAGEBOX_H

#include "dlib/gui_widgets.h"
#include "ColorBox.h"
#include <sstream>
#include <string>

using namespace std;

namespace nw
{

class MsgBox : public dlib::drawable_window
{
public:

    MsgBox( string title, string message );
    ~MsgBox();

private:

    void on_button_clicked();

    ColorBox        whitePnl;
    ColorBox        line;
    dlib::label     messageTxt;
    dlib::button    okBt;
};

} //namespace nw

#endif // MESSAGEBOX_H







