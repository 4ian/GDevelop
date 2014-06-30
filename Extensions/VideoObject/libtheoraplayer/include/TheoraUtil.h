/************************************************************************************
This source file is part of the Theora Video Playback Library
For latest info, see http://libtheoraplayer.sourceforge.net/
*************************************************************************************
Copyright (c) 2008-2010 Kresimir Spes (kreso@cateia.com)

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU Lesser General Public License (LGPL) as published by the
Free Software Foundation; either version 2 of the License, or (at your option)
any later version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 59 Temple
Place - Suite 330, Boston, MA 02111-1307, USA, or go to
http://www.gnu.org/copyleft/lesser.txt.
*************************************************************************************/
#ifndef _TheoraUtil_h
#define _TheoraUtil_h

#include <string>
#include <vector>

#define foreach(type,lst) for (std::vector<type>::iterator it=lst.begin();it != lst.end(); it++)
#define foreach_l(type,lst) for (std::list<type>::iterator it=lst.begin();it != lst.end(); it++)
#define foreach_r(type,lst) for (std::vector<type>::reverse_iterator it=lst.rbegin();it != lst.rend(); it++)
#define foreach_in_map(type,list) for (std::map<std::string,type>::iterator it=list.begin();it != list.end(); it++)

#define th_writelog(x) TheoraVideoManager::getSingleton().logMessage(x)

std::string str(int i);
std::string strf(float i);
void _psleep(int milliseconds);
int _nextPow2(int x);

#endif



