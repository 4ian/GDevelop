/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef SPRITEOBJECT_H
#define SPRITEOBJECT_H

#include "GDL/Object.h"
#include "GDL/Sprite.h"
#include "GDL/Animation.h"
class Evaluateur;
class ImageManager;
class RuntimeScene;
class Object;
class ExpressionInstruction;
class ObjectsConcerned;
class ImageManager;
class InitialPosition;
#if defined(GD_IDE_ONLY)
class wxBitmap;
class Game;
class wxWindow;
class MainEditorCommand;
#endif

/**
 * \brief Internal built-in Sprite object.
 * Sprite object is an object composed of animations, containing directions with images.
 */
class GD_API SpriteObject : public Object
{
    public :

        SpriteObject(std::string name_);
        virtual ~SpriteObject() {};
        virtual ObjSPtr Clone() { return boost::shared_ptr<Object>(new SpriteObject(*this));}

        virtual bool LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr );
        virtual bool InitializeFromInitialPosition(const InitialPosition & position);

        virtual bool Draw(sf::RenderWindow& main_window);

        #if defined(GD_IDE_ONLY)
        virtual bool DrawEdittime(sf::RenderWindow& main_window);
        virtual bool GenerateThumbnail(const Game & game, wxBitmap & thumbnail);

        virtual void EditObject( wxWindow* parent, Game & game_, MainEditorCommand & mainEditorCommand_ );
        virtual wxPanel * CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position );
        virtual void UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position);

        virtual void GetPropertyForDebugger (unsigned int propertyNb, string & name, string & value) const;
        virtual bool ChangeProperty(unsigned int propertyNb, string newValue);
        virtual unsigned int GetNumberOfProperties() const;
        #endif

        virtual void LoadFromXml(const TiXmlElement * elemScene);
        #if defined(GD_IDE_ONLY)
        virtual void SaveToXml(TiXmlElement * elemScene);
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
        bool IsValid(int anim, int direc, int sprite) const;
        const Sprite & GetCurrentSprite() const;

        void StopAnimation() { animationStopped = true; };
        void PlayAnimation() { animationStopped = false; };
        bool IsAnimationStopped() const { return animationStopped; }

        inline unsigned int GetCurrentAnimation() const { return currentAnimation; }
        bool SetAnimation(unsigned int nb);
        inline const Animation & GetAnimation(unsigned int nb) const
        {
            if ( nb >= GetAnimationsNumber() )
            {
                cout << "Impossible d'accéder à l'animation "<<nb;
                return badAnimation;
            }

            return animations[nb];
        }
        inline Animation & GetAnimation(unsigned int nb)
        {
            if ( nb >= GetAnimationsNumber() )
            {
                cout << "Impossible d'accéder à l'animation "<<nb;
                return badAnimation;
            }

            return animations[nb];
        }
        unsigned int GetAnimationsNumber() const;
        void AddAnimation(const Animation & animation);
        bool RemoveAnimation(unsigned int nb);
        inline void RemoveAllAnimation() { animations.clear(); cacheAnimationSizeNeedUpdate = true;}
        inline bool HasNoAnimations() { return animations.empty(); }

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

        inline void SetBlendMode(const sf::Blend::Mode & val) { blendMode = val; };
        inline sf::Blend::Mode GetBlendMode() const {return blendMode;};

        inline void SetScaleX(float val) { if ( val > 0 ) scaleX = val; needUpdateCurrentSprite = true; };
        inline float GetScaleX() const { return scaleX; };
        inline void SetScaleY(float val) { if ( val > 0 ) scaleY = val; needUpdateCurrentSprite = true; };
        inline float GetScaleY() const { return scaleY; };

        void SetColor(unsigned int r,unsigned int v,unsigned int b);
        unsigned int GetColorR() const;
        unsigned int GetColorV() const;
        unsigned int GetColorB() const;

        virtual std::vector<RotatedRectangle> GetHitBoxes() const;

        void FlipX(bool flip = true) { isFlippedX = flip; };
        void FlipY(bool flip = true) { isFlippedY = flip; };
        bool IsFlippedX() const { return isFlippedX; };
        bool IsFlippedY() const { return isFlippedY; };

        void TurnTowardPosition(float Xposition, float Yposition);
        void TurnTowardObject( std::string, Object * object );

        /**
         * Only used internally by GD events generated code: Prefer using (Get/Set)Scale(X/Y).
         */
        void ChangeScale(double newValue, const std::string & operatorStr);

        /**
         * Only used internally by GD events generated code: Prefer using original SetBlendMode.
         */
        void SetBlendMode(int blendModeAsInt);

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

        //Animations de l'objets
        mutable vector < Animation > animations;
        mutable unsigned int cacheAnimationsSize;
        mutable bool cacheAnimationSizeNeedUpdate;

        float opacity;
        sf::Blend::Mode blendMode;
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

//Conditions
bool CondSourisSurObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondEstTourne( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondCollision( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
bool CondCollisionNP( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

//Actions
bool ActTourneVers( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

GD_API void DestroySpriteObject(Object * object);
GD_API Object * CreateSpriteObject(std::string name);

#endif // SPRITEOBJECT_H
