import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';
import { MOTION } from '@/shared/constants';
import {
  type ExceptionModalPayload,
  type ExceptionToastPayload,
  registerExceptionFeedbackHost,
} from '@/shared/lib/exceptionFeedback';
import { ExceptionModal } from '@/shared/ui/composites/ExceptionModal';
import { ExceptionToast } from '@/shared/ui/composites/ExceptionToast';

type Props = { children: ReactNode };

/** Modal + Toast 루트 overlay 호스트 */
export function ExceptionFeedbackProvider({ children }: Props) {
  const [modal, setModal] = useState<ExceptionModalPayload | null>(null);
  const [toast, setToast] = useState<ExceptionToastPayload | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalVisibleRef = useRef(false);

  const clearToastTimer = useCallback(() => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
  }, []);

  const dismissModal = useCallback(() => {
    modalVisibleRef.current = false;
    setModal((current) => {
      const onDismiss = current?.onDismiss;
      if (onDismiss) {
        queueMicrotask(() => {
          try {
            onDismiss();
          } catch (e) {
            console.warn('[exceptionFeedback] onDismiss failed', e);
          }
        });
      }
      return null;
    });
  }, []);

  const dismissToast = useCallback(() => {
    clearToastTimer();
    setToast(null);
  }, [clearToastTimer]);

  const presentModal = useCallback(
    (payload: ExceptionModalPayload) => {
      clearToastTimer();
      setToast(null);
      modalVisibleRef.current = true;
      setModal(payload);
    },
    [clearToastTimer],
  );

  const presentToast = useCallback(
    (payload: ExceptionToastPayload) => {
      if (modalVisibleRef.current) return;
      clearToastTimer();
      setToast(payload);
      toastTimer.current = setTimeout(() => {
        setToast(null);
        toastTimer.current = null;
      }, MOTION.toastMs);
    },
    [clearToastTimer],
  );

  useEffect(() => {
    registerExceptionFeedbackHost({
      presentModal,
      dismissModal,
      presentToast,
      dismissToast,
      isModalVisible: () => modalVisibleRef.current,
    });
    return () => {
      clearToastTimer();
      registerExceptionFeedbackHost(null);
      modalVisibleRef.current = false;
    };
  }, [
    presentModal,
    dismissModal,
    presentToast,
    dismissToast,
    clearToastTimer,
  ]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      <ExceptionModal
        visible={modal != null}
        title={modal?.title ?? ''}
        message={modal?.message ?? ''}
        onDismiss={dismissModal}
      />
      <ExceptionToast
        visible={toast != null}
        message={toast?.message ?? ''}
        title={toast?.title}
        onDismiss={dismissToast}
      />
    </View>
  );
}
