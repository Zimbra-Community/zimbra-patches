# zimbra-patches
Provide patches for bugs in ZImbra

## Can't Disable External Imap and pop3 Access through cos and per user basis. https://bugzilla.zimbra.com/show_bug.cgi?id=106132

     rm -Rf /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_ext_acct_disable/
     mkdir -p /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_ext_acct_disable/
     cd /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_ext_acct_disable/
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_ext_acct_disable/tk_barrydegraaff_ext_acct_disable.css
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_ext_acct_disable/tk_barrydegraaff_ext_acct_disable.xml

This patch will remove the external accounts settings page from the UI. (the back-end will still allow it, if the users crafts the soap request or changes the DOM).


## Calendar day view in 8.7 & 8.7.1 is broken if too many calendars are in the users account https://bugzilla.zimbra.com/show_bug.cgi?id=106285

     rm -Rf /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_calpatch/
     mkdir -p /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_calpatch/
     cd /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_calpatch/
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_calpatch/tk_barrydegraaff_calpatch.css
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_calpatch/tk_barrydegraaff_calpatch.js
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_calpatch/tk_barrydegraaff_calpatch.xml

If you don't see the patch, close your browser, maybe flush the cache and try again.


## Patch Shared mailbox task snoozing permission issue https://bugzilla.zimbra.com/show_bug.cgi?id=106412

     rm -Rf /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_zmcsferesultpatch/
     mkdir -p /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_zmcsferesultpatch/
     cd /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_zmcsferesultpatch/
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_zmcsferesultpatch/tk_barrydegraaff_zmcsferesultpatch.js
     wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_zmcsferesultpatch/tk_barrydegraaff_zmcsferesultpatch.xml


## Only on 8.6: Youtube zimlet no longer shows thumbnail [https://bugzilla.zimbra.com/show_bug.cgi?id=101814](https://bugzilla.zimbra.com/show_bug.cgi?id=101814)

      cd /tmp
      rm -Rf com_zimbra_url.zip   
      su zimbra
      wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/com_zimbra_url.zip
      zmzimletctl deploy com_zimbra_url.zip

      
## This work-around removes console.log 'spam' from ZeXtras chat https://bugzilla.zextras.com/show_bug.cgi?id=171

        rm -Rf /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_disable_zxlogging/
        mkdir /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_disable_zxlogging/
        cd /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_disable_zxlogging/
        wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_disable_zxlogging/tk_barrydegraaff_disable_zxlogging.xml
        wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_disable_zxlogging/tk_barrydegraaff_disable_zxlogging.js

##  Use name from email header instead of contacts and emailed contacts https://bugzilla.zimbra.com/show_bug.cgi?id=102087

***This patch is to be considered dangerous, as js errors in this file will prevent the web client from loading! Use at own risk and please test first!!***
This patch disables the feature that gets names from "Contacts" and "Emailed Contacts" and will display the name from the email mime header instead.

https://bugzilla.zimbra.com/show_bug.cgi?id=102087

https://bugzilla.zimbra.com/show_bug.cgi?id=82292

https://wiki.zimbra.com/wiki/How_to_modify_JAVASCRIPT_used_by_Zimbra%3F

      Make a copy of MailCore_all.js.zgz file and store it somewhere outside of the current folder,
      so you can restore in case of failure! Also if you do gunzip inside /opt/zimbra/jetty/webapps/zimbra/js
      the webclient will NO LONGER LOAD, so be careful.
      
      # make a backup that remains untouched:
      cp -ax /opt/zimbra/jetty/webapps/zimbra/js/MailCore_all.js.zgz /root/MailCore_all.js.zgz
      
      # make a copy for editing:
      cp -ax /opt/zimbra/jetty/webapps/zimbra/js/MailCore_all.js.zgz /tmp/MailCore_all.js.zgz
      
      cd /tmp
      gunzip -S zgz  MailCore_all.js.zgz
         Open in a text editor (MailCore_all.js.) including the dot after js (.js. !!)
         nano MailCore_all.js.
         Find using (CTRL+W if you are in nano)
            ZmMailItem.prototype._parseParticipantNode=function(n){
         and change:
            var r=new AjxEmailAddress(n.a,i,s||n.p,n.d,n.isGroup,n.isGroup&&n.exp);
         to:
            var r=new AjxEmailAddress(n.a,i,n.p,n.d,n.isGroup,n.isGroup&&n.exp);
      gzip -S zgz MailCore_all.js.
      
      
      [root@zimbra1 tmp]# ls -hal MailCore_all.js.zgz
      -rw-rw-r--. 1 zimbra zimbra 115K Jun  3 10:41 MailCore_all.js.zgz
      
      ownership and permissions are OK,
      
      cp -ax /tmp/MailCore_all.js.zgz /opt/zimbra/jetty/webapps/zimbra/js/MailCore_all.js.zgz
      cp: overwrite `/opt/zimbra/jetty/webapps/zimbra/js/MailCore_all.js.zgz'? y
      
If you also want to apply this for development mode (?dev=1), you need to alter:

      /opt/zimbra/jetty-distribution-9.1.5.v20140505/webapps/zimbra/js/zimbraMail/mail/model/ZmMailItem.js
      
      change :
      var addr = new AjxEmailAddress(node.a, type, fullName || node.p, node.d, node.isGroup, node.isGroup && node.exp);
      
      to:
      var addr = new AjxEmailAddress(node.a, type, node.p, node.d, node.isGroup, node.isGroup && node.exp);
      
      In the method: 
      ZmMailItem.prototype._parseParticipantNode


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
