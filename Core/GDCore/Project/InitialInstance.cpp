/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Project/InitialInstance.h"

#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/UUID/UUID.h"
#include "GDCore/Project/PropertyDescriptor.h"

namespace gd {

gd::String* InitialInstance::badStringProperyValue = NULL;

InitialInstance::InitialInstance()
    : objectName(""),
      x(0),
      y(0),
      angle(0),
      zOrder(0),
      layer(""),
      personalizedSize(false),
      width(0),
      height(0),
      locked(false),
      sealed(false),
      persistentUuid(UUID::MakeUuid4()) {}

void InitialInstance::UnserializeFrom(const SerializerElement& element) {
  SetObjectName(element.GetStringAttribute("name", "", "nom"));
  SetX(element.GetDoubleAttribute("x"));
  SetY(element.GetDoubleAttribute("y"));
  SetAngle(element.GetDoubleAttribute("angle"));
  SetHasCustomSize(
      element.GetBoolAttribute("customSize", false, "personalizedSize"));
  SetCustomWidth(element.GetDoubleAttribute("width"));
  SetCustomHeight(element.GetDoubleAttribute("height"));
  SetZOrder(element.GetIntAttribute("zOrder", 0, "plan"));
  SetLayer(element.GetStringAttribute("layer"));
  SetLocked(element.GetBoolAttribute("locked", false));
  SetSealed(element.GetBoolAttribute("sealed", false));

  persistentUuid = element.GetStringAttribute("persistentUuid");
  if (persistentUuid.empty()) ResetPersistentUuid();

  numberProperties.clear();
  const SerializerElement& numberPropertiesElement =
      element.GetChild("numberProperties", 0, "floatInfos");
  numberPropertiesElement.ConsiderAsArrayOf("property", "Info");
  for (std::size_t j = 0; j < numberPropertiesElement.GetChildrenCount(); ++j) {
    gd::String name = numberPropertiesElement.GetChild(j).GetStringAttribute("name");
    double value = numberPropertiesElement.GetChild(j).GetDoubleAttribute("value");
    numberProperties[name] = value;
  }

  stringProperties.clear();
  const SerializerElement& stringPropElement =
      element.GetChild("stringProperties", 0, "stringInfos");
  stringPropElement.ConsiderAsArrayOf("property", "Info");
  for (std::size_t j = 0; j < stringPropElement.GetChildrenCount(); ++j) {
    gd::String name = stringPropElement.GetChild(j).GetStringAttribute("name");
    gd::String value =
        stringPropElement.GetChild(j).GetStringAttribute("value");
    stringProperties[name] = value;
  }

  GetVariables().UnserializeFrom(
      element.GetChild("initialVariables", 0, "InitialVariables"));
}

void InitialInstance::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", GetObjectName());
  element.SetAttribute("x", GetX());
  element.SetAttribute("y", GetY());
  element.SetAttribute("zOrder", GetZOrder());
  element.SetAttribute("layer", GetLayer());
  element.SetAttribute("angle", GetAngle());
  element.SetAttribute("customSize", HasCustomSize());
  element.SetAttribute("width", GetCustomWidth());
  element.SetAttribute("height", GetCustomHeight());
  if (IsLocked()) element.SetAttribute("locked", IsLocked());
  if (IsSealed()) element.SetAttribute("sealed", IsSealed());

  if (persistentUuid.empty()) persistentUuid = UUID::MakeUuid4();
  element.SetStringAttribute("persistentUuid", persistentUuid);

  SerializerElement& numberPropertiesElement = element.AddChild("numberProperties");
  numberPropertiesElement.ConsiderAsArrayOf("property");
  for (const auto& property: numberProperties) {
    numberPropertiesElement.AddChild("property")
        .SetAttribute("name", property.first)
        .SetAttribute("value", property.second);
  }

  SerializerElement& stringPropElement = element.AddChild("stringProperties");
  stringPropElement.ConsiderAsArrayOf("property");
  for (const auto& property: stringProperties) {
    stringPropElement.AddChild("property")
        .SetAttribute("name", property.first)
        .SetAttribute("value", property.second);
  }

  GetVariables().SerializeTo(element.AddChild("initialVariables"));
}

InitialInstance& InitialInstance::ResetPersistentUuid() {
  persistentUuid = UUID::MakeUuid4();
  return *this;
}

std::map<gd::String, gd::PropertyDescriptor>
InitialInstance::GetCustomProperties(gd::Project& project, gd::Layout& layout) {
  // Find an object
  if (layout.HasObjectNamed(GetObjectName()))
    return layout.GetObject(GetObjectName()).GetConfiguration()
        .GetInitialInstanceProperties(*this, project, layout);
  else if (project.HasObjectNamed(GetObjectName()))
    return project.GetObject(GetObjectName()).GetConfiguration()
        .GetInitialInstanceProperties(*this, project, layout);

  std::map<gd::String, gd::PropertyDescriptor> nothing;
  return nothing;
}

bool InitialInstance::UpdateCustomProperty(const gd::String& name,
                                           const gd::String& value,
                                           gd::Project& project,
                                           gd::Layout& layout) {
  if (layout.HasObjectNamed(GetObjectName()))
    return layout.GetObject(GetObjectName()).GetConfiguration()
        .UpdateInitialInstanceProperty(*this, name, value, project, layout);
  else if (project.HasObjectNamed(GetObjectName()))
    return project.GetObject(GetObjectName()).GetConfiguration()
        .UpdateInitialInstanceProperty(*this, name, value, project, layout);

  return false;
}

double InitialInstance::GetRawDoubleProperty(const gd::String& name) const {
  const auto& it = numberProperties.find(name);
  return it != numberProperties.end() ? it->second : 0;
}

const gd::String& InitialInstance::GetRawStringProperty(
    const gd::String& name) const {
  if (!badStringProperyValue) badStringProperyValue = new gd::String("");

  const auto& it = stringProperties.find(name);
  return it != stringProperties.end() ? it->second : *badStringProperyValue;
}

void InitialInstance::SetRawDoubleProperty(const gd::String& name, double value) {
  numberProperties[name] = value;
}

void InitialInstance::SetRawStringProperty(const gd::String& name,
                                           const gd::String& value) {
  stringProperties[name] = value;
}

}  // namespace gd
