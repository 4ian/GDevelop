/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef GDCore_ParameterControlsHelper_H
#define GDCore_ParameterControlsHelper_H
#include <vector>
#include <wx/event.h>
class wxCommandEvent;
class wxWindow;
class wxGridSizer;
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
    ParameterControlsHelper(wxWindow * window_, std::vector < wxCheckBox * > & paramCheckboxes_, std::vector < wxPanel * > & paramSpacers1_,
    std::vector < wxStaticText * > & paramTexts_, std::vector < wxPanel * > & paramSpacers2_,
    std::vector < wxBitmapButton * > & paramBmpBts_, std::vector < wxTextCtrl * > & paramEdits_) :
        window(window_),
        paramEdits(paramEdits_),
        paramCheckboxes(paramCheckboxes_),
        paramSpacers1(paramSpacers1_),
        paramTexts(paramTexts_),
        paramSpacers2(paramSpacers2_),
        paramBmpBts(paramBmpBts_)
    {
    };

    /**
     * \brief Set the sizer where controls must be created.
     * \note The sizer must be contained inside the window set in the constructor.
     */
    ParameterControlsHelper & SetSizer(wxGridSizer * sizer_)
    {
        sizer = sizer_;
        return *this;
    }

    virtual ~ParameterControlsHelper() {};

    void UpdateControls(unsigned int size);
    void UpdateParameterContent(unsigned int i, bool show, bool isOptional,
        std::string description, std::string type, std::string content);

private:
    wxWindow * window;
    wxGridSizer * sizer;
    std::vector < wxCheckBox * > & paramCheckboxes;
    std::vector < wxPanel * > & paramSpacers1;
    std::vector < wxStaticText * > & paramTexts;
    std::vector < wxPanel * > & paramSpacers2;
    std::vector < wxBitmapButton * > & paramBmpBts;
    std::vector < wxTextCtrl * > & paramEdits;

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
