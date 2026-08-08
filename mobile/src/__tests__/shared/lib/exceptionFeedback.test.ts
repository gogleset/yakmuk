import {
  __resetExceptionFeedbackHostForTests,
  dismissExceptionModal,
  presentExceptionModal,
  presentExceptionToast,
  registerExceptionFeedbackHost,
} from '@/shared/lib/exceptionFeedback';

describe('exceptionFeedback host', () => {
  afterEach(() => {
    __resetExceptionFeedbackHostForTests();
  });

  it('Provider 전 present는 no-op', () => {
    expect(() => presentExceptionModal('제목', '본문')).not.toThrow();
    expect(() => presentExceptionToast('토스트')).not.toThrow();
  });

  it('presentExceptionModal은 host.presentModal 호출', () => {
    const presentModal = jest.fn();
    registerExceptionFeedbackHost({
      presentModal,
      dismissModal: jest.fn(),
      presentToast: jest.fn(),
      dismissToast: jest.fn(),
      isModalVisible: () => false,
    });

    presentExceptionModal('실패', '네트워크를 확인해 주세요');
    expect(presentModal).toHaveBeenCalledWith({
      title: '실패',
      message: '네트워크를 확인해 주세요',
      onDismiss: undefined,
    });
  });

  it('presentExceptionModal onDismiss 전달', () => {
    const presentModal = jest.fn();
    const onDismiss = jest.fn();
    registerExceptionFeedbackHost({
      presentModal,
      dismissModal: jest.fn(),
      presentToast: jest.fn(),
      dismissToast: jest.fn(),
      isModalVisible: () => false,
    });

    presentExceptionModal('실패', '본문', onDismiss);
    expect(presentModal).toHaveBeenCalledWith({
      title: '실패',
      message: '본문',
      onDismiss,
    });
  });

  it('Modal 떠 있으면 presentExceptionToast drop', () => {
    const presentToast = jest.fn();
    registerExceptionFeedbackHost({
      presentModal: jest.fn(),
      dismissModal: jest.fn(),
      presentToast,
      dismissToast: jest.fn(),
      isModalVisible: () => true,
    });

    presentExceptionToast('가벼운 실패');
    expect(presentToast).not.toHaveBeenCalled();
  });

  it('Modal 없으면 presentExceptionToast 전달', () => {
    const presentToast = jest.fn();
    registerExceptionFeedbackHost({
      presentModal: jest.fn(),
      dismissModal: jest.fn(),
      presentToast,
      dismissToast: jest.fn(),
      isModalVisible: () => false,
    });

    presentExceptionToast('가벼운 실패', '알림');
    expect(presentToast).toHaveBeenCalledWith({
      message: '가벼운 실패',
      title: '알림',
    });
  });

  it('dismissExceptionModal은 host.dismissModal', () => {
    const dismissModal = jest.fn();
    registerExceptionFeedbackHost({
      presentModal: jest.fn(),
      dismissModal,
      presentToast: jest.fn(),
      dismissToast: jest.fn(),
      isModalVisible: () => true,
    });
    dismissExceptionModal();
    expect(dismissModal).toHaveBeenCalled();
  });
});
