#ifndef SPRITETOOLS_H
#define SPRITETOOLS_H

#include <string>
#include <vector>
class RuntimeScene;
class Object;

bool GD_API SpriteTurnedToward( std::string, std::string, std::vector<Object*> & objects1, std::vector<Object*> & objects2, float tolerance, bool conditionInverted );
bool GD_API SpriteCollision( std::string, std::string, std::vector<Object*> & objects1, std::vector<Object*> & objects2, bool conditionInverted );
void GD_API TurnSpriteToward( std::string, std::string, std::vector<Object*> & objects1, std::vector<Object*> & objects2 );
bool GD_API CursorOnSpriteObject( RuntimeScene & scene, std::string, std::vector<Object*> & objects, bool accurate, bool conditionInverted );

#endif // SPRITETOOLS_H
