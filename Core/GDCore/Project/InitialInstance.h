/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_INITIALINSTANCE_H
#define GDCORE_INITIALINSTANCE_H
#include <map>
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/String.h"
namespace gd {
class PropertyDescriptor;
class Project;
class Layout;
}

namespace gd {

/**
 * \brief Represents an instance of an object to be created on a layout start
 * up.
 */
class GD_CORE_API InitialInstance {
 public:
  /**
   * \brief Create an initial instance pointing to no object, at position (0,0).
   */
  InitialInstance();
  virtual ~InitialInstance(){};

  /**
   * Must return a pointer to a copy of the object. A such method is needed to
   * do polymorphic copies. Just redefine this method in your derived object
   * class like this: \code return new MyInitialInstanceClass(*this); \endcode
   */
  InitialInstance* Clone() const { return new InitialInstance(*this); }

  /** \name Common properties
   * Members functions related to common properties
   */
  ///@{

  /**
   * \brief Get the name of object instantiated on the layout.
   */
  const gd::String& GetObjectName() const { return objectName; }

  /**
   * \brief Set the name of object instantiated on the layout.
   */
  void SetObjectName(const gd::String& name) { objectName = name; }

  /**
   * \brief Get the X position of the instance
   */
  double GetX() const { return x; }

  /**
   * \brief Set the X position of the instance
   */
  void SetX(double x_) { x = x_; }

  /**
   * \brief Get the Y position of the instance
   */
  double GetY() const { return y; }

  /**
   * \brief Set the Y position of the instance
   */
  void SetY(double y_) { y = y_; }

  /**
   * \brief Get the rotation of the instance, in radians.
   */
  double GetAngle() const { return angle; }

  /**
   * \brief Set the rotation of the instance, in radians.
   */
  void SetAngle(double angle_) { angle = angle_; }

  /**
   * \brief Get the Z order of the instance.
   */
  int GetZOrder() const { return zOrder; }

  /**
   * \brief Set the Z order of the instance.
   */
  void SetZOrder(int zOrder_) { zOrder = zOrder_; }

  /**
   * \brief Get the layer the instance belongs to.
   */
  const gd::String& GetLayer() const { return layer; }

  /**
   * \brief Set the layer the instance belongs to.
   */
  void SetLayer(const gd::String& layer_) { layer = layer_; }

  /**
   * \brief Return true if the instance has a size which is different from its
   * object default size.
   *
   * \see gd::Object
   */
  bool HasCustomSize() const { return personalizedSize; }

  /**
   * \brief Set whether the instance has a size which is different from its
   * object default size or not.
   *
   * \param hasCustomSize true if the size is different from the object's
   * default size. \see gd::Object
   */
  void SetHasCustomSize(bool hasCustomSize_) {
    personalizedSize = hasCustomSize_;
  }

  double GetCustomWidth() const { return width; }
  void SetCustomWidth(double width_) { width = width_; }

  double GetCustomHeight() const { return height; }
  void SetCustomHeight(double height_) { height = height_; }

  /**
   * \brief Return true if the instance is locked and cannot be moved in the IDE.
   */
  bool IsLocked() const { return locked; };

  /**
   * \brief (Un)lock the initial instance.
   *
   * An instance which is locked cannot be moved with actions in the IDE.
   */
  void SetLocked(bool enable = true) { locked = enable; }

  /**
   * \brief Return true if the instance cannot be selected by clicking on it
   * in the IDE (only applies if instance is also locked).
   */
  bool IsSealed() const { return sealed; };

  /**
   * \brief (Un)seal the initial instance.
   *
   * An instance which is sealed cannot be selected by clicking on it in a
   * layout editor canvas.
   */
  void SetSealed(bool enable = true) { sealed = enable; }

  ///@}

  /** \name Variable management
   * Members functions related to initial instance variables management.
   */
  ///@{

  /**
   * Must return a reference to the container storing the instance variables
   * \see gd::VariablesContainer
   */
  const gd::VariablesContainer& GetVariables() const {
    return initialVariables;
  }

