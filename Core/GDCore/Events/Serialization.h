/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EVENTS_SERIALIZATION_H
#define GDCORE_EVENTS_SERIALIZATION_H
#include <vector>
#include "GDCore/Serialization/Serializer.h"
namespace gd {
class InstructionsList;
}
namespace gd {
class Project;
}
namespace gd {
class EventsList;
}

namespace gd {

/**
 * \brief Contains tools for loading and saving events to SerializerElement.
 */
class GD_CORE_API EventsListSerialization {
 public:
  /**
   * \brief Load an events list from a SerializerElement
   * \param project The project the events belongs to.
   * \param list The event list in which the events must be loaded.
   * \param events The SerializerElement containing the events
   */
  static void UnserializeEventsFrom(gd::Project& project,
                                    gd::EventsList& list,
                                    const SerializerElement& events);

  /**
   * \brief Save an events list to a SerializerElement
   * \param list The event list to be saved.
   * \param events The SerializerElement in which the events must be serialized.
   */
  static void SerializeEventsTo(const gd::EventsList& list,
                                SerializerElement& events);

  /**
   * \brief Unserialize a list of instructions
   */
  static void UnserializeInstructionsFrom(gd::Project& project,
                                          gd::InstructionsList& list,
                                          const SerializerElement& elem);

  /**
   * \brief Serialize a list of instructions
   */
  static void SerializeInstructionsTo(const gd::InstructionsList& list,
                                      SerializerElement& elem);

 private:
  /**
   * \brief Internal method called when opening events created with GD2.x
   *
   * Some instructions names have been changed as well as parameters since GD 3.
   */
  static void UpdateInstructionsFromGD2x(gd::Project& project,
                                         gd::InstructionsList& list,
                                         bool instructionsAreActions);

  /**
   * \brief Internal method called when opening events created with GD 3.1.x
   *
   * Variables related and some storage instructions have been changed.
   */
  static void UpdateInstructionsFromGD31x(gd::Project& project,
                                          gd::InstructionsList& list);
  
  /**
   * \brief Internal method called when opening events created with GD <= 4.0.97
   *
   * PointX/PointY would previously take a name of a point without quotes.
   * This is not providing any value and inconsistent with everything else.
   * Add quotes around them.
   */
  static void UpdateInstructionsFromGD4097(gd::Project& project,
                                          gd::InstructionsList& list);
};

}  // namespace gd

#endif  // GDCORE_EVENTS_SERIALIZATION_H
