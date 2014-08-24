#include "TileSetConfigurationEditor.h"

#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/ResourcesEditor.h"
#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/Localization.h"

TileSetConfigurationEditor::TileSetConfigurationEditor(wxWindow* parent, TileSet &tileSet_, gd::Project & game, gd::MainFrameWrapper & mainFrameWrapper) : 
	TileSetConfigurationEditorBase(parent),
	tileSet(tileSet_),
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

    //Realize the resource editor toolbar again
    resourcesEditorPnl->toolbar->Realize();
}

TileSetConfigurationEditor::~TileSetConfigurationEditor()
{
}

void TileSetConfigurationEditor::OnSetTextureButtonClicked(wxCommandEvent& event)
{
	if ( !m_auimgr->GetPane(resourcesEditorPnl).IsShown() )
    {
        gd::LogMessage(_("Please display the image bank's editor and select an image before clicking on this button."));
        return;
    }

    m_textureNameTextCtrl->SetValue(resourcesEditorPnl->resourcesTree->GetItemText(resourcesEditorPnl->m_itemSelected));
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
