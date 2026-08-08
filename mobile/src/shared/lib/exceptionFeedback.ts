/** Imperative host for ExceptionModal / ExceptionToast — Provider가 등록 */

export type ExceptionModalPayload = {
  title: string;
  message: string;
  /** 확인/스크림 닫힌 뒤 한 번 호출 (예: Welcome으로 복귀) */
  onDismiss?: () => void;
};

export type ExceptionToastPayload = {
  message: string;
  title?: string;
};

type Host = {
  presentModal: (payload: ExceptionModalPayload) => void;
  dismissModal: () => void;
  presentToast: (payload: ExceptionToastPayload) => void;
  dismissToast: () => void;
  /** Modal이 떠 있으면 true — Toast drop 판단 */
  isModalVisible: () => boolean;
};

let host: Host | null = null;

export function registerExceptionFeedbackHost(next: Host | null): void {
  host = next;
}

export function presentExceptionModal(
  title: string,
  message: string,
  onDismiss?: () => void,
): void {
  if (!host) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(
        '[exceptionFeedback] presentExceptionModal before Provider mount',
      );
    }
    return;
  }
  host.presentModal({ title, message, onDismiss });
}

export function dismissExceptionModal(): void {
  host?.dismissModal();
}

export function presentExceptionToast(
  message: string,
  title?: string,
): void {
  if (!host) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(
        '[exceptionFeedback] presentExceptionToast before Provider mount',
      );
    }
    return;
  }
  if (host.isModalVisible()) return;
  host.presentToast({ message, title });
}

export function dismissExceptionToast(): void {
  host?.dismissToast();
}

/** 테스트용 — host 비우기 */
export function __resetExceptionFeedbackHostForTests(): void {
  host = null;
}
