/**

GDevelop - Common Dialogs Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef COMMONDIALOGS_H_INCLUDED
#define COMMONDIALOGS_H_INCLUDED

#include "GDCpp/Runtime/String.h"

class RuntimeScene;
namespace gd { class Variable; }

namespace GDpriv
{
namespace CommonDialogs
{

void ShowMessageBox( RuntimeScene & scene, const gd::String & message, const gd::String & title );
void ShowOpenFile( RuntimeScene & scene, gd::Variable & variable, const gd::String & title, gd::String filters );
void ShowYesNoMsgBox( RuntimeScene & scene, gd::Variable & variable, const gd::String & message, const gd::String & title );
void ShowTextInput( RuntimeScene & scene, gd::Variable & variable, const gd::String & message, const gd::String & title );

}
}

#endif // COMMONDIALOGS_H_INCLUDED
