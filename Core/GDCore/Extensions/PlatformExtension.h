/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * Copyright 2016 Victor Levasseur (victorlevasseur52@gmail.com)
 * This project is released under the MIT License.
 */

#ifndef GDCORE_PLATFORMEXTENSION_H
#define GDCORE_PLATFORMEXTENSION_H
#include <map>
#include <vector>
#include <memory>
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/EventMetadata.h"
#include "GDCore/CommonTools.h"
#include "GDCore/String.h"
namespace gd { class Instruction; }
namespace gd { class InstructionMetadata; }
namespace gd { class ExpressionMetadata; }
namespace gd { class ObjectMetadata; }
namespace gd { class BehaviorMetadata; }
namespace gd { class BaseEvent; }
namespace gd { class EventMetadata; }
namespace gd { class EventCodeGenerator; }
namespace gd { class ArbitraryResourceWorker; }
namespace gd { class BehaviorsSharedData; }
namespace gd { class Behavior; }
namespace gd { class Object; }

typedef void (*DestroyFunPtr)(gd::Object*);
typedef gd::Object * (*CreateFunPtr)(gd::String name);

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

    int sfmlMajorVersion;
    int sfmlMinorVersion;

    #if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
    int wxWidgetsMajorVersion;
    int wxWidgetsMinorVersion;
    int wxWidgetsReleaseNumber;
    int wxWidgetsSubReleaseNumber;
    #endif

    gd::String gdCoreVersion;
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
    void SetExtensionInformation(const gd::String & name_,
                                 const gd::String & fullname_,
                                 const gd::String & description_,
                                 const gd::String & author_,
                                 const gd::String & license_);

    /**
     * \brief Mark this extension as deprecated: the IDE will hide it from the user.
     */
    void MarkAsDeprecated() { deprecated = true; }

    /**
     * \brief Declare a new condition as being part of the extension.
     * \note This method does nothing when used for GD C++ runtime.
     */
    gd::InstructionMetadata & AddCondition(const gd::String & name_,
                                           const gd::String & fullname_,
                                           const gd::String & description_,
                                           const gd::String & sentence_,
                                           const gd::String & group_,
                                           const gd::String & icon_,
                                           const gd::String & smallicon_);

    /**
     * \brief Declare a new action as being part of the extension.
     * \note This method does nothing when used for GD C++ runtime.
     */
    gd::InstructionMetadata & AddAction(const gd::String & name_,
                                           const gd::String & fullname_,
                                           const gd::String & description_,
                                           const gd::String & sentence_,
                                           const gd::String & group_,
                                           const gd::String & icon_,
                                           const gd::String & smallicon_);
    /**
     * \brief Declare a new expression as being part of the extension.
     * \note This method does nothing when used for GD C++ runtime.
     */
    gd::ExpressionMetadata & AddExpression(const gd::String & name_,
                                           const gd::String & fullname_,
                                           const gd::String & description_,
                                           const gd::String & group_,
                                           const gd::String & smallicon_);
    /**
     * \brief Declare a new String expression as being part of the extension.
     * \note This method does nothing when used for GD C++ runtime.
     */
    gd::ExpressionMetadata & AddStrExpression(const gd::String & name_,
                                           const gd::String & fullname_,
                                           const gd::String & description_,
                                           const gd::String & group_,
                                           const gd::String & smallicon_);

    /**
     * \brief Declare a new object as being part of the extension.
     * \note This method does nothing when used for GD C++ runtime.
     * \tparam T the declared class inherited from *gd::Object*
     * \param name The name of the object
     * \param fullname The user friendly name of the object
     * \param description The user friendly description of the object
     * \param icon The 24x24 icon of the object: res/icons_[SkinName]/[iconName]24.png will be first tried,
     * and then if it does not exists, the full entered name will be tried.
     \endcode
     */
    template<class T>
    gd::ObjectMetadata & AddObject(const gd::String & name_,
                                   const gd::String & fullname_,
                                   const gd::String & description_,
                                   const gd::String & icon24x24_);

    /**
     * \brief Declare a new behavior as being part of the extension.
     * \note This method does nothing when used for GD C++ runtime.
     *
     * \param name The name of the behavior
     * \param fullname The user friendly name of the behavior
     * \param description The user friendly description of the behavior
     * \param icon The 24x24 icon of the behavior: res/icons_[SkinName]/[iconName]24.png will be first tried,
     * and then if it does not exists, it is assumed that the icon name is the filename that must be used to open the icon.
     * \param instance An instance of the behavior that will be used to create the behavior
     * \param sharedDatasInstance Optional instance of the data shared by the behaviors having the same name.
     */
    gd::BehaviorMetadata & AddBehavior(const gd::String & name_,
                                          const gd::String & fullname_,
                                          const gd::String & defaultName_,
                                          const gd::String & description_,
                                          const gd::String & group_,
                                          const gd::String & icon24x24_,
                                          const gd::String & className_,
                                          std::shared_ptr<gd::Behavior> instance,
                                          std::shared_ptr<gd::BehaviorsSharedData> sharedDatasInstance);

    /**
     * \brief Declare a new event as being part of the extension.
     * \note This method does nothing when used for GD C++ runtime.
     */
    gd::EventMetadata & AddEvent(const gd::String & name_,
                                 const gd::String & fullname_,
                                 const gd::String & description_,
                                 const gd::String & group_,
                                 const gd::String & smallicon_,
                                 std::shared_ptr<gd::BaseEvent> instance);

    /**
     * \brief Return the name extension user friendly name.
     */
    const gd::String & GetFullName() const { return fullname; }

    /**
     * \brief Return the name of the extension
     */
    const gd::String & GetName() const { return name; }

    /**
     * \brief Return a description of the extension
     */
    const gd::String & GetDescription() const { return informations; }

    /**
     * \brief Return the name of the extension developer
     */
    const gd::String & GetAuthor() const { return author; }

    /**
     * \brief Return the name of extension license
     */
    const gd::String & GetLicense() const { return license; }

    /**
     * \brief Check if the extension is flagged as being deprecated.
     */
    bool IsDeprecated() const { return deprecated; }

    /**
     * \brief Return true if the extension is a standard extension that cannot be deactivated
     */
    bool IsBuiltin() const;

    /**
     * \brief Get the namespace of the extension.
     * \note The namespace is simply the name of the extension concatenated with "::" at the end.
     */
    const gd::String & GetNameSpace() { return nameSpace; };

    /**
     * \brief Return a vector containing all the object types provided by the extension
     */
    std::vector < gd::String > GetExtensionObjectsTypes() const;

    /**
     * \brief Return a vector containing all the behavior types provided by the extension
     */
    std::vector < gd::String > GetBehaviorsTypes() const;

    /**
     * \brief Return a function to create the object if the type is handled by the extension
     */
    CreateFunPtr GetObjectCreationFunctionPtr(gd::String objectType) const;

    /**
     * \brief Create a custom event.
     *
     * Return an empty pointer if \a eventType is not provided by the extension.
     */
    std::shared_ptr<gd::BaseEvent> CreateEvent(gd::String eventType) const;
    /**
     * \brief Create a behavior
     *
     * Return NULL if \a behaviorType is not provided by the extension.
     */
    std::unique_ptr<gd::Behavior> CreateBehavior(gd::String behaviorType) const;

    /**
     * \brief Create shared data for a behavior
     *
     * Return NULL if \a behaviorType is not provided by the extension.
     */
    std::shared_ptr<gd::BehaviorsSharedData> CreateBehaviorSharedDatas(gd::String behaviorType) const;

    /**
     * \brief Return a reference to the ObjectMetadata object associated to \a objectType
     */
    ObjectMetadata & GetObjectMetadata(const gd::String & objectType);

    /**
     * \brief Return a reference to the BehaviorMetadata object associated to \a behaviorType
     */
    BehaviorMetadata & GetBehaviorMetadata(const gd::String & behaviorType);

    /**
     * \brief Return a map containing all the events provided by the extension
     */
    std::map<gd::String, gd::EventMetadata > & GetAllEvents();

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Return a reference to a map containing the names of the actions (in the first members) and the metadata associated with (in the second members).
     */
    std::map<gd::String, gd::InstructionMetadata > & GetAllActions();

    /**
     * \see gd::PlatformExtension::GetAllActions
     */
    std::map<gd::String, gd::InstructionMetadata > & GetAllConditions();

    /**
     * \see gd::PlatformExtension::GetAllActions
     */
    std::map<gd::String, gd::ExpressionMetadata > & GetAllExpressions();

    /**
     * \see gd::PlatformExtension::GetAllActions
     */
    std::map<gd::String, gd::ExpressionMetadata > & GetAllStrExpressions();

    /**
     * \brief Return a reference to a map containing the names of the actions, related to the object type, and the metadata associated with.
     */
    std::map<gd::String, gd::InstructionMetadata > & GetAllActionsForObject(gd::String objectType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<gd::String, gd::InstructionMetadata > & GetAllConditionsForObject(gd::String objectType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<gd::String, gd::ExpressionMetadata > & GetAllExpressionsForObject(gd::String objectType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<gd::String, gd::ExpressionMetadata > & GetAllStrExpressionsForObject(gd::String objectType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<gd::String, gd::InstructionMetadata > & GetAllActionsForBehavior(gd::String autoType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<gd::String, gd::InstructionMetadata > & GetAllConditionsForBehavior(gd::String autoType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<gd::String, gd::ExpressionMetadata > & GetAllExpressionsForBehavior(gd::String autoType);

    /**
     * \see gd::PlatformExtension::GetAllActionsForObject
     */
    std::map<gd::String, gd::ExpressionMetadata > & GetAllStrExpressionsForBehavior(gd::String autoType);

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
     * It is still possible to make some changes after the cloning by using getter methods.<br>
     * See also gd::PlatformExtension::StripUnimplementedInstructionsAndExpressions.
     *
     * \param platformName The name of the platform in which the source extension must be searched for.
     * \param extensionName The name of the source extension to be copied.
     * \param stripFunctionsNameAndCodeGeneration If set to true, all functions names and code generator of all instructions/expression/events
     * will be removed.
     */
    void CloneExtension(const gd::String & platformName, const gd::String & extensionName, bool stripFunctionsNameAndCodeGeneration = true);

    /**
     * \brief Delete all instructions having no functions name or custom code generator.
     */
    void StripUnimplementedInstructionsAndExpressions();
    #endif

    /**
     * \brief Return the name of all the extensions which are considered provided by platforms.
     */
    static std::vector<gd::String> GetBuiltinExtensionsNames();

private:

    /**
     * Set the namespace ( the String each actions/conditions/expressions start with )
     */
    void SetNameSpace(gd::String nameSpace_);

    gd::String name; ///<Name identifying the extension
    gd::String nameSpace; ///<Automatically set from the name of the extension, and added to every actions/conditions/expressions/objects/behavior/event.
    gd::String fullname; ///<Name displayed to users at edittime
    gd::String informations; ///<Description displayed to users at edittime
    gd::String author; ///<Author displayed to users at edittime
    gd::String license;  ///<License name displayed to users at edittime
    bool deprecated;

    std::map<gd::String, gd::ObjectMetadata > objectsInfos;
    std::map<gd::String, gd::BehaviorMetadata > behaviorsInfo;
    #if defined(GD_IDE_ONLY)
    std::map<gd::String, gd::InstructionMetadata > conditionsInfos;
    std::map<gd::String, gd::InstructionMetadata > actionsInfos;
    std::map<gd::String, gd::ExpressionMetadata > expressionsInfos;
    std::map<gd::String, gd::ExpressionMetadata > strExpressionsInfos;
    std::map<gd::String, gd::EventMetadata > eventsInfos;
    #endif

    ObjectMetadata badObjectMetadata;
    BehaviorMetadata badBehaviorMetadata;
    #if defined(GD_IDE_ONLY)
    static std::map<gd::String, gd::InstructionMetadata > badConditionsMetadata; ///< Used when a condition is not found in the extension
    static std::map<gd::String, gd::InstructionMetadata > badActionsMetadata;  ///< Used when an action is not found in the extension
    static std::map<gd::String, gd::ExpressionMetadata > badExpressionsMetadata; ///< Used when an expression is not found in the extension
    static std::map<gd::String, gd::ExpressionMetadata > badStrExpressionsMetadata;///< Used when an expression is not found in the extension
    #endif
};

}


#if defined(GD_IDE_ONLY)

#if !defined(GD_NO_WX_GUI)
    #define GD_COMPLETE_WX_COMPILATION_INFORMATION() compilationInfo.wxWidgetsMajorVersion = wxMAJOR_VERSION; \
    compilationInfo.wxWidgetsMinorVersion = wxMINOR_VERSION; \
    compilationInfo.wxWidgetsReleaseNumber = wxRELEASE_NUMBER; \
    compilationInfo.wxWidgetsSubReleaseNumber = wxSUBRELEASE_NUMBER;
#else
    #define GD_COMPLETE_WX_COMPILATION_INFORMATION() ;
#endif

/** \brief Macro used by extensions in their constructor to declare how they have been compiled.
 * \see gd::CompilationInfo
 */
#define GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION() compilationInfo.runtimeOnly = false; \
    compilationInfo.sfmlMajorVersion = 2; \
    compilationInfo.sfmlMinorVersion = 0; \
    compilationInfo.gdCoreVersion = GDCore_RC_FILEVERSION_STRING; \
    compilationInfo.sizeOfpInt = sizeof(int*); \
    GD_COMPLETE_WX_COMPILATION_INFORMATION() \
    compilationInfo.gccMajorVersion = __GNUC__; \
    compilationInfo.gccMinorVersion = __GNUC_MINOR__; \
    compilationInfo.gccPatchLevel = __GNUC_PATCHLEVEL__; \
    compilationInfo.informationCompleted = true;
#else
/** \brief Macro used by extensions in their constructor to declare how they have been compiled.
 * \see gd::CompilationInfo
 */
#define GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION() compilationInfo.runtimeOnly = true;\
    compilationInfo.sfmlMajorVersion = 2; \
    compilationInfo.sfmlMinorVersion = 0; \
    compilationInfo.gdCoreVersion = GDCore_RC_FILEVERSION_STRING; \
    compilationInfo.sizeOfpInt = sizeof(int*); \
    compilationInfo.gccMajorVersion = __GNUC__; \
    compilationInfo.gccMinorVersion = __GNUC_MINOR__; \
    compilationInfo.gccPatchLevel = __GNUC_PATCHLEVEL__; \
    compilationInfo.informationCompleted = true;

#endif

#include "GDCore/Extensions/PlatformExtension.inl"

#endif // GDCORE_PLATFORMEXTENSION_H
