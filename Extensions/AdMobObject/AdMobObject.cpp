/**

GDevelop - AdMob Object Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <SFML/Graphics.hpp>
#include "GDCpp/Object.h"
#include "GDCore/Tools/Localization.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/Position.h"
#include "GDCpp/CommonTools.h"
#include "AdMobObject.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#endif

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>
#endif

sf::Texture AdMobObject::edittimeIconImage;
sf::Sprite AdMobObject::edittimeIcon;

AdMobObject::AdMobObject(gd::String name_) :
    Object(name_),
    isTesting(true),
    overlap(true),
    showOnStartup(true)
{
}

std::map<gd::String, gd::PropertyDescriptor> AdMobObject::GetProperties(gd::Project & project) const
{
    std::map<gd::String, gd::PropertyDescriptor> properties;
    properties[_("Banner ID (Android)")].SetValue(androidBannerId);
    properties[_("Interstitial ID (Android)")].SetValue(androidInterstitialId);
    properties[_("Banner ID (iOS)")].SetValue(iosBannerId);
    properties[_("Interstitial ID (iOS)")].SetValue(iosInterstitialId);
    properties[_("Testing mode")].SetValue(isTesting ? "true" : "false").SetType("Boolean");
    properties[_("Overlap game")].SetValue(overlap ? "true" : "false").SetType("Boolean");
    properties[_("Show banner on startup")].SetValue(showOnStartup ? "true" : "false").SetType("Boolean");
    properties[_("Banner position")].SetValue(
        position == "Bottom" ? _("Bottom of the screen") : _("Top of the screen"))
        .SetType("Choice")
        .AddExtraInfo(_("Top of the screen"))
        .AddExtraInfo(_("Bottom of the screen"));

    return properties;
}

bool AdMobObject::UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project)
{
    if (name == _("Banner ID (Android)")) androidBannerId = value;
    if (name == _("Interstitial ID (Android)")) androidInterstitialId = value;
    if (name == _("Banner ID (iOS)")) iosBannerId = value;
    if (name == _("Interstitial ID (iOS)")) iosInterstitialId = value;
    if (name == _("Testing mode")) isTesting = value == "1";
    if (name == _("Overlap game")) overlap = value == "1";
    if (name == _("Show banner on startup")) showOnStartup = value == "1";
    if (name == _("Banner position")) position = value == _("Top of the screen") ? "Top" : "Bottom";

    return true;
}

void AdMobObject::DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    androidBannerId = element.GetStringAttribute("androidBannerId");
    androidInterstitialId = element.GetStringAttribute("androidInterstitialId");
    iosBannerId = element.GetStringAttribute("iosBannerId");
    iosInterstitialId = element.GetStringAttribute("iosInterstitialId");
    position = element.GetStringAttribute("position");
    isTesting = element.GetBoolAttribute("isTesting");
    overlap = element.GetBoolAttribute("overlap");
    showOnStartup = element.GetBoolAttribute("showOnStartup");
}

#if defined(GD_IDE_ONLY)
void AdMobObject::DoSerializeTo(gd::SerializerElement & element) const
{
    element.SetAttribute("androidBannerId", androidBannerId);
    element.SetAttribute("androidInterstitialId", androidInterstitialId);
    element.SetAttribute("iosBannerId", iosBannerId);
    element.SetAttribute("iosInterstitialId", iosInterstitialId);
    element.SetAttribute("position", position);
    element.SetAttribute("isTesting", isTesting);
    element.SetAttribute("overlap", overlap);
    element.SetAttribute("showOnStartup", showOnStartup);
}

void AdMobObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    edittimeIcon.setPosition(instance.GetX(), instance.GetY());
    renderTarget.draw(edittimeIcon);
}

void AdMobObject::LoadEdittimeIcon()
{
    edittimeIconImage.loadFromFile("JsPlatform/Extensions/admobicon.png");
    edittimeIcon.setTexture(edittimeIconImage);
}

bool AdMobObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
#if !defined(GD_NO_WX_GUI)
    thumbnail = wxBitmap("JsPlatform/Extensions/admobicon24.png", wxBITMAP_TYPE_ANY);
#endif

    return true;
}
#endif

gd::Object * CreateAdMobObject(gd::String name)
{
    return new AdMobObject(name);
}
