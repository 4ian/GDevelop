/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/String.h"
#include <vector>
#include <map>
#include <memory>
#include "GDCore/IDE/Events/EventsParametersLister.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"

namespace gd
{

bool EventsParametersLister::DoVisitInstruction(gd::Instruction & instruction, bool isCondition)
{
    const gd::InstructionMetadata & instrInfo = isCondition ?
        MetadataProvider::GetConditionMetadata(project.GetCurrentPlatform(), instruction.GetType()) :
        MetadataProvider::GetActionMetadata(project.GetCurrentPlatform(), instruction.GetType());

    for (int i = 0; i < instruction.GetParametersCount() && i < instrInfo.GetParametersCount(); ++i)
        parameters[instruction.GetParameter(i).GetPlainString()] = instrInfo.GetParameter(i).GetType();

    return false;
}

EventsParametersLister::~EventsParametersLister()
{
}

}
