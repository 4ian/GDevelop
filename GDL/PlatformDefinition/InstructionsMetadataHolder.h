/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)

#ifndef InstructionsMetadataHolder_H
#define InstructionsMetadataHolder_H
#include <string>
#include "GDCore/PlatformDefinition/InstructionsMetadataHolder.h"

/**
 * \brief (Currently) A simple wrapper around ExtensionsManager ( which currently take care of instruction metadata ).
 */
class GD_API InstructionsMetadataHolder : public gd::InstructionsMetadataHolder
{
public:
    InstructionsMetadataHolder();
    virtual ~InstructionsMetadataHolder();

    /**
     * Get information about an action from its type
     * Works for object, automatisms and static actions.
     */
    virtual const InstructionMetadata & GetActionMetadata(std::string actionType) const;

    /**
     * Get information about a condition from its type
     * Works for object, automatisms and static conditions.
     */
    virtual const InstructionMetadata & GetConditionMetadata(std::string conditionType) const;
};

#endif // InstructionsMetadataHolder_H

#endif
