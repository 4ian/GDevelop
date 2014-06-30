/**

Game Develop - Primitive Drawing Extension
Copyright (c) 2008-2014 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDCpp/Object.h"
#include "GDCpp/RuntimeObject.h"
#include <vector>
#include <SFML/Graphics/RectangleShape.hpp>
#include <SFML/Graphics/CircleShape.hpp>
namespace sf
{
    class Sprite;
    class Texture;
}
class RuntimeScene;
namespace gd { class ImageManager; }
namespace gd { class Object; }
namespace gd { class InitialInstance; }
#if defined(GD_IDE_ONLY)
class wxBitmap;
namespace gd { class Project; }
class wxWindow;
namespace gd { class MainFrameWrapper; }
#endif

/**
 * \brief Internal class to define a shape to be drawn
 */
class GD_EXTENSION_API DrawingCommand
{
public:
    DrawingCommand(const sf::RectangleShape & rectangleShape_) : rectangleShape(rectangleShape_) {};
    DrawingCommand(const sf::CircleShape & circleShape_) : circleShape(circleShape_) {};

    sf::RectangleShape rectangleShape;
    sf::CircleShape circleShape;
};


/**
 * \brief Base object storing the setup of a drawer object.
 */
class GD_EXTENSION_API DrawerObjectBase
{
public :
    DrawerObjectBase();
    virtual ~DrawerObjectBase() {};

    virtual void UnserializeFrom(const gd::SerializerElement & element);
    #if defined(GD_IDE_ONLY)
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

    inline void SetOutlineSize(float size) { outlineSize = size; };
    inline float GetOutlineSize() const { return outlineSize; };

    void SetOutlineOpacity(float val);
    inline float GetOutlineOpacity() const {return outlineOpacity;};

    void SetOutlineColor(unsigned int r,unsigned int v,unsigned int b);
    inline unsigned int GetOutlineColorR() const { return outlineColorR; };
    inline unsigned int GetOutlineColorG() const { return outlineColorG; };
    inline unsigned int GetOutlineColorB() const { return outlineColorB; };

    /** Used by GD events generated code : Prefer using original SetOutlineColor
     */
    void SetOutlineColor( const std::string & color );

    void SetFillOpacity(float val);
    inline float GetFillOpacity() const {return fillOpacity;};

    void SetFillColor(unsigned int r,unsigned int v,unsigned int b);
    inline unsigned int GetFillColorR() const { return fillColorR; };
    inline unsigned int GetFillColorG() const { return fillColorG; };
    inline unsigned int GetFillColorB() const { return fillColorB; };

    /** Used by GD events generated code : Prefer using original SetFillColor
     */
    void SetFillColor( const std::string & color );

    inline void SetCoordinatesAbsolute() { absoluteCoordinates = true; }
    inline void SetCoordinatesRelative() { absoluteCoordinates = false; }
    inline bool AreCoordinatesAbsolute() { return absoluteCoordinates; }
private:
    //Fill color
    unsigned int fillColorR;
    unsigned int fillColorG;
    unsigned int fillColorB;
    float fillOpacity;

    //Outline
    int outlineSize;
    unsigned int outlineColorR;
    unsigned int outlineColorG;
    unsigned int outlineColorB;
    float outlineOpacity;

    bool absoluteCoordinates;

};

/**
 * \brief The Drawer object used for storage and by the IDE.
 */
class GD_EXTENSION_API DrawerObject : public gd::Object, public DrawerObjectBase
{
public :
    DrawerObject(std::string name_);
    virtual ~DrawerObject() {};
    virtual gd::Object * Clone() const { return new DrawerObject(*this); }

    #if defined(GD_IDE_ONLY)
    virtual void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout);
    virtual sf::Vector2f GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const {return sf::Vector2f(32,32);};
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const;
    static void LoadEdittimeIcon();
    virtual void EditObject( wxWindow* parent, gd::Project & game_, gd::MainFrameWrapper & mainFrameWrapper_ );
    #endif

private:

    virtual void DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element);
    #if defined(GD_IDE_ONLY)
    virtual void DoSerializeTo(gd::SerializerElement & element) const;

    static sf::Texture edittimeIconImage;
    static sf::Sprite edittimeIcon;
    #endif
};

class GD_EXTENSION_API RuntimeDrawerObject : public RuntimeObject, public DrawerObjectBase
{
public :
    RuntimeDrawerObject(RuntimeScene & scene, const gd::Object & object);
    virtual ~RuntimeDrawerObject() {};
    virtual RuntimeObject * Clone() const { return new RuntimeDrawerObject(*this);}

    virtual bool Draw(sf::RenderTarget & renderTarget);

    virtual float GetWidth() const {return 32;};
    virtual float GetHeight() const {return 32;};

    virtual bool SetAngle(float newAngle) {return false;};
    virtual float GetAngle() const {return 0;};

    void DrawRectangle( float x, float y, float x2, float y2 );
    void DrawLine( float x, float y, float x2, float y2, float thickness );
    void DrawCircle( float x, float y, float radius );

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;
    virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);
    virtual unsigned int GetNumberOfProperties() const;
    #endif

private:
    std::vector < DrawingCommand > shapesToDraw;
};

void DestroyRuntimeDrawerObject(RuntimeObject * object);
RuntimeObject * CreateRuntimeDrawerObject(RuntimeScene & scene, const gd::Object & object);

void DestroyDrawerObject(gd::Object * object);
gd::Object * CreateDrawerObject(std::string name);

#endif // DRAWEROBJECT_H

