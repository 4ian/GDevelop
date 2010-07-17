#pragma once

#include "stdafx.h"
#include "Vector.cpp"
#include "Matrix.cpp"
#include "ShapeType.cpp"
#include "XForm.cpp"

using namespace System::Collections::Generic;

namespace Box2D
{
	namespace Net
	{
		ref class Body;
		public ref class Shape
		{
		internal:
			b2Shape *shape;
			Shape(b2Shape *shapeRef) : shape(shapeRef) { }
		
		public:
			bool TestPoint(XForm^ xf, Vector^ p)
			{
				return shape->TestPoint(xf->getXForm(), p->getVec2());
			}
	
			property ShapeType ShapeType
			{
				Box2D::Net::ShapeType get()
				{
					return (Box2D::Net::ShapeType)shape->GetType();
				}
			}

			/// <summary>
			/// Get the parent body of this shape.
			/// </summary>
			property Body^ Body
			{
				Box2D::Net::Body^ get();
			}

			/*
			/// <summary>
			/// Get the world position.
			/// </summary>
			property Vector^ Position
			{
				Vector^ get()
				{
					return gcnew Vector(shape->Get->GetPosition());
				}
			}
			*/

			/*
			property Matrix^ Rotation
			{
				Matrix^ get()
				{
					return gcnew Matrix(shape->GetRotationMatrix());
				}
			}
			*/

			//TODO:
			//void* GetUserData();
			//
			// Remove and then add proxy from the broad-phase.
			// This is used to refresh the collision filters.
			//virtual void ResetProxy(b2BroadPhase* broadPhase) = 0;

			/// <summary>
			/// Get the next shape in the parent body's shape list.
			/// </summary>
			Shape^ GetNext()
			{
				return gcnew Shape(shape->GetNext());
			}
		};

		public ref class CircleShape : public Shape
		{
		internal:
			b2CircleShape *circleShape;
			CircleShape(b2CircleShape *shapeRef) : Shape(shapeRef), circleShape(shapeRef) { }
		
		public:
			CircleShape(Shape^ shape) : Shape(shape->shape), circleShape(0)
			{
				if(shape->ShapeType == Box2D::Net::ShapeType::e_circleShape &&
					reinterpret_cast<b2CircleShape *>(shape->shape))
				{
					circleShape = reinterpret_cast<b2CircleShape*>(shape->shape);
				}
				else
				{
					throw gcnew System::Exception("Attempting to convert a Shape to a CircleShape,"
												  "but the Shape is not a circle shape.");
				}
			}

			//TODO: this is not technically part of the "public" interface for CircleShape
			property float32 Radius
			{
				float32 get()
				{
					return circleShape->m_radius;
				}

				void set(float32 value)
				{
					circleShape->m_radius = value;
				}
			}
		};

		public ref class PolyShape : public Shape
		{
		internal:
			b2PolygonShape *polyShape;
			PolyShape(b2PolygonShape *shapeRef) : Shape(shapeRef), polyShape(shapeRef) { }
		
		public:
			PolyShape(Shape^ shape) : Shape(shape->shape), polyShape(0)
			{
				if(shape->ShapeType == Box2D::Net::ShapeType::e_polygonShape &&
					reinterpret_cast<b2PolygonShape *>(shape->shape))
				{
					polyShape = reinterpret_cast<b2PolygonShape*>(shape->shape);
				}
				else
				{
					throw gcnew System::Exception("Attempting to convert a Shape to a PolyShape,"
												  "but the Shape is not a poly shape.");
				}
			}

			property IList<Vector^>^ Vertices
			{
				IList<Vector^>^ get()
				{
					List<Vector^>^ list = gcnew List<Vector^>();
					for(int x = 0; x < polyShape->m_vertexCount; ++x)
						list->Add(gcnew Vector(polyShape->m_vertices[x]));

					return list;
				}
			}
		};
	}
}
