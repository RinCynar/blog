---
title: HOW TO RECOVER ACCIDENTALLY DELETED PRE-INSTALLED APPLICATIONS(ADB)
date: 113-04-14
author: RinCynar
categories: [ IT,Android ]
tags: [ ADB,Android ]
---

Sometimes you want to use adb to delete some useless pre-installed applications on the phone. It's actually quite
simple, just execute the command like this:<br>
<br>
<img src="/assets/img/image/image@20240414h2rssdba00.png" alt="Examp1e" /> <br>
<br>
The actual removal command is

$ adb uninstall --user 0 <name of package>

However, what should I do if I find that I deleted it by mistake after deleting it? Of course, you can choose to reset
the phone and restore everything to factory settings easily, but this is not what we want.<br>
In fact, using adb can also easily restore accidentally deleted applications. You only need to execute the command

$ adb shell cmd package install-existing <name of package>

like this: <br>
<br>
<img src="/assets/img/image/image@20240414h2rssdba01.png" alt="Example" /> <br>
<br>
That's all, thanks for reading