# zimbra-patches
Provide patches for bugs in ZImbra



Youtube zimlet no longer shows thumbnail [https://bugzilla.zimbra.com/show_bug.cgi?id=101814](https://bugzilla.zimbra.com/show_bug.cgi?id=101814)

      cd /tmp
      rm -Rf com_zimbra_url.zip   
      su zimbra
      wget https://raw.githubusercontent.com/barrydegraaff/zimbra-patches/master/com_zimbra_url.zip
      zmzimletctl deploy com_zimbra_url.zip



HTML <br> code in quick reply emails [https://bugzilla.zimbra.com/show_bug.cgi?id=101907](https://bugzilla.zimbra.com/show_bug.cgi?id=101907)

This work-around removes the quick-reply and reply-all links in conversation view (the bug is still in search results)

        rm -Rf /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_disable_quick_reply/
        mkdir /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_disable_quick_reply/
        cd /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_disable_quick_reply/
        wget https://raw.githubusercontent.com/barrydegraaff/zimbra-patches/master/tk_barrydegraaff_disable_quick_reply/tk_barrydegraaff_disable_quick_reply.xml
        wget https://raw.githubusercontent.com/barrydegraaff/zimbra-patches/master/tk_barrydegraaff_disable_quick_reply/tk_barrydegraaff_disable_quick_reply.js
      
