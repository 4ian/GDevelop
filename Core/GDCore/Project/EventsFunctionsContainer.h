/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef GDCORE_EVENTSFUNCTIONSCONTAINER_H
#define GDCORE_EVENTSFUNCTIONSCONTAINER_H
#include <vector>
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/String.h"
#include "GDCore/Tools/SerializableWithNameList.h"
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Used as a base class for classes that will own events-backed
 * functions.
 *
 * \see gd::EventsFunctionContainer
 * \ingroup PlatformDefinition
 */
class GD_CORE_API EventsFunctionsContainer
    : private SerializableWithNameList<gd::EventsFunction> {
public:
  enum FunctionOwner {
      Extension,
      Object,
      Behavior};

  EventsFunctionsContainer(FunctionOwner source_) : owner(source_) {}

  /**
   * \brief Get the source of the function container.
   * 
   * \note For instance, it can be useful to handle specific parameters for
   * behaviors.
   */
  FunctionOwner GetOwner() const {
    return owner;
  }

  /** \name Events Functions management
   */
  ///@{
  /**
   * \brief Check if the function with the specified name exists.
   */
  bool HasEventsFunctionNamed(const gd::String& name) const {
    return Has(name);
  }

  /**
   * \brief Get the function with the specified name.
   *
   * \warning Trying to access to a not existing function will result in
   * undefined behavior.
   */
  gd::EventsFunction& GetEventsFunction(const gd::String& name) {
    return Get(name);
  }

  /**
   * \brief Get the function with the specified name.
   *
   * \warning Trying to access to a not existing function will result in
   * undefined behavior.
   */
  const gd::EventsFunction& GetEventsFunction(const gd::String& name) const {
    return Get(name);
  }

  /**
   * \brief Get the function at the specified index in the list.
   *
   * \warning Trying to access to a not existing function will result in
   * undefined behavior.
   */
  gd::EventsFunction& GetEventsFunction(std::size_t index) {
    return Get(index);
  }

  /**
   * \brief Get the function at the specified index in the list.
   *
   * \warning Trying to access to a not existing function will result in
   * undefined behavior.
   */
  const gd::EventsFunction& GetEventsFunction(std::size_t index) const {
    return Get(index);
  }

  /**
   * \brief Return the number of functions.
   */
  std::size_t GetEventsFunctionsCount() const { return GetCount(); }

  gd::EventsFunction& InsertNewEventsFunction(const gd::String& name,
                                              std::size_t position) {
    return InsertNew(name, position);
  }
  gd::EventsFunction& InsertEventsFunction(const gd::EventsFunction& object,
                                           std::size_t position) {
    return Insert(object, position);
  }
  void RemoveEventsFunction(const gd::String& name) { return Remove(name); }
  void MoveEventsFunction(std::size_t oldIndex, std::size_t newIndex) {
    return Move(oldIndex, newIndex);
  };
  std::size_t GetEventsFunctionPosition(const gd::EventsFunction& eventsFunction) {
    return GetPosition(eventsFunction);
  };

  /**
   * \brief Provide a raw access to the vector containing the functions.
   */
  const std::vector<std::unique_ptr<gd::EventsFunction>>& GetInternalVector()
      const {
    return elements;
  };

  /**
   * \brief Provide a raw access to the vector containing the functions.
   */
  std::vector<std::unique_ptr<gd::EventsFunction>>& GetInternalVector() {
    return elements;
  };
  ///@}

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize events functions.
   */
  void SerializeEventsFunctionsTo(SerializerElement& element) const {
    return SerializeElementsTo("eventsFunction", element);
  };

  /**
   * \brief Unserialize the events functions.
   */
  void UnserializeEventsFunctionsFrom(gd::Project& project,
                                      const SerializerElement& element) {
    return UnserializeElementsFrom("eventsFunction", project, element);
  };
  ///@}
 protected:
  /**
   * Initialize object using another object. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   */
  void Init(const gd::EventsFunctionsContainer& other) {
    return SerializableWithNameList<gd::EventsFunction>::Init(other);
  };

private:
  FunctionOwner owner;
};

}  // namespace gd

#endif  // GDCORE_EVENTSFUNCTIONSCONTAINER_H
#endif
