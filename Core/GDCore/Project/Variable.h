/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_VARIABLE_H
#define GDCORE_VARIABLE_H
#include <cmath>
#include <map>
#include <memory>
#include <vector>

#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Defines a variable which can be used by an object, a layout or a
 * project.
 *
 * \see gd::VariablesContainer
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Variable {
 public:
  static gd::Variable badVariable;
  enum Type {
    // Primitive types
    String,
    Number,
    Boolean,

    // Collection types
    Structure,
    Array
  };

  /**
   * \brief Returns true if the passed type is primitive
   */
  static bool IsPrimitive(const Type type);

  /**
   * \brief Default constructor creating a variable with 0 as value.
   */
  Variable() : value(0), type(Type::Number){};
  Variable(const Variable&);
  virtual ~Variable(){};

  Variable& operator=(const Variable& rhs);

  /**
   * \brief Get the type of the variable.
   */
  Type GetType() const { return type; }

  /**
   * \brief Converts the variable to a new type.
   */
  void CastTo(const Type newType);

  /**
   * \brief Converts the variable to a new type.
   */
  void CastTo(const gd::String& type) { return CastTo(StringAsType(type)); };

  /** \name Primitives
   * Methods and operators used when the variable is considered as a primitive.
   */
  ///@{

  /**
   * \brief Return the content of the variable, considered as a string.
   */
  const gd::String& GetString() const;

  /**
   * \brief Change the content of the variable, considered as a string.
   */
  void SetString(const gd::String& newStr) {
    str = newStr;
    type = Type::String;
  }

  /**
   * \brief Return the content of the variable, considered as a number.
   */
  double GetValue() const;

  /**
   * \brief Change the content of the variable, considered as a number.
   */
  void SetValue(double val) {
    value = val;
    // NaN values are not supported by GDevelop nor the serializer.
    if (std::isnan(value)) value = 0.0;
    type = Type::Number;
  }

  /**
   * \brief Return the content of the variable, considered as a boolean.
   */
  bool GetBool() const;

  /**
   * \brief Change the content of the variable, considered as a boolean.
   */
  void SetBool(bool val) {
    boolVal = val;
    type = Type::Boolean;
  }

  // Operators are overloaded to allow accessing to variable using a simple
  // int-like semantic.
  void operator=(double val) { SetValue(val); };
  void operator+=(double val) { SetValue(val + GetValue()); }
  void operator-=(double val) { SetValue(GetValue() - val); }
  void operator*=(double val) { SetValue(val * GetValue()); }
  void operator/=(double val) { SetValue(GetValue() / val); }

  bool operator<=(double val) const { return GetValue() <= val; };
  bool operator>=(double val) const { return GetValue() >= val; };
  bool operator<(double val) const { return GetValue() < val; };
  bool operator>(double val) const { return GetValue() > val; };
  bool operator==(double val) const { return GetValue() == val; };
  bool operator!=(double val) const { return GetValue() != val; };

  // Avoid ambiguous operators
  void operator=(int val) { SetValue(val); };
  void operator+=(int val) { SetValue(val + GetValue()); }
  void operator-=(int val) { SetValue(GetValue() - val); }
  void operator*=(int val) { SetValue(val * GetValue()); }
  void operator/=(int val) { SetValue(GetValue() / val); }

  bool operator<=(int val) const { return GetValue() <= val; };
  bool operator>=(int val) const { return GetValue() >= val; };
  bool operator<(int val) const { return GetValue() < val; };
  bool operator>(int val) const { return GetValue() > val; };
  bool operator==(int val) const { return GetValue() == val; };
  bool operator!=(int val) const { return GetValue() != val; };

  // Operators are overloaded to allow accessing to variable using a simple
  // string-like semantic.
  void operator=(const gd::String& val) { SetString(val); };
  void operator+=(const gd::String& val) { SetString(GetString() + val); }

  bool operator==(const gd::String& val) const { return GetString() == val; };
  bool operator!=(const gd::String& val) const { return GetString() != val; };

  // Avoid ambiguous operators
  void operator=(const char* val) { SetString(val); };
  void operator+=(const char* val) { SetString(GetString() + val); }

  bool operator==(const char* val) const { return GetString() == val; };
  bool operator!=(const char* val) const { return GetString() != val; };

  // Operators are overloaded to allow accessing to variable using a simple
  // bool-like semantic.
  void operator=(const bool val) { SetBool(val); };

  bool operator==(const bool val) const { return GetBool() == val; };
  bool operator!=(const bool val) const { return GetBool() != val; };

  ///@}

  /** \name Collection types
   * Methods used for collection types
   */
  ///@{

  /**
   * \brief Remove all the children.
   */
  void ClearChildren() {
    children.clear();
    childrenArray.clear();
  };

  /**
   * \brief Get the count of children that the variable has.
   */
  size_t GetChildrenCount() const {
    return type == Type::Structure ? children.size()
           : type == Type::Array   ? childrenArray.size()
                                   : 0;
  };

  /** \name Structure
   * Methods used when the variable is considered as a structure.
   */
  ///@{
  /**
   * \brief Return true if the variable is a structure and has the specified
   * child.
   */
  bool HasChild(const gd::String& name) const;

  /**
   * \brief Return the child with the specified name.
   *
   * If the variable has not the specified child, an empty variable with the
   * specified name is added as child.
   */
  Variable& GetChild(const gd::String& name);

  /**
   * \brief Return the child with the specified name.
   *
   * If the variable has not the specified child, an empty variable with the
   * specified name is added as child.
   */
  const Variable& GetChild(const gd::String& name) const;

  /**
   * \brief Remove the child with the specified name.
   *
   * If the variable is not a structure or has not
   * the specified child, nothing is done.
   */
  void RemoveChild(const gd::String& name);

  /**
   * \brief Rename the specified child.
   *
   * If the variable is not a structure or has not
   * the specified child, nothing is done.
   * \return true if the child was renamed, false otherwise.
   */
  bool RenameChild(const gd::String& oldName, const gd::String& newName);

  /**
   * \brief Get the names of all children
   */
  std::vector<gd::String> GetAllChildrenNames() const;

  /**
   * \brief Get the map containing all the children.
   */
  const std::map<gd::String, std::shared_ptr<Variable>>& GetAllChildren()
      const {
    return children;
  }

  /**
   * \brief Search if a variable is part of the children, optionally recursively
   */
  bool Contains(const gd::Variable& variableToSearch, bool recursive) const;

  /**
   * \brief Remove the specified variable if it can be found in the children
   */
  void RemoveRecursively(const gd::Variable& variableToRemove);
  ///@}

  /** \name Array
   * Methods used when the variable is considered as an array.
   */
  ///@{

  /**
   * \brief Return the element with the specified index.
   *
   * If the variable does not have the specified index,
   * the array will be filled up to that index with empty variables.
   */
  Variable& GetAtIndex(const size_t index);

  /**
   * \brief Return the element with the specified index.
   *
   * If the variable has not the specified child,
   * an empty variable is returned.
   */
  const Variable& GetAtIndex(const size_t index) const;

  /**
   * \brief Appends a new variable at the end of the list and returns it.
   */
  Variable& PushNew();

  /**
   * \brief Remove the element with the specified index.
   *
   * And shifts all the next elements back by one.
   */
  void RemoveAtIndex(const size_t index);

  /**
   * \brief Move child in array.
   */
  void MoveChildInArray(const size_t oldIndex, const size_t newIndex);

  /**
   * \brief Insert child in array.
   */
  bool InsertAtIndex(const gd::Variable& variable, const size_t index);

  /**
   * \brief Insert a child in a structure.
   */
  bool InsertChild(const gd::String& name, const gd::Variable& variable);

  /**
   * \brief Get the vector containing all the children.
   */
  const std::vector<std::shared_ptr<Variable>>& GetAllChildrenArray() const {
    return childrenArray;
  }

  /**
   * \brief Set if the children must be folded.
   */
  void SetFolded(bool fold = true) { folded = fold; }

  /**
   * \brief True if the children should be folded in the variables editor.
   */
  bool IsFolded() const { return folded; }

  ///@}
  ///@}

  /** \name Serialization
   * Methods used when to load or save a variable to XML.
   */
  ///@{
  /**
   * \brief Serialize variable.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the variable.
   */
  void UnserializeFrom(const SerializerElement& element);

  /**
   * \brief Reset the persistent UUID used to recognize
   * the same variable between serialization.
   */
  Variable& ResetPersistentUuid();

  /**
   * \brief Remove the persistent UUID - when the variable no
   * longer needs to be recognized between serializations.
   */
  Variable& ClearPersistentUuid() { persistentUuid = ""; return *this; };

  /**
   * \brief Get the persistent UUID used to recognize
   * the same variable between serialization.
   */
  const gd::String& GetPersistentUuid() const { return persistentUuid; };
  ///@}

 private:
  /**
   * \brief Converts a Type to a string.
   */
  static gd::String TypeAsString(Type t);

  /**
   * \brief Converts a string to a Type.
   */
  static Type StringAsType(const gd::String& str);

  bool folded;
  mutable Type type;
  mutable gd::String str;
  mutable double value;
  mutable bool boolVal;
  mutable std::map<gd::String, std::shared_ptr<Variable>>
      children;  ///< Children, when the variable is considered as a structure.
  mutable std::vector<std::shared_ptr<Variable>>
      childrenArray;  ///< Children, when the variable is considered as an
                      ///< array.
  mutable gd::String persistentUuid;  ///< A persistent random version 4 UUID,
                                      ///< useful for computing changesets.

  /**
   * Initialize children by copying them from another variable.  Used by
   * copy-ctor and assign-op.
   */
  void CopyChildren(const Variable& other);
};

}  // namespace gd

#endif  // GDCORE_VARIABLE_H
