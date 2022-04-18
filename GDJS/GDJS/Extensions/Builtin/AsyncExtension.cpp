/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AsyncExtension.h"

#include "GDCore/Events/Builtin/AsyncEvent.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"

namespace gdjs {

AsyncExtension::AsyncExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsAsyncExtension(*this);

  GetAllEvents()["Async::Async"].SetCodeGenerator(
      [](gd::BaseEvent &event_, gd::EventsCodeGenerator &codeGenerator,
         gd::EventsCodeGenerationContext &parentContext) {
        gd::AsyncEvent &event = dynamic_cast<gd::AsyncEvent &>(event_);

        // Generate callback code
        const auto callbackDescriptor = codeGenerator.GenerateCallback(
            gd::String::From(codeGenerator.GenerateSingleUsageUniqueIdFor(
                event.GetInstruction().GetOriginalInstruction().lock().get())),
            parentContext, event.GetActions(),
            event.HasSubEvents() ? &event.GetSubEvents() : nullptr);

        // Generate code to backup the objects lists
        gd::String objectsListsBackupCode =
            parentContext.IsAsync()
                ? "asyncObjectsList = "
                  "gdjs.LongLivedObjectsList.from(asyncObjectsList);\n"
                : "const asyncObjectsList = new gdjs.LongLivedObjectsList();\n";
        for (const gd::String &objectNameToBackup :
             callbackDescriptor.requiredObjects) {
          objectsListsBackupCode +=
              "for (const obj of " +
              codeGenerator.GetObjectListName(objectNameToBackup, parentContext) +
              ") asyncObjectsList.addObject(" +
              codeGenerator.ConvertToStringExplicit(objectNameToBackup) +
              ", obj);\n";
        }

        const gd::String callbackCallCode =
            "(runtimeScene) => (" + callbackDescriptor.functionName + "(" +
            callbackDescriptor.argumentsList + "))";

        // Generate the action and store the generated task.
        const gd::String asyncActionCode = codeGenerator.GenerateActionCode(
            event.GetInstruction(), parentContext, callbackCallCode);

        return "{" + objectsListsBackupCode + asyncActionCode + "}";
      });
}

} // namespace gdjs
