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

float angleY = 90.0f;
float angleX = 45.0f;
float camPosZ = 10.0f;

int deltaTime = 0;

FTGLTextureFont* fontPtr;

System* particleSystem;
const float PI = 3.14159265358979323846f;

const string STR_NB_PARTICLES = "NB PARTICLES : ";
const string STR_FPS = "FPS : ";

string strNbParticles = STR_NB_PARTICLES;
string strFps = STR_FPS;

int screenWidth;
int screenHeight;
float screenRatio;

int drawText = 2;

GLuint textureWall;
GLuint textureFloor;
GLuint textureCrate;
GLuint textureParticle;

const GLuint DISPLAY_LIST_WORLD = 1;

const float ROOM_X = 7.0f;
const float ROOM_Y = 3.0f;
const float ROOM_Z = 9.0f;

const float CRATE_DIM2 = 1.0f;
const float CRATE_DIM = CRATE_DIM2 * 0.5f;

const size_t NB_CRATES = 5;

AABox* boxes[NB_CRATES + 3];

Vector3D CRATE_POSITIONS[NB_CRATES] =
{
	Vector3D(0.0f,CRATE_DIM,0.0f),
	Vector3D(CRATE_DIM2,CRATE_DIM,0.2f),
	Vector3D(CRATE_DIM2,CRATE_DIM,0.2f + CRATE_DIM2),
	Vector3D(CRATE_DIM2,CRATE_DIM2 + CRATE_DIM,0.5f),
	Vector3D(-1.6f,CRATE_DIM,-0.8f),
};

Vector3D vMin0(10000,10000,10000);
Vector3D vMin1(10000,10000,10000);
Vector3D vMax0(-10000,-10000,-10000);
Vector3D vMax1(-10000,-10000,-10000);

bool enableBoxDrawing = false;
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

