/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <cstdint>
#include <cstring>
#include <vector>

#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

/**
 * \brief Fast binary serialization/deserialization for SerializerElement trees.
 *
 * This format is optimized for speed and compactness, not for human readability
 * or long-term storage. For transferring data between "threads" (web workers).
 */
class GD_CORE_API BinarySerializer {
 public:
  /**
   * \brief Serialize a SerializerElement tree to a binary buffer.
   *
   * \param element The root element to serialize
   * \param outBuffer Output buffer that will contain the binary data
   */
  static void SerializeToBinaryBuffer(const SerializerElement& element,
                                std::vector<uint8_t>& outBuffer);

  /**
   * \brief Deserialize a binary buffer back to a SerializerElement tree.
   *
   * \param buffer The binary data
   * \param bufferSize Size of the binary data
   * \param outElement The output element (will be populated)
   * \return true if successful, false if corrupted data
   */
  static bool DeserializeFromBinaryBuffer(const uint8_t* buffer,
                                    size_t bufferSize,
                                    SerializerElement& outElement);

  /** \name Helpers
   */
  ///@{
  /**
   * \brief Create a binary snapshot and return the size.
   * The binary data is written to Emscripten's heap at the returned pointer.
   * \return Pointer to binary data in Emscripten heap (use GetLastBinarySnapshotSize to get size)
   */
  static uintptr_t CreateBinarySnapshot(const SerializerElement& element);

  /**
   * \brief Get the size of the last created binary snapshot.
   * Must be called immediately after CreateBinarySnapshot.
   */
  static size_t GetLastBinarySnapshotSize();

  /**
   * \brief Free a binary snapshot.
   */
  static void FreeBinarySnapshot(uintptr_t bufferPtr);

  /**
   * \brief Deserialize binary snapshot back to SerializerElement.
   * \return New SerializerElement pointer (caller owns it)
   */
  static SerializerElement* DeserializeBinarySnapshot(uintptr_t bufferPtr,
                                                       size_t size);
  ///@}

  enum class NodeType : uint8_t {
    Element = 0x01,
    ValueUndefined = 0x02,
    ValueBool = 0x03,
    ValueInt = 0x04,
    ValueDouble = 0x05,
    ValueString = 0x06
  };

 private:
  // Internal serialization
  static void SerializeElement(const SerializerElement& element,
                               std::vector<uint8_t>& buffer);
  static void SerializeValue(const SerializerValue& value,
                             std::vector<uint8_t>& buffer);
  static void SerializeString(const gd::String& str,
                              std::vector<uint8_t>& buffer);

  // Internal deserialization
  static bool DeserializeElement(const uint8_t*& ptr,
                                 const uint8_t* end,
                                 SerializerElement& element);
  static bool DeserializeValue(const uint8_t*& ptr,
                               const uint8_t* end,
                               SerializerValue& value,
                               NodeType valueType);
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

  // Store the last binary size for retrieval
  static size_t lastBinarySnapshotSize;
};

}  // namespace gd
