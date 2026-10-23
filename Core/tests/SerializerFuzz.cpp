/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Randomized tests of gd::SerializerElement and gd::Serializer::ToJSON.
 *
 * The children of an element are found from their index without iterating on
 * them, and ToJSON writes the JSON without building a rapidjson::Document.
 * These tests compare the results with:
 * - a search on all the children returned by GetAllChildren,
 * - the JSON written by a rapidjson::Document built from the element.
 *
 * A search that does not find a child, or that uses another name than the one
 * of an array, logs an error. Logging a gd::String is slow (especially with a
 * UTF-8 locale and sanitizers), so these searches are checked a limited number
 * of times.
 */
#include <iostream>
#include <limits>
#include <map>
#include <random>
#include <sstream>
#include <vector>

#include "GDCore/Serialization/BinarySerializer.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Serialization/rapidjson/document.h"
#include "GDCore/Serialization/rapidjson/stringbuffer.h"
#include "GDCore/Serialization/rapidjson/writer.h"
#include "catch.hpp"

using namespace gd;

namespace {

/**
 * Silence std::cout while it exists: the searches that don't find a child are
 * expected and each of them logs an error.
 */
class SilencedStandardOutput {
 public:
  SilencedStandardOutput()
      : previousBuffer(std::cout.rdbuf(nullStream.rdbuf())) {}
  ~SilencedStandardOutput() { std::cout.rdbuf(previousBuffer); }

