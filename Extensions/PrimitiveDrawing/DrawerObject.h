/**

Game Develop - Primitive Drawing Extension
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

#ifndef DRAWEROBJECT_H
#define DRAWEROBJECT_H

#include "GDL/Object.h"
#include <SFML/Graphics.hpp>
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
 * Drawer object can draw primitive shapes
 */
class DrawerObject : public Object
{
    public :

        DrawerObject(std::string name_);
        virtual ~DrawerObject() {};

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

        virtual float GetDrawableX() const;
        virtual float GetDrawableY() const;

        virtual float GetCenterX() const;
        virtual float GetCenterY() const;

        virtual void SetAngle(float newAngle) {};
        virtual float GetAngle() const {return 0;};

        virtual void SetWidth(float ) {};
        virtual void SetHeight(float ) {};

        inline void SetOutlineSize(float size) { outlineSize = size; };
        inline float GetOutlineSize() const { return outlineSize; };

        void SetOutlineOpacity(int val);
        inline int GetOutlineOpacity() const {return outlineOpacity;};

        void SetOutlineColor(unsigned int r,unsigned int v,unsigned int b);
        inline unsigned int GetOutlineColorR() const { return outlineColorR; };
        inline unsigned int GetOutlineColorG() const { return outlineColorG; };
        inline unsigned int GetOutlineColorB() const { return outlineColorB; };

        void SetFillOpacity(int val);
        inline int GetFillOpacity() const {return fillOpacity;};

        void SetFillColor(unsigned int r,unsigned int v,unsigned int b);
        inline unsigned int GetFillColorR() const { return fillColorR; };
        inline unsigned int GetFillColorG() const { return fillColorG; };
        inline unsigned int GetFillColorB() const { return fillColorB; };

        inline void SetCoordinatesAbsolute() { absoluteCoordinates = true; }
        inline void SetCoordinatesRelative() { absoluteCoordinates = false; }
        inline bool AreCoordinatesAbsolute() { return absoluteCoordinates; }

        //Setup
        bool ActFillColor( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActFillOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActOutlineColor( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActOutlineOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActOutlineSize( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

        bool CondFillOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool CondOutlineOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool CondOutlineSize( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

        //Shapes
        bool ActRectangle( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActLine( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
        bool ActCircle( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

        double ExpFillOpacity( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
        double ExpOutlineOpacity( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction );
    private:

        vector < sf::Shape > shapesToDraw;

        //Fill color
        unsigned int fillColorR;
        unsigned int fillColorG;
        unsigned int fillColorB;
        int fillOpacity;

        //Outline
        int outlineSize;
        unsigned int outlineColorR;
        unsigned int outlineColorG;
        unsigned int outlineColorB;
        int outlineOpacity;

        bool absoluteCoordinates;

        #if defined(GDE)
        sf::Image edittimeIconImage;
        sf::Sprite edittimeIcon;
        #endif
};

bool ActCopyImageOnAnother( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );

void DestroyDrawerObject(Object * object);
Object * CreateDrawerObject(std::string name);
Object * CreateDrawerObjectByCopy(Object * object);


#endif // DRAWEROBJECT_H
