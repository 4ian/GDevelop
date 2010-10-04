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

float angleX = 0.0f;
float angleZ = 0.0f;
const float CAM_POS_Z = 2.75f;

int deltaTime = 0;

Group* particleGroup = NULL;
System* particleSystem = NULL;

FTGLTextureFont* fontPtr;

const float PI = 3.14159265358979323846f;

const string STR_NB_PARTICLES = "NB PARTICLES : ";
const string STR_FPS = "FPS : ";

string strNbParticles = STR_NB_PARTICLES;
string strFps = STR_FPS;

int screenWidth;
int screenHeight;
float screenRatio;

int drawText = 2;

const unsigned int NB_PARTICLES_SIZE = 6;
const unsigned int NB_PARTICLES[NB_PARTICLES_SIZE] =
{
	10000,
	25000,
	50000,
	100000,
	200000,
	500000,
};

unsigned int nbParticlesIndex = 2;

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

	glTranslatef(0.0f,0.0f,-CAM_POS_Z);
	glRotatef(angleX,1.0f,0.0f,0.0f);
	glRotatef(angleZ,0.0f,0.0f,1.0f);

	glDisable(GL_BLEND);
	drawBoundingBox(*particleGroup);

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

// Main function
int main(int argc, char *argv[])
{
	// random seed
	randomSeed = static_cast<unsigned int>(time(NULL));
	
	// Sets the update step
	System::setClampStep(true,0.01f);			// clamp the step to 10 ms
	System::useRealStep();

	SDL_Event event;

	// inits SDL
	SDL_Init(SDL_INIT_VIDEO);
	SDL_WM_SetCaption("SPARK Flakes Demo",NULL);
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

	// Inits Particle Engine
	// Renderers
	GLPointRenderer* basicRenderer = GLPointRenderer::create();

	GLPointRenderer* particleRenderer = GLPointRenderer::create(1.0f);
	particleRenderer->setBlending(BLENDING_ADD);
	particleRenderer->enableRenderingHint(DEPTH_TEST,false);

	// Model
	Model* particleModel = Model::create(FLAG_RED | FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA);
	particleModel->setParam(PARAM_RED,1.0f);
	particleModel->setParam(PARAM_GREEN,0.8f);
	particleModel->setParam(PARAM_BLUE,0.3f);
	particleModel->setParam(PARAM_ALPHA,0.4f);
	particleModel->setImmortal(true);

	// Zone
	Sphere* sphere = Sphere::create(Vector3D(),1.0f);

	// Obstacle
	Obstacle* obstacle = Obstacle::create(sphere);
	obstacle->setFriction(0.9f);
	obstacle->setBouncingRatio(0.9f);

	// Group
	Vector3D gravity(0.0f,-0.5f,0.0f);
	particleGroup = Group::create(particleModel,NB_PARTICLES[NB_PARTICLES_SIZE - 1]);
	particleGroup->setRenderer(particleRenderer);
	particleGroup->setGravity(gravity);
	particleGroup->addModifier(obstacle);
	particleGroup->setFriction(0.2f);
	
	particleSystem = System::create();
	particleSystem->addGroup(particleGroup);

	// Particles are added to the group
	particleGroup->addParticles(NB_PARTICLES[nbParticlesIndex],sphere,Vector3D());
	particleGroup->flushAddedParticles();
	
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

			// if pause is pressed, the system is paused
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_PAUSE))
				paused = !paused;

			if (!paused)
			{
				// if + is pressed, some particles are added
				if ((event.type == SDL_KEYDOWN)&&((event.key.keysym.sym == SDLK_PLUS)||(event.key.keysym.sym == SDLK_KP_PLUS)))
				{
					if (nbParticlesIndex < NB_PARTICLES_SIZE - 1)
					{
						++nbParticlesIndex;
						particleGroup->addParticles(NB_PARTICLES[nbParticlesIndex] - NB_PARTICLES[nbParticlesIndex - 1],sphere,Vector3D());
					}
				}

				// if - is pressed, some particles are removed
				if ((event.type == SDL_KEYDOWN)&&((event.key.keysym.sym == SDLK_MINUS)||(event.key.keysym.sym == SDLK_KP_MINUS)))
				{
					if (nbParticlesIndex > 0)
					{
						--nbParticlesIndex;
						for (unsigned int i = 0; i < NB_PARTICLES[nbParticlesIndex + 1] - NB_PARTICLES[nbParticlesIndex]; ++i)
							particleGroup->getParticle(i).kill();
					}
				}
			}

			// if space is pressed
			if ((event.type == SDL_KEYDOWN)&&(event.key.keysym.sym == SDLK_SPACE))
				for (size_t i = 0; i < particleGroup->getNbParticles(); ++i)
					particleGroup->getParticle(i).velocity() = Vector3D(random(-0.5f,0.5f),random(-0.5f,0.5f),random(-0.5f,0.5f));

			// Moves the camera with the mouse
			if (event.type == SDL_MOUSEMOTION)
			{
				angleZ += event.motion.xrel * 0.05f;
				angleX += event.motion.yrel * 0.05f;
			}
		}

		if (!paused)
		{
			// Updates particle system
			particleSystem->update(deltaTime * 0.001f);	// 1 defined as a second

			// sets the gravity so that it is always down the screen
			float cosX = cos(angleX * PI / 180.0f);
			float sinX = sin(angleX * PI / 180.0f);
			float cosZ = cos(angleZ * PI / 180.0f);
			float sinZ = sin(angleZ * PI / 180.0f);
			particleGroup->setGravity(Vector3D(-0.5f * sinZ * cosX,-0.5f * cosZ * cosX,0.5f * sinX));

			// if the particles were deleted, we refill the system
			if (particleSystem->getNbParticles() == 0)
				particleGroup->addParticles(NB_PARTICLES[nbParticlesIndex],sphere,Vector3D());
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