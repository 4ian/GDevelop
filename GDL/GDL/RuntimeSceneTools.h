#ifndef RUNTIMESCENETOOLS_H
#define RUNTIMESCENETOOLS_H

#include <string>
#include <vector>
class RuntimeScene;
class Variable;
class Object;

/**
 * Only used internally by GD events generated code.
 */
bool GD_API LayerVisible( RuntimeScene & scene, const std::string & layer );

/**
 * Only used internally by GD events generated code.
 */
void GD_API ShowLayer( RuntimeScene & scene, const std::string & layer );

/**
 * Only used internally by GD events generated code.
 */
void GD_API HideLayer( RuntimeScene & scene, const std::string & layer );

/**
 * Only used internally by GD events generated code.
 */
void GD_API StopGame( RuntimeScene & scene );

/**
 * Only used internally by GD events generated code.
 */
void GD_API ChangeScene( RuntimeScene & scene, std::string newSceneName );

/**
 * Only used internally by GD events generated code.
 */
bool GD_API SceneJustBegins(RuntimeScene & scene );

/**
 * Only used internally by GD events generated code.
 */
void GD_API MoveObjects( RuntimeScene & scene );

/**
 * Only used internally by GD events generated code.
 */
void GD_API CreateObjectOnScene(RuntimeScene & scene, std::vector<Object*> & pickedObjects, const std::string & objectName, float positionX, float positionY, const std::string & layer);

/**
 * Only used internally by GD events generated code.
 *
 * \return true ( always )
 */
bool GD_API PickAllObjects(RuntimeScene & scene, std::vector<Object*> & pickedObjects, const std::string & objectName);

/**
 * Only used internally by GD events generated code.
 *
 * \return true ( always )
 */
bool GD_API PickRandomObject(RuntimeScene & scene, std::vector<Object*> & pickedObjects, const std::string & objectName);

/**
 * Only used internally by GD events generated code.
 * \return Variable with specified name
 */
Variable & GD_API GetSceneVariable(RuntimeScene & scene, const std::string & variableName);

/**
 * Only used internally by GD events generated code.
 * \return Global variable with specified name
 */
Variable & GD_API GetGlobalVariable(RuntimeScene & scene, const std::string & variableName);

/**
 * Only used internally by GD events generated code.
 * \return True if a variable exists
 */
bool GD_API SceneVariableDefined(RuntimeScene & scene, const std::string & variableName);

/**
 * Only used internally by GD events generated code.
 * \return True if a variable exists
 */
bool GD_API GlobalVariableDefined(RuntimeScene & scene, const std::string & variableName);

/**
 * Only used internally by GD events generated code.
 * \return Value of a variable
 */
double GD_API GetSceneVariableValue( const RuntimeScene & scene, const std::string & variableName);

/**
 * Only used internally by GD events generated code.
 * \return String of a variable
 */
const std::string & GD_API GetSceneVariableString( const RuntimeScene & scene, const std::string & variableName);

/**
 * Only used internally by GD events generated code.
 * \return Value of a global variable
 */
double GD_API GetGlobalVariableValue( const RuntimeScene & scene, const std::string & variableName);

/**
 * Only used internally by GD events generated code.
 * \return String of a global variable
 */
const std::string & GD_API GetGlobalVariableString( const RuntimeScene & scene, const std::string & variableName);

#endif // RUNTIMESCENETOOLS_H
