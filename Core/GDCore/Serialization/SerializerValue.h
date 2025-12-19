/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_SERIALIZERVALUE_H
#define GDCORE_SERIALIZERVALUE_H
#include <cstdint>
#include <string>
#include <utility>
#include "GDCore/String.h"

namespace gd {

/**
 * \brief A value stored inside a gd::SerializerElement.
 *
 * \see gd::Serializer
 * \see gd::SerializerElement
 *
 * ## Performance optimizations
 *
 * This class has been optimized for serialization performance:
 *
 * - **Single enum for type tracking**: Instead of using 5 separate boolean flags
 *   (`isUnknown`, `isBoolean`, `isString`, `isInt`, `isDouble`), a single `Type` enum
 *   is used. This reduces memory footprint (1 byte vs 5 bytes for the flags) and
 *   improves cache locality. The enum comparison is also faster than checking
 *   multiple boolean conditions.
 *
 * - **Move semantics**: Move constructor and move assignment operator are provided
 *   to avoid unnecessary string copies when SerializerValue objects are moved
 *   (e.g., when stored in containers or returned from functions).
 *
 * - **Optimized constructors**: Constructors directly initialize the type and value
 *   without going through setter methods, avoiding redundant flag clearing.
 */
class GD_CORE_API SerializerValue {
 public:
  /**
   * \brief The type of value stored.
   */
  enum class Type : uint8_t {
    Unknown,  ///< Type is unknown but the value is stored as a string.
    Boolean,
    String,
    Int,
    Double
  };

  SerializerValue();
  SerializerValue(bool val);
  SerializerValue(const gd::String &val);
  SerializerValue(gd::String &&val);
  SerializerValue(int val);
  SerializerValue(double val);
  virtual ~SerializerValue(){};

  // Move semantics for performance
  SerializerValue(SerializerValue&& other) noexcept;
  SerializerValue& operator=(SerializerValue&& other) noexcept;

  // Copy semantics (default behavior)
  SerializerValue(const SerializerValue& other) = default;
  SerializerValue& operator=(const SerializerValue& other) = default;

  /**
   * Set the value, its type being a boolean.
   */
  void SetBool(bool val);

  /**
   * Set the value, its type being a gd::String.
   */
  void SetString(const gd::String &val);

  /**
   * Set the value, its type being a gd::String (move version).
   */
  void SetString(gd::String &&val);

  /**
   * Set the value, its type being an integer.
   */
  void SetInt(int val);

  /**
   * Set the value, its type being a double.
   */
  void SetDouble(double val);

  /**
   * Set the value, its type being unknown, but representable as a string.
   */
  void Set(const gd::String &val);

  /**
   * Set the value, its type being unknown, but representable as a string (move version).
   */
  void Set(gd::String &&val);

  /**
   * Get the value, its type being a boolean.
   */
  bool GetBool() const;

  /**
   * Get the value, its type being a gd::String.
   */
  gd::String GetString() const;

  /**
   * Get the string value, without attempting any conversion.
   * Make sure to check that IsString is true beforehand.
   */
  const gd::String& GetRawString() const { return stringValue; };

  /**
   * Get the value, its type being an int.
   */
  int GetInt() const;

  /**
   * Get the value, its type being a double
   */
  double GetDouble() const;

  /**
   * \brief Return true if the value is a boolean.
   */
  bool IsBoolean() const { return type == Type::Boolean; }
  /**
   * \brief Return true if the value is a string.
   */
  bool IsString() const { return type == Type::String; }
  /**
   * \brief Return true if the value is an int.
   */
  bool IsInt() const { return type == Type::Int; }
  /**
   * \brief Return true if the value is a double.
   */
  bool IsDouble() const { return type == Type::Double; }

  /**
   * \brief Return the type of the value.
   */
  Type GetType() const { return type; }

 private:
  Type type;  ///< The type of the value stored.

  bool booleanValue;
  gd::String stringValue;
  int intValue;
  double doubleValue;
};

}  // namespace gd

#endif
