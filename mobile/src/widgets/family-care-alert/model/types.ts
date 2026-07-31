export type CareAlertTone = 'stuck' | 'bad';

export type CareAlertSlide = {
  id: string;
  tone: CareAlertTone;
  title: string;
  body: string;
  /** 실 alerts 연동 시 FamilyAlert.id. mock은 null */
  alertId?: string | null;
};
