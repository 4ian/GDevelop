/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#ifndef GDCore_ParameterEditorLauncher_H
#define GDCore_ParameterEditorLauncher_H
#include <vector>
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class ParameterMetadata; }
class wxCommandEvent;
class wxWindow;
class wxFlexGridSizer;
class wxCheckBox;
class wxPanel;
class wxStaticText;
class wxPanel;
class wxBitmapButton;
class wxTextCtrl;

/**
 * \brief Contains a function to launch the editor for a parameter.
 * \see gd::ParameterControlsHelper
 */
class ParameterEditorLauncher {
public:
	/**
	 * \brief Launch the editor to modify the specified parameter.
	 */
    static void LaunchEditor(wxWindow * parent, gd::Project &, gd::Layout &,
    	const gd::ParameterMetadata & paramMetadata,
        std::vector<wxTextCtrl * > & paramEdits, std::size_t paramIndex);

private:
	ParameterEditorLauncher() {};
	~ParameterEditorLauncher() {};
};
#endif
