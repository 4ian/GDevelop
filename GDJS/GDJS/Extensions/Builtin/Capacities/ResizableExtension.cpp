/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/Extensions/Builtin/Capacities/ResizableExtension.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Project/ObjectsContainersList.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

ResizableExtension::ResizableExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsResizableExtension(*this);

  GetBehaviorMetadata("ResizableCapability::ResizableBehavior")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");

  auto& actions = GetAllActionsForBehavior("ResizableCapability::ResizableBehavior");
  auto& conditions = GetAllConditionsForBehavior("ResizableCapability::ResizableBehavior");

  actions["ResizableCapability::ResizableBehavior::SetWidth"]
      .SetFunctionName("setWidth")
      .SetGetter("getWidth")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");
  conditions["ResizableCapability::ResizableBehavior::Width"]
      .SetFunctionName("getWidth")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");

  actions["ResizableCapability::ResizableBehavior::SetHeight"]
      .SetFunctionName("setHeight")
      .SetGetter("getHeight")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");
  conditions["ResizableCapability::ResizableBehavior::Height"]
      .SetFunctionName("getHeight")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");

  actions["ResizableCapability::ResizableBehavior::SetSize"]
      .SetFunctionName("setSize")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");
  // The optional depth (parameter 4) is left unchanged when empty (which is
  // the case for events made before it existed) and it's ignored for objects
  // without the 3D capability, so the code is generated here.
  actions["ResizableCapability::ResizableBehavior::SetSize"]
      .SetCustomCodeGenerator([](gd::Instruction& instruction,
                                 gd::EventsCodeGenerator& codeGenerator,
                                 gd::EventsCodeGenerationContext& context) {
        const gd::String& objectName =
            instruction.GetParameter(0).GetPlainString();
        const gd::String& depthExpression =
            instruction.GetParameter(4).GetPlainString();
        gd::String outputCode;

        for (const gd::String& realObjectName :
             codeGenerator.GetObjectsContainersList().ExpandObjectName(
                 objectName, context.GetCurrentObject())) {
          context.SetCurrentObject(realObjectName);
          context.ObjectsListNeeded(realObjectName);
          const gd::String objectListName =
              codeGenerator.GetObjectListName(realObjectName, context);

          const gd::String widthCode =
              gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator,
                  context,
                  "number",
                  instruction.GetParameter(2).GetPlainString(),
                  objectName);
          const gd::String heightCode =
              gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator,
                  context,
                  "number",
                  instruction.GetParameter(3).GetPlainString(),
                  objectName);
          const bool shouldChangeDepth =
              !depthExpression.empty() &&
              !codeGenerator.GetObjectsContainersList()
                   .GetBehaviorNamesInObjectOrGroup(realObjectName,
                                                    "Scene3D::Base3DBehavior")
                   .empty();

          outputCode += "for(var i = 0, len = " + objectListName +
                        ".length ;i < len;++i) {\n";
          outputCode += "    " + objectListName + "[i].setSize(" + widthCode +
                        ", " + heightCode + ");\n";
          if (shouldChangeDepth) {
            outputCode += "    " + objectListName + "[i].setDepth(" +
                          gd::ExpressionCodeGenerator::GenerateExpressionCode(
                              codeGenerator,
                              context,
                              "number",
                              depthExpression,
                              objectName) +
                          ");\n";
          }
          outputCode += "}\n";

          context.SetNoCurrentObject();
        }
        return outputCode;
      });
}

}  // namespace gdjs
