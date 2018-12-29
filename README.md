# Hermes Desktop
Desktop applications of [Hermes Messenger](https://github.com/HermesMessenger/Hermes) created using Electron.

## Installation

You can either compile the code yourself, or you can also download pre-compiled binaries of the app from [the releases page](https://github.com/HermesMessenger/HermesDesktop/releases). We have binaries for Windows, Mac OS and Linux. 

### Windows & Mac OS

Download the corresponding installer and run it, just like if you were installing any other program. 

**Note:** The installers are not signed (we don't have a certificate for it), so you may get some security warnings when running it. However, the code is perfectly safe (you can look at the code yourself, it's all saved in this repo). 

### Linux

The file in the releases page is an executable, so you just have to download it, mark it as executable and run it.   
No installation is necessary, and all dependencies are packed into the file. 

---

## Testing
To run the app locally, use:
```bash
npm install && npm start
```
This will open a new window with the program. 

## Build

We have Travis CI set up to automatically compile the app after each commit, but if you want you can do this yourself. 

To create binaries for your operating system, use:
```bash
npm run build
```

To create binaries for a specific operating system, use:
```bash
npm run build-win
npm run build-osx
npm run build-linux  
```

To create binaries for all operating systems, use:
```bash
npm run build-all
```
The newly created binaries will be inside the `dist/` folder. 

**NOTE:** Mac OS binaries can only be built on that operating system, and `npm run build-all` will error out if running on a different OS. You can use `npm run build-winlinux` to skip the Mac OS builds and only create them for Windows and Linux.
