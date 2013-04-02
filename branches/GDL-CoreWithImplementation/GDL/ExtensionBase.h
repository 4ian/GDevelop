/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EXTENSIONBASE_H
#define EXTENSIONBASE_H

#if defined(GD_IDE_ONLY)
class Game;
namespace gd { class MainFrameWrapper; }
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include <wx/bitmap.h>
#include <wx/file.h>
#include <wx/intl.h>
#endif

#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/Events/ObjectMetadata.h"
#include "GDCore/Events/AutomatismMetadata.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#endif
class RuntimeScene;
namespace gd { class Instruction; }
namespace gd { class Automatism; }; typedef gd::Automatism Automatism;
class Game;
class Scene;
namespace gd { class Object; }
class RuntimeObject;
class ExtensionBase;
namespace gd { class BaseEvent; }
class AutomatismsSharedDatas;
namespace gd {class ArbitraryResourceWorker;}
class EventsCodeGenerationContext;
class EventsCodeGenerator;
#undef CreateEvent

//Declare typedefs for objects creations/destructions functions
typedef void (*DestroyFunPtr)(gd::Object*);
typedef gd::Object * (*CreateFunPtr)(std::string name);
typedef void (*DestroyRuntimeObjectFunPtr)(RuntimeObject*);
typedef RuntimeObject * (*CreateRuntimeObjectFunPtr)(RuntimeScene & scene, const gd::Object & object);

#if defined(GD_IDE_ONLY) //Condition, Action and expressions declare more things at edittime ( Description, icons... )

/**
 * Declare the extension.
 */
#define DECLARE_THE_EXTENSION(name_, fullname_, description_, author_, license_) name = name_; \
                                                                                SetNameSpace(name_);\
                                                                                fullname = std::string(fullname_.mb_str()); \
                                                                                informations = (std::string(description_.mb_str()));\
                                                                                author = author_; \
                                                                                license = license_;

/**
 * Start declaring a condition, and some information about it.
 * DECLARE_END_CONDITION need to be used after having declared parameter ( instrInfo.AddParameter ).
 */
#define DECLARE_CONDITION(name_, fullname_, description_, sentence_, group_, icon_, smallicon_) { \
            gd::InstructionMetadata instrInfo(GetNameSpace()); \
            std::string currentConditionDeclarationName = name_; \
            instrInfo.fullname = std::string(fullname_.mb_str()); \
            instrInfo.description = std::string(description_.mb_str()); \
            instrInfo.sentence = std::string(sentence_.mb_str()); \
            instrInfo.group = std::string(group_.mb_str()); \
            if ( wxFile::Exists(icon_) )\
            {\
                instrInfo.icon = wxBitmap(icon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.icon = wxBitmap(24,24);}\
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}

/**
 * Start declaring an action, and some information about it.
 * DECLARE_END_ACTION need to be used after having declared parameter ( instrInfo.AddParameter ).
 */
#define DECLARE_ACTION(name_, fullname_, description_, sentence_, group_, icon_, smallicon_) { \
            gd::InstructionMetadata instrInfo(GetNameSpace()); \
            std::string currentActionDeclarationName = name_; \
            instrInfo.fullname = std::string(fullname_.mb_str()); \
            instrInfo.description = std::string(description_.mb_str()); \
            instrInfo.sentence = std::string(sentence_.mb_str()); \
            instrInfo.group = std::string(group_.mb_str()); \
            if ( wxFile::Exists(icon_) )\
            {\
                instrInfo.icon = wxBitmap(icon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.icon = wxBitmap(24,24);}\
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}

/**
 * Start declaring a condition for an object, and some information about it.
 * DECLARE_END_OBJECT_CONDITION need to be used after having declared parameter ( instrInfo.AddParameter ).
 */
#define DECLARE_OBJECT_CONDITION(name_, fullname_, description_, sentence_, group_, icon_, smallicon_) { \
            gd::InstructionMetadata instrInfo(GetNameSpace()); \
            std::string currentObjConditionDeclarationName = name_; \
            instrInfo.fullname = std::string(fullname_.mb_str()); \
            instrInfo.description = std::string(description_.mb_str()); \
            instrInfo.sentence = std::string(sentence_.mb_str()); \
            instrInfo.group = std::string(group_.mb_str()); \
            if ( wxFile::Exists(icon_) )\
            {\
                instrInfo.icon = wxBitmap(icon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.icon = wxBitmap(24,24);}\
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}
/**
 * Start declaring an action for an object, and some information about it.
 * DECLARE_END_OBJECT_ACTION need to be used after having declared parameter ( instrInfo.AddParameter ).
 */
