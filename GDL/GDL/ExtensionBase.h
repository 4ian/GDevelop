/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EXTENSIONBASE_H
#define EXTENSIONBASE_H

#if defined(GD_IDE_ONLY)
class Game;
class MainEditorCommand;
#include <wx/bitmap.h>
#include <wx/file.h>
#include <wx/wx.h>
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#endif
#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
#include "GDL/ObjectIdentifiersManager.h"
class RuntimeScene;
class ObjectsConcerned;
class Instruction;
class Evaluateur;
class Automatism;
class Object;
class ExtensionBase;
class ExpressionInstruction;
class StrExpressionInstruction;
class BaseEvent;
class AutomatismsSharedDatas;
class ResourcesMergingHelper;
#undef CreateEvent

typedef boost::shared_ptr<Object> ObjSPtr;
typedef boost::shared_ptr<BaseEvent> BaseEventSPtr;

//Declare typedefs for static/objects functions and expressions
typedef bool (*InstructionFunPtr)( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & );
typedef bool (Object::*InstructionObjectFunPtr)( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & );
typedef bool (Automatism::*InstructionAutomatismFunPtr)( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & );
typedef double (*ExpressionFunPtr)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & expression );
typedef double (Object::*ExpressionObjectFunPtr)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & expression );
typedef double (Automatism::*ExpressionAutomatismFunPtr)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & expression );
typedef std::string (*StrExpressionFunPtr)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & expression );
typedef std::string (Object::*StrExpressionObjectFunPtr)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & expression );
typedef std::string (Automatism::*StrExpressionAutomatismFunPtr)( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & expression );

//Declare typedefs for objects creations/destructions functions
typedef void (*DestroyFunPtr)(Object*);
typedef Object * (*CreateFunPtr)(std::string name);

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
 * Start declaring a condition for an object, and some information about it.
 * DECLARE_END_AUTOMATISM_CONDITION need to be used after having declared parameter ( DECLARE_PARAMETER ).
 */
#define DECLARE_AUTOMATISM_CONDITION(name_, fullname_, description_, sentence_, group_, icon_, smallicon_, ptr_) { \
            InstructionInfos instrInfo; \
            std::string currentAutoConditionDeclarationName = name_; \
            instrInfo.instructionAutomatismFunPtr = (InstructionAutomatismFunPtr)ptr_; \
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
 * DECLARE_END_AUTOMATISM_ACTION need to be used after having declared parameter ( DECLARE_PARAMETER ).
 */
#define DECLARE_AUTOMATISM_ACTION(name_, fullname_, description_, sentence_, group_, icon_, smallicon_, ptr_) { \
            InstructionInfos instrInfo; \
            std::string currentAutoActionDeclarationName = name_; \
            instrInfo.instructionAutomatismFunPtr = (InstructionAutomatismFunPtr)ptr_; \
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
                if ( !std::string(objType_).empty() ) parameter.objectType = GetNameSpace()+objType_; \
                parameter.type = type_; \
                parameter.optional = false; \
                parameter.description = std::string(desc_.mb_str()); \
                instrInfo.parameters.push_back(parameter); \
                }

#define DECLARE_PARAMETER_OPTIONAL(type_, desc_, useObj_, objType_) { \
                ParameterInfo parameter; \
                parameter.useObject = useObj_; \
                if ( !std::string(objType_).empty() ) parameter.objectType = GetNameSpace()+objType_; \
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
#define DECLARE_OBJECT(name_, fullname_, informations_, icon24x24_, createFunPtrP, destroyFunPtrP) { \
            ExtensionObjectInfos objInfos; \
            std::string currentObjectDeclarationName = name_; \
            objInfos.fullname = std::string(fullname_.mb_str());\
            objInfos.informations = std::string(informations_.mb_str());\
            objInfos.icon = wxBitmap(icon24x24_, wxBITMAP_TYPE_ANY); \
            objInfos.createFunPtr = createFunPtrP;\
            objInfos.destroyFunPtr = destroyFunPtrP;

/**
 * Declare an expression
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
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
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
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
 * Declare an automatism expression
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
 * @param Function
 */
