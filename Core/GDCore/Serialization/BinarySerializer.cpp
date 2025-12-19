/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Serialization/BinarySerializer.h"

#include <cstring>
#include <iostream>

namespace gd {

void BinarySerializer::SerializeToBinary(const SerializerElement& element,
                                         std::vector<uint8_t>& outBuffer) {
  // Reserve approximate size (heuristic: 4KB minimum)
  outBuffer.reserve(4096);

  // Write magic header and version
  Write(outBuffer, MAGIC_HEADER);
  Write(outBuffer, FORMAT_VERSION);

  // Serialize the element tree
  SerializeElement(element, outBuffer);
}

void BinarySerializer::SerializeElement(const SerializerElement& element,
                                        std::vector<uint8_t>& buffer) {
  // Serialize value (with undefined flag)
  SerializeValue(element.GetValue(), element.IsValueUndefined(), buffer);

  // Serialize attributes
  const auto& attributes = element.GetAllAttributes();
  Write(buffer, static_cast<uint32_t>(attributes.size()));
  for (const auto& attr : attributes) {
    SerializeString(attr.first, buffer);
    // Attributes are never undefined
    SerializeValue(attr.second, false, buffer);
  }

  // Serialize array flags
  Write(buffer, static_cast<uint8_t>(element.ConsideredAsArray() ? 1 : 0));
  SerializeString(element.ConsideredAsArrayOf(), buffer);

  // Serialize children
  const auto& children = element.GetAllChildren();
  Write(buffer, static_cast<uint32_t>(children.size()));
  for (const auto& child : children) {
    SerializeString(child.first, buffer);         // Child name
    SerializeElement(*child.second, buffer);      // Child element (recursive)
  }
}

void BinarySerializer::SerializeValue(const SerializerValue& value,
                                      bool isUndefined,
                                      std::vector<uint8_t>& buffer) {
  if (isUndefined) {
    Write(buffer, ValueType::Undefined);
  } else if (value.IsBoolean()) {
    Write(buffer, ValueType::Bool);
    Write(buffer, static_cast<uint8_t>(value.GetBool() ? 1 : 0));
  } else if (value.IsInt()) {
    Write(buffer, ValueType::Int);
    Write(buffer, value.GetInt());
  } else if (value.IsDouble()) {
    Write(buffer, ValueType::Double);
    Write(buffer, value.GetDouble());
  } else if (value.IsString()) {
    Write(buffer, ValueType::String);
    SerializeString(value.GetRawString(), buffer);
  } else {
    // Handle "unknown" type - stored as string
    Write(buffer, ValueType::Unknown);
    SerializeString(value.GetString(), buffer);
  }
}

void BinarySerializer::SerializeString(const gd::String& str,
                                       std::vector<uint8_t>& buffer) {
  // Convert to UTF-8
  std::string utf8 = str.ToUTF8();

  // Write length + data
  Write(buffer, static_cast<uint32_t>(utf8.size()));
  buffer.insert(buffer.end(), utf8.begin(), utf8.end());
}

bool BinarySerializer::DeserializeFromBinary(const uint8_t* buffer,
                                             size_t bufferSize,
                                             SerializerElement& outElement) {
  if (!buffer || bufferSize < 8) {
    return false;  // Need at least magic + version
  }

  const uint8_t* ptr = buffer;
  const uint8_t* end = buffer + bufferSize;

  // Read and verify magic header
  uint32_t magic;
  if (!Read(ptr, end, magic) || magic != MAGIC_HEADER) {
    std::cerr << "BinarySerializer: Invalid magic header" << std::endl;
    return false;
  }

  // Read version
  uint32_t version;
  if (!Read(ptr, end, version) || version != FORMAT_VERSION) {
    std::cerr << "BinarySerializer: Unsupported version " << version
              << std::endl;
    return false;
  }

  // Deserialize element tree
  return DeserializeElement(ptr, end, outElement);
}

bool BinarySerializer::DeserializeElement(const uint8_t*& ptr,
                                          const uint8_t* end,
                                          SerializerElement& element) {
  // Deserialize value
  if (!DeserializeValue(ptr, end, element)) return false;

  // Deserialize attributes
  uint32_t attrCount;
  if (!Read(ptr, end, attrCount)) return false;

  for (uint32_t i = 0; i < attrCount; ++i) {
    gd::String attrName;
    if (!DeserializeString(ptr, end, attrName)) return false;

    // Read value type
    ValueType valueType;
    if (!Read(ptr, end, valueType)) return false;

    switch (valueType) {
      case ValueType::Bool: {
        uint8_t boolVal;
        if (!Read(ptr, end, boolVal)) return false;
        element.SetAttribute(attrName, boolVal != 0);
        break;
      }
      case ValueType::Int: {
        int intVal;
        if (!Read(ptr, end, intVal)) return false;
        element.SetAttribute(attrName, intVal);
        break;
      }
      case ValueType::Double: {
        double doubleVal;
        if (!Read(ptr, end, doubleVal)) return false;
        element.SetAttribute(attrName, doubleVal);
        break;
      }
      case ValueType::String:
      case ValueType::Unknown: {
        gd::String strVal;
        if (!DeserializeString(ptr, end, strVal)) return false;
        element.SetAttribute(attrName, strVal);
        break;
      }
      case ValueType::Undefined:
        // Attributes shouldn't be undefined, but handle gracefully
        break;
    }
  }

  // Deserialize array flags
  uint8_t isArray;
  if (!Read(ptr, end, isArray)) return false;
  if (isArray) element.ConsiderAsArray();

  gd::String arrayOf;
  if (!DeserializeString(ptr, end, arrayOf)) return false;
  if (!arrayOf.empty()) {
    element.ConsiderAsArrayOf(arrayOf);
  }

  // Deserialize children
  uint32_t childCount;
  if (!Read(ptr, end, childCount)) return false;

  for (uint32_t i = 0; i < childCount; ++i) {
    gd::String childName;
    if (!DeserializeString(ptr, end, childName)) return false;

    SerializerElement& child = element.AddChild(childName);
    if (!DeserializeElement(ptr, end, child)) return false;
  }

  return true;
}

bool BinarySerializer::DeserializeValue(const uint8_t*& ptr,
                                        const uint8_t* end,
                                        SerializerElement& element) {
  ValueType valueType;
  if (!Read(ptr, end, valueType)) return false;

  switch (valueType) {
    case ValueType::Bool: {
      uint8_t boolVal;
      if (!Read(ptr, end, boolVal)) return false;
      element.SetBoolValue(boolVal != 0);
      break;
    }
    case ValueType::Int: {
      int intVal;
      if (!Read(ptr, end, intVal)) return false;
      element.SetIntValue(intVal);
      break;
    }
    case ValueType::Double: {
      double doubleVal;
      if (!Read(ptr, end, doubleVal)) return false;
      element.SetDoubleValue(doubleVal);
      break;
    }
    case ValueType::String: {
      gd::String strVal;
      if (!DeserializeString(ptr, end, strVal)) return false;
      element.SetStringValue(strVal);
      break;
    }
    case ValueType::Unknown: {
      // For unknown type, we store as string
      gd::String strVal;
      if (!DeserializeString(ptr, end, strVal)) return false;
      element.SetStringValue(strVal);
      break;
    }
    case ValueType::Undefined:
      // Value remains undefined (default state)
      break;
  }

  return true;
}

bool BinarySerializer::DeserializeString(const uint8_t*& ptr,
                                         const uint8_t* end,
                                         gd::String& str) {
  uint32_t length;
  if (!Read(ptr, end, length)) return false;

  if (ptr + length > end) return false;

  std::string utf8(reinterpret_cast<const char*>(ptr), length);
  ptr += length;

  str = gd::String::FromUTF8(utf8);
  return true;
}

}  // namespace gd
