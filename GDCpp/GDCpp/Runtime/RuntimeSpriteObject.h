/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef SPRITEOBJECT_H
#define SPRITEOBJECT_H
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/RuntimeObject.h"
namespace gd { class InitialInstance; }
namespace gd { class Object; }
namespace gd { class Layout; }
namespace sf { class Sprite; }
namespace gd { class Sprite; }
namespace gd { class SpriteObject; }
namespace gd { class Animation; }
namespace gd { class MainFrameWrapper; }
namespace gd { class PropertyDescriptor; }
#if defined(GD_IDE_ONLY)
class wxBitmap;
class wxWindow;
#endif

/**
 * \brief Wrapper around a pointer to Animation, used to reduce compile time.
 *
 * This proxy is used to avoid including Animation.h/Direction.h/Sprite.h and SFML headers.
 */
class GD_API AnimationProxy
{
public:
    AnimationProxy();
    AnimationProxy(const gd::Animation & animation);
    virtual ~AnimationProxy();
    AnimationProxy(const AnimationProxy & proxy);
    AnimationProxy & operator=(const AnimationProxy & rhs);

    gd::Animation & Get() {return *animation; }
    const gd::Animation & Get() const {return *animation; }
    gd::Animation & GetNonConst() const {return *animation; }

private:
    gd::Animation * animation;
};

/**
 * \brief The class to represents objects of type Sprite at runtime.
 */
class GD_API RuntimeSpriteObject : public RuntimeObject
{
public:

    RuntimeSpriteObject(RuntimeScene & scene, const gd::SpriteObject & spriteObject);
    virtual ~RuntimeSpriteObject();
    virtual RuntimeObject * Clone() const { return new RuntimeSpriteObject(*this);}

    virtual bool ExtraInitializationFromInitialInstance(const gd::InitialInstance & position);

    virtual bool Draw(sf::RenderTarget & renderTarget);

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (std::size_t propertyNb, gd::String & name, gd::String & value) const;
    virtual bool ChangeProperty(std::size_t propertyNb, gd::String newValue);
    virtual std::size_t GetNumberOfProperties() const;
    #endif

    virtual void UpdateTime(float timeElapsed);

    virtual void OnPositionChanged() {needUpdateCurrentSprite = true;};

    virtual float GetWidth() const;
    virtual float GetHeight() const;
    virtual void SetWidth(float newWidth);
    virtual void SetHeight(float newHeight);

    virtual float GetDrawableX() const;
    virtual float GetDrawableY() const;

    virtual float GetCenterX() const;
    virtual float GetCenterY() const;

    virtual bool SetAngle(float newAngle);
    virtual float GetAngle() const;

    virtual std::vector<Polygon2d> GetHitBoxes() const;
    virtual bool CursorOnObject(RuntimeScene & scene, bool accurate);

    /**
     * \brief Get the X position of a point of the current sprite, in "world" coordinates.
     */
    float GetPointX(const gd::String & point) const;

    /**
     * \brief Get the Y position of a point of the current sprite, in "world" coordinates.
     */
    float GetPointY(const gd::String & point) const;

    /**
     * \brief Update the SFML sprite according to position, angle and all parameters of the object.
     * \note This is automatically called when needed when calling GetCurrentSFMLSprite, you
     * should probably not have to call this method on your own.
     */
    void UpdateCurrentSprite() const;

    /**
     * \brief Get the SFML sprite used to display the object on the scene.
     */
    const sf::Sprite & GetCurrentSFMLSprite() const;

    /**
     * \brief Get the current gd::Sprite being displayed.
     */
    const gd::Sprite & GetCurrentSprite() const;

    /** \name Current animation
     */
    ///@{
    /**
     * \brief Stop the animation being played.
     */
    void StopAnimation() { animationStopped = true; };

    /**
     * \brief Play the current animation.
     */
    void PlayAnimation() { animationStopped = false; };

    /**
     * \brief Check if the current animation is stopped.
     */
    bool IsAnimationStopped() const { return animationStopped; }

    /**
     * \brief Get the number of animations inside this object.
     */
    std::size_t GetAnimationsCount() const { return animations.size(); };

    /**
     * \brief Get the index of the animation being played.
     */
    inline std::size_t GetCurrentAnimation() const { return currentAnimation; }

    /**
     * \brief Get the name of the animation being played.
     */
    const gd::String & GetCurrentAnimationName() const;

    /**
     * \brief Compare the name of the animation being played.
     * \return true if the animation being played has the specified name.
     */
    bool IsCurrentAnimationName(const gd::String & name) const;

    /**
     * \brief Change the object animation.
     * \param index The index of the new animation
     * \return true if the animation was successfully changed, false otherwise (index out of bound).
     */
    bool SetCurrentAnimation(std::size_t nb);

    /**
     * \brief Change the object animation.
     * \param index The name of the new animation
     * \return true if the animation was successfully changed, false otherwise (animation not found).
     */
    bool SetCurrentAnimation(const gd::String & newAnimationName);

