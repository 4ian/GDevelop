/**
 * "nWidgets" : nice Widgets for dlib
 *
 * Par Florian "4ian" Rival
 *
 */
/**
 *
 * A file to test the nWidgets' widgets.
 */

#include "dlib/gui_widgets.h"
#include <sstream>
#include <string>
#include "MessageBox.h"
#include "YesNoMsgBox.h"
#include "TextInput.h"
#include "OpenFile.h"

using namespace std;
using namespace dlib;

int main()
{
    string result;
    string file;

    nw::TextInput box("Une jolie MsgBox", "Vous en dites quoi ? Vous, oui, là, vous !", result);
    box.wait_until_closed();


    /*nw::YesNoMsgBox ynbox("Une jolie YesNoMsgBox", "Test1234567891011121314", result);
    ynbox.wait_until_closed();

    nw::OpenFile * filebox = new nw::OpenFile("test", true, file);
    filebox->wait_until_closed();*/

    nw::MsgBox box2("Une jolie MsgBox", "Vous avez choisi "+result+"\net le fichier"+file);
    box2.wait_until_closed();
}







