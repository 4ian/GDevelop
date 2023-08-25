/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ProjectElementRenamer.h"

#include <map>
#include <memory>
#include <vector>

#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {

/**
 * \brief Go through the nodes and find every function call parameter of a
 * given type.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionIdentifierStringFinder
    : public ExpressionParser2NodeWorker {
public:
  ExpressionIdentifierStringFinder(
      const gd::Platform &platform_,
      const gd::ProjectScopedContainers& projectScopedContainers_,
      const gd::String &expressionPlainString_,
      const gd::String &parameterType_, const gd::String &objectName_,
      const gd::String &layerName_, const gd::String &oldName_)
      : platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        expressionPlainString(expressionPlainString_),
        parameterType(parameterType_), objectName(objectName_),
        layerName(layerName_), oldName(oldName_){};
  virtual ~ExpressionIdentifierStringFinder(){};

  const std::vector<gd::ExpressionParserLocation> GetOccurrences() const {
    return occurrences;
  }

protected:
  void OnVisitSubExpressionNode(SubExpressionNode &node) override {
    node.expression->Visit(*this);
  }
  void OnVisitOperatorNode(OperatorNode &node) override {
    node.leftHandSide->Visit(*this);
    node.rightHandSide->Visit(*this);
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode &node) override {
    node.factor->Visit(*this);
  }
  void OnVisitNumberNode(NumberNode &node) override {}
  void OnVisitTextNode(TextNode &node) override {}
  void OnVisitVariableNode(VariableNode &node) override {
    if (node.child)
      node.child->Visit(*this);
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode &node) override {
    if (node.child)
      node.child->Visit(*this);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode &node) override {
    node.expression->Visit(*this);
    if (node.child)
      node.child->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode &node) override {}
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode &node) override {}
  void OnVisitFunctionCallNode(FunctionCallNode &node) override {
    gd::String lastLayerName;
    gd::ParameterMetadataTools::IterateOverParametersWithIndex(
        platform, projectScopedContainers.GetObjectsContainersList(), node,
        [&](const gd::ParameterMetadata &parameterMetadata,
            std::unique_ptr<gd::ExpressionNode> &parameterNode,
            size_t parameterIndex, const gd::String &lastObjectName) {
          if (parameterMetadata.GetType() == "layer") {
            if (parameterNode->location.GetEndPosition() -
                    parameterNode->location.GetStartPosition() <
                2) {
              // This is either the base layer or an invalid layer name.
              // Keep it as is.
              lastLayerName = expressionPlainString.substr(
                  parameterNode->location.GetStartPosition(),
                  parameterNode->location.GetEndPosition() -
                      parameterNode->location.GetStartPosition());
            } else {
              // Remove quotes, so it can be compared to the layer name.
              lastLayerName = expressionPlainString.substr(
                  parameterNode->location.GetStartPosition() + 1,
                  parameterNode->location.GetEndPosition() -
                      parameterNode->location.GetStartPosition() - 2);
            }
          }
          if (parameterMetadata.GetType() == parameterType) {
            auto parameterExpressionPlainString = expressionPlainString.substr(
                parameterNode->location.GetStartPosition(),
                parameterNode->location.GetEndPosition() -
                    parameterNode->location.GetStartPosition());
            if ((objectName.empty() || lastObjectName == objectName) &&
                (layerName.empty() || lastLayerName == layerName) &&
                parameterExpressionPlainString == "\"" + oldName + "\"") {
              occurrences.push_back(parameterNode->location);
            } else {
              parameterNode->Visit(*this);
            }
          }
        });
  }
  void OnVisitEmptyNode(EmptyNode &node) override {}

private:
  const gd::Platform &platform;
  const gd::ProjectScopedContainers &projectScopedContainers;
  /// It's used to extract parameter content.
  const gd::String &expressionPlainString;
  const gd::String &oldName;
  /// The type of parameter to check.
  const gd::String parameterType;
  /// If not empty, parameters will be taken into account only if related to
  /// this object.
  const gd::String objectName;
  /// If not empty, parameters will be taken into account only if related to
  /// this layer.
  const gd::String layerName;
  std::vector<gd::ExpressionParserLocation> occurrences;
};

bool ProjectElementRenamer::DoVisitInstruction(gd::Instruction &instruction,
                                               bool isCondition) {
  const auto &metadata = isCondition
                             ? gd::MetadataProvider::GetConditionMetadata(
                                   platform, instruction.GetType())
                             : gd::MetadataProvider::GetActionMetadata(
                                   platform, instruction.GetType());

  gd::String lastLayerName;
  gd::ParameterMetadataTools::IterateOverParametersWithIndex(
      instruction.GetParameters(), metadata.GetParameters(),
      [&](const gd::ParameterMetadata &parameterMetadata,
          const gd::Expression &parameterValue, size_t parameterIndex,
          const gd::String &lastObjectName) {
        if (parameterMetadata.GetType() == "layer") {
          if (parameterValue.GetPlainString().length() < 2) {
            // This is either the base layer or an invalid layer name.
            // Keep it as is.
            lastLayerName = parameterValue.GetPlainString();
          } else {
            // Remove quotes, so it can be compared to the layer name.
            lastLayerName = parameterValue.GetPlainString().substr(
                1, parameterValue.GetPlainString().length() - 2);
          }
        }

        if (parameterMetadata.GetType() == parameterType &&
            (objectName.empty() || lastObjectName == objectName) &&
            (layerName.empty() || lastLayerName == layerName)) {
          if (parameterValue.GetPlainString() == "\"" + oldName + "\"") {
            instruction.SetParameter(parameterIndex,
                                     gd::Expression("\"" + newName + "\""));
          }
        }
        auto node = parameterValue.GetRootNode();
        if (node) {
          ExpressionIdentifierStringFinder finder(
              platform, GetProjectScopedContainers(),
              parameterValue.GetPlainString(), parameterType, objectName,
              layerName, oldName);
          node->Visit(finder);

          if (finder.GetOccurrences().size() > 0) {
            gd::String newNameWithQuotes = "\"" + newName + "\"";
            gd::String oldParameterValue = parameterValue.GetPlainString();
            gd::String newParameterValue;
            auto previousEndPosition = 0;
            for (auto &&occurrenceLocation : finder.GetOccurrences()) {
              newParameterValue += oldParameterValue.substr(
                  previousEndPosition,
                  occurrenceLocation.GetStartPosition() - previousEndPosition);
              newParameterValue += newNameWithQuotes;

              previousEndPosition = occurrenceLocation.GetEndPosition();
            }
            if (previousEndPosition < oldParameterValue.size()) {
              newParameterValue += oldParameterValue.substr(
                  previousEndPosition,
                  oldParameterValue.size() - previousEndPosition);
            }

            instruction.SetParameter(parameterIndex,
                                     gd::Expression(newParameterValue));
          }
        }
      });

  return false;
}

ProjectElementRenamer::~ProjectElementRenamer() {}

} // namespace gd
