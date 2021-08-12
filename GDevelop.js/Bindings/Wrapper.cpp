#include <GDCore/Events/Builtin/CommentEvent.h>
#include <GDCore/Events/Builtin/ForEachChildVariableEvent.h>
#include <GDCore/Events/Builtin/ForEachEvent.h>
#include <GDCore/Events/Builtin/GroupEvent.h>
#include <GDCore/Events/Builtin/LinkEvent.h>
#include <GDCore/Events/Builtin/RepeatEvent.h>
#include <GDCore/Events/Builtin/StandardEvent.h>
#include <GDCore/Events/Builtin/WhileEvent.h>
#include <GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h>
#include <GDCore/Events/Parsers/ExpressionParser2.h>
#include <GDCore/Events/Parsers/ExpressionParser2Node.h>
#include <GDCore/Extensions/Builtin/SpriteExtension/Animation.h>
#include <GDCore/Extensions/Builtin/SpriteExtension/Direction.h>
#include <GDCore/Extensions/Builtin/SpriteExtension/Sprite.h>
#include <GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h>
#include <GDCore/Extensions/Metadata/DependencyMetadata.h>
#include <GDCore/Extensions/Metadata/EffectMetadata.h>
#include <GDCore/Extensions/Metadata/MetadataProvider.h>
#include <GDCore/Extensions/Metadata/MultipleInstructionMetadata.h>
#include <GDCore/Extensions/Metadata/ParameterMetadataTools.h>
#include <GDCore/Extensions/Platform.h>
#include <GDCore/IDE/AbstractFileSystem.h>
#include <GDCore/IDE/Dialogs/LayoutEditorCanvas/LayoutEditorCanvasOptions.h>
#include <GDCore/IDE/Events/ArbitraryEventsWorker.h>
#include <GDCore/IDE/Events/EventsContextAnalyzer.h>
#include <GDCore/IDE/Events/EventsListUnfolder.h>
#include <GDCore/IDE/Events/EventsParametersLister.h>
#include <GDCore/IDE/Events/EventsRefactorer.h>
#include <GDCore/IDE/Events/EventsRemover.h>
#include <GDCore/IDE/Events/EventsTypesLister.h>
#include <GDCore/IDE/Events/ExpressionCompletionFinder.h>
#include <GDCore/IDE/Events/ExpressionValidator.h>
#include <GDCore/IDE/Events/InstructionSentenceFormatter.h>
#include <GDCore/IDE/Events/InstructionsTypeRenamer.h>
#include <GDCore/IDE/Events/TextFormatting.h>
#include <GDCore/IDE/Events/UsedExtensionsFinder.h>
#include <GDCore/IDE/EventsFunctionTools.h>
#include <GDCore/IDE/Events/EventsVariablesFinder.h>
#include <GDCore/IDE/Project/ArbitraryResourceWorker.h>
#include <GDCore/IDE/Project/ProjectResourcesAdder.h>
#include <GDCore/IDE/Project/ProjectResourcesCopier.h>
#include <GDCore/IDE/Project/ResourcesInUseHelper.h>
#include <GDCore/IDE/Project/ResourcesMergingHelper.h>
#include <GDCore/IDE/Project/ResourcesRenamer.h>
#include <GDCore/IDE/WholeProjectRefactorer.h>
#include <GDCore/Project/Behavior.h>
#include <GDCore/Project/Effect.h>
#include <GDCore/Project/EventsBasedBehavior.h>
#include <GDCore/Project/EventsFunction.h>
#include <GDCore/Project/EventsFunctionsExtension.h>
#include <GDCore/Project/ExternalEvents.h>
#include <GDCore/Project/ExternalLayout.h>
#include <GDCore/Project/InitialInstance.h>
#include <GDCore/Project/InitialInstancesContainer.h>
#include <GDCore/Project/Layout.h>
#include <GDCore/Project/NamedPropertyDescriptor.h>
#include <GDCore/Project/Object.h>
#include <GDCore/Project/Project.h>
#include <GDCore/Project/PropertyDescriptor.h>
#include <GDCore/Project/Variable.h>
#include <GDCore/Project/VariablesContainer.h>
#include <GDCore/Serialization/Serializer.h>
#include <GDCore/Serialization/SerializerElement.h>
#include <GDJS/Events/Builtin/JsCodeEvent.h>
#include <GDJS/Events/CodeGeneration/BehaviorCodeGenerator.h>
#include <GDJS/Events/CodeGeneration/EventsFunctionsExtensionCodeGenerator.h>
#include <GDJS/Events/CodeGeneration/LayoutCodeGenerator.h>
#include <GDJS/IDE/Exporter.h>
#include <GDJS/IDE/ExporterHelper.h>
#include <emscripten.h>

