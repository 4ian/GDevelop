/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <map>
#include <memory>
#include <vector>

#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EffectsContainer.h"
#include "GDCore/Project/ObjectConfiguration.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/String.h"
#include "GDCore/Tools/MakeUnique.h"
#include "GDCore/Vector2.h"

namespace gd {
class PropertyDescriptor;
class Project;
class Layout;
class ArbitraryResourceWorker;
class InitialInstance;
class SerializerElement;
class EffectsContainer;
} // namespace gd

namespace gd {

/**
 * \brief Represent an behaviors container of a platform
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API BehaviorsContainer {
public:
  /**
   * Create a new behaviors container with the name passed as argument.
   */
  BehaviorsContainer(bool isOverriding = false);

  /**
   * Copy constructor. Calls Init().
   */
  BehaviorsContainer(const gd::BehaviorsContainer &behaviorsContainer) {
    Init(behaviorsContainer);
  };

  /**
   * Assignment operator. Calls Init().
   */
  BehaviorsContainer &
  operator=(const gd::BehaviorsContainer &behaviorsContainer) {
    if ((this) != &behaviorsContainer)
      Init(behaviorsContainer);
    return *this;
  }

  /**
   * Destructor.
   */
  virtual ~BehaviorsContainer();

  /** \name Behaviors management
   * Members functions related to behaviors management.
   */
  ///@{

  /**
   * \brief Return a vector containing the names of all the behaviors used by
   * the behaviors container
   */
  std::vector<gd::String> GetAllBehaviorNames() const;

  /**
   * \brief Return a reference to the content of the behavior called \a name.
   */
  Behavior &GetBehavior(const gd::String &name);

  /**
   * \brief Return a reference to the content of the behavior called \a name.
   */
  const Behavior &GetBehavior(const gd::String &name) const;

  /**
   * \brief Return true if behaviors container has a behavior called \a name.
   */
  bool HasBehaviorNamed(const gd::String &name) const;

  /**
   * \brief Remove behavior called \a name
   */
  void RemoveBehavior(const gd::String &name);

  /**
   * \brief Change the name of behavior called name to newName.
   * \return true if name was successfully changed
   */
  bool RenameBehavior(const gd::String &name, const gd::String &newName);

  /**
   * \brief Add the behavior of the specified \a type with the specified \a
   * name.
   *
   * The project's current platform is used to initialize the content.
   *
   * \return A pointer to the newly added behavior content. NULL if the creation
   * failed.
   */
  gd::Behavior *AddNewBehavior(const gd::Project &project,
                               const gd::String &type, const gd::String &name);

  /**
   * \brief Get a read-only access to the map containing the behaviors with
   * their properties.
   */
  const std::map<gd::String, std::unique_ptr<gd::Behavior>> &
  GetAllBehaviorContents() const {
    return behaviors;
  };
  ///@}

  /** \name Serialization
   * Members functions related to serialization of the behaviors container
   */
  ///@{
  /**
   * \brief Serialize the behaviors container.
   * \see DoSerializeTo
   */
  void SerializeTo(SerializerElement &element) const;

  /**
   * \brief Unserialize the behaviors container.
   * \see DoUnserializeFrom
   */
  void UnserializeFrom(gd::Project &project, const SerializerElement &element);

protected:
  bool isOverriding = false;
  std::map<gd::String, std::unique_ptr<gd::Behavior>>
      behaviors; ///< Contains all behaviors and their properties for the
                 ///< behaviors container. Behavior contents are the ownership
                 ///< of the behaviors container.

  /**
   * Initialize behaviors container using another behaviors container. Used by
   * copy-ctor and assign-op. Don't forget to update me if members were changed!
   *
   * It's needed because there is no default copy for a map of unique_ptr like
   * behaviors and it must be a deep copy.
   */
  void Init(const gd::BehaviorsContainer &behaviorsContainer);
};

} // namespace gd
