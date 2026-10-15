# LaserFit : PWA vers APK (hors ligne, sans Play Store)

LaserFit est une application d'EPS (fitness en format Tabata alterné avec du tir laser) utilisée sur tablettes en gymnase, sans connexion internet.

Ce projet Android embarque la PWA **en local** (`app/src/main/assets/`) et l'affiche dans une **WebView** via `WebViewAssetLoader`, ce qui fournit une origine HTTPS (`https://appassets.androidplatform.net/`) compatible avec le Service Worker.

- **Version** : 2.3 (versionCode 5)
- **Version web** : https://apps.outils-eps.fr/epslaserfit/ (dépôt `msjeps/epslaserfit`)
- **Orientation** : portrait

## Fonctionnalités
- Mode **solo** (jusqu'à 5 observations archivées avant export) et mode **équipe** (relais) : une équipe par tablette (jusqu'à 8 tablettes en simultané) ou 2 à 4 équipes à tour de rôle sur une tablette
- **Gestion du mode équipes** (tablette enseignant) : nombre d'équipes (2 à 8) et couleurs, saisie ou **scan du QR** de chaque tablette, classement en **total** ou **moyenne par passage**
- Exercices de fitness avec barèmes de points adaptés à la durée, séries de tir laser à 3, 5 ou 8 m
- Chronomètre Tabata, compteurs de répétitions et de tirs, bips et vibrations
- Résultats, badges, classement de classe, graphique de progression du tir
- Export **CSV** (séparateur `;`, BOM UTF-8) et **QR code** (le scan des QR d'équipes utilise la caméra, uniquement pour lire, rien n'est enregistré)
- **Sauvegarde automatique** de la séance et reprise après interruption
- Panneau professeur protégé par mot de passe : barèmes des exercices, ajout d'exercices, exercices masqués du menu, points de tir
- Écran toujours allumé, mode immersif, confirmation avant de quitter une séance

## Structure
- `app/src/main/assets/index.html` (+ `manifest.json`, `sw.js`, `qrcode.min.js` pour générer, `jsqr.js` pour lire les QR, `icon_*.png`, `logo-outils-eps.png`)
- `app/src/main/assets/animations/*.gif` : démonstrations des exercices
- `app/src/main/java/fr/laserfit/app/MainActivity.kt` : charge `https://appassets.androidplatform.net/assets/index.html`

## Ouvrir et compiler (Android Studio)
1. Ouvrir le dossier **LaserFitAPK/** dans Android Studio.
2. Laisser Android Studio installer la version de Gradle/AGP demandée si besoin.
3. Brancher une tablette (mode développeur + débogage USB) ou lancer un émulateur.
4. **Run** pour tester (debug).

En ligne de commande :
```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./gradlew assembleDebug
```

## Générer un APK signé (installation sur les tablettes)
Android Studio :
1. `Build` > `Generate Signed Bundle / APK...`
2. Choisir **APK**
3. Sélectionner le **keystore** : toujours le même, sinon il faut désinstaller l'ancienne APK sur chaque tablette. En ligne de commande, `keystore.properties` (ignoré par git) y fait référence.
4. Choisir `release`

L'APK est générée dans `app/build/outputs/apk/release/` ; une copie nommée `LaserFit-X.Y-release.apk` est rangée dans `app/release/` (ignoré par git).

## Installation sur les tablettes
- Copier l'APK signé sur la tablette (USB, partage réseau...)
- Installer (autoriser les "sources inconnues" si nécessaire)

## Aide intégrée
La fenêtre « Aide » de l'application (Réglages) décrit les fonctionnalités, la sauvegarde et la reprise de séance, la configuration professeur et l'installation. Elle se modifie dans `index.html` (`aideModal`) et doit suivre les évolutions de l'app.

## Personnaliser
- Nom du package : `fr.laserfit.app` (voir `app/build.gradle`)
- Nom affiché : `app/src/main/res/values/strings.xml`
- Icône : `app/src/main/res/mipmap-*/ic_launcher.png`
- Version : `versionName` / `versionCode` dans `app/build.gradle` **et** le texte "Version X.Y" dans `index.html`

## Mise à jour de la version web
Les fichiers de `app/src/main/assets/` sont publiés tels quels dans le dépôt `msjeps/epslaserfit`. À chaque publication, incrémenter `CACHE_NAME` dans `sw.js` (cache du Service Worker), sinon les PWA installées conservent l'ancienne version.

## Hors ligne
Même sans réseau, l'application fonctionne : les fichiers sont dans l'APK. Le Service Worker n'est utilisé que pour la version web installée (il est désactivé dans l'APK).

## Données et confidentialité
Aucune donnée d'élève ne quitte la tablette. L'app n'a pas la permission INTERNET ; la permission caméra n'est demandée qu'au premier scan d'un QR d'équipe (vidéo seule, jamais le micro). Les sauvegardes Android sont désactivées (`allowBackup="false"`). Les réglages (barèmes, exercices ajoutés, mot de passe) sont propres à chaque tablette.
