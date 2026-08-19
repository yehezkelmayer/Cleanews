/**
 * Single source of truth for the Hebrew UI copy.
 * Edit here to change wording anywhere in the app.
 * IDs match the approved copy sheet (T1–T45).
 */
export const copy = {
  // Wizard — welcome
  wizardBrand: 'ברוכים הבאים ל-Cleanews',                                    // T1
  wizardIntro:
    'קורא חדשות אישי שמציג רק טקסט — בלי תמונות, בלי פרסומות. שלושה שלבים מהירים ואתם שם.', // T2
  wizardStartBtn: 'נתחיל?',                                                    // T3
  wizardSkipToFeed: 'דלגו ועברו ישר לפיד',                                    // T4

  // Wizard — step 1
  step1Kicker: 'שלב 1 מתוך 3',                                                // T5
  step1Title: 'בחרו מאיפה לקבל חדשות',                                        // T6
  step1Body:
    'אלה האתרים וערוצי הטלגרם ש-Cleanews ימשוך מהם כתבות עבורכם. מומלץ להתחיל עם 3–5 מקורות; תמיד אפשר להוסיף או להסיר.', // T7
  next: 'המשך →',                                                              // T8
  skipStep: 'דלג',                                                             // T9

  // Wizard — step 2
  step2Kicker: 'שלב 2 מתוך 3',                                                // T10
  step2Title: 'מה מעניין אתכם?',                                              // T11
  step2Body:
    'הנושאים שתבחרו יסייעו ל-Cleanews לסמן ולסדר עבורכם את הכתבות הרלוונטיות.', // T12
  back: '← חזרה',                                                              // T13

  // Wizard — step 3
  step3Kicker: 'שלב 3 מתוך 3',                                                // T14
  step3Title: 'הגדירו את הפיד',                                                // T15
  step3Body: 'כמה העדפות ואפשר להתחיל לקרוא.',                                 // T16
  prefShowLabel: 'הצגת כתבות',                                                 // T17
  prefSortLabel: 'מיון ברירת מחדל',                                            // T18
  prefAgeLabel: 'גיל כתבה מרבי',                                               // T19
  wizardFinishBtn: 'סיום — קחו אותי לפיד ✓',                                   // T20
  wizardDoneToast: '✓ הכל מוכן. הפיד שלכם מציג עכשיו את מה שביקשתם.',          // T21

  // Settings
  settingsTitle: 'הגדרות',                                                     // T22
  settingsSubtitle:
    'כל מה שנוגע למקורות, לנושאים ולתצוגת הפיד. שינויים נשמרים אוטומטית.',      // T23
  fetchSectionTitle: 'משיכת חדשות',                                            // T24
  fetchSectionBody:
    'החדשות מתעדכנות אוטומטית ברקע בכל 30 דקות. בכפתור למטה תוכלו לבצע משיכה מיידית של המקורות שלכם.', // T25
  sourcesSectionTitle: 'מקורות',                                               // T26
  sourcesSectionBody:
    'האתרים והערוצים ש-Cleanews ימשוך מהם כתבות. הוסיפו מהקטלוג המוכן, הוסיפו ערוץ טלגרם, או הזינו RSS ידנית.', // T27
  topicsSectionTitle: 'נושאים',                                                // T28
  topicsSectionBody:
    'נושאים מסמנים ומסדרים עבורכם את הכתבות הרלוונטיות. "מילות מפתח" הן המילים שנחפש בכל כתבה — בעברית ובאנגלית — כדי לזהות התאמה.', // T29
  prefsSectionTitle: 'העדפות פיד',                                             // T30
  prefsSectionBody:
    'ההעדפה הכללית של הפיד. חיפוש, מיון וסינון נושאים זמינים תמיד ישירות בסרגל שמעל הפיד.', // T31

  // Empty feed
  emptyKicker: 'ברוכים הבאים ל-Cleanews',                                     // T32
  emptyTitle: 'התאמה אישית של הפיד',                                          // T33
  emptyBody:
    'בחרו מקורות ונושאים — והפיד יתאים את עצמו למקורות ותחומי העניין שלכם.',    // T34
  emptyCta: 'בחרו מקורות ונושאים →',                                          // T35
  emptySampleLabel: 'כתבות אחרונות',                                          // T37

  // Toasts
  toastSourcesAdded: (n: number) => `נוספו ${n} מקורות`,                       // T38
  toastFetchDone: 'הכל מוכן 🎉',                                              // T39
  toastFetchWithErrors: (n: number, e: number) => `הצליחו ${n} כתבות · ${e} שגיאות`, // T40

  // Button labels
  addFromCatalog: 'בחירת מקורות מהקטלוג',                                     // T41
  addManualRss: 'הוספת RSS ידני',                                             // T42
  addTopicsFromCatalog: 'בחירת נושאים מהקטלוג',                               // T43
  addCustomTopic: 'יצירת נושא מותאם אישית',                                    // T44
  restartWizard: 'הרצת אשף התחלה מחדש',                                        // T45

  // Extras (kept for parity with existing UI)
  addTelegramChannel: 'הוספת ערוץ טלגרם',
  fetchNowBtn: 'משיכת חדשות עכשיו',
  fetchingBtn: 'מושך…',
  saveBtn: 'שמירה',
  deleteBtn: 'מחיקה',
  enableOn: 'מופעל',
  enableOff: 'מושבת',
  sortNewest: 'החדש ביותר',
  sortRelevance: 'רלוונטיות',
  onlyMatching: 'תואם לנושאים',
  onlyAll: 'הכל',
  age24: '24 שעות',
  age72: '3 ימים',
  age168: '7 ימים',
};
