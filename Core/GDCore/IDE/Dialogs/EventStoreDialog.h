/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef EVENTSTOREDIALOG_H
#define EVENTSTOREDIALOG_H
#include "SFML/Network.hpp"
#include "GDCoreDialogs.h"
#include <vector>
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/IDE/Dialogs/ParameterControlsHelper.h"
#include "GDCore/Events/Builtin/GroupEvent.h"
namespace gd { class Project; }
namespace gd { class Layout; }
class wxCheckBox;
class wxPanel;
class wxStaticText;
class wxPanel;
class wxBitmapButton;
class wxTextCtrl;

namespace gd
{

/**
 * \brief The dialog displaying the event store from GDevApp.com and
 * allowing customization and instantiation of templates.
 * \ingroup IDEDialogs
 */
class GD_CORE_API EventStoreDialog : public BaseEventStoreDialog
{
public:
    EventStoreDialog(wxWindow* parent, gd::Project & project, gd::Layout & layout);

    /**
     * \brief Get the GroupEvent that was instantiated with the selected template
     * and the parameters entered by the user.
     * \note Only relevant when ShowModal() returned 1.
     */
    const gd::GroupEvent & GetGroupEvent() { return groupEvent; }

    /**
     * \brief Update the dialog to show the specified template with the parameters
     * filled with the specified content.
     **/
    void RefreshWith(gd::String templateId, const std::vector<gd::String> & parameters);

    virtual ~EventStoreDialog();

protected:
    virtual void OnCancelBtClick(wxCommandEvent& event);
    virtual void OnOkBtClick(wxCommandEvent& event);
    virtual void OnSearchCtrlText(wxCommandEvent& event);
    virtual void OnSelectionChanged(wxCommandEvent& event);

	std::vector < wxCheckBox * > paramCheckboxes;
	std::vector < wxPanel * > paramSpacers1;
	std::vector < wxStaticText * > paramTexts;
	std::vector < wxPanel * > paramSpacers2;
	std::vector < wxBitmapButton * > paramBmpBts;
	std::vector < wxTextCtrl * > paramEdits;
    gd::ParameterControlsHelper parametersHelper;

    gd::Project & project;
    gd::Layout & layout;

    gd::SerializerElement loadedTemplate;
    static gd::SerializerElement * templates;
    static const gd::String host;
    static const int port;
    gd::GroupEvent groupEvent; ///< The event group created from the template

    sf::Http::Response::Status FetchTemplate(gd::String id);
    sf::Http::Response::Status FetchTemplates(bool forceFetch = false);
    void RefreshTemplate();
    void RefreshList();
    void RefreshParameters();
    void InstantiateTemplate();
};

}
#endif // EVENTSTOREDIALOG_H
#endif
