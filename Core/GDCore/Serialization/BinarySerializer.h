/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_BINARY_SERIALIZER_H
#define GDCORE_BINARY_SERIALIZER_H

#include <cstdint>
#include <cstring>
#include <vector>

#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

/**
 * \brief Fast binary serialization/deserialization for SerializerElement
 * trees.
 *
 * This format is optimized for speed and compactness, not for human
 * readability or long-term storage. Use it for transferring data between
 * threads (e.g., main thread to web worker).
 *
 * The binary format consists of:
 * - A magic header ("GDBS") and version number
 * - A recursive tree structure where each element contains:
 *   - Its value (with type tag)
 *   - Its attributes (as key-value pairs)
 *   - Its array flags
 *   - Its children (recursively)
 */
class GD_CORE_API BinarySerializer {
 public:
  /**
   * \brief Serialize a SerializerElement tree to a binary buffer.
   *
   * \param element The root element to serialize
   * \param outBuffer Output buffer that will contain the binary data
   */
  static void SerializeToBinary(const SerializerElement& element,
                                std::vector<uint8_t>& outBuffer);

  /**
   * \brief Deserialize a binary buffer back to a SerializerElement tree.
   *
   * \param buffer The binary data
   * \param bufferSize Size of the binary data
   * \param outElement The output element (will be populated)
   * \return true if successful, false if corrupted data
   */
  static bool DeserializeFromBinary(const uint8_t* buffer,
                                    size_t bufferSize,
                                    SerializerElement& outElement);

 private:
  // Binary format constants
  static constexpr uint32_t MAGIC_HEADER = 0x47444253;  // "GDBS" in hex
  static constexpr uint32_t FORMAT_VERSION = 1;

  // Value type tags
  enum class ValueType : uint8_t {
    Undefined = 0x00,
    Bool = 0x01,
    Int = 0x02,
    Double = 0x03,
    String = 0x04,
    Unknown = 0x05  // For SerializerValue's isUnknown type
  };

  // Internal serialization
  static void SerializeElement(const SerializerElement& element,
                               std::vector<uint8_t>& buffer);
  static void SerializeValue(const SerializerValue& value,
                             bool isUndefined,
                             std::vector<uint8_t>& buffer);
  static void SerializeString(const gd::String& str,
                              std::vector<uint8_t>& buffer);

  // Internal deserialization
  static bool DeserializeElement(const uint8_t*& ptr,
                                 const uint8_t* end,
                                 SerializerElement& element);
  static bool DeserializeValue(const uint8_t*& ptr,
                               const uint8_t* end,
                               SerializerElement& element);
  static bool DeserializeString(const uint8_t*& ptr,
                                const uint8_t* end,
                                gd::String& str);

  // Helper to write primitive types
  template <typename T>
  static void Write(std::vector<uint8_t>& buffer, const T& value) {
    const uint8_t* bytes = reinterpret_cast<const uint8_t*>(&value);
    buffer.insert(buffer.end(), bytes, bytes + sizeof(T));
  }

  // Helper to read primitive types
  template <typename T>
  static bool Read(const uint8_t*& ptr, const uint8_t* end, T& value) {
    if (ptr + sizeof(T) > end) return false;
    std::memcpy(&value, ptr, sizeof(T));
    ptr += sizeof(T);
    return true;
  }
};

}  // namespace gd

#endif  // GDCORE_BINARY_SERIALIZER_H
