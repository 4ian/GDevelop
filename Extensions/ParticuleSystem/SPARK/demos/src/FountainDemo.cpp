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


#include <cmath>
#include <iostream>
#include <sstream>
#include <string>
#include <ctime>

#if defined(WIN32) || defined(_WIN32)
#include <windows.h>
#endif
#include <GL/gl.h>
#include <GL/glu.h>

#include <SDL.h>

#include <FTGL/ftgl.h>

#include "SPK.h"
#include "SPK_GL.h"

using namespace std;
using namespace SPK;
using namespace SPK::GL;

float angleY = 25.0f;
float angleX = 25.0f;
float camPosZ = 8.0f;

int totalTime = 0;
int deltaTime = 0;

FTGLTextureFont* fontPtr;

Group* particleGroup = NULL;
System* particleSystem = NULL;

const float PI = 3.14159265358979323846f;

const string STR_GRAPHICS = "GRAPHICS : ";
const string STR_NB_PARTICLES = "NB PARTICLES : ";
const string STR_FPS = "FPS : ";

string strGraphics = STR_GRAPHICS + "HIGH";
string strNbParticles = STR_NB_PARTICLES;
string strFps = STR_FPS;

int screenWidth;
int screenHeight;
float screenRatio;

GLuint textureGrass;
GLuint textureWater;
GLuint textureFountain;

const GLuint DISPLAY_LIST_OBJECT = 1;
const GLuint DISPLAY_LIST_WATER = 2;

int drawText = 2;

bool renderEnv = true;

// Converts an int into a string
string int2Str(int a)
{
    ostringstream stm;
    stm << a;
    return stm.str();
}

// Loads a texture
bool loadTexture(GLuint& index,char* path,GLuint type,GLuint clamp,bool mipmap)
{
	SDL_Surface *particleImg; 
	particleImg = SDL_LoadBMP(path);
	if (particleImg == NULL)
	{
		cout << "Unable to load bitmap :" << SDL_GetError() << endl;
		return false;
	}

	// converts from BGR to RGB
	if ((type == GL_RGB)||(type == GL_RGBA))
	{
		const int offset = (type == GL_RGB ? 3 : 4);
		unsigned char* iterator = static_cast<unsigned char*>(particleImg->pixels);
		unsigned char *tmp0,*tmp1;
		for (int i = 0; i < particleImg->w * particleImg->h; ++i)
		{
			tmp0 = iterator;
			tmp1 = iterator + 2;
			swap(*tmp0,*tmp1);
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
			particleImg->w,
			particleImg->h,
			type,
			GL_UNSIGNED_BYTE,
			particleImg->pixels);
	}
	else
	{
		glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_LINEAR);

		glTexImage2D(GL_TEXTURE_2D,
			0,
			type,
			particleImg->w,
			particleImg->h,
			0,
			type,
			GL_UNSIGNED_BYTE,
			particleImg->pixels);
	}

	SDL_FreeSurface(particleImg);

	return true;
}

// Draws the bounding box for a particle group
void drawBoundingBox(const Group& group)
{
	if (!group.isAABBComputingEnabled())
		return;

	Vector3D AABBMin = group.getAABBMin();
	Vector3D AABBMax = group.getAABBMax();

	glDisable(GL_TEXTURE_2D);
	glBegin(GL_LINES);
	glColor3f(1.0f,0.0f,0.0f);

	glVertex3f(AABBMin.x,AABBMin.y,AABBMin.z);
	glVertex3f(AABBMax.x,AABBMin.y,AABBMin.z);
	
	glVertex3f(AABBMin.x,AABBMin.y,AABBMin.z);
	glVertex3f(AABBMin.x,AABBMax.y,AABBMin.z);

	glVertex3f(AABBMin.x,AABBMin.y,AABBMin.z);
	glVertex3f(AABBMin.x,AABBMin.y,AABBMax.z);

	glVertex3f(AABBMax.x,AABBMax.y,AABBMax.z);
	glVertex3f(AABBMin.x,AABBMax.y,AABBMax.z);

	glVertex3f(AABBMax.x,AABBMax.y,AABBMax.z);
	glVertex3f(AABBMax.x,AABBMin.y,AABBMax.z);

	glVertex3f(AABBMax.x,AABBMax.y,AABBMax.z);
	glVertex3f(AABBMax.x,AABBMax.y,AABBMin.z);

	glVertex3f(AABBMin.x,AABBMin.y,AABBMax.z);
	glVertex3f(AABBMax.x,AABBMin.y,AABBMax.z);

	glVertex3f(AABBMin.x,AABBMin.y,AABBMax.z);
	glVertex3f(AABBMin.x,AABBMax.y,AABBMax.z);

	glVertex3f(AABBMin.x,AABBMax.y,AABBMin.z);
	glVertex3f(AABBMax.x,AABBMax.y,AABBMin.z);

	glVertex3f(AABBMin.x,AABBMax.y,AABBMin.z);
	glVertex3f(AABBMin.x,AABBMax.y,AABBMax.z);

	glVertex3f(AABBMax.x,AABBMin.y,AABBMin.z);
	glVertex3f(AABBMax.x,AABBMax.y,AABBMin.z);

	glVertex3f(AABBMax.x,AABBMin.y,AABBMin.z);
	glVertex3f(AABBMax.x,AABBMin.y,AABBMax.z);
	glEnd();
}

