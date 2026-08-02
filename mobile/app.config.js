const appJson = require('./app.json');

/** Expo 계정에 연결된 EAS 프로젝트 (@fezoo/yakmuk) — 시크릿 아님 */
const LINKED_EAS_PROJECT_ID = 'caacddee-a434-402f-ad91-74114dba43d8';

/**
 * EAS projectId 우선순위:
 * 1) EXPO_PUBLIC_EAS_PROJECT_ID / EAS_PROJECT_ID
 * 2) 링크된 기본값 (eas init --force)
 */
module.exports = () => {
  const projectId =
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    process.env.EAS_PROJECT_ID ||
    LINKED_EAS_PROJECT_ID;

  return {
    ...appJson,
    extra: {
      ...(appJson.extra ?? {}),
      eas: {
        ...(appJson.extra?.eas ?? {}),
        projectId,
      },
    },
  };
};
