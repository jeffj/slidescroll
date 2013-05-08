#! /bin/bash
echo "killing soffice .sh"
echo "I will now restart"

sleep 2s

sudo killall -9 soffice.bin
sudo killall -9 python

sleep 2s

sudo /usr/lib/libreoffice/program/soffice "--accept=socket,port=8100;urp;" --headless &
sudo python parser.py

sleep 5s

echo "restarted"
