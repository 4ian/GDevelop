/**

Game Develop - TextEntry Object Extension
Copyright (c) 2011-2013 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef TEXTENTRYOBJECT_H
#define TEXTENTRYOBJECT_H

#include "GDCpp/Object.h"
#include "GDCpp/RuntimeObject.h"
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
    TextEntryObject(std::string name_);
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

    RuntimeTextEntryObject(RuntimeScene & scene, const gd::Object & object);
    virtual ~RuntimeTextEntryObject() {};
    virtual RuntimeObject * Clone() const { return new RuntimeTextEntryObject(*this);}

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;
    virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);
    virtual unsigned int GetNumberOfProperties() const;
    #endif

    virtual void UpdateTime(float);

    inline void SetString(std::string str) { text = str; };
    const std::string & GetString() const { return text; };

    void Activate( bool activate = true ) { activated = activate; };
    bool IsActivated() const { return activated; };

private:

    std::string text;
    const RuntimeScene * scene; ///< Pointer to the scene. Initialized during LoadRuntimeResources call.
    bool activated;
};

void DestroyTextEntryObject(gd::Object * object);
gd::Object * CreateTextEntryObject(std::string name);

void DestroyRuntimeTextEntryObject(RuntimeObject * object);
RuntimeObject * CreateRuntimeTextEntryObject(RuntimeScene & scene, const gd::Object & object);

#endif // TEXTENTRYOBJECT_H