    /**
     * \brief Check if the current animation has reached its end.
     * \note If the animation is looping, this will never be true.
     */
    bool AnimationEnded() const;

    float GetAnimationSpeedScale() const { return animationSpeedScale; }
    void SetAnimationSpeedScale(float ratio) { animationSpeedScale = ratio; }

    /**
     * \brief Change the frame of the animation being displayed.
     * \param index Index of the new frame
     * \return true if the frame was changed, false otherwise (out of bound index).
     */
    bool SetSprite(std::size_t nb);

    /**
     * \brief Return the index of the frame of the animation being displayed.
     */
    inline std::size_t GetSpriteNb() const { return currentSprite; }
    ///@}

    bool SetDirection(float nb);
    inline std::size_t GetCurrentDirection() const { return currentDirection; }

    /**
     * \brief Return the angle or direction, according to the current direction type.
     */
    float GetCurrentDirectionOrAngle() const;

    /** \name Scaling
     */
    ///@{
    /**
     * \brief Change the scale factor of the object on X axis.
     * \param val The new scale. 1 is the default scale.
     */
    void SetScaleX(float val);

    /**
     * \brief Get the scale factor of the object on X axis.
     * \return The scale factor. 1 is the default scale.
     */
    float GetScaleX() const;

    /**
     * \brief Change the scale factor of the object on Y axis.
     * \param val The new scale. 1 is the default scale.
     */
    void SetScaleY(float val);

    /**
     * \brief Get the scale factor of the object on Y axis.
     * \return The scale factor. 1 is the default scale.
     */
    float GetScaleY() const;
    ///@}

    /** \name Effects and color
     */
    ///@{
    /**
     * \brief Set the opacity of the object
     * \param val New value, between 0 (transparent) and 255.
     */
    void SetOpacity(float val);

    /**
     * \biref Get the opacity of the object
     * \return Opacity, between 0 (transparent) and 255.
     */
    inline float GetOpacity() const {return opacity;};

    /**
     * \brief Change overall color of the sprite.
     * \note Default overall color is white.
     */
    void SetColor(unsigned int r,unsigned int v,unsigned int b);

    /**
     * \brief Get red component of the overall color of the sprite.
     */
    unsigned int GetColorR() const;

    /**
     * \brief Get green component of the overall color of the sprite.
     */
    unsigned int GetColorG() const;

    /**
     * \brief Get blue component of the overall color of the sprite.
     */
    unsigned int GetColorB() const;

    /**
     * Only used internally by GD events generated code: Prefer using original SetColor.
     */
    void SetColor(const gd::String & colorStr);

    /**
     * \brief Change the blend mode used to display the sprite.
     */
    inline void SetBlendMode(unsigned int blendMode_) { blendMode = blendMode_; };

    /**
     * \brief Get the identifier of the blend mode used to display the sprite.
     */
    inline unsigned int GetBlendMode() const {return blendMode;};

    void CopyImageOnImageOfCurrentSprite(RuntimeScene & scene, const gd::String & imageName, float xPosition, float yPosition, bool useTransparency);
    void MakeColorTransparent( const gd::String & colorStr );
    ///@}

    /** \name Flipping
     */
    ///@{
    void FlipX(bool flip = true);
    void FlipY(bool flip = true);
    bool IsFlippedX() const { return isFlippedX; };
    bool IsFlippedY() const { return isFlippedY; };
    ///@}

    /**
     * Deprecated and only used internally by GD events generated code: Prefer using RotateTowardPosition.
     * \deprecated See RuntimeSpriteObject::RotateTowardPosition instead.
     */
    void TurnTowardObject(RuntimeObject * object, RuntimeScene & scene);

    /**
     * Only used internally by GD events generated code: Prefer using (Get/Set)Scale(X/Y).
     */
    void ChangeScale(const gd::String & operatorStr, double newValue);

private:

    //Animations, direction and current frame:
    std::size_t currentAnimation;
    std::size_t currentDirection;
    float currentAngle;
    std::size_t currentSprite;
    bool animationStopped;

    float timeElapsedOnCurrentSprite;
    float animationSpeedScale;

    mutable gd::Sprite * ptrToCurrentSprite; //Pointer to the current sprite
    mutable bool needUpdateCurrentSprite;

    std::vector < AnimationProxy > animations;

    float opacity;
    unsigned int blendMode;
    bool isFlippedX;
    bool isFlippedY;

    float scaleX;
    float scaleY;

    //Color filter
    unsigned int colorR;
    unsigned int colorV;
    unsigned int colorB;

    //Null objects if need to return a bad object.
    static gd::Sprite     * badSpriteDatas; ///< Used when no valid sprite can be displayed. Created when the first RuntimeSpriteObject is created
    static gd::Animation    badAnimation;
};

#endif // SPRITEOBJECT_H
