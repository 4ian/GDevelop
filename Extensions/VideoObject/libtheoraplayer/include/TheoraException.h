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
#ifndef EXCEPTION_H
#define EXCEPTION_H

#include <string>

class _TheoraGenericException
{
public:
    std::string mErrText,mFile,mType;
	int mLineNumber;

	_TheoraGenericException(const std::string& errorText,std::string type="",std::string file="",int line=0);
    virtual ~_TheoraGenericException() {}

	virtual std::string repr();

	void writeOutput();

	virtual const std::string& getErrorText() { return mErrText; }

	const std::string getType(){ return mType; }
};

#define TheoraGenericException(msg) _TheoraGenericException(msg,"TheoraGenericException",__FILE__,__LINE__)


#define exception_cls(name) class name : public _TheoraGenericException \
{ \
public: \
	name(const std::string& errorText,std::string type="",std::string file="",int line=0) : \
	  _TheoraGenericException(errorText,type,file,line){} \
}

exception_cls(_KeyException);


#endif

