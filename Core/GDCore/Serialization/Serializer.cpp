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

void ElementToRapidJson(const gd::SerializerElement& element,
                        Value& value,
                        Document::AllocatorType& allocator) {
  if (!element.IsValueUndefined()) {
    const SerializerValue& serializerValue = element.GetValue();
    // TODO: use GetRaw to avoid conversions
    if (serializerValue.IsBoolean())
      value.SetBool(serializerValue.GetBool());
    else if (serializerValue.IsDouble())
      value.SetDouble(serializerValue.GetDouble());
    else if (serializerValue.IsInt())
      value.SetInt(serializerValue.GetInt());
    else if (serializerValue.IsString()) {
      // This does a copy of the string, and measure the string length.
      value.SetString(serializerValue.GetRawString().c_str(), allocator);
    }
  } else if (element.ConsideredAsArray()) {
    value.SetArray();

    const auto& children = element.GetAllChildren();
    value.Reserve(children.size(), allocator);

    for (const auto& child : children) {
      Value childValue;
      ElementToRapidJson(*child.second, childValue, allocator);
      value.PushBack(childValue, allocator);
    }
  } else {
    value.SetObject();

    const auto& attributes = element.GetAllAttributes();
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

      for (const auto& attribute : attributes) {
        sortedEntries.emplace(
            attribute.first,
            Entry{&attribute.second, nullptr});
      }
      for (const auto& child : children) {
        sortedEntries.emplace(
            child.first,
            Entry{nullptr, child.second.get()});
      }

      for (const auto& entry : sortedEntries) {
        Value name(entry.first.c_str(), allocator);
        Value childValue;
        if (entry.second.attributeValue != nullptr) {
          // Implicit conversion SerializerValue -> SerializerElement.
          ElementToRapidJson(
              *entry.second.attributeValue, childValue, allocator);
        } else if (entry.second.childElement != nullptr) {
          ElementToRapidJson(
              *entry.second.childElement, childValue, allocator);
        } else {
          // Defensive: skip malformed entries instead of dereferencing null.
          continue;
        }
        value.AddMember(name, childValue, allocator);
      }
    } else {
      for (const auto& attribute : attributes) {
        Value name(attribute.first.c_str(),
                   allocator);  // Copying the name is required.
        Value childValue;
        ElementToRapidJson(attribute.second, childValue, allocator);
        value.AddMember(name, childValue, allocator);
      }
      for (const auto& child : children) {
        Value name(child.first.c_str(),
                   allocator);  // Copying the name is required.
        Value childValue;
        ElementToRapidJson(*child.second, childValue, allocator);
        value.AddMember(name, childValue, allocator);
      }
    }
  }
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
  Document document;
  Document::AllocatorType& allocator = document.GetAllocator();

  ElementToRapidJson(element, document, allocator);

  StringBuffer buffer;
  Writer<StringBuffer> writer(buffer);
  document.Accept(writer);

  return buffer.GetString();  // Temporary copy
}

}  // namespace gd
