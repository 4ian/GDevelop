#ifndef SPRITEOBJECT_H
#define SPRITEOBJECT_H

#include "GDL/Object.h"
class Evaluateur;
class ImageManager;
class RuntimeScene;
class Object;
class ExpressionInstruction;
class ObjectsConcerned;
class ImageManager;
class InitialPosition;
#ifdef GDE
class wxBitmap;
class Game;
class wxWindow;
class MainEditorCommand;
#endif

/**
 * Sprite object is an object composed of animations, containing directions with images.
 */
class SpriteObject : public Object
{
    public :

        SpriteObject(std::string name_);
        virtual ~SpriteObject() {};
        virtual ObjSPtr Clone() { return boost::shared_ptr<Object>(new SpriteObject(*this));}

        virtual bool LoadResources(const ImageManager & imageMgr );
        virtual bool InitializeFromInitialPosition(const InitialPosition & position);

        virtual bool Draw(sf::RenderWindow& main_window);

        #ifdef GDE
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
        #if defined(GDE)
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

        virtual bool SetAngle(float newAngle);
        virtual float GetAngle() const;

        bool SetDirection(unsigned int nb);
        inline unsigned int GetCurrentDirection() const { return currentDirection; }

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

        //Conditions
        bool CondAnim( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondSprite( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondAnimStopped( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondScaleWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondScaleHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondOpacityObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondBlendMode( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

        //Actions
        bool ActOpacity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActBlendMode( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActChangeAnimation( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActChangeDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActChangeSprite( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActPauseAnimation( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActPlayAnimation( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActTourneVersPos( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActChangeColor( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActChangeScale( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActChangeScaleWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActChangeScaleHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActCopyImageOnImageOfSprite( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActCreateMaskFromColorOnActualImage( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActFlipX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActFlipY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

        //Expressions
        double ExpGetObjectX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectDirection( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectSpriteNb( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectAnimationNb( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectScaleX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetObjectScaleY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

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
GD_API Object * CreateSpriteObjectByCopy(Object * object);

#endif // SPRITEOBJECT_H
