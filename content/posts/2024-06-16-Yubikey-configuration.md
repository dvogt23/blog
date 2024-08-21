+++
title = "Yubikey - rule them all"
description = "Make your life secure with a hardware key"
tags = [
    "security",
    "privacy",
    "yubikey",
]
date = "2024-06-18"
categories = [
    "Security",
]
+++


Finally I have one(two cause of backup) Yubikey 5 NFC and FINALLY I took the time to dig deeper into private security.

Here I will provide long story short summary about my learnings and a quick howto.

1. Download [tails](https://tails.net) image to USB and boot it
2. Create secure passphrase with this commands, or with helper like
   [passphrase.html](https://raw.githubusercontent.com/drduh/YubiKey-Guide/master/passphrase.html) or [passphrase.csv](https://raw.githubusercontent.com/drduh/YubiKey-Guide/master/passphrase.csv) after print
   `lp -d Printer-Name passphrase.csv` or with [Dicewire](https://secure.research.vt.edu/diceware)
   ```
   CERTIFY_PASS=$(LC_ALL=C tr -dc 'A-Z1-9' < /dev/urandom | \
   tr -d "1IOS5U" | fold -w 30 | sed "-es/./ /"{1..26..5} | \
   cut -c2- | tr " " "-" | head -1) ; echo "$CERTIFY_PASS"
   ```
   Write them down on a paper, your PINs included and a backup flash drive with
   primary key and `GNUPGHOME` dir
3. Create a gpg key (`export GNUPGHOME=$(mktemp -d -t gnupg-$(date +%Y-%m-%d)-XXXXXXXXXX)`)
	1. `gpg --quick-gen-key 'Sample <please@dont-spam.us>' ed25519 cert never`
	2. Create subkeys
		1. `gpg --quick-add-key $KEYID ed25519 sign 2y`
		2. `gpg --quick-add-key $KEYID ed25519 auth 2y`
		3. `gpg --quick-add-key $KEYID cv25519 encrypt 2y`
	3. Export public key `gpg --export -a -o $KEYID.pub $KEYID`
	4. Backup secret keys
     ```
     gpg --output $KEYID-Certify.key --armor --export-secret-keys $KEYID
     gpg --output $KEYID-Subkeys.key --armor --export-secret-subkeys $KEYID
     ```
4. Configure yubikey
   1. Check status with `gpg --card-status`

   2. Create Admin & User PIN
      ```
        ADMIN_PIN=$(LC_ALL=C tr -dc '0-9' < /dev/urandom | fold -w8 | head -1)
        USER_PIN=$(LC_ALL=C tr -dc '0-9' < /dev/urandom | fold -w6 | head -1)
        printf "\nAdmin PIN: %12s\nUser PIN: %13s\n\n" "$ADMIN_PIN" "$USER_PIN"
      ```
   3. Set Admin PIN
      ```
        gpg --command-fd=0 --pinentry-mode=loopback --change-pin <<EOF
        3
        12345678
        $ADMIN_PIN
        $ADMIN_PIN
        q
        EOF
      ```
   4. Set User PIN
      ```
        gpg --command-fd=0 --pinentry-mode=loopback --change-pin <<EOF
        1
        123456
        $USER_PIN
        $USER_PIN
        q
        EOF
      ```
   5. Set attributes, URL is for the possibility to fetch pub key from keyserver
      if given.
      ```
        gpg --card-edit
        admin
        login
        name
        url
      ```
   6. Transfer subkeys 🔺 **copy your `$GNUPGHOME` dir before transfer**
      Make sure you have selected the right key, marked with *
      ```
        gpg --edit-key $KEYID
        key X
        keytocard
      ```
   7. Verify key transfer with `gpg -K`, each subkey should have `>` sign, means
      not in store. **TIP:** Create a new `GNUPGHOME` and import your private
      keys, to move them to a backup Yubikey as well.
   8. Upload public key to keyserver, but first set keyserver in your
      `$GNUPGHOME/gpg.conf` with `keyserver https://keys.openpgp.org`, than send
      with `gpg --send-key $KEYID` and verify your email. **TIP:** Set your
      public key url in your yubikey with `gpg --card-edit`
5. Using yubikey
   1. Import your public key `gpg --import public-key.asc`, or do `fetch` in
     `gpg --card-edit` if you set your url
   2. Trust this key with
      ```
        gpg --command-fd=0 --pinentry-mode=loopback --edit-key $KEYID <<EOF
        trust
        5
        y
        save
        EOF
      ```
   3. Set touch for yubikey actions
      ```
        ykman openpgp keys set-touch dec on
        ykman openpgp keys set-touch enc on
        ykman openpgp keys set-touch sig on
        ykman openpgp keys set-touch aut on
      ```
   4. Check your ssh public key with `ssh-add -L`, if you have some trouble,
      check [SSH section](https://github.com/drduh/YubiKey-Guide?tab=readme-ov-file#ssh)
   5. Secure your iCloud with your Yubikey (you need 2 of them)
      Go to settings in your iPhone, open your apple account, open security,
      2fa, than add your hardware keys.
   6. Secure your bitwarden 2FA with your key, open bitwarden (vaultwarden) on
      web, go to security, 2FA and add your keys at FIDO2/WebAuth


Sources:
- [Yubikey Guide](https://github.com/drduh/YubiKey-Guide)
- [Yubikey howto](https://yubikey.jms1.info)