#define DECLARE_OBJECT_ACTION(name_, fullname_, description_, sentence_, group_, icon_, smallicon_) { \
            gd::InstructionMetadata instrInfo(GetNameSpace()); \
            std::string currentObjActionDeclarationName = name_; \
            instrInfo.fullname = std::string(fullname_.mb_str()); \
            instrInfo.description = std::string(description_.mb_str()); \
            instrInfo.sentence = std::string(sentence_.mb_str()); \
            instrInfo.group = std::string(group_.mb_str()); \
            if ( wxFile::Exists(icon_) )\
            {\
                instrInfo.icon = wxBitmap(icon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.icon = wxBitmap(24,24);}\
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}


/**
 * Start declaring a condition for an object, and some information about it.
 * DECLARE_END_AUTOMATISM_CONDITION need to be used after having declared parameter ( instrInfo.AddParameter ).
 */
#define DECLARE_AUTOMATISM_CONDITION(name_, fullname_, description_, sentence_, group_, icon_, smallicon_) { \
            gd::InstructionMetadata instrInfo(GetNameSpace()); \
            std::string currentAutoConditionDeclarationName = name_; \
            instrInfo.fullname = std::string(fullname_.mb_str()); \
            instrInfo.description = std::string(description_.mb_str()); \
            instrInfo.sentence = std::string(sentence_.mb_str()); \
            instrInfo.group = std::string(group_.mb_str()); \
            if ( wxFile::Exists(icon_) )\
            {\
                instrInfo.icon = wxBitmap(icon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.icon = wxBitmap(24,24);}\
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}
/**
 * Start declaring an action for an object, and some information about it.
 * DECLARE_END_AUTOMATISM_ACTION need to be used after having declared parameter ( instrInfo.AddParameter ).
 */
#define DECLARE_AUTOMATISM_ACTION(name_, fullname_, description_, sentence_, group_, icon_, smallicon_) { \
            gd::InstructionMetadata instrInfo(GetNameSpace()); \
            std::string currentAutoActionDeclarationName = name_; \
            instrInfo.fullname = std::string(fullname_.mb_str()); \
            instrInfo.description = std::string(description_.mb_str()); \
            instrInfo.sentence = std::string(sentence_.mb_str()); \
            instrInfo.group = std::string(group_.mb_str()); \
            if ( wxFile::Exists(icon_) )\
            {\
                instrInfo.icon = wxBitmap(icon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.icon = wxBitmap(24,24);}\
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}

/**
 * Start declaring an object.
 * @param name
 * @param fullname displayed in editor
 * @param Informations about the object
 * @param Path to an icon
 * @param Function for creation
 * @param Function for creation from another object
 * @param Function for destroying the object
 */
#define DECLARE_OBJECT(name_, fullname_, informations_, icon24x24_, createFunPtrP, destroyFunPtrP, createRuntimeObjectFunPtrP, destroyRuntimeObjectFunPtrP, cppClassName_) { \
            ExtensionObjectInfos objInfos; \
            std::string currentObjectDeclarationName = name_; \
            objInfos.SetFullName(std::string(fullname_.mb_str()));\
            objInfos.SetDescription(std::string(informations_.mb_str()));\
            objInfos.SetBitmapIcon(wxBitmap(icon24x24_, wxBITMAP_TYPE_ANY)); \
            objInfos.createFunPtr = createFunPtrP;\
            objInfos.destroyFunPtr = destroyFunPtrP;\
            objInfos.createRuntimeObjectFunPtr = createRuntimeObjectFunPtrP;\
            objInfos.destroyRuntimeObjectFunPtr = destroyRuntimeObjectFunPtrP;\
            objInfos.cppClassName = cppClassName_;

/**
 * Declare an expression
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
 * @param Function
 */
#define DECLARE_EXPRESSION(name_, fullname_, description_, group_, smallicon_) { \
            gd::ExpressionMetadata instrInfo(GetNameSpace()); \
            std::string currentExprDeclarationName = name_;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}

/**
 * Declare an object expression
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
 * @param Function
 */