#include <map>
#include <set>
#include <string>
#include <utility>
#include <vector>

#include "../../Extensions/PanelSpriteObject/PanelSpriteObject.h"
#include "../../Extensions/ParticleSystem/ParticleEmitterObject.h"
#include "../../Extensions/PrimitiveDrawing/ShapePainterObject.h"
#include "../../Extensions/TextEntryObject/TextEntryObject.h"
#include "../../Extensions/TextObject/TextObject.h"
#include "../../Extensions/TiledSpriteObject/TiledSpriteObject.h"
#include "BehaviorJsImplementation.h"
#include "BehaviorSharedDataJsImplementation.h"
#include "ObjectJsImplementation.h"
#include "ProjectHelper.h"

/**
 * \brief Manual binding of gd::ArbitraryResourceWorker to allow overriding
 * methods that are using std::string
 */
class ArbitraryResourceWorkerJS : public ArbitraryResourceWorker {
 public:
  void ExposeImage(gd::String &arg0) {
    arg0 = (const char *)EM_ASM_INT(
        {
          var self =
              Module['getCache'](Module['ArbitraryResourceWorkerJS'])[$0];
          if (!self.hasOwnProperty('exposeImage'))
            throw 'a JSImplementation must implement all functions, you forgot ArbitraryResourceWorkerJS::exposeImage.';
          return ensureString(self.exposeImage(UTF8ToString($1)));
        },
        (int)this,
        arg0.c_str());
  }
  void ExposeShader(gd::String &arg0) {
    arg0 = (const char *)EM_ASM_INT(
        {
          var self =
              Module['getCache'](Module['ArbitraryResourceWorkerJS'])[$0];
          if (!self.hasOwnProperty('exposeShader'))
            throw 'a JSImplementation must implement all functions, you forgot ArbitraryResourceWorkerJS::exposeShader.';
          return ensureString(self.exposeShader(UTF8ToString($1)));
        },
        (int)this,
        arg0.c_str());
  }
  void ExposeFile(gd::String &arg0) {
    arg0 = (const char *)EM_ASM_INT(
        {
          var self =
              Module['getCache'](Module['ArbitraryResourceWorkerJS'])[$0];
          if (!self.hasOwnProperty('exposeFile'))
            throw 'a JSImplementation must implement all functions, you forgot ArbitraryResourceWorkerJS::exposeFile.';
          return ensureString(self.exposeFile(UTF8ToString($1)));
        },
        (int)this,
        arg0.c_str());
  }
};

/**
 * \brief Manual binding of gd::AbstractFileSystem to allow overriding methods
 * that are using std::string
 */
