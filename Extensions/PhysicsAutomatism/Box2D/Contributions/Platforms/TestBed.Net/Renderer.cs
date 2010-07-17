using System;
using System.Collections.Generic;
using System.Text;
using Tao.OpenGl;
using Box2D.Net;
using System.Windows.Forms;

namespace TestBed.Net
{
    static class Renderer
    {
        public static void InitOpenGL(System.Drawing.Size WidthHeight, float viewZoom, Vector ViewOffset)
        {
            int Width = WidthHeight.Width;
            int Height = WidthHeight.Height;
            Height = Height > 0 ? Height : 1;

            Gl.glDisable(Gl.GL_CULL_FACE);
            Gl.glClearColor(.5f, .5f, .5f, 1);

            float AspectRatio = (float)Width / (float)Height;
            Gl.glViewport(0, 0, Width, Height);
            Gl.glMatrixMode(Gl.GL_PROJECTION);
            
            Gl.glLoadIdentity();
            Glu.gluOrtho2D(-AspectRatio, AspectRatio, -1, 1);
            
            Gl.glMatrixMode(Gl.GL_MODELVIEW);            
        }

        public static void OpenGLDraw(Test test)
        {
            Gl.glClear(Gl.GL_COLOR_BUFFER_BIT);
            Gl.glMatrixMode(Gl.GL_MODELVIEW);
            Gl.glLoadIdentity();
            
            Gl.glScalef(1.0f / test.Zoom, 1.0f / test.Zoom, 1.0f / test.Zoom);
            Gl.glTranslatef(-test.ViewOffset.X, -test.ViewOffset.Y, 0);
            Gl.glPushMatrix();

            DrawBodies(test.world.Bodies);
            DrawJoints(test.world.Joints);

            Gl.glPopMatrix();
        }

        public static void DrawJoints(IList<Joint> joints)
        {
            foreach (Joint joint in joints)
            {
                DrawJoint(joint, System.Drawing.Color.LawnGreen);
            }
        }

        public static void DrawBodies(IList<Body> bodies)
        {
            foreach(Body body in bodies)
                foreach (Shape shape in body.Shapes)
                {
                    System.Drawing.Color color = System.Drawing.Color.White;
                    if (body.Static)
                        color = System.Drawing.Color.LightGreen; //Color(0.5f, 0.9f, 0.5f)
                    else if (body.Sleeping)
                        color = System.Drawing.Color.LightBlue;
                    //else if(body == bomb)

                    DrawShape(body.GetXForm(), shape, System.Drawing.Color.White);
                }
        }

        public static void DrawShape(XForm xform, Shape shape, System.Drawing.Color c)
        {
	        switch (shape.ShapeType)
	        {
	            case ShapeType.e_circleShape:
		        {
                    Vector x = xform.Position;
                    float r = (new CircleShape(shape)).Radius;

                    float segments = 16;
                    double increment = 2 * Math.PI / segments;

			        Gl.glColor3ub(c.R, c.G, c.B);
			        Gl.glBegin(Gl.GL_LINE_LOOP);
			        
                    for (double i = 0, theta = 0; i < segments; ++i, theta += increment)
			        {
                        Vector d = new Vector(r * (float)Math.Cos(theta), r * (float)Math.Sin(theta));
				        Vector v = x + d;
                        Gl.glVertex2f(v.X, v.Y);
			        }
                    Gl.glEnd();

                    //Draw a line from the circle's center to it's right side
                    //so we can visually inspect rotations.
                    Gl.glBegin(Gl.GL_LINES);
                    Gl.glVertex2f(x.X, x.Y);
                    Vector ax = xform.Rotation.col1;
                    Gl.glVertex2f(x.X + r * ax.X, x.Y + r * ax.Y);
                    Gl.glEnd();
		        }
		        break;

                case ShapeType.e_polygonShape:
		        {
                    Gl.glColor3ub(c.R, c.G, c.B);
                    Gl.glBegin(Gl.GL_LINE_LOOP);

                    foreach (Vector vertex in (new PolyShape(shape)).Vertices)
                    {
                        Vector vertprime = xform.Rotation * vertex + xform.Position;
                        Gl.glVertex2f(vertprime.X, vertprime.Y);
                    }

			        Gl.glEnd();
		        }
		        break;
	        }
        }

        public static void DrawAABB(AABB aabb, System.Drawing.Color c)
        {
            Gl.glColor3b(c.R, c.G, c.B);
	        Gl.glBegin(Gl.GL_LINE_LOOP);
            Gl.glVertex2f(aabb.lowerBound.X, aabb.lowerBound.Y);
            Gl.glVertex2f(aabb.upperBound.X, aabb.lowerBound.Y);
            Gl.glVertex2f(aabb.upperBound.X, aabb.upperBound.Y);
            Gl.glVertex2f(aabb.lowerBound.X, aabb.upperBound.Y);
	        Gl.glEnd();
        }

        public static void DrawJoint(Joint joint, System.Drawing.Color color)
        {
            Body b1 = joint.Body1;
            Body b2 = joint.Body2;
            Vector x1 = b1.GetXForm().Position;
            Vector x2 = b2.GetXForm().Position;
            Vector p1 = joint.Anchor2;
            Vector p2 = joint.Anchor1;

            Gl.glColor3ub(color.R, color.G, color.B);
            Gl.glBegin(Gl.GL_LINES);

            switch (joint.JointType)
            {
                case JointType.e_mouseJoint:
                case JointType.e_distanceJoint:
                    Gl.glVertex2f(p1.X, p1.Y);
                    Gl.glVertex2f(p2.X, p2.Y);
                    break;

                /*
                 * case JointType.e_pulleyJoint:
                    {
                        b2PulleyJoint* pulley = (b2PulleyJoint*)joint;
                        b2Vec2 s1 = pulley->GetGroundPoint1();
                        b2Vec2 s2 = pulley->GetGroundPoint2();
                        glVertex2f(s1.x, s1.y);
                        glVertex2f(p1.x, p1.y);
                        glVertex2f(s2.x, s2.y);
                        glVertex2f(p2.x, p2.y);
                    }
                    break;
                */
                default:
                    Gl.glVertex2f(x1.X, x1.Y);
                    Gl.glVertex2f(p1.X, p1.Y);
                    Gl.glVertex2f(x2.X, x2.Y);
                    Gl.glVertex2f(p2.X, p2.Y);
                    break;
            }

            Gl.glEnd();
        }
    }
}
