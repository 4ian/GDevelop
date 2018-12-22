#ifndef GDCORE_PROPERTYDESCRIPTOR
#define GDCORE_PROPERTYDESCRIPTOR

#include <vector>
#include "GDCore/String.h"

namespace gd {

/**
 * \brief Used to describe a property shown in a property grid.
 * \see gd::InitialInstancesPropgridHelper
 * \see gd::ObjectsPropgridHelper
 * \see gd::Object
 */
class GD_CORE_API PropertyDescriptor {
 public:
  /**
   * \brief Create a property being a simple gd::String with the specified
   * value. \param propertyValue The value of the property.
   */
  PropertyDescriptor(gd::String propertyValue)
      : currentValue(propertyValue), type("string"), label("") {}

  /**
   * \brief Empty constructor creating an empty property to be displayed.
   */
  PropertyDescriptor(){};

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
  const std::vector<gd::String>& GetExtraInfo() const {
    return extraInformation;
  }

 private:
  gd::String currentValue;  ///< The current value to be shown.
  gd::String
      type;  ///< The type of the property. This is arbitrary and interpreted by
             ///< the class responsible for updating the property grid.
  gd::String label;  //< The user-friendly property name
  std::vector<gd::String>
      extraInformation;  ///< Can be used to store for example the available
                         ///< choices, if a property is a displayed as a combo
                         ///< box.
};

}  // namespace gd

#endif