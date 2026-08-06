/**
 * Verbatim, fixed copy from docs/02-ETHICAL_CONSTITUTION.md - never
 * paraphrased, never regenerated per render. Single source so a future
 * edit to the constitution has exactly one place in code to update, and
 * so tests can assert exact-match rather than "looks about right."
 */

export const CONSENT_MODAL_COPY = {
  title: 'Tarot Nedir?',
  intro: 'Bu uygulama, sembolik düşünme ve iç reflection aracıdır.',
  notDoneHeading: 'YAPILMAZ:',
  notDone: ['Kesin kehanet', 'Tıbbi tavsiye', 'Hukuki tavsiye', 'Mali tavsiye'],
  howToUseHeading: 'NASIL KULLANILIR:',
  howToUse: [
    'Sorunuzu düşünün',
    'Kartları çekin',
    'Okumayı reflection için kullanın',
    'Önemli kararlar için profesyonellere danışın',
  ],
  checkboxLabel: 'Anlıyorum',
  acceptLabel: 'Devam Et',
  declineLabel: 'Çıkış',

  /**
   * H1 third-party AI disclosure. Before this, nothing in the product told a
   * user that the text they type leaves the application and is sent to an
   * external AI provider. Naming the provider is deliberate: "teknoloji
   * ortaklarımız" is exactly the vague phrasing this disclosure exists to
   * avoid. If the provider ever changes, this string changes with it - it is
   * the single source, asserted by test.
   */
  dataUseHeading: 'VERİLERİNİZ:',
  dataUse: [
    'Yazdığınız soru, yorumu oluşturmak için üçüncü taraf bir yapay zeka sağlayıcısına (Anthropic - Claude) gönderilir.',
    'Sorunuzun metni sunucu kayıtlarımıza yazılmaz.',
    'Okumalarınız hesabınızda saklanmaz; bu sürümde kayıt tutulmaz.',
  ],
  sensitiveDataNote:
    'Lütfen kimlik, iletişim, sağlık veya finansal bilgi gibi sizi tanımlayabilecek ayrıntıları yazmayın. Sorunuzu genel tutun.',
} as const;

export const RESULT_DISCLAIMER_COPY = {
  heading: 'Hatırlatma',
  body: 'Bu okuma sembolik bir perspektiftir.',
  professionalNote: 'Sağlık, hukuki, mali veya duygusal kriz için profesyonel destek alınız.',
  autonomyNote: 'Siz karar verirsiniz. Kartlar sadece ayna.',
} as const;
