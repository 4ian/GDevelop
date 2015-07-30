#ifndef TEXTOBJECTEDITOR_H
#define TEXTOBJECTEDITOR_H
#include "TextObjectDialogs.h"

namespace gd { class Project; }
class TextObject;
namespace gd { class MainFrameWrapper; }

class TextObjectEditor : public TextObjectEditorBase
{
public:
    TextObjectEditor(wxWindow *parent, gd::Project &game, TextObject &object, gd::MainFrameWrapper &mainFrameWrapper);
    virtual ~TextObjectEditor();

private:
    gd::Project & game;
    TextObject & object;
    gd::MainFrameWrapper & mainFrameWrapper;

    wxColour textColor;
    wxBitmap colorBitmap;
protected:
    virtual void OnHelpBtClicked(wxHyperlinkEvent& event);
    virtual void OnChangeFontButton(wxCommandEvent& event);
    virtual void OnBoldToolClicked(wxCommandEvent& event);
    virtual void OnItalicToolClicked(wxCommandEvent& event);
    virtual void OnUnderlineToolClicked(wxCommandEvent& event);
    virtual void OnOkBtClicked(wxCommandEvent& event);
    virtual void OnSizeComboboxSelectionChanged(wxCommandEvent& event);
    virtual void OnSizeComboboxUpdated(wxCommandEvent& event);
    virtual void OnColorToolClicked(wxCommandEvent& event);
    void UpdateColorBt();
    void UpdatePreview();
};
#endif // TEXTOBJECTEDITOR_H
