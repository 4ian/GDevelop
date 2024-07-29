/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_OBJECTCONFIGURATION_H
#define GDCORE_OBJECTCONFIGURATION_H
#include "GDCore/Vector2.h"
#include <map>
#include <memory>
#include <vector>

#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EffectsContainer.h"
#include "GDCore/Project/ResourcesManager.h"
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
 * \brief Base class used to represent an object configuration.
 * For example, this can be the animations in a sprite, the text, its font,
 * its color in a Text object, etc...
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API ObjectConfiguration {
 public:
  /**
   * Create a new object configuration.
   */
  ObjectConfiguration();

  /**
   * Destructor.
   */
  virtual ~ObjectConfiguration();

  /**
   * Must return a pointer to a copy of the configuration. This method is
   * needed to do polymorphic copies. Just redefine this method in your derived
   * object class like this:
   * \code
   * return gd::make_unique<MyObjectConfiguration>(*this);
   * \endcode
   */
  virtual std::unique_ptr<gd::ObjectConfiguration> Clone() const {
    return gd::make_unique<gd::ObjectConfiguration>(*this);
  }

  /** \brief Change the type of the object.
   */
  void SetType(const gd::String& type_) {
    type = type_;
  }

  /** \brief Return the type of the object.
   */
  const gd::String& GetType() const { return type; }

  /** \name Object properties
   * Reading and updating object configuration properties
   */
  ///@{
  /**
   * \brief Called when the IDE wants to know about the custom properties of the
   object configuration.
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
   * configuration.
   *
   * \return false if the new value cannot be set
   */
  virtual bool UpdateProperty(const gd::String& name, const gd::String& value) {
    return false;
  };
  ///@}

  /** \name Drawing and editing initial instances
   * Members functions related to drawing and editing initial instances of this
   * object configuration
   */
  ///@{
  /**
   * \brief Called when the IDE wants to know about the custom properties of an
   * initial instance of this object configuration.
   *
   * \return a std::map with properties names as key and values.
   * \see gd::InitialInstance
   */
  virtual std::map<gd::String, gd::PropertyDescriptor>
  GetInitialInstanceProperties(const gd::InitialInstance& instance);

  /**
   * \brief Called when the IDE wants to update a custom property of an initial
   * instance of this object configuration.
   *
   * \return false if the new value cannot be set
   * \see gd::InitialInstance
   */
  virtual bool UpdateInitialInstanceProperty(gd::InitialInstance& instance,
                                             const gd::String& name,
                                             const gd::String& value) {
    return false;
  };
    ///@}

  /** \name Resources management
   * Members functions related to managing resources used by the object configuration
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
  ///@}

/** \name Serialization
 * Members functions related to serialization of the object configuration
 */
///@{
  /**
   * \brief Serialize the object configuration.
   * \see DoSerializeTo
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the object configuration.
   * \see DoUnserializeFrom
   */
  void UnserializeFrom(gd::Project& project, const SerializerElement& element);
  ///@}

  /** \name Animations
   * Members functions related to object animations
   */
  ///@{
  /**
   * \brief Return the number of animations declared in this object
   * configuration.
   */
  virtual size_t GetAnimationsCount() const {
    return 0;
  };

  /**
   * \brief Return the name of an animation declared in this object
   * configuration.
   */
  virtual const gd::String &GetAnimationName(size_t index) const {
    return badAnimationName;
  }

  /**
   * \brief Return true if an animation is declared in this object
   * configuration for a given name.
   */
  virtual bool HasAnimationNamed(const gd::String &animationName) const {
    return false;
  }
  ///@}

protected:
  gd::String type; ///< Which type of object is represented by this
                   ///< configuration.

  /**
   * \brief Derived object configuration can redefine this method to load
   * custom attributes.
   */
  virtual void DoUnserializeFrom(gd::Project& project,
                                 const SerializerElement& element){};

  /**
   * \brief Derived object configuration can redefine this method to save
   * custom attributes.
   */
  virtual void DoSerializeTo(SerializerElement& element) const {};

private:
  static gd::String badAnimationName;
};

}  // namespace gd

/**
 * Object configurations are usually managed thanks to (smart) pointers.
 */
using ObjConfSPtr = std::unique_ptr<gd::ObjectConfiguration>;

#endif  // GDCORE_OBJECT_H
