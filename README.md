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
ffmpeg -i bad.mp4 -vf "chromakey=0x3E902B:0.06:0.1,format=yuva420p" -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 -an bad.webm

ffmpeg -i very_good_small.mp4 -vf "chromakey=0x369631:0.04:0.1,format=yuva420p" -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 -an very_good_out.webm
ffmpeg -i good_small.mp4 -vf "chromakey=0x4F9F3A:0.09:0.08,format=yuva420p" -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 -an good.webm
ffmpeg -i normal_small.mp4 -vf "chromakey=0x2A9D11:0.09:0.08,format=yuva420p" -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 -an normal.webm
ffmpeg -i bad_small.mp4 -vf "chromakey=0x388828:0.08:0.06,format=yuva420p" -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 -an bad.webm

Export a video into a PNG sequence:
ffmpeg -c:v libvpx-vp9 -i test.webm -vf "crop=720:1200:0:0,fps=12" -pix*fmt rgba frames/frame*%04d.png

Optimize a video
ffmpeg -i "metal.mp4" -vf "scale=-2:720,fps=24" -c:v libx264 -preset veryslow -crf 30 -profile:v high -level 4.0 -pix_fmt yuv420p -movflags +faststart -an "metal_small.mp4"

ffmpeg -i bad.mp4 -vf "chromakey=0xF8FBFA:0.03:0.1,format=yuva420p" -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 -an bad.webm
ffmpeg -i "bad.mp4" -vf "scale=-2:720,fps=24" -c:v libx264 -preset veryslow -crf 30 -profile:v high -level 4.0 -pix_fmt yuv420p -movflags +faststart -an "bad_sm.mp4"

## Play the video

ffplay -vcodec libvpx-vp9 -i input.webm -vf "format=yuva420p,drawgrid=w=40:h=40:t=1:c=gray@0.5"

## Rename images

Get-ChildItem -Filter "_\_\_\_\*.png" | ForEach-Object {
if ($_.Name -match '^[^_]+_(\d+)_([^\.]+)\.png$') {
    $newName = "$($Matches[2].ToLower())-$($Matches[1]).png"
Rename-Item -LiteralPath $\_.FullName -NewName $newName
}
}

Get-ChildItem -Filter "conclude-\*.png" | ForEach-Object {
if ($_.Name -match '^conclude-(\d+)\.png$') {
Rename-Item -LiteralPath $_.FullName -NewName "conclusion-$($Matches[1]).png"
}
}
