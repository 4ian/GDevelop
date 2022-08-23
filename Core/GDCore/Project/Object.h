/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_OBJECT_H
#define GDCORE_OBJECT_H
#include "GDCore/Vector2.h"
#include <map>
#include <memory>
#include <vector>

#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EffectsContainer.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/String.h"
#include "GDCore/Tools/MakeUnique.h"
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
 * \brief Base class used to represent an object of a platform
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Object {
 public:
  /**
   * Create a new object with the name passed as argument.
   * \param name Object's name
   */
  Object(const gd::String& name);

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
  void SetAssetStoreId(const gd::String& assetStoreId_) { assetStoreId = assetStoreId_; };

  /** \brief Return the asset store id of the object.
   */
  const gd::String& GetAssetStoreId() const { return assetStoreId; };

  /** \brief Change the type of the object.
   */
  void SetType(const gd::String& type_) { type = type_; }

  /** \brief Return the type of the object.
   */
  const gd::String& GetType() const { return type; }

  /** \brief Change the tags of the object.
   */
  void SetTags(const gd::String& tags_) { tags = tags_; }

  /** \brief Return the tags of the object.
   */
  const gd::String& GetTags() const { return tags; }
  ///@}

  /** \name Resources management
   * Members functions related to managing resources used by the object
   */
  ///@{
  /**
   * \brief Called ( e.g. during compilation ) so as to inventory internal
   * resources and sometimes update their filename. Implementation example:
   * \code
   * worker.ExposeImage(myImage);
   * worker.ExposeFile(myResourceFile);
   * \endcode
   *
   * \see ArbitraryResourceWorker
   */
  virtual void ExposeResources(gd::ArbitraryResourceWorker& worker) { return; };

  /**
   * Redefine this function to return true if your object can use shaders.
   */
  virtual bool SupportShaders() { return false; }
  ///@}

  /** \name Object properties
   * Reading and updating object properties
   */
  ///@{
  /**
   * \brief Called when the IDE wants to know about the custom properties of the
   object.
   *
   * Usage example:
   \code
      std::map<gd::String, gd::PropertyDescriptor> properties;
      properties[ToString(_("Text"))].SetValue("Hello world!");

      return properties;
   \endcode
   *
   * \return a std::map with properties names as key.
   * \see gd::PropertyDescriptor
   */
  virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties() const;

  /**
   * \brief Called when the IDE wants to update a custom property of the object
   *
   * \return false if the new value cannot be set
   */
  virtual bool UpdateProperty(const gd::String& name, const gd::String& value) {
    return false;
  };
  ///@}

  /** \name Drawing and editing initial instances
   * Members functions related to drawing and editing initial instances of this
   * object
   */
  ///@{
  /**
   * \brief Called when the IDE wants to know about the custom properties of an
   * initial instance of this object.
   *
   * \return a std::map with properties names as key and values.
   * \see gd::InitialInstance
   */
  virtual std::map<gd::String, gd::PropertyDescriptor>
  GetInitialInstanceProperties(const gd::InitialInstance& instance,
                               gd::Project& project,
                               gd::Layout& layout);

  /**
   * \brief Called when the IDE wants to update a custom property of an initial
   * instance of this object.
   *
   * \return false if the new value cannot be set
   * \see gd::InitialInstance
   */
  virtual bool UpdateInitialInstanceProperty(gd::InitialInstance& instance,
                                             const gd::String& name,
                                             const gd::String& value,
                                             gd::Project& project,
                                             gd::Layout& layout) {
    return false;
  };
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
  ///@}

 protected:
  gd::String name;  ///< The full name of the object
  gd::String assetStoreId;  ///< The ID of the asset if the object comes from the store.
  gd::String type;  ///< Which type is the object. ( To test if we can do
                    ///< something reserved to some objects with it )
  std::map<gd::String, std::unique_ptr<gd::Behavior>>
      behaviors;  ///< Contains all behaviors and their properties for the
                  ///< object. Behavior contents are the ownership of the
                  ///< object.
  gd::VariablesContainer
      objectVariables;  ///< List of the variables of the object
  gd::String tags;      ///< Comma-separated list of tags
  gd::EffectsContainer
      effectsContainer;  ///< The effects container for the object.

  /**
   * \brief Derived objects can redefine this method to load custom attributes.
   */
  virtual void DoUnserializeFrom(gd::Project& project,
                                 const SerializerElement& element){};

  /**
   * \brief Derived objects can redefine this method to save custom attributes.
   */
  virtual void DoSerializeTo(SerializerElement& element) const {};

  /**
   * Initialize object using another object. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
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

/**
 * An object list is a vector containing (smart) pointers to objects.
 */
using ObjList = std::vector<std::unique_ptr<gd::Object>>;

/**
 * Objects are usually managed thanks to (smart) pointers.
 */
using ObjSPtr = std::unique_ptr<gd::Object>;

#endif  // GDCORE_OBJECT_H
