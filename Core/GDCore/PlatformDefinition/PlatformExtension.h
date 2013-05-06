/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_PLATFORMEXTENSION_H
#define GDCORE_PLATFORMEXTENSION_H
#include <map>
#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>
#include "GDCore/Events/ObjectMetadata.h"
#include "GDCore/Events/AutomatismMetadata.h"
#include "GDCore/Events/EventMetadata.h"
namespace gd { class Instruction; }
namespace gd { class InstructionMetadata; }
namespace gd { class ExpressionMetadata; }
namespace gd { class StrExpressionMetadata; }
namespace gd { class EventCodeGenerator; }
namespace gd { class ArbitraryResourceWorker; }
namespace gd { class AutomatismsSharedData; }
namespace gd { class Automatism; }
namespace gd { class Object; }

typedef void (*DestroyFunPtr)(gd::Object*);
typedef gd::Object * (*CreateFunPtr)(std::string name);

namespace gd
{

/**
 * \brief Class used by gd::PlatformExtension to ensure that an extension is compiled against the right versions of libraries.
 */
class GD_CORE_API CompilationInfo
{
    public :
    CompilationInfo() : informationCompleted(false) {};
    virtual ~CompilationInfo() {};

    bool informationCompleted;

    bool runtimeOnly; ///< True if the extension was compiled for a runtime use only

    #if defined(__GNUC__)
    int gccMajorVersion;
    int gccMinorVersion;
    int gccPatchLevel;
    #endif

    int boostVersion;

    int sfmlMajorVersion;
    int sfmlMinorVersion;

    #if defined(GD_IDE_ONLY)
    int wxWidgetsMajorVersion;
    int wxWidgetsMinorVersion;
    int wxWidgetsReleaseNumber;
    int wxWidgetsSubReleaseNumber;
    #endif

    std::string gdCoreVersion;
    int sizeOfpInt;
};


/**
 * \brief Base class for implementing platform's extensions.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API PlatformExtension
{
public:
    CompilationInfo compilationInfo;

    PlatformExtension();
    virtual ~PlatformExtension();

    /**
     * \brief Must be called to declare the main information about the extension.
     */
    void SetExtensionInformation(const std::string & name_,
                                 const std::string & fullname_,
                                 const std::string & description_,
                                 const std::string & author_,
                                 const std::string & license_);

    /**
     * \brief Declare a new condition as being part of the extension.
     */
    gd::InstructionMetadata & AddCondition(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & sentence_,
                                           const std::string & group_,
                                           const std::string & icon_,
                                           const std::string & smallicon_);

    /**
     * \brief Declare a new action as being part of the extension.
     */
    gd::InstructionMetadata & AddAction(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & sentence_,
                                           const std::string & group_,
                                           const std::string & icon_,
                                           const std::string & smallicon_);
    /**
     * \brief Declare a new expression as being part of the extension.
     */
    gd::ExpressionMetadata & AddExpression(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & group_,
                                           const std::string & smallicon_);
    /**
     * \brief Declare a new string expression as being part of the extension.
     */
    gd::StrExpressionMetadata & AddStrExpression(const std::string & name_,
                                           const std::string & fullname_,
                                           const std::string & description_,
                                           const std::string & group_,
                                           const std::string & smallicon_);

    /**
     * \brief Declare a new object as being part of the extension.
     */
    gd::ObjectMetadata & AddObject(const std::string & name_,
                                   const std::string & fullname_,
                                   const std::string & informations_,
                                   const std::string & icon24x24_,
                                   CreateFunPtr createFunPtrP,
                                   DestroyFunPtr destroyFunPtrP,
                                   const std::string & cppClassName_);

    /**
     * \brief Declare a new automatism as being part of the extension.
     */
    gd::AutomatismMetadata & AddAutomatism(const std::string & name_,
                                          const std::string & fullname_,
                                          const std::string & defaultName_,
                                          const std::string & description_,
                                          const std::string & group_,
                                          const std::string & icon24x24_,
                                          const std::string & className_,
                                          boost::shared_ptr<gd::Automatism> instance,
                                          boost::shared_ptr<gd::AutomatismsSharedData> sharedDatasInstance);

    /**
     * \brief Declare a new event as being part of the extension.
     */
    gd::EventMetadata & AddEvent(const std::string & name_,
                                 const std::string & fullname_,
                                 const std::string & description_,
                                 const std::string & group_,
                                 const std::string & smallicon_,
                                 boost::shared_ptr<gd::BaseEvent> instance,
                                 boost::shared_ptr<gd::EventMetadata::CodeGenerator> codeGen = boost::shared_ptr<gd::EventMetadata::CodeGenerator>());

    /**
     * \brief Return the name extension user friendly name.
     */
    const std::string & GetFullName() const { return fullname; }

    /**
     * \brief Return the name of the extension
     */
    const std::string & GetName() const { return name; }

    /**
     * \brief Return a description of the extension
     */
    const std::string & GetDescription() const { return informations; }

    /**
     * \brief Return the name of the extension developer
     */
    const std::string & GetAuthor() const { return author; }

    /**
     * \brief Return the name of extension license
     */
    const std::string & GetLicense() const { return license; }

    /**
     * \brief Return true if the extension is a standard extension that cannot be deactivated
     */
    bool IsBuiltin() const { return nameSpace.empty(); }

    /**
     * \brief Get the namespace of the extension.
     * \note The namespace is simply the name of the extension concatenated with "::" at the end.
     */
    std::string GetNameSpace() { return nameSpace; };

    /**
     * \brief Return a vector containing all the object types provided by the extension
     */
    std::vector < std::string > GetExtensionObjectsTypes() const;

    /**
     * \brief Return a vector containing all the automatism types provided by the extension
     */
    std::vector < std::string > GetAutomatismsTypes() const;

