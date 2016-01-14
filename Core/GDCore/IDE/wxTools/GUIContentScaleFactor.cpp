/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "GDCore/IDE/wxTools/GUIContentScaleFactor.h"

//By default, consider that the screen content is rendered
//normally (no "retina" screen).
double gd::GUIContentScaleFactor::scaleFactor = 1.0;

#endif