#define DECLARE_AUTOMATISM_EXPRESSION(name_, fullname_, description_, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionAutomatismFunPtr = (ExpressionAutomatismFunPtr)ptr;\
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
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
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
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
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

/**
 * Declare an hidden automatism expression ( not displayed in editor )
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
 * @param Function
 */
#define DECLARE_AUTOMATISM_HIDDEN_EXPRESSION(name_, fullname_, description_, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionAutomatismFunPtr = (ExpressionAutomatismFunPtr)ptr;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}\
            instrInfo.shown = false;

/**
 * Declare a string expression
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
 * @param Function
 */
#define DECLARE_STR_EXPRESSION(name_, fullname_, description_, group_, smallicon_, ptr) { \
            StrExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.strExpressionFunPtr = ptr;\
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
#define DECLARE_OBJECT_STR_EXPRESSION(name_, fullname_, description_, group_, smallicon_, ptr) { \
            StrExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.strExpressionObjectFunPtr = (StrExpressionObjectFunPtr)ptr;\
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
#define DECLARE_AUTOMATISM_STR_EXPRESSION(name_, fullname_, description_, group_, smallicon_, ptr) { \
            StrExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.strExpressionAutomatismFunPtr = (StrExpressionAutomatismFunPtr)ptr;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}

/**
 * Declare an hidden string expression ( not displayed in editor )
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
 * @param Function
 */
#define DECLARE_HIDDEN_STR_EXPRESSION(name_, fullname_, description_, group_, smallicon_, ptr) { \
            StrExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.strExpressionFunPtr = ptr;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}\
            instrInfo.shown = false;

/**
 * Declare an hidden object string expression ( not displayed in editor )
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
 * @param Function
 */
#define DECLARE_OBJECT_HIDDEN_STR_EXPRESSION(name_, fullname_, description_, group_, smallicon_, ptr) { \
            StrExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.strExpressionObjectFunPtr = (StrExpressionObjectFunPtr)ptr;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}\
            instrInfo.shown = false;

/**
 * Declare an hidden automatism string expression ( not displayed in editor )
 * @param name
 * @param fullname displayed in editor
 * @param description displayed in editor
 * @param group displayed in editor
 * @param filename for a small icon displayed in editor ( 16*16 )
 * @param Function
 */
#define DECLARE_AUTOMATISM_HIDDEN_STR_EXPRESSION(name_, fullname_, description_, group_, smallicon_, ptr) { \
            StrExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.strExpressionAutomatismFunPtr = (StrExpressionAutomatismFunPtr)ptr;\
            instrInfo.fullname = fullname_; \
            instrInfo.description = description_; \
            instrInfo.group = group_; \
            if ( wxFile::Exists(smallicon_) )\
            {\
                instrInfo.smallicon = wxBitmap(smallicon_, wxBITMAP_TYPE_ANY); \
            } else { instrInfo.smallicon = wxBitmap(16,16);}\
            instrInfo.shown = false;

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
            eventInfo.instance = boost::shared_ptr<BaseEvent>(new className_); \
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
            automatismInfo.fullname = fullname_; \
            automatismInfo.description = description_; \
            automatismInfo.defaultName = defaultName_;\
            automatismInfo.group = group_; \
            if ( wxFile::Exists(icon24x24_) )\
            {\
                automatismInfo.icon = wxBitmap(icon24x24_, wxBITMAP_TYPE_ANY); \
            } else { automatismInfo.icon = wxBitmap(24,24);} \
            automatismInfo.instance = boost::shared_ptr<Automatism>(new className_(GetNameSpace()+currentAutomatismDeclarationName));\
            automatismInfo.sharedDatasInstance = boost::shared_ptr<AutomatismsSharedDatas>(new sharedDatasClassName_(GetNameSpace()+currentAutomatismDeclarationName));

#define MAIN_OBJECTS_IN_PARAMETER(x) instrInfo.mainObjects.push_back(x);
#define MAIN_OBJECTS_IN_PARAMETERS(x, y) instrInfo.mainObjects.push_back(x); instrInfo.mainObjects.push_back(y);

