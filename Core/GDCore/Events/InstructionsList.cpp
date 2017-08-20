/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "InstructionsList.h"
#include "GDCore/Project/Project.h"
#include "Serialization.h"

namespace gd
{

void InstructionsList::SerializeTo(SerializerElement & element) const
{
	EventsListSerialization::SerializeInstructionsTo(*this, element);
}

void InstructionsList::UnserializeFrom(gd::Project & project, const SerializerElement & element)
{
	EventsListSerialization::UnserializeInstructionsFrom(project, *this, element);
}

}
