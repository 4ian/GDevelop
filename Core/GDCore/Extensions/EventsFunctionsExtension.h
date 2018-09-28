/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef GDCORE_EVENTSFUNCTIONEXTENSION_H
#define GDCORE_EVENTSFUNCTIONEXTENSION_H

#include <vector>
#include "GDCore/Extensions/EventsFunction.h"
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
class Project;
}  // namespace gd

namespace gd {

/**
 * \brief
 *
 * \ingroup Events
 */
class GD_CORE_API EventsFunctionsExtension {
 public:
  EventsFunctionsExtension();
  virtual ~EventsFunctionsExtension(){};

  const gd::String & GetVersion() const { return version; };
  EventsFunctionsExtension& SetVersion(const gd::String & version_) { version = version_; return *this; }

  const gd::String & GetNamespace() const { return extensionNamespace; };
  EventsFunctionsExtension& SetNamespace(const gd::String & namespace_) { extensionNamespace = namespace_; return *this; }

  const gd::String & GetDescription() const { return description; };
  EventsFunctionsExtension& SetDescription(const gd::String & description_) { description = description_; return *this; }

  const gd::String & GetName() const { return name; };
  EventsFunctionsExtension& SetName(const gd::String & name_) { name = name_; return *this; }

  const gd::String & GetFullName() const { return fullName; };
  EventsFunctionsExtension& SetFullName(const gd::String & fullName_) { fullName = fullName_; return *this; }

  /**
   * \brief Return the functions.
   */
  const std::vector<gd::EventsFunction>& GetEventsFunctions() const {
    return eventsFunctions;
  };

  /**
   * \brief Return the functions.
   */
  std::vector<gd::EventsFunction>& GetEventsFunctions() {
    return eventsFunctions;
  };

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the EventsFunctionsExtension to the specified element
   */
  void SerializeTo(gd::SerializerElement& element) const;

  /**
   * \brief Load the EventsFunctionsExtension from the specified element
   */
  void UnserializeFrom(gd::Project& project,
                       const gd::SerializerElement& element);
  ///@}

 private:
  gd::String version;
  gd::String extensionNamespace;
  gd::String description;
  gd::String name;
  gd::String fullName;
  std::vector<gd::EventsFunction> eventsFunctions;
};

}  // namespace gd

#endif  // GDCORE_EVENTSFUNCTIONEXTENSION_H
#endif
