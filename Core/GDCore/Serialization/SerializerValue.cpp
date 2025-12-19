#include "GDCore/Serialization/SerializerValue.h"
#include "GDCore/CommonTools.h"

namespace gd {

// ============================================================================
// CONSTRUCTORS
// ============================================================================
// Optimization: Direct initialization without calling setters.
// Each constructor directly sets the type enum and value, avoiding the overhead
// of setter methods that would redundantly clear other type flags.

SerializerValue::SerializerValue()
    : type(Type::Unknown),
      booleanValue(false),
      intValue(0),
      doubleValue(0) {}

SerializerValue::SerializerValue(bool val)
    : type(Type::Boolean),
      booleanValue(val),
      intValue(0),
      doubleValue(0) {}

SerializerValue::SerializerValue(const gd::String &val)
    : type(Type::String),
      booleanValue(false),
      stringValue(val),
      intValue(0),
      doubleValue(0) {}

SerializerValue::SerializerValue(gd::String &&val)
    : type(Type::String),
      booleanValue(false),
      stringValue(std::move(val)),
      intValue(0),
      doubleValue(0) {}

SerializerValue::SerializerValue(int val)
    : type(Type::Int),
      booleanValue(false),
      intValue(val),
      doubleValue(0) {}

SerializerValue::SerializerValue(double val)
    : type(Type::Double),
      booleanValue(false),
      intValue(0),
      doubleValue(val) {}

// ============================================================================
// MOVE SEMANTICS
// ============================================================================
// Optimization: Move constructor and assignment avoid copying the string value,
// which can be expensive for large strings. This is particularly beneficial
// during serialization when SerializerValue objects are frequently created
// and stored in containers.

SerializerValue::SerializerValue(SerializerValue&& other) noexcept
    : type(other.type),
      booleanValue(other.booleanValue),
      stringValue(std::move(other.stringValue)),
      intValue(other.intValue),
      doubleValue(other.doubleValue) {
  // Reset the moved-from object to a valid state
  other.type = Type::Unknown;
}

SerializerValue& SerializerValue::operator=(SerializerValue&& other) noexcept {
  if (this != &other) {
    type = other.type;
    booleanValue = other.booleanValue;
    stringValue = std::move(other.stringValue);
    intValue = other.intValue;
    doubleValue = other.doubleValue;
    // Reset the moved-from object to a valid state
    other.type = Type::Unknown;
  }
  return *this;
}

// ============================================================================
// GETTERS
// ============================================================================
// Optimization: Using switch on enum is typically faster than multiple if-else
// chains with boolean comparisons. The compiler can optimize switch statements
// into jump tables for O(1) dispatch.

bool SerializerValue::GetBool() const {
  switch (type) {
    case Type::Boolean:
      return booleanValue;
    case Type::Int:
      return intValue != 0;
    case Type::Double:
      return doubleValue != 0.0;
    case Type::String:
    case Type::Unknown:
    default:
      return stringValue != "false";
  }
}

gd::String SerializerValue::GetString() const {
  switch (type) {
    case Type::Boolean:
      return booleanValue ? gd::String("true") : gd::String("false");
    case Type::Int:
      return gd::String::From(intValue);
    case Type::Double:
      return gd::String::From(doubleValue);
    case Type::String:
    case Type::Unknown:
    default:
      return stringValue;
  }
}

int SerializerValue::GetInt() const {
  switch (type) {
    case Type::Boolean:
      return booleanValue ? 1 : 0;
    case Type::Int:
      return intValue;
    case Type::Double:
      return static_cast<int>(doubleValue);
    case Type::String:
    case Type::Unknown:
    default:
      return stringValue.To<int>();
  }
}

double SerializerValue::GetDouble() const {
  switch (type) {
    case Type::Boolean:
      return booleanValue ? 1.0 : 0.0;
    case Type::Int:
      return static_cast<double>(intValue);
    case Type::Double:
      return doubleValue;
    case Type::String:
    case Type::Unknown:
    default:
      return stringValue.To<double>();
  }
}

// ============================================================================
// SETTERS
// ============================================================================
// Optimization: Single enum assignment replaces 5 boolean assignments.
// This reduces the number of memory writes from 5 to 1 for the type tracking.

void SerializerValue::Set(const gd::String &val) {
  type = Type::Unknown;
  stringValue = val;
}

void SerializerValue::Set(gd::String &&val) {
  type = Type::Unknown;
  stringValue = std::move(val);
}

void SerializerValue::SetBool(bool val) {
  type = Type::Boolean;
  booleanValue = val;
}

void SerializerValue::SetString(const gd::String &val) {
  type = Type::String;
  stringValue = val;
}

void SerializerValue::SetString(gd::String &&val) {
  type = Type::String;
  stringValue = std::move(val);
}

void SerializerValue::SetInt(int val) {
  type = Type::Int;
  intValue = val;
}

void SerializerValue::SetDouble(double val) {
  type = Type::Double;
  doubleValue = val;
}

}  // namespace gd