  /**
   * Must return a reference to the container storing the instance variables
   * \see gd::VariablesContainer
   */
  gd::VariablesContainer& GetVariables() { return initialVariables; }
  ///@}

  /** \name Others properties management
   * Members functions related to exposing others properties of the instance.
   *
   * \note Extensions writers: even if we can define new types of object by
   * inheriting from gd::Object class, we cannot define new gd::InitialInstance
   * classes.
   *
   * However, objects can store custom properties for their associated
   * initial instances. When the IDE want to get the custom properties, it
   * will call `GetCustomProperties` and `UpdateCustomProperty` methods.
   * These methods are here defined to forward the call to the gd::Object
   * associated to the gd::InitialInstance (by looking at the value returned
   * by GetObjectName()).
   *
   * \see gd::Object
   */
  ///@{
#if defined(GD_IDE_ONLY)
  /**
   * \brief Return a map containing the properties names (as keys) and their
   * values.
   *
   * \note Common properties ( name, position... ) do not need to be
   * inserted in this map
   */
  std::map<gd::String, gd::PropertyDescriptor> GetCustomProperties(
      gd::Project& project, gd::Layout& layout);

  /**
   * \brief Update the property called \a name with the new \a value.
   *
   * \return false if the property could not be updated.
   */
  bool UpdateCustomProperty(const gd::String& name,
                            const gd::String& value,
                            gd::Project& project,
                            gd::Layout& layout);
#endif

  /**
   * \brief Get the value of a double property stored in the instance.
   * \note Only use this when \a GetCustomProperties is too slow (when rendering
   * instances for example).
   * \return the value of the property, or 0 if it does
   * not exists.
   */
  double GetRawDoubleProperty(const gd::String& name) const;

  /**
   * \brief Get the value of a string property stored in the instance.
   * \note Only use this when \a GetCustomProperties is too slow (when rendering
   * instances for example).
   * \return the value of the propety, or an empty
   * string if it does not exists.
   */
  const gd::String& GetRawStringProperty(const gd::String& name) const;

  /**
   * \brief Set the value of a double property stored in the instance.
   */
  void SetRawDoubleProperty(const gd::String& name, double value);

  /**
   * \brief Set the value of a string property stored in the instance.
   */
  void SetRawStringProperty(const gd::String& name, const gd::String& value);
///@}

  /** \name Saving and loading
   * Members functions related to serialization.
   */
  ///@{
  /**
   * \brief Serialize instances container.
   */
  virtual void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the instances container.
   */
  virtual void UnserializeFrom(const SerializerElement& element);

  /**
   * \brief Reset the persistent UUID used to recognize
   * the same initial instance between serialization.
   */
  InitialInstance& ResetPersistentUuid();
  ///@}

 private:
  // More properties can be stored in numberProperties and stringProperties.
  // These properties are then managed by the Object class.
  std::map<gd::String, double>
      numberProperties;  ///< More data which can be used by the object
  std::map<gd::String, gd::String>
      stringProperties;  ///< More data which can be used by the object

  gd::String objectName;  ///< Object name
  double x;                ///< Object initial X position
  double y;                ///< Object initial Y position
  double angle;            ///< Object initial angle
  int zOrder;             ///< Object initial Z order
  gd::String layer;       ///< Object initial layer
  bool personalizedSize;  ///< True if object has a custom size
  double width;            ///< Object custom width
  double height;           ///< Object custom height
  gd::VariablesContainer initialVariables;  ///< Instance specific variables
  bool locked;                              ///< True if the instance is locked
  bool sealed;                              ///< True if the instance is sealed
  mutable gd::String persistentUuid; ///< A persistent random version 4 UUID, useful for hot reloading.

  static gd::String*
      badStringProperyValue;  ///< Empty string returned by GetRawStringProperty
};

}  // namespace gd

#endif  // GDCORE_INITIALINSTANCE_H
