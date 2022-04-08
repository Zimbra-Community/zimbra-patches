# How to create the certificate chain when deploying TLS certificates on Zimbra

This article is a practical how to on creating the certificate chain file. The certificate chain file usually named `commercial_ca.crt` and it is needed to deploy TLS certificates on Zimbra. This article assumes you already did all the steps to obtain a new TLS certificate. If you don't have a certificate yet, you can either create a new CSR (Certificate Signing Request) and send that to a commercial CA (Certificate Authority) or use Let's Encrypt. You can find the steps here:

- https://postboxservices.com/blogs/post/lets-setup-zimbra-9-0-0-on-ubuntu-18-0-4-and-configure-letsencrypt-ssl-certificates-on-it
- https://wiki.zimbra.com/wiki/Administration_Console_and_CLI_Certificate_Tools

## Identify your certificate files

Usually when you obtain a TLS certificate from a certificate authority like Godaddy, Digicert or Let's Encrypt you will end up with a bunch of files with names similar to these examples:

| File name | Description |
|---|---|
| cert.pem | public key certificate of your domain |
| chain.pem | useless certificate chain |
| fullchain.pem | another useless certificate chain |
| privkey.pem | your private key |
| yourdomain.crt | public key certificate of your domain | |
| ca-bundle.crt | useless certificate chain |
| ca-bundle.trust.crt | useless certificate chain |
| commercial.key | your private key |
| yourdomain.key | your private key |

You will need to identify which files contains the public key certificate of your domain and which contains your private key. The rest of the supplied files are usually useless for deployment on Zimbra.

### Finding the private key file

To find the private key open the files (*.key, privkey.pem) with a text editor, such as nano or Notepad etc. and see if the file contains the `BEGIN ... PRIVATE KEY` and `END ... PRIVATE KEY` lines. If these lines are present, you have identified your private key. Here is an example:

````
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
````

### Finding the public key certificate file

The easiest way to find out what your public key certificate file is, is to open them on your computer. All modern operating systems support reading public key certificate files. And it is usually as simple as double clicking them. On Windows you have to enable the display of File name extensions in Explorer and rename `.pem` files to `.crt` to be able to open them.

Windows:
![](screenshots/win-ext.png)
![](screenshots/windows-crt.png)

MacOS:
![](screenshots/mac3.png)

Linux:
![](screenshots/lin1.png)

The file that contains your domain name (issued to, identity) is your public key certificate file. The `valid to` date should be in the future.

## Creating the certificate chain

Creating the certificate chain file needed for deployment on Zimbra is where most administrators struggle. One of the reasons is that the CA (Certificate Authority) change the way certificates are generated/signed frequently due to expiration of their own certificates. And because of this documentation is often out of date. This article will show you how to create the certificate chain in any situation.

Now that you have found your public key certificate file, take a look at the Issued by or Verified by field. On Windows you have to enable the display of File name extensions in Explorer and rename `.pem` files to `.crt` to be able to open them:

Windows:
![](screenshots/windows-crt-2.png)

MacOS:
![](screenshots/mac3-2.png)

Linux:
![](screenshots/lin1-2.png)

Next copy and paste the name of the issuer and do a Google search for it to obtain the certificate file of the issuer. In this example `DigiCert TLS RSA SHA256 2020 CA1`:

![](screenshots/google1.png)

On the page of the CA you then search for `DigiCert TLS RSA SHA256 2020 CA1` and click download PEM:

![](screenshots/digicert1.png)

Then you open the downloaded file on your computer and verify the identity/issued to field and make sure it indeed matches `DigiCert TLS RSA SHA256 2020 CA1` exactly. Some CA's do not list their certificates as nice on their website, in which case you will have to ask your CA for the correct certificate file or download all certificate files that you can find until you find the correct one.

Windows:
![](screenshots/win2.png)

Linux:
![](screenshots/lin2.png)

