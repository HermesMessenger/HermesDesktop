# Hermes Desktop
Desktop applications created using Electron

## Usage
To run the app, use:
```bash
npm install && npm start
```
This will open a new window with the program. 

## Build

To create binaries of the app, use:
```bash
npm run build-all
```
This creates prebuilt binaries in the `dist/` folder for all operating systems (Windows, Mac OS and Linux). 

NOTE: Mac OS binaries can only be built on that operating system. If you don't have a device running it, you can use `npm run build-winlinux` to skip creating the Mac OS builds and only create them for Windows and Linux.