class AbstractFileSystemJS : public AbstractFileSystem {
 public:
  virtual void MkDir(const gd::String &path) {
    EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('mkDir'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::mkDir.';
          self.mkDir(UTF8ToString($1));
        },
        (int)this,
        path.c_str());
  }
  virtual bool DirExists(const gd::String &path) {
    return EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('dirExists'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::dirExists.';
          return self.dirExists(UTF8ToString($1));
        },
        (int)this,
        path.c_str());
  }

  virtual bool FileExists(const gd::String &path) {
    return EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('fileExists'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::fileExists.';
          return self.fileExists(UTF8ToString($1));
        },
        (int)this,
        path.c_str());
  }

  virtual gd::String FileNameFrom(const gd::String &file) {
    return (const char *)EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('fileNameFrom'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::fileNameFrom.';
          return ensureString(self.fileNameFrom(UTF8ToString($1)));
        },
        (int)this,
        file.c_str());
  }

  virtual gd::String DirNameFrom(const gd::String &file) {
    return (const char *)EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('dirNameFrom'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::dirNameFrom.';
          return ensureString(self.dirNameFrom(UTF8ToString($1)));
        },
        (int)this,
        file.c_str());
  }

  virtual bool MakeAbsolute(gd::String &filename,
                            const gd::String &baseDirectory) {
    filename = (const char *)EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('makeAbsolute'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::makeAbsolute.';
          return ensureString(
              self.makeAbsolute(UTF8ToString($1), UTF8ToString($2)));
        },
        (int)this,
        filename.c_str(),
        baseDirectory.c_str());

    return true;
  }

  virtual bool MakeRelative(gd::String &filename,
                            const gd::String &baseDirectory) {
    filename = (const char *)EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('makeRelative'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::makeRelative.';
          return ensureString(
              self.makeRelative(UTF8ToString($1), UTF8ToString($2)));
        },
        (int)this,
        filename.c_str(),
        baseDirectory.c_str());

    return true;
  }

  virtual bool IsAbsolute(const gd::String &filename) {
    return (bool)EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('isAbsolute'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::isAbsolute.';
          return self.isAbsolute(UTF8ToString($1));
        },
        (int)this,
        filename.c_str());
  };

  virtual bool CopyFile(const gd::String &file, const gd::String &destination) {
    return (bool)EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('copyFile'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::copyFile.';
          return self.copyFile(UTF8ToString($1), UTF8ToString($2));
        },
        (int)this,
        file.c_str(),
        destination.c_str());
  }

  virtual bool ClearDir(const gd::String &directory) {
    return (bool)EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('clearDir'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::clearDir.';
          return self.clearDir(UTF8ToString($1));
        },
        (int)this,
        directory.c_str());
  }

  virtual bool WriteToFile(const gd::String &file, const gd::String &content) {
    return (bool)EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('writeToFile'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::writeToFile.';
          return self.writeToFile(UTF8ToString($1), UTF8ToString($2));
        },
        (int)this,
        file.c_str(),
        content.c_str());
  }

  virtual gd::String ReadFile(const gd::String &file) {
    return (const char *)EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('readFile'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::readFile.';
          return ensureString(self.readFile(UTF8ToString($1)));
        },
        (int)this,
        file.c_str());
  }
  virtual gd::String GetTempDir() {
    return (const char *)EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('getTempDir'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::getTempDir.';
          return ensureString(self.getTempDir());
        },
        (int)this);
  }

  virtual std::vector<gd::String> ReadDir(const gd::String &path,
                                          const gd::String &extension = "") {
    std::vector<gd::String> directories = *(std::vector<gd::String> *)EM_ASM_INT(
        {
          var self = Module['getCache'](Module['AbstractFileSystemJS'])[$0];
          if (!self.hasOwnProperty('readDir'))
            throw 'a JSImplementation must implement all functions, you forgot AbstractFileSystemJS::readDir.';
          return self.readDir(UTF8ToString($1), UTF8ToString($2)).ptr;
        },
        (int)this,
        path.c_str(),
        extension.c_str());

    return directories;
  }

  AbstractFileSystemJS(){};
  virtual ~AbstractFileSystemJS(){};
};

class InitialInstanceJSFunctorWrapper : public gd::InitialInstanceFunctor {
 public:
  InitialInstanceJSFunctorWrapper(){};

