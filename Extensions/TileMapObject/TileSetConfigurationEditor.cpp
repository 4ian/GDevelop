/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2015 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#include "TileSetConfigurationEditor.h"

#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/ResourcesEditor.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCpp/Project.h"

TileSetConfigurationEditor::TileSetConfigurationEditor(wxWindow* parent, TileSet &tileSet_, gd::Project & game_, gd::MainFrameWrapper & mainFrameWrapper) :
    TileSetConfigurationEditorBase(parent),
    tileSet(tileSet_),
    game(game_),
    previewTileSet(tileSet),
    resourcesEditorPnl(new ResourcesEditor(this, game, mainFrameWrapper))
{
    resourcesEditorPnl->Refresh();

    m_auimgr->AddPane( resourcesEditorPnl, wxAuiPaneInfo().Name( "ResourcesEditor" )
      .Left()
      .CloseButton(false)
      .Caption(_( "Images bank's editor" ))
      .MaximizeButton( true )
      .MinimizeButton( false )
      .CaptionVisible(true)
      .MinSize(50, 50)
      .BestSize(230,100)
      .Show(true)
    );

    m_auimgr->Update();

    m_textureNameTextCtrl->SetValue(tileSet.textureName);
    m_tileWidthSpin->SetValue(tileSet.tileSize.x);
    m_tileHeightSpin->SetValue(tileSet.tileSize.y);
    m_spacingWidthSpin->SetValue(tileSet.tileSpacing.x);
    m_spacingHeightSpin->SetValue(tileSet.tileSpacing.y);

    //Set the preview tileset to the preview panel
    m_tileSetPreviewPanel->SetTileSet(&previewTileSet);
    UpdatePreviewTileSetPanel();

    //Realize the resource editor toolbar again
    resourcesEditorPnl->toolbar->Realize();
}

TileSetConfigurationEditor::~TileSetConfigurationEditor()
{

}

void TileSetConfigurationEditor::UpdatePreviewTileSetPanel()
{
    previewTileSet.textureName = gd::ToString(m_textureNameTextCtrl->GetValue());
    previewTileSet.tileSize.x = m_tileWidthSpin->GetValue();
    previewTileSet.tileSize.y = m_tileHeightSpin->GetValue();
    previewTileSet.tileSpacing.x = m_spacingWidthSpin->GetValue();
    previewTileSet.tileSpacing.y = m_spacingHeightSpin->GetValue();

    previewTileSet.LoadResources(game);
    previewTileSet.Generate();

    m_tileSetPreviewPanel->Refresh();
}

void TileSetConfigurationEditor::OnSetTextureButtonClicked(wxCommandEvent& event)
{
    if ( !m_auimgr->GetPane(resourcesEditorPnl).IsShown() )
    {
        gd::LogMessage(GD_T("Please display the image bank's editor and select an image before clicking on this button."));
        return;
    }

    m_textureNameTextCtrl->SetValue(resourcesEditorPnl->resourcesTree->GetItemText(resourcesEditorPnl->m_itemSelected));
    OnTileSetTextureUpdated(event); //Update the tileset preview
}

void TileSetConfigurationEditor::OnCancelButtonClicked(wxCommandEvent& event)
{
    EndModal(0);
}

void TileSetConfigurationEditor::OnOkButtonClicked(wxCommandEvent& event)
{
    tileSet.textureName = gd::ToString(m_textureNameTextCtrl->GetValue());
    tileSet.tileSize.x = m_tileWidthSpin->GetValue();
    tileSet.tileSize.y = m_tileHeightSpin->GetValue();
    tileSet.tileSpacing.x = m_spacingWidthSpin->GetValue();
    tileSet.tileSpacing.y = m_spacingHeightSpin->GetValue();

    EndModal(1);
}

void TileSetConfigurationEditor::OnTileSetTextureUpdated(wxCommandEvent& event)
{
    UpdatePreviewTileSetPanel();
}

void TileSetConfigurationEditor::OnTileSetParameterUpdated(wxSpinEvent& event)
{
    UpdatePreviewTileSetPanel();
}

void TileSetConfigurationEditor::OnHelpButtonClicked(wxHyperlinkEvent& event)
{
    gd::HelpFileAccess::Get()->OpenURL(GD_T("http://www.wiki.compilgames.net/doku.php/en/game_develop/documentation/manual/built_tilemap/tilesetconfig"));
}
