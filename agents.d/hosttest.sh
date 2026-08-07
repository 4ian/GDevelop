#!/bin/sh

### really just a very dumb example.

echo "{"
echo "  "\"cmd\": \"uname -a\",
echo "  "\"output\": \""$( uname -a )"\"
echo "}"
echo