  virtual void operator()(gd::InitialInstance &instance) { invoke(&instance); };

  virtual void invoke(gd::InitialInstance *instance){};
};

// Implement some std::vector<*> erase methods as free functions as there is no
// easy way to properly expose the erase method :'(
void removeFromVectorPolygon2d(std::vector<Polygon2d> &vec, size_t pos) {
  vec.erase(vec.begin() + pos);
}

void removeFromVectorVector2f(std::vector<sf::Vector2f> &vec, size_t pos) {
  vec.erase(vec.begin() + pos);
}

void removeFromVectorParameterMetadata(std::vector<gd::ParameterMetadata> &vec,
                                       size_t pos) {
  vec.erase(vec.begin() + pos);
}

void swapInVectorParameterMetadata(std::vector<gd::ParameterMetadata> &vec,
                                   size_t oldIndex,
                                   size_t newIndex) {
  if (oldIndex > vec.size() || newIndex > vec.size()) return;

  std::swap(vec[oldIndex], vec[newIndex]);
}

// Implement a conversion from std::set<gd::String> to std::vector<gd::String>
// as there is no easy way to properly expose iterators :/
std::vector<gd::String> toNewVectorString(const std::set<gd::String> &set) {
  std::vector<gd::String> output(set.begin(), set.end());
  return output;
}

// Declares typedef for std::vector and templatized types
typedef std::vector<gd::String> VectorString;
typedef std::vector<std::shared_ptr<gd::PlatformExtension>>
    VectorPlatformExtension;
typedef std::pair<gd::String, gd::Variable> PairStringVariable;
typedef std::pair<gd::String, TextFormatting> PairStringTextFormatting;
typedef std::vector<std::pair<gd::String, TextFormatting>>
    VectorPairStringTextFormatting;
typedef std::vector<gd::ObjectGroup> VectorObjectGroup;
typedef std::map<gd::String, gd::String> MapStringString;
typedef std::map<gd::String, bool> MapStringBoolean;
typedef std::map<gd::String, double> MapStringDouble;
typedef std::map<gd::String, gd::ExpressionMetadata>
    MapStringExpressionMetadata;
typedef std::map<gd::String, gd::InstructionMetadata>
    MapStringInstructionMetadata;
typedef std::map<gd::String, gd::EventMetadata> MapStringEventMetadata;
typedef std::map<gd::String, gd::Variable> MapStringVariable;
typedef std::vector<std::shared_ptr<gd::Variable>> VectorVariable;
typedef std::map<gd::String, gd::PropertyDescriptor>
    MapStringPropertyDescriptor;
typedef std::set<gd::String> SetString;
typedef std::vector<Point> VectorPoint;
typedef std::vector<Polygon2d> VectorPolygon2d;
typedef std::vector<sf::Vector2f> VectorVector2f;
typedef std::vector<EventsSearchResult> VectorEventsSearchResult;
typedef std::vector<gd::ParameterMetadata> VectorParameterMetadata;
typedef std::vector<gd::DependencyMetadata> VectorDependencyMetadata;
typedef std::vector<gd::EventsFunction> VectorEventsFunction;
typedef gd::Object gdObject;  // To avoid clashing javascript Object in glue.js
typedef ParticleEmitterObject::RendererType ParticleEmitterObject_RendererType;
typedef EventsFunction::FunctionType EventsFunction_FunctionType;
typedef std::unique_ptr<gd::Object> UniquePtrObject;
typedef std::unique_ptr<ExpressionNode> UniquePtrExpressionNode;
typedef std::vector<gd::ExpressionParserDiagnostic *>
    VectorExpressionParserDiagnostic;
typedef gd::SerializableWithNameList<gd::EventsBasedBehavior>
    EventsBasedBehaviorsList;
typedef gd::SerializableWithNameList<gd::NamedPropertyDescriptor>
    NamedPropertyDescriptorsList;
