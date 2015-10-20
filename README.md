# zimbra-patches
Provide patches for bugs in ZImbra



Youtube zimlet no longer shows thumbnail [https://bugzilla.zimbra.com/show_bug.cgi?id=101814](https://bugzilla.zimbra.com/show_bug.cgi?id=101814)

      cd /tmp
      rm -Rf com_zimbra_url.zip   
      su zimbra
      wget https://raw.githubusercontent.com/barrydegraaff/zimbra-patches/master/com_zimbra_url.zip
      zmzimletctl deploy com_zimbra_url.zip
