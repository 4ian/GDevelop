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
 * \brief An element used during serialization from/to XML or JSON.
 *
 * \see gd::Serializer
 */
class GD_CORE_API SerializerElement {
 public:
  SerializerElement();
  SerializerElement(const SerializerValue &value);
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
  void SetValue(bool val) {
    valueUndefined = false;
    elementValue.SetBool(val);
  }
  void SetValue(const gd::String &val) {
    valueUndefined = false;
    elementValue.SetString(val);
  }
  void SetValue(int val) {
    valueUndefined = false;
    elementValue.SetInt(val);
  }
  void SetValue(unsigned int val) {
    valueUndefined = false;
    elementValue.SetInt((int)val);
  }
  void SetValue(double val) {
    valueUndefined = false;
    elementValue.SetDouble(val);
  }
  void SetValue(float val) { SetValue((double)val); }

  /**
   * \brief Get the value of the element.
   *
   * If not value was set, an attribute named "value" is searched. If found, its
   * value is returned.
   */
  const SerializerValue &GetValue() const;

  /**
   * \brief Return true if no value was set for the element.
   */
  bool IsValueUndefined() const { return valueUndefined; }
  ///@}

  /** \name Attributes
   * Methods related to the attributes of the element
   */
  ///@{
  /**
   * \brief Set the value of an attribute of the element
   * \param name The name of the attribute.
   * \param value The value of the attribute.
   */
  SerializerElement &SetAttribute(const gd::String &name, bool value);

  /**
   * \brief Set the value of an attribute of the element
   * \param name The name of the attribute.
   * \param value The value of the attribute.
   */
  SerializerElement &SetAttribute(const gd::String &name,
                                  const gd::String &value);

  /**
   * \brief Set the value of an attribute of the element
   * \param name The name of the attribute.
   * \param value The value of the attribute.
   */
  SerializerElement &SetAttribute(const gd::String &name, const char *value) {
    if (value) SetAttribute(name, gd::String(value));
    return *this;
  };

  /**
   * \brief Set the value of an attribute of the element
   * \param name The name of the attribute.
   * \param value The value of the attribute.
   */
  SerializerElement &SetAttribute(const gd::String &name, int value);

  /**
   * \brief Set the value of an attribute of the element
   * \param name The name of the attribute.
   * \param value The value of the attribute.
   */
  SerializerElement &SetAttribute(const gd::String &name, double value);

  /**
   * Get the value of an attribute being a boolean.
   * \param name The name of the attribute
   * \param defaultValue The value returned if the attribute is not found.
   * \param deprecatedName An alternative name for the attribute that will be
   * used if the first one doesn't exists.
   */
  bool GetBoolAttribute(const gd::String &name,
                        bool defaultValue = false,
                        gd::String deprecatedName = "") const;

  /**
   * Get the value of an attribute being a string.
   * \param name The name of the attribute
   * \param defaultValue The value returned if the attribute is not found.
   * \param deprecatedName An alternative name for the attribute that will be
   * used if the first one doesn't exists.
   */
  gd::String GetStringAttribute(const gd::String &name,
                                gd::String defaultValue = "",
                                gd::String deprecatedName = "") const;

  /**
   * Get the value of an attribute being an int.
   * \param name The name of the attribute
   * \param defaultValue The value returned if the attribute is not found.
   * \param deprecatedName An alternative name for the attribute that will be
   * used if the first one doesn't exists.
   */
  int GetIntAttribute(const gd::String &name,
                      int defaultValue = 0,
                      gd::String deprecatedName = "") const;

  /**
   * Get the value of an attribute being a double.
   * \param name The name of the attribute
   * \param defaultValue The value returned if the attribute is not found.
   * \param deprecatedName An alternative name for the attribute that will be
   * used if the first one doesn't exists.
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
   * \brief Return all the children of the element.
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
   * return a reference to it. \param name The name of the new child.
   */
  SerializerElement &AddChild(gd::String name);

  /**
   * \brief Get a child of the element using its name.
   * \param name The name of the new child.
   * \param name The index of the child
   */
  SerializerElement &GetChild(gd::String name,
                              std::size_t index = 0,
                              gd::String deprecatedName = "") const;

  /**
   * \brief Get a child of the element using its index (when the element is
   * considered as an array). \param name The index of the child
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
   * \param name The name of the child to find.
   */
  bool HasChild(const gd::String &name, gd::String deprecatedName = "") const;

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
