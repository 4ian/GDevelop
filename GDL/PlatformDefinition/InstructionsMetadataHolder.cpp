/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include "InstructionsMetadataHolder.h"
#include "GDL/ExtensionsManager.h"

InstructionsMetadataHolder::InstructionsMetadataHolder()
{
}

InstructionsMetadataHolder::~InstructionsMetadataHolder()
{
    //dtor
}

const gd::InstructionMetadata & InstructionsMetadataHolder::GetActionMetadata(std::string actionType) const
{
    return GDpriv::ExtensionsManager::GetInstance()->GetActionInfos(actionType);
}

const gd::InstructionMetadata & InstructionsMetadataHolder::GetConditionMetadata(std::string conditionType) const
{
    return GDpriv::ExtensionsManager::GetInstance()->GetConditionInfos(conditionType);
}

#endif
