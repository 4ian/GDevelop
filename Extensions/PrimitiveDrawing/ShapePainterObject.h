/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef DRAWEROBJECT_H
#define DRAWEROBJECT_H

#include "GDCpp/Project/Object.h"
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
namespace gd { class MainFrameWrapper; }
namespace gd { class Project; }
class wxBitmap;
class wxWindow;
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
class GD_EXTENSION_API ShapePainterObjectBase
{
public:
    ShapePainterObjectBase();
    virtual ~ShapePainterObjectBase() {};

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
    void SetOutlineColor( const gd::String & color );

    void SetFillOpacity(float val);
    inline float GetFillOpacity() const {return fillOpacity;};

    void SetFillColor(unsigned int r,unsigned int v,unsigned int b);
    inline unsigned int GetFillColorR() const { return fillColorR; };
    inline unsigned int GetFillColorG() const { return fillColorG; };
    inline unsigned int GetFillColorB() const { return fillColorB; };

    /** Used by GD events generated code : Prefer using original SetFillColor
     */
    void SetFillColor( const gd::String & color );

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
 * \brief The Shape Painter object used for storage and by the IDE.
 */
class GD_EXTENSION_API ShapePainterObject : public gd::Object, public ShapePainterObjectBase
{
public:
    ShapePainterObject(gd::String name_);
    virtual ~ShapePainterObject() {};
    virtual gd::Object * Clone() const { return new ShapePainterObject(*this); }

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

class GD_EXTENSION_API RuntimeShapePainterObject : public RuntimeObject, public ShapePainterObjectBase
{
public:
    RuntimeShapePainterObject(RuntimeScene & scene, const gd::Object & object);
    virtual ~RuntimeShapePainterObject() {};
    virtual RuntimeObject * Clone() const { return new RuntimeShapePainterObject(*this);}

    virtual bool Draw(sf::RenderTarget & renderTarget);

    virtual float GetWidth() const {return 32;};
    virtual float GetHeight() const {return 32;};

    virtual bool SetAngle(float newAngle) {return false;};
    virtual float GetAngle() const {return 0;};

    void DrawRectangle( float x, float y, float x2, float y2 );
    void DrawLine( float x, float y, float x2, float y2, float thickness );
    void DrawCircle( float x, float y, float radius );

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (std::size_t propertyNb, gd::String & name, gd::String & value) const;
    virtual bool ChangeProperty(std::size_t propertyNb, gd::String newValue);
    virtual std::size_t GetNumberOfProperties() const;
    #endif

private:
    std::vector < DrawingCommand > shapesToDraw;
};

RuntimeObject * CreateRuntimeShapePainterObject(RuntimeScene & scene, const gd::Object & object);
gd::Object * CreateShapePainterObject(gd::String name);

#endif // DRAWEROBJECT_H
