Name:           gdevelop
Version:        3.6.76
Release:	0.1%{?dist}
Summary:        GDevelop game creator

Group:          extra
License:        GPL LGPL MIT
URL:            http://www.compilgames.net

Source0:        gdevelop_%{version}.orig.tar.gz
Source1:	gdevelop.desktop
Source2:	gdevelop.xml
Source100:	gdevelop-rpmlintrc

BuildRoot:      %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)

BuildRequires:  git rsync curl gcc-c++ cmake p7zip glew-devel xorg-x11-devel libsndfile-devel openal-soft-devel desktop-file-utils
%if 0%{?fedora}
BuildRequires:	systemd-devel libjpeg-turbo-devel gtk2-devel wxGTK3-devel
%else
BuildRequires:  update-desktop-files libudev-devel libjpeg8-devel wxWidgets-3_0-devel 
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
cd Binaries
rm -rf .build
mkdir .build
cd .build
#Fedora's wx-config name contains the version (wx-config-3.0 instead of wx-config and wxrc-3.0 instead of wxrc-3.0)
%if 0%{?fedora}
cmake ../.. -DwxWidgets_CONFIG_EXECUTABLE=/usr/bin/wx-config-3.0 -DwxWidgets_wxrc_EXECUTABLE=/usr/bin/wxrc-3.0
%else
cmake ../..
%endif

#Build the whole project
make %{?_smp_mflags}

%install
rm -rf $RPM_BUILD_ROOT
make install DESTDIR=$RPM_BUILD_ROOT

%if 0%{?fedora}
desktop-file-valide %{buildroot}%{_datadir}/applications/gdevelop.desktop
%else
%suse_update_desktop_file gdevelop
%endif

%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(-,root,root,-)

/opt/gdevelop
/usr/bin/gdevelop
/usr/share/applications/gdevelop.desktop
/usr/share/pixmaps/GDevelop.png
/usr/share/mime/packages/gdevelop.xml

%doc

%post
update-mime-database %{_datadir}/mime >/dev/null 2>&1 || :
update-desktop-database >/dev/null 2>&1 || :
touch --no-create %{_datadir}/icons/hicolor >/dev/null 2>&1 || :

%postun
update-mime-database %{_datadir}/mime >/dev/null 2>&1 || :
update-desktop-database >/dev/null 2>&1 || :
if [ $1 -eq 0 ] ; then
    touch --no-create %{_datadir}/icons/hicolor >/dev/null 2>&1
    gtk-update-icon-cache %{_datadir}/icons/hicolor >/dev/null 2>&1 || :
fi

%changelog
