/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EFFECTMETADATA_H
#define EFFECTMETADATA_H
#include <functional>
#include <map>
#include <memory>
#include <algorithm>

#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/String.h"

namespace gd {

/**
 * \brief Contains user-friendly information about an effect.
 *
 * \ingroup Events
 */
class GD_CORE_API EffectMetadata {
 public:
  /**
   * \brief Construct an effect metadata, with the given type
   */
  EffectMetadata(const gd::String& type_);

  /**
   * \brief Default constructor, only used for initializing `badEffectMetadata`.
   */
  EffectMetadata() {}

  virtual ~EffectMetadata(){};

  /**
   * \brief Set the name shown to the user.
   */
  EffectMetadata& SetFullName(const gd::String& fullname_) {
    fullname = fullname_;
    return *this;
  };

  /**
   * \brief Set the description shown to the user.
   */
  EffectMetadata& SetDescription(const gd::String& description_) {
    description = description_;
    return *this;
  };

  /**
   * Set the help path of the effect, relative to the GDevelop documentation
   * root.
   */
  EffectMetadata& SetHelpPath(const gd::String& path) {
    helpPath = path;
    return *this;
  }

  /**
   * \brief Clear any existing include file and add the specified include file.
   */
  EffectMetadata& SetIncludeFile(const gd::String& includeFile);

  /**
   * \brief Add a file to the already existing include files.
   */
  EffectMetadata& AddIncludeFile(const gd::String& includeFile);

  /**
   * \brief Mark the effect as not working as an object effect.
   */
  EffectMetadata& MarkAsNotWorkingForObjects();

  /**
   * \brief Return a reference to the properties of this effect.
   */
  std::map<gd::String, gd::PropertyDescriptor>& GetProperties() {
    return properties;
  }

  /**
   * \brief Return a (const) reference to the properties of this effect.
   */
  const std::map<gd::String, gd::PropertyDescriptor>& GetProperties() const {
    return properties;
  }

  /**
   * \brief Get the help path of the effect, relative to the GDevelop
   * documentation root.
   */
  const gd::String& GetHelpPath() const { return helpPath; }

  /**
   * \brief Get the type of the effect (its internal name, like
   * "BlackAndWhite").
   */
  const gd::String& GetType() const { return type; }

  /**
   * \brief Get the user facing name of the effect (like "Black and White").
   */
  const gd::String& GetFullName() const { return fullname; }

  /**
   * \brief Get the user friendly description of the effect.
   */
  const gd::String& GetDescription() const { return description; }

  /**
   * \brief Get the required include files for this effect.
   */
  const std::vector<gd::String>& GetIncludeFiles() const {
    return includeFiles;
  }

  /**
   * \brief Check if the effect is marked as not working as an object effect.
   */
  bool IsMarkedAsNotWorkingForObjects() const { return isMarkedAsNotWorkingForObjects; };

 private:
  gd::String extensionNamespace;
  gd::String type;
  gd::String helpPath;
  gd::String fullname;
  gd::String description;
  std::vector<gd::String> includeFiles;
  bool isMarkedAsNotWorkingForObjects;
  std::map<gd::String, gd::PropertyDescriptor> properties;
};

}  // namespace gd
#endif  // EFFECTMETADATA_H
