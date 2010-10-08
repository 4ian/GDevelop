//////////////////////////////////////////////////////////////////////////////////
// SPARK particle engine														//
// Copyright (C) 2008-2009 - Julien Fryer - julienfryer@gmail.com				//
//																				//
// This software is provided 'as-is', without any express or implied			//
// warranty.  In no event will the authors be held liable for any damages		//
// arising from the use of this software.										//
//																				//
// Permission is granted to anyone to use this software for any purpose,		//
// including commercial applications, and to alter it and redistribute it		//
// freely, subject to the following restrictions:								//
//																				//
// 1. The origin of this software must not be misrepresented; you must not		//
//    claim that you wrote the original software. If you use this software		//
//    in a product, an acknowledgment in the product documentation would be		//
//    appreciated but is not required.											//
// 2. Altered source versions must be plainly marked as such, and must not be	//
//    misrepresented as being the original software.							//
// 3. This notice may not be removed or altered from any source distribution.	//
//////////////////////////////////////////////////////////////////////////////////

#ifndef H_OBJECT3D
#define H_OBJECT3D

#include <string>
#include <vector>

class Object3D
{
public :

	Object3D();
	~Object3D();

	bool load(const std::string& path);
	void render();

private :

	struct SubObject
	{
		size_t nbVertices;
		float* vertices;
		float* normals;
		float* texCoords;
		GLuint textureID;

		SubObject() : nbVertices(0),vertices(NULL),normals(NULL),texCoords(NULL),textureID(0) {}
	};

	std::vector<SubObject> subObjects;
	bool loaded;

	bool loadTexture(GLuint& index,const char* path,GLuint type,GLuint clamp,bool mipmap);
};

#endif
