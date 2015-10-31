/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_SPRITEOBJECT_H
#define GDCORE_SPRITEOBJECT_H
#include "GDCore/Project/Object.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Animation.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Direction.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Sprite.h"
namespace gd { class InitialInstance; }
namespace gd { class Object; }
namespace gd { class Layout; }
namespace gd { class Sprite; }
namespace gd { class Animation; }
namespace gd { class MainFrameWrapper; }
namespace gd { class SerializerElement; }
namespace gd { class PropertyDescriptor; }
#if defined(GD_IDE_ONLY)
class wxBitmap;
class wxWindow;
#endif

namespace gd
{

/**
 * \brief Standard sprite object for extensions that implements the standard SpriteExtension
 * (see gd::BuiltinExtensionsImplementer::ImplementsSpriteExtension).
 *
 * A Sprite object is an object composed of animations, containing directions with images.
 *
 * \see Animation
 * \see Direction
 * \see Sprite
 * \see gd::BuiltinExtensionsImplementer::ImplementsSpriteExtension
 * \ingroup SpriteObjectExtension
 */
class GD_CORE_API SpriteObject : public gd::Object
{
public :

    SpriteObject(gd::String name_);
    virtual ~SpriteObject();
    virtual gd::Object * Clone() const { return new SpriteObject(*this);}

    #if defined(GD_IDE_ONLY)
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const;
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);

    virtual std::map<gd::String, gd::PropertyDescriptor> GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & project, gd::Layout & scene);
    virtual bool UpdateInitialInstanceProperty(gd::InitialInstance & position, const gd::String & name, const gd::String & value, gd::Project & project, gd::Layout & scene);
    virtual void EditObject( wxWindow* parent, gd::Project & project, gd::MainFrameWrapper & mainFrameWrapper_ );
    #if !defined(EMSCRIPTEN)
    virtual void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout);
    virtual sf::Vector2f GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const;
    virtual sf::Vector2f GetInitialInstanceOrigin(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const;
    virtual void LoadResources(gd::Project & project, gd::Layout & layout);
    #endif

    virtual bool SupportShaders() { return true; }
    #endif

    /** \name Animations
     * Methods related to animations management
     */
    ///@{
    /**
     * \brief Return the animation at the specified index.
     * If the index is out of bound, a "bad animation" object is returned.
     */
    const Animation & GetAnimation(std::size_t nb) const;

    /**
     * \brief Return the animation at the specified index.
     * If the index is out of bound, a "bad animation" object is returned.
     */
    Animation & GetAnimation(std::size_t nb);

    /**
     * \brief Return the number of animations this object has.
     */
    std::size_t GetAnimationsCount() const { return animations.size(); };

    /**
     * \brief Add an animation at the end of the existing ones.
     */
    void AddAnimation(const Animation & animation);

    /**
     * \brief Remove an animation.
     */
    bool RemoveAnimation(std::size_t nb);

    /**
     * \brief Remove all animations.
     */
    void RemoveAllAnimations() { animations.clear(); }

    /**
     * \brief Return true if the object hasn't any animation.
     */
    bool HasNoAnimations() const { return animations.empty(); }

    /**
     * \brief Swap the position of two sprites
     */
    void SwapAnimations(std::size_t firstIndex, std::size_t secondIndex);

    /**
     * \brief Return a read-only reference to the vector containing all the animation of the object.
     */
    const std::vector < Animation > & GetAllAnimations() const { return animations; }
    ///@}

private:

    virtual void DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element);
    #if defined(GD_IDE_ONLY)
    virtual void DoSerializeTo(gd::SerializerElement & element) const;
    #endif

    const Sprite * GetInitialInstanceSprite(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout, bool * shouldNotRotate = NULL) const;
    mutable std::vector < Animation > animations;

    static Animation badAnimation; //< Bad animation when an out of bound animation is requested.
};

GD_CORE_API gd::Object * CreateSpriteObject(gd::String name);

}
#endif // GDCORE_SPRITEOBJECT_H
