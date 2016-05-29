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
}
#endif

/**
 * \brief Unserialize the layer.
 */
void Effect::UnserializeFrom(const SerializerElement & element)
{
    SetName(element.GetStringAttribute("name"));
    SetEffectName(element.GetStringAttribute("effectName"));
}

}
