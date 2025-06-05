/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <vector>

#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"

namespace gd {

/**
 * @brief The change of a specific extension version (only the breaking
 * changes).
 */
class GD_CORE_API EventsFunctionsExtensionVersionChange {
public:
  EventsFunctionsExtensionVersionChange(){};
  virtual ~EventsFunctionsExtensionVersionChange(){};

  const gd::String &GetVersion() const { return version; };
  gd::EventsFunctionsExtensionVersionChange &
  SetVersion(const gd::String &version_) {
    version = version_;
    return *this;
  }

  const gd::String &GetBreakingChangesDescription() const { return version; };
  gd::EventsFunctionsExtensionVersionChange &
  GetBreakingChangesDescription(const gd::String &breakingChangesDescription_) {
    breakingChangesDescription = breakingChangesDescription_;
    return *this;
  }

  /**
   * \brief Serialize the EventsFunctionsExtensionVersionChange to the specified
   * element
   */
  void SerializeTo(gd::SerializerElement &element) const {
    element.SetAttribute("version", version);
    element.AddChild("breaking")
        .SetMultilineStringValue(breakingChangesDescription);
  }

  /**
   * \brief Load the EventsFunctionsExtensionVersionChange from the specified
   * element.
   */
  void UnserializeFrom(const gd::SerializerElement &element) {
    version = element.GetStringAttribute("version");
    breakingChangesDescription =
        element.GetChild("breaking").GetMultilineStringValue();
  }

private:
  gd::String version;
  gd::String breakingChangesDescription;
};

/**
 * @brief The changelog of an extension (only the breaking changes).
 */
class GD_CORE_API EventsFunctionsExtensionChangelog {
public:
  EventsFunctionsExtensionChangelog(){};
  virtual ~EventsFunctionsExtensionChangelog(){};

  /**
   * \brief Serialize the EventsFunctionsExtensionChangelog to the specified
   * element
   */
  void SerializeTo(gd::SerializerElement &element) const {
    element.ConsiderAsArray();
    for (const auto &versionChange : versionChanges) {
      versionChange.SerializeTo(element.AddChild(""));
    }
  }

  /**
   * \brief Load the EventsFunctionsExtensionChangelog from the specified
   * element.
   */
  void UnserializeFrom(const gd::SerializerElement &element) {
    versionChanges.clear();
    element.ConsiderAsArray();
    for (std::size_t i = 0; i < element.GetChildrenCount(); ++i) {
      gd::EventsFunctionsExtensionVersionChange versionChange;
      versionChange.UnserializeFrom(element.GetChild(i));
      versionChanges.push_back(versionChange);
    }
  }

private:
  std::vector<gd::EventsFunctionsExtensionVersionChange> versionChanges;
};

} // namespace gd
