/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_DYNAMIC_EXTENSIONS)
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
        wxString userMsg = string(_("Impossible de charger le code." ));
        wxMessageBox(userMsg, _("Impossible de charger le code"), wxOK | wxICON_ERROR);
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
            wxString userMsg = string(_("L'extension dynamique "))+ fullpath + string(_(" est invalide." ));
            wxMessageBox(userMsg, _("Extension non compatible"), wxOK | wxICON_ERROR);
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
    cout << "CreateEvent for" << name << endl;
    for (unsigned int i =0;i<dynamicExtensionsLoaded.size();++i)
    {
        if ( dynamicExtensionsLoaded[i].second->callableEvents.find(name) != dynamicExtensionsLoaded[i].second->callableEvents.end() )
            return dynamicExtensionsLoaded[i].second->callableEvents.find(name)->second;
    }

    return boost::shared_ptr<BaseEvent>();
}

bool DynamicExtensionsManager::HasEvent(std::string name) const
{
    cout << "HasEvent for" << name << endl;
    for (unsigned int i =0;i<dynamicExtensionsLoaded.size();++i)
    {
        if ( dynamicExtensionsLoaded[i].second->callableEvents.find(name) != dynamicExtensionsLoaded[i].second->callableEvents.end() )
            return true;
    }
    cout << "False" << endl;

    return false;
}
#endif
