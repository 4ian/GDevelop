#ifndef RUNTIMESCENETOOLS_H
#define RUNTIMESCENETOOLS_H

#include <string>
#include <vector>
#include <map>
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
void GD_API CreateObjectOnScene(RuntimeScene & scene, std::map <std::string, std::vector<Object*> *> mapOfAllObjectLists, std::vector<std::string> & alreadyDeclaredObjects, const std::string & objectName, float positionX, float positionY, const std::string & layer);
void GD_API CreateObjectOnScene(RuntimeScene & scene, std::map <std::string, std::vector<Object*> *> pickedObjectLists, int useless, const std::string & objectWanted, float positionX, float positionY, const std::string & layer);
/**
 * Only used internally by GD events generated code.
 *
 * \return true ( always )
 */
bool GD_API PickAllObjects(RuntimeScene & scene, std::map <std::string, std::vector<Object*> *> pickedObjectLists, int useless, const std::string & objectName);

/**
 * Only used internally by GD events generated code.
 *
 * \return true ( always )
 */
bool GD_API PickRandomObject(RuntimeScene & scene, std::map <std::string, std::vector<Object*> *> pickedObjectLists, int useless, const std::string & objectName);

/**
 * Only used internally by GD events generated code.
 */
void GD_API ChangeSceneBackground( RuntimeScene & scene, std::string newColor );

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

/**
 * Only used internally by GD events generated code.
 */
void GD_API SetFullScreen(RuntimeScene & scene, bool fullscreen);

/**
 * Only used internally by GD events generated code.
 */
void GD_API SetWindowSize(RuntimeScene & scene, int width, int height, bool useTheNewSizeForCameraDefaultSize);

/**
 * Only used internally by GD events generated code.
 */
void GD_API SetWindowIcon(RuntimeScene & scene, const std::string & imageName);

/**
 * Only used internally by GD events generated code.
 */
unsigned int GD_API GetSceneWindowWidth(RuntimeScene & scene);

/**
 * Only used internally by GD events generated code.
 */
unsigned int GD_API GetSceneWindowHeight(RuntimeScene & scene);

unsigned int GD_API GetScreenWidth();
unsigned int GD_API GetScreenHeight();
unsigned int GD_API GetScreenColorDepth();

/**
 * Only used internally by GD events generated code.
 */
void GD_API DisplayLegacyTextOnScene( RuntimeScene & scene, const std::string & str, float x, float y, const std::string & color, float characterSize, const std::string & fontName, const std::string & layer);

#endif // RUNTIMESCENETOOLS_H
