# zimbra-patches
Provide patches for bugs in ZImbra



Youtube zimlet no longer shows thumbnail [https://bugzilla.zimbra.com/show_bug.cgi?id=101814](https://bugzilla.zimbra.com/show_bug.cgi?id=101814)

      cd /tmp
      rm -Rf com_zimbra_url.zip   
      su zimbra
      wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/com_zimbra_url.zip
      zmzimletctl deploy com_zimbra_url.zip

      
This work-around removes console.log 'spam' from ZeXtras chat https://bugzilla.zextras.com/show_bug.cgi?id=171

        rm -Rf /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_disable_zxlogging/
        mkdir /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_disable_zxlogging/
        cd /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_disable_zxlogging/
        wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_disable_zxlogging/tk_barrydegraaff_disable_zxlogging.xml
        wget https://raw.githubusercontent.com/Zimbra-Community/zimbra-patches/master/tk_barrydegraaff_disable_zxlogging/tk_barrydegraaff_disable_zxlogging.js


      
