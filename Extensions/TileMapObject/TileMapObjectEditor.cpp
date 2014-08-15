/**

Game Develop - Tiled Sprite Extension
Copyright (c) 2012 Victor Levasseur (victorlevasseur01@orange.fr)
Copyright (c) 2014 Florian Rival (Florian.Rival@gmail.com)

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

#include <wx/dcclient.h>
#include <wx/dcmemory.h>
#include <wx/dcbuffer.h>
#include <wx/textdlg.h> 

#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/SkinHelper.h"
#include "GDCpp/Project.h"
#include "GDCpp/CommonTools.h"
#include "GDCore/IDE/Dialogs/ResourcesEditor.h"
#include "GDCore/IDE/CommonBitmapManager.h"
#include "TileMapObjectEditor.h"
#include "TileMapObject.h"

#include <iostream>

TileMapObjectEditor::TileMapObjectEditor( wxWindow* parent, gd::Project & game_, TileMapObject & object_, gd::MainFrameWrapper & mainFrameWrapper_ ) :
TileMapObjectEditorBase(parent),
game(game_),
mainFrameWrapper(mainFrameWrapper_),
object(object_),
tileSet(),
tileMap()
{
    m_tileSetPanel->SetTileSet(&tileSet);
    m_tileMapPanel->SetTileSet(&tileSet);
    m_tileMapPanel->SetTileMap(&tileMap);
    m_tileSetPanel->Connect(TILE_SELECTION_CHANGED, TileSelectionEventHandler(TileMapObjectEditor::OnTileSetSelectionChanged), NULL, this);

    UpdateLayerChoice();
}

TileMapObjectEditor::~TileMapObjectEditor()
{
}

void TileMapObjectEditor::OnTileSetPanelErase(wxEraseEvent& event)
{

}

void TileMapObjectEditor::OnTileSetPanelPaint(wxPaintEvent& event)
{
    
}

void TileMapObjectEditor::OnUpdateClicked(wxCommandEvent& event)
{
    std::string imageName = ToString(m_imageNameTextCtrl->GetValue());
    tileSet.textureName = imageName;
    tileSet.tileSize.x = m_tileWidthSpin->GetValue();
    tileSet.tileSize.y = m_tileHeightSpin->GetValue();
    tileSet.tileSpacing.x = m_horizontalMarginsSpin->GetValue();
    tileSet.tileSpacing.y = m_verticalMarginsSpin->GetValue();
    tileSet.LoadResources(game);
    tileSet.Generate();

    m_tileSetPanel->Update();
    m_tileMapPanel->Update();
}

void TileMapObjectEditor::OnMapUpdateButtonClicked(wxCommandEvent& event)
{
    tileMap.SetSize(m_mapWidthSpin->GetValue(), m_mapHeightSpin->GetValue());
    m_tileMapPanel->Update();
}

void TileMapObjectEditor::OnLayerChoiceChanged(wxCommandEvent& event)
{
    m_tileMapPanel->SetCurrentLayer(m_layerChoice->GetSelection());
}

void TileMapObjectEditor::OnHideUpperLayerChecked(wxCommandEvent& event)
{
    m_tileMapPanel->HideUpperLayers(m_hideUpperLayerCheck->GetValue());
}

void TileMapObjectEditor::OnTileSetSelectionChanged(TileSelectionEvent &event)
{
    m_tileMapPanel->OnTileSetSelectionChanged(event);
}

void TileMapObjectEditor::UpdateLayerChoice()
{
    m_layerChoice->SetSelection(m_tileMapPanel->GetCurrentLayer());
}

#endif

