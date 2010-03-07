/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EXTENSIONBASE_H
#define EXTENSIONBASE_H

#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;
class Object;
class ExtensionBase;
class ExpressionInstruction;

#if defined(GDE)
class Game;
class MainEditorCommand;
#include <wx/bitmap.h>
#include <wx/file.h>
#include <wx/wx.h>
#endif

typedef boost::shared_ptr<Object> ObjSPtr;

//Declare typedefs for static/objects functions and expressions
typedef bool (*InstructionFunPtr)( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
typedef bool (Object::*InstructionObjectFunPtr)( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval );
typedef double (*ExpressionFunPtr)( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & expression );
typedef double (Object::*ExpressionObjectFunPtr)( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & expression );

//Declare typedefs for objects creations/destructions functions
typedef void (*DestroyFunPtr)(Object*);
typedef Object * (*CreateFunPtr)(std::string name);
typedef Object * (*CreateByCopyFunPtr)(Object *);

#if defined(GDE) //Condition, Action and expressions declare more thing in editor

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
 * DECLARE_END_CONDITION need to be used after having declared parameter ( DECLARE_PARAMETER ).
 */
#define DECLARE_CONDITION(name_, fullname_, description_, sentence_, group_, icon_, smallicon_, ptr_) { \
            InstructionInfos instrInfo; \
            std::string currentConditionDeclarationName = name_; \
            instrInfo.instructionFunPtr = ptr_; \
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
 * DECLARE_END_ACTION need to be used after having declared parameter ( DECLARE_PARAMETER ).
 */
#define DECLARE_ACTION(name_, fullname_, description_, sentence_, group_, icon_, smallicon_, ptr_) { \
            InstructionInfos instrInfo; \
            std::string currentActionDeclarationName = name_; \
            instrInfo.instructionFunPtr = ptr_; \
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
 * DECLARE_END_OBJECT_CONDITION need to be used after having declared parameter ( DECLARE_PARAMETER ).
 */
#define DECLARE_OBJECT_CONDITION(name_, fullname_, description_, sentence_, group_, icon_, smallicon_, ptr_) { \
            InstructionInfos instrInfo; \
            std::string currentObjConditionDeclarationName = name_; \
            instrInfo.instructionObjectFunPtr = (InstructionObjectFunPtr)ptr_; \
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
 * DECLARE_END_OBJECT_ACTION need to be used after having declared parameter ( DECLARE_PARAMETER ).
 */
#define DECLARE_OBJECT_ACTION(name_, fullname_, description_, sentence_, group_, icon_, smallicon_, ptr_) { \
            InstructionInfos instrInfo; \
            std::string currentObjActionDeclarationName = name_; \
            instrInfo.instructionObjectFunPtr = (InstructionObjectFunPtr)ptr_; \
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
 * Start declaring a parameter of a action or condition.
 * @param Type ( objet, expression... )
 * @param Description shown in editor
 * @param Set true if the parameter is an object
 * @param Set the type of the object, so as to verify a bad object type is not passed to the action/condition.
 */
#define DECLARE_PARAMETER(type_, desc_, useObj_, objType_) { \
                ParameterInfo parameter; \
                parameter.useObject = useObj_; \
                parameter.objectType = GetNameSpace()+objType_; \
                parameter.type = type_; \
                parameter.optional = false; \
                parameter.description = std::string(desc_.mb_str()); \
                instrInfo.parameters.push_back(parameter); \
                }

#define DECLARE_PARAMETER_OPTIONAL(type_, desc_, useObj_, objType_) { \
                ParameterInfo parameter; \
                parameter.useObject = useObj_; \
                parameter.objectType = GetNameSpace()+objType_; \
                parameter.type = type_; \
                parameter.optional = true; \
                parameter.description = std::string(desc_.mb_str()); \
                instrInfo.parameters.push_back(parameter); \
                }

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
#define DECLARE_OBJECT(name_, fullname_, informations_, icon_, createFunPtrP, createByCopyFunPtrP, destroyFunPtrP) { \
            ExtensionObjectInfos objInfos; \
            std::string currentObjectDeclarationName = name_; \
            objInfos.fullname = std::string(fullname_.mb_str());\
            objInfos.informations = std::string(informations_.mb_str());\
            objInfos.icon = wxBitmap(icon_, wxBITMAP_TYPE_ANY); \
            objInfos.createFunPtr = createFunPtrP;\
            objInfos.createByCopyFunPtr = createByCopyFunPtrP;\
            objInfos.destroyFunPtr = destroyFunPtrP;

