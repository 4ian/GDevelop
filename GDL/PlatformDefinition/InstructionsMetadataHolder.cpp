#include "InstructionsMetadataHolder.h"
#include "GDL/ExtensionsManager.h"

InstructionsMetadataHolder::InstructionsMetadataHolder()
{
}

InstructionsMetadataHolder::~InstructionsMetadataHolder()
{
    //dtor
}

const InstructionMetadata & InstructionsMetadataHolder::GetActionMetadata(std::string actionType) const
{
    return GDpriv::ExtensionsManager::GetInstance()->GetActionInfos(actionType);
}

const InstructionMetadata & InstructionsMetadataHolder::GetConditionMetadata(std::string conditionType) const
{
    return GDpriv::ExtensionsManager::GetInstance()->GetConditionInfos(conditionType);
}
