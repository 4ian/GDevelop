/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_SERIALIZERELEMENT_H
#define GDCORE_SERIALIZERELEMENT_H
#include <map>
#include <memory>
#include <string>
#include <vector>

#include "GDCore/Serialization/SerializerValue.h"
#include "GDCore/String.h"

namespace gd {

/**
 * \brief A generic container that can represent a value (
 * containing a string, double, bool or int), an object ("associative array",
 * "dictionary") with children or an array (children indexed by numeric
 * properties).
 *
 * It is used for serialization (to JSON or XML), or as a generic
 * container for properties of objects (see for example gd::Behavior).
 *
 * It also has specialized methods in GDevelop.js (see postjs.js) to be
 * converted to a JavaScript object.
 *
 * \note Children are stored with their order preserved, but this also
 * means that their access/removal is O(number of children). This class
 * is not appropriated for a use in game where fast access is required.
 *
 * \see gd::Serializer
 */
class GD_CORE_API SerializerElement {
 public:
  /**
   * \brief Create an empty element with no value, no children and no
   * attributes.
   */
  SerializerElement();

  /**
   * \brief Create an element with the specified value.
   */
  SerializerElement(const SerializerValue &value);

  /**
   * Copy constructor.
   */
  SerializerElement(const gd::SerializerElement &object) { Init(object); };

  /**
   * Assignment operator.
   */
  SerializerElement &operator=(const gd::SerializerElement &object) {
    if ((this) != &object) Init(object);
    return *this;
  }

  virtual ~SerializerElement();

  /** \name Value
   * Methods related to the value of the element, if any.
   */
  ///@{
  /**
   * \brief Set the value of the element.
   */
  void SetValue(const SerializerValue &value) {
    valueUndefined = false;
    elementValue = value;
  }

  /**
   * \brief Set the value of the element, as a boolean.
   */
  void SetValue(bool val) {
    valueUndefined = false;
    elementValue.SetBool(val);
  }

  /**
   * \brief Set the value of the element, as a boolean.
   */
  void SetBoolValue(bool val) { SetValue(val); }

  /**
   * \brief Set the value of the element, as a string.
   */
  void SetValue(const gd::String &val) {
    valueUndefined = false;
    elementValue.SetString(val);
  }

  /**
   * \brief Set the value of the element, as a string.
   */
  void SetStringValue(const gd::String &val) { SetValue(val); }

  /**
   * \brief Set the value of the element, as an integer.
   */
  void SetValue(int val) {
    valueUndefined = false;
    elementValue.SetInt(val);
  }

  /**
   * \brief Set the value of the element, as an integer.
   */
  void SetIntValue(int val) { SetValue(val); }

  /**
   * \brief Set the value of the element, as an unsigned integer.
   */
  void SetValue(unsigned int val) {
    valueUndefined = false;
    elementValue.SetInt((int)val);
  }

  /**
   * \brief Set the value of the element, as a double precision floating point
   * number.
   */
  void SetValue(double val) {
    valueUndefined = false;
    elementValue.SetDouble(val);
  }

  /**
   * \brief Set the value of the element, as a double precision floating point
   * number.
   */
  void SetDoubleValue(double val) { SetValue(val); }

  /**
   * \brief Set the value of the element, as a floating point number.
   */
  void SetValue(float val) { SetValue((double)val); }

  /**
   * \brief Set the value of the element, as a floating point number.
   */
  void SetFloatValue(float val) { SetValue(val); }

  /**
   * \brief Get the value of the element, as a generic gd::SerializerValue.
   *
   * \note If not value was set, an attribute named "value" is searched (for
   * backward compatiblity). If found, its value is returned.
   */
  const SerializerValue &GetValue() const;

  /**
   * \brief Get the value, its type being a boolean.
   */
  bool GetBoolValue() const { return GetValue().GetBool(); };

  /**
   * \brief Get the value, its type being a gd::String.
   */
  gd::String GetStringValue() const { return GetValue().GetString(); };

  /**
   * \brief Get the value, its type being an int.
   */
  int GetIntValue() const { return GetValue().GetInt(); };

  /**
   * \brief Get the value, its type being a double
   */
  double GetDoubleValue() const { return GetValue().GetDouble(); };

