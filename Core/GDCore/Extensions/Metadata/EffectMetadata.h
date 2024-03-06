/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

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
   EffectMetadata(const gd::String &type_)
       : type(type_), isMarkedAsNotWorkingForObjects(false),
         isMarkedAsOnlyWorkingFor2D(false), isMarkedAsOnlyWorkingFor3D(false),
         isMarkedAsUnique(false) {}

   /**
    * \brief Default constructor, only used for initializing
    * `badEffectMetadata`.
    */
   EffectMetadata() {}

   virtual ~EffectMetadata(){};

   /**
    * \brief Set the name shown to the user.
    */
   EffectMetadata &SetFullName(const gd::String &fullname_) {
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
   * \deprecated Use `AddIncludeFile` instead as clearing the list is more
   * error prone.
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
   * \brief Mark the effect as not working as an object effect.
   */
  EffectMetadata& MarkAsNotWorkingForObjects() {
    isMarkedAsNotWorkingForObjects = true;
    return *this;
  }

  /**
   * \brief Mark the effect as only working for the 2D renderer.
   */
  EffectMetadata& MarkAsOnlyWorkingFor2D() {
    isMarkedAsOnlyWorkingFor2D = true;
    return *this;
  }

  /**
   * \brief Mark the effect as only working for the 3D renderer.
   */
  EffectMetadata& MarkAsOnlyWorkingFor3D() {
    isMarkedAsOnlyWorkingFor3D = true;
    return *this;
  }

  /**
   * \brief Mark the effect as only addable once.
   */
  EffectMetadata& MarkAsUnique() {
    isMarkedAsUnique = true;
    return *this;
  }

  /**
   * \brief Check if the effect is marked as not working as an object effect.
   */
  bool IsMarkedAsNotWorkingForObjects() const {
    return isMarkedAsNotWorkingForObjects;
  };

  /**
   * \brief Check if the effect is marked as only working for the 2D renderer.
   */
  bool IsMarkedAsOnlyWorkingFor2D() const {
    return isMarkedAsOnlyWorkingFor2D;
  };

  /**
   * \brief Check if the effect is marked as only working for the 3D renderer.
   */
  bool IsMarkedAsOnlyWorkingFor3D() const {
    return isMarkedAsOnlyWorkingFor3D;
  };

  /**
   * \brief Check if the effect can only be added once.
   */
  bool IsMarkedAsUnique() const {
    return isMarkedAsUnique;
  };

 private:
  gd::String extensionNamespace;
  gd::String type;
  gd::String helpPath;
  gd::String fullname;
  gd::String description;
  std::vector<gd::String> includeFiles;
  bool isMarkedAsNotWorkingForObjects;
  bool isMarkedAsOnlyWorkingFor2D;
  bool isMarkedAsOnlyWorkingFor3D;
  bool isMarkedAsUnique;
  std::map<gd::String, gd::PropertyDescriptor> properties;
};

}  // namespace gd
