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
#if !defined(EMSCRIPTEN)
#include "GDCore/TinyXml/tinyxml.h"
#endif

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

namespace {

/**
 * Adapted from public domain library "jsoncpp"
 * (http://sourceforge.net/projects/jsoncpp/).
 */
static inline bool isControlCharacter(char ch) { return ch > 0 && ch <= 0x1F; }

/**
 * Adapted from public domain library "jsoncpp"
 * (http://sourceforge.net/projects/jsoncpp/).
 */
static bool containsControlCharacter(const char* str) {
  while (*str) {
    if (isControlCharacter(*(str++))) return true;
  }
  return false;
}

/**
 * Tool function converting a string to a quoted string that can be inserted
 * into a JSON file. Adapted from public domain library "jsoncpp"
 * (http://sourceforge.net/projects/jsoncpp/).
 */
gd::String StringToQuotedJSONString(const char* value) {
  if (value == NULL) return "";
  // Not sure how to handle unicode...
  if (strpbrk(value, "\"\\\b\f\n\r\t") == NULL &&
      !containsControlCharacter(value))
    return gd::String("\"") + value + "\"";
  // We have to walk value and escape any special characters.
  // Appending to std::string is not efficient, but this should be rare.
  // (Note: forward slashes are *not* rare, but I am not escaping them.)
  std::string::size_type maxsize =
      strlen(value) * 2 + 3;  // allescaped+quotes+NULL
  std::string result;
  result.reserve(maxsize);  // to avoid lots of mallocs
  result += "\"";
  for (const char* c = value; *c != 0; ++c) {
    switch (*c) {
      case '\"':
        result += "\\\"";
        break;
      case '\\':
        result += "\\\\";
        break;
      case '\b':
        result += "\\b";
        break;
      case '\f':
        result += "\\f";
        break;
      case '\n':
        result += "\\n";
        break;
      case '\r':
        result += "\\r";
        break;
      case '\t':
        result += "\\t";
        break;
      // case '/':
      // Even though \/ is considered a legal escape in JSON, a bare
      // slash is also legal, so I see no reason to escape it.
      // (I hope I am not misunderstanding something.
      // blep notes: actually escaping \/ may be useful in javascript to avoid
      // </ sequence. Should add a flag to allow this compatibility mode and
      // prevent this sequence from occurring.
      default:
        if (isControlCharacter(*c)) {
          std::ostringstream oss;
          oss << "\\u" << std::hex << std::uppercase << std::setfill('0')
              << std::setw(4) << static_cast<int>(*c);
          result += oss.str();
        } else {
          result += *c;
        }
        break;
    }
  }
  result += "\"";
  return gd::String::FromUTF8(result);
}

gd::String ValueToJSON(const SerializerValue& val) {
  if (val.IsBoolean())
    return val.GetBool() ? "true" : "false";
  else if (val.IsInt())
    return gd::String::From(val.GetInt());
  else if (val.IsDouble())
    return gd::String::From(val.GetDouble());
  else
    return StringToQuotedJSONString(val.GetString().c_str());
}
}  // namespace