Next step, take a look at the Issued by/Verified by field

Windows:
![](screenshots/win2-2.png)

Linux:
![](screenshots/lin2-2.png)

Search for the issuer in this example `DigiCert Global Root CA` just as before:

![](screenshots/digicert2.png)

Then you open the downloaded file on your computer and verify the identity/issued to field and make sure it indeed matches `DigiCert Global Root CA` exactly.

Linux:
![](screenshots/lin3.png)

Usually when you reach the point where you see the Root-keyword in the certificate it means you have downloaded enough certificates to start and deploy it on Zimbra. It is also a good idea to copy the URL's of the downloaded certificate files. You can use the URL's so you can script or download them via the command line on your Zimbra server. To find the URL, right click on the link of the certificate and select Copy link address:

![](screenshots/copy-link.png)

The final step is to obtain all the certificate files from Digicert and place them in a folder `/tmp/digicert` on your Zimbra server. Then create `commercial_ca.crt` as described below and verify and deploy:

```
su zimbra
mkdir /tmp/digicert
cd  /tmp/digicert
wget https://cacerts.digicert.com/DigiCertTLSRSASHA2562020CA1-1.crt.pem
wget https://cacerts.digicert.com/DigiCertGlobalRootCA.crt.pem
cat DigiCertTLSRSASHA2562020CA1-1.crt.pem > commercial_ca.crt
cat DigiCertGlobalRootCA.crt.pem >> commercial_ca.crt 

cp example.com.key /opt/zimbra/ssl/zimbra/commercial/commercial.key

zmcertmgr verifycrt comm /opt/zimbra/ssl/zimbra/commercial/commercial.key /tmp/digicert/example.com.crt /tmp/digicert/commercial_ca.crt 

** Verifying '/tmp/digicert/example.com.crt' against '/opt/zimbra/ssl/zimbra/commercial/commercial.key'
Certificate '/tmp/digicert/example.com.crt' and private key '/opt/zimbra/ssl/zimbra/commercial/commercial.key' match.
** Verifying '/tmp/digicert/example.com.crt' against '/tmp/digicert/commercial_ca.crt'
Valid certificate chain: /tmp/digicert/example.com.crt: OK

# Do not run `zmcertmgr deploycrt` in case the above command ended with a failure!

zmcertmgr deploycrt comm /tmp/digicert/example.com.crt /tmp/digicert/commercial_ca.crt

# to load the changes:
zmcontrol restart
```

## Troubleshooting

In case the `zmcertmgr verifycrt` command still completes with errors such as:

```
ERROR: Unable to validate certificate chain: C = US, ST = New York, L = Buffalo, O = "Zimbra Software, LLC", CN = *.example.com
error 20 at 0 depth lookup: unable to get local issuer certificate
error /tmp/digicert/example.com.crt: verification failed

```

You have to find out if the root certificate used by your CA is indeed trusted by Zimbra. You can find all the trusted root certificates using these commands:

```
/opt/zimbra/common/bin/keytool -list -v -keystore /opt/zimbra/common/etc/java/cacerts

/opt/zimbra/common/bin/keytool -list -v -keystore /opt/zimbra/common/etc/java/cacerts | grep "DigiCert Global Root CA"

/opt/zimbra/common/bin/keytool -list -v -keystore /opt/zimbra/common/etc/java/cacerts | grep "DigiCert Global Root CA" -C 10
```

Next step, ask your CA to sign your certificate with a root certificate that is trusted by Zimbra, use a different CA. Or final option that never works import your CA's root certificate in Zimbra: https://wiki.zimbra.com/wiki/Adding_external_CA_to_Zimbra_keystore

## Further reading

- https://www.thesslstore.com/knowledgebase/ssl-support/explaining-the-chain-of-trust/
- https://en.wikipedia.org/wiki/Chain_of_trust
- https://opensource.com/article/19/11/internet-security-tls-ssl-certificate-authority