// Creates display lists
void createDisplayLists()
{
	glNewList(DISPLAY_LIST_OBJECT,GL_COMPILE);

	glDisable(GL_CULL_FACE);
	glDisable(GL_BLEND);
	glEnable(GL_TEXTURE_2D);
	glDisable(GL_DEPTH_TEST);

	// grass
	glBindTexture(GL_TEXTURE_2D,textureGrass);
	glBegin(GL_QUADS);
	glColor3f(0.21f,0.64f,0.12f);
	glTexCoord2f(20.0f,20.0f);
	glVertex3f(40.0f,0.0f,40.0f);
	glTexCoord2f(20.0f,-20.0f);
	glVertex3f(40.0f,0.0f,-40.0f);
	glTexCoord2f(-20.0f,-20.0f);
	glVertex3f(-40.0f,0.0f,-40.0f);
	glTexCoord2f(-20.0f,20.0f);
	glVertex3f(-40.0f,0.0f,40.0f);
	glEnd();

	// bottom
	glBindTexture(GL_TEXTURE_2D,textureFountain);
	glBegin(GL_TRIANGLE_FAN);
	glColor4f(0.75f,0.75f,0.75f,1.0f);
	glTexCoord2f(0.0f,0.0f);
	glVertex3f(0.0f,0.0f,0.0f);
	glTexCoord2f(5.0f,0.0f);
	glVertex3f(2.5f,0.0f,0.0f);
	glTexCoord2f(3.54f,-3.54f);
	glVertex3f(1.77f,0.0f,-1.77f);
	glTexCoord2f(0.0f,-5.0f);
	glVertex3f(0.0f,0.0f,-2.5f);
	glTexCoord2f(-3.54f,-3.54f);
	glVertex3f(-1.77f,0.0f,-1.77f);
	glTexCoord2f(-5.0f,0.0f);
	glVertex3f(-2.5f,0.0f,0.0f);
	glTexCoord2f(-3.54f,3.54f);
	glVertex3f(-1.77f,0.0f,1.77f);
	glTexCoord2f(0.0f,5.0f);
	glVertex3f(0.0f,0.0f,2.5f);
	glTexCoord2f(3.54f,3.54f);
	glVertex3f(1.77f,0.0f,1.77f);
	glTexCoord2f(5.0f,0.0f);
	glVertex3f(2.5f,0.0f,0.0f);
	glEnd();

	glEnable(GL_DEPTH_TEST);
	glEnable(GL_CULL_FACE);

	// inner borders
	glBegin(GL_QUAD_STRIP);
	glColor4f(0.5f,0.5f,0.5f,1.0f);
	glTexCoord2f(0.0f,0.0f);
	glVertex3f(2.5f,0.0f,0.0f);
	glTexCoord2f(0.0f,0.5f);
	glVertex3f(2.5f,0.20f,0.0f);
	glTexCoord2f(5.0f,0.0f);
	glVertex3f(1.77f,0.0f,-1.77f);
	glTexCoord2f(5.0f,0.5f);
	glVertex3f(1.77f,0.20f,-1.77f);
	glTexCoord2f(10.0f,0.0f);
	glVertex3f(0.0f,0.0f,-2.5f);
	glTexCoord2f(10.0f,0.5f);
	glVertex3f(0.0f,0.20f,-2.5f);
	glColor4f(0.85f,0.85f,0.85f,1.0f);
	glTexCoord2f(15.0f,0.0f);
	glVertex3f(-1.77f,0.0f,-1.77f);
	glTexCoord2f(15.0f,0.5f);
	glVertex3f(-1.77f,0.20f,-1.77f);
	glColor4f(1.0f,1.0f,1.0f,1.0f);
	glTexCoord2f(20.0f,0.00f);
	glVertex3f(-2.5f,0.0f,0.0f);
	glTexCoord2f(20.0f,0.5f);
	glVertex3f(-2.5f,0.20f,0.0f);
	glColor4f(0.85f,0.85f,0.85f,1.0f);
	glTexCoord2f(25.0f,0.0f);
	glVertex3f(-1.77f,0.0f,1.77f);
	glTexCoord2f(25.0f,0.5f);
	glVertex3f(-1.77f,0.20f,1.77f);
	glColor4f(0.5f,0.5f,0.5f,1.0f);
	glTexCoord2f(30.0f,0.0f);
	glVertex3f(0.0f,0.0f,2.5f);
	glTexCoord2f(30.0f,0.5f);
	glVertex3f(0.0f,0.20f,2.5f);
	glTexCoord2f(35.0f,0.0f);
	glVertex3f(1.77f,0.0f,1.77f);
	glTexCoord2f(35.0f,0.5f);
	glVertex3f(1.77f,0.20f,1.77f);
	glTexCoord2f(40.0f,0.0f);
	glVertex3f(2.5f,0.0f,0.0f);
	glTexCoord2f(40.0f,0.5f);
	glVertex3f(2.5f,0.20f,0.0f);
	glEnd();

	// outter borders
	glBegin(GL_QUAD_STRIP);
	glColor4f(1.0f,1.0f,1.0f,1.0f);
	glTexCoord4f(0.0f,0.5f * 1.99f,0.0f,1.99f);
	glVertex3f(2.6f,0.20f,0.0f);
	glTexCoord4f(0.0f,0.0f,0.0f,2.07f);
	glVertex3f(2.7f,0.0f,0.0f);
	glColor4f(0.85f,0.85f,0.85f,1.0f);
	glTexCoord4f(5.0f * 1.99f,0.5f * 1.99f,0.0f,1.99f);
	glVertex3f(1.84f,0.20f,-1.84f);
	glTexCoord4f(5.0f * 2.07f,0.0f,0.0f,2.07f);
	glVertex3f(1.91f,0.0f,-1.91f);
	glColor4f(0.5f,0.5f,0.5f,1.0f);
	glTexCoord4f(10.0f * 1.99f,0.5f * 1.99f,0.0f,1.99f);
	glVertex3f(0.0f,0.20f,-2.6f);
	glTexCoord4f(10.0f * 2.07f,0.0f,0.0f,2.07f);
	glVertex3f(0.0f,0.0f,-2.7f);
	glTexCoord4f(15.0f * 1.99f,0.5f * 1.99f,0.0f,1.99f);
	glVertex3f(-1.84f,0.20f,-1.84f);
	glTexCoord4f(15.0f * 2.07f,0.0f,0.0f,2.07f);
	glVertex3f(-1.91f,0.0f,-1.91f);
	glTexCoord4f(20.0f * 1.99f,0.5f * 1.99f,0.0f,1.99f);
	glVertex3f(-2.6f,0.20f,0.0f);
	glTexCoord4f(20.0f * 2.07f,0.0f,0.0f,2.07f);
	glVertex3f(-2.7f,0.0f,0.0f);
	glTexCoord4f(25.0f * 1.99f,0.5f * 1.99f,0.0f,1.99f);
	glVertex3f(-1.84f,0.20f,1.84f);
	glTexCoord4f(25.0f * 2.07f,0.0f,0.0f,2.07f);
	glVertex3f(-1.91f,0.0f,1.91f);
	glTexCoord4f(30.0f * 1.99f,0.5f * 1.99f,0.0f,1.99f);
	glVertex3f(0.0f,0.20f,2.6f);
	glTexCoord4f(30.0f * 2.07f,0.0f,0.0f,2.07f);
	glVertex3f(0.0f,0.0f,2.7f);
	glColor4f(0.85f,0.85f,0.85f,1.0f);
	glTexCoord4f(35.0f * 1.99f,0.5f * 1.99f,0.0f,1.99f);
	glVertex3f(1.84f,0.20f,1.84f);
	glTexCoord4f(35.0f * 2.07f,0.0f,0.0f,2.07f);
	glVertex3f(1.91f,0.0f,1.91f);
	glColor4f(1.0f,1.0f,1.0f,1.0f);
	glTexCoord4f(40.0f * 1.99f,0.5f * 1.99f,0.0f,1.99f);
	glVertex3f(2.6f,0.20f,0.0f);
	glTexCoord4f(40.0f * 2.07f,0.0f,0.0f,2.07f);
	glVertex3f(2.7f,0.0f,0.0f);
	glEnd();

	glDisable(GL_CULL_FACE);

	// top borders
	glBegin(GL_QUAD_STRIP);
	glColor4f(0.75f,0.75f,0.75f,1.0f);
	glTexCoord4f(0.0f,0.25f * 1.91f,0.0f,1.91f);
	glVertex3f(2.5f,0.20f,0.0f);
	glTexCoord4f(0.0f,0.0f,0.0f,1.99f);
	glVertex3f(2.6f,0.20f,0.0f);
	glTexCoord4f(5.0f * 1.91f,0.25f * 1.91f,0.0f,1.91f);
	glVertex3f(1.77f,0.20f,-1.77f);
	glTexCoord4f(5.0f * 1.99f,0.0f,0.0f,1.99f);
	glVertex3f(1.84f,0.20f,-1.84f);
	glTexCoord4f(10.0f * 1.91f,0.25f * 1.91f,0.0f,1.91f);
	glVertex3f(0.0f,0.20f,-2.5f);
	glTexCoord4f(10.0f * 1.99f,0.0f,0.0f,1.99f);
	glVertex3f(0.0f,0.20f,-2.6f);
	glTexCoord4f(15.0f * 1.91f,0.25f * 1.91f,0.0f,1.91f);
	glVertex3f(-1.77f,0.20f,-1.77f);
	glTexCoord4f(15.0f * 1.99f,0.0f,0.0f,1.99f);
	glVertex3f(-1.84f,0.20f,-1.84f);
	glTexCoord4f(20.0f * 1.91f,0.25f * 1.91f,0.0f,1.91f);
	glVertex3f(-2.5f,0.20f,0.0f);
	glTexCoord4f(20.0f * 1.99f,0.0f,0.0f,1.99f);
	glVertex3f(-2.6f,0.20f,0.0f);
	glTexCoord4f(25.0f * 1.91f,0.25f * 1.91f,0.0f,1.91f);
	glVertex3f(-1.77f,0.20f,1.77f);
	glTexCoord4f(25.0f * 1.99f,0.0f,0.0f,1.99f);
	glVertex3f(-1.84f,0.20f,1.84f);
	glTexCoord4f(30.0f * 1.91f,0.25f * 1.91f,0.0f,1.91f);
	glVertex3f(0.0f,0.20f,2.5f);
	glTexCoord4f(30.0f * 1.99f,0.0f,0.0f,1.99f);
	glVertex3f(0.0f,0.20f,2.6f);
	glTexCoord4f(35.0f * 1.91f,0.25f * 1.91f,0.0f,1.91f);
	glVertex3f(1.77f,0.20f,1.77f);
	glTexCoord4f(35.0f * 1.99f,0.0f,0.0f,1.99f);
	glVertex3f(1.84f,0.20f,1.84f);
	glTexCoord4f(40.0f * 1.91f,0.25f * 1.91f,0.0f,1.91f);
	glVertex3f(2.5f,0.20f,0.0f);
	glTexCoord4f(40.0f * 1.99f,0.0f,0.0f,1.99f);
	glVertex3f(2.6f,0.20f,0.0f);
	glEnd();

	glEndList();

	glNewList(DISPLAY_LIST_WATER,GL_COMPILE);

	// water
	glEnable(GL_BLEND);
	glEnable(GL_TEXTURE_2D);

	glBindTexture(GL_TEXTURE_2D,textureWater);
	glBegin(GL_TRIANGLE_FAN);
	glColor4f(1.0f,1.0f,1.0f,0.3f);
	glTexCoord2f(0.0f,0.0f);
	glVertex3f(0.0f,0.1f,0.0f);
	glTexCoord2f(5.0f,0.0f);
	glVertex3f(2.5f,0.1f,0.0f);
	glTexCoord2f(3.54f,-3.54f);
	glVertex3f(1.77f,0.1f,-1.77f);
	glTexCoord2f(0.0f,-5.0f);
	glVertex3f(0.0f,0.1f,-2.5f);
	glTexCoord2f(-3.54f,-3.54f);
	glVertex3f(-1.77f,0.1f,-1.77f);
	glTexCoord2f(-5.0f,0.0f);
	glVertex3f(-2.5f,0.1f,0.0f);
	glTexCoord2f(-3.54f,3.54f);
	glVertex3f(-1.77f,0.1f,1.77f);
	glTexCoord2f(0.0f,5.0f);
	glVertex3f(0.0f,0.1f,2.5f);
	glTexCoord2f(3.54f,3.54f);
	glVertex3f(1.77f,0.1f,1.77f);
	glTexCoord2f(5.0f,0.0f);
	glVertex3f(2.5f,0.1f,0.0f);
	glEnd();

	glEndList();

}

