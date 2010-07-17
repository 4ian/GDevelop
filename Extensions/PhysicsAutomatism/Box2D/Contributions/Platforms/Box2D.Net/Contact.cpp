#pragma once

#include "stdafx.h"
#include "Shape.cpp"
#include "Manifold.cpp"

namespace Box2D
{
	namespace Net
	{
		public ref class Contact
		{
		internal:
			b2Contact *contact;
			Contact(b2Contact *contactRef) : contact(contactRef) { }

		public:
			property Shape^ Shape1
			{
				Shape^ get()
				{
					return gcnew Shape(contact->GetShape1());
				}
			}

			property Shape^ Shape2
			{
				Shape^ get()
				{
					return gcnew Shape(contact->GetShape2());
				}
			}

			Contact^ GetNext()
			{
				return gcnew Contact(contact->GetNext());
			}

			Manifold^ GetManifolds()
			{
				return gcnew Manifold(contact->GetManifolds());
			}

			property int ManifoldCount
			{
				int get()
				{
					return contact->GetManifoldCount();
				}
			}
		};
	}
}