#define DECLARE_CAN_HAVE_SUB_CONDITION() instrInfo.canHaveSubInstructions = true;
#define DECLARE_CAN_HAVE_SUB_ACTION() instrInfo.canHaveSubInstructions = true;

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

#define DECLARE_AUTOMATISM_CONDITION(name, fullname, description, sentence, group_, icon, smallicon, ptr) { \
            InstructionInfos instrInfo; \
            std::string currentAutoConditionDeclarationName = name; \
            instrInfo.instructionAutomatismFunPtr = (InstructionAutomatismFunPtr)ptr;

#define DECLARE_AUTOMATISM_ACTION(name, fullname, description, sentence, icon, group_, smallicon, ptr) { \
            InstructionInfos instrInfo; \
            std::string currentAutoActionDeclarationName = name; \
            instrInfo.instructionAutomatismFunPtr = (InstructionAutomatismFunPtr)ptr;

#define DECLARE_OBJECT(name_, fullname, informations, icon, createFunPtrP, destroyFunPtrP) { \
            ExtensionObjectInfos objInfos; \
            std::string currentObjectDeclarationName = name_; \
            objInfos.createFunPtr = createFunPtrP;\
            objInfos.destroyFunPtr = destroyFunPtrP;

#define DECLARE_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionFunPtr = ptr;

#define DECLARE_OBJECT_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionObjectFunPtr = (ExpressionObjectFunPtr)ptr;

#define DECLARE_AUTOMATISM_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionAutomatismFunPtr = (ExpressionAutomatismFunPtr)ptr;

#define DECLARE_HIDDEN_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionFunPtr = ptr;

#define DECLARE_OBJECT_HIDDEN_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionObjectFunPtr = (ExpressionObjectFunPtr)ptr;

#define DECLARE_AUTOMATISM_HIDDEN_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            ExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.expressionAutomatismFunPtr = (ExpressionAutomatismFunPtr)ptr;

#define DECLARE_STR_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            StrExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.strExpressionFunPtr = ptr;

#define DECLARE_OBJECT_STR_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            StrExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.strExpressionObjectFunPtr = (StrExpressionObjectFunPtr)ptr;

#define DECLARE_AUTOMATISM_STR_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            StrExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.strExpressionAutomatismFunPtr = (StrExpressionAutomatismFunPtr)ptr;

#define DECLARE_HIDDEN_STR_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            StrExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.strExpressionFunPtr = ptr;

#define DECLARE_OBJECT_HIDDEN_STR_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            StrExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.strExpressionObjectFunPtr = (StrExpressionObjectFunPtr)ptr;

#define DECLARE_AUTOMATISM_HIDDEN_STR_EXPRESSION(name_, fullname, description, group_, smallicon_, ptr) { \
            StrExpressionInfos instrInfo; \
            std::string currentExprDeclarationName = name_;\
            instrInfo.strExpressionAutomatismFunPtr = (StrExpressionAutomatismFunPtr)ptr;

#define DECLARE_EVENT(name_, fullname_, description_, group_, smallicon_, className_) { \
            EventInfos eventInfo; \
            std::string currentEventDeclarationName = name_;\
            eventInfo.instance = boost::shared_ptr<BaseEvent>(new className_); \
            eventInfo.instance->SetType(GetNameSpace()+currentEventDeclarationName);

#define DECLARE_AUTOMATISM(name_, fullname_, defaultName_, description_, group_, smallicon_, className_, sharedDatasClassName_) { \
            AutomatismInfo automatismInfo; \
            std::string currentAutomatismDeclarationName = name_;\
            automatismInfo.instance = boost::shared_ptr<Automatism>(new className_(GetNameSpace()+currentAutomatismDeclarationName)); \
            automatismInfo.sharedDatasInstance = boost::shared_ptr<AutomatismsSharedDatas>(new sharedDatasClassName_(GetNameSpace()+currentAutomatismDeclarationName));