typedef ExpressionCompletionDescription::CompletionKind
    ExpressionCompletionDescription_CompletionKind;
typedef std::vector<gd::ExpressionCompletionDescription>
    VectorExpressionCompletionDescription;
typedef std::map<gd::String, std::map<gd::String, gd::PropertyDescriptor>>
    MapExtensionProperties;
typedef gd::Variable::Type Variable_Type;
typedef std::map<gd::String, gd::SerializerValue> MapStringSerializerValue;
typedef std::vector<std::pair<gd::String, std::shared_ptr<SerializerElement>>>
    VectorPairStringSharedPtrSerializerElement;
typedef std::shared_ptr<SerializerElement> SharedPtrSerializerElement;

typedef ExtensionAndMetadata<BehaviorMetadata> ExtensionAndBehaviorMetadata;
typedef ExtensionAndMetadata<ObjectMetadata> ExtensionAndObjectMetadata;
typedef ExtensionAndMetadata<EffectMetadata> ExtensionAndEffectMetadata;
typedef ExtensionAndMetadata<InstructionMetadata>
    ExtensionAndInstructionMetadata;
typedef ExtensionAndMetadata<InstructionMetadata>
    ExtensionAndInstructionMetadata;
typedef ExtensionAndMetadata<ExpressionMetadata> ExtensionAndExpressionMetadata;
typedef ExtensionAndMetadata<ExpressionMetadata> ExtensionAndExpressionMetadata;
typedef ExtensionAndMetadata<ExpressionMetadata> ExtensionAndExpressionMetadata;
typedef ExtensionAndMetadata<ExpressionMetadata> ExtensionAndExpressionMetadata;
typedef ExtensionAndMetadata<ExpressionMetadata> ExtensionAndExpressionMetadata;
typedef ExtensionAndMetadata<ExpressionMetadata> ExtensionAndExpressionMetadata;

// Customize some functions implementation thanks to WRAPPED_* macros
// The original names will be reconstructed in the js file (see postjs.js)
#define WRAPPED_set(a, b) at(a) = b
#define WRAPPED_GetString(i) at(i).first
#define WRAPPED_GetComment() com1
#define WRAPPED_SetComment(str) com1 = str
#define WRAPPED_GetTextFormatting(i) at(i).second
#define WRAPPED_GetSharedPtrSerializerElement(i) at(i).second
#define WRAPPED_GetName() first
#define WRAPPED_GetVariable() second
#define WRAPPED_SetBool(v) SetValue(v)
#define WRAPPED_SetString(v) SetValue(gd::String(v))
#define WRAPPED_SetInt(v) SetValue(v)
#define WRAPPED_SetDouble(v) SetValue(v)
#define WRAPPED_SetChild(name, child) GetChild(name) = child

// Wrappers to avoid dealing with shared_ptr in the methods interface:
#define WRAPPED_AddBehavior(name,                      \
                            fullname,                  \
                            defaultName,               \
                            description,               \
                            group,                     \
                            icon24x24,                 \
                            className,                 \
                            instance,                  \
                            sharedDatasInstance)       \
  AddBehavior(name,                                    \
              fullname,                                \
              defaultName,                             \
              description,                             \
              group,                                   \
              icon24x24,                               \
              className,                               \
              std::shared_ptr<gd::Behavior>(instance), \
              std::shared_ptr<gd::BehaviorsSharedData>(sharedDatasInstance))

#define WRAPPED_AddObject(name, fullname, description, icon24x24, instance) \
  AddObject(name,                                                           \
            fullname,                                                       \
            description,                                                    \
            icon24x24,                                                      \
            std::shared_ptr<gd::Object>(instance))

#define WRAPPED_at(a) at(a).get()

#define MAP_getOrCreate(key) operator[](key)
#define MAP_get(key) find(key)->second
#define MAP_set(key, value) [key] = value
#define MAP_has(key) find(key) != self->end()

