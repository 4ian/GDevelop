/*
 * GDevelop IDE
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License.
 */

#include <wx/config.h>
#include "StartHerePage.h"
#include "GDCore/CommonTools.h"
#include "../UpdateChecker.h"
#include "../MainFrame.h"

StartHerePage::StartHerePage(wxWindow* parent, MainFrame & mainEditor_)
    : BaseStartHerePage(parent),
    mainEditor(mainEditor_)
{
	logoBmp->SetBitmap(wxBitmap("res/GD-logo-simple.png", wxBITMAP_TYPE_ANY));
	donateBmp->SetBitmap(wxBitmap("res/hearticon.png", wxBITMAP_TYPE_ANY));
	githubBmp->SetBitmap(wxBitmap("res/github16.png", wxBITMAP_TYPE_ANY));

	wxString donateLink = _("http://www.compilgames.net/donate.php");
	if ( !donateLink.StartsWith("http://www.compilgames.net/") ) donateLink = "http://www.compilgames.net/donate.php";
	donateLink += "?utm_source=GD&utm_medium=StartPageLink&utm_campaign=donate";
	donateLinkBt->SetURL(donateLink);

	Refresh();
}

StartHerePage::~StartHerePage()
{
}


void StartHerePage::Refresh()
{
	RefreshLastProjectBt(lastProject1Bt, "0");
	RefreshLastProjectBt(lastProject2Bt, "1");
	RefreshLastProjectBt(lastProject3Bt, "2");

	RefreshNewsUsingUpdateChecker();
}

void StartHerePage::RefreshLastProjectBt(wxHyperlinkCtrl * ctrl, wxString index)
{
	wxString result;
	wxConfigBase::Get()->Read(_T("/Recent/" + index), &result);
	if (result.length() > 50) result = result.Left(12)+_("...")+result.Right(36);
	ctrl->SetLabel(result);
}

void StartHerePage::RefreshNewsUsingUpdateChecker()
{
	UpdateChecker * checker = UpdateChecker::Get();
	if (!checker->news.empty())
		newsEdit->SetValue(checker->news);
	else
		newsEdit->SetValue(_("No news for now!"));

	newsLink1->SetLabel(checker->newsLinkLabel1);
	newsLink1->SetURL(checker->newsLink1);
	newsLink2->SetLabel(checker->newsLinkLabel2);
	newsLink2->SetURL(checker->newsLink2);
	Layout();
}

void StartHerePage::OnLastProject1Click(wxHyperlinkEvent& event)
{
	wxString result;
	wxConfigBase::Get()->Read( _T( "/Recent/0" ), &result );
	mainEditor.Open(gd::ToString(result));
}

void StartHerePage::OnLastProject2Click(wxHyperlinkEvent& event)
{
	wxString result;
	wxConfigBase::Get()->Read( _T( "/Recent/1" ), &result );
	mainEditor.Open(gd::ToString(result));
}

void StartHerePage::OnLastProject3Click(wxHyperlinkEvent& event)
{
	wxString result;
	wxConfigBase::Get()->Read( _T( "/Recent/2" ), &result );
	mainEditor.Open(gd::ToString(result));
}
