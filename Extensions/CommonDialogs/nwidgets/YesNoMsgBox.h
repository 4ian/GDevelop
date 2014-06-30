#ifndef YESNOMSGBOX_H
#define YESNOMSGBOX_H

#include "dlib/gui_widgets.h"
#include "ColorBox.h"
#include <sstream>
#include <string>

using namespace std;

namespace nw
{

class YesNoMsgBox : public dlib::drawable_window
{
public:

    YesNoMsgBox( string title, string message, string & result_ );
    ~YesNoMsgBox();

private:

    void on_button_yes_clicked();
    void on_button_no_clicked();

    string &    result;
    ColorBox    whitePnl;
    ColorBox    line;
    dlib::label       messageTxt;
    dlib::button      yesBt;
    dlib::button      noBt;
};

} //namespace nw

#endif // YESNOMSGBOX_H