#define DECLARE_PARAMETER(type_, desc, useObj, objType) { \
                ParameterInfo parameter; \
                parameter.type = type_; \
                parameter.useObject = useObj; \
                parameter.optional = false; \
                if ( !std::string(objType).empty() ) parameter.objectType = GetNameSpace()+objType; \
                instrInfo.parameters.push_back(parameter); \
                }

#define DECLARE_PARAMETER_OPTIONAL(type_, desc, useObj, objType) { \
                ParameterInfo parameter; \
                parameter.type = type_; \
                parameter.useObject = useObj; \
                parameter.optional = true; \
                 if ( !std::string(objType).empty() ) parameter.objectType = GetNameSpace()+objType; \
                instrInfo.parameters.push_back(parameter); \
                }

#define MAIN_OBJECTS_IN_PARAMETER(x)
#define MAIN_OBJECTS_IN_PARAMETERS(x, y)

#define DECLARE_CAN_HAVE_SUB_CONDITION()
#define DECLARE_CAN_HAVE_SUB_ACTION()

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
 * Need to be added after DECLARE_OBJECT and all actions/conditions/expressions.
 */
#define DECLARE_END_OBJECT() objectsInfos[GetNameSpace()+currentObjectDeclarationName] = objInfos; \
            }

/**
 * Need to be added after DECLARE_AUTOMATISM and all actions/conditions/expressions.
 */
#define DECLARE_END_AUTOMATISM()  automatismsInfo[GetNameSpace()+currentAutomatismDeclarationName] = automatismInfo; \
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
    std::string type;
    bool optional;

#if defined(GD_IDE_ONLY)
    std::string description;
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

#if defined(GD_IDE_ONLY)
    std::string fullname;
    std::string description;
    std::string sentence;
    std::string group;
    wxBitmap icon;
    wxBitmap smallicon;
    std::vector < int > mainObjects;
    bool canHaveSubInstructions;
#endif
    std::vector < ParameterInfo > parameters;
    InstructionFunPtr       instructionFunPtr;
    InstructionObjectFunPtr instructionObjectFunPtr;
    InstructionAutomatismFunPtr instructionAutomatismFunPtr;
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

#if defined(GD_IDE_ONLY)
    std::string fullname;
    std::string description;
    std::string group;
    bool shown;
    wxBitmap smallicon;
#endif

    std::vector < ParameterInfo > parameters;
    ExpressionFunPtr       expressionFunPtr;
    ExpressionObjectFunPtr expressionObjectFunPtr;
    ExpressionAutomatismFunPtr expressionAutomatismFunPtr;
};

/**
 * Contains user-friendly infos about expressions, only at edittime,
 * and members needed to setup an expression
 */
class GD_API StrExpressionInfos
{
    public:

    StrExpressionInfos();
    virtual ~StrExpressionInfos() {};

#if defined(GD_IDE_ONLY)
    std::string fullname;
    std::string description;
    std::string group;
    bool shown;
    wxBitmap smallicon;
#endif

    std::vector < ParameterInfo > parameters;
    StrExpressionFunPtr       strExpressionFunPtr;
    StrExpressionObjectFunPtr strExpressionObjectFunPtr;
    StrExpressionAutomatismFunPtr strExpressionAutomatismFunPtr;
};

/**
 * Contains user-friendly infos about event, only at edittime,
 * and members needed to create an event
 */
class GD_API EventInfos
{
    public:

    EventInfos();
    virtual ~EventInfos() {};

#if defined(GD_IDE_ONLY)
    std::string fullname;
    std::string description;
    std::string group;
    wxBitmap smallicon;
#endif

    BaseEventSPtr instance;
};

/**
 * Contains user-friendly infos about an automatism, only at edittime,
 * and members needed to create the automatism
 */
class GD_API AutomatismInfo
{
    public:

    AutomatismInfo();
    virtual ~AutomatismInfo() {};

#if defined(GD_IDE_ONLY)
    std::string fullname;
    std::string defaultName;
    std::string description;
    std::string group;
    wxBitmap icon;
#endif

    std::map<std::string, InstructionInfos > conditionsInfos;
    std::map<std::string, InstructionInfos > actionsInfos;
    std::map<std::string, ExpressionInfos > expressionsInfos;
    std::map<std::string, StrExpressionInfos > strExpressionsInfos;

