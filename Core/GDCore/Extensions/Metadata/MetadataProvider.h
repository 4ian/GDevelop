/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef METADATAPROVIDER_H
#define METADATAPROVIDER_H
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/String.h"
namespace gd {
class BehaviorMetadata;
class ObjectMetadata;
class ExpressionMetadata;
class ExpressionMetadata;
class Platform;
class PlatformExtension;
}  // namespace gd

namespace gd {

/**
 * \brief A container for metadata about an
 * object/behavior/instruction/expression and its associated extension.
 */
template <class T>
class ExtensionAndMetadata {
 public:
  ExtensionAndMetadata(const gd::PlatformExtension& extension_,
                       const T& metadata_)
      : extension(&extension_), metadata(&metadata_){};

  /**
   * \brief Default constructor, only here to satisfy Emscripten bindings.
   * \warning Please do not use.
   * \private
   */
  ExtensionAndMetadata() : extension(nullptr), metadata(nullptr){};

  /**
   * \brief Get the associated extension.
   */
  const gd::PlatformExtension& GetExtension() { return *extension; };

  /**
   * \brief Get the metadata.
   */
  const T& GetMetadata() { return *metadata; };

 private:
  const gd::PlatformExtension* extension;
  const T* metadata;
};

/**
 * \brief Allow to easily get metadata for instructions (i.e actions and
 * conditions), expressions, objects and behaviors.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API MetadataProvider {
 public:
  /**
   * Get the metadata about a behavior, and its associated extension.
   */
  static ExtensionAndMetadata<BehaviorMetadata> GetExtensionAndBehaviorMetadata(
      const gd::Platform& platform, gd::String behaviorType);

  /**
   * Get the metadata about an object, and its associated extension.
   */
  static ExtensionAndMetadata<ObjectMetadata> GetExtensionAndObjectMetadata(
      const gd::Platform& platform, gd::String type);

  /**
   * Get the metadata of an action, and its associated extension.
   * Works for object, behaviors and static actions.
   */
  static ExtensionAndMetadata<InstructionMetadata>
  GetExtensionAndActionMetadata(const gd::Platform& platform,
                                gd::String actionType);

  /**
   * Get the metadata of a condition, and its associated extension.
   * Works for object, behaviors and static conditions.
   */
  static ExtensionAndMetadata<InstructionMetadata>
  GetExtensionAndConditionMetadata(const gd::Platform& platform,
                                   gd::String conditionType);

  /**
   * Get information about an expression, and its associated extension.
   * Works for static expressions.
   */
  static ExtensionAndMetadata<ExpressionMetadata>
  GetExtensionAndExpressionMetadata(const gd::Platform& platform,
                                    gd::String exprType);

  /**
   * Get information about an expression, and its associated extension.
   * Works for object expressions.
   */
  static ExtensionAndMetadata<ExpressionMetadata>
  GetExtensionAndObjectExpressionMetadata(const gd::Platform& platform,
                                          gd::String objectType,
                                          gd::String exprType);

  /**
   * Get information about an expression, and its associated extension.
   * Works for behavior expressions.
   */
  static ExtensionAndMetadata<ExpressionMetadata>
  GetExtensionAndBehaviorExpressionMetadata(const gd::Platform& platform,
                                            gd::String autoType,
                                            gd::String exprType);

  /**
   * Get information about a string expression, and its associated extension.
   * Works for static expressions.
   */
  static ExtensionAndMetadata<ExpressionMetadata>
  GetExtensionAndStrExpressionMetadata(const gd::Platform& platform,
                                       gd::String exprType);

  /**
   * Get information about a string expression, and its associated extension.
   * Works for object expressions.
   */
  static ExtensionAndMetadata<ExpressionMetadata>
  GetExtensionAndObjectStrExpressionMetadata(const gd::Platform& platform,
                                             gd::String objectType,
                                             gd::String exprType);

  /**
   * Get information about a string expression, and its associated extension.
   * Works for behavior expressions.
   */
  static ExtensionAndMetadata<ExpressionMetadata>
  GetExtensionAndBehaviorStrExpressionMetadata(const gd::Platform& platform,
                                               gd::String autoType,
                                               gd::String exprType);

  /**
   * Get the metadata about a behavior.
   */
  static const BehaviorMetadata& GetBehaviorMetadata(
      const gd::Platform& platform, gd::String behaviorType);

  /**
   * Get the metadata about an object.
   */
  static const ObjectMetadata& GetObjectMetadata(const gd::Platform& platform,
                                                 gd::String type);

  /**
   * Get the metadata of an action.
   * Works for object, behaviors and static actions.
   */
  static const gd::InstructionMetadata& GetActionMetadata(
      const gd::Platform& platform, gd::String actionType);

