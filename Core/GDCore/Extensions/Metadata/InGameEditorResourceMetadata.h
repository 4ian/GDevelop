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
 * \brief Describe a resource to be used in the in-game editor.
 */
class GD_CORE_API InGameEditorResourceMetadata {
 public:
  InGameEditorResourceMetadata() {};

  InGameEditorResourceMetadata& SetResourceName(const gd::String& resourceName_) {
    resourceName = resourceName_;
    return *this;
  };

  /**
   * Set the file path relative to the Runtime folder.
   * In-game editor resources are not copied during a preview.
   * Instead, they are included in the exported project with an absolute path.
   */
  InGameEditorResourceMetadata& SetFilePath(const gd::String& relativeFilePath_) {
    relativeFilePath = relativeFilePath_;
    return *this;
  };

  InGameEditorResourceMetadata& SetKind(const gd::String& kind_) {
    kind = kind_;
    return *this;
  };

  const gd::String& GetResourceName() const { return resourceName; };
  const gd::String& GetFilePath() const { return relativeFilePath; };
  const gd::String& GetKind() const { return kind; };

 private:
  gd::String resourceName;
  gd::String relativeFilePath;
  gd::String kind;
};

}  // namespace gd