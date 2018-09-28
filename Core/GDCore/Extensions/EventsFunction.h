/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef GDCORE_EVENTSFUNCTION_H
#define GDCORE_EVENTSFUNCTION_H

#include <vector>
#include "GDCore/Events/EventsList.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
class Project;
}  // namespace gd

namespace gd {

/**
 * \brief Events that can be generated as a stand-alone function.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API EventsFunction {
 public:
  EventsFunction();
  virtual ~EventsFunction(){};

  const gd::String & GetDescription() const { return description; };
  EventsFunction& SetDescription(const gd::String & description_) { description = description_; return *this; }

  const gd::String & GetName() const { return name; };
  EventsFunction& SetName(const gd::String & name_) { name = name_; return *this; }

  const gd::String & GetFullName() const { return fullName; };
  EventsFunction& SetFullName(const gd::String & fullName_) { fullName = fullName_; return *this; }

  /**
   * \brief Return the events.
   */
  const gd::EventsList& GetEvents() const { return events; };

  /**
   * \brief Return the events.
   */
  gd::EventsList& GetEvents() { return events; };

  /**
   * \brief Return the parameters.
   */
  const std::vector<gd::ParameterMetadata>& GetParameters() const {
    return parameters;
  };

  /**
   * \brief Return the parameters.
   */
  std::vector<gd::ParameterMetadata>& GetParameters() {
    return parameters;
  };

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the EventsFunction to the specified element
   */
  void SerializeTo(gd::SerializerElement& element) const;

  /**
   * \brief Load the EventsFunction from the specified element
   */
  void UnserializeFrom(gd::Project& project,
                       const gd::SerializerElement& element);
  ///@}

 private:
  gd::String name;
  gd::String fullName;
  gd::String description;
  gd::EventsList events;
  std::vector<gd::ParameterMetadata> parameters;
};

}  // namespace gd

#endif  // GDCORE_EVENTSFUNCTION_H
#endif
