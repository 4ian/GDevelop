/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Serialization/Serializer.h"

#include <iomanip>
#include <iostream>
#include <string>
#include <utility>
#include <vector>

#include "GDCore/CommonTools.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "rapidjson/document.h"
#include "rapidjson/prettywriter.h"
#include "rapidjson/rapidjson.h"
#if !defined(EMSCRIPTEN)
#include "GDCore/TinyXml/tinyxml.h"
#endif

using namespace rapidjson;

namespace gd {

#if !defined(EMSCRIPTEN)
void Serializer::ToXML(SerializerElement& element, TiXmlElement* xmlElement) {
  if (!xmlElement) return;

  if (element.IsValueUndefined()) {
    const std::map<gd::String, SerializerValue>& attributes =
        element.GetAllAttributes();
    for (std::map<gd::String, SerializerValue>::const_iterator it =
             attributes.begin();
         it != attributes.end();
         ++it) {
      const SerializerValue& attr = it->second;

      if (attr.IsBoolean())
        xmlElement->SetAttribute(it->first.c_str(),
                                 attr.GetBool() ? "true" : "false");
      else if (attr.IsString())
        xmlElement->SetAttribute(it->first.c_str(), attr.GetString().c_str());
      else if (attr.IsInt())
        xmlElement->SetAttribute(it->first.c_str(), attr.GetInt());
      else if (attr.IsDouble())
        xmlElement->SetDoubleAttribute(it->first.c_str(), attr.GetDouble());
      else
        xmlElement->SetAttribute(it->first.c_str(), attr.GetString().c_str());
    }

    const std::vector<
        std::pair<gd::String, std::shared_ptr<SerializerElement> > >& children =
        element.GetAllChildren();
    for (size_t i = 0; i < children.size(); ++i) {
      if (children[i].second == std::shared_ptr<SerializerElement>()) continue;

      TiXmlElement* xmlChild = new TiXmlElement(children[i].first.c_str());
      xmlElement->LinkEndChild(xmlChild);
      ToXML(*children[i].second, xmlChild);
    }
  } else {
    TiXmlText* xmlValue = new TiXmlText(element.GetValue().GetString().c_str());
    xmlElement->LinkEndChild(xmlValue);
  }
}

void Serializer::FromXML(SerializerElement& element,
                         const TiXmlElement* xmlElement) {
  if (!xmlElement) return;

  const TiXmlAttribute* attr = xmlElement->FirstAttribute();
  while (attr) {
    if (attr->Name() != NULL) {
      gd::String name = gd::String::FromUTF8(attr->Name()).ReplaceInvalid();
      if (attr->Value())
        element.SetAttribute(
            name, gd::String::FromUTF8(attr->Value()).ReplaceInvalid());
    }

    attr = attr->Next();
  }

  const TiXmlElement* child = xmlElement->FirstChildElement();
  while (child) {
    if (child->Value()) {
      gd::String name = gd::String::FromUTF8(child->Value()).ReplaceInvalid();
      SerializerElement& childElement = element.AddChild(name);
      FromXML(childElement, child);
    }

    child = child->NextSiblingElement();
  }

  if (xmlElement->GetText()) {
    SerializerValue value;
    value.Set(gd::String::FromUTF8(xmlElement->GetText()).ReplaceInvalid());
    element.SetValue(value);
  }
}
#endif

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
}  // namespace

SerializerElement Serializer::FromJSON(const char* json) {
  SerializerElement element;
  size_t len = strlen(json);
  if (len != 0) {
    Document document;

    // In-situ parsing, decode strings directly in the source string. Source
    // must be string.
    char buffer[len + 1];
    memcpy(buffer, json, len + 1);
    if (document.ParseInsitu(buffer).HasParseError()) {
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
