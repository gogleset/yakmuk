const { withAndroidManifest, withDangerousMod, createRunOncePlugin } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const TAG = 'withAndroidAlarmFsi';

/**
 * AlarmFullScreenActivity + AlarmReceiver 파일/매니페스트.
 * setAlarmClock → Receiver → 화면깨움 + FSI Activity.
 */
function withAlarmFsiFiles(config) {
  return withDangerousMod(config, [
    'android',
    async (mod) => {
      const dir = path.join(
        mod.modRequest.platformProjectRoot,
        'app/src/main/java/com/jinlabs/yakok',
      );
      fs.mkdirSync(dir, { recursive: true });

      const nativeDir = path.join(mod.modRequest.projectRoot, 'plugins/native');
      for (const name of [
        'AlarmFullScreenActivity.kt',
        'AlarmReceiver.kt',
      ]) {
        const fromProject = path.join(dir, name);
        const fromPlugin = path.join(nativeDir, name);
        const from =
          fs.existsSync(fromProject) ? fromProject :
          fs.existsSync(fromPlugin) ? fromPlugin : null;
        if (from) {
          fs.copyFileSync(from, path.join(dir, name));
        }
      }
      return mod;
    },
  ]);
}

function withAlarmFsiManifest(config) {
  return withAndroidManifest(config, (mod) => {
    const application = mod.modResults.manifest.application?.[0];
    if (!application) return mod;
    if (!application.activity) application.activity = [];
    if (!application.receiver) application.receiver = [];

    const hasActivity = application.activity.some((a) => {
      const name = a.$?.['android:name'];
      return (
        name === '.AlarmFullScreenActivity' ||
        name?.endsWith('.AlarmFullScreenActivity')
      );
    });
    if (!hasActivity) {
      application.activity.push({
        $: {
          'android:name': '.AlarmFullScreenActivity',
          'android:excludeFromRecents': 'true',
          'android:exported': 'true',
          'android:launchMode': 'singleInstance',
          'android:showWhenLocked': 'true',
          'android:turnScreenOn': 'true',
          'android:taskAffinity': '',
          'android:theme': '@style/Theme.App.SplashScreen',
        },
      });
    }

    const hasReceiver = application.receiver.some((r) => {
      const name = r.$?.['android:name'];
      return name === '.AlarmReceiver' || name?.endsWith('.AlarmReceiver');
    });
    if (!hasReceiver) {
      application.receiver.push({
        $: {
          'android:name': '.AlarmReceiver',
          'android:enabled': 'true',
          'android:exported': 'false',
        },
      });
    }

    return mod;
  });
}

function withAndroidAlarmFsi(config) {
  config = withAlarmFsiFiles(config);
  config = withAlarmFsiManifest(config);
  return config;
}

module.exports = createRunOncePlugin(withAndroidAlarmFsi, TAG, '1.1.1');
