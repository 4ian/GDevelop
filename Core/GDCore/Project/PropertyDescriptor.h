/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_PROPERTYDESCRIPTOR
#define GDCORE_PROPERTYDESCRIPTOR
#include <vector>

#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Used to describe a property shown in a property grid.
 * \see gd::Object
 * \see gd::EffectMetadata
 */
class GD_CORE_API PropertyDescriptor {
 public:
  /**
   * \brief Create a property being a simple gd::String with the specified
   * value.
   *
   * \param propertyValue The value of the property.
   */
  PropertyDescriptor(gd::String propertyValue)
      : currentValue(propertyValue), type("string"), label(""), hidden(false) {}

  /**
   * \brief Empty constructor creating an empty property to be displayed.
   */
  PropertyDescriptor() : hidden(false){};

  /**
   * \brief Destructor
   */
  virtual ~PropertyDescriptor();

  /**
   * \brief Change the value displayed in the property grid
   */
  PropertyDescriptor& SetValue(gd::String value) {
    currentValue = value;
    return *this;
  }

  /**
   * \brief Change the type of the value displayed in the property grid.
   * \note The type is arbitrary and is interpreted by the class updating the
   * property grid: Refer to it or to the documentation of the class which is
   * returning the PropertyDescriptor to learn more about valid values for the
   * type.
   */
  PropertyDescriptor& SetType(gd::String type_) {
    type = type_;
    return *this;
  }

  /**
   * \brief Change the label displayed in the property grid.
   */
  PropertyDescriptor& SetLabel(gd::String label_) {
    label = label_;
    return *this;
  }

  /**
   * \brief Change the description displayed to the user, if any.
   */
  PropertyDescriptor& SetDescription(gd::String description_) {
    description = description_;
    return *this;
  }

  /**
   * \brief Set and replace the additional information for the property.
   */
  PropertyDescriptor& SetExtraInfo(const std::vector<gd::String>& info) {
    extraInformation = info;
    return *this;
  }

  /**
   * \brief Add an information about the property.
   * \note The information are arbitrary and are interpreted by the class
   * updating the property grid: Refer to it or to the documentation of the
   * class which is returning the PropertyDescriptor to learn more about valid
   * values for the extra information.
   */
  PropertyDescriptor& AddExtraInfo(const gd::String& info) {
    extraInformation.push_back(info);
    return *this;
  }

  const gd::String& GetValue() const { return currentValue; }
  const gd::String& GetType() const { return type; }
  const gd::String& GetLabel() const { return label; }
  const gd::String& GetDescription() const { return description; }

  const std::vector<gd::String>& GetExtraInfo() const {
    return extraInformation;
  }
  
  std::vector<gd::String>& GetExtraInfo() {
    return extraInformation;
  }

  /**
   * \brief Set if the property should be shown or hidden in the editor.
   */
  PropertyDescriptor& SetHidden(bool enable = true) {
    hidden = enable;
    return *this;
  }

  /**
   * \brief Check if the property should be shown or hidden in the editor.
   */
  bool IsHidden() const { return hidden; }

  /** \name Serialization
   */
  ///@{
  /**
   * \brief Serialize the PropertyDescriptor.
   */
  virtual void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the PropertyDescriptor.
   */
  virtual void UnserializeFrom(const SerializerElement& element);

  /**
   * \brief Serialize only the value and extra informations.
   */
  virtual void SerializeValuesTo(SerializerElement& element) const;

  /**
   * \brief Unserialize only the value and extra informations.
   */
  virtual void UnserializeValuesFrom(const SerializerElement& element);
  ///@}

 private:
  gd::String currentValue;  ///< The current value to be shown.
  gd::String
      type;  ///< The type of the property. This is arbitrary and interpreted by
             ///< the class responsible for updating the property grid.
  gd::String label;        //< The user-friendly property name
  gd::String description;  //< The user-friendly property description
  std::vector<gd::String>
      extraInformation;  ///< Can be used to store for example the available
                         ///< choices, if a property is a displayed as a combo
                         ///< box.
  bool hidden;
};

}  // namespace gd

#endif