    boost::shared_ptr<Automatism> instance;
    boost::shared_ptr<AutomatismsSharedDatas> sharedDatasInstance;
};

/**
 * Struct for getting user-friendly infos about objects, only at edittime
 */
class GD_API ExtensionObjectInfos
{
    public:

    ExtensionObjectInfos();
    virtual ~ExtensionObjectInfos() {};

#if defined(GD_IDE_ONLY)
    std::string fullname;
    std::string informations;
    wxBitmap icon;
#endif

    DestroyFunPtr destroyFunPtr;
    CreateFunPtr createFunPtr;

    std::map<std::string, InstructionInfos > conditionsInfos;
    std::map<std::string, InstructionInfos > actionsInfos;
    std::map<std::string, ExpressionInfos > expressionsInfos;
    std::map<std::string, StrExpressionInfos > strExpressionsInfos;
};

/**
 * Class used in extension to be sure that extension is compatible.
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

    #if defined(GD_IDE_ONLY)
    inline std::string GetInfo() const { return informations; }
    inline std::string GetAuthor() const { return author; }
    inline std::string GetLicense() const { return license; }
    inline std::string GetFullName() const { return fullname; }
    const std::vector < std::pair<std::string, std::string> > & GetSupplementaryRuntimeFiles() const { return supplementaryRuntimeFiles; };
    #endif

    InstructionFunPtr       GetConditionFunctionPtr(std::string conditionName) const;
    InstructionObjectFunPtr GetObjectConditionFunctionPtr(std::string objectType, std::string conditionName) const;
    InstructionAutomatismFunPtr GetAutomatismConditionFunctionPtr(std::string autoType, std::string conditionName) const;

    InstructionFunPtr       GetActionFunctionPtr(std::string actionName) const;
    InstructionObjectFunPtr GetObjectActionFunctionPtr(std::string objectType, std::string actionName) const;
    InstructionAutomatismFunPtr GetAutomatismActionFunctionPtr(std::string autoType, std::string actionName) const;

    ExpressionFunPtr        GetExpressionFunctionPtr(std::string expressionName) const;
    ExpressionObjectFunPtr  GetObjectExpressionFunctionPtr(std::string objectType, std::string expressionName) const;
    ExpressionAutomatismFunPtr GetAutomatismExpressionFunctionPtr(std::string autoType, std::string expressionName) const;

    StrExpressionFunPtr        GetStrExpressionFunctionPtr(std::string expressionName) const;
    StrExpressionObjectFunPtr  GetObjectStrExpressionFunctionPtr(std::string objectType, std::string expressionName) const;
    StrExpressionAutomatismFunPtr GetAutomatismStrExpressionFunctionPtr(std::string autoType, std::string expressionName) const;

    /**
     * Get objects types provided by the extension
     */
    std::vector < std::string > GetExtensionObjectsTypes() const;

    /**
     * Get automatism types provided by the extension
     */
    std::vector < std::string > GetAutomatismsTypes() const;

    const std::map<std::string, InstructionInfos > & GetAllActions() const;
    const std::map<std::string, InstructionInfos > & GetAllConditions() const;
    const std::map<std::string, ExpressionInfos > & GetAllExpressions() const;
    const std::map<std::string, StrExpressionInfos > & GetAllStrExpressions() const;
    const std::map<std::string, InstructionInfos > & GetAllActionsForObject(std::string objectType) const;
    const std::map<std::string, InstructionInfos > & GetAllConditionsForObject(std::string objectType) const;
    const std::map<std::string, ExpressionInfos > & GetAllExpressionsForObject(std::string objectType) const;
    const std::map<std::string, StrExpressionInfos > & GetAllStrExpressionsForObject(std::string objectType) const;
    const std::map<std::string, EventInfos > & GetAllEvents() const;
    const std::map<std::string, AutomatismInfo > & GetAllAutomatisms() const;
    const std::map<std::string, InstructionInfos > & GetAllActionsForAutomatism(std::string autoType) const;
    const std::map<std::string, InstructionInfos > & GetAllConditionsForAutomatism(std::string autoType) const;
    const std::map<std::string, ExpressionInfos > & GetAllExpressionsForAutomatism(std::string autoType) const;
    const std::map<std::string, StrExpressionInfos > & GetAllStrExpressionsForAutomatism(std::string autoType) const;

    #if defined(GD_IDE_ONLY)
    const ExtensionObjectInfos & GetObjectInfo(std::string objectType) const;
    #endif
    const AutomatismInfo & GetAutomatismInfo(std::string objectType) const;

    /**
     * Return a function to create the object if the type is handled by the extension
     */
    CreateFunPtr        GetObjectCreationFunctionPtr(std::string objectType) const;

    /**
     * Make sure that the object from an extension is deleted by the same extension.
     */
    DestroyFunPtr       GetDestroyObjectFunction(std::string objectType) const;

    /**
     * Create an custom event.
     * Return NULL if eventType is not provided by the extension.
     */
    BaseEventSPtr CreateEvent(std::string eventType) const;

    /**
     * Create an automatism
     * Return NULL if automatismType is not provided by the extension.
     */
    boost::shared_ptr<Automatism> CreateAutomatism(std::string automatismType) const;

    /**
     * Create shared datas of an automatism
     * Return NULL if automatismType is not provided by the extension.
     */
    boost::shared_ptr<AutomatismsSharedDatas> CreateAutomatismSharedDatas(std::string automatismType) const;

    /**
     * Get the namespace
     */
    inline std::string GetNameSpace() { return nameSpace; };

    #if defined(GD_IDE_ONLY)
    /**
     * Called ( e.g. during compilation ) so as to inventory resources used by conditions and update their filename
     */
    virtual void PrepareConditionsResourcesForMerging(Instruction & condition, ResourcesMergingHelper & resourcesMergingHelper) {};

    /**
     * Called ( e.g. during compilation ) so as to inventory resources used by actions and update their filename
     */
    virtual void PrepareActionsResourcesForMerging(Instruction & action, ResourcesMergingHelper & resourcesMergingHelper) {};
    #endif

    protected :

    /**
     * Set the namespace ( the string each actions/conditions/expressions start with )
     */
    void SetNameSpace(std::string nameSpace_);

    std::string name;

    #if defined(GD_IDE_ONLY) //Information available only at edittime
    std::string fullname; ///<Name displayed to users at edittime
    std::string informations; ///<Description displayed to users at edittime
    std::string author; ///<Author displayed to users at edittime
    std::string license;  ///<License name displayed to users at edittime
    std::vector < std::pair<std::string, std::string> > supplementaryRuntimeFiles; ///<Supplementary runtime files to copy on compilation
    #endif

    std::map<std::string, ExtensionObjectInfos > objectsInfos;
    std::map<std::string, InstructionInfos > conditionsInfos;
    std::map<std::string, InstructionInfos > actionsInfos;
    std::map<std::string, ExpressionInfos > expressionsInfos;
    std::map<std::string, StrExpressionInfos > strExpressionsInfos;
    std::map<std::string, EventInfos > eventsInfos;
    std::map<std::string, AutomatismInfo > automatismsInfo;

    static std::map<std::string, ExtensionObjectInfos > badObjectsInfos; ///< Used when an object is not found in the extension
    static std::map<std::string, InstructionInfos > badConditionsInfos; ///< Used when a condition is not found in the extension
    static std::map<std::string, InstructionInfos > badActionsInfos;  ///< Used when an action is not found in the extension
    static std::map<std::string, ExpressionInfos > badExpressionsInfos; ///< Used when an expression is not found in the extension
    static std::map<std::string, StrExpressionInfos > badStrExpressionsInfos;///< Used when an expression is not found in the extension
    static std::map<std::string, AutomatismInfo > badAutomatismsInfo;///< Used when an automatism is not found in the extension

    private:

    /**
     * Automatically set from the name of the extension, and added
     * to every actions/conditions/expressions/objects/automatism/event.
     */
    std::string nameSpace;
};

#endif // EXTENSIONBASE_H
