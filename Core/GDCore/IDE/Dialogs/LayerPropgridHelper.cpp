/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "LayerPropgridHelper.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "GDCore/IDE/Dialogs/ChooseVariableDialog.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCore/Project/Layer.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Log.h"
#include <wx/propgrid/propgrid.h>
#include <wx/settings.h>
#include <map>

namespace {
    int GetCameraId(wxString propertyName)
    {
        if (propertyName.Find(":") == wxNOT_FOUND) return -1;

        wxString cameraId = propertyName.Mid(propertyName.Find(":") + 1);
        return gd::String(cameraId).To<int>();
    }
}

namespace gd
{

void LayerPropgridHelper::RefreshFrom(const Layer & layer)
{
    if (!grid) return;
    grid->Clear();

    grid->Append(new wxPropertyCategory(_("Layer properties")) );
    grid->Append(new wxStringProperty(_("Name"), "LAYER_NAME", layer.GetName()));
    if (layer.GetName().empty())
    {
        grid->EnableProperty(grid->GetProperty("LAYER_NAME"), false);
        grid->SetPropertyValue("LAYER_NAME", _("(Base layer)"));
    }
    grid->Append(new wxBoolProperty(_("Visible"), "LAYER_VISIBLE", layer.GetVisibility()));
    grid->Append(new wxStringProperty(_("Help"), "HELP", _("Click to see help...")) );
    grid->SetPropertyCell("HELP", 1, _("Help"), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
    grid->SetPropertyReadOnly("HELP");
    grid->Append(new wxPropertyCategory(_("Cameras"), "CAMERAS") );
    grid->Append(new wxStringProperty(_("Add a camera"), "CAMERA_ADD", _("Add...")) );
    grid->SetPropertyCell("CAMERA_ADD", 1, _("Add..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
    grid->SetPropertyReadOnly("CAMERA_ADD");

    for (std::size_t i = 0;i<layer.GetCameraCount();++i)
    {
        const gd::Camera & camera = layer.GetCamera(i);
        wxString suffix = ":" + gd::String::From(i);

        grid->AppendIn("CAMERAS", new wxPropertyCategory(wxString::Format(
            wxString(i == 0 ? _("Camera %d") : _("Camera %d (native games only)")), i), suffix)
        );

        grid->Append(new wxStringProperty(_(""), "CAMERA_REMOVE" + suffix, _("Remove")) );
        grid->SetPropertyCell("CAMERA_REMOVE" + suffix, 1, _("Remove"), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
        grid->SetPropertyReadOnly("CAMERA_REMOVE" + suffix);

        grid->AppendIn(suffix, new wxBoolProperty(_("Custom size"), "CAMERA_CUSTOM_SIZE" + suffix, !camera.UseDefaultSize()));
        grid->EnableProperty(grid->Append(
            new wxStringProperty(_("Width"), "CAMERA_SIZE_WIDTH" + suffix, gd::String::From(camera.GetWidth()))),
            !camera.UseDefaultSize());
        grid->EnableProperty(grid->Append(
            new wxStringProperty(_("Height"), "CAMERA_SIZE_HEIGHT" + suffix, gd::String::From(camera.GetHeight()))),
            !camera.UseDefaultSize());
        grid->AppendIn(suffix, new wxBoolProperty(_("Custom viewport (native games only)"), "CAMERA_CUSTOM_VIEWPORT" + suffix, !camera.UseDefaultViewport()));
        grid->EnableProperty(grid->Append(
            new wxStringProperty(_("Top-left x"), "CAMERA_VIEWPORT_X1" + suffix, gd::String::From(camera.GetViewportX1()))),
            !camera.UseDefaultViewport());
        grid->EnableProperty(grid->Append(
            new wxStringProperty(_("Top-left y"), "CAMERA_VIEWPORT_Y1" + suffix, gd::String::From(camera.GetViewportY1()))),
            !camera.UseDefaultViewport());
        grid->EnableProperty(grid->Append(
            new wxStringProperty(_("Bottom-right x"), "CAMERA_VIEWPORT_X2" + suffix, gd::String::From(camera.GetViewportX2()))),
            !camera.UseDefaultViewport());
        grid->EnableProperty(grid->Append(
            new wxStringProperty(_("Bottom-right y"), "CAMERA_VIEWPORT_Y2" + suffix, gd::String::From(camera.GetViewportY2()))),
            !camera.UseDefaultViewport());
    }

    grid->SetPropertyAttributeAll(wxPG_BOOL_USE_CHECKBOX, true);
}

bool LayerPropgridHelper::OnPropertySelected(Layer & layer, wxPropertyGridEvent& event)
{
    if (!grid) return false;

    std::map<wxString, std::function<bool(int)>> camerasProperties = {
        {"CAMERA_REMOVE", [&](int cameraIndex) {
            if (layer.GetCameraCount() <= 1)
            {
                gd::LogMessage(_("The layer must have at least one camera."));
                return false;
            }

            layer.DeleteCamera(cameraIndex);
            return true;
        }},
    };

    if (event.GetColumn() == 1) //Manage button-like properties
    {
        if (event.GetPropertyName() ==  "CAMERA_ADD")
        {
            layer.SetCameraCount(layer.GetCameraCount() + 1);
            return true;
        }
        else if (event.GetPropertyName() ==  "HELP")
        {
            gd::HelpFileAccess::Get()->OpenPage("en/game_develop/documentation/manual/editors/scene_editor/edit_layer");
            return false;
        }
        else
        {
            for(auto it : camerasProperties)
            {
                if (event.GetPropertyName().StartsWith(it.first))
                {
                    int cameraId = GetCameraId(event.GetPropertyName());
                    if (cameraId < 0 || cameraId >= layer.GetCameraCount())
                        return false;

                    return it.second(cameraId);
                }
            }
        }
    }

    return false;
}

bool LayerPropgridHelper::OnPropertyChanged(Layer & layer, wxPropertyGridEvent& event)
{
    if (!grid) return false;

    auto validateViewportValue = [&event]() {
        float value = event.GetValue().GetReal();
        if (value < 0 || value > 1)
        {
            gd::LogMessage(_("Viewport values are a factor of the window size, and must be between 0 and 1."));
            event.Veto();
            return false;
        }

        return true;
    };
    auto validateCameraSize = [&event]() {
        int value = event.GetValue().GetInteger();
        if (value <= 0)
        {
            gd::LogMessage(_("A camera should have a size that is at least 1 pixel."));
            event.Veto();
            return false;
        }

        return true;
    };

    std::map<wxString, std::function<bool(int)>> camerasProperties = {
        {"CAMERA_CUSTOM_SIZE", [&](int id) {
            layer.GetCamera(id).SetUseDefaultSize(!event.GetValue().GetBool());
            return true;
        }},
        {"CAMERA_SIZE_WIDTH", [&](int id) {
            if (validateCameraSize())
            {
                layer.GetCamera(id).SetSize(
                    event.GetValue().GetInteger(),
                    layer.GetCamera(id).GetHeight()
                );
            }
            return false;
        }},
        {"CAMERA_SIZE_HEIGHT", [&](int id) {
            if (validateCameraSize())
            {
                layer.GetCamera(id).SetSize(
                    layer.GetCamera(id).GetWidth(),
                    event.GetValue().GetInteger()
                );
            }
            return false;
        }},
        {"CAMERA_CUSTOM_VIEWPORT", [&](int id) {
            layer.GetCamera(id).SetUseDefaultViewport(!event.GetValue().GetBool());
            return true;
        }},
        {"CAMERA_VIEWPORT_X1", [&](int id) {
            if (validateViewportValue())
                layer.GetCamera(id).SetViewportX1(event.GetValue().GetReal());

            return false;
        }},
        {"CAMERA_VIEWPORT_Y1", [&](int id) {
            if (validateViewportValue())
                layer.GetCamera(id).SetViewportY1(event.GetValue().GetReal());

            return false;
        }},
        {"CAMERA_VIEWPORT_X2", [&](int id) {
            if (validateViewportValue())
                layer.GetCamera(id).SetViewportX2(event.GetValue().GetReal());

            return false;
        }},
        {"CAMERA_VIEWPORT_Y2", [&](int id) {
            if (validateViewportValue())
                layer.GetCamera(id).SetViewportY2(event.GetValue().GetReal());

            return false;
        }}
    };

    if (event.GetPropertyName() == "LAYER_VISIBLE")
        layer.SetVisibility(event.GetValue().GetBool());
    else
    {
        for(auto it : camerasProperties)
        {
            if (event.GetPropertyName().StartsWith(it.first))
            {
                int cameraId = GetCameraId(event.GetPropertyName());
                std::cout << cameraId << std::endl;
                if (cameraId < 0 || cameraId >= layer.GetCameraCount())
                    return false;

                return it.second(cameraId);
            }
        }
    }

    return false;
}

}
#endif
