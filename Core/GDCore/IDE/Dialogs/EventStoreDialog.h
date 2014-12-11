#ifndef EVENTSTOREDIALOG_H
#define EVENTSTOREDIALOG_H
#include "SFML/Network.hpp"
#include "GDCoreDialogs.h"
#include <vector>
#include "GDCore/Serialization/SerializerElement.h"
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
    EventStoreDialog(wxWindow* parent);
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

    gd::SerializerElement loadedTemplate;
    gd::SerializerElement templates;
    static const std::string host;
    static const int port;

    sf::Http::Response::Status FetchTemplates();
    sf::Http::Response::Status FetchTemplate(std::string id);
    void RefreshTemplate();
    void RefreshList();
    void RefreshParameters();
};

}
#endif // EVENTSTOREDIALOG_H
