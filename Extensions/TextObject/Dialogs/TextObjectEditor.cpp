#include "TextObjectEditor.h"

#include <wx/colordlg.h>
#include <wx/filename.h>
#include <wx/filedlg.h>

#include "../TextObject.h"
#include "GDCore/CommonTools.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/Tools/HelpFileAccess.h"

TextObjectEditor::TextObjectEditor(wxWindow *parent, gd::Project &game, TextObject &object, gd::MainFrameWrapper &mainFrameWrapper)
    : TextObjectEditorBase(parent),
    game(game),
    object(object),
    mainFrameWrapper(mainFrameWrapper)
{
    //Auto adjust toolbar size to the combobox default size (because of the size difference between Windows and GTK+)
    int toolbarHeight = 29;
    int oldComboBoxHeight = m_fontTextCtrl->GetClientSize().GetHeight()-1;

    while(oldComboBoxHeight != m_fontTextCtrl->GetClientSize().GetHeight())
    {
        oldComboBoxHeight = m_fontTextCtrl->GetClientSize().GetHeight();

        toolbarHeight+=2;
        m_auimgr->GetPane(m_toolbar).BestSize(-1, toolbarHeight);
        m_auimgr->Update();
        m_fontTextCtrl->Update();
    }

    //Update from the text object
    m_textCtrl->SetValue(object.GetString());
    m_fontTextCtrl->SetValue(object.GetFontFilename());
    m_sizeCombobox->SetValue(gd::String::From<float>(object.GetCharacterSize()));
    textColor = wxColour(object.GetColorR(), object.GetColorG(), object.GetColorB());
    m_toolbar->ToggleTool(BOLD_TOOL_ID, object.IsBold());
    m_toolbar->ToggleTool(ITALIC_TOOL_ID, object.IsItalic());
    m_toolbar->ToggleTool(UNDER_TOOL_ID, object.IsUnderlined());

    //Set the toolbar style
    gd::SkinHelper::ApplyCurrentSkin(*m_auimgr);
    gd::SkinHelper::ApplyCurrentSkin(*m_toolbar);

    UpdateColorBt();
    UpdatePreview();
}

TextObjectEditor::~TextObjectEditor()
{
}

void TextObjectEditor::OnOkBtClicked(wxCommandEvent& event)
{
    //Update the text object
    object.SetString(m_textCtrl->GetValue());
    object.SetFontFilename(m_fontTextCtrl->GetValue());
    object.SetCharacterSize(gd::String(m_sizeCombobox->GetValue()).To<float>());
    object.SetColor(textColor.Red(), textColor.Green(), textColor.Blue());
    object.SetBold(m_toolbar->GetToolToggled(BOLD_TOOL_ID));
    object.SetItalic(m_toolbar->GetToolToggled(ITALIC_TOOL_ID));
    object.SetUnderlined(m_toolbar->GetToolToggled(UNDER_TOOL_ID));

    EndModal(1);
}

void TextObjectEditor::UpdateColorBt()
{
    wxImage colorImage(16, 16);
    colorImage.SetRGB(wxRect(0, 0, 16, 16), textColor.Red(), textColor.Green(), textColor.Blue());

    colorBitmap = wxBitmap(colorImage);

    m_toolbar->FindTool(COLOR_TOOL_ID)->SetBitmap(colorBitmap);
    m_toolbar->Refresh();
}

void TextObjectEditor::UpdatePreview()
{
    wxFont textFont = m_textCtrl->GetFont();

    //Change the font size
    textFont.SetPointSize(gd::String(m_sizeCombobox->GetValue()).To<float>() * 0.75f);

    //Change font color
    m_textCtrl->SetForegroundColour(textColor);
    //Adapt the background color
    wxColour bgColor;
    if(textColor.Red() + textColor.Green() + textColor.Blue() < 500)
        bgColor = wxColour(255, 255, 255);
    else
        bgColor = wxColour(0, 0, 0);
    m_textCtrl->SetBackgroundColour(bgColor);

    //Change font style
    textFont.SetWeight(m_toolbar->GetToolToggled(BOLD_TOOL_ID) ? wxFONTWEIGHT_BOLD : wxFONTWEIGHT_NORMAL);
    textFont.SetStyle(m_toolbar->GetToolToggled(ITALIC_TOOL_ID) ? wxFONTSTYLE_ITALIC : wxFONTSTYLE_NORMAL);
    textFont.SetUnderlined(m_toolbar->GetToolToggled(UNDER_TOOL_ID));

    #if defined(LINUX) //Need to force the background color for already written characters on GTK+
    wxTextAttr textStyle;
    m_textCtrl->GetStyle(0, textStyle);
    textStyle.SetBackgroundColour(bgColor);
    textStyle.SetTextColour(textColor);
    m_textCtrl->SetStyle(0, m_textCtrl->GetValue().size(), textStyle);
    #endif

    m_textCtrl->SetFont(textFont);
}

void TextObjectEditor::OnColorToolClicked(wxCommandEvent& event)
{
    textColor = wxGetColourFromUser(this, textColor);

    UpdateColorBt();
    UpdatePreview();

    m_textCtrl->Refresh();
}

void TextObjectEditor::OnSizeComboboxSelectionChanged(wxCommandEvent& event)
{
    UpdatePreview();
}

void TextObjectEditor::OnSizeComboboxUpdated(wxCommandEvent& event)
{
    UpdatePreview();
}

void TextObjectEditor::OnBoldToolClicked(wxCommandEvent& event)
{
    UpdatePreview();
}

void TextObjectEditor::OnItalicToolClicked(wxCommandEvent& event)
{
    UpdatePreview();
}

void TextObjectEditor::OnUnderlineToolClicked(wxCommandEvent& event)
{
    UpdatePreview();
}

void TextObjectEditor::OnChangeFontButton(wxCommandEvent& event)
{
    wxString gameDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();
    wxFileDialog fileDialog(this, _("Choose a font ( ttf/ttc files )"), gameDirectory, "", "Polices (*.ttf, *.ttc)|*.ttf;*.ttc");

    if ( fileDialog.ShowModal() == wxID_OK )
    {
        //Note that the file is relative to the project directory
        wxFileName filename(fileDialog.GetPath()); filename.MakeRelativeTo(gameDirectory);
        m_fontTextCtrl->SetValue(filename.GetFullPath());
        m_fontTextCtrl->Refresh();
    }
    else
    {
        m_fontTextCtrl->SetValue("");
    }

    UpdatePreview();
}

void TextObjectEditor::OnHelpBtClicked(wxHyperlinkEvent& event)
{
    gd::HelpFileAccess::Get()->OpenURL(_("http://wiki.compilgames.net/doku.php/gdevelop/documentation/manual/built_text"));
}