 private:
  std::ostringstream nullStream;
  std::streambuf* previousBuffer;
};

const std::vector<gd::String> childNames = {
    "", "a", "b", "item", "oldItem", "\xC3\xA9t\xC3\xA9"};

const gd::String& PickName(std::mt19937& random) {
  return childNames[std::uniform_int_distribution<std::size_t>(
      0, childNames.size() - 1)(random)];
}

std::size_t PickIndex(std::mt19937& random, std::size_t max) {
  return std::uniform_int_distribution<std::size_t>(0, max)(random);
}

bool IsMatchingName(const SerializerElement& element,
                    const gd::String& childName,
                    const gd::String& name,
                    const gd::String& deprecatedName) {
  return childName == name ||
         (element.ConsideredAsArray() && childName.empty()) ||
         (!deprecatedName.empty() && childName == deprecatedName);
}

/**
 * The child that GetChild(name, index, deprecatedName) should return, found
 * by iterating on all the children (nullptr if there is none).
 */
const SerializerElement* SearchChild(const SerializerElement& element,
                                     gd::String name,
                                     std::size_t index,
                                     const gd::String& deprecatedName) {
  if (element.ConsideredAsArray()) name = element.ConsideredAsArrayOf();

  std::size_t currentIndex = 0;
  for (const auto& child : element.GetAllChildren()) {
    if (!IsMatchingName(element, child.first, name, deprecatedName)) continue;
    if (currentIndex == index) return child.second.get();
    currentIndex++;
  }
  return nullptr;
}

std::size_t CountChildren(const SerializerElement& element,
                          const gd::String& name,
                          const gd::String& deprecatedName) {
  std::size_t count = 0;
  for (const auto& child : element.GetAllChildren()) {
    if (IsMatchingName(element, child.first, name, deprecatedName)) count++;
  }
  return count;
}

bool SearchHasChild(const SerializerElement& element,
                    const gd::String& name,
                    const gd::String& deprecatedName) {
  for (const auto& child : element.GetAllChildren()) {
    if (child.first == name ||
        (!deprecatedName.empty() && child.first == deprecatedName))
      return true;
  }
  return false;
}

/**
 * Check that two pointers are the same, without making an assertion for each
 * of the (millions of) successful checks, which would be slow.
 */
#define REQUIRE_SAME_CHILD(actual, expected)                                 \
  do {                                                                       \
    const SerializerElement* actualChild = (actual);                         \
    const SerializerElement* expectedChild = (expected);                     \
    if (actualChild != expectedChild) REQUIRE(actualChild == expectedChild); \
  } while (false)

const SerializerElement* GetNullElement() {
  static const SerializerElement* nullElement = [] {
    static SerializerElement notAnArray;
    SilencedStandardOutput silencedStandardOutput;
    return &notAnArray.GetChild(std::size_t(0));
  }();
  return nullElement;
}

/**
 * The name of a child to add: usually the name of the array (other names are
 * renamed, logging a warning).
 */
const gd::String& PickChildNameToAdd(const SerializerElement& element,
                                     std::mt19937& random) {
  if (element.ConsideredAsArray() && PickIndex(random, 9) != 0)
    return element.ConsideredAsArrayOf();
  return PickName(random);
}

/**
 * Check the searches done with a name, which don't depend on the deprecated
 * name of the array (not readable from outside the element). The searches not
 * finding a child or using another name than the one of the array (which log
 * an error) are only checked if `checkLoggedSearches` is true.
 */
void CheckSearchesByName(const SerializerElement& element,
                         std::mt19937& random,
                         bool checkLoggedSearches) {
  const SerializerElement* nullElement = GetNullElement();
  for (const auto& name : childNames) {
    const gd::String& deprecatedName = PickName(random);
    INFO("Searching \"" << name.Raw() << "\" (deprecated name: \""
                        << deprecatedName.Raw() << "\", array: "
                        << element.ConsideredAsArray() << ", array of: \""
                        << element.ConsideredAsArrayOf().Raw()
                        << "\", children: " << element.GetAllChildren().size()
                        << ")");
    if (element.HasChild(name, deprecatedName) !=
        SearchHasChild(element, name, deprecatedName)) {
      REQUIRE(element.HasChild(name, deprecatedName) ==
              SearchHasChild(element, name, deprecatedName));
    }
    if (!name.empty() && element.GetChildrenCount(name, deprecatedName) !=
                             CountChildren(element, name, deprecatedName)) {
      REQUIRE(element.GetChildrenCount(name, deprecatedName) ==
              CountChildren(element, name, deprecatedName));
    }

    // An array searches its children with the name of the array, logging a
    // warning for another name.
    if (element.ConsideredAsArray() && name != element.ConsideredAsArrayOf() &&
        !checkLoggedSearches)
      continue;

    // Access the children in order, then in a random order, then the index
    // after the last child (not found).
    std::size_t childrenCount = 0;
    while (SearchChild(element, name, childrenCount, deprecatedName))
      childrenCount++;
    for (std::size_t index = 0; index < childrenCount; ++index) {
      REQUIRE_SAME_CHILD(&element.GetChild(name, index, deprecatedName),
                         SearchChild(element, name, index, deprecatedName));
    }
    for (std::size_t i = 0; i < childrenCount; ++i) {
      std::size_t index = PickIndex(random, childrenCount - 1);
      REQUIRE_SAME_CHILD(&element.GetChild(name, index, deprecatedName),
                         SearchChild(element, name, index, deprecatedName));
    }
    if (checkLoggedSearches) {
      REQUIRE_SAME_CHILD(&element.GetChild(name, childrenCount, deprecatedName),
                         nullElement);
    }
  }
}

/**
 * Check the searches done from the index only, knowing the deprecated name of
 * the children of the array. The searches not finding a child (which log an
 * error) are only checked if `checkLoggedSearches` is true.
 */
void CheckSearchesByIndex(const SerializerElement& element,
                          const gd::String& deprecatedArrayOf,
                          std::mt19937& random,
                          bool checkLoggedSearches) {
  const SerializerElement* nullElement = GetNullElement();
  if (!element.ConsideredAsArray()) {
    if (checkLoggedSearches) {
      REQUIRE(element.GetChildrenCount() == 0);
      REQUIRE(&element.GetChild(std::size_t(0)) == nullElement);
    }
    return;
  }

  const gd::String& arrayOf = element.ConsideredAsArrayOf();
  std::size_t childrenCount =
      CountChildren(element, arrayOf, deprecatedArrayOf);
  REQUIRE(element.GetChildrenCount() == childrenCount);
  for (std::size_t i = 0; i < 2 * childrenCount; ++i) {
    std::size_t index =
        i < childrenCount ? i : PickIndex(random, childrenCount - 1);
    REQUIRE_SAME_CHILD(&element.GetChild(index),
                       SearchChild(element, arrayOf, index, deprecatedArrayOf));
  }
  if (checkLoggedSearches)
    REQUIRE_SAME_CHILD(&element.GetChild(childrenCount), nullElement);
}

void CheckSearchesByNameRecursively(const SerializerElement& element,
                                    std::mt19937& random) {
  CheckSearchesByName(element, random, false);
  for (const auto& child : element.GetAllChildren())
    CheckSearchesByNameRecursively(*child.second, random);
}

/**
 * Build the JSON of an element with a rapidjson::Document, like
 * gd::Serializer::ToJSON was doing before writing it without the Document.
 */
void ElementToDocumentValue(const SerializerElement& element,
                            rapidjson::Value& value,
                            rapidjson::Document::AllocatorType& allocator) {
  if (!element.IsValueUndefined()) {
    const SerializerValue& serializerValue = element.GetValue();
    if (serializerValue.IsBoolean())
      value.SetBool(serializerValue.GetBool());
    else if (serializerValue.IsDouble())
      value.SetDouble(serializerValue.GetDouble());
    else if (serializerValue.IsInt())
      value.SetInt(serializerValue.GetInt());
    else if (serializerValue.IsString())
      value.SetString(serializerValue.GetRawString().c_str(), allocator);
    return;
  }

  if (element.ConsideredAsArray()) {
    value.SetArray();
    for (const auto& child : element.GetAllChildren()) {
      rapidjson::Value childValue;
      ElementToDocumentValue(*child.second, childValue, allocator);
      value.PushBack(childValue, allocator);
    }
    return;
  }

  value.SetObject();
  std::multimap<gd::String,
                std::pair<const SerializerValue*, const SerializerElement*>>
      sortedEntries;
  std::vector<std::pair<gd::String, rapidjson::Value>> members;
  for (const auto& attribute : element.GetAllAttributes()) {
    if (gd::Serializer::IsCanonicalMode()) {
      sortedEntries.emplace(attribute.first,
                            std::make_pair(&attribute.second, nullptr));
    } else {
      rapidjson::Value childValue;
      ElementToDocumentValue(
          SerializerElement(attribute.second), childValue, allocator);
      members.emplace_back(attribute.first, std::move(childValue));
    }
  }
  for (const auto& child : element.GetAllChildren()) {
    if (gd::Serializer::IsCanonicalMode()) {
      sortedEntries.emplace(child.first,
                            std::make_pair(nullptr, child.second.get()));
    } else {
      rapidjson::Value childValue;
      ElementToDocumentValue(*child.second, childValue, allocator);
      members.emplace_back(child.first, std::move(childValue));
    }
  }
  for (const auto& entry : sortedEntries) {
    rapidjson::Value childValue;
    if (entry.second.first)
      ElementToDocumentValue(
          SerializerElement(*entry.second.first), childValue, allocator);
    else
      ElementToDocumentValue(*entry.second.second, childValue, allocator);
    members.emplace_back(entry.first, std::move(childValue));
  }
  for (auto& member : members) {
    rapidjson::Value name(member.first.c_str(), allocator);
    value.AddMember(name, member.second, allocator);
  }
}

/**
 * Compare two JSON, showing where they differ if they do (they can be long).
 */
void RequireSameJSON(const gd::String& json, const gd::String& expectedJson) {
  const std::string& raw = json.Raw();
  const std::string& expectedRaw = expectedJson.Raw();
  std::size_t position = 0;
  while (position < raw.size() && position < expectedRaw.size() &&
         raw[position] == expectedRaw[position])
    position++;
  std::size_t contextStart = position < 80 ? 0 : position - 80;
  INFO("First difference at byte " << position << ":\n"
                                   << raw.substr(contextStart, 160) << "\n"
                                   << expectedRaw.substr(contextStart, 160));
  REQUIRE(raw == expectedRaw);
}

gd::String ToJSONWithDocument(const SerializerElement& element) {
  rapidjson::Document document;
  ElementToDocumentValue(element, document, document.GetAllocator());
  rapidjson::StringBuffer buffer;
  rapidjson::Writer<rapidjson::StringBuffer> writer(buffer);
  document.Accept(writer);
  return buffer.GetString();
}

const std::vector<gd::String> stringValues = {
    "",
    "text",
    "with \"quotes\" and \\backslashes\\ and /slashes/",
    "control characters: \x01\x02\t\n\r\x1F",
    "\xC3\xA9t\xC3\xA9 \xE6\x97\xA5\xE6\x9C\xAC \xF0\x9F\x8E\xAE",
    "true",
    "123",
    "line 1\nline 2\nline 3",
};

/**
 * Return a random double. Unless `anyPrecision` is true, it has at most 15
 * significant digits: rapidjson parses (by default) the doubles written with
 * more digits to a slightly different double.
 */
double PickDouble(std::mt19937& random, double max, bool anyPrecision) {
  if (anyPrecision)
    return std::uniform_real_distribution<double>(-max, max)(random);

  const int maxIn64ths = static_cast<int>(max * 64);
  return std::uniform_int_distribution<int>(-maxIn64ths, maxIn64ths)(random) /
         64.0;
}

/**
 * Set a random value. Unless `valuesChangedByJSON` is true, the value is the
 * same after being written to JSON and read back.
 */
void SetRandomValue(SerializerElement& element,
                    std::mt19937& random,
                    bool valuesChangedByJSON) {
  switch (PickIndex(random, valuesChangedByJSON ? 13 : 11)) {
    case 0:
      element.SetBoolValue(true);
      break;
    case 1:
      element.SetBoolValue(false);
      break;
    case 2:
      element.SetIntValue(std::numeric_limits<int>::min());
      break;
    case 3:
      element.SetIntValue(std::numeric_limits<int>::max());
      break;
    case 4:
      element.SetIntValue(
          std::uniform_int_distribution<int>(-1000, 1000)(random));
      break;
    case 5:
      element.SetDoubleValue(PickDouble(random, 1e6, valuesChangedByJSON));
      break;
    case 6:
      element.SetDoubleValue(-0.0);
      break;
    case 7:
      element.SetDoubleValue(1e300);
      break;
    case 8:
      element.SetDoubleValue(std::numeric_limits<double>::denorm_min());
      break;
    case 9:
      element.SetDoubleValue(3.0);
      break;
    case 10:
    case 11:
      element.SetStringValue(
          stringValues[PickIndex(random, stringValues.size() - 1)]);
      break;
    case 12:
      element.SetDoubleValue(std::numeric_limits<double>::quiet_NaN());
      break;
    default:
      element.SetDoubleValue(std::numeric_limits<double>::infinity());
      break;
  }
}

void SetRandomAttribute(SerializerElement& element,
                        std::mt19937& random,
                        bool valuesChangedByJSON) {
  const gd::String& name = PickName(random);
  switch (PickIndex(random, 3)) {
    case 0:
      element.SetAttribute(name, PickIndex(random, 1) == 0);
      break;
    case 1:
      element.SetAttribute(
          name, std::uniform_int_distribution<int>(-1000, 1000)(random));
      break;
    case 2:
      element.SetAttribute(name, PickDouble(random, 1e3, valuesChangedByJSON));
      break;
    default:
      element.SetAttribute(
          name, stringValues[PickIndex(random, stringValues.size() - 1)]);
      break;
  }
}

void FillRandomly(SerializerElement& element,
                  std::mt19937& random,
                  std::size_t depth,
                  bool valuesChangedByJSON) {
  std::size_t kind = PickIndex(random, depth == 0 ? 0 : 3);
  if (kind == 0) {
    SetRandomValue(element, random, valuesChangedByJSON);
    return;
  }

  if (kind == 1) element.ConsiderAsArrayOf(PickName(random));
  std::size_t childrenCount = PickIndex(random, 6);
  for (std::size_t i = 0; i < childrenCount; ++i) {
    // AddChild returns the existing child of an object having this name:
    // don't fill it again (adding a child to an element having an attribute
    // with the same name would write the name twice in the JSON).
    const gd::String& name = PickChildNameToAdd(element, random);
    if (!element.ConsideredAsArray() && element.HasChild(name)) continue;

    FillRandomly(
        element.AddChild(name), random, depth - 1, valuesChangedByJSON);
  }
  // Set after the children: setting an attribute removes the child having
  // the same name (otherwise, the JSON would have the name twice).
  std::size_t attributesCount = PickIndex(random, 3);
  for (std::size_t i = 0; i < attributesCount; ++i)
    SetRandomAttribute(element, random, valuesChangedByJSON);
}

}  // namespace

