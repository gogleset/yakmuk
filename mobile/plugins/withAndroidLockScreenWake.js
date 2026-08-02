const { withAndroidManifest } = require('expo/config-plugins');

/**
 * 복약 FSI — 화면 꺼짐/잠금에서도 Activity가 켜지려면
 * MainActivity에 showWhenLocked + turnScreenOn 필요 (Notifee docs).
 */
function withAndroidLockScreenWake(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    const application = manifest.application?.[0];
    if (!application?.activity) return mod;

    const mainActivity = application.activity.find((activity) => {
      const name = activity.$?.['android:name'];
      return name === '.MainActivity' || name?.endsWith('.MainActivity');
    });

    if (!mainActivity?.$) {
      throw new Error(
        '[withAndroidLockScreenWake] MainActivity를 AndroidManifest에서 찾지 못함',
      );
    }

    mainActivity.$['android:showWhenLocked'] = 'true';
    mainActivity.$['android:turnScreenOn'] = 'true';
    return mod;
  });
}

module.exports = withAndroidLockScreenWake;
