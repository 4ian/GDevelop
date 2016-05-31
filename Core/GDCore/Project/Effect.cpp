/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/Project/Effect.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/CommonTools.h"

namespace gd
{

#if defined(GD_IDE_ONLY)
void Effect::SerializeTo(SerializerElement & element) const
{
    element.SetAttribute("name", GetName());
    element.SetAttribute("effectName", GetEffectName());
    SerializerElement & parametersElement = element.AddChild("parameters");
    for (auto & parameter : parameters)
        parametersElement.AddChild(parameter.first).SetValue(parameter.second);
}
#endif

/**
 * \brief Unserialize the layer.
 */
void Effect::UnserializeFrom(const SerializerElement & element)
{
    SetName(element.GetStringAttribute("name"));
    SetEffectName(element.GetStringAttribute("effectName"));

    parameters.clear();
    const SerializerElement & parametersElement = element.GetChild("parameters");
    for (auto & child : parametersElement.GetAllChildren())
        SetParameter(child.first, child.second->GetValue().GetDouble());
}

}
