using System;
using System.Collections.Generic;
using System.Text;
using Box2D.Net;

namespace TestBed.Net.Tests
{
    public class Bridge : TestBed.Net.Test
    {
        public Bridge()
        {            
	        Body ground;
            {
                PolygonDef sd = new PolygonDef();
                sd.ShapeType = ShapeType.e_polygonShape;
                sd.SetAsBox(50.0f, 10.0f);

                BodyDef bd = new BodyDef();
                bd.Position = new Vector(0, -10);
                
                ground = world.CreateBody(bd);
                ground.CreateShape(sd);
            }

            {
                PolygonDef sd = new PolygonDef();
                sd.SetAsBox(0.5f, 0.125f);
                sd.Density = 20.0f;
                sd.Friction = 0.2f;

                BodyDef bd = new BodyDef();
			    bd.BodyType = BodyType.e_dynamicBody;

                RevoluteJointDef jd = new RevoluteJointDef();
			    const float numPlanks = 30;

                Body prevBody = ground;

                for (float i = 0; i < numPlanks; ++i)
                {
                    bd.Position = new Vector(-14.5f + i, 5);
                    Body body = world.CreateBody(bd);
				    body.CreateShape(sd);
                    body.SetMassFromShapes();

				    Vector anchor = new Vector(-15 + i, 5);
                    jd.Initialize(prevBody, body, anchor);
                    world.CreateJoint(jd);

				    prevBody = body;
                }

                Vector anchor2 = new Vector(-15 + numPlanks, 5);
			    jd.Initialize(prevBody, ground, anchor2);
			    world.CreateJoint(jd);
            }
        }
    }
}
