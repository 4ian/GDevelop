/**

GDevelop - Box 3D Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef BOX3DOBJECT_H
#define BOX3DOBJECT_H

#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include <memory>
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

    Box3DObject(gd::String name_);
    virtual ~Box3DObject();
    virtual std::unique_ptr<gd::Object> Clone() const { return std::unique_ptr<gd::Object>(new Box3DObject(*this)) ;}

    #if defined(GD_IDE_ONLY)
    virtual void LoadResources(gd::Project & project, gd::Layout & layout);
    virtual void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout);
    virtual sf::Vector2f GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const;
    virtual bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const;
    virtual void ExposeResources(gd::ArbitraryResourceWorker & worker);
    virtual void EditObject( wxWindow* parent, gd::Project & game_, gd::MainFrameWrapper & mainFrameWrapper_ );
    virtual std::map<gd::String, gd::PropertyDescriptor> GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & game, gd::Layout & scene);
    virtual bool UpdateInitialInstanceProperty(gd::InitialInstance & position, const gd::String & name, const gd::String & value, gd::Project & game, gd::Layout & scene);
    #endif

    virtual float GetWidth() const { return width; };
    virtual float GetHeight() const { return height; };

    virtual inline void SetWidth(float newWidth) {width = newWidth;};
    virtual inline void SetHeight(float newHeight) {height = newHeight;};

    float GetDepth() const { return depth; }
    void SetDepth(float depth_) { depth = depth_; }

    gd::String frontTextureName;
    gd::String topTextureName;
    gd::String bottomTextureName;
    gd::String leftTextureName;
    gd::String rightTextureName;
    gd::String backTextureName;

private:

    virtual void DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element);
    #if defined(GD_IDE_ONLY)
    virtual void DoSerializeTo(gd::SerializerElement & element) const;
    #endif

    float width;
    float height;
    float depth;

    std::shared_ptr<SFMLTextureWrapper> frontTexture;
    std::shared_ptr<SFMLTextureWrapper> topTexture;
    std::shared_ptr<SFMLTextureWrapper> bottomTexture;
    std::shared_ptr<SFMLTextureWrapper> leftTexture;
    std::shared_ptr<SFMLTextureWrapper> rightTexture;
    std::shared_ptr<SFMLTextureWrapper> backTexture;
};

class GD_EXTENSION_API RuntimeBox3DObject : public RuntimeObject
{
public :

    RuntimeBox3DObject(RuntimeScene & scene, const Box3DObject & box3DObject);
    virtual ~RuntimeBox3DObject() {};
    virtual std::unique_ptr<RuntimeObject> Clone() const { return gd::make_unique<RuntimeBox3DObject>(*this);}

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

    gd::String frontTextureName;
    gd::String topTextureName;
    gd::String bottomTextureName;
    gd::String leftTextureName;
    gd::String rightTextureName;
    gd::String backTextureName;

    #if defined(GD_IDE_ONLY)
    virtual void GetPropertyForDebugger (std::size_t propertyNb, gd::String & name, gd::String & value) const;
    virtual bool ChangeProperty(std::size_t propertyNb, gd::String newValue);
    virtual std::size_t GetNumberOfProperties() const;
    #endif

private:

    float width;
    float height;
    float depth;
    float zPosition;
    float yaw;
    float pitch;
    float roll;

    std::shared_ptr<SFMLTextureWrapper> frontTexture;
    std::shared_ptr<SFMLTextureWrapper> topTexture;
    std::shared_ptr<SFMLTextureWrapper> bottomTexture;
    std::shared_ptr<SFMLTextureWrapper> leftTexture;
    std::shared_ptr<SFMLTextureWrapper> rightTexture;
    std::shared_ptr<SFMLTextureWrapper> backTexture;
};

#endif // BOX3DOBJECT_H
