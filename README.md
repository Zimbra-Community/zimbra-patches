# zimbra-patches
Provide patches for bugs in Zimbra

## Enable p7s attachments (application/pkcs7-signature) in webUI
Customer cannot add p7s attachments, nor can the client view them from the webUI. This Zimlet reverts the ignoring of application/pkcs7-signature that was introduced in bugzilla 69476.

     rm -Rf /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_enable_pkcs7_signature
     mkdir -p /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_enable_pkcs7_signature
     cd /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_enable_pkcs7_signature
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_enable_pkcs7_signature/tk_barrydegraaff_enable_pkcs7_signature.xml
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_enable_pkcs7_signature/tk_barrydegraaff_enable_pkcs7_signature.js

## Enable sorting by TO in the Web UI

     rm -Rf /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_enable_sortto/
     mkdir -p /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_enable_sortto/
     cd /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_enable_sortto/
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_enable_sortto/tk_barrydegraaff_enable_sortto.xml
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_enable_sortto/tk_barrydegraaff_enable_sortto.js

This will enable a sort by TO menu action in the email list.

## Force use of Advanced AJAX Interface

     rm -Rf /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_force_advanced/
     mkdir -p /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_force_advanced/
     cd /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_force_advanced/
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_force_advanced/tk_barrydegraaff_force_advanced/tk_barrydegraaff_force_advanced.xml
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_force_advanced/tk_barrydegraaff_force_advanced/tk_barrydegraaff_force_advanced.js

This patch will prevent users from switching to the Standard HTML interface as the default setting (Preferences page). This works as long as you use pre-authentication and set Ajax there.
This script will list the current setting for all users: https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_force_advanced/bin/force-ajax.sh
     
     
## Patch Shared mailbox task snoozing permission issue https://bugzilla.zimbra.com/show_bug.cgi?id=106412

     rm -Rf /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_zmcsferesultpatch/
     mkdir -p /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_zmcsferesultpatch/
     cd /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_zmcsferesultpatch/
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_zmcsferesultpatch/tk_barrydegraaff_zmcsferesultpatch.js
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_zmcsferesultpatch/tk_barrydegraaff_zmcsferesultpatch.xml


     
## This work-around removes console.log 'spam' from ZeXtras chat https://bugzilla.zextras.com/show_bug.cgi?id=171

        rm -Rf /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_disable_zxlogging/
        mkdir /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_disable_zxlogging/
        cd /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_disable_zxlogging/
        wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_disable_zxlogging/tk_barrydegraaff_disable_zxlogging.xml
        wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_disable_zxlogging/tk_barrydegraaff_disable_zxlogging.js


### License

Where applicable:

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
