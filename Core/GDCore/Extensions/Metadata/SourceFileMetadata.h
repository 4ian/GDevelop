/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include "GDCore/String.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {
/**
 * \brief Contains information about a source file that must be included
 * when an extension is used.
 */
class GD_CORE_API SourceFileMetadata {
 public:
  /**
   * Construct a new dependency metadata, though you probably want to call
   * `AddSourceFile` on gd::PlatformExtension.
   *
   * \see gd::PlatformExtension
   */
  SourceFileMetadata() {};

  SourceFileMetadata& SetResourceName(const gd::String& resourceName_) {
    resourceName = resourceName_;
    return *this;
  };

  SourceFileMetadata& SetIncludePosition(const gd::String& includePosition_) {
    includePosition = includePosition_;
    return *this;
  };

  const gd::String& GetResourceName() const { return resourceName; };

  gd::String& GetResourceName() { return resourceName; };

  const gd::String& GetIncludePosition() const { return includePosition; };

  void SerializeTo(SerializerElement& element) const {
    element.AddChild("resourceName").SetStringValue(resourceName);
    element.AddChild("includePosition").SetStringValue(includePosition);
  }

  void UnserializeFrom(const SerializerElement& element) {
    resourceName = element.GetStringAttribute("resourceName");
    includePosition = element.GetStringAttribute("includePosition", "last");
  }

 private:
  gd::String resourceName;  ///< The name of the resource in the project.
  gd::String includePosition = "last";  ///< "first" or "last".
};

}  // namespace gd