/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef LAYERSPROPGRIDHELPER_H
#define LAYERSPROPGRIDHELPER_H
#include <wx/propgrid/propgrid.h>
#include <vector>
namespace gd { class Layer; }
namespace gd { class Project; }
namespace gd { class Layout; }

namespace gd
{

/**
 * \brief Helper class used to easily use a wxPropertyGrid so as to view and edit the properties of
 * a gd::Layer
 *
 * \ingroup IDEdialogs
 */
class GD_CORE_API LayerPropgridHelper
{
public:

    /**
     * \brief Default constructor.
     * \param grid A pointer to the wxPropertyGrid to be used.
     * \param project The project edited
     * \param layout The layout being edited
     */
    LayerPropgridHelper(gd::Project & project_, gd::Layout & layout_);
    virtual ~LayerPropgridHelper() {};

    void RefreshFrom(const Layer & layer);

    bool OnPropertySelected(Layer & layer, wxPropertyGridEvent& event);

    bool OnPropertyChanged(Layer & layer, wxPropertyGridEvent& event);

    void SetGrid(wxPropertyGrid * grid_) { grid = grid_; }

private:
    wxPropertyGrid * grid; ///< The grid used for diplaying and editing properties.
    gd::Project & project;
    gd::Layout & layout;
    wxArrayString effectNames; ///< Hardcoded names of the available effects
};

}

#endif // LAYERSPROPGRIDHELPER_H
#endif
