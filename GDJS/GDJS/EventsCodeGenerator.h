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
namespace gd { class EventsCodeGenerationContext; }

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
     * \return C++ code
     */
    static std::string GenerateSceneEventsCompleteCode(gd::Project & project,
                                                       gd::Layout & scene,
                                                       std::vector < gd::BaseEventSPtr > & events,
                                                       std::set < std::string > & includeFiles,
                                                       bool compilationForRuntime = false);

protected:
    virtual std::string GenerateCurrentObjectFunctionCall(std::string objectListName,
                                                          const gd::ObjectMetadata & objMetadata,
                                                          std::string functionCallName,
                                                          std::string parametersStr);
    virtual std::string GenerateNotPickedObjectFunctionCall(std::string objectListName,
                                                            const gd::ObjectMetadata & objMetadata,
                                                            std::string functionCallName,
                                                            std::string parametersStr,
                                                            std::string defaultOutput);

    virtual std::string GenerateCurrentObjectAutomatismFunctionCall(std::string objectListName,
                                                                      std::string automatismName,
                                                                      const gd::AutomatismMetadata & autoInfo,
                                                                      std::string functionCallName,
                                                                      std::string parametersStr);

    virtual std::string GenerateNotPickedObjectAutomatismFunctionCall(std::string objectListName,
                                                                      std::string automatismName,
                                                                      const gd::AutomatismMetadata & autoInfo,
                                                                      std::string functionCallName,
                                                                      std::string parametersStr,
                                                                      std::string defaultOutput);

    virtual std::string GenerateObjectListObjectCondition(const std::string & objectName,
                                                            const gd::ObjectMetadata & objInfo,
                                                            const std::vector<std::string> & arguments,
                                                            const gd::InstructionMetadata & instrInfos,
                                                            const std::string & returnBoolean,
                                                            bool conditionInverted);

    virtual std::string GenerateObjectListAutomatismCondition(const std::string & objectName,
                                                                const std::string & automatismName,
                                                                const gd::AutomatismMetadata & autoInfo,
                                                                const std::vector<std::string> & arguments,
                                                                const gd::InstructionMetadata & instrInfos,
                                                                const std::string & returnBoolean,
                                                                bool conditionInverted);

    virtual std::string GenerateObjectListObjectAction(const std::string & objectName,
                                                        const gd::ObjectMetadata & objInfo,
                                                        const std::vector<std::string> & arguments,
                                                        const gd::InstructionMetadata & instrInfos);

    virtual std::string GenerateObjectListAutomatismAction(const std::string & objectName,
                                                            const std::string & automatismName,
                                                            const gd::AutomatismMetadata & autoInfo,
                                                            const std::vector<std::string> & arguments,
                                                            const gd::InstructionMetadata & instrInfos);

    virtual std::string GenerateScopeBegin(gd::EventsCodeGenerationContext & context, const std::string & extraVariable = "") const;
    virtual std::string GenerateScopeEnd(gd::EventsCodeGenerationContext & context, const std::string & extraVariable = "") const;
    virtual std::string GenerateNegatedPredicat(const std::string & predicat) const { return "!("+predicat+")"; };
    virtual std::string GenerateReferenceToBoolean(const std::string & referenceName, const std::string & referencedBoolean) { return "var "+referenceName+" = "+referencedBoolean+";\n";}
    virtual std::string GenerateBooleanInitializationToFalse(const std::string & boolName) { return "var "+boolName+" = false;\n";}

    virtual std::string GenerateObjectsDeclarationCode(gd::EventsCodeGenerationContext & context);

    /**
     * \brief Construct a code generator for the specified project and layout.
     */
    EventsCodeGenerator(gd::Project & project, const gd::Layout & layout);
    virtual ~EventsCodeGenerator();
};

#endif // EVENTSCODEGENERATOR_H