#define DECLARE_OBJECT_EXPRESSION(name_, fullname_, description_, group_, smallicon_) { \
            gd::ExpressionMetadata instrInfo(GetNameSpace()); \
            std::string currentExprDeclarationName = name_;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}

/**
 * Declare an automatism expression
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
 * @param Function
 */
#define DECLARE_AUTOMATISM_EXPRESSION(name_, fullname_, description_, group_, smallicon_) { \
            gd::ExpressionMetadata instrInfo(GetNameSpace()); \
            std::string currentExprDeclarationName = name_;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}

/**
 * Declare a string expression
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
 */
#define DECLARE_STR_EXPRESSION(name_, fullname_, description_, group_, smallicon_) { \
            gd::StrExpressionMetadata instrInfo(GetNameSpace()); \
            std::string currentExprDeclarationName = name_;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}

/**
 * Declare an object string expression
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
 * @param Function
 */
#define DECLARE_OBJECT_STR_EXPRESSION(name_, fullname_, description_, group_, smallicon_) { \
            gd::StrExpressionMetadata instrInfo(GetNameSpace()); \
            std::string currentExprDeclarationName = name_;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}

/**
 * Declare an automatism string expression
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
 * @param Function
 */
#define DECLARE_AUTOMATISM_STR_EXPRESSION(name_, fullname_, description_, group_, smallicon_) { \
            gd::StrExpressionMetadata instrInfo(GetNameSpace()); \
            std::string currentExprDeclarationName = name_;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}

/**
 * Declare a custom event
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group
 * @param filename of a small icon
 * @param class representing the event
 */
#define DECLARE_EVENT(name_, fullname_, description_, group_, smallicon_, className_) { \
            EventInfos eventInfo; \
            std::string currentEventDeclarationName = name_;\
            eventInfo.fullname = fullname_; \
            eventInfo.description = description_; \
            eventInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                eventInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { eventInfo.smallicon = wxBitmap(16,16);} \
            eventInfo.instance = boost::shared_ptr<gd::BaseEvent>(new className_); \
            eventInfo.instance->SetType(GetNameSpace()+currentEventDeclarationName);

/**
 * Declare an automatism
 * @param name
 * @param fullname displayed in editor
 * @param default name of an instance of the automatism
 * @param description displayed in editor
 * @param group
 * @param filename of a small icon
 * @param class representing the automatism
 */
#define DECLARE_AUTOMATISM(name_, fullname_, defaultName_, description_, group_, icon24x24_, className_, sharedDatasClassName_) { \
            AutomatismInfo automatismInfo; \
            std::string currentAutomatismDeclarationName = name_;\
            automatismInfo.SetFullName(std::string(fullname_.mb_str())); \
            automatismInfo.SetDescription(std::string(description_.mb_str())); \
            automatismInfo.SetDefaultName(std::string(defaultName_.mb_str()));\
            automatismInfo.SetGroup(group_); \
            automatismInfo.cppClassName = #className_;\
            if ( wxFile::Exists(icon24x24_) )\
            {\
                automatismInfo.SetBitmapIcon(wxBitmap(icon24x24_, wxBITMAP_TYPE_ANY)); \
            } else { automatismInfo.SetBitmapIcon(wxBitmap(24,24));} \
            automatismInfo.instance = boost::shared_ptr<Automatism>(new className_(GetNameSpace()+currentAutomatismDeclarationName));\
            automatismInfo.sharedDatasInstance = boost::shared_ptr<AutomatismsSharedDatas>(new sharedDatasClassName_(GetNameSpace()+currentAutomatismDeclarationName));

/**
 * Need to be added after DECLARE_CONDITION and DECLARE_PARAMTERs.
 */
#define DECLARE_END_CONDITION() conditionsInfos[GetNameSpace()+currentConditionDeclarationName] = instrInfo; \
            }

/**
 * Need to be added after DECLARE_CONDITION and DECLARE_PARAMTERs.
 */
#define DECLARE_END_ACTION() actionsInfos[GetNameSpace()+currentActionDeclarationName] = instrInfo; \
            }

/**
 * Need to be added after DECLARE_OBJECT_CONDITION and DECLARE_PARAMTERs.
 */
#define DECLARE_END_OBJECT_CONDITION() objInfos.conditionsInfos[GetNameSpace()+currentObjConditionDeclarationName] = instrInfo; \
            }

/**
 * Need to be added after DECLARE_OBJECT_ACTION and DECLARE_PARAMTERs.
 */
