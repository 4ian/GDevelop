/**

GDevelop - Tile Map Extension
Copyright (c) 2014-2015 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#ifndef TILEMAPOBJECTEDITOR_H
#define TILEMAPOBJECTEDITOR_H

#include "TileMapDialogs.h"

#include <wx/bitmap.h>
#include <wx/cmdproc.h>

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
        virtual void OnRedoToolClicked(wxCommandEvent& event);
        virtual void OnUndoToolClicked(wxCommandEvent& event);
        virtual void OnClearLayerToolClicked(wxCommandEvent& event);
        virtual void OnFillLayerToolClicked(wxCommandEvent& event);
        virtual void OnTileInsertionModeChanged(wxCommandEvent& event);
        virtual void OnCloseButtonClicked(wxCloseEvent& event);
        virtual void OnHelpButtonClicked(wxHyperlinkEvent& event);
        virtual void OnTileEditToolClicked(wxCommandEvent& event);
        virtual void OnChangeMapSizeButtonClicked(wxCommandEvent& event);
        virtual void OnTileSetConfigureButtonClicked(wxCommandEvent& event);
        virtual void OnLayerChoiceChanged(wxCommandEvent& event);
        virtual void OnHideUpperLayerChecked(wxCommandEvent& event);
        virtual void OnCancelButtonPressed(wxCommandEvent& event);
        virtual void OnOkButtonPressed(wxCommandEvent& event);
        void OnTileSetSelectionChanged(TileSelectionEvent &event);
        virtual void OnTmxImportButtonClicked(wxCommandEvent& event);

    private:
        void UpdateLayerChoice();

        bool AskCloseConfirmation();

        gd::Project & game;
        gd::MainFrameWrapper & mainFrameWrapper;
        TileMapObject & object;

        TileSet tileSet;
        TileMap tileMap;

        TileEditor *m_tileEditorPanel;
};

#endif
#endif
