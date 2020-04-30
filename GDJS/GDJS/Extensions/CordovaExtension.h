/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef CORDOVAEXTENSION_H
#define CORDOVAEXTENSION_H
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/String.h"
#include <vector>

namespace gdjs {
    /**
     * \brief Extension for Cordova games
     * 
     * This is an Extension type for games compiled to the Cordova Platform.
     * The difference with a normal extension is that it let you add
     * Cordova plugins in the exported game.
     */
    class GD_API CordovaExtension : public gd::PlatformExtension {
        public:
            // New methods
            /**
             * \brief Adds a cordova plugin include to the extension.
             */
            CordovaExtension& AddCordovaPlugin(const gd::String);

            /**
             * \brief Get all cordova plugins to export.
             */
            std::vector<gd::String> GetCordovaPluginList() { return cordovaPlugins; };
            
            // Override the return type of inherited methods
            CordovaExtension& SetExtensionInformation (
                const gd::String& name_,
                const gd::String& fullname_,
                const gd::String& description_,
                const gd::String& author_,
                const gd::String& license_
            ) { gd::PlatformExtension::SetExtensionInformation(name_, fullname_, description_, author_, license_); return *this; };

            CordovaExtension& SetExtensionHelpPath(const gd::String& helpPath) { gd::PlatformExtension::SetExtensionHelpPath(helpPath); return *this; };

        private:
            std::vector<gd::String> cordovaPlugins; ///< Vector of all cordova plugins to include
    };
} // namespace gdjs
#endif // CORDOVAEXTENSION_H