void renderFirstFrame()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	SDL_GL_SwapBuffers();
	SDL_GL_SwapBuffers();
}

// Renders the scene
void render()
{
	glDepthMask(GL_TRUE);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluPerspective(45,screenRatio,0.01f,80.0f);

	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();                       

	glTranslatef(0.0f,0.0f,-camPosZ);
	glRotatef(angleX,1.0f,0.0f,0.0f);
	glRotatef(angleY,0.0f,1.0f,0.0f);

	if (renderEnv)
	{
		glTexEnvi(GL_TEXTURE_ENV,GL_TEXTURE_ENV_MODE,GL_MODULATE);

		glCallList(DISPLAY_LIST_OBJECT);

		glMatrixMode(GL_TEXTURE);

		float angle = totalTime * 2.0f * PI / 12000.0f;
		float sinA = sin(angle) * 0.2f;
		float cosA = cos(angle) * 0.2f;

		glRotatef(angle,0.0f,0.0f,1.0f);
		glTranslatef(sinA,cosA,1.0f);
		glScalef(1.0f + sinA * 0.2f,1.0f + cosA * 0.2f,1.0f);
	}

	drawBoundingBox(*particleGroup);

	if (renderEnv)
	{
		glCallList(DISPLAY_LIST_WATER);
		glLoadIdentity();
	}

	// Renders particle system
	particleSystem->render();

	if (drawText != 0)
	{
		glMatrixMode(GL_MODELVIEW);
		glLoadIdentity();

		glMatrixMode(GL_PROJECTION);
		glLoadIdentity();
		gluOrtho2D(0,screenWidth,0,screenHeight);

		// Renders info strings
		glDisable(GL_DEPTH_TEST);
		glColor3f(1.0f,1.0f,1.0f);
		if (drawText == 2)
		{
			fontPtr->Render(strGraphics.c_str(),-1,FTPoint(4.0f,72.0f));
			fontPtr->Render(strNbParticles.c_str(),-1,FTPoint(4.0f,40.0f));
		}
		fontPtr->Render(strFps.c_str(),-1,FTPoint(4.0f,8.0f));
	}

	SDL_GL_SwapBuffers();
}