#define STATIC_CreateNewGDJSProject CreateNewGDJSProject
#define STATIC_InitializePlatforms InitializePlatforms
#define STATIC_ValidateName ValidateName
#define STATIC_ToJSON ToJSON
#define STATIC_FromJSON(x) FromJSON(x)
#define STATIC_IsObject IsObject
#define STATIC_IsBehavior IsBehavior
#define STATIC_Get Get
#define STATIC_AddAllMissing AddAllMissing
#define STATIC_GetAllUseless GetAllUseless
#define STATIC_RemoveAllUseless RemoveAllUseless

#define STATIC_GetExtensionAndBehaviorMetadata GetExtensionAndBehaviorMetadata
#define STATIC_GetExtensionAndObjectMetadata GetExtensionAndObjectMetadata
#define STATIC_GetExtensionAndEffectMetadata GetExtensionAndEffectMetadata
#define STATIC_GetExtensionAndActionMetadata GetExtensionAndActionMetadata
#define STATIC_GetExtensionAndConditionMetadata GetExtensionAndConditionMetadata
#define STATIC_GetExtensionAndExpressionMetadata \
  GetExtensionAndExpressionMetadata
#define STATIC_GetExtensionAndObjectExpressionMetadata \
  GetExtensionAndObjectExpressionMetadata
#define STATIC_GetExtensionAndBehaviorExpressionMetadata \
  GetExtensionAndBehaviorExpressionMetadata
#define STATIC_GetExtensionAndStrExpressionMetadata \
  GetExtensionAndStrExpressionMetadata
#define STATIC_GetExtensionAndObjectStrExpressionMetadata \
  GetExtensionAndObjectStrExpressionMetadata
#define STATIC_GetExtensionAndBehaviorStrExpressionMetadata \
  GetExtensionAndBehaviorStrExpressionMetadata
#define STATIC_IsBadExpressionMetadata IsBadExpressionMetadata
#define STATIC_IsBadBehaviorMetadata IsBadBehaviorMetadata

#define STATIC_RenameObjectInEvents RenameObjectInEvents
#define STATIC_RemoveObjectInEvents RemoveObjectInEvents
#define STATIC_ReplaceStringInEvents ReplaceStringInEvents
#define STATIC_ExposeProjectEvents ExposeProjectEvents

#define STATIC_GetBehaviorMetadata GetBehaviorMetadata
#define STATIC_GetObjectMetadata GetObjectMetadata
#define STATIC_GetEffectMetadata GetEffectMetadata
#define STATIC_GetActionMetadata GetActionMetadata
#define STATIC_GetConditionMetadata GetConditionMetadata
#define STATIC_GetExpressionMetadata GetExpressionMetadata
#define STATIC_GetObjectExpressionMetadata GetObjectExpressionMetadata
#define STATIC_GetBehaviorExpressionMetadata GetBehaviorExpressionMetadata
#define STATIC_GetStrExpressionMetadata GetStrExpressionMetadata
#define STATIC_GetObjectStrExpressionMetadata GetObjectStrExpressionMetadata
#define STATIC_GetBehaviorStrExpressionMetadata GetBehaviorStrExpressionMetadata
#define STATIC_IsPrimitive IsPrimitive

#define STATIC_Major Major
#define STATIC_Minor Minor
#define STATIC_Build Build
#define STATIC_Revision Revision
#define STATIC_FullString FullString
#define STATIC_Status Status
#define STATIC_Year Year
#define STATIC_Month Month
#define STATIC_Date Date
#define STATIC_ObjectOrGroupRenamedInLayout ObjectOrGroupRenamedInLayout
#define STATIC_ObjectOrGroupRemovedInLayout ObjectOrGroupRemovedInLayout
#define STATIC_ObjectOrGroupRemovedInEventsFunction \
  ObjectOrGroupRemovedInEventsFunction
