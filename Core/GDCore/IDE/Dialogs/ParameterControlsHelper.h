/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCore_ParameterControlsHelper_H
#define GDCore_ParameterControlsHelper_H
#include <vector>
#include <wx/event.h>
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
namespace gd { class Project; }
namespace gd { class Layout; }
class wxCommandEvent;
class wxWindow;
class wxFlexGridSizer;
class wxCheckBox;
class wxPanel;
class wxStaticText;
class wxPanel;
class wxBitmapButton;
class wxTextCtrl;

namespace gd
{

/**
 * \brief Helper class used to create controls to edit parameters of an action/condition or
 * an event template.
 *
 * \ingroup IDEdialogs
 */
class GD_CORE_API ParameterControlsHelper : public wxEvtHandler
{
public:

    /**
     * \brief Default constructor.
     */
    ParameterControlsHelper(std::vector < wxCheckBox * > & paramCheckboxes_, std::vector < wxPanel * > & paramSpacers1_,
    std::vector < wxStaticText * > & paramTexts_, std::vector < wxPanel * > & paramSpacers2_,
    std::vector < wxBitmapButton * > & paramBmpBts_, std::vector < wxTextCtrl * > & paramEdits_) :
        paramEdits(paramEdits_),
        paramCheckboxes(paramCheckboxes_),
        paramSpacers1(paramSpacers1_),
        paramTexts(paramTexts_),
        paramSpacers2(paramSpacers2_),
        paramBmpBts(paramBmpBts_),
        editionCallbackProject(NULL),
        editionCallbackLayout(NULL)
    {
    };

    virtual ~ParameterControlsHelper() {};

    /**
     * \brief Set the window and the sizer where controls must be created.
     * \note The sizer must be contained inside the window set in the constructor.
     * \return *this
     */
    ParameterControlsHelper & SetWindowAndSizer(wxWindow * window, wxFlexGridSizer * sizer);

    /**
     * \brief Set the project and layout to be used to edit parameters.
     * \param project The project that will be passed to the function
     * \param layout The layout that will be passed to the function
     */
    void SetProjectAndLayout(gd::Project & project, gd::Layout & layout) {
        editionCallbackProject = &project;
        editionCallbackLayout = &layout;
    };

    /**
     * \brief Create/destroy the controls for displaying the specified number of parameters.
     * \warning The sizer must have been set.
     * \see gd::ParameterControlsHelper::SetWindowAndSizer
     */
    void UpdateControls(std::size_t count);

    /**
     * \brief Update the controls of a parameter using the specified content
     * and the metadata provided.
     * \note A copy of the metadata is stored.
     */
    void UpdateParameterContent(std::size_t i, const ParameterMetadata & metadata, gd::String content);

    /**
     * \brief The prototype of the function that can be called
     * when a parameter must be edited.
     * \see gd::ParameterControlsHelper::SetEditParameterFunction
     */
    typedef void (* EditParameterFunction)(wxWindow * parent,
        gd::Project &, gd::Layout &, const ParameterMetadata & paramMetadata,
        std::vector<wxTextCtrl * > & paramEdits, std::size_t paramIndex);

    /**
     * \brief Set the function that will be called when a parameter should be edited.
     * \param function The function to be called
     */
    static void SetEditParameterFunction(EditParameterFunction function) {
        editionCallback = function;
    };

private:
    wxWindow * window;
    wxFlexGridSizer * sizer;
    std::vector < wxCheckBox * > & paramCheckboxes;
    std::vector < wxPanel * > & paramSpacers1;
    std::vector < wxStaticText * > & paramTexts;
    std::vector < wxPanel * > & paramSpacers2;
    std::vector < wxBitmapButton * > & paramBmpBts;
    std::vector < wxTextCtrl * > & paramEdits;
    std::vector < gd::ParameterMetadata > paramMetadata;
    gd::Project * editionCallbackProject;
    gd::Layout * editionCallbackLayout;

    static EditParameterFunction editionCallback; ///< The function to be called whenever a parameter must be edited.
    static const long ID_TEXTARRAY;
    static const long ID_EDITARRAY;
    static const long ID_BUTTONARRAY;
    static const long ID_CHECKARRAY;

    void OnOptionalCheckboxClick(wxCommandEvent& event);
    void OnParameterBtClick(wxCommandEvent& event);
};

}

#endif // GDCore_ParameterControlsHelper_H
#endif