TEST_CASE("SerializerElement (randomized)", "[common]") {
  SECTION("Searches of children after random changes") {
    for (unsigned int seed = 1; seed <= 120; ++seed) {
      INFO("Seed: " << seed);
      std::mt19937 random(seed);
      SilencedStandardOutput silencedStandardOutput;

      SerializerElement element;
      gd::String deprecatedArrayOf;
      std::vector<SerializerElement> otherElements(3);
      std::vector<gd::String> otherElementsDeprecatedArrayOf(3);

      const std::size_t stepsCount = 60;
      for (std::size_t step = 0; step < stepsCount; ++step) {
        INFO("Step: " << step);
        std::size_t otherIndex = PickIndex(random, otherElements.size() - 1);
        switch (PickIndex(random, 13)) {
          case 0:
          case 1:
          case 2:
          case 3:
            element.AddChild(PickChildNameToAdd(element, random))
                .SetIntValue(static_cast<int>(step));
            break;
          case 4:
            element.RemoveChild(PickName(random));
            break;
          case 5:
            SetRandomAttribute(element, random, true);
            break;
          case 6:
            if (PickIndex(random, 3) == 0) element.Clear();
            break;
          case 7:
            deprecatedArrayOf = PickName(random);
            element.ConsiderAsArrayOf(PickName(random), deprecatedArrayOf);
            break;
          case 8:
            element = otherElements[otherIndex];
            deprecatedArrayOf = otherElementsDeprecatedArrayOf[otherIndex];
            break;
          case 9:
            otherElements[otherIndex] = element;
            otherElementsDeprecatedArrayOf[otherIndex] = deprecatedArrayOf;
            break;
          case 10:
            otherElements[otherIndex].AddChild(
                PickChildNameToAdd(otherElements[otherIndex], random));
            if (PickIndex(random, 3) == 0) {
              otherElementsDeprecatedArrayOf[otherIndex] = PickName(random);
              otherElements[otherIndex].ConsiderAsArrayOf(
                  PickName(random), otherElementsDeprecatedArrayOf[otherIndex]);
            }
            break;
          case 11:
            // The copy doubles the size of the element: keep it small.
            if (!element.GetAllChildren().empty() &&
                gd::Serializer::ToJSON(element).size() < 2000) {
              // Copy the element into one of its children.
              const gd::String& name =
                  element
                      .GetAllChildren()[PickIndex(
                          random, element.GetAllChildren().size() - 1)]
                      .first;
              SerializerElement& child = element.GetChild(name);
              if (&child != GetNullElement()) child = element;
            }
            break;
          case 12:
            if (PickIndex(random, 1) == 0) {
              element.SetMultilineStringValue("single line");
            } else {
              // Stored as an array of the lines.
              element.SetMultilineStringValue("a\nb\n\nc");
              deprecatedArrayOf = "";
            }
            break;
          default:
            FillRandomly(element.AddChild(PickChildNameToAdd(element, random)),
                         random,
                         3,
                         false);
            break;
        }

        // Check the searches logging an error only for some of the steps.
        bool checkLoggedSearches = seed <= 40 && step % 20 == 0;
        CheckSearchesByName(element, random, checkLoggedSearches);
        CheckSearchesByIndex(
            element, deprecatedArrayOf, random, checkLoggedSearches);
        CheckSearchesByName(otherElements[otherIndex], random, false);
        CheckSearchesByIndex(otherElements[otherIndex],
                             otherElementsDeprecatedArrayOf[otherIndex],
                             random,
                             false);
      }
      CheckSearchesByNameRecursively(element, random);
    }
  }

  SECTION("Copies of random elements") {
    for (unsigned int seed = 1; seed <= 100; ++seed) {
      INFO("Seed: " << seed);
      std::mt19937 random(seed);
      SilencedStandardOutput silencedStandardOutput;

      SerializerElement element;
      FillRandomly(element, random, 5, false);
      SerializerElement copy(element);
      SerializerElement assigned;
      assigned.AddChild("existing child");
      assigned.SetAttribute("existing attribute", 1);
      assigned = element;

      gd::String json = gd::Serializer::ToJSON(element);
      REQUIRE(gd::Serializer::ToJSON(copy) == json);
      REQUIRE(gd::Serializer::ToJSON(assigned) == json);
      CheckSearchesByNameRecursively(copy, random);
      CheckSearchesByNameRecursively(assigned, random);
    }
  }
}

