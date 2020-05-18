/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef DEPENDENCYMETADATA_H
#define DEPENDENCYMETADATA_H
#include <map>
#include "GDCore/String.h"
#include "GDCore/Project/PropertyDescriptor.h"

namespace gd {
    /**
     * \brief Types of dependencies supported.
     */
    enum DependencyTypes {
        invalid, // This one is the default one: a dependency with that type won't get exported.
        cordova,
        npm
    };


    /**
     * \brief Contains a information about a Dependency (library) of an extension.
     * \note Is subject to changes.
     */
    class GD_CORE_API DependencyMetadata {
        public:
            /**
             * \brief Sets the name shown to users.
             */
            DependencyMetadata& SetName(const gd::String& name_) {
                name = name_;
                return *this;
            };

            /**
             * \brief Sets the name used by the dependency manager to find the dependency.
             * \example 
             * \code
             *  // For depending upon the NPM package is-thirteen
             *  gd::DependencyMetadata dependencyMetadata = gd::DependencyMetadata();
             *  dependencyMetadata.setExporterName("is-thirteen");
             * \endcode
             */
            DependencyMetadata& SetExportName(const gd::String& exportName_) {
                exportName = exportName_;
                return *this;
            };

            /**
             * \brief Set the version of the dependency to install. Use -1 for latest.
             */
            DependencyMetadata& SetVersion(const gd::String& version_) {
                version = version_;
                return *this;
            };

            /**
             * \brief Sets the type of dependecy (What will be used to install it)
             */
            DependencyMetadata& SetDependencyType(DependencyTypes dependencyType_) {
                dependencyType = dependencyType_;
                return *this;
            };

            /**
             * \brief Sets a dependency type specific setting.
             */
            DependencyMetadata& SetExtraSetting(const gd::String& settingName, const gd::PropertyDescriptor& settingValue) {
                extraData[settingName] = settingValue;
                return *this;
            };

            const gd::String& GetName() const { return name; };
            const gd::String& GetExportName() const { return exportName; };
            const gd::String& GetVersion() const { return version; };
            DependencyTypes GetDependencyType() const { return dependencyType; };
            gd::PropertyDescriptor& GetExtraSetting(const gd::String& settingName) { return extraData[settingName]; };
            std::map<gd::String, gd::PropertyDescriptor>& GetAllExtraSettings() { return extraData; }

        private:
            gd::String name = ""; ///< The name of the dependency.
            gd::String exportName = ""; ///< The name used to install the package (example: npm package name for npm dependency type).
            gd::String version = "-1"; ///< The version of the dependency
            DependencyTypes dependencyType = DependencyTypes::invalid; ///< The tool used to install the dependency.
            std::map<gd::String, gd::PropertyDescriptor> extraData = std::map<gd::String, gd::PropertyDescriptor>(); ///< Contains dependency type specific additional parameters for the dependency.
    };
} // namespace gd
#endif  // DEPENDENCYMETADATA_H
