using System;
using System.Collections.Generic;
using System.Text;
using Box2D.Net;
using Tao.OpenGl;

namespace TestBed.Net
{
    public class Test
    {
        public World world;
        public MouseJoint mouseJoint;
        public Body bomb;
        public float Zoom = 20;
        public Vector ViewOffset = new Vector();
        public Vector Mouse = null;

        public Test()
        {
            AABB worldAABB = new AABB(new Vector(-100.0f, -100.0f), new Vector(100.0f, 200.0f));
            Vector gravity = new Vector(0, -10);
            bool doSleep = true;
            world = new World(worldAABB, gravity, doSleep);
            
            //m_textLine = 30;
            //
            //m_listener.test = this;
            //m_world->SetListener(&m_listener);
        }

        public void Step(Settings settings)
        {
            if(settings.Pause)
                return;

            float timeStep = settings.Hz > 0 ? 1.0f / settings.Hz : 0;

            World.WarmStarting = settings.WarmStarting;
            World.PositionCorrection = settings.PositionCorrection;
	        
            world.Step(timeStep, settings.IterationCount);

            //m_world->m_broadPhase->Validate();            
        }

        Vector RelativeToWorld(Vector Relative)
        {
            Vector working = Relative;
            working *= Zoom;
            working -= ViewOffset;
            return working;
        }

        /// <summary>
        /// Handles what happens when a user clicks the mouse
        /// </summary>
        /// <param name="p">
        /// The position of the mouse click in relative coordinates.
        /// </param>
        public void MouseDown(Vector point)
        {
            Vector p = RelativeToWorld(point);

            if (mouseJoint != null)
                throw new Exception("ASSERT: mouseJoint should be null");

            // Make a small box.
            Vector d = new Vector(.001f, .001f);
            AABB aabb = new AABB(p - d, p + d);

            // Query the world for overlapping shapes.
            IList<Shape> shapes = world.Query(aabb);
            Body body = null;
            foreach (Shape shape in shapes)
            {
                if (shape.Body.Static == false &&
                    shape.TestPoint(shape.Body.GetXForm(), p))
                {
                    body = shape.Body;
                    break;
                }
            }

            if (body != null)
            {
                MouseJointDef md = new MouseJointDef();
                md.Body1 = world.GetGroundBody();
                md.Body2 = body;
                md.Target = p;
                md.MaxForce = 1000 * body.Mass;
                mouseJoint = new MouseJoint(world.CreateJoint(md));
                body.WakeUp();
            }
        }

        public void MouseUp(Vector point)
        {
            Vector p = RelativeToWorld(point);

            if (mouseJoint != null)
            {
                world.DestroyJoint(mouseJoint);
                mouseJoint = null;
            }
        }

        public void MouseMove(Vector point)
        {
            Vector p = RelativeToWorld(point);

            if (mouseJoint != null)
                mouseJoint.SetTarget(p);
        }

        public void KeyPress(System.Windows.Forms.Keys key)
        {
            switch (key)
            {
                case System.Windows.Forms.Keys.Space:
                    LaunchBomb();
                    break;
                
                case System.Windows.Forms.Keys.Left:
                    ViewOffset.X -= 1;
                    break;

                case System.Windows.Forms.Keys.Right:
                    ViewOffset.X += 1;
                    break;

                case System.Windows.Forms.Keys.Up:
                    ViewOffset.Y += 1;
                    break;

                case System.Windows.Forms.Keys.Down:
                    ViewOffset.Y -= 1;
                    break;

                case System.Windows.Forms.Keys.X:
                    Zoom -= 1;
                    break;

                case System.Windows.Forms.Keys.Z:
                    Zoom += 1;
                    break;                    
            }
        }

        void LaunchBomb()
        {
	        if (bomb != null)
	        {
                world.DestroyBody(bomb);
                bomb = null;
	        }

            BodyDef bd = new BodyDef();
	        bd.BodyType = BodyType.e_dynamicBody;
	        bd.AllowSleep = true;
            Random rand = new Random();
            bd.Position = new Vector((float)rand.NextDouble() * 30 - 15, 30.0f);
	        bd.IsBullet = true;
            bomb = world.CreateBody(bd);
	        bomb.LinearVelocity = bd.Position * -5;

            CircleDef sd = new CircleDef();
	        sd.Radius = 0.3f;
	        sd.Density = 20.0f;
	        sd.Restitution = 0.1f;
            bomb.CreateShape(sd);
            bomb.SetMassFromShapes();
        }

        public override string ToString()
        {
            return GetType().Name;
        }
    };
}
