#!/bin/bash
## Script created for the Zimbra Community
## Licensed under GPLv2
## This Script doesn't have any kind of Support
## Use it under your own responsibility

## Moving and operating from /tmp
cd /tmp

##Coming from another upgrade try? Then cleaning the files here, just in case:
rm _base2skin.css
rm _base3skin.css
## Making a Backup of the original Files
echo "Making a Backup of the original Files"
mv /opt/zimbra/jetty/webapps/zimbra/skins/_base/base2/skin.css /opt/zimbra/jetty/webapps/zimbra/skins/_base/base2/skin.css.old
mv /opt/zimbra/jetty/webapps/zimbra/skins/_base/base3/skin.css /opt/zimbra/jetty/webapps/zimbra/skins/_base/base3/skin.css.old

## Downloading the fixed Files from GitHub
echo "Downloading the fixed Files from GitHub"
wget --no-check-certificate https://raw.githubusercontent.com/jorgedlcruz/Zimbra/master/Zimbra%20Google%20Chrome%2045%20Fix/_base2skin.css https://raw.githubusercontent.com/jorgedlcruz/Zimbra/master/Zimbra%20Google%20Chrome%2045%20Fix/_base3skin.css

## Move the downloaded Files into the proper folder
echo "Move the downloaded Files into the proper folder"
mv _base2skin.css /opt/zimbra/jetty/webapps/zimbra/skins/_base/base2/skin.css
mv _base3skin.css /opt/zimbra/jetty/webapps/zimbra/skins/_base/base3/skin.css

## Fixing the rights
echo "Fixing the rights"
chown zimbra:zimbra /opt/zimbra/jetty/webapps/zimbra/skins/_base/base2/skin.css
chown zimbra:zimbra /opt/zimbra/jetty/webapps/zimbra/skins/_base/base3/skin.css

## Restart the Mailbox Service
read -p "To finish the installation you need to restart the mailboxd process. This will cause a service disruption. Are you sure you want to continue? Press Y/y or N/n " -n 1 -r
echo    # (optional) move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
else
   echo "Restart the Mailbox Service"
   su - zimbra -c 'zmmailboxdctl restart'
fi
echo "Now, all the users must do logout and login, and everything should work"
