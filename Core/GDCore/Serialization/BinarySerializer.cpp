// BinarySerializer.cpp
#include "BinarySerializer.h"
#include "GDCore/Serialization/Serializer.h"
#include <cstring>

namespace gd {

// Binary format constants
enum class NodeType : uint8_t {
  Element = 0x01,
  ValueUndefined = 0x02,
  ValueBool = 0x03,
  ValueInt = 0x04,
  ValueDouble = 0x05,
  ValueString = 0x06
};

void BinarySerializer::SerializeToBinary(const SerializerElement& element,
                                        std::vector<uint8_t>& outBuffer) {
  // Reserve approximate size (heuristic: 1KB minimum)
  outBuffer.reserve(1024);
  
  // Write magic header and version
  Write(outBuffer, static_cast<uint32_t>(0x47444253)); // "GDBS" magic
  Write(outBuffer, static_cast<uint32_t>(1)); // Version 1
  
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
    SerializeString(child.first, buffer); // Child name
    SerializeElement(*child.second, buffer); // Child element (recursive)
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
    // Should be string if unknown or other types, assuming GetString() handles it.
    // SerializerValue usually falls back to string.
    Write(buffer, NodeType::ValueString);
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
  const uint8_t* ptr = buffer;
  const uint8_t* end = buffer + bufferSize;
  
  // Read and verify magic header
  uint32_t magic;
  if (!Read(ptr, end, magic) || magic != 0x47444253) {
    return false; // Invalid magic
  }
  
  // Read version
  uint32_t version;
  if (!Read(ptr, end, version) || version != 1) {
    return false; // Unsupported version
  }
  
  // Deserialize element tree
  return DeserializeElement(ptr, end, outElement);
}

bool BinarySerializer::DeserializeElement(const uint8_t*& ptr,
                                         const uint8_t* end,
                                         SerializerElement& element) {
  NodeType nodeType;
  if (!Read(ptr, end, nodeType) || nodeType != NodeType::Element) {
    return false;
  }
  
  // Deserialize value
  NodeType valueType;
  if (!Read(ptr, end, valueType)) return false;
  
  if (valueType != NodeType::ValueUndefined) {
    // We need to peek or just handle based on type.
    // Wait, Read advances ptr. We read valueType.
    
    // We need to implement DeserializeValue differently because we already read the type.
    // Or we can put logic here.
    
    // Let's refactor SerializeValue/DeserializeValue to handle the type tag inside.
    // In SerializeValue we write the tag. In DeserializeValue we read the tag?
    // In SerializeElement:
    //   Write(buffer, NodeType::ValueUndefined); OR SerializeValue(...)
    //   SerializeValue writes the tag.
    
    // In DeserializeElement:
    //   We read valueType.
    //   If Undefined, we are done with value.
    //   If not Undefined, we need to read the value content.
    //   But SerializeValue WROTE the tag.
    //   So if we read valueType here, we are consuming what SerializeValue wrote?
    //   NO.
    //   SerializeElement writes ValueUndefined tag IF undefined.
    //   ELSE it calls SerializeValue, which writes the tag (Bool/Int/etc).
    
    //   So here in DeserializeElement:
    //   Read(ptr, end, valueType).
    //   If valueType == ValueUndefined, done.
    //   Else, we have a value type (Bool/Int/etc).
    //   We should pass this type to a helper or handle it here.
    
    switch (valueType) {
      case NodeType::ValueBool: {
        bool boolVal;
        if (!Read(ptr, end, boolVal)) return false;
        element.SetBoolValue(boolVal);
        break;
      }
      case NodeType::ValueInt: {
        int intVal;
        if (!Read(ptr, end, intVal)) return false;
        element.SetIntValue(intVal);
        break;
      }
      case NodeType::ValueDouble: {
        double doubleVal;
        if (!Read(ptr, end, doubleVal)) return false;
        element.SetDoubleValue(doubleVal);
        break;
      }
      case NodeType::ValueString: {
        gd::String strVal;
        if (!DeserializeString(ptr, end, strVal)) return false;
        element.SetStringValue(strVal);
        break;
      }
      default:
        return false; // Unexpected type
    }
  }
  
  // Deserialize attributes
  uint32_t attrCount;
  if (!Read(ptr, end, attrCount)) return false;
  
  for (uint32_t i = 0; i < attrCount; ++i) {
    gd::String attrName;
    if (!DeserializeString(ptr, end, attrName)) return false;
    
    SerializerValue attrValue;
    if (!DeserializeValue(ptr, end, attrValue)) return false;
    
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
                                       SerializerValue& value) {
  NodeType valueType;
  if (!Read(ptr, end, valueType)) return false;
  
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
      // Value remains undefined/empty
      break;
    default:
      return false; // Unknown value type
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

#ifdef EMSCRIPTEN
extern "C" {

EMSCRIPTEN_KEEPALIVE
uint8_t* createBinarySnapshot(SerializerElement* element, size_t* outSize) {
  if (!element || !outSize) return nullptr;
  
  std::vector<uint8_t> buffer;
  gd::BinarySerializer::SerializeToBinary(*element, buffer);
  
  *outSize = buffer.size();
  uint8_t* result = (uint8_t*)malloc(buffer.size());
  if (result) {
    std::memcpy(result, buffer.data(), buffer.size());
  }
  
  return result;
}

EMSCRIPTEN_KEEPALIVE
void freeBinarySnapshot(uint8_t* buffer) {
  free(buffer);
}

EMSCRIPTEN_KEEPALIVE
SerializerElement* deserializeBinarySnapshot(const uint8_t* buffer, size_t size) {
  if (!buffer || size == 0) return nullptr;
  
  SerializerElement* element = new SerializerElement();
  if (!gd::BinarySerializer::DeserializeFromBinary(buffer, size, *element)) {
    delete element;
    return nullptr;
  }
  
  return element;
}

EMSCRIPTEN_KEEPALIVE
char* serializeElementToJSON(SerializerElement* element) {
  if (!element) return nullptr;
  
  gd::String json = gd::Serializer::ToJSON(*element);
  std::string utf8 = json.ToUTF8();
  
  char* result = (char*)malloc(utf8.size() + 1);
  if (result) {
    std::memcpy(result, utf8.c_str(), utf8.size() + 1);
  }
  return result;
}

EMSCRIPTEN_KEEPALIVE
void deleteSerializerElement(SerializerElement* element) {
  delete element;
}

}
#endif

} // namespace gd