gd::String Serializer::ToJSON(const SerializerElement& element) {
  if (element.IsValueUndefined()) {
    if (element.ConsideredAsArray()) {
      // Store the element as an array in JSON:
      gd::String str = "[";
      bool firstChild = true;

      if (element.GetAllAttributes().size() > 0) {
        std::cout
            << "WARNING: A SerializerElement is considered as an array of "
            << (element.ConsideredAsArrayOf().empty()
                    ? "[unnamed elements]"
                    : element.ConsideredAsArrayOf())
            << " but has attributes. These attributes won't be saved!"
            << std::endl;
      }

      const std::vector<
          std::pair<gd::String, std::shared_ptr<SerializerElement> > >&
          children = element.GetAllChildren();
      for (size_t i = 0; i < children.size(); ++i) {
        if (children[i].second == std::shared_ptr<SerializerElement>())
          continue;
        if (children[i].first != element.ConsideredAsArrayOf()) {
          std::cout
              << "WARNING: A SerializerElement is considered as an array of "
              << (element.ConsideredAsArrayOf().empty()
                      ? "[unnamed elements]"
                      : element.ConsideredAsArrayOf())
              << " but has a child called \"" << children[i].first
              << "\". This child won't be saved!" << std::endl;
          continue;
        }

        if (!firstChild) str += ",";
        str += ToJSON(*children[i].second);

        firstChild = false;
      }

      str += "]";
      return str;
    } else {
      gd::String str = "{";
      bool firstChild = true;

      const std::map<gd::String, SerializerValue>& attributes =
          element.GetAllAttributes();
      for (std::map<gd::String, SerializerValue>::const_iterator it =
               attributes.begin();
           it != attributes.end();
           ++it) {
        if (!firstChild) str += ",";
        str += StringToQuotedJSONString(it->first.c_str()) + ": " +
               ValueToJSON(it->second);

        firstChild = false;
      }

      const std::vector<
          std::pair<gd::String, std::shared_ptr<SerializerElement> > >&
          children = element.GetAllChildren();
      for (size_t i = 0; i < children.size(); ++i) {
        if (children[i].second == std::shared_ptr<SerializerElement>())
          continue;

        if (!firstChild) str += ",";
        str += StringToQuotedJSONString(children[i].first.c_str()) + ": " +
               ToJSON(*children[i].second);

        firstChild = false;
      }

      str += "}";
      return str;
    }
  } else {
    return ValueToJSON(element.GetValue());
  }
}

