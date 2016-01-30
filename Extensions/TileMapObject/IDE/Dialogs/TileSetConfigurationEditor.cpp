/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include "TileSetConfigurationEditor.h"

#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/ResourcesEditor.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "GDCpp/Runtime/Project/Project.h"

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

void TileSetConfigurationEditor::UpdatePreviewTileSetPanel(bool newTexture)
{
    previewTileSet.textureName = m_textureNameTextCtrl->GetValue();
    std::cout << "Reloading texture..." << std::endl;
    previewTileSet.LoadResources(game);
    std::cout << "OK." << std::endl;

    if(newTexture)
    {
        //If the texture has changed, put default values for tile size/spacing
        m_tileWidthSpin->SetValue(std::max(1.f, static_cast<float>(previewTileSet.GetSize().x)/10.f));
        m_tileHeightSpin->SetValue(std::max(1.f, static_cast<float>(previewTileSet.GetSize().y)/10.f));
    }
    previewTileSet.tileSize.x = m_tileWidthSpin->GetValue();
    previewTileSet.tileSize.y = m_tileHeightSpin->GetValue();
    previewTileSet.tileSpacing.x = m_spacingWidthSpin->GetValue();
    previewTileSet.tileSpacing.y = m_spacingHeightSpin->GetValue();

    if(previewTileSet.GetSize().x >= 1 && previewTileSet.GetSize().y >= 1)
    {
        m_tileWidthSpin->SetRange(1, previewTileSet.GetSize().x);
        m_tileHeightSpin->SetRange(1, previewTileSet.GetSize().y);
    }
    else
    {
        m_tileWidthSpin->SetRange(1, 1);
        m_tileHeightSpin->SetRange(1, 1);
    }

    m_tileSetPreviewPanel->Refresh();
}

void TileSetConfigurationEditor::OnSetTextureButtonClicked(wxCommandEvent& event)
{
    if ( !m_auimgr->GetPane(resourcesEditorPnl).IsShown() )
    {
        gd::LogMessage(_("Please display the image bank's editor and select an image before clicking on this button."));
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
    tileSet.textureName = m_textureNameTextCtrl->GetValue();
    tileSet.tileSize.x = m_tileWidthSpin->GetValue();
    tileSet.tileSize.y = m_tileHeightSpin->GetValue();
    tileSet.tileSpacing.x = m_spacingWidthSpin->GetValue();
    tileSet.tileSpacing.y = m_spacingHeightSpin->GetValue();

    EndModal(1);
}

void TileSetConfigurationEditor::OnTileSetTextureUpdated(wxCommandEvent& event)
{
    UpdatePreviewTileSetPanel(true);
}

void TileSetConfigurationEditor::OnTileSetParameterUpdated(wxSpinEvent& event)
{
    UpdatePreviewTileSetPanel();
}

void TileSetConfigurationEditor::OnHelpButtonClicked(wxHyperlinkEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/built_tilemap/tilesetconfig");
}

#endif
