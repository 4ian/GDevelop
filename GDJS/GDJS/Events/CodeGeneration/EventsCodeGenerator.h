/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef EVENTSCODEGENERATOR_H
#define EVENTSCODEGENERATOR_H
#include <vector>
#include <string>
#include <set>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/InstructionsList.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
namespace gd { class ObjectMetadata; }
namespace gd { class BehaviorMetadata; }
namespace gd { class InstructionMetadata; }
namespace gd { class ExpressionCodeGenerationInformation; }
namespace gd { class EventsCodeGenerationContext; }

namespace gdjs
{

/**
 * \brief The class being responsible for generating Javascript code from events.
 *
 * See also gd::EventsCodeGenerator.
 */
class EventsCodeGenerator : public gd::EventsCodeGenerator
{
public:
    /**
     * Generate complete JS file for executing events of a scene
     *
     * \param project Project used
     * \param scene Scene used
     * \param events events of the scene
     * \param compilationForRuntime Set this to true if the code is generated for runtime.
     * \param includeFiles A reference to a set of strings where needed includes files will be stored.
     * \return JS code
     */
    static gd::String GenerateSceneEventsCompleteCode(gd::Project & project,
        const gd::Layout & scene, const gd::EventsList & events,
        std::set < gd::String > & includeFiles, bool compilationForRuntime = false);

    /**
     * Generate code for executing a condition list
     *
     * \param game Game used
     * \param scene Scene used
     * \param conditions std::vector of conditions
     * \param context Context used for generation
     * \return JS code.
     */
    virtual gd::String GenerateConditionsListCode(gd::InstructionsList & conditions, gd::EventsCodeGenerationContext & context);

    /**
     * \brief Generate the full name for accessing to a boolean variable used for conditions.
     */
    virtual gd::String GenerateBooleanFullName(const gd::String & boolName, const gd::EventsCodeGenerationContext & context);

    /**
     * \brief Set a boolean to false.
     */
    virtual gd::String GenerateBooleanInitializationToFalse(const gd::String & boolName, const gd::EventsCodeGenerationContext & context);

    /**
     * \brief Get the full name for accessing to a list of objects
     */
    virtual gd::String GetObjectListName(const gd::String & name, const gd::EventsCodeGenerationContext & context);

    gd::String GetCodeNamespace();

protected:

    virtual gd::String GenerateParameterCodes(const gd::String & parameter, const gd::ParameterMetadata & metadata,
                                               gd::EventsCodeGenerationContext & context,
                                               const gd::String & previousParameter,
                                               std::vector < std::pair<gd::String, gd::String> > * supplementaryParametersTypes);

    virtual gd::String GenerateObjectFunctionCall(gd::String objectListName,
                                                          const gd::ObjectMetadata & objMetadata,
                                                          const gd::ExpressionCodeGenerationInformation & codeInfo,
                                                          gd::String parametersStr,
                                                          gd::String defaultOutput,
                                                          gd::EventsCodeGenerationContext & context);

    virtual gd::String GenerateObjectBehaviorFunctionCall(gd::String objectListName,
                                                                      gd::String behaviorName,
                                                                      const gd::BehaviorMetadata & autoInfo,
                                                                      const gd::ExpressionCodeGenerationInformation & codeInfo,
                                                                      gd::String parametersStr,
                                                                      gd::String defaultOutput,
                                                                      gd::EventsCodeGenerationContext & context);

    virtual gd::String GenerateFreeCondition(const std::vector<gd::String> & arguments,
                                              const gd::InstructionMetadata & instrInfos,
                                              const gd::String & returnBoolean,
                                              bool conditionInverted,
                                              gd::EventsCodeGenerationContext & context);

    virtual gd::String GenerateObjectCondition(const gd::String & objectName,
                                                            const gd::ObjectMetadata & objInfo,
                                                            const std::vector<gd::String> & arguments,
                                                            const gd::InstructionMetadata & instrInfos,
                                                            const gd::String & returnBoolean,
                                                            bool conditionInverted,
                                                            gd::EventsCodeGenerationContext & context);

    virtual gd::String GenerateBehaviorCondition(const gd::String & objectName,
                                                                const gd::String & behaviorName,
                                                                const gd::BehaviorMetadata & autoInfo,
                                                                const std::vector<gd::String> & arguments,
                                                                const gd::InstructionMetadata & instrInfos,
                                                                const gd::String & returnBoolean,
                                                                bool conditionInverted,
                                                            gd::EventsCodeGenerationContext & context);

    virtual gd::String GenerateObjectAction(const gd::String & objectName,
                                                        const gd::ObjectMetadata & objInfo,
                                                        const std::vector<gd::String> & arguments,
                                                        const gd::InstructionMetadata & instrInfos,
                                                        gd::EventsCodeGenerationContext & context);

    virtual gd::String GenerateBehaviorAction(const gd::String & objectName,
                                                            const gd::String & behaviorName,
                                                            const gd::BehaviorMetadata & autoInfo,
                                                            const std::vector<gd::String> & arguments,
                                                            const gd::InstructionMetadata & instrInfos,
                                                            gd::EventsCodeGenerationContext & context);

    virtual gd::String GenerateNegatedPredicat(const gd::String & predicat) const { return "!("+predicat+")"; };
    virtual gd::String GenerateReferenceToUpperScopeBoolean(const gd::String & referenceName,
                                                   const gd::String & referencedBoolean,
                                                   gd::EventsCodeGenerationContext & context);

    virtual gd::String GenerateObjectsDeclarationCode(gd::EventsCodeGenerationContext & context);

    /**
     * \brief Construct a code generator for the specified project and layout.
     */
    EventsCodeGenerator(gd::Project & project, const gd::Layout & layout);
    virtual ~EventsCodeGenerator();
};

}
#endif // EVENTSCODEGENERATOR_H
