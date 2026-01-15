# Year Progress

A React application tracking year progress, available as a Web App and Android App.

## Prerequisites

-   **Node.js**: v18+ recommended (v20 used in CI).
-   **Java JDK**: v17 (Required for Android build).
-   **Android Studio**: For local Android development and SDK management.

## Project Structure

-   `src/` - React application source code (located in root).
-   `android/` - Android project (Capacitor).
-   `dist/` - Compiled web assets (generated).
-   `components/` - React components.

## Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## Building for Web

To build the production web assets:

```bash
npm run build
```

Assets will be generated in the `dist` directory.

## Building for Android

1.  **Sync Web Assets:**
    Ensure you have built the web app first.
    ```bash
    npm run build
    npx cap sync android
    ```

2.  **Build APK:**
    
    *Mac/Linux:*
    ```bash
    cd android
    ./gradlew assembleDebug
    ```
    
    *Windows:*
    ```bash
    cd android
    .\gradlew.bat assembleDebug
    ```

    The APK will be located at:  
    `android/app/build/outputs/apk/debug/app-debug.apk`

3.  **Run in Android Studio:**
    ```bash
    npx cap open android
    ```

## Development Notes

-   **Styling:** Uses Tailwind CSS.
-   **Widget:** Includes a custom Android Widget written in Kotlin (`YearProgressWidget.kt`).

## Troubleshooting

-   **"index.css not found"**: This file is not required; ensure `index.html` does not reference it.
-   **"Java not found"**: Ensure `JAVA_HOME` is set to a valid JDK 17 installation.
