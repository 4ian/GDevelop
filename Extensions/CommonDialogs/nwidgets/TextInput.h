#ifndef TEXTINPUT_H
#define TEXTINPUT_H

#include "dlib/gui_widgets.h"
#include "ColorBox.h"
#include <sstream>
#include <string>

using namespace std;

namespace nw
{

class TextInput : public dlib::drawable_window
{
public:

    TextInput( string title, string message, string & result_ );
    ~TextInput();

private:

    void on_button_clicked();

    ColorBox            whitePnl;
    ColorBox            line;
    dlib::label         messageTxt;
    dlib::button        okBt;
    dlib::text_field    textEdit;
    string &            result;
};

} //namespace nw

#endif // TEXTINPUT_H