  /**
   * \brief Return true if no value was set for the element.
   */
  bool IsValueUndefined() const { return valueUndefined; }

  /**
   * \brief Save the value either as a string or as an array of strings if it
   * has line breaks.
   */
  void SetMultilineStringValue(const gd::String &value);

  /**
   * \brief Read the value, either represented as a string or as an array of strings,
   * into a string.
   */
  gd::String GetMultilineStringValue();
  ///@}

  /** \name Attributes
   * Methods related to the attributes of the element.
   *
   * \deprecated Prefer using AddChild/GetChild methods.
   *
   * Attributes are stored differently than children elements, but
   * are serialized to the same in JSON. Hence, the attribute getters
   * will also search in children elements.
   */
  ///@{
  /**
   * \brief Set the boolean value of an attribute of the element
   * \param name The name of the attribute.
   * \param value The value of the attribute.
   */
  SerializerElement &SetAttribute(const gd::String &name, bool value);

  /**
   * \brief Set the boolean value of an attribute of the element
   * \param name The name of the attribute.
   * \param value The value of the attribute.
   */
  SerializerElement &SetBoolAttribute(const gd::String &name, bool value) {
    return SetAttribute(name, value);
  }

  /**
   * \brief Set the string value of an attribute of the element
   * \param name The name of the attribute.
   * \param value The value of the attribute.
   */
  SerializerElement &SetAttribute(const gd::String &name,
                                  const gd::String &value);

  /**
   * \brief Set the string value of an attribute of the element
   * \param name The name of the attribute.
   * \param value The value of the attribute.
   */
  SerializerElement &SetStringAttribute(const gd::String &name,
                                        const gd::String &value) {
    return SetAttribute(name, value);
  }

  /**
   * \brief Set the string value of an attribute of the element
   * \param name The name of the attribute.
   * \param value The value of the attribute.
   */
  SerializerElement &SetAttribute(const gd::String &name, const char *value) {
    if (value) SetAttribute(name, gd::String(value));
    return *this;
  };

  /**
   * \brief Set the integer value of an attribute of the element
   * \param name The name of the attribute.
   * \param value The value of the attribute.
   */
  SerializerElement &SetAttribute(const gd::String &name, int value);

  /**
   * \brief Set the integer value of an attribute of the element
   * \param name The name of the attribute.
   * \param value The value of the attribute.
   */
  SerializerElement &SetIntAttribute(const gd::String &name, int value) {
    return SetAttribute(name, value);
  }

  /**
   * \brief Set the double precision floating point number value of an attribute
   * of the element \param name The name of the attribute. \param value The
   * value of the attribute.
   */
  SerializerElement &SetAttribute(const gd::String &name, double value);

  /**
   * \brief Set the double precision floating point number value of an attribute
   * of the element \param name The name of the attribute. \param value The
   * value of the attribute.
   */
  SerializerElement &SetDoubleAttribute(const gd::String &name, double value) {
    return SetAttribute(name, value);
  }

  /**
   * Get the value of an attribute being a boolean.
   * \param name The name of the attribute
   * \param defaultValue The value returned if the attribute is not found.
   * \param deprecatedName An alternative name for the attribute that will be
   * used if the first one doesn't exist.
   */
  bool GetBoolAttribute(const gd::String &name,
                        bool defaultValue = false,
                        gd::String deprecatedName = "") const;

  /**
   * Get the value of an attribute being a string.
   * \param name The name of the attribute
   * \param defaultValue The value returned if the attribute is not found.
   * \param deprecatedName An alternative name for the attribute that will be
   * used if the first one doesn't exist.
   */
  gd::String GetStringAttribute(const gd::String &name,
                                gd::String defaultValue = "",
                                gd::String deprecatedName = "") const;

  /**
   * Get the value of an attribute being an int.
   * \param name The name of the attribute
   * \param defaultValue The value returned if the attribute is not found.
   * \param deprecatedName An alternative name for the attribute that will be
   * used if the first one doesn't exist.
   */
  int GetIntAttribute(const gd::String &name,
                      int defaultValue = 0,
                      gd::String deprecatedName = "") const;