void drawBox(const Vector3D& AABBMin,const Vector3D& AABBMax,float r,float g,float b)
{
	glDisable(GL_TEXTURE_2D);
	glBegin(GL_LINES);
	glColor3f(r,g,b);

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

// Draws the bounding box for a particle group
void drawBoundingBox(const System& system)
{
	if (!system.isAABBComputingEnabled())
		return;

	drawBox(system.getAABBMin(),system.getAABBMax(),1.0f,0.0f,0.0f);
}

// Creates the display lists for the world
void createDisplayLists()
{
	const float TEXTURE_SIZE = 2.0f;

	float X = ROOM_X * 0.5f;
	float Y = ROOM_Y;
	float Z = ROOM_Z * 0.5f;

	glNewList(DISPLAY_LIST_WORLD,GL_COMPILE);

	glEnable(GL_CULL_FACE);
	glDisable(GL_BLEND);
	glEnable(GL_TEXTURE_2D);

	// floor
	glBindTexture(GL_TEXTURE_2D,textureFloor);
	glBegin(GL_QUADS);
	glColor3f(0.6f,0.6f,0.6f);
	glTexCoord2f(X / TEXTURE_SIZE,Z / TEXTURE_SIZE);
	glVertex3f(X,0.0f,Z);
	glTexCoord2f(X / TEXTURE_SIZE,-Z / TEXTURE_SIZE);
	glVertex3f(X,0.0f,-Z);
	glTexCoord2f(-X / TEXTURE_SIZE,-Z / TEXTURE_SIZE);
	glVertex3f(-X,0.0f,-Z);
	glTexCoord2f(-X / TEXTURE_SIZE,Z / TEXTURE_SIZE);
	glVertex3f(-X,0.0f,Z);
	glEnd();

	// walls and ceiling
	glBindTexture(GL_TEXTURE_2D,textureWall);
	glBegin(GL_QUADS);

	glColor3f(0.2f,0.2f,0.2f);
	glTexCoord2f(X / TEXTURE_SIZE,Y / TEXTURE_SIZE);
	glVertex3f(X,Y,Z);
	glTexCoord2f(X / TEXTURE_SIZE,0.0F);
	glVertex3f(X,0.0f,Z);
	glTexCoord2f(-X / TEXTURE_SIZE,0.0F);
	glVertex3f(-X,0.0f,Z);
	glTexCoord2f(-X / TEXTURE_SIZE,Y / TEXTURE_SIZE);
	glVertex3f(-X,Y,Z);

	glColor3f(0.6f,0.6f,0.6f);
	glTexCoord2f(-X / TEXTURE_SIZE,Y / TEXTURE_SIZE);
	glVertex3f(-X,Y,-Z);
	glTexCoord2f(-X / TEXTURE_SIZE,0.0F);
	glVertex3f(-X,0.0f,-Z);
	glTexCoord2f(X / TEXTURE_SIZE,0.0F);
	glVertex3f(X,0.0f,-Z);
	glTexCoord2f(X / TEXTURE_SIZE,Y / TEXTURE_SIZE);
	glVertex3f(X,Y,-Z);

	glColor3f(0.4f,0.4f,0.4f);
	glTexCoord2f(Y / TEXTURE_SIZE,-Z / TEXTURE_SIZE);
	glVertex3f(X,Y,-Z);
	glTexCoord2f(0.0f,-Z / TEXTURE_SIZE);
	glVertex3f(X,0.0f,-Z);
	glTexCoord2f(0.0f,Z / TEXTURE_SIZE);
	glVertex3f(X,0.0f,Z);
	glTexCoord2f(Y / TEXTURE_SIZE,Z / TEXTURE_SIZE);
	glVertex3f(X,Y,Z);

	glColor3f(0.4f,0.4f,0.4f);
	glTexCoord2f(Y / TEXTURE_SIZE,Z / TEXTURE_SIZE);
	glVertex3f(-X,Y,Z);
	glTexCoord2f(0.0f,Z / TEXTURE_SIZE);
	glVertex3f(-X,0.0f,Z);
	glTexCoord2f(0.0f,-Z / TEXTURE_SIZE);
	glVertex3f(-X,0.0f,-Z);
	glTexCoord2f(Y / TEXTURE_SIZE,-Z / TEXTURE_SIZE);
	glVertex3f(-X,Y,-Z);

	glColor3f(0.3f,0.3f,0.3f);
	glTexCoord2f(-X / TEXTURE_SIZE,Z / TEXTURE_SIZE);
	glVertex3f(-X,Y,Z);
	glTexCoord2f(-X / TEXTURE_SIZE,-Z / TEXTURE_SIZE);
	glVertex3f(-X,Y,-Z);
	glTexCoord2f(X / TEXTURE_SIZE,-Z / TEXTURE_SIZE);
	glVertex3f(X,Y,-Z);
	glTexCoord2f(X / TEXTURE_SIZE,Z / TEXTURE_SIZE);
	glVertex3f(X,Y,Z);
	glEnd();

	// crate
	glBindTexture(GL_TEXTURE_2D,textureCrate);
	glBegin(GL_QUADS);

	for (size_t i = 0; i < NB_CRATES; ++i)
	{
		X = CRATE_POSITIONS[i].x;
		Y = CRATE_POSITIONS[i].y;
		Z = CRATE_POSITIONS[i].z;

		glColor3f(0.2f,0.2f,0.2f);
		glTexCoord2f(1.0f,1.0f);
		glVertex3f(X + CRATE_DIM,Y + CRATE_DIM,Z - CRATE_DIM);
		glTexCoord2f(1.0f,0.0f);
		glVertex3f(X + CRATE_DIM,Y - CRATE_DIM,Z - CRATE_DIM);
		glTexCoord2f(0.0f,0.0f);
		glVertex3f(X - CRATE_DIM,Y - CRATE_DIM,Z - CRATE_DIM);
		glTexCoord2f(0.0f,1.0f);
		glVertex3f(X - CRATE_DIM,Y + CRATE_DIM,Z - CRATE_DIM);

		glColor3f(1.0f,1.0f,1.0f);
		glTexCoord2f(0.0f,1.0f);
		glVertex3f(X - CRATE_DIM,Y + CRATE_DIM,Z + CRATE_DIM);
		glTexCoord2f(0.0f,0.0f);
		glVertex3f(X -CRATE_DIM,Y - CRATE_DIM,Z + CRATE_DIM);
		glTexCoord2f(1.0f,0.0f);
		glVertex3f(X + CRATE_DIM,Y - CRATE_DIM,Z + CRATE_DIM);
		glTexCoord2f(1.0f,1.0f);
		glVertex3f(X + CRATE_DIM,Y + CRATE_DIM,Z + CRATE_DIM);

		glColor3f(0.6f,0.6f,0.6f);
		glTexCoord2f(1.0f,0.0f);
		glVertex3f(X - CRATE_DIM,Y + CRATE_DIM,Z - CRATE_DIM);
		glTexCoord2f(0.0f,0.0f);
		glVertex3f(X - CRATE_DIM,Y - CRATE_DIM,Z - CRATE_DIM);
		glTexCoord2f(0.0f,1.0f);
		glVertex3f(X - CRATE_DIM,Y - CRATE_DIM,Z + CRATE_DIM);
		glTexCoord2f(1.0f,1.0f);
		glVertex3f(X - CRATE_DIM,Y + CRATE_DIM,Z + CRATE_DIM);

		glColor3f(0.6f,0.6f,0.6f);
		glTexCoord2f(1.0f,1.0f);
		glVertex3f(X + CRATE_DIM,Y + CRATE_DIM,Z + CRATE_DIM);
		glTexCoord2f(0.0f,1.0f);
		glVertex3f(X + CRATE_DIM,Y - CRATE_DIM,Z + CRATE_DIM);
		glTexCoord2f(0.0f,0.0f);
		glVertex3f(X + CRATE_DIM,Y - CRATE_DIM,Z - CRATE_DIM);
		glTexCoord2f(1.0f,0.0f);
		glVertex3f(X + CRATE_DIM,Y + CRATE_DIM,Z - CRATE_DIM);

		glColor3f(0.8f,0.8f,0.8f);
		glTexCoord2f(1.0f,1.0f);
		glVertex3f(X + CRATE_DIM,Y + CRATE_DIM,Z + CRATE_DIM);
		glTexCoord2f(1.0f,0.0f);
		glVertex3f(X + CRATE_DIM,Y + CRATE_DIM,Z - CRATE_DIM);
		glTexCoord2f(0.0f,0.0f);
		glVertex3f(X - CRATE_DIM,Y + CRATE_DIM,Z - CRATE_DIM);
		glTexCoord2f(0.0f,1.0f);
		glVertex3f(X - CRATE_DIM,Y + CRATE_DIM,Z + CRATE_DIM);
	}

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
	glEnable(GL_DEPTH_TEST);
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
		glDisable(GL_BLEND);
		glTexEnvi(GL_TEXTURE_ENV,GL_TEXTURE_ENV_MODE,GL_MODULATE);
		glCallList(DISPLAY_LIST_WORLD);
	}

	drawBoundingBox(*particleSystem);

	if (enableBoxDrawing)
	{
		for (int i = 0; i < NB_CRATES + 1; ++i)
			drawBox(boxes[i]->getPosition() - boxes[i]->getDimension() * 0.5f,boxes[i]->getPosition() + boxes[i]->getDimension() * 0.5f,0.0f,0.0f,1.0f);
		for (int i = NB_CRATES + 1; i < NB_CRATES + 3; ++i)
			drawBox(boxes[i]->getPosition() - boxes[i]->getDimension() * 0.5f,boxes[i]->getPosition() + boxes[i]->getDimension() * 0.5f,0.0f,1.0f,0.0f);
	}

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
			fontPtr->Render(strNbParticles.c_str(),-1,FTPoint(4.0f,40.0f));
		fontPtr->Render(strFps.c_str(),-1,FTPoint(4.0f,8.0f));
	}

	SDL_GL_SwapBuffers();
}

