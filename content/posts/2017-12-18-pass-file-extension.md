+++
title = "Passwordstore extension: pass-file"
description = "A pass extension that apply some file functions"
tags = [
    "pass",
    "security",
    "gpg",
    "password-store",
]
date = "2017-12-18"
categories = [
    "unix",
]
type = 'posts'
+++

I am a big fan of the unix [password-store](https://www.passwordstore.org), one of that which I used every day. And the best of it, thats only a bash script.

After some years of using keepass in a Dropbox and a keyfile on usb storage, I find this some little tool. It's absolutly perfect, cause I am a big fan of CLI apps, too :). On the mobile way I use the open source [app](https://github.com/mssun/passforios) for iOS, thats a really good addition.

## TL;DR
The `pass-file` extension apply some file functions to the pass app as an extension. To install this extension, you have to clone the `pass-file` repository and run the `make` script.

```
git clone https://github.com/dvogt23/pass-file/
cd pass-file
sudo make install
```

If you have i.e. a ssh key that you would have in your password-store, you could add it with `pass file add id_rsa MyServer/ssh-key`.

All other informations about this extension are listed in the `man pass-file` page.