// Call back function to transform water particles that touches the water into splash particles
bool splash(Particle& particle,float deltaTime)
{
	if (particle.position().y < 0.1f)
	{
		if (particle.velocity().y > -0.5f)
			return true;

		particle.position().y = 0.1f;
		particle.position().x += random(0.0f,0.2f) - 0.1f;
		particle.position().z += random(0.0f,0.2f) - 0.1f;

		particle.velocity().set(0,-random(0.1f,0.4f) * particle.velocity().y,0);
		
		particle.setParamCurrentValue(PARAM_ALPHA,0.4f);
		particle.setParamCurrentValue(PARAM_SIZE,0.0f);

		particle.setLifeLeft(0.5f);
	}

	return false;
}

// Main function
int main(int argc, char *argv[])
{
	// random seed
	randomSeed = static_cast<unsigned int>(time(NULL));
	
	// Sets the update step
	System::setClampStep(true,0.1f);			// clamp the step to 100 ms
	System::useAdaptiveStep(0.001f,0.01f);		// use an adaptive step from 1ms to 10ms (1000fps to 100fps)

	SDL_Event event;

	// inits SDL
	SDL_Init(SDL_INIT_VIDEO);
	SDL_WM_SetCaption("SPARK Fountain Demo",NULL);
	SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER,1);

	// vsync
	SDL_GL_SetAttribute(SDL_GL_SWAP_CONTROL,0);

	SDL_SetVideoMode(0,0,32,SDL_OPENGL | SDL_FULLSCREEN);
	SDL_ShowCursor(0);

	SDL_Surface screen = *SDL_GetVideoSurface();
	renderFirstFrame();

	// inits openGL
	screenWidth = screen.w;
	screenHeight = screen.h;
	screenRatio = (float)screen.w / (float)screen.h;
	
	glClearColor(0.0f,0.68f,0.85f,1.0f);
	glViewport(0,0,screen.w,screen.h);

	// Fog
	glEnable(GL_FOG);
	glFogi(GL_FOG_MODE, GL_EXP2);
	float fogColor[4] = {0.0f,0.68f,0.85f,1.0f};
	glFogfv(GL_FOG_COLOR,fogColor);
	glFogf(GL_FOG_DENSITY,0.04f);
	glHint(GL_PERSPECTIVE_CORRECTION_HINT,GL_NICEST);

	glBlendFunc(GL_SRC_ALPHA,GL_ONE_MINUS_SRC_ALPHA);

	// Loads grass texture
	if (!loadTexture(textureGrass,"res/grass.bmp",GL_RGB,GL_REPEAT,true))
		return 1;

	// Loads fountain texture
	if (!loadTexture(textureFountain,"res/tile.bmp",GL_RGB,GL_REPEAT,true))
		return 1;

	// Loads water texture
	if (!loadTexture(textureWater,"res/water.bmp",GL_RGB,GL_REPEAT,true))
		return 1;

	// Loads splash texture
	GLuint textureSplash;
	if (!loadTexture(textureSplash,"res/waterdrops.bmp",GL_ALPHA,GL_CLAMP,false))
		return 1;

	// Creates display lists
	createDisplayLists();

	// Loads texture font
	FTGLTextureFont font = FTGLTextureFont("res/font.ttf");
	if(font.Error())
		return 1;
	font.FaceSize(24);
	fontPtr = &font;

	// Inits Particle Engine
	Vector3D gravity(0.0f,-2.2f,0.0f);

	// Renderer
	GLPointRenderer* basicRenderer = GLPointRenderer::create();

	GLQuadRenderer* particleRenderer = GLQuadRenderer::create();
	particleRenderer->setScale(0.06f,0.06f);
	particleRenderer->setTexturingMode(TEXTURE_2D);
	particleRenderer->setTexture(textureSplash);
	particleRenderer->setBlending(BLENDING_ALPHA);
	particleRenderer->enableRenderingHint(DEPTH_WRITE,false);

	// Model
	Model* particleModel = Model::create(FLAG_ALPHA | FLAG_SIZE | FLAG_ANGLE,
		FLAG_ALPHA | FLAG_SIZE | FLAG_ANGLE,
		FLAG_SIZE | FLAG_ANGLE);

	particleModel->setLifeTime(1.6f,2.2f);
	particleModel->setParam(PARAM_ALPHA,0.2f,0.0f);
	particleModel->setParam(PARAM_SIZE,1.0f,1.0f,2.0f,8.0f);
	particleModel->setParam(PARAM_ANGLE,0.0f,4.0f * PI,0.0f,4.0f * PI);

	// Emitters
	const int NB_EMITTERS = 13;

	Point* emitterZone[NB_EMITTERS];
	emitterZone[0] = Point::create(Vector3D(0.0f,0.1f,0.0f));

	emitterZone[1] = Point::create(Vector3D(0.0f,0.1f,0.0f));
	emitterZone[2] = Point::create(Vector3D(0.0f,0.1f,0.0f));
	emitterZone[3] = Point::create(Vector3D(0.0f,0.1f,0.0f));
	emitterZone[4] = Point::create(Vector3D(0.0f,0.1f,0.0f));

	emitterZone[5] = Point::create(Vector3D(-1.6f,0.1f,-1.6f));
	emitterZone[6] = Point::create(Vector3D(1.6f,0.1f,1.6f));
	emitterZone[7] = Point::create(Vector3D(1.6f,0.1f,-1.6f));
	emitterZone[8] = Point::create(Vector3D(-1.6f,0.1f,1.6f));
	emitterZone[9] = Point::create(Vector3D(-2.26f,0.1f,0.0f));
	emitterZone[10] = Point::create(Vector3D(2.26f,0.1f,0.0f));
	emitterZone[11] = Point::create(Vector3D(0.0f,0.1f,-2.26f));
	emitterZone[12] = Point::create(Vector3D(0.0f,0.1f,2.26f));

	StraightEmitter* particleEmitter[NB_EMITTERS];
	particleEmitter[0] = StraightEmitter::create(Vector3D(0.0f,1.0f,0.0f));

	particleEmitter[1] = StraightEmitter::create(Vector3D(1.0f,3.0f,1.0f));
	particleEmitter[2] = StraightEmitter::create(Vector3D(-1.0f,3.0f,-1.0f));
	particleEmitter[3] = StraightEmitter::create(Vector3D(-1.0f,3.0f,1.0f));
	particleEmitter[4] = StraightEmitter::create(Vector3D(1.0f,3.0f,-1.0f));

	particleEmitter[5] = StraightEmitter::create(Vector3D(1.0f,2.0f,1.0f));
	particleEmitter[6] = StraightEmitter::create(Vector3D(-1.0f,2.0f,-1.0f));
	particleEmitter[7] = StraightEmitter::create(Vector3D(-1.0f,2.0f,1.0f));
	particleEmitter[8] = StraightEmitter::create(Vector3D(1.0f,2.0f,-1.0f));
	particleEmitter[9] = StraightEmitter::create(Vector3D(1.41f,2.0f,0.0f));
	particleEmitter[10] = StraightEmitter::create(Vector3D(-1.41f,2.0f,0.0f));
	particleEmitter[11] = StraightEmitter::create(Vector3D(0.0f,2.0f,1.41f));
	particleEmitter[12] = StraightEmitter::create(Vector3D(0.0f,2.0f,-1.41f));

	float flow[NB_EMITTERS] =
	{
		500.0f,

		600.0f,
		600.0f,
		600.0f,
		600.0f,

		900.0f,
		900.0f,
		900.0f,
		900.0f,
		900.0f,
		900.0f,
		900.0f,
		900.0f,
	};

	float flowLow[NB_EMITTERS] =
	{
		150.0f,

		200.0f,
		200.0f,
		200.0f,
		200.0f,

		250.0f,
		250.0f,
		250.0f,
		250.0f,
		250.0f,
		250.0f,
		250.0f,
		250.0f,
	};
	
	for (int i = 0; i < NB_EMITTERS; ++i)
	{
		particleEmitter[i]->setZone(emitterZone[i]);
		particleEmitter[i]->setFlow(flow[i]);
		particleEmitter[i]->setForce(2.5f,4.0f);
	}
	particleEmitter[0]->setForce(3.0f,3.5f);

	// Group
	particleGroup = Group::create(particleModel,20000);
	particleGroup->setRenderer(particleRenderer);
	for (int i = 0; i < NB_EMITTERS; ++i)
		particleGroup->addEmitter(particleEmitter[i]);
	particleGroup->setCustomUpdate(&splash);
	particleGroup->setGravity(gravity);
	particleGroup->setFriction(0.7f);

	// System
	particleSystem = System::create();
	particleSystem->addGroup(particleGroup);
	
	bool highGraphics = true;
	bool exit = false;
	bool paused = false;

	// renderValue :
	// 0 : normal
	// 1 : basic render
	// 2 : no render
	unsigned int renderValue = 0;

	cout << "\nSPARK FACTORY AFTER INIT :" << endl;
	SPKFactory::getInstance().traceAll();

	SDL_Delay(3000);
	while (SDL_PollEvent(&event)){}
	
	std::deque<unsigned int> frameFPS;
	frameFPS.push_back(SDL_GetTicks());

	while(!exit)
	{
		while (SDL_PollEvent(&event))
		{
			// if esc is pressed, exit
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_ESCAPE))
				exit = true;

			// if del is pressed, reinit the system
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_DELETE))
				particleSystem->empty();

			// if F1 is pressed, we display or not the text
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_F1))
			{
				--drawText;
				if (drawText < 0)
					drawText = 2;
			}

			// if F2 is pressed, we display or not the bounding boxes
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_F2))
			{
				particleGroup->enableAABBComputing(!particleGroup->isAABBComputingEnabled());

				if (paused)
					particleSystem->computeAABB();
			}

			// if F4 is pressed, the renderers are changed
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_F4))
			{
				renderValue = (renderValue + 1) % 3;

				switch (renderValue)
				{
				case 0 :
					particleGroup->setRenderer(particleRenderer);
					break;

				case 1 :
					particleGroup->setRenderer(basicRenderer);
					break;

				case 2 :
					particleGroup->setRenderer(NULL);
					break;
				}
			}

			// if F5 is pressed, environment is rendered are not
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_F5))
			{
				renderEnv = !renderEnv;
				if (renderEnv)
				{
					glClearColor(0.0f,0.68f,0.85f,1.0f);
					glEnable(GL_FOG);
				}
				else
				{
					glClearColor(0.0f,0.0f,0.0f,0.0f);
					glDisable(GL_FOG);
				}
			}

			// if pause is pressed, the system is paused
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_PAUSE))
				paused = !paused;

			// if space is pressed switch to high or low graphics
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_SPACE))
			{
				highGraphics = !highGraphics;
				if (highGraphics)
				{
					for (int i = 0; i < NB_EMITTERS; ++i)
						particleEmitter[i]->setFlow(flow[i]);
					particleModel->setParam(PARAM_ALPHA,0.2f,0.0f);
					particleModel->setParam(PARAM_SIZE,1.0f,1.0f,2.0f,8.0f);
					strGraphics = STR_GRAPHICS + "HIGH";
				}
				else
				{
					for (int i = 0; i < NB_EMITTERS; ++i)
						particleEmitter[i]->setFlow(flowLow[i]);
					particleModel->setParam(PARAM_ALPHA,0.4f,0.0f);
					particleModel->setParam(PARAM_SIZE,1.5f,1.5f,2.0f,8.0f);
					strGraphics = STR_GRAPHICS + "LOW";
				}
			}

			// Moves the camera with the mouse
			if (event.type == SDL_MOUSEMOTION)
			{
				angleY += event.motion.xrel * 0.05f;
				angleX += event.motion.yrel * 0.05f;
				angleX = min(179.0f,max(1.0f,angleX));	// we cannot look under the ground
			}

			// Zoom in and out
			if (event.type == SDL_MOUSEBUTTONDOWN)
			{
				if (event.button.button == SDL_BUTTON_WHEELDOWN)
					camPosZ = min(18.0f,camPosZ + 0.5f);
				if (event.button.button == SDL_BUTTON_WHEELUP)
					camPosZ = max(6.0f,camPosZ - 0.5f);
			}
		}

		if (!paused)
		{
			// Update emitters
			float angle = totalTime * 2.0f * PI / 15000.0f;
			float sinA = sin(angle);
			float cosA = cos(angle);
			float sinB = sin(angle * 10.0f);

			for (int i = 1; i < 5; ++i)
			{
				particleEmitter[i]->setForce(1.8f + 1.8f * sinB,2.1f + 2.1f * sinB);
				if (highGraphics)
					particleEmitter[i]->setFlow((flow[i] * 0.5f) + (flow[i] * 0.5f) * sinB);
				else
					particleEmitter[i]->setFlow((flowLow[i] * 0.5f) + (flowLow[i] * 0.5f) * sinB);
			}

			particleEmitter[1]->setDirection(Vector3D(cosA - sinA,3.0f,sinA + cosA));
			particleEmitter[2]->setDirection(Vector3D(-cosA + sinA,3.0f,-sinA - cosA));
			particleEmitter[3]->setDirection(Vector3D(-cosA - sinA,3.0f,-sinA + cosA));
			particleEmitter[4]->setDirection(Vector3D(cosA + sinA,3.0f,sinA - cosA));

			// Updates particle system
			particleSystem->update(deltaTime * 0.001f); // 1 defined as a second

			totalTime += deltaTime;
		}

		// Renders scene
		render();

		// Computes delta time
		int time = SDL_GetTicks();
		deltaTime = time - frameFPS.back();

		frameFPS.push_back(time);

		while((frameFPS.back() - frameFPS.front() > 1000)&&(frameFPS.size() > 2))
			frameFPS.pop_front();

		// Updates info strings
		strNbParticles = STR_NB_PARTICLES + int2Str(particleSystem->getNbParticles());
		int fps = static_cast<int>(((frameFPS.size() - 1) * 1000.0f) / (frameFPS.back() - frameFPS.front()));
		if (drawText == 2)
			strFps = STR_FPS + int2Str(fps);	
		else
			strFps = int2Str(fps);
	}

	cout << "\nSPARK FACTORY BEFORE DESTRUCTION :" << endl;
	SPKFactory::getInstance().traceAll();
	SPKFactory::getInstance().destroyAll();
	cout << "\nSPARK FACTORY AFTER DESTRUCTION :" << endl;
	SPKFactory::getInstance().traceAll();
	SDL_Quit();

	cout << endl;
	system("pause"); // Waits for the user to close the console

	return 0;
}