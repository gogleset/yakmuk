const { withProjectBuildGradle } = require('expo/config-plugins');

const MAVEN_SNIPPET = `    maven { url "$rootDir/../node_modules/@notifee/react-native/android/libs" }`;

/**
 * Notifee `app.notifee:core`는 로컬 libs maven에만 있음.
 * Expo allprojects 해석 전에 repo가 없으면 assemble이 실패하므로 root build.gradle에 주입.
 */
function withNotifeeMaven(config) {
  return withProjectBuildGradle(config, (mod) => {
    if (mod.modResults.language !== 'groovy') return mod;
    const contents = mod.modResults.contents;
    if (contents.includes('@notifee/react-native/android/libs')) {
      return mod;
    }

    // allprojects.repositories 블록 안에 삽입
    const next = contents.replace(
      /allprojects\s*\{\s*repositories\s*\{/,
      (match) => `${match}\n${MAVEN_SNIPPET}`,
    );

    if (next === contents) {
      throw new Error(
        '[withNotifeeMaven] allprojects.repositories 블록을 찾지 못함 — Expo 템플릿 변경 확인',
      );
    }

    mod.modResults.contents = next;
    return mod;
  });
}

module.exports = withNotifeeMaven;
