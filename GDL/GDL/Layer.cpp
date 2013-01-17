/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Layer.h"
#if defined(GD_IDE_ONLY)
#include "GDL/IDE/Dialogs/EditLayerDialog.h"
#endif

Camera Layer::badCamera;

Layer::Layer() :
isVisible(true)
{
}

#if defined(GD_IDE_ONLY)
/**
 * Display a window to edit the layer
 */
void Layer::EditLayer()
{
    EditLayerDialog dialog(NULL, *this);
    dialog.ShowModal();
}
#endif
