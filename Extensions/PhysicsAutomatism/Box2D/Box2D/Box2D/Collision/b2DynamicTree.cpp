/*
* Copyright (c) 2009 Erin Catto http://www.gphysics.com
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

#include <Box2D/Collision/b2DynamicTree.h>
#include <cstring>
#include <cfloat>

b2DynamicTree::b2DynamicTree()
{
	m_root = b2_nullNode;

	m_nodeCapacity = 16;
	m_nodeCount = 0;
	m_nodes = (b2DynamicTreeNode*)b2Alloc(m_nodeCapacity * sizeof(b2DynamicTreeNode));
	memset(m_nodes, 0, m_nodeCapacity * sizeof(b2DynamicTreeNode));

	// Build a linked list for the free list.
	for (int32 i = 0; i < m_nodeCapacity - 1; ++i)
	{
		m_nodes[i].next = i + 1;
	}
	m_nodes[m_nodeCapacity-1].next = b2_nullNode;
	m_freeList = 0;

	m_path = 0;

	m_insertionCount = 0;
}

b2DynamicTree::~b2DynamicTree()
{
	// This frees the entire tree in one shot.
	b2Free(m_nodes);
}

// Allocate a node from the pool. Grow the pool if necessary.
int32 b2DynamicTree::AllocateNode()
{
	// Expand the node pool as needed.
	if (m_freeList == b2_nullNode)
	{
		b2Assert(m_nodeCount == m_nodeCapacity);

		// The free list is empty. Rebuild a bigger pool.
		b2DynamicTreeNode* oldNodes = m_nodes;
		m_nodeCapacity *= 2;
		m_nodes = (b2DynamicTreeNode*)b2Alloc(m_nodeCapacity * sizeof(b2DynamicTreeNode));
		memcpy(m_nodes, oldNodes, m_nodeCount * sizeof(b2DynamicTreeNode));
		b2Free(oldNodes);

		// Build a linked list for the free list. The parent
		// pointer becomes the "next" pointer.
		for (int32 i = m_nodeCount; i < m_nodeCapacity - 1; ++i)
		{
			m_nodes[i].next = i + 1;
		}
		m_nodes[m_nodeCapacity-1].next = b2_nullNode;
		m_freeList = m_nodeCount;
	}

	// Peel a node off the free list.
	int32 nodeId = m_freeList;
	m_freeList = m_nodes[nodeId].next;
	m_nodes[nodeId].parent = b2_nullNode;
	m_nodes[nodeId].child1 = b2_nullNode;
	m_nodes[nodeId].child2 = b2_nullNode;
	++m_nodeCount;
	return nodeId;
}

// Return a node to the pool.
void b2DynamicTree::FreeNode(int32 nodeId)
{
	b2Assert(0 <= nodeId && nodeId < m_nodeCapacity);
	b2Assert(0 < m_nodeCount);
	m_nodes[nodeId].next = m_freeList;
	m_freeList = nodeId;
	--m_nodeCount;
}

// Create a proxy in the tree as a leaf node. We return the index
// of the node instead of a pointer so that we can grow
// the node pool.
int32 b2DynamicTree::CreateProxy(const b2AABB& aabb, void* userData)
{
	int32 proxyId = AllocateNode();

	// Fatten the aabb.
	b2Vec2 r(b2_aabbExtension, b2_aabbExtension);
	m_nodes[proxyId].aabb.lowerBound = aabb.lowerBound - r;
	m_nodes[proxyId].aabb.upperBound = aabb.upperBound + r;
	m_nodes[proxyId].userData = userData;

	InsertLeaf(proxyId);

	// Rebalance if necessary.
	int32 iterationCount = m_nodeCount >> 4;
	int32 tryCount = 0;
	int32 height = ComputeHeight();
	while (height > 64 && tryCount < 10)
	{
		Rebalance(iterationCount);
		height = ComputeHeight();
		++tryCount;
	}

	return proxyId;
}

void b2DynamicTree::DestroyProxy(int32 proxyId)
{
	b2Assert(0 <= proxyId && proxyId < m_nodeCapacity);
	b2Assert(m_nodes[proxyId].IsLeaf());

	RemoveLeaf(proxyId);
	FreeNode(proxyId);
}

bool b2DynamicTree::MoveProxy(int32 proxyId, const b2AABB& aabb, const b2Vec2& displacement)
{
	b2Assert(0 <= proxyId && proxyId < m_nodeCapacity);

	b2Assert(m_nodes[proxyId].IsLeaf());

	if (m_nodes[proxyId].aabb.Contains(aabb))
	{
		return false;
	}

	RemoveLeaf(proxyId);

	// Extend AABB.
	b2AABB b = aabb;
	b2Vec2 r(b2_aabbExtension, b2_aabbExtension);
	b.lowerBound = b.lowerBound - r;
	b.upperBound = b.upperBound + r;

	// Predict AABB displacement.
	b2Vec2 d = b2_aabbMultiplier * displacement;

	if (d.x < 0.0f)
	{
		b.lowerBound.x += d.x;
	}
	else
	{
		b.upperBound.x += d.x;
	}

	if (d.y < 0.0f)
	{
		b.lowerBound.y += d.y;
	}
	else
	{
		b.upperBound.y += d.y;
	}

	m_nodes[proxyId].aabb = b;

	InsertLeaf(proxyId);
	return true;
}

void b2DynamicTree::InsertLeaf(int32 leaf)
{
	++m_insertionCount;

	if (m_root == b2_nullNode)
	{
		m_root = leaf;
		m_nodes[m_root].parent = b2_nullNode;
		return;
	}

	// Find the best sibling for this node.
	b2Vec2 center = m_nodes[leaf].aabb.GetCenter();
	int32 sibling = m_root;
	if (m_nodes[sibling].IsLeaf() == false)
	{
		do 
		{
			int32 child1 = m_nodes[sibling].child1;
			int32 child2 = m_nodes[sibling].child2;

			b2Vec2 delta1 = b2Abs(m_nodes[child1].aabb.GetCenter() - center);
			b2Vec2 delta2 = b2Abs(m_nodes[child2].aabb.GetCenter() - center);

			float32 norm1 = delta1.x + delta1.y;
			float32 norm2 = delta2.x + delta2.y;

			if (norm1 < norm2)
			{
				sibling = child1;
			}
			else
			{
				sibling = child2;
			}

		}
		while(m_nodes[sibling].IsLeaf() == false);
	}

	// Create a parent for the siblings.
	int32 node1 = m_nodes[sibling].parent;
	int32 node2 = AllocateNode();
	m_nodes[node2].parent = node1;
	m_nodes[node2].userData = NULL;
	m_nodes[node2].aabb.Combine(m_nodes[leaf].aabb, m_nodes[sibling].aabb);

	if (node1 != b2_nullNode)
	{
		if (m_nodes[m_nodes[sibling].parent].child1 == sibling)
		{
			m_nodes[node1].child1 = node2;
		}
		else
		{
			m_nodes[node1].child2 = node2;
		}

		m_nodes[node2].child1 = sibling;
		m_nodes[node2].child2 = leaf;
		m_nodes[sibling].parent = node2;
		m_nodes[leaf].parent = node2;

		do 
		{
			if (m_nodes[node1].aabb.Contains(m_nodes[node2].aabb))
			{
				break;
			}

			m_nodes[node1].aabb.Combine(m_nodes[m_nodes[node1].child1].aabb, m_nodes[m_nodes[node1].child2].aabb);
			node2 = node1;
			node1 = m_nodes[node1].parent;
		}
		while(node1 != b2_nullNode);
	}
	else
	{
		m_nodes[node2].child1 = sibling;
		m_nodes[node2].child2 = leaf;
		m_nodes[sibling].parent = node2;
		m_nodes[leaf].parent = node2;
		m_root = node2;
	}
}

void b2DynamicTree::RemoveLeaf(int32 leaf)
{
	if (leaf == m_root)
	{
		m_root = b2_nullNode;
		return;
	}

	int32 node2 = m_nodes[leaf].parent;
	int32 node1 = m_nodes[node2].parent;
	int32 sibling;
	if (m_nodes[node2].child1 == leaf)
	{
		sibling = m_nodes[node2].child2;
	}
	else
	{
		sibling = m_nodes[node2].child1;
	}

	if (node1 != b2_nullNode)
	{
		// Destroy node2 and connect node1 to sibling.
		if (m_nodes[node1].child1 == node2)
		{
			m_nodes[node1].child1 = sibling;
		}
		else
		{
			m_nodes[node1].child2 = sibling;
		}
		m_nodes[sibling].parent = node1;
		FreeNode(node2);

		// Adjust ancestor bounds.
		while (node1 != b2_nullNode)
		{
			b2AABB oldAABB = m_nodes[node1].aabb;
			m_nodes[node1].aabb.Combine(m_nodes[m_nodes[node1].child1].aabb, m_nodes[m_nodes[node1].child2].aabb);

			if (oldAABB.Contains(m_nodes[node1].aabb))
			{
				break;
			}

			node1 = m_nodes[node1].parent;
		}
	}
	else
	{
		m_root = sibling;
		m_nodes[sibling].parent = b2_nullNode;
		FreeNode(node2);
	}
}

void b2DynamicTree::Rebalance(int32 iterations)
{
	if (m_root == b2_nullNode)
	{
		return;
	}

	for (int32 i = 0; i < iterations; ++i)
	{
		int32 node = m_root;

		uint32 bit = 0;
		while (m_nodes[node].IsLeaf() == false)
		{
			int32* children = &m_nodes[node].child1;
			node = children[(m_path >> bit) & 1];
			bit = (bit + 1) & (8* sizeof(uint32) - 1);
		}
		++m_path;

		RemoveLeaf(node);
		InsertLeaf(node);
	}
}

// Compute the height of a sub-tree.
int32 b2DynamicTree::ComputeHeight(int32 nodeId) const
{
	if (nodeId == b2_nullNode)
	{
		return 0;
	}

	b2Assert(0 <= nodeId && nodeId < m_nodeCapacity);
	b2DynamicTreeNode* node = m_nodes + nodeId;
	int32 height1 = ComputeHeight(node->child1);
	int32 height2 = ComputeHeight(node->child2);
	return 1 + b2Max(height1, height2);
}

int32 b2DynamicTree::ComputeHeight() const
{
	return ComputeHeight(m_root);
}
