/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)
#include <wx/log.h>
#include <wx/msgdlg.h>
#endif
#include "DynamicExtensionsManager.h"

using namespace GDpriv;

typedef DynamicExtensionBase* (*createDynamicExtension)();
typedef void (*destroyDynamicExtension)(DynamicExtensionBase*);

DynamicExtensionsManager *DynamicExtensionsManager::_singleton = NULL;

bool DynamicExtensionsManager::LoadDynamicExtension(std::string fullpath)
{
    Handle extensionHdl = OpenLibrary(fullpath.c_str());
    if (extensionHdl == NULL)
    {
        cout << "Unable to load dynamic extension " << fullpath << "." << endl;
        #if defined(GD_IDE_ONLY)
        wxString userMsg = string(_("Impossible de charger le code : Vérifiez que la compilation se soit deroulée avec succès." ));
        wxMessageBox(userMsg, _("Impossible de charger le code C++."), wxOK | wxICON_ERROR);
        #endif
    }
    else
    {
        createDynamicExtension create_extension = (createDynamicExtension)GetSymbol(extensionHdl, "CreateGDDynamicExtension");
        destroyDynamicExtension destroy_extension = (destroyDynamicExtension)GetSymbol(extensionHdl, "DestroyGDDynamicExtension");

        if ( create_extension == NULL || destroy_extension == NULL )
        {
            cout << "Unable to load dynamic extension " << fullpath << " ( no valid create/destroy functions )." << endl;

            #if defined(GD_IDE_ONLY)
            CloseLibrary(extensionHdl);
            wxString userMsg = string(_("Aucun fichier de déclaration n'a été trouvé pour le code C++ : Insérez en un au projet à l'aide de la fenêtre de création de fichiers sources." ));
            wxMessageBox(userMsg, _("Code C++ manquant."), wxOK | wxICON_ERROR);
            #endif
        }
        else
        {
            DynamicExtensionBase * extensionPtr = create_extension();
            boost::shared_ptr<DynamicExtensionBase> extension(extensionPtr, destroy_extension);

            //Do not perform safety check as dynamic libraries are compiled within GD

            cout << "Loaded " << fullpath << "." << endl;
            dynamicExtensionsLoaded.push_back(std::make_pair(extensionHdl, extension));
            return true;
        }
    }

    return false;
}

void DynamicExtensionsManager::UnloadAllDynamicExtensions()
{
    //Inventory libraries to close
    cout << "Closing..." << endl;
    std::vector<Handle> librariesToClose;
    for (unsigned int i =0;i<dynamicExtensionsLoaded.size();++i)
        librariesToClose.push_back(dynamicExtensionsLoaded[i].first);

    //Suppress libraries from list and close them AFTER.
    dynamicExtensionsLoaded.clear();
    for (unsigned int i = 0;i<librariesToClose.size();++i)
        CloseLibrary(librariesToClose[i]);

    cout << "Unloaded all dynamic extensions." << endl;
}

boost::shared_ptr<BaseEvent> DynamicExtensionsManager::CreateEvent(std::string name) const
{
    for (unsigned int i =0;i<dynamicExtensionsLoaded.size();++i)
    {
        if ( dynamicExtensionsLoaded[i].second->callableEvents.find(name) != dynamicExtensionsLoaded[i].second->callableEvents.end() )
            return dynamicExtensionsLoaded[i].second->callableEvents.find(name)->second;
    }

    return boost::shared_ptr<BaseEvent>();
}

bool DynamicExtensionsManager::HasEvent(std::string name) const
{
    for (unsigned int i =0;i<dynamicExtensionsLoaded.size();++i)
    {
        if ( dynamicExtensionsLoaded[i].second->callableEvents.find(name) != dynamicExtensionsLoaded[i].second->callableEvents.end() )
            return true;
    }

    return false;
}
#endif
