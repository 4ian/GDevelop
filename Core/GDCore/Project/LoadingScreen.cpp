/*
 * GDevelop Core
 * Copyright 2008-2018 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "LoadingScreen.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

void LoadingScreen::SerializeTo(SerializerElement& element) const
{
    element.SetAttribute("showGDevelopSplash", showGDevelopSplash);
}

void LoadingScreen::UnserializeFrom(const SerializerElement& element)
{
    showGDevelopSplash = element.GetBoolAttribute("showGDevelopSplash", true);
}
}
