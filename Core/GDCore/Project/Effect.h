/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCORE_EFFECT_H
#define GDCORE_EFFECT_H
namespace gd { class SerializerElement; }
#include "GDCore/String.h"

namespace gd
{

/**
 * \brief Represents an effect that can be applied on a layer.
 *
 * \see gd::Layer
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Effect
{
public:
    Effect() {};
    virtual ~Effect() {};

    void SetName(const gd::String & name_) { name = name_; }
    const gd::String & GetName() const { return name; }

    void SetEffectName(const gd::String & effectName_) { effectName = effectName_; }
    const gd::String & GetEffectName() const { return effectName; }

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Serialize layer.
     */
    void SerializeTo(SerializerElement & element) const;
    #endif

    /**
     * \brief Unserialize the layer.
     */
    void UnserializeFrom(const SerializerElement & element);

private:
    gd::String name; ///< The name of the layer
    gd::String effectName; ///< The name of the effect to apply
};

}
#endif
