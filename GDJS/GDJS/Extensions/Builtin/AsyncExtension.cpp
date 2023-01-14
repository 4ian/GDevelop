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

  GetAllEvents()["BuiltinAsync::Async"].SetCodeGenerator(
      [](gd::BaseEvent &event_,
         gd::EventsCodeGenerator &codeGenerator,
         gd::EventsCodeGenerationContext &parentContext) {
        gd::AsyncEvent &event = dynamic_cast<gd::AsyncEvent &>(event_);

        // Generate callback code
        const auto callbackDescriptor = codeGenerator.GenerateCallback(
            gd::String::From(codeGenerator.GenerateSingleUsageUniqueIdFor(
                event.GetInstruction().GetOriginalInstruction().lock().get())),
            parentContext,
            event.GetActions(),
            event.HasSubEvents() ? &event.GetSubEvents() : nullptr);

        const gd::String callbackCallCode =
            "(runtimeScene) => (" + callbackDescriptor.functionName + "(" +
            callbackDescriptor.argumentsList + "))";

        // Generate the action and store the generated task.
        const gd::String asyncActionCode = codeGenerator.GenerateActionCode(
            event.GetInstruction(), parentContext, callbackCallCode);

        // Generate code to backup the objects lists.
        // Do it after generating the code of the action so that it uses the
        // same object list as used in the action.
        gd::String parentAsyncObjectsListGetter =
            parentContext.IsInsideAsync()
                ? "const parentAsyncObjectsList = asyncObjectsList;\n"
                : "";
        gd::String asyncObjectsListBuilder =
            parentContext.IsInsideAsync()
                ? "const asyncObjectsList = "
                  "gdjs.LongLivedObjectsList.from(parentAsyncObjectsList);\n"
                : "const asyncObjectsList = new gdjs.LongLivedObjectsList();\n";
        for (const gd::String &objectNameToBackup :
             callbackDescriptor.requiredObjects) {
          if (parentContext.ShouldUseAsyncObjectsList(objectNameToBackup))
            asyncObjectsListBuilder +=
                "/* Don't save " + objectNameToBackup +
                " as it will be provided by the parent asyncObjectsList. */\n";
          else
            asyncObjectsListBuilder +=
                "for (const obj of " +
                codeGenerator.GetObjectListName(objectNameToBackup,
                                                parentContext) +
                ") asyncObjectsList.addObject(" +
                codeGenerator.ConvertToStringExplicit(objectNameToBackup) +
                ", obj);\n";
        }

        return "{\n" + parentAsyncObjectsListGetter + "{\n" +
               asyncObjectsListBuilder + asyncActionCode + "}\n" + "}\n";
      });

  GetAllActions()["BuiltinAsync::ResolveAsyncEventsFunction"].SetFunctionName(
      "gdjs.evtTools.common.resolveAsyncEventsFunction");
}

}  // namespace gdjs
