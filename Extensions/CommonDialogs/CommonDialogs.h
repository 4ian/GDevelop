/**

GDevelop - Common Dialogs Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef COMMONDIALOGS_H_INCLUDED
#define COMMONDIALOGS_H_INCLUDED

#include <string>
class RuntimeScene;
namespace gd { class Variable; }

namespace GDpriv
{
namespace CommonDialogs
{

void ShowMessageBox( RuntimeScene & scene, const std::string & message, const std::string & title );
void ShowOpenFile( RuntimeScene & scene, gd::Variable & variable, const std::string & title, std::string filters );
void ShowYesNoMsgBox( RuntimeScene & scene, gd::Variable & variable, const std::string & message, const std::string & title );
void ShowTextInput( RuntimeScene & scene, gd::Variable & variable, const std::string & message, const std::string & title );

}
}

#endif // COMMONDIALOGS_H_INCLUDED