#define STATIC_ObjectOrGroupRenamedInEventsFunction \
  ObjectOrGroupRenamedInEventsFunction
#define STATIC_GlobalObjectOrGroupRenamed GlobalObjectOrGroupRenamed
#define STATIC_GlobalObjectOrGroupRemoved GlobalObjectOrGroupRemoved
#define STATIC_GetAllObjectTypesUsingEventsBasedBehavior \
  GetAllObjectTypesUsingEventsBasedBehavior
#define STATIC_EnsureBehaviorEventsFunctionsProperParameters \
  EnsureBehaviorEventsFunctionsProperParameters
#define STATIC_CreateRectangle CreateRectangle
#define STATIC_SanityCheckBehaviorProperty SanityCheckBehaviorProperty
#define STATIC_SanityCheckObjectProperty SanityCheckObjectProperty
#define STATIC_SanityCheckObjectInitialInstanceProperty \
  SanityCheckObjectInitialInstanceProperty
#define STATIC_SanityCheckBehaviorsSharedDataProperty \
  SanityCheckBehaviorsSharedDataProperty
#define STATIC_FindAllGlobalVariables FindAllGlobalVariables
#define STATIC_FindAllLayoutVariables FindAllLayoutVariables
#define STATIC_FindAllObjectVariables FindAllObjectVariables
#define STATIC_SearchInEvents SearchInEvents
#define STATIC_UnfoldWhenContaining UnfoldWhenContaining

#define STATIC_EventsFunctionToObjectsContainer EventsFunctionToObjectsContainer
#define STATIC_ParametersToObjectsContainer ParametersToObjectsContainer
#define STATIC_GetObjectParameterIndexFor GetObjectParameterIndexFor

#define STATIC_GetNamespaceSeparator GetNamespaceSeparator
#define STATIC_RenameEventsFunctionsExtension RenameEventsFunctionsExtension
#define STATIC_RenameEventsFunction RenameEventsFunction
#define STATIC_RenameBehaviorEventsFunction RenameBehaviorEventsFunction
#define STATIC_MoveEventsFunctionParameter MoveEventsFunctionParameter
#define STATIC_MoveBehaviorEventsFunctionParameter \
  MoveBehaviorEventsFunctionParameter
#define STATIC_RenameBehaviorProperty RenameBehaviorProperty
#define STATIC_RenameEventsBasedBehavior RenameEventsBasedBehavior

#define STATIC_GetBehaviorPropertyGetterName GetBehaviorPropertyGetterName
#define STATIC_GetBehaviorPropertySetterName GetBehaviorPropertySetterName
#define STATIC_GetPropertyActionName GetPropertyActionName
#define STATIC_GetPropertyConditionName GetPropertyConditionName
#define STATIC_GetPropertyExpressionName GetPropertyExpressionName

#define STATIC_CopyAllResourcesTo CopyAllResourcesTo

#define STATIC_IsExtensionLifecycleEventsFunction \
  IsExtensionLifecycleEventsFunction

#define STATIC_GetCompletionDescriptionsFor GetCompletionDescriptionsFor

#define STATIC_ScanProject ScanProject

// We postfix some methods with "At" as Javascript does not support overloading
#define GetLayoutAt GetLayout
#define GetExternalEventsAt GetExternalEvents
#define GetExternalLayoutAt GetExternalLayout
#define GetEventsFunctionsExtensionAt GetEventsFunctionsExtension
#define GetLayerAt GetLayer
#define GetObjectAt GetObject
#define GetAt Get
#define GetEventAt GetEvent
#define RemoveEventAt RemoveEvent
#define RemoveAt Remove
#define GetEventsFunctionAt GetEventsFunction
#define GetEffectAt GetEffect

// We don't use prefix in .idl file to workaround a webidl_binder.py bug
// that can't find in its list of interfaces a class which has a prefix.
using namespace gd;
using namespace std;

#include "glue.cpp"
