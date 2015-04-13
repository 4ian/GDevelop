#! /bin/sh

#Create the directory for logs
mkdir -p ~/.GDevelop

#Go to the Resource directory and launch GDIDE.
cd "$(dirname "$0")"
cd ../Resources
./GDIDE 1>~/.GDevelop/logs.txt 2>&1
