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

// external libs
#include <SDL.h>
#include <FTGL/ftgl.h>

// SPARK lib
#include <SPK.h>
#include <SPK_GL.h>

using namespace std;
using namespace SPK;
using namespace SPK::GL;

float angleY = 0.0f;
float angleX = 45.0f;
float camPosZ = 10.0f;

int deltaTime = 0;

Group* particleGroup = NULL;
Group* massGroup = NULL;
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

const size_t NB_SEGMENTS = 32;

// Converts an int into a string
string int2Str(int a)
{
    ostringstream stm;
    stm << a;
    return stm.str();
}

// Converts a HSV color to RGB
// h E [0,360]
// s E [0,1]
// v E [0,1]
Vector3D convertHSV2RGB(const Vector3D& hsv)
{
	float h = hsv.x;
	float s = hsv.y;
	float v = hsv.z;

	int hi = static_cast<int>(h / 60.0f) % 6;
	float f = h / 60.0f - hi;
	float p = v * (1.0f - s);
	float q = v * (1.0f - f * s);
	float t = v * (1.0f - (1.0f - f) * s);

	switch(hi)
	{
	case 0 : return Vector3D(v,t,p);
	case 1 : return Vector3D(q,v,p);
	case 2 : return Vector3D(p,v,t);
	case 3 : return Vector3D(p,q,v);
	case 4 : return Vector3D(t,p,v);
	default : return Vector3D(v,p,q);
	}
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
	glDepthMask(GL_TRUE);
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

	glDisable(GL_BLEND);
	drawBoundingBox(*particleGroup);
	drawBoundingBox(*massGroup);

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
	SDL_WM_SetCaption("SPARK Gravitation Demo",NULL);
	SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER,1);	// double buffering

	// AA
	SDL_GL_SetAttribute(SDL_GL_MULTISAMPLEBUFFERS,1);
	SDL_GL_SetAttribute(SDL_GL_MULTISAMPLESAMPLES,4);
	
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

	// Loads particle texture
	GLuint textureParticle;
	if (!loadTexture(textureParticle,"res/point.bmp",GL_ALPHA,GL_CLAMP,false))
		return 1;

	// Inits Particle Engine
	// Renderers
	GLPointRenderer* basicRenderer = GLPointRenderer::create();

	GLLineTrailRenderer* trailRenderer = GLLineTrailRenderer::create();
	trailRenderer->setBlending(BLENDING_ADD);
	trailRenderer->setDuration(2.0);
	trailRenderer->setNbSamples(NB_SEGMENTS);
	trailRenderer->enableRenderingHint(DEPTH_TEST,false);

	// Models
	Model* massModel = Model::create();
	massModel->setImmortal(true);

	Model* particleModel = Model::create(FLAG_RED | FLAG_GREEN | FLAG_BLUE | FLAG_ALPHA,
		FLAG_ALPHA,
		FLAG_RED | FLAG_GREEN | FLAG_BLUE);
	particleModel->setParam(PARAM_ALPHA,0.1f,0.0f);
	particleModel->setLifeTime(5.0f,8.0f);

	// Emitter
	RandomEmitter* particleEmitter = RandomEmitter::create();
	particleEmitter->setFlow(400);
	particleEmitter->setForce(0.0f,0.1f);

	// the number of point masses
	const unsigned int NB_POINT_MASS = 2;	

	// This is the point mass that will attract the other point masses to make them move
	PointMass* centerPointMass = PointMass::create();
	centerPointMass->setMass(0.6f);
	centerPointMass->setMinDistance(0.01f);

	// Groups
	particleGroup = Group::create(particleModel,4100);
	particleGroup->addEmitter(particleEmitter);
	particleGroup->setRenderer(trailRenderer);

	massGroup = Group::create(massModel,NB_POINT_MASS);
	massGroup->addModifier(centerPointMass);
	massGroup->setRenderer(NULL);

	// Creates the point masses that will atract the particles
	PointMass* pointMasses[NB_POINT_MASS];
	for (int i = 0; i < NB_POINT_MASS; ++i)
	{
		pointMasses[i] = PointMass::create();
		pointMasses[i]->setMass(3.0f);
		pointMasses[i]->setMinDistance(0.05f);
		particleGroup->addModifier(pointMasses[i]);
	}

	// System
	particleSystem = System::create();
	particleSystem->addGroup(massGroup);
	particleSystem->addGroup(particleGroup);
	
	bool exit = false;
	bool paused = false;

	// renderValue :
	// 0 : normal
	// 1 : basic render
	// 2 : no render
	unsigned int renderValue = 0;

	float step = 0.0f;

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
				massGroup->enableAABBComputing(!massGroup->isAABBComputingEnabled());

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
					particleGroup->setRenderer(trailRenderer);
					if (!paused)
						trailRenderer->init(*particleGroup);
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

			// Moves the camera with the mouse
			if (event.type == SDL_MOUSEMOTION)
			{
				angleY += event.motion.xrel * 0.05f;
				angleX += event.motion.yrel * 0.05f;
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
			// Changes the color of the model over time
			step += deltaTime * 0.0002f;
			Vector3D color(0.6f + 0.4f * sin(step),0.6f + 0.4f * sin(step + PI * 2.0f / 3.0f),0.6f + 0.4f * sin(step + PI * 4.0f / 3.0f));
			particleModel->setParam(PARAM_RED,max(0.0f,color.x - 0.25f),min(1.0f,color.x + 0.25f));
			particleModel->setParam(PARAM_GREEN,max(0.0f,color.y - 0.25f),min(1.0f,color.y + 0.25f));
			particleModel->setParam(PARAM_BLUE,max(0.0f,color.z - 0.25f),min(1.0f,color.z + 0.25f));

			// If the number of particles in the mass group is 0 (at init or when the system is reinitialized),
			// a number of particles equal to NB_POINT_MASS is added
			if (massGroup->getNbParticles() == 0)
			{
				for (int i = 0; i < NB_POINT_MASS; ++i)
					massGroup->addParticles(1,
						Vector3D(2.0f,0.0f,0.0f),
						Vector3D(random(-1.0f,0.0f),random(-0.5f,0.5f),random(-0.5f,0.5f)));
				massGroup->flushAddedParticles(); // to ensure particles are added
			}

			// Updates particle system
			particleSystem->update(deltaTime * 0.001f); // 1 defined as a second
	
			// the point masses are attached one by one to the particles in the massGroup so that they follow their moves
			for (int i = 0; i < NB_POINT_MASS; ++i)
				pointMasses[i]->setPosition(massGroup->getParticle(i).position());
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