    /**
     * \brief Return a function to create the object if the type is handled by the extension
     */
    CreateFunPtr GetObjectCreationFunctionPtr(std::string objectType) const;

    /**
     * \brief Make sure that the object from an extension is deleted by the same extension.
     */
    DestroyFunPtr GetDestroyObjectFunction(std::string objectType) const;

    /**
     * \brief Create a custom event.
     *
     * Return an empty pointer if \a eventType is not provided by the extension.
     */
    boost::shared_ptr<gd::BaseEvent> CreateEvent(std::string eventType) const;
    /**
     * \brief Create an automatism
     *
     * Return NULL if \a automatismType is not provided by the extension.
     */
    gd::Automatism* CreateAutomatism(std::string automatismType) const;

    /**
     * \brief Create shared data for an automatism
     *
     * Return NULL if \a automatismType is not provided by the extension.
     */
    boost::shared_ptr<gd::AutomatismsSharedData> CreateAutomatismSharedDatas(std::string automatismType) const;

    /**
     * \brief Return a reference to the ObjectMetadata object associated to \a objectType
     */
    ObjectMetadata & GetObjectMetadata(const std::string & objectType);

    /**
     * \brief Return a reference to the AutomatismMetadata object associated to \a automatismType
     */
    AutomatismMetadata & GetAutomatismMetadata(const std::string & automatismType);

    std::map<std::string, gd::EventMetadata > & GetAllEvents();
    std::map<std::string, gd::AutomatismMetadata > & GetAllAutomatisms();

    /**
     * \brief Return a reference to a map containing the names of the actions (in the first members) and the metadata associated with (in the second members).
     */
    std::map<std::string, gd::InstructionMetadata > & GetAllActions();

    /**
     * \see gd::PlatformExtension::GetAllActions
     */
    std::map<std::string, gd::InstructionMetadata > & GetAllConditions();

    /**
     * \see gd::PlatformExtension::GetAllActions
     */
    std::map<std::string, gd::ExpressionMetadata > & GetAllExpressions();

    /**
     * \see gd::PlatformExtension::GetAllActions
     */
    std::map<std::string, gd::StrExpressionMetadata > & GetAllStrExpressions();

    /**
     * \brief Return a reference to a map containing the names of the actions, related to the object type, and the metadata associated with.
     */
    std::map<std::string, gd::InstructionMetadata > & GetAllActionsForObject(std::string objectType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<std::string, gd::InstructionMetadata > & GetAllConditionsForObject(std::string objectType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<std::string, gd::ExpressionMetadata > & GetAllExpressionsForObject(std::string objectType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<std::string, gd::StrExpressionMetadata > & GetAllStrExpressionsForObject(std::string objectType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<std::string, gd::InstructionMetadata > & GetAllActionsForAutomatism(std::string autoType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<std::string, gd::InstructionMetadata > & GetAllConditionsForAutomatism(std::string autoType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<std::string, gd::ExpressionMetadata > & GetAllExpressionsForAutomatism(std::string autoType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<std::string, gd::StrExpressionMetadata > & GetAllStrExpressionsForAutomatism(std::string autoType);

    /**
     * Called ( e.g. during compilation ) so as to inventory resources used by conditions and update their filename
     *
     * \see gd::PlatformExtension::ExposeActionsResources
     */
    virtual void ExposeConditionsResources(Instruction & condition, gd::ArbitraryResourceWorker & worker) {};

    /**
     * Called ( e.g. during compilation ) so as to inventory resources used by actions and update their filename
     *
     * \see ArbitraryResourceWorker
     */
    virtual void ExposeActionsResources(Instruction & action, gd::ArbitraryResourceWorker & worker) {};

    /**
     * \brief Clone the extension of another platform.
     *
     * This can be used when you want a platform to conform to another.<br>
     * It is still possible to make some changes after the cloning by using getter methods.
     */
    void CloneExtension(const std::string & platformName, const std::string & extensionName);

private:

    /**
     * Set the namespace ( the string each actions/conditions/expressions start with )
     */
    void SetNameSpace(std::string nameSpace_);

    std::string name; ///<Name identifying the extension
    std::string nameSpace; ///<Automatically set from the name of the extension, and added to every actions/conditions/expressions/objects/automatism/event.
    std::string fullname; ///<Name displayed to users at edittime
    std::string informations; ///<Description displayed to users at edittime
    std::string author; ///<Author displayed to users at edittime
    std::string license;  ///<License name displayed to users at edittime

    std::map<std::string, gd::ObjectMetadata > objectsInfos;
    std::map<std::string, gd::AutomatismMetadata > automatismsInfo;
    std::map<std::string, gd::InstructionMetadata > conditionsInfos;
    std::map<std::string, gd::InstructionMetadata > actionsInfos;
    std::map<std::string, gd::ExpressionMetadata > expressionsInfos;
    std::map<std::string, gd::StrExpressionMetadata > strExpressionsInfos;
    std::map<std::string, gd::EventMetadata > eventsInfos;

    ObjectMetadata badObjectMetadata;
    AutomatismMetadata badAutomatismMetadata;
    static std::map<std::string, gd::InstructionMetadata > badConditionsMetadata; ///< Used when a condition is not found in the extension
    static std::map<std::string, gd::InstructionMetadata > badActionsMetadata;  ///< Used when an action is not found in the extension
    static std::map<std::string, gd::ExpressionMetadata > badExpressionsMetadata; ///< Used when an expression is not found in the extension
    static std::map<std::string, gd::StrExpressionMetadata > badStrExpressionsMetadata;///< Used when an expression is not found in the extension
};

}

#endif // GDCORE_PLATFORMEXTENSION_H
