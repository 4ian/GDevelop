/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if !defined(GD_NO_WX_GUI)
#ifndef GDCORE_SKINHELPER_H
#define GDCORE_SKINHELPER_H
#include "GDCore/String.h"
#include <map>
class wxRibbonBar;
class wxAuiManager;
class wxAuiNotebook;
class wxAuiToolBar;
class wxPropertyGrid;
class wxBitmap;
class wxString;

namespace gd
{

/**
 * \brief Provide tool functions to easily apply the current skin or theme to controls supporting it.
 *
 * The skin are loaded from the configuration stored thanks to wxConfigBase. If you use a control supported by one of ApplyCurrentSkin function,
 * you should call it on your control after it has been created.
 *
 * \ingroup IDE
 */
class GD_CORE_API SkinHelper
{
public:

    /**
     * \brief Customize the appearance of a wxRibbonBar.
     */
    static void ApplyCurrentSkin(wxRibbonBar & bar);

    /**
     * \brief Customize the appearance of a wxAuiManager.
     */
    static void ApplyCurrentSkin(wxAuiManager & auiManager);

    /**
     * \brief Customize the appearance of a wxAuiNotebook.
     *
     * \param notebook The notebook to be skinned.
     * \param subnotebook If set to true, the notebook will be considered as being the child of another,
     * so that its background won't have a gradient.
     */
    static void ApplyCurrentSkin(wxAuiNotebook & notebook, bool subnotebook = false);

    /**
     * \brief Customize the appearance of a wxAuiToolBar.
     */
    static void ApplyCurrentSkin(wxAuiToolBar & toolbar);

    /**
     * \brief Customize the appearance of a wxPropertyGrid.
     */
    static void ApplyCurrentSkin(wxPropertyGrid & propertyGrid);

    /**
     * \brief Get an icon for the ribbon.
     *
     * The icon is searched in res/ribbon_[skinName]/[iconName]24.png with 'SkinName' being
     * the name of the selected skin for the ribbon icons.
     * If no such directory or file exists, res/ribbon_default/[iconName].png is used.
     */
    static wxBitmap GetRibbonIcon(wxString iconName);

    /**
     * \brief Get an icon for the interface.
     *
     * The icon is searched in res/icons_[skinName]/[iconName][size].png with 'SkinName' being
     * the name of the selected skin for the ribbon icons.
     * If no such directory or file exists, res/icons_default/[iconName].png is used.
     *
     * Icons are cached after being loaded.
     * \see wxSkinHelper::ClearIconCache
     * \see wxSkinHelper::IconExists
     */
    static wxBitmap GetIcon(wxString iconName, unsigned int size);

    /**
     * \brief Check if an icon exists.
     *
     * The icon is searched in res/icons_[skinName]/[iconName][size].png with 'SkinName' being
     * the name of the selected skin for the ribbon icons.
     * If no such directory or file exists, res/icons_default/[iconName].png is used.
     * If it does not exist, false is returned.
     *
     * \see wxSkinHelper::GetIcon
     */
    static bool IconExists(wxString iconName, unsigned int size);

    /**
     * Clear the cache created when calling GetIcon.
     *
     * Should be called before application shutdown. Note that the cache will be recreated
     * if there is a call to wxSkinHelper::GetIcon
     */
    static void ClearIconCache();

private:
    SkinHelper();
    virtual ~SkinHelper();

    static std::map<gd::String, wxBitmap*> cachedIcons;
};

}

#endif // GDCORE_SKINHELPER_H
#endif
