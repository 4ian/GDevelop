/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef EVENTSCODEGENERATOR_H
#define EVENTSCODEGENERATOR_H
#include <vector>
#include <string>
#include <set>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsCodeGenerator.h"
namespace gd { class ObjectMetadata; }
namespace gd { class AutomatismMetadata; }
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
    static std::string GenerateSceneEventsCompleteCode(gd::Project & project,
                                                       gd::Layout & scene,
                                                       gd::EventsList & events,
                                                       std::set < std::string > & includeFiles,
                                                       bool compilationForRuntime = false);

    /**
     * Generate code for executing a condition list
     *
     * \param game Game used
     * \param scene Scene used
     * \param conditions std::vector of conditions
     * \param context Context used for generation
     * \return JS code.
     */
    virtual std::string GenerateConditionsListCode(std::vector < gd::Instruction > & conditions, gd::EventsCodeGenerationContext & context);

    /**
     * \brief Generate the full name for accessing to a boolean variable used for conditions.
     */
    virtual std::string GenerateBooleanFullName(const std::string & boolName, const gd::EventsCodeGenerationContext & context);

    /**
     * \brief Set a boolean to false.
     */
    virtual std::string GenerateBooleanInitializationToFalse(const std::string & boolName, const gd::EventsCodeGenerationContext & context);

    /**
     * \brief Get the full name for accessing to a list of objects
     */
    virtual std::string GetObjectListName(const std::string & name, const gd::EventsCodeGenerationContext & context);

    std::string GetCodeNamespace();

protected:

    virtual std::string GenerateParameterCodes(const std::string & parameter, const gd::ParameterMetadata & metadata,
                                               gd::EventsCodeGenerationContext & context,
                                               const std::string & previousParameter,
                                               std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes);

    virtual std::string GenerateObjectFunctionCall(std::string objectListName,
                                                          const gd::ObjectMetadata & objMetadata,
                                                          const gd::ExpressionCodeGenerationInformation & codeInfo,
                                                          std::string parametersStr,
                                                          std::string defaultOutput,
                                                          gd::EventsCodeGenerationContext & context);

    virtual std::string GenerateObjectAutomatismFunctionCall(std::string objectListName,
                                                                      std::string automatismName,
                                                                      const gd::AutomatismMetadata & autoInfo,
                                                                      const gd::ExpressionCodeGenerationInformation & codeInfo,
                                                                      std::string parametersStr,
                                                                      std::string defaultOutput,
                                                                      gd::EventsCodeGenerationContext & context);

    virtual std::string GenerateFreeCondition(const std::vector<std::string> & arguments,
                                              const gd::InstructionMetadata & instrInfos,
                                              const std::string & returnBoolean,
                                              bool conditionInverted,
                                              gd::EventsCodeGenerationContext & context);

    virtual std::string GenerateObjectCondition(const std::string & objectName,
                                                            const gd::ObjectMetadata & objInfo,
                                                            const std::vector<std::string> & arguments,
                                                            const gd::InstructionMetadata & instrInfos,
                                                            const std::string & returnBoolean,
                                                            bool conditionInverted,
                                                            gd::EventsCodeGenerationContext & context);

    virtual std::string GenerateAutomatismCondition(const std::string & objectName,
                                                                const std::string & automatismName,
                                                                const gd::AutomatismMetadata & autoInfo,
                                                                const std::vector<std::string> & arguments,
                                                                const gd::InstructionMetadata & instrInfos,
                                                                const std::string & returnBoolean,
                                                                bool conditionInverted,
                                                            gd::EventsCodeGenerationContext & context);

    virtual std::string GenerateObjectAction(const std::string & objectName,
                                                        const gd::ObjectMetadata & objInfo,
                                                        const std::vector<std::string> & arguments,
                                                        const gd::InstructionMetadata & instrInfos,
                                                        gd::EventsCodeGenerationContext & context);

    virtual std::string GenerateAutomatismAction(const std::string & objectName,
                                                            const std::string & automatismName,
                                                            const gd::AutomatismMetadata & autoInfo,
                                                            const std::vector<std::string> & arguments,
                                                            const gd::InstructionMetadata & instrInfos,
                                                            gd::EventsCodeGenerationContext & context);

    virtual std::string GenerateNegatedPredicat(const std::string & predicat) const { return "!("+predicat+")"; };
    virtual std::string GenerateReferenceToUpperScopeBoolean(const std::string & referenceName,
                                                   const std::string & referencedBoolean,
                                                   gd::EventsCodeGenerationContext & context);

    virtual std::string GenerateObjectsDeclarationCode(gd::EventsCodeGenerationContext & context);

    /**
     * \brief Construct a code generator for the specified project and layout.
     */
    EventsCodeGenerator(gd::Project & project, const gd::Layout & layout);
    virtual ~EventsCodeGenerator();
};

}
#endif // EVENTSCODEGENERATOR_H