#define DECLARE_END_OBJECT_ACTION() objInfos.actionsInfos[GetNameSpace()+currentObjActionDeclarationName] = instrInfo; \
            }
/**
 * Need to be added after DECLARE_AUTOMATISM_CONDITION and DECLARE_PARAMTERs.
 */
#define DECLARE_END_AUTOMATISM_CONDITION() automatismInfo.conditionsInfos[GetNameSpace()+currentAutoConditionDeclarationName] = instrInfo; \
            }

/**
 * Need to be added after DECLARE_AUTOMATISM_ACTION and DECLARE_PARAMTERs.
 */
#define DECLARE_END_AUTOMATISM_ACTION() automatismInfo.actionsInfos[GetNameSpace()+currentAutoActionDeclarationName] = instrInfo; \
            }

/**
 * Need to be added after DECLARE_EXPRESSION and all parameters.
 */
#define DECLARE_END_EXPRESSION() expressionsInfos[GetNameSpace()+currentExprDeclarationName]=instrInfo;\
            }

/**
 * Need to be added after DECLARE_STR_EXPRESSION and all parameters.
 */
#define DECLARE_END_STR_EXPRESSION() strExpressionsInfos[GetNameSpace()+currentExprDeclarationName]=instrInfo;\
            }

/**
 * Need to be added after DECLARE_OBJECT_EXPRESSION and all parameters.
 */
#define DECLARE_END_OBJECT_EXPRESSION() objInfos.expressionsInfos[currentExprDeclarationName]=instrInfo;\
            }

/**
 * Need to be added after DECLARE_OBJECT_STR_EXPRESSION and all parameters.
 */
#define DECLARE_END_OBJECT_STR_EXPRESSION() objInfos.strExpressionsInfos[currentExprDeclarationName]=instrInfo;\
            }

/**
 * Need to be added after DECLARE_AUTOMATISM_EXPRESSION and all parameters.
 */
#define DECLARE_END_AUTOMATISM_EXPRESSION() automatismInfo.expressionsInfos[currentExprDeclarationName]=instrInfo;\
            }

/**
 * Need to be added after DECLARE_AUTOMATISM_STR_EXPRESSION and all parameters.
 */
#define DECLARE_END_AUTOMATISM_STR_EXPRESSION() automatismInfo.strExpressionsInfos[currentExprDeclarationName]=instrInfo;\
            }

/**
 * Need to be added after DECLARE_EVENT
 */
#define DECLARE_END_EVENT() eventsInfos[GetNameSpace()+currentEventDeclarationName] = eventInfo; \
            }

#else //Condition, actions and expressions declare less thing in runtime only

#define DECLARE_THE_EXTENSION(name_, fullname_, description_, author_, license_) name = name_; \
                                                                                SetNameSpace(name_);

#define DECLARE_OBJECT(name_, fullname, informations, icon, createFunPtrP, destroyFunPtrP, createRuntimeObjectFunPtrP, destroyRuntimeObjectFunPtrP, cppClassName_) { \
            ExtensionObjectInfos objInfos; \
            std::string currentObjectDeclarationName = name_; \
            objInfos.createFunPtr = createFunPtrP;\
            objInfos.destroyFunPtr = destroyFunPtrP; \
            objInfos.createRuntimeObjectFunPtr = createRuntimeObjectFunPtrP;\
            objInfos.destroyRuntimeObjectFunPtr = destroyRuntimeObjectFunPtrP;\

#define DECLARE_AUTOMATISM(name_, fullname_, defaultName_, description_, group_, smallicon_, className_, sharedDatasClassName_) { \
            AutomatismInfo automatismInfo; \
            std::string currentAutomatismDeclarationName = name_;\
            automatismInfo.instance = boost::shared_ptr<Automatism>(new className_(GetNameSpace()+currentAutomatismDeclarationName)); \
            automatismInfo.sharedDatasInstance = boost::shared_ptr<AutomatismsSharedDatas>(new sharedDatasClassName_(GetNameSpace()+currentAutomatismDeclarationName));

//Emulating wxWidgets internationalization macro
#ifndef _
#define _(x) x // "Emule" la macro de WxWidgets
#endif
#ifndef _
#define wxT(x) x // "Emule" la macro de WxWidgets
#endif

#endif //End of runtime only declarations

/**
 * Need to be added after DECLARE_OBJECT and all actions/conditions/expressions.
 */
