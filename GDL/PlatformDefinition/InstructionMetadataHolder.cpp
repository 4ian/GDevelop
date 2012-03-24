#include "InstructionMetadataHolder.h"
#include "GDL/ExtensionsManager.h"

InstructionMetadataHolder::InstructionMetadataHolder()
{
}

InstructionMetadataHolder::~InstructionMetadataHolder()
{
    //dtor
}

const InstructionMetadata & InstructionMetadataHolder::GetActionMetadata(std::string actionType) const
{
    return GDpriv::ExtensionsManager::GetInstance()->GetActionInfos(actionType);
}

const InstructionMetadata & InstructionMetadataHolder::GetConditionMetadata(std::string conditionType) const
{
    return GDpriv::ExtensionsManager::GetInstance()->GetConditionInfos(conditionType);
}
