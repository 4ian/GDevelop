#ifndef RUNTIMESCENETOOLS_H
#define RUNTIMESCENETOOLS_H

#include <string>
class RuntimeScene;
class Variable;

/**
 * Only used internally by GD events generated code.
 */
void CreateObjectOnScene(RuntimeScene & scene, std::vector<Object*> & pickedObjects, const std::string & objectName, float positionX, float positionY, const std::string & layer);

/**
 * Only used internally by GD events generated code.
 */
void PickAllObjects(RuntimeScene & scene, std::vector<Object*> & pickedObjects, const std::string & objectName);

/**
 * Only used internally by GD events generated code.
 */
void PickRandomObject(RuntimeScene & scene, std::vector<Object*> & pickedObjects, const std::string & objectName);

/**
 * Only used internally by GD events generated code.
 * \return Variable with specified name
 */
Variable & GetSceneVariable(RuntimeScene & scene, std::string variableName);

/**
 * Only used internally by GD events generated code.
 * \return Global variable with specified name
 */
Variable & GetGlobalVariable(RuntimeScene & scene, std::string variableName);

/**
 * Only used internally by GD events generated code.
 * \return True if a variable exists
 */
bool SceneVariableDefined(RuntimeScene & scene, std::string variableName);

/**
 * Only used internally by GD events generated code.
 * \return True if a variable exists
 */
bool GlobalVariableDefined(RuntimeScene & scene, std::string variableName);

/**
 * Only used internally by GD events generated code.
 * \return Value of a variable
 */
double GetVariableValue( const RuntimeScene & scene, std::string variableName);

/**
 * Only used internally by GD events generated code.
 * \return String of a variable
 */
const std::string & GetVariableString( const RuntimeScene & scene, std::string variableName);

/**
 * Only used internally by GD events generated code.
 * \return Value of a global variable
 */
double GetGlobalVariableValue( const RuntimeScene & scene, std::string variableName);

/**
 * Only used internally by GD events generated code.
 * \return String of a global variable
 */
const std::string & GetGlobalVariableString( const RuntimeScene & scene, std::string variableName);

#endif // RUNTIMESCENETOOLS_H
