/*
 * FTGL - OpenGL font library
 *
 * Copyright (c) 2001-2004 Henry Maddocks <ftgl@opengl.geek.nz>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

#ifndef    __FTList__
#define    __FTList__

#include "FTGL/ftgl.h"

/**
* Provides a non-STL alternative to the STL list
 */
template <typename FT_LIST_ITEM_TYPE>
class FTList
{
    public:
        typedef FT_LIST_ITEM_TYPE value_type;
        typedef value_type& reference;
        typedef const value_type& const_reference;
        typedef size_t size_type;

        /**
         * Constructor
         */
        FTList()
        :   listSize(0),
            tail(0)
        {
            tail = NULL;
            head = new Node;
        }

        /**
         * Destructor
         */
        ~FTList()
        {
            Node* next;

            for(Node *walk = head; walk; walk = next)
            {
                next = walk->next;
                delete walk;
            }
        }

        /**
         * Get the number of items in the list
         */
        size_type size() const
        {
            return listSize;
        }

        /**
         * Add an item to the end of the list
         */
        void push_back(const value_type& item)
        {
            Node* node = new Node(item);

            if(head->next == NULL)
            {
                head->next = node;
            }

            if(tail)
            {
                tail->next = node;
            }
            tail = node;
            ++listSize;
        }

        /**
         * Get the item at the front of the list
         */
        reference front() const
        {
            return head->next->payload;
        }

        /**
         * Get the item at the end of the list
         */
        reference back() const
        {
            return tail->payload;
        }

    private:
        struct Node
        {
            Node()
            : next(NULL)
            {}

            Node(const value_type& item)
            : next(NULL)
            {
                payload = item;
            }

            Node* next;

            value_type payload;
        };

        size_type listSize;

        Node* head;
        Node* tail;
};

#endif // __FTList__

