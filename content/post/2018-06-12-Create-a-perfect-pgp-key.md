+++
title = "Create a perfect pgp key"
description = "Some aggregate notes about creating a pgp key"
tags = [
    "linux",
    "security",
    "pgp",
]
date = 2018-06-12
categories = [
    "Linux",
    "Security",
]
+++

Maybe I already said that I'm a big fan of pass. A small unix tool (bash-script) for managing passwords with a pgp-key. In this note I collected some introductions for a best practise.

<p style="font-weight:bold;color:yellow">I'm not a profession or a security expert. All this information are for my own use.</p>

The goals in this post are create a pgp master key with multiple id and a subkey.

### GPG config
At first, some gpg config stuff here. <sup>[1]</sup>  
Update your `~/.gnupg/gpg.conf` and kill your actually running gpg-agent `killall gpg-agent`
```
# Avoid information leaked
no-emit-version
no-comments
export-options export-minimal

# Displays the long format of the ID of the keys and their fingerprints
keyid-format 0xlong
with-fingerprint

# Displays the validity of the keys
list-options show-uid-validity
verify-options show-uid-validity

# Limits the algorithms used
personal-cipher-preferences AES256
personal-digest-preferences SHA512
default-preference-list SHA512 SHA384 SHA256 RIPEMD160 AES256 TWOFISH BLOWFISH ZLIB BZIP2 ZIP Uncompressed

cipher-algo AES256
digest-algo SHA512
cert-digest-algo SHA512
compress-algo ZLIB

disable-cipher-algo 3DES
weak-digest SHA1

s2k-cipher-algo AES256
s2k-digest-algo SHA512
s2k-mode 3
s2k-count 65011712
```

### Create pgp key
Create a master pgp key:
```
$ gpg --expert --full-gen-key
```
Chose the ECC Nist P-256 algorithm without expiration and only certify action for the master key.
```
[...]
  (11) ECC (set your own capabilities)
  (13) Existing key
Your selection? 11

Possible actions for a ECDSA/EdDSA key: Sign Certify Authenticate
Current allowed actions: Certify

   (S) Toggle the sign capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? q
Please select which elliptic curve you want:
   (1) Curve 25519
   (3) NIST P-256
[...]
Your selection? 3
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 0
Key does not expire at all
Is this correct? (y/N) y
```
Input your personal information for the key creation process.
```
GnuPG needs to construct a user ID to identify your key.

Real name: Dimitrij Vogt
Email address: mail@dima23.de
Comment: master
You selected this USER-ID:
    "Dimitrij Vogt (master) <mail@dima23.de>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
[...]
```
Add an another uid (email address) to your key.<sup>[4]</sup>
```
 $ gpg --edit-key mail@dima23.de
```

```
[...]
gpg> adduid
[...]
gpg> save
```
To change you primary uid of your key, follow this commands in edit mode:
```
[...]
gpg> uuid 2
[...]
gpg> primary
[...]
gpg> save
```

### Add subkey
Add a subkey to your master key for some security approaches. Add a subkey for every action like authenticate, encrypt and so on. 
```
gpg> addkey
```

### Sign new key with old key
```
 $ gpg --default-key <old-key-id> --sign-key <new-key-id>
```
```
[...]
Really sign? (y/N) y
[...]
```

### Create a revocation
A revocation is import, if you lost some of your keys.
```
 $ gpg --output mail@dima23.de.gpg-revocation --gen-revoke mail@dima23.de
```

### Export your keys
Export your public and priavte keys and protect them togehter with the revocation key on a safe place.
```
 $ gpg --export-secret-keys --armor mail@dima23.de > mail@dima23.de.private.gpg-key
 $ gpg --export-keys --armor mail@dima23.de > mail@dima23.de.public.gpg-key
 ```
### Export to another device
If want to use some of the subkeys on another devices, you have to remove the master private before. Thats a little bit tricky, if you want to do it securly. Alex Cabal<sup>[1]</sup> have a good approach to do it, with a temporary mounted ram folder.
```
 $ mkdir /tmp/gpg
 $ sudo mount -t ramfs -o size=1M ramfs /tmp/gpg
 $ sudo chown $(logname):$(logname) /tmp/gpg
 $ gpg --export-secret-subkeys mail@dima23.de > /tmp/gpg/subkeys
```
Delete the signing key from the keypair:
```
 $ gpg --delete-secret-key mail@dima23.de
```
Re-import the subkeys back to gpg from tmp:
```
 $ gpg --import /tmp/gpg/subkeys
```
Remeber to remove the temporary dir:
```
 $ sudo umount /tmp/gpg
 $ rm -rf /tmp/gpg
```
After import the subkeys and list the secret keys, your key is marked with a # cause the signing key is missed.
 
### Send key to key server
```
 $ gpg --keyserver pgp.mit.edu --send-key <new-key-id>
```

#### Sources

[1] [alex_cabal-the-perfect-gpg-keypair](https://alexcabal.com/creating-the-perfect-gpg-keypair/)  
[2] [OpenPGP-The almost perfect key pair](https://blog.eleven-labs.com/en/openpgp-almost-perfect-key-pair-part-1)  
[3] [rise_up-best_practise](https://riseup.net/ru/security/message-security/openpgp/best-practices)  
[4] [Ana Guerrero López](https://ekaia.org/blog/2009/05/10/creating-new-gpgkey/)