// This call back will assign a color to a particle (either red,green,blue or yellow)
void assignColor(Particle& particle)
{
	int color = random(0,4);
	switch(color)
	{
	case 0 : // RED
		particle.setParamCurrentValue(PARAM_RED,0.8f);
		particle.setParamCurrentValue(PARAM_GREEN,0.0f);
		particle.setParamCurrentValue(PARAM_BLUE,0.0f);
		break;
	case 1 : // GREEN
		particle.setParamCurrentValue(PARAM_RED,0.0f);
		particle.setParamCurrentValue(PARAM_GREEN,0.8f);
		particle.setParamCurrentValue(PARAM_BLUE,0.0f);
		break;
	case 2 : // BLUE
		particle.setParamCurrentValue(PARAM_RED,0.0f);
		particle.setParamCurrentValue(PARAM_GREEN,0.0f);
		particle.setParamCurrentValue(PARAM_BLUE,0.8f);
		break;
	default : // YELLOW
		particle.setParamCurrentValue(PARAM_RED,0.8f);
		particle.setParamCurrentValue(PARAM_GREEN,0.8f);
		particle.setParamCurrentValue(PARAM_BLUE,0.0f);
		break;
	}
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
	SDL_WM_SetCaption("SPARK Collision Demo",NULL);
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
	
	glClearColor(0.0f,0.0f,0.0f,1.0f);
	glViewport(0,0,screen.w,screen.h);

	// Loads texture font
	FTGLTextureFont font = FTGLTextureFont("res/font.ttf");
	if(font.Error())
		return 1;
	font.FaceSize(24);
	fontPtr = &font;

	// Loads crate texture
	if (!loadTexture(textureCrate,"res/crate.bmp",GL_RGB,GL_REPEAT,true))
		return 1;

	// Loads floor texture
	if (!loadTexture(textureFloor,"res/floor.bmp",GL_RGB,GL_REPEAT,true))
		return 1;

	// Loads wall texture
	if (!loadTexture(textureWall,"res/wall.bmp",GL_RGB,GL_REPEAT,true))
		return 1;

	// Creates display lists
	createDisplayLists();

	// Inits Particle Engine
	Vector3D gravity(0.0f,-0.8f,0.0f);

	// Renderer
	GLPointRenderer* basicRenderer = GLPointRenderer::create();

	GLRenderer* particleRenderer = NULL;
	if (!loadTexture(textureParticle,"res/ball2.bmp",GL_RGBA,GL_CLAMP,false))
			return 1;

	// We use pointSprites only if it is available and if the GL extension point parameter is available
	if (GLPointRenderer::loadGLExtPointSprite() && GLPointRenderer::loadGLExtPointParameter())
	{
		GLPointRenderer* pointRenderer = GLPointRenderer::create();
		pointRenderer->setType(POINT_SPRITE);
		pointRenderer->setTexture(textureParticle);
		pointRenderer->enableWorldSize(true);
		GLPointRenderer::setPixelPerUnit(45.0f * PI / 180.f,screenHeight);
		pointRenderer->setSize(0.05f);
		particleRenderer = pointRenderer;
	}
	else // we use quads
	{
		GLQuadRenderer* quadRenderer = GLQuadRenderer::create();
		quadRenderer->setTexturingMode(TEXTURE_2D);
		quadRenderer->setTexture(textureParticle);
		quadRenderer->setScale(0.05f,0.05f);
		particleRenderer = quadRenderer;
	}

	particleRenderer->setBlending(BLENDING_NONE);
	particleRenderer->enableRenderingHint(ALPHA_TEST,true);
	particleRenderer->setAlphaTestThreshold(0.8f);

	// Model
	Model* particleModel = Model::create(FLAG_RED | FLAG_GREEN | FLAG_BLUE);
	particleModel->setLifeTime(10.0f,10.0f);

	// Emitter
	SphericEmitter* particleEmitter = SphericEmitter::create(Vector3D(0.0f,0.0f,-1.0f),0.0f * PI,0.5f * PI);
	particleEmitter->setZone(Point::create(Vector3D(0.0f,2.0f,4.475f)));
	particleEmitter->setFlow(300);
	particleEmitter->setForce(1.5f,2.5f);

	// Obstacles
	Obstacle* obstacles[1 + NB_CRATES];

	// the room
	boxes[0] = AABox::create();
	boxes[0]->setPosition(Vector3D(0.0f,ROOM_Y * 0.5f,0.0f));
	boxes[0]->setDimension(Vector3D(ROOM_X - 0.05f,ROOM_Y - 0.05f,ROOM_Z - 0.05f));
	
	obstacles[0] = Obstacle::create();
	obstacles[0]->setZone(boxes[0]);
	obstacles[0]->setBouncingRatio(0.8f);
	obstacles[0]->setFriction(0.95f);

	for (int i = 1; i < 1 + NB_CRATES; ++i)
	{
		boxes[i] = AABox::create();
		boxes[i]->setPosition(CRATE_POSITIONS[i - 1]);
		boxes[i]->setDimension(Vector3D(CRATE_DIM2 + 0.05f,CRATE_DIM2 + 0.05f,CRATE_DIM2 + 0.05f));
		
		obstacles[i] = Obstacle::create();
		obstacles[i]->setZone(boxes[i]);
		obstacles[i]->setBouncingRatio(0.8f);
		obstacles[i]->setFriction(0.95f);
	}

	for (int i = 0; i < NB_CRATES - 1; ++i)
	{
		if (CRATE_POSITIONS[i].x < vMin0.x)
			vMin0.x = CRATE_POSITIONS[i].x;
		if (CRATE_POSITIONS[i].x > vMax0.x)
			vMax0.x = CRATE_POSITIONS[i].x;

		if (CRATE_POSITIONS[i].y < vMin0.y)
			vMin0.y = CRATE_POSITIONS[i].y;
		if (CRATE_POSITIONS[i].y > vMax0.y)
			vMax0.y = CRATE_POSITIONS[i].y;

		if (CRATE_POSITIONS[i].z < vMin0.z)
			vMin0.z = CRATE_POSITIONS[i].z;
		if (CRATE_POSITIONS[i].z > vMax0.z)
			vMax0.z = CRATE_POSITIONS[i].z;
	}

	vMin1.x = min(vMin0.x,CRATE_POSITIONS[NB_CRATES - 1].x);
	vMax1.x = max(vMax0.x,CRATE_POSITIONS[NB_CRATES - 1].x);

	vMin1.y = min(vMin0.y,CRATE_POSITIONS[NB_CRATES - 1].y);
	vMax1.y = max(vMax0.y,CRATE_POSITIONS[NB_CRATES - 1].y);

	vMin1.z = min(vMin0.z,CRATE_POSITIONS[NB_CRATES - 1].z);
	vMax1.z = max(vMax0.z,CRATE_POSITIONS[NB_CRATES - 1].z);

	// partition zones
	boxes[NB_CRATES + 1] = AABox::create();
	boxes[NB_CRATES + 1]->setPosition(Vector3D((vMin0 + vMax0) / 2.0f));
	boxes[NB_CRATES + 1]->setDimension(Vector3D(vMax0 - vMin0 + CRATE_DIM2 + 0.05f));
	ModifierGroup* partition0 = ModifierGroup::create(boxes[NB_CRATES + 1],INSIDE_ZONE);

	boxes[NB_CRATES + 2] = AABox::create();
	boxes[NB_CRATES + 2]->setPosition(Vector3D((vMin1 + vMax1) / 2.0f));
	boxes[NB_CRATES + 2]->setDimension(Vector3D(vMax1 - vMin1 + CRATE_DIM2 + 0.05f));
	ModifierGroup* partition1 = ModifierGroup::create(boxes[NB_CRATES + 2],INSIDE_ZONE);

	partition0->addModifier(obstacles[1]);
	partition0->addModifier(obstacles[2]);
	partition0->addModifier(obstacles[3]);
	partition0->addModifier(obstacles[4]);

	partition1->addModifier(partition0);
	partition1->addModifier(obstacles[NB_CRATES]);

	// Group
	Group* particleGroup = Group::create(particleModel,3100);
	particleGroup->addEmitter(particleEmitter);
	particleGroup->setRenderer(particleRenderer);
	particleGroup->setCustomBirth(&assignColor);
	particleGroup->setGravity(gravity);
	particleGroup->setFriction(0.2f);

	particleGroup->addModifier(obstacles[0]);
	particleGroup->addModifier(partition1);
	
	particleSystem = System::create();
	particleSystem->addGroup(particleGroup);
	
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
				renderEnv = !renderEnv;

			// if F6 is pressed, boxes are drawn or not
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_F6))
				enableBoxDrawing = !enableBoxDrawing;

			// if pause is pressed, the system is paused
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_PAUSE))
				paused = !paused;

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
					camPosZ = max(0.5f,camPosZ - 0.5f);
			}
		}

		if (!paused)
		{
			// Updates particle system
			particleSystem->update(deltaTime * 0.001f); // 1 defined as a second
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