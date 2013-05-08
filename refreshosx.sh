#! /bin/bash
echo "killing soffice .sh"

#killall -9 python
#killall -9 soffice

sleep 5s

/Applications/LibreOffice.app/Contents/MacOS/soffice  --nologo --nofirststartwizard --headless --norestore --invisible "--accept=socket,host=localhost,port=8100,tcpNoDelay=1;urp;" &
#/Applications/LibreOffice.app/Contents/MacOS/python parser.py

sleep 1s

echo "restarted"