  /**
   * Get the value of an attribute being a double.
   * \param name The name of the attribute
   * \param defaultValue The value returned if the attribute is not found.
   * \param deprecatedName An alternative name for the attribute that will be
   * used if the first one doesn't exist.
   */
  double GetDoubleAttribute(const gd::String &name,
                            double defaultValue = 0.0,
                            gd::String deprecatedName = "") const;

  /**
   * \brief Return true if the specified attribute exists.
   * \param name The name of the attribute to find.
   */
  bool HasAttribute(const gd::String &name) const;

  /**
   * \brief Return all the attributes of the element.
   */
  const std::map<gd::String, SerializerValue> &GetAllAttributes() const {
    return attributes;
  };
  ///@}

  /** \name Children
   * Methods related to the children elements
   */
  ///@{
  /**
   * \brief Consider that the element is an array of elements, without specific
   * name for the children element.
   *
   * When serialized to a format accepting arrays (like JSON), the element will
   * be serialized to an array.
   */
  void ConsiderAsArray() const { isArray = true; };

  /**
   * \brief Check if the element is considered as an array containing its
   * children.
   *
   * As possible, this should be serialized to an array (possible JSON, but not
   * in XML).
   */
  bool ConsideredAsArray() const { return isArray; };

  /**
   * \brief Consider that the element is an array for elements with the given
   * name.
   *
   * In this case, no child with a different name should be added. When
   * serialized to a format accepting arrays (like JSON), the element will be
   * serialized to an array.
   *
   * \param name The name of the children.
   */
  void ConsiderAsArrayOf(const gd::String &name,
                         const gd::String &deprecatedName = "") const {
    ConsiderAsArray();
    arrayOf = name;
    deprecatedArrayOf = deprecatedName;
  };

  /**
   * \brief Return the name of the children the element is considered an array
   * of.
   *
   * Return an empty string if the element is not considered as an array.
   */
  const gd::String &ConsideredAsArrayOf() const { return arrayOf; };

  /**
   * \brief Add a child at the end of the children list with the given name and
   * return a reference to it.
   *
   * \param name The name of the new child.
   */
  SerializerElement &AddChild(gd::String name);

  /**
   * \brief Get a child of the element using its name.
   *
   * \param name The name of the child.
   * \param name The index of the child, in case of an array.
   */
  SerializerElement &GetChild(gd::String name,
                              std::size_t index = 0,
                              gd::String deprecatedName = "") const;

  /**
   * \brief Get a child of the element using its index (when the element is
   * considered as an array).
   *
   * \param name The index of the child
   */
  SerializerElement &GetChild(std::size_t index) const;

  /**
   * \brief Get the number of children having a specific name.
   *
   * If no children name is specified, return the number of children being part
   * of the array. (ConsiderAsArrayOf must have been called before). Note that
   * unnamed children are considered to be valid element of the array.
   *
   * \param name The name of the children.
   *
   * \see SerializerElement::ConsiderAsArrayOf
   */
  std::size_t GetChildrenCount(gd::String name = "",
                               gd::String deprecatedName = "") const;

  /**
   * \brief Return true if the specified child exists.
   * \note Complexity is O(number of children).
   * \param name The name of the child to find.
   */
  bool HasChild(const gd::String &name, gd::String deprecatedName = "") const;

  /**
   * \brief Remove the child with the specified name
   * \note Complexity is O(number of children).
   * \param name The name of the child to remove.
   */
  void RemoveChild(const gd::String &name);

  /**
   * \brief Return all the children of the element.
   */
  const std::vector<std::pair<gd::String, std::shared_ptr<SerializerElement> > >
      &GetAllChildren() const {
    return children;
  };
  ///@}

  static SerializerElement nullElement;

 private:
  /**
   * Initialize element using another element. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   */
  void Init(const gd::SerializerElement &other);

  bool valueUndefined;  ///< If true, the element does not have a value.
  SerializerValue elementValue;

  std::map<gd::String, SerializerValue> attributes;
  std::vector<std::pair<gd::String, std::shared_ptr<SerializerElement> > >
      children;
  mutable bool isArray;        ///< true if element is considered as an array
  mutable gd::String arrayOf;  ///< The name of the children (was useful for XML
                               ///< parsed elements).
  mutable gd::String deprecatedArrayOf;  ///< Alternate name for children
};

}  // namespace gd

#endif