/**
 * Declare an expression
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param Function
 */
#define DECLARE_EXPRESSION(name_, fullname_, description_, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionFunPtr = ptr;\
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
 * @param Function
 */
#define DECLARE_OBJECT_EXPRESSION(name_, fullname_, description_, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionObjectFunPtr = (ExpressionObjectFunPtr)ptr;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}

/**
 * Declare an hidden expression ( not displayed in editor )
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param Function
 */
#define DECLARE_HIDDEN_EXPRESSION(name_, fullname_, description_, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionFunPtr = ptr;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}\
            instrInfo.shown = false;

/**
 * Declare an hidden object expression ( not displayed in editor )
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param Function
 */
#define DECLARE_OBJECT_HIDDEN_EXPRESSION(name_, fullname_, description_, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionObjectFunPtr = (ExpressionObjectFunPtr)ptr;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}\
            instrInfo.shown = false;


#define MAIN_OBJECTS_IN_PARAMETER(x) instrInfo.mainObjects.push_back(x);
#define MAIN_OBJECTS_IN_PARAMETERS(x, y) instrInfo.mainObjects.push_back(x); instrInfo.mainObjects.push_back(y);

#else //Condition, actions and expressions declare less thing in runtime only

#define DECLARE_THE_EXTENSION(name_, fullname_, description_, author_, license_) name = name_; \
                                                                                SetNameSpace(name_);

#define DECLARE_CONDITION(name, fullname, description, sentence, group_, icon, smallicon, ptr) { \
            InstructionInfos instrInfo; \
            std::string currentConditionDeclarationName = name; \
            instrInfo.instructionFunPtr = ptr;

#define DECLARE_ACTION(name, fullname, description, sentence, group_, icon, smallicon, ptr) { \
            InstructionInfos instrInfo; \
            std::string currentActionDeclarationName = name; \
            instrInfo.instructionFunPtr = ptr;

#define DECLARE_OBJECT_CONDITION(name, fullname, description, sentence, group_, icon, smallicon, ptr) { \
            InstructionInfos instrInfo; \
            std::string currentObjConditionDeclarationName = name; \
            instrInfo.instructionObjectFunPtr = (InstructionObjectFunPtr)ptr;

#define DECLARE_OBJECT_ACTION(name, fullname, description, sentence, icon, group_, smallicon, ptr) { \
            InstructionInfos instrInfo; \
            std::string currentObjActionDeclarationName = name; \
            instrInfo.instructionObjectFunPtr = (InstructionObjectFunPtr)ptr;

#define DECLARE_OBJECT(name_, fullname, informations, icon, createFunPtrP, createByCopyFunPtrP, destroyFunPtrP) { \
            ExtensionObjectInfos objInfos; \
            std::string currentObjectDeclarationName = name_; \
            objInfos.createFunPtr = createFunPtrP;\
            objInfos.createByCopyFunPtr = createByCopyFunPtrP;\
            objInfos.destroyFunPtr = destroyFunPtrP;

#define DECLARE_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionFunPtr = ptr;

#define DECLARE_OBJECT_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionObjectFunPtr = (ExpressionObjectFunPtr)ptr;

#define DECLARE_HIDDEN_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionFunPtr = ptr;

#define DECLARE_OBJECT_HIDDEN_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionObjectFunPtr = (ExpressionObjectFunPtr)ptr;

#define DECLARE_PARAMETER(type, desc, useObj, objType) { \
                ParameterInfo parameter; \
                parameter.useObject = useObj; \
                parameter.objectType = GetNameSpace()+objType; \
                instrInfo.parameters.push_back(parameter); \
                }

#define DECLARE_PARAMETER_OPTIONAL(type, desc, useObj, objType) { \
                ParameterInfo parameter; \
                parameter.useObject = useObj; \
                parameter.objectType = GetNameSpace()+objType; \
                instrInfo.parameters.push_back(parameter); \
                }

#define MAIN_OBJECTS_IN_PARAMETER(x)
#define MAIN_OBJECTS_IN_PARAMETERS(x, y)

//Emulate wxWidgets internationalization macro
#ifndef _
#define _(x) x // "Emule" la macro de WxWidgets
#endif
#ifndef _
#define wxT(x) x // "Emule" la macro de WxWidgets
#endif
#endif

/**
 * Need to be added after DECLARE_CONDITION and DECLARE_PARAMTERs.
 * Got an error from here ? Check you have not make a mistake between DECLARE_END_CONDITION/ACTION
 */