#define DECLARE_END_OBJECT() objectsInfos[GetNameSpace()+currentObjectDeclarationName] = objInfos; \
            }

/**
 * Need to be added after DECLARE_AUTOMATISM and all actions/conditions/expressions.
 */
#define DECLARE_END_AUTOMATISM()  automatismsInfo[GetNameSpace()+currentAutomatismDeclarationName] = automatismInfo; \
            }


#if defined(GD_IDE_ONLY)

/**
 * \brief Contains user-friendly infos about event, only at edittime, and members needed to create an event
 */
class GD_API EventInfos
{
    public:

    EventInfos();
    virtual ~EventInfos() {};

    std::string fullname;
    std::string description;
    std::string group;
    wxBitmap smallicon;

    boost::shared_ptr<gd::BaseEvent> instance;
};

#endif

/**
 * \brief Contains user-friendly infos about an automatism, only at edittime, and members needed to create the automatism
 */
class GD_API AutomatismInfo
#if defined(GD_IDE_ONLY)
: public gd::AutomatismMetadata
#endif
{
public:

    AutomatismInfo();
    virtual ~AutomatismInfo();

#if defined(GD_IDE_ONLY)
    /**
     * Set that the automatism is located in a specific include file
     */
    AutomatismInfo & SetIncludeFile(const std::string & includeFile) { optionalIncludeFile = includeFile; return *this; }

    std::map<std::string, gd::InstructionMetadata > conditionsInfos;
    std::map<std::string, gd::InstructionMetadata > actionsInfos;
    std::map<std::string, gd::ExpressionMetadata > expressionsInfos;
    std::map<std::string, gd::StrExpressionMetadata > strExpressionsInfos;

    std::string optionalIncludeFile;
    std::string cppClassName;
#endif

    boost::shared_ptr<Automatism> instance;
    boost::shared_ptr<AutomatismsSharedDatas> sharedDatasInstance;
};

/**
 * \brief Struct for getting user-friendly infos about objects, only at edittime
 */
class GD_API ExtensionObjectInfos
#if defined(GD_IDE_ONLY)
: public gd::ObjectMetadata
#endif
{
public:

    ExtensionObjectInfos();
    virtual ~ExtensionObjectInfos() {};

#if defined(GD_IDE_ONLY)
    /**
     * Set that the object is located in a specific include file
     */
    ExtensionObjectInfos & SetIncludeFile(const std::string & includeFile) { optionalIncludeFile = includeFile; return *this; }

    std::map<std::string, gd::InstructionMetadata > conditionsInfos;
    std::map<std::string, gd::InstructionMetadata > actionsInfos;
    std::map<std::string, gd::ExpressionMetadata > expressionsInfos;
    std::map<std::string, gd::StrExpressionMetadata > strExpressionsInfos;

    std::string optionalIncludeFile;
    std::string cppClassName;
#endif

    DestroyFunPtr destroyFunPtr;
    CreateFunPtr createFunPtr;
    DestroyRuntimeObjectFunPtr destroyRuntimeObjectFunPtr;
    CreateRuntimeObjectFunPtr createRuntimeObjectFunPtr;
};

/**
 * \brief Class used in extension to be sure that extension is compatible.
 */
class GD_API CompilationInfos
{
    public :
    CompilationInfos() : informationCompleted(false) {};
    virtual ~CompilationInfos() {};

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

    std::string gdlVersion;
    int sizeOfpInt;
};

/**
 * \brief Base class for C++ extensions.
 * Extensions can provide :
 *
 *  - Static functions ( e.g. GetActionFunctionPtr ).
 *  - Objects functions ( e.g. GetObjectActionFunctionPtr )
 *  - New objects, which have a type. The new
 *   objects creations/destructions functions are provided
 *   by the extension.
 *  - Information at edittime
 */
