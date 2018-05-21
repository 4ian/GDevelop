#include "GDCore/Serialization/SerializerValue.h"
#include "GDCore/CommonTools.h"

namespace gd {

SerializerValue::SerializerValue()
    : isUnknown(true),
      isBoolean(false),
      isString(false),
      isInt(false),
      isDouble(false),
      booleanValue(false),
      intValue(0),
      doubleValue(0) {}

SerializerValue::SerializerValue(bool val)
    : isUnknown(true),
      isBoolean(false),
      isString(false),
      isInt(false),
      isDouble(false),
      booleanValue(false),
      intValue(0),
      doubleValue(0) {
  SetBool(val);
}
SerializerValue::SerializerValue(const gd::String &val)
    : isUnknown(true),
      isBoolean(false),
      isString(false),
      isInt(false),
      isDouble(false),
      booleanValue(false),
      intValue(0),
      doubleValue(0) {
  SetString(val);
}
SerializerValue::SerializerValue(int val)
    : isUnknown(true),
      isBoolean(false),
      isString(false),
      isInt(false),
      isDouble(false),
      booleanValue(false),
      intValue(0),
      doubleValue(0) {
  SetInt(val);
}
SerializerValue::SerializerValue(double val)
    : isUnknown(true),
      isBoolean(false),
      isString(false),
      isInt(false),
      isDouble(false),
      booleanValue(false),
      intValue(0),
      doubleValue(0) {
  SetDouble(val);
}

bool SerializerValue::GetBool() const {
  if (isString || isUnknown)
    return stringValue != "false";
  else if (isInt)
    return intValue != 0;
  else if (isDouble)
    return doubleValue != 0.0;

  return booleanValue;
}

gd::String SerializerValue::GetString() const {
  if (isBoolean)
    return booleanValue ? gd::String("true") : gd::String("false");
  else if (isInt)
    return gd::String::From(intValue);
  else if (isDouble)
    return gd::String::From(doubleValue);
  else if (isUnknown)
    return stringValue;

  return stringValue;
}

int SerializerValue::GetInt() const {
  if (isBoolean)
    return booleanValue ? 1 : 0;
  else if (isString || isUnknown)
    return stringValue.To<int>();
  else if (isDouble)
    return doubleValue;

  return intValue;
}

double SerializerValue::GetDouble() const {
  if (isBoolean)
    return booleanValue ? 1 : 0;
  else if (isString || isUnknown)
    return stringValue.To<double>();
  else if (isInt)
    return intValue;

  return doubleValue;
}

void SerializerValue::Set(const gd::String &val) {
  isUnknown = true;
  isBoolean = false;
  isString = false;
  isInt = false;
  isDouble = false;

  stringValue = val;
}

void SerializerValue::SetBool(bool val) {
  isUnknown = false;
  isBoolean = true;
  isString = false;
  isInt = false;
  isDouble = false;

  booleanValue = val;
}

void SerializerValue::SetString(const gd::String &val) {
  isUnknown = false;
  isBoolean = false;
  isString = true;
  isInt = false;
  isDouble = false;

  stringValue = val;
}

void SerializerValue::SetInt(int val) {
  isUnknown = false;
  isBoolean = false;
  isString = false;
  isInt = true;
  isDouble = false;

  intValue = val;
}

void SerializerValue::SetDouble(double val) {
  isUnknown = false;
  isBoolean = false;
  isString = false;
  isInt = false;
  isDouble = true;

  doubleValue = val;
}

}  // namespace gd