TEST_CASE("Serializer (randomized)", "[common]") {
  SECTION("ToJSON writes the same JSON as a rapidjson::Document") {
    for (unsigned int seed = 1; seed <= 200; ++seed) {
      INFO("Seed: " << seed);
      std::mt19937 random(seed);
      SerializerElement element;
      FillRandomly(element, random, 6, true);

      for (bool canonical : {false, true}) {
        gd::Serializer::SetCanonicalMode(canonical);
        gd::String json = gd::Serializer::ToJSON(element);
        gd::String expectedJson = ToJSONWithDocument(element);
        gd::Serializer::SetCanonicalMode(false);
        INFO("Canonical: " << canonical);
        RequireSameJSON(json, expectedJson);
      }
    }
  }

  SECTION("JSON and binary round trips") {
    for (unsigned int seed = 1; seed <= 200; ++seed) {
      INFO("Seed: " << seed);
      std::mt19937 random(seed);
      SerializerElement element;
      FillRandomly(element, random, 6, false);

      gd::String json = gd::Serializer::ToJSON(element);
      SerializerElement elementFromJson = gd::Serializer::FromJSON(json);
      INFO("Read from JSON");
      RequireSameJSON(gd::Serializer::ToJSON(elementFromJson), json);

      std::vector<uint8_t> buffer;
      gd::BinarySerializer::SerializeToBinaryBuffer(element, buffer);
      SerializerElement elementFromBinary;
      REQUIRE(gd::BinarySerializer::DeserializeFromBinaryBuffer(
          buffer.data(), buffer.size(), elementFromBinary));
      RequireSameJSON(gd::Serializer::ToJSON(elementFromBinary), json);
    }
  }

  SECTION("Big and deep elements") {
    // Arrays with many children, iterated with indices.
    const int childrenCount = 100000;
    SerializerElement array;
    array.ConsiderAsArrayOf("item");
    for (int i = 0; i < childrenCount; ++i)
      array.AddChild("item").SetIntValue(i);
    REQUIRE(array.GetChildrenCount() ==
            static_cast<std::size_t>(childrenCount));
    for (int i = 0; i < childrenCount; ++i) {
      if (array.GetChild(i).GetIntValue() != i)
        REQUIRE(array.GetChild(i).GetIntValue() == i);
    }

    // Children are renamed when added to an array: change the name of the
    // array to have children with different names.
    SerializerElement mixedArray;
    const std::vector<gd::String> names = {"item", "oldItem", ""};
    for (int i = 0; i < childrenCount; ++i) {
      const gd::String& name = names[i % names.size()];
      mixedArray.ConsiderAsArrayOf(name);
      mixedArray.AddChild(name).SetIntValue(i);
    }
    mixedArray.ConsiderAsArrayOf("other");
    mixedArray.AddChild("other").SetIntValue(-1);
    mixedArray.ConsiderAsArrayOf("item", "oldItem");
    REQUIRE(mixedArray.GetChildrenCount() ==
            static_cast<std::size_t>(childrenCount));
    for (int i = 0; i < childrenCount; ++i) {
      if (mixedArray.GetChild(i).GetIntValue() != i)
        REQUIRE(mixedArray.GetChild(i).GetIntValue() == i);
    }
    std::mt19937 random(1);
    for (int i = 0; i < 100; ++i) {
      std::size_t index = PickIndex(random, childrenCount - 1);
      REQUIRE_SAME_CHILD(&mixedArray.GetChild("item", index, "oldItem"),
                         SearchChild(mixedArray, "item", index, "oldItem"));
    }
    REQUIRE(gd::Serializer::ToJSON(mixedArray) ==
            ToJSONWithDocument(mixedArray));

    // Duplicated names in a JSON object: the last value is kept, at the
    // position of the first one.
    SerializerElement elementWithDuplicatedNames =
        gd::Serializer::FromJSON("{\"a\":1,\"b\":2,\"a\":3}");
    REQUIRE(gd::Serializer::ToJSON(elementWithDuplicatedNames) ==
            "{\"a\":3,\"b\":2}");

    // Deeply nested elements.
    SerializerElement root;
    SerializerElement* current = &root;
    for (std::size_t depth = 0; depth < 500; ++depth) {
      current->SetAttribute("depth", static_cast<int>(depth));
      current = &current->AddChild("child");
    }
    current->SetStringValue("leaf");
    REQUIRE(gd::Serializer::ToJSON(root) == ToJSONWithDocument(root));
    SerializerElement rootCopy = root;
    REQUIRE(gd::Serializer::ToJSON(rootCopy) == gd::Serializer::ToJSON(root));
  }
}