// Private functions for JSON parsing
namespace {
size_t SkipBlankChar(const std::string& str, size_t pos) {
  const std::string blankChar = " \n";
  return str.find_first_not_of(blankChar, pos);
}

/**
 * Adapted from https://github.com/hjiang/jsonxx
 */
std::string DecodeString(const std::string& original) {
  std::string value;
  value.reserve(original.size());
  std::istringstream input("\"" + original + "\"");

  char ch = '\0', delimiter = '"';
  input.get(ch);
  if (ch != delimiter) return "";

  while (!input.eof() && input.good()) {
    input.get(ch);
    if (ch == delimiter) {
      break;
    }
    if (ch == '\\') {
      input.get(ch);
      switch (ch) {
        case '\\':
        case '/':
          value.push_back(ch);
          break;
        case 'b':
          value.push_back('\b');
          break;
        case 'f':
          value.push_back('\f');
          break;
        case 'n':
          value.push_back('\n');
          break;
        case 'r':
          value.push_back('\r');
          break;
        case 't':
          value.push_back('\t');
          break;
        case 'u': {
          int i;
          std::stringstream ss;
          for (i = 0; (!input.eof() && input.good()) && i < 4; ++i) {
            input.get(ch);
            ss << ch;
          }
          if (input.good() && (ss >> i)) value.push_back(i);
        } break;
        default:
          if (ch != delimiter) {
            value.push_back('\\');
            value.push_back(ch);
          } else
            value.push_back(ch);
          break;
      }
    } else {
      value.push_back(ch);
    }
  }
  if (input && ch == delimiter) {
    return value;
  } else {
    return "";
  }
}

/**
 * Return the position of the end of the string. Blank are skipped if necessary
 * @param str The string to be used
 * @param startPos The start position
 * @param strContent A reference to a string that will be filled with the string
 * content.
 */
size_t SkipString(const std::string& str,
                  size_t startPos,
                  std::string& strContent) {
  startPos = SkipBlankChar(str, startPos);
  if (startPos >= str.length()) return std::string::npos;

  size_t endPos = startPos;

  if (str[startPos] == '"') {
    if (startPos + 1 >= str.length()) return std::string::npos;

    while (endPos == startPos || (str[endPos - 1] == '\\')) {
      endPos = str.find_first_of('\"', endPos + 1);
      if (endPos == std::string::npos)
        return std::string::npos;  // Invalid string
    }

    strContent = DecodeString(str.substr(startPos + 1, endPos - 1 - startPos));
    return endPos;
  }

  endPos = str.find_first_of(" \n,:");
  if (endPos >= str.length()) return std::string::npos;  // Invalid string

  strContent = DecodeString(str.substr(startPos, endPos - 1 - startPos));
  return endPos - 1;
}

/**
 * Parse a JSON string, starting from pos, and storing the result into the
 * specified element. Note that the parsing is stopped as soon as a valid object
 * is parsed. \return The position at the end of the valid object stored into
 * the element.
 */
size_t ParseJSONObject(const std::string& jsonStr,
                       size_t startPos,
                       gd::SerializerElement& element) {
  size_t pos = SkipBlankChar(jsonStr, startPos);
  if (pos >= jsonStr.length()) return std::string::npos;

  if (jsonStr[pos] == '{')  // Object
  {
    bool firstChild = true;
    while (firstChild || jsonStr[pos] == ',') {
      pos++;
      if (pos < jsonStr.length() && jsonStr[pos] == '}') break;

      std::string childName;
      pos = SkipString(jsonStr, pos, childName);

      pos++;
      pos = SkipBlankChar(jsonStr, pos);
      if (pos >= jsonStr.length() || jsonStr[pos] != ':')
        return std::string::npos;

      pos++;
      pos = ParseJSONObject(
          jsonStr,
          pos,
          element.AddChild(gd::String::FromUTF8(childName).ReplaceInvalid()));

      pos = SkipBlankChar(jsonStr, pos);
      if (pos >= jsonStr.length()) return std::string::npos;
      firstChild = false;
    }

    if (jsonStr[pos] != '}') {
      std::cout << "Parsing error: Object not properly formed.";
      return std::string::npos;
    }
    return pos + 1;
  } else if (jsonStr[pos] == '[')  // Array
  {
    element.ConsiderAsArray();
    unsigned int index = 0;
    while (index == 0 || jsonStr[pos] == ',') {
      pos++;
      if (pos < jsonStr.length() && jsonStr[pos] == ']') break;
      pos = ParseJSONObject(jsonStr, pos, element.AddChild(""));

      pos = SkipBlankChar(jsonStr, pos);
      if (pos >= jsonStr.length()) {
        std::cout << "Parsing error: element of array not properly formed.";
        return std::string::npos;
      }
      index++;
    }

    if (jsonStr[pos] != ']') {
      std::cout << "Parsing error: array not properly ended";
      return std::string::npos;
    }
    return pos + 1;
  } else if (jsonStr[pos] == '"')  // String
  {
    std::string str;
    pos = SkipString(jsonStr, pos, str);
    if (pos >= jsonStr.length()) {
      std::cout << "Parsing error: Invalid string";
      return std::string::npos;
    }

    element.SetValue(gd::String::FromUTF8(str).ReplaceInvalid());
    return pos + 1;
  } else  // Number or boolean
  {
    std::string str;
    size_t endPos = pos;
    const std::string separators = " \n,}]";
    while (endPos < jsonStr.length() &&
           separators.find_first_of(jsonStr[endPos]) == std::string::npos) {
      endPos++;
    }

    str = jsonStr.substr(pos, endPos - pos);
    if (str == "true")
      element.SetValue(true);
    else if (str == "false")
      element.SetValue(false);
    else
      element.SetValue(gd::String::FromUTF8(str).To<double>());
    return endPos;
  }
}
}  // namespace

SerializerElement Serializer::FromJSON(const std::string& jsonStr) {
  SerializerElement element;
  if (!jsonStr.empty()) gd::ParseJSONObject(jsonStr, 0, element);
  return element;
}

}  // namespace gd