class GD_API ExtensionBase
#if defined(GD_IDE_ONLY)
: public gd::PlatformExtension
#endif
{
public :

    ExtensionBase() {};
    virtual ~ExtensionBase() {};
    CompilationInfos compilationInfo;

    virtual const std::string & GetName() const { return name; }

    /**
     * Return a function to create the object if the type is handled by the extension
     */
    CreateFunPtr GetObjectCreationFunctionPtr(std::string objectType) const;

    /**
     * Make sure that the object from an extension is deleted by the same extension.
     */
    DestroyFunPtr GetDestroyObjectFunction(std::string objectType) const;

    /**
     * Return a function to create the runtime object if the type is handled by the extension
     */
    CreateRuntimeObjectFunPtr        GetRuntimeObjectCreationFunctionPtr(std::string objectType) const;

    /**
     * Make sure that the runtime object from an extension is deleted by the same extension.
     */
    DestroyRuntimeObjectFunPtr       GetDestroyRuntimeObjectFunction(std::string objectType) const;

    /**
     * Create an automatism
     * Return NULL if automatismType is not provided by the extension.
     */
    Automatism* CreateAutomatism(std::string automatismType) const;

    /**
     * Create shared datas of an automatism
     * Return NULL if automatismType is not provided by the extension.
     */
    boost::shared_ptr<AutomatismsSharedDatas> CreateAutomatismSharedDatas(std::string automatismType) const;

    /**
     * Get the namespace
     */
    inline std::string GetNameSpace() { return nameSpace; };

    /**
     * Called when a scene is loaded: Useful to initialize some extensions specific objects related to scene
     */
    virtual void SceneLoaded(RuntimeScene & scene);

    /**
     * Called when a scene is unloaded: Useful to destroy some extensions specific objects related to scene
     */
    virtual void SceneUnloaded(RuntimeScene & scene);

    /**
     * Redefine this method to return true if you want the method ObjectDeletedFromScene to be called by RuntimeScene when
     *
     * \see ExtensionBase::ToBeNotifiedOnObjectDeletion
     */
    virtual bool ToBeNotifiedOnObjectDeletion() { return false; }

    /**
     * Called by RuntimeScene, if ToBeNotifiedOnObjectDeletion() returns true, when an object is about to be deleted.
     *
     * \see ExtensionBase::ObjectDeletedFromScene
     */
    virtual void ObjectDeletedFromScene(RuntimeScene & scene, RuntimeObject * objectDeleted) {};

    /**
     * Return a vector containing all the object types provided by the extension
     */
    virtual std::vector < std::string > GetExtensionObjectsTypes() const;

    #if defined(GD_IDE_ONLY)
    /** \name Specializations of gd::PlatformExtension members
     * See gd::PlatformExtension documentation for more information about what these members functions should do.
     */
    ///@{
    virtual const std::string & GetDescription() const { return informations; }
    virtual const std::string & GetAuthor() const { return author; }
    virtual const std::string & GetLicense() const { return license; }
    virtual const std::string & GetFullName() const { return fullname; }
    virtual bool IsBuiltin() const { return nameSpace.empty(); }

    virtual std::vector < std::string > GetAutomatismsTypes() const;
    virtual const ExtensionObjectInfos & GetObjectMetadata(const std::string & objectType) const;
    virtual const AutomatismInfo & GetAutomatismMetadata(const std::string & automatismType) const;

    virtual const std::map<std::string, gd::InstructionMetadata > & GetAllActions() const;
    virtual const std::map<std::string, gd::InstructionMetadata > & GetAllConditions() const;
    virtual const std::map<std::string, gd::ExpressionMetadata > & GetAllExpressions() const;
    virtual const std::map<std::string, gd::StrExpressionMetadata > & GetAllStrExpressions() const;
    virtual const std::map<std::string, gd::InstructionMetadata > & GetAllActionsForObject(std::string objectType) const;
    virtual const std::map<std::string, gd::InstructionMetadata > & GetAllConditionsForObject(std::string objectType) const;
    virtual const std::map<std::string, gd::ExpressionMetadata > & GetAllExpressionsForObject(std::string objectType) const;
    virtual const std::map<std::string, gd::StrExpressionMetadata > & GetAllStrExpressionsForObject(std::string objectType) const;
    virtual const std::map<std::string, EventInfos > & GetAllEvents() const;
    virtual const std::map<std::string, AutomatismInfo > & GetAllAutomatisms() const;
    virtual const std::map<std::string, gd::InstructionMetadata > & GetAllActionsForAutomatism(std::string autoType) const;
    virtual const std::map<std::string, gd::InstructionMetadata > & GetAllConditionsForAutomatism(std::string autoType) const;
    virtual const std::map<std::string, gd::ExpressionMetadata > & GetAllExpressionsForAutomatism(std::string autoType) const;
    virtual const std::map<std::string, gd::StrExpressionMetadata > & GetAllStrExpressionsForAutomatism(std::string autoType) const;
    ///@}

    const std::vector < std::pair<std::string, std::string> > & GetSupplementaryRuntimeFiles() const { return supplementaryRuntimeFiles; };
    const std::vector < std::string > & GetSupplementaryIncludeDirectories() const { return supplementaryIncludeDirectories; };
    const std::vector < std::string > & GetSupplementaryLibFiles() const { return supplementaryLibFiles; };

    /**
     * Create a custom event.
     * Return NULL if eventType is not provided by the extension.
     */
    boost::shared_ptr<gd::BaseEvent> CreateEvent(std::string eventType) const;

    /**
     * Called ( e.g. during compilation ) so as to inventory resources used by conditions and update their filename
     *
     * \see ExtensionBase::ExposeActionsResources
     */
    virtual void ExposeConditionsResources(gd::Instruction & condition, gd::ArbitraryResourceWorker & worker) {};

    /**
     * Called ( e.g. during compilation ) so as to inventory resources used by actions and update their filename
     *
     * \see ArbitraryResourceWorker
     */
    virtual void ExposeActionsResources(gd::Instruction & action, gd::ArbitraryResourceWorker & worker) {};

    /**
     * Must return true if the extension has something to display in debugger.
     */
    virtual bool HasDebuggingProperties() const { return false; };

    /**
     * Called by the debugger so as to get a property value and name.
     * \see Object::GetPropertyForDebugger
     */
    virtual void GetPropertyForDebugger(RuntimeScene & scene, unsigned int propertyNb, std::string & name, std::string & value) const {};

    /**
     * Called by the debugger so as to update a property
     * \see Object::ChangeProperty
     */
    virtual bool ChangeProperty(RuntimeScene & scene, unsigned int propertyNb, std::string newValue) { return false; };

    /**
     * Must return the number of available properties for the debugger
     */
    virtual unsigned int GetNumberOfProperties(RuntimeScene & scene) const { return 0; };
    #endif

protected :

    /**
     * Set the namespace ( the string each actions/conditions/expressions start with )
     */
    void SetNameSpace(std::string nameSpace_);

    std::string name;

    std::map<std::string, ExtensionObjectInfos > objectsInfos;
    std::map<std::string, AutomatismInfo > automatismsInfo;

    static std::map<std::string, ExtensionObjectInfos > badObjectsInfos; ///< Used when an object is not found in the extension
    static std::map<std::string, AutomatismInfo > badAutomatismsInfo;///< Used when an automatism is not found in the extension

    #if defined(GD_IDE_ONLY) //Information available only at edittime
    std::string fullname; ///<Name displayed to users at edittime
    std::string informations; ///<Description displayed to users at edittime
    std::string author; ///<Author displayed to users at edittime
    std::string license;  ///<License name displayed to users at edittime
    std::vector < std::pair<std::string, std::string> > supplementaryRuntimeFiles; ///<Supplementary runtime files to copy on compilation
    std::vector < std::string > supplementaryIncludeDirectories; ///<Supplementary include directories to use on events compilation
    std::vector < std::string > supplementaryLibFiles; ///<Supplementary libraries files to be used when compiling events with this extension. Files must be in CppPlatform/Extensions and CppPlatform/Extensions/Runtime directories. The filename will be completed with lib and .a.

    std::map<std::string, gd::InstructionMetadata > conditionsInfos;
    std::map<std::string, gd::InstructionMetadata > actionsInfos;
    std::map<std::string, gd::ExpressionMetadata > expressionsInfos;
    std::map<std::string, gd::StrExpressionMetadata > strExpressionsInfos;
    std::map<std::string, EventInfos > eventsInfos;

    static std::map<std::string, gd::InstructionMetadata > badConditionsInfos; ///< Used when a condition is not found in the extension
    static std::map<std::string, gd::InstructionMetadata > badActionsInfos;  ///< Used when an action is not found in the extension
    static std::map<std::string, gd::ExpressionMetadata > badExpressionsInfos; ///< Used when an expression is not found in the extension
    static std::map<std::string, gd::StrExpressionMetadata > badStrExpressionsInfos;///< Used when an expression is not found in the extension
    #endif

private:

    /**
     * Automatically set from the name of the extension, and added
     * to every actions/conditions/expressions/objects/automatism/event.
     */
    std::string nameSpace;
};

#endif // EXTENSIONBASE_H

