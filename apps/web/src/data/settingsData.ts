import { AppearanceIcon } from "../icons/AppearanceIcon";
import { GoalIcon } from "../icons/GoalIcon";
import { LanguageIcon } from "../icons/LanguageIcon";
import { NotificationIcon } from "../icons/NotificationIcon";
import { PrivacyIcon } from "../icons/PrivacyIcon";
import { SecurityIcon } from "../icons/SecurityIcon";
// import { SettingsProfileIcon } from "../icons/SettingsProfileIcon";
import { SubscriptionIcon } from "../icons/SubscriptionIcon";


export const settingsConfig = [
  // {
  //   "icon": SettingsProfileIcon,
  //   "bg": "bg-emerald-50",
  //   "title": "Профіль",
  //   "subTitle": "Ім'я, фото, особисті дані",
  //   "link": "/settings/profile",
  //   "i18nKey": "profile"
  // },
  {
    "icon": NotificationIcon,
    "bg": "bg-violet-50",
    "title": "Сповіщення",
    "subTitle": "Push-сповіщення та email",
    "link": "/settings/notifications",
    "i18nKey": "notifications"
  },
  {
    "icon": LanguageIcon,
    "bg": "bg-sky-50",
    "title": "Мова інтерфейсу",
    "subTitle": "Українська",
    "link": "/settings/language",
    "i18nKey": "language"
  },
  {
    "icon": GoalIcon,
    "bg": "bg-orange-50",
    "title": "Ціль навчання",
    "subTitle": "30 хвилин на день",
    "link": "/settings/goals",
    "i18nKey": "goal"
  },
  {
    "icon": SecurityIcon,
    "bg": "bg-rose-50",
    "title": "Безпека",
    "subTitle": "Пароль та двофакторна автентифікація",
    "link": "/settings/security",
    "i18nKey": "security"
  },
  {
    "icon": AppearanceIcon,
    "bg": "bg-teal-50",
    "title": "Зовнішній вигляд",
    "subTitle": "Світла тема",
    "link": "/settings/theme",
    "i18nKey": "theme"
  },
  {
    "icon": PrivacyIcon,
    "bg": "bg-slate-50",
    "title": "Конфіденційність",
    "subTitle": "Політика та умови",
    "link": "/settings/privacy",
    "i18nKey": "privacy"
  },
  {
    "icon": SubscriptionIcon,
    "bg": "bg-amber-50",
    "title": "Підписка",
    "subTitle": "Безкоштовний план",
    "link": "/settings/subscription",
    "i18nKey": "subscription"
  }
]