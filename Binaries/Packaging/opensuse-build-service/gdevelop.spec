Name:           gdevelop
Version:        3.6.76
Release:	0.1%{?dist}
Summary:        GDevelop game creator

Group:          extra
License:        GPL LGPL MIT
URL:            http://www.compilgames.net

Source0:        gdevelop_%{version}.orig.tar.gz
Source1:	gdevelop.desktop
Source2:	gdevelop-rpmlintrc

BuildRoot:      %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)

BuildRequires:  git update-desktop-files rsync curl gcc-c++ cmake p7zip glew-devel xorg-x11-devel libsndfile-devel openal-soft-devel
%if 0%{?fedora}
BuildRequires:	systemd-devel libjpeg-turbo-devel gtk2-devel wxGTK3-devel
%else
BuildRequires:  libudev-devel libjpeg8-devel wxWidgets-3_0-devel 
%endif
Requires:       gcc-c++ p7zip 

%description 
GDevelop is a full featured, open source game development software, 
allowing to create HTML5 and native games without needing any knowledge 
in a specific programming language. All the game logic is made thanks 
to an intuitive and powerful event based system.

%prep
%setup -q -n gdevelop-%{version}

%build

#Configuration
rm Binaries/Packaging/debian-source-package/extra-files/gdevelop.desktop
cd Binaries
rm -rf .build
mkdir .build
cd .build
cmake ../..

#Force to make SFML first (sometime forgot one sfml lib causing the whole build to fail)
cd ExtLibs/SFML
make %{?_smp_mflags}

#Build the whole project
cd ../..
make %{?_smp_mflags}

%install
rm -rf $RPM_BUILD_ROOT

#Create installation folder and copy all file inside it
mkdir -p "$RPM_BUILD_ROOT"/opt/gdevelop
mkdir -p "$RPM_BUILD_ROOT"/usr/share/applications
mkdir -p "$RPM_BUILD_ROOT"/usr/bin
mkdir -p "$RPM_BUILD_ROOT"/usr/share/pixmaps
cp -R Binaries/Output/Release_Linux/* "$RPM_BUILD_ROOT"/opt/gdevelop

#Copy other files
cp Binaries/Packaging/debian-source-package/extra-files/gdevelop "$RPM_BUILD_ROOT"/usr/bin/

#Update the icon
cp -T Binaries/Output/Release_Linux/res/icon48linux.png "$RPM_BUILD_ROOT"/usr/share/pixmaps/GDevelop.png
%suse_update_desktop_file -i gdevelop

%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(-,root,root,-)

/opt/gdevelop
/usr/bin/gdevelop
/usr/share/applications/gdevelop.desktop
/usr/share/pixmaps/GDevelop.png

%doc


%changelog
