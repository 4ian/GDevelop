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
   * Set the help path of the effect, relative to the documentation root.
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
   * Get the help path of the effect, relative to the documentation root.
   */
  const gd::String& GetHelpPath() const { return helpPath; }

  const gd::String& GetType() const { return type; }
#if defined(GD_IDE_ONLY)
  const gd::String& GetFullName() const { return fullname; }
  const gd::String& GetDescription() const { return description; }
  const std::vector<gd::String>& GetIncludeFiles() const {
    return includeFiles;
  }
#endif

 private:
  gd::String extensionNamespace;
  gd::String type;
  gd::String helpPath;
#if defined(GD_IDE_ONLY)
  gd::String fullname;
  gd::String description;
  std::vector<gd::String> includeFiles;
  std::map<gd::String, gd::PropertyDescriptor> properties;
#endif
};

}  // namespace gd
#endif  // EFFECTMETADATA_H
