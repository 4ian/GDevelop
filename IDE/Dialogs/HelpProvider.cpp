/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License.
 */
#include "HelpProvider.h"
#include <wx/utils.h>
#include <wx/mimetype.h>

HelpProvider * HelpProvider::_singleton = NULL;

void HelpProvider::OpenLink(wxString link)
{
    wxLaunchDefaultBrowser(link);
}
