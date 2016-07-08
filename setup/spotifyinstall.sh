#!/bin/bash
wget -q -O - https://apt.mopidy.com/mopidy.gpg | sudo apt-key add -

sudo wget -q -O /etc/apt/sources.list.d/mopidy.list https://apt.mopidy.com/mopidy.list

sudo apt-get update

apt-get install -y libportaudio2 libspotify12 unzip --no-install-recommends

wget https://github.com/fabiofalci/sconsify/releases/download/v0.3.0-rc1/linux-x86_64-sconsify-0.3.0-rc1.zip

unzip linux*.zip

mv sconsify spotify

mv spotify /bin

export PATH=$PATH:/bin/spotify
