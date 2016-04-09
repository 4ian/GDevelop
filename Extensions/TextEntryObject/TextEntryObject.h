/**

GDevelop - TextEntry Object Extension
Copyright (c) 2011-2013 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef TEXTENTRYOBJECT_H
#define TEXTENTRYOBJECT_H

#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/RuntimeObject.h"
class RuntimeScene;
class ImageManager;
namespace gd { class InitialInstance; }
namespace gd { class ImageManager; }
#if defined(GD_IDE_ONLY)
namespace sf
{
    class Texture;
    class Sprite;
};
namespace gd { class Project; }
class wxBitmap;
#endif

/**
 * \brief Simple object which stores user keyboard input.
 */
class GD_EXTENSION_API TextEntryObject : public gd::Object
{
public :
    TextEntryObject(gd::String name_);
    virtual ~TextEntryObject() {};
    virtual gd::Object * Clone() const { return new TextEntryObject(*this); }

    #if defined(GD_IDE_ONLY)
    virtual void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout);
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const;
    static void LoadEdittimeIcon();
    #endif

private:
    #if defined(GD_IDE_ONLY)
    static sf::Texture edittimeIconImage;
    static sf::Sprite edittimeIcon;
    #endif
};


class GD_EXTENSION_API RuntimeTextEntryObject : public RuntimeObject
{
public :

    RuntimeTextEntryObject(RuntimeScene & scene, const TextEntryObject & textEntryObject);
    virtual ~RuntimeTextEntryObject() {};
    virtual RuntimeObject * Clone() const { return new RuntimeTextEntryObject(*this);}

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (std::size_t propertyNb, gd::String & name, gd::String & value) const;
    virtual bool ChangeProperty(std::size_t propertyNb, gd::String newValue);
    virtual std::size_t GetNumberOfProperties() const;
    #endif

    virtual void UpdateTime(float);

    inline void SetString(gd::String str) { text = str; };
    const gd::String & GetString() const { return text; };

    void Activate( bool activate = true ) { activated = activate; };
    bool IsActivated() const { return activated; };

private:

    gd::String text;
    const RuntimeScene * scene; ///< Pointer to the scene. Initialized during LoadRuntimeResources call.
    bool activated;
};

#endif // TEXTENTRYOBJECT_H
