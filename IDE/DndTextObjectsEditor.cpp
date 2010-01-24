#include <wx/log.h>

#include "DndTextObjectsEditor.h"
#include "EditorObjectList.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/SpriteObject.h"

/**
 * Create a object with an initial image
 */
bool DndTextObjectsEditor::OnDropText(wxCoord x, wxCoord y, const wxString& text)
{
    //TODO : Remake me in GDL Fahsion
    /*gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();

    if ( extensionsManager->GetTypeIdFromString("Sprite") == 0 )
        return true; //No such extension loaded.

    boost::shared_ptr<SpriteObject> object = boost::static_pointer_cast<SpriteObject>(
                                                extensionsManager->CreateObject(extensionsManager->GetTypeIdFromString("Sprite"),
                                                                                string(text.mb_str())));

    Sprite sprite;
    sprite.SetImage(string(text.mb_str()));

    Animation animation;
    animation.SetDirectionsNumber(8);
    animation.GetDirectionToModify(0).AddSprite(sprite);
    object->AddAnimation( animation );

    editor.objects->push_back( object );

    editor.Refresh();*/

    return true;
}
