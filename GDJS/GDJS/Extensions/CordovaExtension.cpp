/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/Extensions/CordovaExtension.h"
#include "GDCore/String.h"
#include <vector>

namespace gdjs {
    CordovaExtension& CordovaExtension::AddCordovaPlugin(gd::String pluginName) {
        cordovaPlugins.push_back(pluginName);
        return *this;
    }
} // namespace gdjs