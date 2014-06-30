/**

Game Develop - Box 3D Extension
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

#ifndef BOX3DOBJECT_H
#define BOX3DOBJECT_H

#include "GDCpp/Object.h"
#include "GDCpp/RuntimeObject.h"
#include <boost/shared_ptr.hpp>
class SFMLTextureWrapper;
class RuntimeScene;
namespace gd { class Object; }
namespace gd { class ImageManager; }
namespace gd { class InitialInstance; }
namespace gd { class SerializerElement; }
#if defined(GD_IDE_ONLY)
class wxBitmap;
class wxWindow;
namespace gd { class Project; }
namespace gd { class MainFrameWrapper; }
#endif

/**
 * \brief 3D Box object
 */
class GD_EXTENSION_API Box3DObject : public gd::Object
{
public :

    Box3DObject(std::string name_);
    virtual ~Box3DObject();
    virtual gd::Object * Clone() const { return new Box3DObject(*this);}

    #if defined(GD_IDE_ONLY)
    virtual void LoadResources(gd::Project & project, gd::Layout & layout);
    virtual void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout);
    virtual sf::Vector2f GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const;
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const;
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);
    virtual void EditObject( wxWindow* parent, gd::Project & game_, gd::MainFrameWrapper & mainFrameWrapper_ );
    virtual std::map<std::string, gd::PropertyDescriptor> GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & game, gd::Layout & scene);
    virtual bool UpdateInitialInstanceProperty(gd::InitialInstance & position, const std::string & name, const std::string & value, gd::Project & game, gd::Layout & scene);
    #endif

    virtual float GetWidth() const { return width; };
    virtual float GetHeight() const { return height; };

    virtual inline void SetWidth(float newWidth) {width = newWidth;};
    virtual inline void SetHeight(float newHeight) {height = newHeight;};

    float GetDepth() const { return depth; }
    void SetDepth(float depth_) { depth = depth_; }

    std::string frontTextureName;
    std::string topTextureName;
    std::string bottomTextureName;
    std::string leftTextureName;
    std::string rightTextureName;
    std::string backTextureName;

private:

    virtual void DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element);
    #if defined(GD_IDE_ONLY)
    virtual void DoSerializeTo(gd::SerializerElement & element) const;
    #endif

    float width;
    float height;
    float depth;

    boost::shared_ptr<SFMLTextureWrapper> frontTexture;
    boost::shared_ptr<SFMLTextureWrapper> topTexture;
    boost::shared_ptr<SFMLTextureWrapper> bottomTexture;
    boost::shared_ptr<SFMLTextureWrapper> leftTexture;
    boost::shared_ptr<SFMLTextureWrapper> rightTexture;
    boost::shared_ptr<SFMLTextureWrapper> backTexture;
};

class GD_EXTENSION_API RuntimeBox3DObject : public RuntimeObject
{
public :

    RuntimeBox3DObject(RuntimeScene & scene, const gd::Object & object);
    virtual ~RuntimeBox3DObject() {};
    virtual RuntimeObject * Clone() const { return new RuntimeBox3DObject(*this);}

    virtual bool ExtraInitializationFromInitialInstance(const gd::InitialInstance & position);
    virtual bool Draw(sf::RenderTarget & renderTarget);

    virtual inline bool SetAngle(float newAngle) { yaw = newAngle; return true;};
    virtual inline float GetAngle() const {return yaw;};
    float GetPitch() const { return pitch; }
    void SetPitch(float pitch_) { pitch = pitch_; }
    float GetRoll() const { return roll; }
    void SetRoll(float roll_) { roll = roll_; }

    virtual float GetWidth() const { return width; };
    virtual float GetHeight() const { return height; };

    virtual inline void SetWidth(float newWidth) {width = newWidth;};
    virtual inline void SetHeight(float newHeight) {height = newHeight;};

    inline void SetZPosition(float newZ) {zPosition = newZ;};
    inline float GetZPosition() const {return zPosition;};

    float GetDepth() const { return depth; }
    void SetDepth(float depth_) { depth = depth_; }

    std::string frontTextureName;
    std::string topTextureName;
    std::string bottomTextureName;
    std::string leftTextureName;
    std::string rightTextureName;
    std::string backTextureName;

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (unsigned int propertyNb, std::string & name, std::string & value) const;
    virtual bool ChangeProperty(unsigned int propertyNb, std::string newValue);
    virtual unsigned int GetNumberOfProperties() const;
    #endif

private:

    float width;
    float height;
    float depth;
    float zPosition;
    float yaw;
    float pitch;
    float roll;

    boost::shared_ptr<SFMLTextureWrapper> frontTexture;
    boost::shared_ptr<SFMLTextureWrapper> topTexture;
    boost::shared_ptr<SFMLTextureWrapper> bottomTexture;
    boost::shared_ptr<SFMLTextureWrapper> leftTexture;
    boost::shared_ptr<SFMLTextureWrapper> rightTexture;
    boost::shared_ptr<SFMLTextureWrapper> backTexture;
};

void DestroyRuntimeBox3DObject(RuntimeObject * object);
RuntimeObject * CreateRuntimeBox3DObject(RuntimeScene & scene, const gd::Object & object);

void DestroyBox3DObject(gd::Object * object);
gd::Object * CreateBox3DObject(std::string name);

#endif // BOX3DOBJECT_H

