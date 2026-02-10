/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Serialization/BinarySerializer.h"
#include "GDCore/Tools/Log.h"
#include <cstdlib>
#include <cstring>

namespace gd {

size_t BinarySerializer::lastBinarySnapshotSize = 0;

using NodeType = BinarySerializer::NodeType;

void BinarySerializer::SerializeToBinaryBuffer(const SerializerElement& element,
                                         std::vector<uint8_t>& outBuffer) {
  // Reserve approximate size (heuristic: 1KB minimum)
  outBuffer.clear();
  outBuffer.reserve(1024);

  // Write magic header and version
  Write(outBuffer, static_cast<uint32_t>(0x47444253));  // "GDBS" magic
  Write(outBuffer, static_cast<uint32_t>(1));           // Version 1

  // Serialize the element tree
  SerializeElement(element, outBuffer);
}

void BinarySerializer::SerializeElement(const SerializerElement& element,
                                        std::vector<uint8_t>& buffer) {
  Write(buffer, NodeType::Element);

  // Serialize value
  if (element.IsValueUndefined()) {
    Write(buffer, NodeType::ValueUndefined);
  } else {
    SerializeValue(element.GetValue(), buffer);
  }

  // Serialize attributes
  const auto& attributes = element.GetAllAttributes();
  Write(buffer, static_cast<uint32_t>(attributes.size()));
  for (const auto& attr : attributes) {
    SerializeString(attr.first, buffer);
    SerializeValue(attr.second, buffer);
  }

  // Serialize array flags
  Write(buffer, element.ConsideredAsArray());
  SerializeString(element.ConsideredAsArrayOf(), buffer);

  // Serialize children
  const auto& children = element.GetAllChildren();
  Write(buffer, static_cast<uint32_t>(children.size()));
  for (const auto& child : children) {
    SerializeString(child.first, buffer);  // Child name
    SerializeElement(*child.second, buffer);  // Child element (recursive)
  }
}

void BinarySerializer::SerializeValue(const SerializerValue& value,
                                      std::vector<uint8_t>& buffer) {
  if (value.IsBoolean()) {
    Write(buffer, NodeType::ValueBool);
    Write(buffer, value.GetBool());
  } else if (value.IsInt()) {
    Write(buffer, NodeType::ValueInt);
    Write(buffer, value.GetInt());
  } else if (value.IsDouble()) {
    Write(buffer, NodeType::ValueDouble);
    Write(buffer, value.GetDouble());
  } else if (value.IsString()) {
    Write(buffer, NodeType::ValueString);
    SerializeString(value.GetString(), buffer);
  } else {
    // Shouldn't happen, but handle gracefully
    Write(buffer, NodeType::ValueUndefined);
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

bool BinarySerializer::DeserializeFromBinaryBuffer(const uint8_t* buffer,
                                             size_t bufferSize,
                                             SerializerElement& outElement) {
  const uint8_t* ptr = buffer;
  const uint8_t* end = buffer + bufferSize;

  // Read and verify magic header
  uint32_t magic;
  if (!Read(ptr, end, magic) || magic != 0x47444253) {
    gd::LogError("Failed to deserialize binary snapshot: invalid magic.");
    return false;  // Invalid magic
  }

  // Read version
  uint32_t version;
  if (!Read(ptr, end, version) || version != 1) {
    gd::LogError("Failed to deserialize binary snapshot: unsupported version.");
    return false;  // Unsupported version
  }

  // Deserialize element tree
  return DeserializeElement(ptr, end, outElement);
}

bool BinarySerializer::DeserializeElement(const uint8_t*& ptr,
                                          const uint8_t* end,
                                          SerializerElement& element) {
  NodeType nodeType;
  if (!Read(ptr, end, nodeType) || nodeType != NodeType::Element) {
    gd::LogError("Failed to deserialize binary snapshot: invalid node type.");
    return false;
  }

  // Deserialize value
  NodeType valueType;
  if (!Read(ptr, end, valueType)) {
    gd::LogError("Failed to deserialize binary snapshot: invalid value type.");
    return false;
  }

  if (valueType != NodeType::ValueUndefined) {
    SerializerValue value;
    if (!DeserializeValue(ptr, end, value, valueType)) return false;
    element.SetValue(value);
  }

  // Deserialize attributes
  uint32_t attrCount;
  if (!Read(ptr, end, attrCount)) return false;

  for (uint32_t i = 0; i < attrCount; ++i) {
    gd::String attrName;
    if (!DeserializeString(ptr, end, attrName)) return false;

    SerializerValue attrValue;
    NodeType attrValueType;
    if (!Read(ptr, end, attrValueType)) return false;
    if (!DeserializeValue(ptr, end, attrValue, attrValueType)) return false;

    // Set attribute based on type
    if (attrValue.IsBoolean()) {
      element.SetAttribute(attrName, attrValue.GetBool());
    } else if (attrValue.IsInt()) {
      element.SetAttribute(attrName, attrValue.GetInt());
    } else if (attrValue.IsDouble()) {
      element.SetAttribute(attrName, attrValue.GetDouble());
    } else if (attrValue.IsString()) {
      element.SetAttribute(attrName, attrValue.GetString());
    }
  }

  // Deserialize array flags
  bool isArray;
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
                                        SerializerValue& value,
                                        NodeType valueType) {
  switch (valueType) {
    case NodeType::ValueBool: {
      bool boolVal;
      if (!Read(ptr, end, boolVal)) return false;
      value.SetBool(boolVal);
      break;
    }
    case NodeType::ValueInt: {
      int intVal;
      if (!Read(ptr, end, intVal)) return false;
      value.SetInt(intVal);
      break;
    }
    case NodeType::ValueDouble: {
      double doubleVal;
      if (!Read(ptr, end, doubleVal)) return false;
      value.SetDouble(doubleVal);
      break;
    }
    case NodeType::ValueString: {
      gd::String strVal;
      if (!DeserializeString(ptr, end, strVal)) return false;
      value.SetString(strVal);
      break;
    }
    case NodeType::ValueUndefined:
      // Value remains undefined
      break;
    default:
      return false;  // Unknown value type
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

uintptr_t BinarySerializer::CreateBinarySnapshot(const SerializerElement& element) {
  std::vector<uint8_t> buffer;
  SerializeToBinaryBuffer(element, buffer);

  lastBinarySnapshotSize = buffer.size();

  // Allocate memory in Emscripten heap
  uint8_t* heapBuffer = (uint8_t*)malloc(buffer.size());
  if (!heapBuffer) {
    lastBinarySnapshotSize = 0;
    return 0;
  }

  std::memcpy(heapBuffer, buffer.data(), buffer.size());
  return reinterpret_cast<uintptr_t>(heapBuffer);
}

size_t BinarySerializer::GetLastBinarySnapshotSize() {
  return lastBinarySnapshotSize;
}

void BinarySerializer::FreeBinarySnapshot(uintptr_t bufferPtr) {
  if (bufferPtr) {
    free(reinterpret_cast<void*>(bufferPtr));
  }
}

SerializerElement* BinarySerializer::DeserializeBinarySnapshot(uintptr_t bufferPtr,
                                                                size_t size) {
  if (!bufferPtr || size == 0) {
    gd::LogError("Failed to deserialize binary snapshot: invalid buffer pointer or size.");
    return nullptr;
  }

  const uint8_t* buffer = reinterpret_cast<const uint8_t*>(bufferPtr);
  SerializerElement* element = new SerializerElement();

  if (!DeserializeFromBinaryBuffer(buffer, size, *element)) {
    gd::LogError("Failed to deserialize binary snapshot.");
    delete element;
    return nullptr;
  }

  return element;
}

}  // namespace gd
