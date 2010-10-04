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

#include <iostream>

#if defined(WIN32) || defined(_WIN32)
#include <windows.h>
#endif
#include <GL/gl.h>
#include <GL/glu.h>

#include <SDL.h>

#include "Object3D.h"
#include "objLoader.h"

Object3D::Object3D() :
	subObjects(),
	loaded(false)
{}

Object3D::~Object3D()
{
	if (loaded)
		for (size_t i = 0; i < subObjects.size(); i++)
		{
			delete[] subObjects[i].vertices;
			delete[] subObjects[i].normals;
			delete[] subObjects[i].texCoords;
		}
}

bool Object3D::load(const std::string& path)
{
	if (loaded)
	{
		std::cerr << "Object already loaded" << std::endl;
		return false;
	}

	objLoader objData;
	if (!objData.load(const_cast<char*>(path.c_str())))
	{
		std::cerr << "Object cannot be loaded" << std::endl;
		return false;
	}

	subObjects.clear();
	subObjects.assign(objData.materialCount,SubObject());
	
	for (int i = 0; i < objData.faceCount; ++i)
	{
		const obj_face& face = *objData.faceList[i];
		if (face.material_index >= 0)
			subObjects[face.material_index].nbVertices += 3;
	}
	
	for (size_t i = 0; i < subObjects.size(); ++i)
	{
		if (subObjects[i].nbVertices == 0)
			continue;

		subObjects[i].vertices = new float[subObjects[i].nbVertices * 3];
		subObjects[i].normals = new float[subObjects[i].nbVertices * 3];
		subObjects[i].texCoords = new float[subObjects[i].nbVertices * 2];
	}

	size_t* currentVertexIndex = new size_t[subObjects.size()];
	for (size_t i = 0; i < subObjects.size(); ++i)
		currentVertexIndex[i] = 0;

	for (int i = 0; i < objData.faceCount; ++i)
	{
		const obj_face& face = *objData.faceList[i];
		int currentObj = face.material_index;
		if (currentObj < 0)
			continue;

		for (size_t j = 0; j < 3; ++j)
		{	
			int index = face.vertex_index[j];
			if (index >= 0)
			{
				subObjects[currentObj].vertices[currentVertexIndex[currentObj] * 3 + 0] = static_cast<float>(objData.vertexList[index]->e[0]);
				subObjects[currentObj].vertices[currentVertexIndex[currentObj] * 3 + 1] = static_cast<float>(objData.vertexList[index]->e[1]);
				subObjects[currentObj].vertices[currentVertexIndex[currentObj] * 3 + 2] = static_cast<float>(objData.vertexList[index]->e[2]);
			}

			index = face.normal_index[j];
			if (index >= 0)
			{
				subObjects[currentObj].normals[currentVertexIndex[currentObj] * 3 + 0] = static_cast<float>(objData.normalList[index]->e[0]);
				subObjects[currentObj].normals[currentVertexIndex[currentObj] * 3 + 1] = static_cast<float>(objData.normalList[index]->e[1]);
				subObjects[currentObj].normals[currentVertexIndex[currentObj] * 3 + 2] = static_cast<float>(objData.normalList[index]->e[2]);
			}

			index = face.texture_index[j];
			if (index >= 0)
			{
				subObjects[currentObj].texCoords[currentVertexIndex[currentObj] * 2 + 0] = static_cast<float>(objData.textureList[index]->e[0]);
				subObjects[currentObj].texCoords[currentVertexIndex[currentObj] * 2 + 1] = static_cast<float>(objData.textureList[index]->e[1]);
			}

			++currentVertexIndex[currentObj];
		}
	}

	delete[] currentVertexIndex;

	for (size_t i = 0; i < subObjects.size(); ++i)
	{
		const obj_material& mat = *objData.materialList[i];
		std::string textureName(mat.texture_filename);
		int pos = textureName.find(".bmp") + 4;
		loadTexture(subObjects[i].textureID,textureName.substr(0,pos).c_str(),GL_RGB,GL_CLAMP,true);
	}

	std::cout << "Object sucessfully loaded from " << path << std::endl;
	std::cout << "Nb of sub-objects : " << subObjects.size() << std::endl;
	for (size_t i = 0; i < subObjects.size(); ++i)
		std::cout << "Nb of faces of sub-object " << i << " : " << subObjects[i].nbVertices / 3 << std::endl;
	std::cout << "DONE" << std::endl;

	loaded = true;
	return true;
}

void Object3D::render()
{
	if (!loaded)
		return;

	glEnableClientState(GL_VERTEX_ARRAY);
	glEnableClientState(GL_NORMAL_ARRAY);
	glEnableClientState(GL_TEXTURE_COORD_ARRAY);

	for (size_t i = 0; i < subObjects.size(); ++i)
	{
		if (subObjects[i].nbVertices <= 0)
			continue;

		glEnable(GL_TEXTURE_2D);
		glBindTexture(GL_TEXTURE_2D,subObjects[i].textureID);

		glVertexPointer(3,GL_FLOAT,0,subObjects[i].vertices);
		glNormalPointer(GL_FLOAT,0,subObjects[i].normals);
		glTexCoordPointer(2,GL_FLOAT,0,subObjects[i].texCoords);
	
		glDrawArrays(GL_TRIANGLES,0,subObjects[i].nbVertices);
	}

	glDisableClientState(GL_VERTEX_ARRAY);
	glDisableClientState(GL_NORMAL_ARRAY);
	glDisableClientState(GL_TEXTURE_COORD_ARRAY);
}

// Loads a texture
bool Object3D::loadTexture(GLuint& index,const char* path,GLuint type,GLuint clamp,bool mipmap)
{
	SDL_Surface *img; 
	img = SDL_LoadBMP(path);
	if (img == NULL)
	{
		std::cout << "Unable to load bitmap :" << SDL_GetError() << std::endl;
		return false;
	}

	// converts from BGR to RGB
	if ((type == GL_RGB)||(type == GL_RGBA))
	{
		const int offset = (type == GL_RGB ? 3 : 4);
		unsigned char* iterator = static_cast<unsigned char*>(img->pixels);
		unsigned char *tmp0,*tmp1;
		for (int i = 0; i < img->w * img->h; ++i)
		{
			tmp0 = iterator;
			tmp1 = iterator + 2;
			std::swap(*tmp0,*tmp1);
			iterator += offset;
		}
	}

	glGenTextures(1,&index);
	glBindTexture(GL_TEXTURE_2D,index);

	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_WRAP_S,clamp);
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_WRAP_T,clamp);
	glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MAG_FILTER,GL_LINEAR);

	if (mipmap)
	{
		glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_LINEAR_MIPMAP_LINEAR);

		gluBuild2DMipmaps(GL_TEXTURE_2D,
			type,
			img->w,
			img->h,
			type,
			GL_UNSIGNED_BYTE,
			img->pixels);
	}
	else
	{
		glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_LINEAR);

		glTexImage2D(GL_TEXTURE_2D,
			0,
			type,
			img->w,
			img->h,
			0,
			type,
			GL_UNSIGNED_BYTE,
			img->pixels);
	}

	SDL_FreeSurface(img);

	return true;
}
