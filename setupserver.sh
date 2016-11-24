#!/bin/bash
cd
sudo apt-get update
sudo apt-get dist-upgrade -y
sudo apt-get install software-properties-common -y
sudo add-apt-repository ppa:transmissionbt/ppa
sudo apt-get update
echo "\n\n\nINSTALLING ALL THE PACKAGES \n\n\n\n"
for i in transmission-cli transmission-common transmission-daemon php5 libapache2-mod-php5 php5-mcrypt nodejs npm mysql-server mysql-client libmysqlclient-dev npm git vim curl zlib1g-dev build-essential libssl-dev libreadline-dev libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev libcurl4-openssl-dev python-software-properties libffi-dev; do
	sudo apt-get install $i -y
done
echo "\n\n\n\INSTALLING RBENV\n\n\n"
git clone git://github.com/sstephenson/rbenv.git .rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bash_profile
echo 'eval "$(rbenv init -)"' >> ~/.bash_profile
git clone git://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build
echo 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
echo "\n\n\nINSTALLING RUBY\n\n\n"
rbenv install -v 2.2.3
rbenv global 2.2.3
ruby -v
echo "gem: --no-document" > ~/.gemrc
gem install bundler
echo "\n\n\nINSTALLING RAILS\n\n\n"
gem install rails
rails -v
gem install jekyll
gem install mysql2
rbenv rehash
echo "\n\n\nINSTALLING vim-plug\n\n\n"
sudo curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
    https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
sudo wget https://raw.githubusercontent.com/RobertHosking/sys-configs/master/dots/.vimrc?token=ALlVOFGBiPvvr7UASCdsYNsNYIf-Y1GRks5YQKVawA%3D%3D -O /etc/skel/.vimrc

echo "\n\n\nTRANSMISSION SETUP\n\n\n"
sudo service transmission-daemon stop
sudo wget https://raw.githubusercontent.com/RobertHosking/sys-configs/master/settings.json?token=ALlVOBxhQshxPHEsjM90jVTZHQlqIpQNks5YQKe5wA%3D%3D -O /var/lib/transmission-daemon/info/settings.json
sudo service transmission-daemon start
echo "\n\n\nLETS ENCRYPT\n\n\n"
cd /usr/local/sbin
sudo wget https://dl.eff.org/certbot-auto
sudo chmod a+x /usr/local/sbin/certbot-auto