#define DECLARE_END_CONDITION() conditionsInfos[GetNameSpace()+currentConditionDeclarationName] = instrInfo; \
            }

/**
 * Need to be added after DECLARE_CONDITION and DECLARE_PARAMTERs.
 * Got an error from here ? Check you have not make a mistake between DECLARE_END_CONDITION/ACTION
 */
#define DECLARE_END_ACTION() actionsInfos[GetNameSpace()+currentActionDeclarationName] = instrInfo; \
            }

/**
 * Need to be added after DECLARE_CONDITION and DECLARE_PARAMTERs.
 * Got an error from here ? Check you have not make a mistake between DECLARE_END_CONDITION/ACTION
 */
#define DECLARE_END_OBJECT_CONDITION() objInfos.conditionsInfos[GetNameSpace()+currentObjConditionDeclarationName] = instrInfo; \
            }

/**
 * Need to be added after DECLARE_CONDITION and DECLARE_PARAMTERs.
 * Got an error from here ? Check you have not make a mistake between DECLARE_END_CONDITION/ACTION
 */
#define DECLARE_END_OBJECT_ACTION() objInfos.actionsInfos[GetNameSpace()+currentObjActionDeclarationName] = instrInfo; \
            }

/**
 * Need to be added after DECLARE_OBJECT and all actions/conditions/expressions.
 * Got an error from here ? Check you have not make a mistake between DECLARE_END_CONDITION/ACTION
 */
#define DECLARE_END_OBJECT() objectsInfos[GetNameSpace()+currentObjectDeclarationName] = objInfos; \
            }

/**
 * Need to be added after DECLARE_EXPRESSION and all actions/conditions/expressions.
 */
#define DECLARE_END_EXPRESSION() expressionsInfos[GetNameSpace()+currentExprDeclarationName]=instrInfo;\
            }
/**
 * Need to be added after DECLARE_OBJECT_EXPRESSION and all actions/conditions/expressions.
 */
#define DECLARE_END_OBJECT_EXPRESSION() objInfos.expressionsInfos[currentExprDeclarationName]=instrInfo;\
            }



/**
 * ParameterInfo contains user-friendly info about a parameter, only at edittime,
 * and information about what a parameter need
 */
class GD_API ParameterInfo
{
    public:

    ParameterInfo();
    virtual ~ParameterInfo() {};

    bool useObject;
    std::string objectType;

#if defined(GDE)
    std::string type;
    std::string description;
    bool optional;
#endif
};

/**
 * Contains user-friendly infos about actions/conditions, only at edittime,
 * and members needed to setup an instruction
 */
class GD_API InstructionInfos
{
    public:

    InstructionInfos();
    virtual ~InstructionInfos() {};

#if defined(GDE)
    std::string fullname;
    std::string description;
    std::string sentence;
    std::string group;
    wxBitmap icon;
    wxBitmap smallicon;
    std::vector < int > mainObjects;
#endif
    std::vector < ParameterInfo > parameters;
    InstructionFunPtr       instructionFunPtr;
    InstructionObjectFunPtr instructionObjectFunPtr;
};

/**
 * Contains user-friendly infos about expressions, only at edittime,
 * and members needed to setup an expression
 */
class GD_API ExpressionInfos
{
    public:

    ExpressionInfos();
    virtual ~ExpressionInfos() {};

#if defined(GDE)
    std::string fullname;
    std::string description;
    std::string group;
    bool shown;
    wxBitmap smallicon;
#endif

    std::vector < ParameterInfo > parameters;
    ExpressionFunPtr       expressionFunPtr;
    ExpressionObjectFunPtr expressionObjectFunPtr;
};

/**
 * Struct for getting user-friendly infos about objects, only at edittime
 */
class GD_API ExtensionObjectInfos
{
    public:

    ExtensionObjectInfos();
    virtual ~ExtensionObjectInfos() {};

#if defined(GDE)
    std::string fullname;
    std::string informations;
    wxBitmap icon;
#endif

    DestroyFunPtr destroyFunPtr;
    CreateFunPtr createFunPtr;
    CreateByCopyFunPtr createByCopyFunPtr;

    std::map<std::string, InstructionInfos > conditionsInfos;
    std::map<std::string, InstructionInfos > actionsInfos;
    std::map<std::string, ExpressionInfos > expressionsInfos;
};

class GD_API CompilationInfos
{
    public :
    CompilationInfos() : informationCompleted(false) {};
    virtual ~CompilationInfos() {};

    bool informationCompleted;

