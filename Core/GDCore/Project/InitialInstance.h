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
}  // namespace gd

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
   * \brief Get the Z position of the instance
   */
  double GetZ() const { return z; }

  /**
   * \brief Set the Z position of the instance
   */
  void SetZ(double z_) { z = z_; }

  /**
   * \brief Get the rotation of the instance on Z axis, in radians.
   */
  double GetAngle() const { return angle; }

  /**
   * \brief Set the rotation of the instance on Z axis, in radians.
   */
  void SetAngle(double angle_) { angle = angle_; }

  /**
   * \brief Get the rotation of the instance on X axis, in radians.
   */
  double GetRotationX() const { return rotationX; }

  /**
   * \brief Set the rotation of the instance on X axis, in radians.
   */
  void SetRotationX(double rotationX_) { rotationX = rotationX_; }

  /**
   * \brief Get the rotation of the instance on Y axis, in radians.
   */
  double GetRotationY() const { return rotationY; }

  /**
   * \brief Set the rotation of the instance on Y axis, in radians.
   */
  void SetRotationY(double rotationY_) { rotationY = rotationY_; }

  /**
   * \brief Get the Z order of the instance (for a 2D object).
   */
  int GetZOrder() const { return zOrder; }

  /**
   * \brief Set the Z order of the instance (for a 2D object).
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
   * \brief Return true if the instance has a width/height which is different from its
   * object default width/height. This is independent from `HasCustomDepth`.
   *
   * \see gd::Object
   */
  bool HasCustomSize() const { return customSize; }

  /**
   * \brief Return true if the instance has a depth which is different from its
   * object default depth. This is independent from `HasCustomSize`.
   *
   * \see gd::Object
   */
  bool HasCustomDepth() const { return customDepth; }

  /**
   * \brief Set whether the instance has a width/height which is different from its
   * object default width/height or not.
   * This is independent from `SetHasCustomDepth`.
   *
   * \see gd::Object
   */
  void SetHasCustomSize(bool hasCustomSize_) {
    customSize = hasCustomSize_;
  }

  /**
   * \brief Set whether the instance has a depth which is different from its
   * object default depth or not.
   * This is independent from `SetHasCustomSize`.
   *
   * \param hasCustomSize true if the depth is different from the object's
   * default depth.
   * \see gd::Object
   */
  void SetHasCustomDepth(bool hasCustomDepth_) {
    customDepth = hasCustomDepth_;
  }

  double GetCustomWidth() const { return width; }
  void SetCustomWidth(double width_) { width = width_; }
  double GetCustomHeight() const { return height; }
  void SetCustomHeight(double height_) { height = height_; }
  double GetCustomDepth() const { return depth; }
  void SetCustomDepth(double depth_) { depth = depth_; }

  /**
   * \brief Return true if the instance is locked and cannot be moved in the
   * IDE.
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

  /**
   * \brief Return true if the dimensions (width, height and depth) should keep
   * the same ratio.
   */
  bool ShouldKeepRatio() const { return keepRatio; };

  /**
   * \brief Define if instance's dimensions should keep the same ratio.
   */
  void SetShouldKeepRatio(bool enable = true) { keepRatio = enable; }

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
  double x;               ///< Instance X position
  double y;               ///< Instance Y position
  double z;               ///< Instance Z position (for a 3D object)
  double angle;           ///< Instance angle on Z axis
  double rotationX;       ///< Instance angle on X axis (for a 3D object)
  double rotationY;       ///< Instance angle on Y axis (for a 3D object)
  int zOrder;             ///< Instance Z order (for a 2D object)
  gd::String layer;       ///< Instance layer
  bool customSize;        ///< True if object has a custom width and height
  bool customDepth;       ///< True if object has a custom depth
  double width;           ///< Instance custom width
  double height;          ///< Instance custom height
  double depth;           ///< Instance custom depth
  gd::VariablesContainer initialVariables;  ///< Instance specific variables
  bool locked;                              ///< True if the instance is locked
  bool sealed;                              ///< True if the instance is sealed
  bool keepRatio;                           ///< True if the instance's dimensions
                                            ///  should keep the same ratio.
  mutable gd::String persistentUuid;  ///< A persistent random version 4 UUID,
                                      ///  useful for hot reloading.

  static gd::String*
      badStringPropertyValue;  ///< Empty string returned by GetRawStringProperty
};

}  // namespace gd

#endif  // GDCORE_INITIALINSTANCE_H
