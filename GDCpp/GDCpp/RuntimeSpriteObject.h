/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SPRITEOBJECT_H
#define SPRITEOBJECT_H
#include "GDCpp/Object.h"
#include "GDCpp/RuntimeObject.h"
namespace gd { class InitialInstance; }
namespace gd { class Object; }
namespace gd { class Layout; }
namespace sf { class Sprite; }
namespace gd { class Sprite; }
namespace gd { class Animation; }
namespace gd { class MainFrameWrapper; }
namespace gd { class PropertyDescriptor; }
#if defined(GD_IDE_ONLY)
class wxBitmap;
class wxWindow;
#endif

/**
 * \brief Wrapper around a pointer to Animation. Used to reduce compile time.
 * Animation proxy is used to avoid including Animation.h/Direction.h/Sprite.h and SFML headers
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
public :

    RuntimeSpriteObject(RuntimeScene & scene, const gd::Object & object);
    virtual ~RuntimeSpriteObject();
    virtual RuntimeObject * Clone() const { return new RuntimeSpriteObject(*this);}

    virtual bool ExtraInitializationFromInitialInstance(const gd::InitialInstance & position);

    virtual bool Draw(sf::RenderTarget & renderTarget);

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;
    virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);
    virtual unsigned int GetNumberOfProperties() const;
    #endif

    virtual void UpdateTime(float timeElapsed);

    virtual void OnPositionChanged() {needUpdateCurrentSprite = true;};

    virtual float GetWidth() const;
    virtual float GetHeight() const;
    virtual void SetWidth(float newWidth);
    virtual void SetHeight(float newHeight);
    virtual void SetOriginalSize();

    virtual float GetDrawableX() const;
    virtual float GetDrawableY() const;

    virtual float GetCenterX() const;
    virtual float GetCenterY() const;

    float GetPointX(const std::string & point) const;
    float GetPointY(const std::string & point) const;

    void UpdateCurrentSprite() const;
    const sf::Sprite & GetCurrentSFMLSprite() const;
    const gd::Sprite & GetCurrentSprite() const;

    /** \name Current animation
     * Managing the animation being played
     */
    ///@{
    void StopAnimation() { animationStopped = true; };
    void PlayAnimation() { animationStopped = false; };
    bool IsAnimationStopped() const { return animationStopped; }
    unsigned int GetAnimationCount() const { return animations.size(); };

    inline unsigned int GetCurrentAnimation() const { return currentAnimation; }
    bool SetCurrentAnimation(unsigned int nb);
    bool AnimationEnded() const;
    ///@}

    virtual bool SetAngle(float newAngle);
    virtual float GetAngle() const;

    bool SetDirection(float nb);
    inline unsigned int GetCurrentDirection() const { return currentDirection; }

    /**
     * Return angle or direction, according to the current direction type.
     */
    float GetCurrentDirectionOrAngle() const;

    bool SetSprite(unsigned int nb);
    inline unsigned int GetSpriteNb() const { return currentSprite; }

    void SetOpacity(float val);
    inline float GetOpacity() const {return opacity;};

    inline void SetBlendMode(unsigned int blendMode_) { blendMode = blendMode_; };
    inline unsigned int GetBlendMode() const {return blendMode;};

    inline void SetScaleX(float val) { if ( val > 0 ) scaleX = val; needUpdateCurrentSprite = true; };
    inline float GetScaleX() const { return scaleX; };
    inline void SetScaleY(float val) { if ( val > 0 ) scaleY = val; needUpdateCurrentSprite = true; };
    inline float GetScaleY() const { return scaleY; };

    void SetColor(unsigned int r,unsigned int v,unsigned int b);
    unsigned int GetColorR() const;
    unsigned int GetColorV() const;
    unsigned int GetColorB() const;

    virtual std::vector<Polygon2d> GetHitBoxes() const;
    bool CursorOnObject( RuntimeScene & scene, bool accurate );

    void FlipX(bool flip = true);
    void FlipY(bool flip = true);
    bool IsFlippedX() const { return isFlippedX; };
    bool IsFlippedY() const { return isFlippedY; };

    void TurnTowardPosition(float Xposition, float Yposition);
    void TurnTowardObject( RuntimeObject * object );

    /**
     * Only used internally by GD events generated code: Prefer using (Get/Set)Scale(X/Y).
     */
    void ChangeScale(const std::string & operatorStr, double newValue);

    /**
     * Only used internally by GD events generated code: Prefer using original SetColor.
     */
    void SetColor(const std::string & colorStr);

    void CopyImageOnImageOfCurrentSprite(RuntimeScene & scene, const std::string & imageName, float xPosition, float yPosition, bool useTransparency);
    void MakeColorTransparent( const std::string & colorStr );

private:

    //Animations, Directions et numéro de sprite actuel
    unsigned int currentAnimation;
    unsigned int currentDirection;
    float currentAngle;
    unsigned int currentSprite;
    bool animationStopped;
    float timeElapsedOnCurrentSprite;

    mutable gd::Sprite * ptrToCurrentSprite; //Ptr to the current sprite
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

GD_API void DestroyRuntimeSpriteObject(RuntimeObject * object);
GD_API RuntimeObject * CreateRuntimeSpriteObject(RuntimeScene & scene, const gd::Object & object);

#endif // SPRITEOBJECT_H