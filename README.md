# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

# Learn more

## Video processing

Export transparent video on chroma-key
ffmpeg -i input_greenscreen.mp4 -vf "chromakey=0x248C1E:0.06:0.1,format=yuva420p" -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 -an output_android.webm
ffmpeg -i input_greenscreen.mp4 -vf "chromakey=0x248C1E:0.06:0.1" -c:v prores_ks -profile:v 4 -pix_fmt yuva444p10le output_ios.mov

Export a video into a PNG sequence:
ffmpeg -c:v libvpx-vp9 -i test.webm -vf "crop=720:1200:0:0,fps=12" -pix_fmt rgba frames/frame_%04d.png
