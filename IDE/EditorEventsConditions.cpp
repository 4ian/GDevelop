#include "OldEventsEditor.h"
#include "ChoixCondition.h"
#include "Clipboard.h"

/**
 * Edit a condition
 */
void OldEventsEditor::OneEditConditionMenuSelected(wxCommandEvent& event)
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

        GetLastSelectedEvent()->eventHeightNeedUpdate = true;
        ChangesMadeOnEvents();
    }
}

void OldEventsEditor::OnAddConditionMenuSelected(wxCommandEvent& event)
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

        GetLastSelectedEvent()->eventHeightNeedUpdate = true;
        ChangesMadeOnEvents();
    }
}

void OldEventsEditor::OnDelConditionMenuSelected(wxCommandEvent& event)
{
    if ( !instructionsSelected || boost::tuples::get<3>(eventsSelected[0]) >= GetLastSelectedListOfInstructions()->size() ) return;

    GetLastSelectedListOfInstructions()->erase( GetLastSelectedListOfInstructions()->begin() + boost::tuples::get<3>(eventsSelected[0]) );

    GetLastSelectedEvent()->eventHeightNeedUpdate = true;
    ChangesMadeOnEvents();
}


void OldEventsEditor::OnCopyConditionMenuSelected(wxCommandEvent& event)
{
    if (!instructionsSelected ||
        boost::tuples::get<3>(eventsSelected[0]) >= GetLastSelectedListOfInstructions()->size() ||
        !conditionsSelected ) return;

    Clipboard * clipboard = Clipboard::GetInstance();
    clipboard->SetCondition(GetLastSelectedInstruction());
}

void OldEventsEditor::OnCutConditionMenuSelected(wxCommandEvent& event)
{
    if (!instructionsSelected ||
        boost::tuples::get<3>(eventsSelected[0]) >= GetLastSelectedListOfInstructions()->size() ||
        !conditionsSelected ) return;

    Clipboard * clipboard = Clipboard::GetInstance();
    clipboard->SetCondition(GetLastSelectedInstruction());

    GetLastSelectedListOfInstructions()->erase( GetLastSelectedListOfInstructions()->begin() + boost::tuples::get<3>(eventsSelected[0]) );

    GetLastSelectedEvent()->eventHeightNeedUpdate = true;
    ChangesMadeOnEvents();
}

void OldEventsEditor::OnPasteConditionMenuSelected(wxCommandEvent& event)
{
    if ( !instructionsSelected || !conditionsSelected) return;

    Clipboard * clipboard = Clipboard::GetInstance();
    if ( !clipboard->HasCondition() ) return;

    if ( boost::tuples::get<3>(eventsSelected[0]) >= GetLastSelectedListOfInstructions()->size() )
        GetLastSelectedListOfInstructions()->push_back(clipboard->GetCondition());
    else
        GetLastSelectedListOfInstructions()->insert(GetLastSelectedListOfInstructions()->begin()+boost::tuples::get<3>(eventsSelected[0]), clipboard->GetCondition());

    GetLastSelectedEvent()->eventHeightNeedUpdate = true;
    ChangesMadeOnEvents();
}







