/*
* Copyright (c) 2006-2007 Erin Catto http://www.gphysics.com
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/

#include "Render.h"
#include "Test.h"
#include "glui/GL/glui.h"

#include <cstdio>

namespace
{
	int32 testIndex = 0;
	int32 testSelection = 0;
	int32 testCount = 0;
	TestEntry* entry;
	Test* test;
	Settings settings;
	int32 width = 640;
	int32 height = 480;
	int32 framePeriod = 16;
	int32 mainWindow;
	float settingsHz = 60.0;
	GLUI *glui;
	float32 viewZoom = 1.0f;
	b2Vec2 viewCenter(0.0f, 20.0f);
	int tx, ty, tw, th;
	bool rMouseDown;
	b2Vec2 lastp;
}

void Resize(int32 w, int32 h)
{
	width = w;
	height = h;

	GLUI_Master.get_viewport_area(&tx, &ty, &tw, &th);
	glViewport(tx, ty, tw, th);

	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	float32 ratio = float32(tw) / float32(th);

	b2Vec2 extents(ratio * 25.0f, 25.0f);
	extents *= viewZoom;

	b2Vec2 lower = viewCenter - extents;
	b2Vec2 upper = viewCenter + extents;

	// L/R/B/T
	gluOrtho2D(lower.x, upper.x, lower.y, upper.y);
}

b2Vec2 ConvertScreenToWorld(int32 x, int32 y)
{
	float32 u = x / float32(tw);
	float32 v = (th - y) / float32(th);

	float32 ratio = float32(tw) / float32(th);
	b2Vec2 extents(ratio * 25.0f, 25.0f);
	extents *= viewZoom;

	b2Vec2 lower = viewCenter - extents;
	b2Vec2 upper = viewCenter + extents;

	b2Vec2 p;
	p.x = (1.0f - u) * lower.x + u * upper.x;
	p.y = (1.0f - v) * lower.y + v * upper.y;
	return p;
}

// This is used to control the frame rate (60Hz).
void Timer(int)
{
	glutSetWindow(mainWindow);
	glutPostRedisplay();
	glutTimerFunc(framePeriod, Timer, 0);
}

void SimulationLoop()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();

	test->SetTextLine(30);
	settings.hz = settingsHz;
	test->Step(&settings);

	test->DrawTitle(5, 15, entry->name);

	glutSwapBuffers();

	if (testSelection != testIndex)
	{
		testIndex = testSelection;
		delete test;
		entry = g_testEntries + testIndex;
		test = entry->createFcn();
		viewZoom = 1.0f;
		viewCenter.Set(0.0f, 20.0f);
		Resize(width, height);
	}
}

void Keyboard(unsigned char key, int x, int y)
{
	B2_NOT_USED(x);
	B2_NOT_USED(y);

	switch (key)
	{
	case 27:
		exit(0);
		break;

		// Press 'z' to zoom out.
	case 'z':
		viewZoom = b2Min(1.1f * viewZoom, 20.0f);
		Resize(width, height);
		break;

		// Press 'x' to zoom in.
	case 'x':
		viewZoom = b2Max(0.9f * viewZoom, 0.02f);
		Resize(width, height);
		break;

		// Press 'r' to reset.
	case 'r':
		delete test;
		test = entry->createFcn();
		break;

		// Press space to launch a bomb.
	case ' ':
		if (test)
		{
			test->LaunchBomb();
		}
		break;
 
	case 'p':
		settings.pause = !settings.pause;
		break;

		// Press [ to prev test.
	case '[':
		--testSelection;
		if (testSelection < 0)
		{
			testSelection = testCount - 1;
		}
		glui->sync_live();
		break;

		// Press ] to next test.
	case ']':
		++testSelection;
		if (testSelection == testCount)
		{
			testSelection = 0;
		}
		glui->sync_live();
		break;
		
	default:
		if (test)
		{
			test->Keyboard(key);
		}
	}
}

void KeyboardSpecial(int key, int x, int y)
{
	B2_NOT_USED(x);
	B2_NOT_USED(y);

	switch (key)
	{
	case GLUT_ACTIVE_SHIFT:
		// Press left to pan left.
	case GLUT_KEY_LEFT:
		viewCenter.x -= 0.5f;
		Resize(width, height);
		break;

		// Press right to pan right.
	case GLUT_KEY_RIGHT:
		viewCenter.x += 0.5f;
		Resize(width, height);
		break;

		// Press down to pan down.
	case GLUT_KEY_DOWN:
		viewCenter.y -= 0.5f;
		Resize(width, height);
		break;

		// Press up to pan up.
	case GLUT_KEY_UP:
		viewCenter.y += 0.5f;
		Resize(width, height);
		break;

		// Press home to reset the view.
	case GLUT_KEY_HOME:
		viewZoom = 1.0f;
		viewCenter.Set(0.0f, 20.0f);
		Resize(width, height);
		break;
	}
}

void Mouse(int32 button, int32 state, int32 x, int32 y)
{
	// Use the mouse to move things around.
	if (button == GLUT_LEFT_BUTTON)
	{
		int mod = glutGetModifiers();
		b2Vec2 p = ConvertScreenToWorld(x, y);
		if (state == GLUT_DOWN)
		{
			b2Vec2 p = ConvertScreenToWorld(x, y);
			if (mod == GLUT_ACTIVE_SHIFT)
			{
				test->ShiftMouseDown(p);
			}
			else
			{
				test->MouseDown(p);
			}
		}
		
		if (state == GLUT_UP)
		{
			test->MouseUp(p);
		}
	}
	else if (button == GLUT_RIGHT_BUTTON)
	{
		if (state == GLUT_DOWN)
		{	
			lastp = ConvertScreenToWorld(x, y);
			rMouseDown = true;
		}

		if (state == GLUT_UP)
		{
			rMouseDown = false;
		}
	}
}

void MouseMotion(int32 x, int32 y)
{
	b2Vec2 p = ConvertScreenToWorld(x, y);
	test->MouseMove(p);
	
	if (rMouseDown)
	{
		b2Vec2 diff = p - lastp;
		viewCenter.x -= diff.x;
		viewCenter.y -= diff.y;
		Resize(width, height);
		lastp = ConvertScreenToWorld(x, y);
	}
}

void MouseWheel(int wheel, int direction, int x, int y)
{
	B2_NOT_USED(wheel);
	B2_NOT_USED(x);
	B2_NOT_USED(y);
	if (direction > 0)
	{
		viewZoom /= 1.1f;
	}
	else
	{
		viewZoom *= 1.1f;
	}
	Resize(width, height);
}

void Restart(int)
{
	delete test;
	entry = g_testEntries + testIndex;
	test = entry->createFcn();
    Resize(width, height);
}

void Pause(int)
{
	settings.pause = !settings.pause;
}

void SingleStep(int)
{
	settings.pause = 1;
	settings.singleStep = 1;
}

int main(int argc, char** argv)
{
	testCount = 0;
	while (g_testEntries[testCount].createFcn != NULL)
	{
		++testCount;
	}

	testIndex = b2Clamp(testIndex, 0, testCount-1);
	testSelection = testIndex;

	entry = g_testEntries + testIndex;
	test = entry->createFcn();

	glutInit(&argc, argv);
	glutInitDisplayMode(GLUT_RGBA | GLUT_DOUBLE);
	glutInitWindowSize(width, height);
	char title[32];
	sprintf(title, "Box2D Version %d.%d.%d", b2_version.major, b2_version.minor, b2_version.revision);
	mainWindow = glutCreateWindow(title);
	//glutSetOption (GLUT_ACTION_ON_WINDOW_CLOSE, GLUT_ACTION_GLUTMAINLOOP_RETURNS);

	glutDisplayFunc(SimulationLoop);
	GLUI_Master.set_glutReshapeFunc(Resize);  
	GLUI_Master.set_glutKeyboardFunc(Keyboard);
	GLUI_Master.set_glutSpecialFunc(KeyboardSpecial);
	GLUI_Master.set_glutMouseFunc(Mouse);
#ifdef FREEGLUT
	glutMouseWheelFunc(MouseWheel);
#endif
	glutMotionFunc(MouseMotion);

	glui = GLUI_Master.create_glui_subwindow( mainWindow, 
		GLUI_SUBWINDOW_RIGHT );

	glui->add_statictext("Tests");
	GLUI_Listbox* testList =
		glui->add_listbox("", &testSelection);

	glui->add_separator();

	GLUI_Spinner* velocityIterationSpinner =
		glui->add_spinner("Vel Iters", GLUI_SPINNER_INT, &settings.velocityIterations);
	velocityIterationSpinner->set_int_limits(1, 500);

	GLUI_Spinner* positionIterationSpinner =
		glui->add_spinner("Pos Iters", GLUI_SPINNER_INT, &settings.positionIterations);
	positionIterationSpinner->set_int_limits(0, 100);

	GLUI_Spinner* hertzSpinner =
		glui->add_spinner("Hertz", GLUI_SPINNER_FLOAT, &settingsHz);

	hertzSpinner->set_float_limits(5.0f, 200.0f);

	glui->add_checkbox("Warm Starting", &settings.enableWarmStarting);
	glui->add_checkbox("Time of Impact", &settings.enableContinuous);

	//glui->add_separator();

	GLUI_Panel* drawPanel =	glui->add_panel("Draw");
	glui->add_checkbox_to_panel(drawPanel, "Shapes", &settings.drawShapes);
	glui->add_checkbox_to_panel(drawPanel, "Joints", &settings.drawJoints);
	glui->add_checkbox_to_panel(drawPanel, "AABBs", &settings.drawAABBs);
	glui->add_checkbox_to_panel(drawPanel, "Pairs", &settings.drawPairs);
	glui->add_checkbox_to_panel(drawPanel, "Contact Points", &settings.drawContactPoints);
	glui->add_checkbox_to_panel(drawPanel, "Contact Normals", &settings.drawContactNormals);
	glui->add_checkbox_to_panel(drawPanel, "Contact Forces", &settings.drawContactForces);
	glui->add_checkbox_to_panel(drawPanel, "Friction Forces", &settings.drawFrictionForces);
	glui->add_checkbox_to_panel(drawPanel, "Center of Masses", &settings.drawCOMs);
	glui->add_checkbox_to_panel(drawPanel, "Statistics", &settings.drawStats);

	int32 testCount = 0;
	TestEntry* e = g_testEntries;
	while (e->createFcn)
	{
		testList->add_item(testCount, e->name);
		++testCount;
		++e;
	}

	glui->add_button("Pause", 0, Pause);
	glui->add_button("Single Step", 0, SingleStep);
	glui->add_button("Restart", 0, Restart);

	glui->add_button("Quit", 0,(GLUI_Update_CB)exit);
	glui->set_main_gfx_window( mainWindow );

	// Use a timer to control the frame rate.
	glutTimerFunc(framePeriod, Timer, 0);

	glutMainLoop();

	return 0;
}







