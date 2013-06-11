/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SPRITEOBJECT_H
#define SPRITEOBJECT_H

#include "GDL/Object.h"
#include "GDL/RuntimeObject.h"
namespace gd { class InitialInstance; }
namespace gd { class Object; }
namespace gd { class Layout; }
namespace sf { class Sprite; }
class Animation;
class Sprite;
class RuntimeScene;
#if defined(GD_IDE_ONLY)
class wxBitmap;
class wxWindow;
namespace gd { class MainFrameWrapper; }
#endif

/**
 * \brief Wrapper around a pointer to Animation. Used to reduce compile time.
 * Animation proxy is used to avoid including Animation.h/Direction.h/Sprite.h and SFML headers
 */
class GD_API AnimationProxy
{
public:
    AnimationProxy();
    AnimationProxy(const Animation & animation);
    virtual ~AnimationProxy();
    AnimationProxy(const AnimationProxy & proxy);
    AnimationProxy & operator=(const AnimationProxy & rhs);

    Animation & Get() {return *animation; }
    const Animation & Get() const {return *animation; }
    Animation & GetNonConst() {return *animation; }

private:
    Animation * animation;
};

/**
 * \brief Internal built-in Sprite object.
 *
 * Sprite object is an object composed of animations, containing directions with images.
 *
 * \see Animation
 * \see Direction
 * \see Sprite
 * \ingroup SpriteObjectExtension
 */
class GD_API SpriteObject : public gd::Object
{
public :

    SpriteObject(std::string name_);
    virtual ~SpriteObject();
    virtual gd::Object * Clone() const { return new SpriteObject(*this);}

    #if defined(GD_IDE_ONLY)
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail);
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);

    virtual void EditObject( wxWindow* parent, gd::Project & project, gd::MainFrameWrapper & mainFrameWrapper_ );
    virtual std::map<std::string, std::string> GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & project, gd::Layout & scene);
    virtual bool UpdateInitialInstanceProperty(gd::InitialInstance & position, const std::string & name, const std::string & value, gd::Project & project, gd::Layout & scene);
    virtual void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout);
    virtual sf::Vector2f GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const;
    virtual sf::Vector2f GetInitialInstanceOrigin(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const;
    virtual void LoadResources(gd::Project & project, gd::Layout & layout);

    virtual bool SupportShaders() { return true; }
    #endif

    /** \name Animations
     * Methods related to animations management
     */
    ///@{
    inline const Animation & GetAnimation(unsigned int nb) const { if ( nb >= GetAnimationCount() ) return badAnimation; else return animations[nb].Get(); }
    inline Animation & GetAnimation(unsigned int nb) { if ( nb >= GetAnimationCount() ) return badAnimation; else return animations[nb].Get(); }
    unsigned int GetAnimationCount() const {return animations.size();};
    void AddAnimation(const Animation & animation);
    bool RemoveAnimation(unsigned int nb);
    inline void RemoveAllAnimation() { animations.clear(); }
    inline bool HasNoAnimations() const { return animations.empty(); }
    inline const std::vector < AnimationProxy > & GetAllAnimations() const { return animations; }
    ///@}

private:

    virtual void DoLoadFromXml(gd::Project & project, const TiXmlElement * elemScene);
    #if defined(GD_IDE_ONLY)
    virtual void DoSaveToXml(TiXmlElement * elemScene);
    #endif

    const Sprite * GetInitialInstanceSprite(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout, bool * shouldNotRotate = NULL) const;
    mutable std::vector < AnimationProxy > animations;

    //Null objects if need to return a bad object.
    static Animation    badAnimation;
};

class GD_API RuntimeSpriteObject : public RuntimeObject
{
public :

    RuntimeSpriteObject(RuntimeScene & scene, const gd::Object & object);
    virtual ~RuntimeSpriteObject() {};
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
    const Sprite & GetCurrentSprite() const;

    /** \name Current animation
     * Managing the animation being played
     */
    ///@{
    void StopAnimation() { animationStopped = true; };
    void PlayAnimation() { animationStopped = false; };
    bool IsAnimationStopped() const { return animationStopped; }
    bool AnimationEnded() const;
    unsigned int GetAnimationCount() const;

    inline unsigned int GetCurrentAnimation() const { return currentAnimation; }
    bool SetCurrentAnimation(unsigned int nb);
    ///@}

    bool CursorOnObject( RuntimeScene & scene, bool accurate );

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

    mutable Sprite * ptrToCurrentSprite; //Ptr to the current sprite
    mutable bool needUpdateCurrentSprite;

    mutable std::vector < AnimationProxy > animations;
    mutable unsigned int cacheAnimationsSize;
    mutable bool cacheAnimationSizeNeedUpdate;

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
    static sf::Sprite   badSprite;
    static Sprite       badSpriteDatas;
    static Animation    badAnimation;
};


GD_API void DestroySpriteObject(gd::Object * object);
GD_API gd::Object * CreateSpriteObject(std::string name);
GD_API void DestroyRuntimeSpriteObject(RuntimeObject * object);
GD_API RuntimeObject * CreateRuntimeSpriteObject(RuntimeScene & scene, const gd::Object & object);

#endif // SPRITEOBJECT_H