  /**
   * Get the metadata of a condition.
   * Works for object, behaviors and static conditions.
   */
  static const gd::InstructionMetadata& GetConditionMetadata(
      const gd::Platform& platform, gd::String conditionType);

  /**
   * Get information about an expression from its type
   * Works for static expressions.
   */
  static const gd::ExpressionMetadata& GetExpressionMetadata(
      const gd::Platform& platform, gd::String exprType);

  /**
   * Get information about an expression from its type
   * Works for object expressions.
   */
  static const gd::ExpressionMetadata& GetObjectExpressionMetadata(
      const gd::Platform& platform, gd::String objectType, gd::String exprType);

  /**
   * Get information about an expression from its type
   * Works for behavior expressions.
   */
  static const gd::ExpressionMetadata& GetBehaviorExpressionMetadata(
      const gd::Platform& platform, gd::String autoType, gd::String exprType);

  /**
   * Get information about a string expression from its type
   * Works for static expressions.
   */
  static const gd::ExpressionMetadata& GetStrExpressionMetadata(
      const gd::Platform& platform, gd::String exprType);

  /**
   * Get information about a string expression from its type
   * Works for object expressions.
   */
  static const gd::ExpressionMetadata& GetObjectStrExpressionMetadata(
      const gd::Platform& platform, gd::String objectType, gd::String exprType);

  /**
   * Get information about a string expression from its type
   * Works for behavior expressions.
   */
  static const gd::ExpressionMetadata& GetBehaviorStrExpressionMetadata(
      const gd::Platform& platform, gd::String autoType, gd::String exprType);

  /**
   * \brief Check if a (static) condition exists
   * @return true if the (static) condition exists
   */
  static bool HasCondition(const gd::Platform& platform, gd::String name);

  /**
   * \brief Check if a (static) action exists
   * @return true if the (static) action exists
   */
  static bool HasAction(const gd::Platform& platform, gd::String name);

  /**
   * \brief Check if a (object) action exists
   * @return true if the (object) action exists
   */
  static bool HasObjectAction(const gd::Platform& platform,
                              gd::String objectType,
                              gd::String name);

  /**
   * \brief Check if a (object) condition exists
   * @return true if the (object) condition exists
   */
  static bool HasObjectCondition(const gd::Platform& platform,
                                 gd::String objectType,
                                 gd::String name);

  /**
   * \brief Check if a (behavior) action exists
   * @return true if the (behavior) action exists
   */
  static bool HasBehaviorAction(const gd::Platform& platform,
                                gd::String behaviorType,
                                gd::String name);

  /**
   * \brief Check if a (behavior) condition exists
   * @return true if the (behavior) condition exists
   */
  static bool HasBehaviorCondition(const gd::Platform& platform,
                                   gd::String behaviorType,
                                   gd::String name);

  /**
   * \brief Check if a (static) expression exists
   * @return true if the (static) expression exists
   */
  static bool HasExpression(const gd::Platform& platform, gd::String name);

  /**
   * \brief Check if a (object) expression exists
   * @return true if the (object) expression exists
   */
  static bool HasObjectExpression(const gd::Platform& platform,
                                  gd::String objectType,
                                  gd::String name);

  /**
   * \brief Check if a (behavior) expression exists
   * @return true if the (behavior) expression exists
   */
  static bool HasBehaviorExpression(const gd::Platform& platform,
                                    gd::String behaviorType,
                                    gd::String name);

  /**
   * \brief Check if a (static) string expression exists
   * @return true if the (static) string expression exists
   */
  static bool HasStrExpression(const gd::Platform& platform, gd::String name);

  /**
   * \brief Check if a (object) string expression exists
   * @return true if the (object) string expression exists
   */
  static bool HasObjectStrExpression(const gd::Platform& platform,
                                     gd::String objectType,
                                     gd::String name);

  /**
   * \brief Check if a (behavior) string expression exists
   * @return true if the (behavior) string expression exists
   */
  static bool HasBehaviorStrExpression(const gd::Platform& platform,
                                       gd::String behaviorType,
                                       gd::String name);

  static bool IsBadExpressionMetadata(const gd::ExpressionMetadata& metadata) {
    return &metadata == &badExpressionMetadata ||
           &metadata == &badStrExpressionMetadata;
  }

  virtual ~MetadataProvider();

 private:
  MetadataProvider();

  static PlatformExtension badExtension;
  static BehaviorMetadata badBehaviorInfo;
  static ObjectMetadata badObjectInfo;
  static gd::InstructionMetadata badInstructionMetadata;
  static gd::ExpressionMetadata badExpressionMetadata;
  static gd::ExpressionMetadata badStrExpressionMetadata;
  int useless;  // Useless member to avoid emscripten "must have a positive
                // integer typeid pointer" runtime error.
};

}  // namespace gd

#endif  // METADATAPROVIDER_H
