/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_OBJECT_H
#define GDCORE_OBJECT_H
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
}  // namespace gd

namespace gd {

/**
 * \brief Represent an object of a platform
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Object {
 public:
  /**
   * Create a new object with the name passed as argument.
   */
  Object(const gd::String& name,
         const gd::String& type,
         std::unique_ptr<gd::ObjectConfiguration> configuration);

  /**
   * Create a new object with the name passed as argument.
   *
   * Object takes the ownership of the configuration.
   */
  Object(const gd::String& name,
         const gd::String& type,
         gd::ObjectConfiguration* configuration);

  /**
   * Copy constructor. Calls Init().
   */
  Object(const gd::Object& object) { Init(object); };

  /**
   * Assignment operator. Calls Init().
   */
  Object& operator=(const gd::Object& object) {
    if ((this) != &object) Init(object);
    return *this;
  }

  /**
   * Destructor.
   */
  virtual ~Object();

  /**
   * Must return a pointer to a copy of the object. A such method is needed to
   * do polymorphic copies. Just redefine this method in your derived object
   * class like this:
   * \code
   * return gd::make_unique<MyObject>(*this);
   * \endcode
   */
  virtual std::unique_ptr<gd::Object> Clone() const {
    return gd::make_unique<gd::Object>(*this);
  }

  /**
   * \brief Return the object configuration.
   */
  gd::ObjectConfiguration& GetConfiguration();

  const gd::ObjectConfiguration& GetConfiguration() const;

  /** \name Common properties
   * Members functions related to common properties
   */
  ///@{

  /** \brief Change the name of the object with the name passed as parameter.
   */
  void SetName(const gd::String& name_) { name = name_; };

  /** \brief Return the name of the object.
   */
  const gd::String& GetName() const { return name; };

  /** \brief Change the asset store id of the object.
   */
  void SetAssetStoreId(const gd::String& assetStoreId_) {
    assetStoreId = assetStoreId_;
  };

  /** \brief Return the asset store id of the object.
   */
  const gd::String& GetAssetStoreId() const { return assetStoreId; };

  /** \brief Change the type of the object.
   */
  void SetType(const gd::String& type_) { configuration->SetType(type_); }

  /** \brief Return the type of the object.
   */
  const gd::String& GetType() const { return configuration->GetType(); }

  ///@}

  /** \name Behaviors management
   * Members functions related to behaviors management.
   */
  ///@{

  /**
   * \brief Return a vector containing the names of all the behaviors used by
   * the object
   */
  std::vector<gd::String> GetAllBehaviorNames() const;

  /**
   * \brief Return a reference to the content of the behavior called \a name.
   */
  Behavior& GetBehavior(const gd::String& name);

  /**
   * \brief Return a reference to the content of the behavior called \a name.
   */
  const Behavior& GetBehavior(const gd::String& name) const;

  /**
   * \brief Return true if object has a behavior called \a name.
   */
  bool HasBehaviorNamed(const gd::String& name) const;

  /**
   * \brief Remove behavior called \a name
   */
  void RemoveBehavior(const gd::String& name);

  /**
   * \brief Change the name of behavior called name to newName.
   * \return true if name was successfully changed
   */
  bool RenameBehavior(const gd::String& name, const gd::String& newName);

  /**
   * \brief Add the behavior of the specified \a type with the specified \a
   * name.
   *
   * The project's current platform is used to initialize the content.
   *
   * \return A pointer to the newly added behavior content. NULL if the creation
   * failed.
   */
  gd::Behavior* AddNewBehavior(const gd::Project& project,
                               const gd::String& type,
                               const gd::String& name);

  /**
   * \brief Get a read-only access to the map containing the behaviors with
   * their properties.
   */
  const std::map<gd::String, std::unique_ptr<gd::Behavior>>&
  GetAllBehaviorContents() const {
    return behaviors;
  };
  ///@}

  /** \name Variable management
   * Members functions related to object variables management.
   */
  ///@{
  /**
   * \brief Provide access to the gd::VariablesContainer member containing the
   * object variables
   */
  const gd::VariablesContainer& GetVariables() const { return objectVariables; }

  /**
   * \brief Provide access to the gd::VariablesContainer member containing the
   * object variables
   */
  gd::VariablesContainer& GetVariables() { return objectVariables; }
  ///@}

  /**
   * \name Effects management
   * Member functions related to effects management.
   */
  ///@{
  /**
   * \brief Provide access to the gd::EffectsContainer member containing the
   * effects.
   */
  const gd::EffectsContainer& GetEffects() const { return effectsContainer; }

  /**
   * \brief Provide access to the gd::EffectsContainer member containing the
   * effects.
   */
  gd::EffectsContainer& GetEffects() { return effectsContainer; }
  ///@}

  /** \name Serialization
   * Members functions related to serialization of the object
   */
  ///@{
  /**
   * \brief Serialize the object.
   * \see DoSerializeTo
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the object.
   * \see DoUnserializeFrom
   */
  void UnserializeFrom(gd::Project& project, const SerializerElement& element);

  /**
   * \brief Reset the persistent UUID, used to recognize
   * the same object between serialization.
   */
  Object& ResetPersistentUuid();

  /**
   * \brief Remove the persistent UUID - when the object no
   * longer need to be recognized between serializations.
   */
  Object& ClearPersistentUuid();
  ///@}

 protected:
  gd::String name;          ///< The full name of the object
  gd::String assetStoreId;  ///< The ID of the asset if the object comes from
                            ///< the store.
  std::unique_ptr<gd::ObjectConfiguration> configuration;
  std::map<gd::String, std::unique_ptr<gd::Behavior>>
      behaviors;  ///< Contains all behaviors and their properties for the
                  ///< object. Behavior contents are the ownership of the
                  ///< object.
  gd::VariablesContainer
      objectVariables;  ///< List of the variables of the object
  gd::EffectsContainer
      effectsContainer;  ///< The effects container for the object.
  mutable gd::String persistentUuid;  ///< A persistent random version 4 UUID,
                                      ///< useful for computing changesets.

  /**
   * Initialize object using another object. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   *
   * It's needed because there is no default copy for a map of unique_ptr like
   * behaviors and it must be a deep copy.
   */
  void Init(const gd::Object& object);
};

/**
 * \brief Functor testing object name
 *
 * \see gd::Object
 */
struct ObjectHasName : public std::binary_function<std::unique_ptr<gd::Object>,
                                                   gd::String,
                                                   bool> {
  bool operator()(const std::unique_ptr<gd::Object>& object,
                  const gd::String& name) const {
    return object->GetName() == name;
  }
};

}  // namespace gd

#endif  // GDCORE_OBJECT_H
