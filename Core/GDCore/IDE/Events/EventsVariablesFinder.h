/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EVENTSVARIABLESFINDER_H
#define EVENTSVARIABLESFINDER_H
#include <set>
#include <vector>
#include "GDCore/Events/Event.h"
#include "GDCore/String.h"
namespace gd {
class Instruction;
class Platform;
class Object;
class Project;
class Layout;
}  // namespace gd

namespace gd {

/**
 * \brief Perform a search over a project or a layout, searching for layout,
 * global or object variables.
 *
 * \todo Refactor this class using ArbitraryEventsWorker
 *
 * \ingroup IDE
 */
class EventsVariablesFinder {
 public:
  /**
   * Construct a list containing the name of all global variables used in the
   * project.
   *
   * \param project The project to be scanned
   * \return A std::set containing the names of all global variables used
   */
  static std::set<gd::String> FindAllGlobalVariables(
      const gd::Platform& platform, const gd::Project& project);

  /**
   * Construct a list containing the name of all layout variables used in the
   * layout.
   *
   * \param project The project
   * \param layout The layout to be scanned
   * \return A std::set containing the names of all layout variables used.
   */
  static std::set<gd::String> FindAllLayoutVariables(
      const gd::Platform& platform,
      const gd::Project& project,
      const gd::Layout& layout);

  /**
   * Construct a list containing the name of all object variables used in the
   * layout.
   *
   * \param project The project
   * \param layout The layout to use.
   * \param  object The object to be scanned
   * \return A std::set containing the names of all object variables used.
   */
  static std::set<gd::String> FindAllObjectVariables(
      const gd::Platform& platform,
      const gd::Project& project,
      const gd::Layout& layout,
      const gd::Object& object);

 private:
  /**
   * Construct a list of the value of the arguments for parameters of type @
   * parameterType
   *
   * \param project The project used
   * \param project The layout used
   * \param instructions The instructions to be analyzed
   * \param instructionsAreConditions True if the instructions are conditions.
   * \param parameterType The parameters type to be analyzed
   * \param objectName If not empty, parameters will be taken into account only
   * if the last object parameter is filled with this value.
   *
   * \return A std::set filled with the values used for all parameters of the
   * specified type
   */
  static std::set<gd::String> FindArgumentsInInstructions(
      const gd::Platform& platform,
      const gd::Project& project,
      const gd::Layout& layout,
      const gd::InstructionsList& instructions,
      bool instructionsAreConditions,
      const gd::String& parameterType,
      const gd::String& objectName = "");

  /**
   * Construct a list of the value of the arguments for parameters of type @
   * parameterType
   *
   * \param project The project used
   * \param project The layout used
   * \param events The events to be analyzed
   * \param parameterType The parameters type to be analyzed
   * \param objectName If not empty, parameters will be taken into account
   * only if the last object parameter is filled with
   * this value.
   *
   * \return A std::set filled with the values used for all parameters of the
   * specified type
   */
  static std::set<gd::String> FindArgumentsInEvents(
      const gd::Platform& platform,
      const gd::Project& project,
      const gd::Layout& layout,
      const gd::EventsList& events,
      const gd::String& parameterType,
      const gd::String& objectName = "");

  EventsVariablesFinder(){};
  virtual ~EventsVariablesFinder(){};
};

}  // namespace gd

#endif  // EVENTSVARIABLESFINDER_H
