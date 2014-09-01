/**

Game Develop - Tiled Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2013-2014 Florian Rival (Florian.Rival@gmail.com)

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

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef TILEMAPOBJECTEDITOR_H
#define TILEMAPOBJECTEDITOR_H

#include "TileMapDialogs.h"

#include <wx/bitmap.h>

#include "TileMap.h"
#include "TileSet.h"

namespace gd { class Project; }
class TileMapObject;
namespace gd { class MainFrameWrapper; }
class ResourcesEditor;
class TileEditor;

class TileMapObjectEditor: public TileMapObjectEditorBase
{
    public:

        TileMapObjectEditor( wxWindow* parent, gd::Project & game_, TileMapObject & object_, gd::MainFrameWrapper & mainFrameWrapper_ );
        virtual ~TileMapObjectEditor();

    protected:
    virtual void OnHelpButtonClicked(wxHyperlinkEvent& event);
    virtual void OnTileEditToolClicked(wxCommandEvent& event);
        virtual void OnChangeMapSizeButtonClicked(wxCommandEvent& event);
        virtual void OnTileSetConfigureButtonClicked(wxCommandEvent& event);
        virtual void OnLayerChoiceChanged(wxCommandEvent& event);
        virtual void OnHideUpperLayerChecked(wxCommandEvent& event);
        virtual void OnCancelButtonPressed(wxCommandEvent& event);
        virtual void OnOkButtonPressed(wxCommandEvent& event);
        void OnTileSetSelectionChanged(TileSelectionEvent &event);

    private:
        void UpdateLayerChoice();

        gd::Project & game;
        gd::MainFrameWrapper & mainFrameWrapper;
        TileMapObject & object;

        TileSet tileSet;
        TileMap tileMap;

        TileEditor *m_tileEditorPanel;
};

#endif
#endif

