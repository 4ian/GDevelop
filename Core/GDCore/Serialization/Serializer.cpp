/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Serialization/Serializer.h"

#include <functional>
#include <iomanip>
#include <iostream>
#include <map>
#include <string>
#include <utility>
#include <vector>

#include "GDCore/CommonTools.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "rapidjson/document.h"
#include "rapidjson/prettywriter.h"
#include "rapidjson/rapidjson.h"

using namespace rapidjson;

namespace gd {

bool Serializer::canonicalMode = false;

gd::String Serializer::ToEscapedXMLString(const gd::String& str) {
  return str.FindAndReplace("&", "&amp;")
      .FindAndReplace("'", "&apos;")
      .FindAndReplace("\"", "&quot;")
      .FindAndReplace("<", "&lt;")
      .FindAndReplace(">", "&gt;");
}

namespace {
void RapidJsonValueToElement(const Value& value,
                             gd::SerializerElement& element) {
  if (value.IsBool()) {
    element.SetBoolValue(value.GetBool());
  } else if (value.IsNumber()) {
    if (value.IsInt64())
      element.SetIntValue(value.GetInt64());
    else if (value.IsUint64())
      element.SetIntValue(value.GetUint64());
    else if (value.IsInt())
      element.SetValue(value.GetInt());
    else if (value.IsUint())
      element.SetValue(value.GetUint());
    else if (value.IsDouble())
      element.SetValue(value.GetDouble());
    else if (value.IsFloat())
      element.SetValue(value.GetFloat());
  } else if (value.IsString()) {
    element.SetStringValue(value.GetString());
  } else if (value.IsObject()) {
    for (auto& m : value.GetObject()) {
      RapidJsonValueToElement(m.value, element.AddChild(m.name.GetString()));
    }
  } else if (value.IsArray()) {
    element.ConsiderAsArray();
    for (auto& m : value.GetArray()) {
      RapidJsonValueToElement(m, element.AddChild(""));
    }
  }
}

// Write the JSON of an element directly with the writer, in the order a
// rapidjson::Document built from it would be written, but without building
// that Document: a Document reserves 16 members for each object and copies all
// the strings, which takes about 12 times the size of the JSON (more than the
// elements themselves), on top of the elements and of the JSON text.
// Like Document::Accept, stop as soon as the writer refuses a value.
bool WriteValueToRapidJson(const SerializerValue& serializerValue,
                           Writer<StringBuffer>& writer) {
  // TODO: use GetRaw to avoid conversions
  if (serializerValue.IsBoolean())
    return writer.Bool(serializerValue.GetBool());
  else if (serializerValue.IsDouble())
    return writer.Double(serializerValue.GetDouble());
  else if (serializerValue.IsInt())
    return writer.Int(serializerValue.GetInt());
  else if (serializerValue.IsString())
    return writer.String(serializerValue.GetRawString().c_str());

  return writer.Null();
}

bool WriteElementToRapidJson(const gd::SerializerElement& element,
                             Writer<StringBuffer>& writer) {
  if (!element.IsValueUndefined())
    return WriteValueToRapidJson(element.GetValue(), writer);

  if (element.ConsideredAsArray()) {
    if (!writer.StartArray()) return false;
    for (const auto& child : element.GetAllChildren()) {
      if (!WriteElementToRapidJson(*child.second, writer)) return false;
    }
    return writer.EndArray();
  }

  if (!writer.StartObject()) return false;

  // Most elements have no attributes: don't make GetAllAttributes allocate them.
  const bool hasAttributes = element.HasAttributes();
  const auto& children = element.GetAllChildren();

  if (gd::Serializer::IsCanonicalMode()) {
    // In canonical mode, merge attributes and children into a single
    // alphabetically-sorted sequence so that the resulting JSON has
    // stable, alphabetical key order. Attributes are stored in a
    // std::map (already sorted) but children are stored in insertion
    // order; we re-sort the union here.
    //
    // Children with the same name (rare, but allowed) keep their
    // relative insertion order thanks to std::multimap stability.
    //
    // Exactly one of attributeValue / childElement is non-null per
    // entry; we discriminate on which pointer is set.
    struct Entry {
      const SerializerValue* attributeValue;
      const gd::SerializerElement* childElement;
    };
    std::multimap<gd::String, Entry> sortedEntries;

    if (hasAttributes) {
      for (const auto& attribute : element.GetAllAttributes()) {
        sortedEntries.emplace(
            attribute.first,
            Entry{&attribute.second, nullptr});
      }
    }
    for (const auto& child : children) {
      sortedEntries.emplace(
          child.first,
          Entry{nullptr, child.second.get()});
    }

    for (const auto& entry : sortedEntries) {
      if (entry.second.attributeValue != nullptr) {
        if (!writer.Key(entry.first.c_str()) ||
            !WriteValueToRapidJson(*entry.second.attributeValue, writer))
          return false;
      } else if (entry.second.childElement != nullptr) {
        if (!writer.Key(entry.first.c_str()) ||
            !WriteElementToRapidJson(*entry.second.childElement, writer))
          return false;
      }
      // Defensive: malformed entries are skipped instead of dereferencing null.
    }
  } else {
    if (hasAttributes) {
      for (const auto& attribute : element.GetAllAttributes()) {
        if (!writer.Key(attribute.first.c_str()) ||
            !WriteValueToRapidJson(attribute.second, writer))
          return false;
      }
    }
    for (const auto& child : children) {
      if (!writer.Key(child.first.c_str()) ||
          !WriteElementToRapidJson(*child.second, writer))
        return false;
    }
  }

  return writer.EndObject();
}
}  // namespace

SerializerElement Serializer::FromJSON(const char* json) {
  SerializerElement element;
  size_t len = strlen(json);
  if (len != 0) {
    Document document;

    // In-situ parsing, decode strings directly in the source string. Source
    // must be a mutable, null-terminated buffer. Heap-allocated because the
    // input can be very large (big projects) and would overflow the stack.
    std::vector<char> buffer(len + 1);
    memcpy(buffer.data(), json, len + 1);
    if (document.ParseInsitu(buffer.data()).HasParseError()) {
      std::cout << "TODO: error while parsing" << std::endl;
      return element;
    }

    RapidJsonValueToElement(document, element);
  }

  return element;
}

gd::String Serializer::ToJSON(const SerializerElement& element) {
  StringBuffer buffer;
  Writer<StringBuffer> writer(buffer);
  WriteElementToRapidJson(element, writer);

  return buffer.GetString();  // Temporary copy
}

}  // namespace gd
