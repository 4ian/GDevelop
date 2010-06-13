#include "EditorEvents.h"
#include "ChoixCondition.h"
#include "Clipboard.h"

/**
 * Edit a condition
 */
void EditorEvents::OneEditConditionMenuSelected(wxCommandEvent& event)
{
    if ( !instructionsSelected ) return;

    Instruction & instr = GetLastSelectedInstruction();

    ChoixCondition dialog(this, game, scene);
    dialog.Type = instr.GetType(); // On rafraichit la fenêtre
    dialog.Param = instr.GetParameters(); // avec la condition
    dialog.Loc = instr.IsLocal();
    dialog.Contraire = instr.IsInverted();
    dialog.RefreshFromCondition();
    dialog.Fit();

    if ( dialog.ShowModal() == 0)
    {
        instr.SetType( dialog.Type );
        instr.SetParameters( dialog.Param );
        instr.SetLocal( dialog.Loc );
        instr.SetInversion( dialog.Contraire );

        ChangesMadeOnEvents();
    }
}

void EditorEvents::OnAddConditionMenuSelected(wxCommandEvent& event)
{
    if ( !instructionsSelected ) return;

    ChoixCondition dialog(this, game, scene);
    if ( dialog.ShowModal() == 0)
    {
        Instruction instruction;
        instruction.SetType(dialog.Type);
        instruction.SetParameters(dialog.Param);
        instruction.SetLocal(dialog.Loc);
        instruction.SetInversion(dialog.Contraire);

        GetLastSelectedListOfInstructions()->push_back(instruction);

        ChangesMadeOnEvents();
    }
}

void EditorEvents::OnDelConditionMenuSelected(wxCommandEvent& event)
{
    if ( !instructionsSelected || boost::tuples::get<3>(eventsSelected[0]) >= GetLastSelectedListOfInstructions()->size() ) return;

    GetLastSelectedListOfInstructions()->erase( GetLastSelectedListOfInstructions()->begin() + boost::tuples::get<3>(eventsSelected[0]) );

    ChangesMadeOnEvents();
}


void EditorEvents::OnCopyConditionMenuSelected(wxCommandEvent& event)
{
    if (!instructionsSelected ||
        boost::tuples::get<3>(eventsSelected[0]) >= GetLastSelectedListOfInstructions()->size() ||
        !conditionsSelected ) return;

    Clipboard * clipboard = Clipboard::getInstance();
    clipboard->SetCondition(GetLastSelectedInstruction());
}

void EditorEvents::OnCutConditionMenuSelected(wxCommandEvent& event)
{
    if (!instructionsSelected ||
        boost::tuples::get<3>(eventsSelected[0]) >= GetLastSelectedListOfInstructions()->size() ||
        !conditionsSelected ) return;

    Clipboard * clipboard = Clipboard::getInstance();
    clipboard->SetCondition(GetLastSelectedInstruction());

    GetLastSelectedListOfInstructions()->erase( GetLastSelectedListOfInstructions()->begin() + boost::tuples::get<3>(eventsSelected[0]) );

    ChangesMadeOnEvents();
}

void EditorEvents::OnPasteConditionMenuSelected(wxCommandEvent& event)
{
    if ( !instructionsSelected || !conditionsSelected) return;

    Clipboard * clipboard = Clipboard::getInstance();
    if ( !clipboard->HasCondition() ) return;

    if ( boost::tuples::get<3>(eventsSelected[0]) >= GetLastSelectedListOfInstructions()->size() )
        GetLastSelectedListOfInstructions()->push_back(clipboard->GetCondition());
    else
        GetLastSelectedListOfInstructions()->insert(GetLastSelectedListOfInstructions()->begin()+boost::tuples::get<3>(eventsSelected[0]), clipboard->GetCondition());

    ChangesMadeOnEvents();
}
