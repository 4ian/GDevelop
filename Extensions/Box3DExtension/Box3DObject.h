/**

Game Develop - Box 3D Extension
Copyright (c) 2008-2010 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

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
        virtual ObjSPtr Clone() { return boost::shared_ptr<Object>(new Box3DObject(*this));}

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

        virtual inline bool SetAngle(float newAngle) { yaw = newAngle; return true;};
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
        bool CondWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondDepth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondZPosition( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondYaw( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondPitch( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );
        bool CondRoll( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition );

        //Actions
        bool ActWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActDepth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActZPosition( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActYaw( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActPitch( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );
        bool ActRoll( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action );

        //Expressions
        double ExpGetDepth( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetZPosition( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetYaw( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetPitch( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpGetRoll( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );

    private:

        float width;
        float height;
        float depth;
        float zPosition;
        float yaw;
        float pitch;
        float roll;

        boost::shared_ptr<sf::Image> frontTexture;
        boost::shared_ptr<sf::Image> topTexture;
        boost::shared_ptr<sf::Image> bottomTexture;
        boost::shared_ptr<sf::Image> leftTexture;
        boost::shared_ptr<sf::Image> rightTexture;
        boost::shared_ptr<sf::Image> backTexture;
};

void DestroyBox3DObject(Object * object);
Object * CreateBox3DObject(std::string name);
Object * CreateBox3DObjectByCopy(Object * object);

#endif // BOX3DOBJECT_H
