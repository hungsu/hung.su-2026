---
title: 'My experience with Ubuntu in 2020'
description: 'A retrospective on the month I spent running Ubuntu 18.04 as my daily driver, what I loved about it, and why I ultimately went back to Windows.'
pubDate: '2025-09-25'
---

On 2020-November-10, I installed Ubuntu 18.04 on my computer. As of 2021-January-01, I've decided to retire it, though I did enjoy the experiment.

## Things I liked and will miss

1. Linux window management is excellent, marvelous even. By combining GNOME with PaperWM, I've no need for multiple monitors at all. MacOS and Windows application management that floats and overlaps windows by default feels prehistoric and wrong. I miss this so much that I will be looking into writing something similar for Windows.
2. It runs entirely off a USB drive! Windows absolutely refused to be installed on a USB drive.
3. No forced updates. Windows is notorious for forcing updates even during user activity. Under Linux I can rest well knowing that updates are fully under my control.
4. I like the lack of bloatware. I really don't appreciate the default installation of Cortana, Candy Crush and many other rubbish apps in Windows.
5. Far fewer notifications. Windows seems to come with a lot of nonsense notifications, such as
   - use Microsoft Edge
   - use Onedrive
   - do a virus scan
6. Some of my development work is faster. Namely, builds and fetches.

## Things that gave me trouble, but are not deal breakers

1. Audio didn't work quite right out of the box. I have a Dual Shock 4 controller with a 3.5mm headphone jack I often use, and Linux wouldn't use it at first. Once I installed PulseAudio Volume Control I was able to set output to what I wanted, but this introduced another problem of noticeable audio delay in games, which took another config tweak. Windows audio device management is much easier and had none of these issues.
2. Gamepad setup was fussy. I had some trouble using my Dualshock 4 in games. Some Googling and shell commands got things working, but this wasn't necessary in Windows. Many others have reported that this works out of the box for them, so I seem to be an outlier. But this was my experience nonetheless.
3. Installing apps. In Windows I knew the default location to be `Program Files` on the drive with Windows on it, C:. In MacOS, I knew this to be in `Applications`. For Linux, apparently, the [best practice](https://askubuntu.com/questions/1148/when-installing-user-applications-where-do-best-practices-suggest-they-be-loc) is the `/opt` folder
4. In Windows I use F13 and F14 keys for Push-To-Talk and Toggle Voice Activation. In Linux, these are registered as UNK191 and UNK192. UNK191 also seems to be called the "Tools" key.
5. Screenshot tools. After some fiddling I realised Ubuntu's native GNOME screenshot tool can be bound to my desired shortcut, `Alt`+`Shift`+`$`.
6. App formats, app stores and app repositories. I still do not know the difference between a snap, an app image or flat pak.

## Things that forced me back to Windows

1. Some Windows apps and games either don't have a Linux substitute, or don't run in Linux. So far I have tried and failed to run these or find substitutes:
   - AirExplorer
   - Adobe suite, though people have had success running them in [WinApps](https://github.com/Fmstrat/winapps)
   - Many many games, including but not limited to
     - Destiny 2, which works with Geforce NOW but has too much latency
     - EA Games, such as Star Wars Fallen Order
     - Epic Games exclusives, such as Fortnite and the Pathless
     - [Vermintide 2](https://www.protondb.com/app/552500)
     - The Witcher 3, which I can still play with Geforce NOW, with lag. See my experience with Game streaming
   - Popular benchmarking software, including
     - Cinebench
     - Crystaldiskmark
     - Userbenchmark
   - The NVDA screen reader, and Internet Explorer
   - Virtual Reality. My headset is Windows Mixed Reality which makes things even more difficult.
   - My keyboard (GK68XS) app. The keyboard still works, but programming it requires the Windows app.
2. Emoji picking is just crap. The GNOME emoji picker only works on GTK apps, but the apps where I want emoji are web or electron apps, such as Twitter, Slack or Discord.
3. Screensharing is a bit iffy. Doing so results in all my monitors shared as a single monitor. I ended up removing my extra monitors.
4. [Cyberpunk 2077 performs noticeably worse in Linux](https://www.protondb.com/app/1091500) by many accounts, including lower framerates and more frequent crashes.
5. Colour is very strange. Despite using the same monitor, colours look much much worse than when connected to Windows. Most notably, blues and purples.
6. Progressive Web Apps don't seem to work properly. I like having Youtube Music as a PWA, but under Ubuntu I must run it as a Chromium tab. Under Windows, I can open the start menu, type "yout" and open Youtube Music seamlessly.
7. Linux seems unable to sleep my computer - cold boots only.

## Verdict

I cannot use Linux as my primary OS. But I will very happily use Linux on my home server that doesn't need games or media playback.

## Some other interesting people and their Linux experiences

https://monadical.com/posts/moving-to-linux-desktop.html