    /**
     * Information about if the extension was compiled for
     * runtime use only
     */
    bool runtimeOnly;

    #if defined(__GNUC__)
    int gccMajorVersion;
    int gccMinorVersion;
    int gccPatchLevel;
    #endif

    int boostVersion;

    int sfmlMajorVersion;
    int sfmlMinorVersion;

    #if defined(GDE)
    int wxWidgetsMajorVersion;
    int wxWidgetsMinorVersion;
    int wxWidgetsReleaseNumber;
    int wxWidgetsSubReleaseNumber;
    #endif

    std::string gdlVersion;
};

/**
 * Base class for C++ extensions.
 * Extensions can provide :
 *
 * -Static functions ( e.g. GetActionFunctionPtr ).
 * -Objects functions ( e.g. GetObjectActionFunctionPtr )
 * -New objects, which have a type. This type is associated
 *  with a typeId at runtime by ExtensionsManager. The new
 *  objects creations/destructions functions are provided
 *  by the extension.
 * -Information at edittime
 */
class GD_API ExtensionBase
{
    public :

    ExtensionBase() {};
    virtual ~ExtensionBase() {};
    CompilationInfos compilationInfo;

    inline std::string GetName() const { return name; }

    #ifdef GDE
    inline std::string GetInfo() const { return informations; }
    inline std::string GetAuthor() const { return author; }
    inline std::string GetLicense() const { return license; }
    inline std::string GetFullName() const { return fullname; }
    #endif

    InstructionFunPtr       GetConditionFunctionPtr(std::string conditionName) const;
    InstructionObjectFunPtr GetObjectConditionFunctionPtr(std::string objectType, std::string conditionName) const;

    InstructionFunPtr       GetActionFunctionPtr(std::string actionName) const;
    InstructionObjectFunPtr GetObjectActionFunctionPtr(std::string objectType, std::string actionName) const;

    ExpressionFunPtr        GetExpressionFunctionPtr(std::string expressionName) const;
    ExpressionObjectFunPtr  GetObjectExpressionFunctionPtr(std::string objectType, std::string expressionName) const;

    /**
     * Get objects types provided by the extension
     */
    std::vector < std::string > GetExtensionObjectsTypes() const;

    const std::map<std::string, InstructionInfos > & GetAllActions() const;
    const std::map<std::string, InstructionInfos > & GetAllConditions() const;
    const std::map<std::string, ExpressionInfos > & GetAllExpressions() const;
    const std::map<std::string, InstructionInfos > & GetAllActionsForObject(std::string objectType) const;
    const std::map<std::string, InstructionInfos > & GetAllConditionsForObject(std::string objectType) const;
    const std::map<std::string, ExpressionInfos > & GetAllExpressionsForObject(std::string objectType) const;

    #if defined(GDE)
    std::string GetExtensionObjectName(std::string objectType) const;
    std::string GetExtensionObjectInfo(std::string objectType) const;
    wxBitmap GetExtensionObjectBitmap(std::string objectType) const;
    #endif

    /**
     * Return a function to create the object if the type is handled by the extension
     */
    CreateFunPtr        GetObjectCreationFunctionPtr(std::string objectType) const;

    /**
     * Return a function to create the object if the type is handled by the extension
     */
    CreateByCopyFunPtr  GetObjectCreationByCopyFunctionPtr(std::string objectType) const;

    /**
     * Make sure that the object from an extension is deleted by the same extension.
     */
    DestroyFunPtr       GetDestroyObjectFunction(std::string objectType) const;

    inline std::string GetNameSpace() { return nameSpace; };

    protected :

    /**
     * Set the namespace ( the string each actions/conditions/expressions start with )
     */
    void SetNameSpace(std::string nameSpace_);

    std::string name;

    #ifdef GDE //Information available only at edittime
    std::string fullname;
    std::string informations;
    std::string author;
    std::string license;
    #endif

    std::map<std::string, ExtensionObjectInfos > objectsInfos;
    std::map<std::string, InstructionInfos > conditionsInfos;
    std::map<std::string, InstructionInfos > actionsInfos;
    std::map<std::string, ExpressionInfos > expressionsInfos;

    static std::map<std::string, InstructionInfos > badConditionsInfos;
    static std::map<std::string, InstructionInfos > badActionsInfos;
    static std::map<std::string, ExpressionInfos > badExpressionsInfos;

    private:

    /**
     * Automatically set from the name of the extension, and added
     * to every actions/conditions/expressions/objects.
     */
    std::string nameSpace;
};

#endif // EXTENSIONBASE_H
