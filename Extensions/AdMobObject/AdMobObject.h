/**

GDevelop - AdMob Object Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef ADMOBOBJECT_H
#define ADMOBOBJECT_H

#include "GDCpp/Object.h"
#include "GDCpp/String.h"
namespace gd { class InitialInstance; }
namespace gd { class Project; }
namespace sf { class Texture; }
namespace sf { class Sprite; }
class wxBitmap;

class GD_EXTENSION_API AdMobObject : public gd::Object
{
public:
    AdMobObject(gd::String name_);
    virtual ~AdMobObject() {};
    virtual gd::Object * Clone() const { return new AdMobObject(*this); }

    void DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout) override;
    bool GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const override;
    static void LoadEdittimeIcon();

    std::map<gd::String, gd::PropertyDescriptor> GetProperties(gd::Project & project) const override;
    bool UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project) override;

private:
    void DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element) override;
    void DoSerializeTo(gd::SerializerElement & element) const override;

    gd::String androidBannerId;
    gd::String androidInterstitialId;
    gd::String iosBannerId;
    gd::String iosInterstitialId;
    gd::String position; //"Top" or "Bottom"
    bool isTesting;
    bool overlap;
    bool showOnStartup;

    static sf::Texture edittimeIconImage;
    static sf::Sprite edittimeIcon;
};

gd::Object * CreateAdMobObject(gd::String name);

#endif // ADMOBOBJECT_H
