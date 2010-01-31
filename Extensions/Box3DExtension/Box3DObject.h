#ifndef BOX3DOBJECT_H
#define BOX3DOBJECT_H

#include "GDL/Object.h"
#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
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
 * Text Object
 */
class Box3DObject : public Object
{
    public :

        Box3DObject(std::string name_);
        virtual ~Box3DObject();

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
        virtual void SaveToXml(TiXmlElement * elemScene);

        virtual void UpdateTime(float timeElapsed);

        virtual void OnPositionChanged() {};

        virtual float GetWidth() const;
        virtual float GetHeight() const;
        inline float GetDepth() const {return depth;};

        virtual float GetDrawableX() const;
        virtual float GetDrawableY() const;

        virtual float GetCenterX() const;
        virtual float GetCenterY() const;

        inline void SetZPosition(float newZ) {zPosition = newZ;};
        inline float GetZPosition() const {return zPosition;};

        virtual inline void SetAngle(float newAngle) { yaw = newAngle;};
        virtual inline float GetAngle() const {return yaw;};

        virtual inline void SetWidth(float newWidth) {width = newWidth;};
        virtual inline void SetHeight(float newHeight) {height = newHeight;};
        inline void SetDepth(float newDepth) {depth = newDepth;};

        std::string frontTextureName;
        std::string topTextureName;
        std::string bottomTextureName;
        std::string leftTextureName;
        std::string rightTextureName;
        std::string backTextureName;

        //Conditions
        bool CondWidth( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondHeight( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondDepth( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondZPosition( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondYaw( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondPitch( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );
        bool CondRoll( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval );

        //Actions
        bool ActWidth( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActHeight( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActDepth( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActZPosition( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActYaw( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActPitch( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActRoll( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

        //Expressions
        double ExpGetDepth( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetZPosition( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetYaw( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetPitch( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetRoll( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

    private:

        float width;
        float height;
        float depth;
        float zPosition;
        float yaw;
        float pitch;
        float roll;

        sf::Image frontTexture;
        sf::Image topTexture;
        sf::Image bottomTexture;
        sf::Image leftTexture;
        sf::Image rightTexture;
        sf::Image backTexture;
};

void DestroyBox3DObject(Object * object);
Object * CreateBox3DObject(std::string name);
Object * CreateBox3DObjectByCopy(Object * object);

#endif // BOX3DOBJECT_H
