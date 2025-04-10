export const ru = {
  // topnav - верхнее меню
  Search: 'Поиск',
  FullScreen: 'Полный экран',
  Refresh: 'Обновить',
  Back: 'Назад',
  Selected: 'выбрано',
  SelectedIncidents: 'инцидентов',
  SelectedWith: 'с',
  AlertsInside: 'алертами внутри',

  LogIn: 'Войти',
  LogOut: 'Выйти',
  SignUp: 'Регистрация',
  SignIn: 'Войти',

  // sidenav - боковое меню
  Alerts: 'Алерты',
  Heartbeats: 'Пульсы',
  Users: 'Пользователи',
  Groups: 'Группы',
  Customers: 'Клиенты',
  Blackouts: 'Отключения',
  Permissions: 'Разрешения',
  APIKeys: 'API ключи',
  Labels: 'Метки',
  Searches: 'Поиски',
  Reports: 'Отчёты',
  More: 'Больше',
  Settings: 'Настройки',
  Help: 'Помощь',
  About: 'О нас',

  // more - другое
  ChooseDisplayDensity: 'Выберите плотность отображения',
  DisplayDensity: 'Плотность отображения',
  Comfortable: 'Комфортно',
  Compact: 'Компактно',
  Panel: 'Панель',
  Hide: 'Скрыть',
  Show: 'Показать',
  DownloadAsCsv: 'Скачать как CSV',

  // Groups store
  UserAddedGroup: 'Пользователь добавлен в группу.',
  UserRemovedGroup: 'Пользователь удалён из группы.',

  // Preferences store
  SettingsSaved: 'Настройки сохранены.',
  SettingsReset: 'Настройки сброшены к исходным.',
  SettingsError: 'Не удалось получить настройки пользователя.',

  // Users store
  UserStatusSaved: 'Статус пользователя сохранён.',
  EmailSaved: 'Подтверждение электронной почты сохранено.',

  // statuses - статусы
  Open: 'Открыто',
  Assign: 'Назначить',
  Ack: 'Принято',
  Shelved: 'Отложено',
  Blackout: 'Отключение',
  Closed: 'Закрыто',
  Expired: 'Истекло',
  Unknown: 'Неизвестно',
  NotValid: 'Недействительно',

  // operator actions - действия оператора
  Open: 'Открыть',
  Assign: 'Назначить',
  Ack: 'Обнаружено',
  Unack: 'Не обнаружено',
  Shelve: 'Отложить',
  Unshelve: 'Вернуть',
  Close: 'Закрыть',
  Watch: 'Наблюдать',
  Unwatch: 'Прекратить наблюдение',
  AddNote: 'Добавить заметку',
  Delete: 'Удалить',

  // Alert or incident actions - Действия с алертами или инцидентами
  TextIsRequired: 'Текст обязателен',
  TextMustBeLessThan: 'Текст должен быть меньше',
  characters: 'символов',
  MergeIncident: 'Объединить инциденты',
  SplitIncident: 'Разделить инцидент',
  MovingAlerts: 'Перемещение оповещений...',
  NewIncident: 'Новый инцидент',
  TakeInFixingBy24Per7: 'Инцидент',
  Aidone: 'ИИ решил',
  FalsePositive: 'Ложное срабатывание',
  Escalate: 'Эскалировать',
  ConfirmEscalation: 'Подтвердить эскалацию',
  RestrictedMergeJira: 'Ограничено объединение нескольких оповещений, открытых в Jira',
  PleaseChooseGroupForIncidentEscalation: 'Пожалуйста, выберите группу для эскалации инцидента.',
  NoticeDefaultValueIsOwnerTag: 'Примечание: значение по умолчанию - это значение тега Owner_1 из первого оповещения (если существует)',
  External: 'Внешняя',

  // Alert notifications - Оповещения об алертах
  NewAlertRegistered: 'Получен новый алерт!',
  NewAlertClickToView: 'Нажмите здесь, чтобы открыть.',

  // Alert detail - Детали алерта
  Dutyadmin: 'Дежурный',
  AlertId: 'ID алерта',
  AlertOrNoteId: 'ID алерта/заметки',
  LastReceiveAlertId: 'ID последнего принятого алерта',
  CreateTime: 'Время создания',
  RecoveryTime: 'Время починки',
  PhysicalHost: 'Физический хост',
  SystemAdmin: 'Сисадмин',
  ReceiveTime: 'Время получения',
  LastReceiveTime: 'Последнее получение',
  Customer: 'Клиент',
  Service: 'Инфо-система',
  Environment: 'Окружение',
  Resource: 'Ресурс',
  Event: 'Событие',
  Correlate: 'Корреляция',
  Group: 'Группа',
  Severity: 'Серьезность',
  Patterns: 'Правила группировки',
  Status: 'Статус',
  TimeInStatus: 'Время в статусе',
  Host: 'Хост',
  Value: 'Значение',
  Text: 'Текст',
  TrendIndication: 'Индикатор тренда',
  Timeout: 'Тайм-аут',
  Type: 'Тип',
  DuplicateCount: 'Число дубликатов',
  Repeat: 'Повторение',
  Origin: 'Источник',
  Tags: 'Теги',
  Attributes: 'Атрибуты',
  History: 'История',
  Data: 'Данные',
  JiraKey: 'Инцидент (ссылка)',

  Details: 'Подробности',
  addedNoteOn: 'добавил заметку',
  by: 'по',

  // Duration cuts - Сокращения длительности
  ShortDays: 'д',
  ShortHours: 'ч',
  ShortMinutes: 'м',
  ShortSeconds: 'с',

  // Alert history - История алертов
  UpdateTime: 'Время обновления',
  Updated: 'Обновлено',
  User: 'Пользователь',

  // Incident stats - Статистика инцидентов
  NewAlerts: 'новые алерты',
  UnresolvedAlerts: 'решённые алерты',
  ResolvedAlerts: 'нерешённые алерты',

  // Alert list - Список алертов
  Loading: 'Загрузка',
  NoDataAvailable: 'Данные отсутствуют',
  ALL: 'ВСЕ',
  Description: 'Описание',
  Attribute: 'Атрибут',
  TimeoutLeft: 'Остаток тайм-аута',
  Dupl: 'Дубл.',
  PrevSeverity: 'Пред. серьезность',
  Duration: 'Длительность',
  LastReceiveId: 'ID последнего получения',
  LastNote: 'Последняя заметка',
  Summary: 'Содержание',
  ProjectGroup: 'Группа проекта',

  // Alert list filter - Фильтр списка алертов
  Filters: 'Фильтры',
  FilterDescription: 'Фильтр по текстовому поиску',
  AllEnvironments: 'Все окружения',
  EnvironmentDescription: 'Выберите одно или несколько окружений',
  AllSeverities: 'Все степени серьезности',
  SeverityDescription: 'Выберите одну или несколько степеней серьезности',
  AllStatuses: 'Все статусы',
  StatusDescription: 'Выберите один или несколько статусов',
  AllCustomers: 'Все клиенты',
  CustomerDescription: 'Выберите одного или нескольких клиентов',
  AllServices: 'Все сервисы',
  ServiceDescription: 'Выберите один или несколько сервисов',
  OtherAdmins: 'Не показывать алерты других дежурных',
  OtherAdminsDescription: '',
  AllGroups: 'Все группы',
  GroupDescription: 'Выберите одну или несколько групп',

  Latest: 'Последние',
  Hour: '1 час',
  SixHours: '6 часов',
  TwelveHours: '12 часов',
  SelectRange: 'Выбрать диапазон',

  DateTime: 'Дата/Время',
  StartDate: 'Дата начала',
  EndDate: 'Дата окончания',
  Time: 'Время',
  Apply: 'Применить',
  Reset: 'Сбросить',

  // Patterns - Правила группировки
  AlertChild: 'Алерт (дочерний)',
  AlertIdToTest: 'ID алерта для теста',
  CreatePattern: 'Создать правило группировки',
  EditPattern: 'Изменить правило',
  IncidentParent: 'Инцидент (родительский)',
  Pattern: 'Правило группировки',
  PatternActive: 'Активно',
  PatternName: 'Имя правила',
  PatternsHistory: 'История срабатывания правил группировки',
  Priority: 'Приоритет',
  SavePattern: 'Сохранить правило',
  SqlRule: 'SQL-правило',
  SqlRuleToTest: 'SQL-правило для теста',
  Test: 'Тест',
  TestPattern: 'Тестировать правило группировки',
  TestRule: 'Тестировать правило',
  Yes: 'Да',
  No: 'Нет',
  AlertMoveHistory: 'История ручного перемещения алертов',

  // API keys - API ключи
  APIKey: 'API ключ',
  Search: 'Поиск',
  Customer: 'Клиент',
  Scopes: 'Скоупы',
  Expires: 'Истекает',
  Active: 'Активный',
  Expired: 'Истекший',
  Slow: 'Медленный',

  User: 'Пользователь',
  LastUsed: 'Последнее использование',
  Actions: 'Действия',

  Copy: 'Копировать',
  Copied: 'Скопировано!',
  NewApiKey: 'Новый API ключ',
  EditApiKey: 'Редактировать API ключ',

  // Blackouts - Отключения
  ChooseService: 'Выберите один или несколько сервисов',
  Start: 'Начало',
  End: 'Конец',
  Created: 'Создано',
  Reason: 'Причина',
  NewBlackout: 'Новое отключение',
  EditBlackout: 'Редактировать отключение',
  Active: 'Активно',
  Pending: 'В ожидании',
  Expired: 'Истекло',
  WholeEnvironment: 'Всё окружение',
  AllOrigin: 'Все источники',

  // Customers - Клиенты
  LookUp: 'Поиск',
  LookUpDescription: 'Используйте логин, роль Keycloak, организацию GitHub, группу GitLab или домен электронной почты',
  NewCustomer: 'Новый клиент',
  EditCustomer: 'Редактировать клиента',

  // Groups - Группы
  AddRemoveUsers: 'Добавить/Удалить пользователей',
  Addusers: 'Добавить пользователей',
  UsersInGroup: 'Пользователи в группе',
  NumberUsers: 'Количество пользователей',
  NewGroup: 'Новая группа',
  EditGroup: 'Редактировать группу',

  // Heartbeats - Пульсы
  Latency: 'Задержка',
  Since: 'С момента',

  // Manifest - Манифест
  API: 'API',
  OpenGitHub: 'Открыть на GitHub',
  WebUI: 'Веб-интерфейс',
  Build: 'Сборка',
  Date: 'Дата',
  GitRevision: 'Ревизия Git',
  APIEndpoint: 'API-эндпоинт',

  // Perms - Разрешения
  Role: 'Роль',
  Scope: 'Область',
  SystemRole: 'Системная роль',
  NewPermission: 'Новое разрешение',
  EditPermission: 'Редактировать разрешение',

  // Preferences - Настройки
  ApplicationSettings: 'Настройки приложения',
  DarkTheme: 'Тёмная тема',
  PlaySounds: 'Воспроизводить звуки уведомлений',
  LanguageSettings: 'Настройки языка',
  Languages: 'Языки',
  English: 'Английский',
  French: 'Французский',
  German: 'Немецкий',
  Turkish: 'Турецкий',
  Russian: 'Русский',
  DateTimeSettings: 'Настройки даты и времени',
  LongDate: 'Формат длинной даты',
  MediumDate: 'Формат средней даты',
  ShortTime: 'Формат короткого времени',
  DisplayMode: 'Режим отображения',
  UseLocal: 'Использовать местное время и дату',
  UseUTC: 'Использовать универсальное время (UTC)',
  AlertSettings: 'Настройки сводки алертов',
  ShowAllowedEnvs: 'Всегда показывать разрешённые окружения',
  ShowNotesIcon: 'Показывать иконку заметок',
  ShowNotesHint: 'Показывать иконку рядом со статусом алерта, если есть заметка оператора',
  Font: 'Шрифт',
  FontSize: 'Размер шрифта',
  FontWeight: 'Толщина шрифта',
  PageRows: 'Строк на странице',
  rows: 'строк',
  ValueWidth: 'Ширина значения',
  DescriptionWidth: 'Ширина описания',
  RefreshInterval: 'Интервал обновления',
  seconds: 'секунды',
  minutes: 'минуты',
  AckTimeout: 'Тайм-аут принятия',
  ShelveTimeout: 'Тайм-аут отложенного алерта',
  BlackoutSettings: 'Настройки периода отключений',
  BlackoutStartNow: 'Начать период отключений немедленно',
  BlackoutPeriod: 'Период отключений',
  hours: 'часов',

  // Profile - Профиль
  Profile: 'Профиль',
  UserID: 'ID пользователя',
  PrimaryUserID: 'Основной ID пользователя',
  Provider: 'Поставщик',
  EmailVerified: 'Электронная почта подтверждена',
  EmailNotVerified: 'Электронная почта не подтверждена',
  Customers: 'Клиенты',
  Organizations: 'Организации',
  Groups: 'Группы',
  Roles: 'Роли',
  Scopes: 'Скоупы',
  others: 'другие',

  // Status - Статус
  LastUpdate: 'Последнее обновление',
  Uptime: 'Время работы',
  Metric: 'Метрика',
  Type: 'Тип',
  Name: 'Имя',
  Value: 'Значение',
  AvgTime: 'Среднее время',

  // Users - Пользователи
  Active: 'Активен',
  Inactive: 'Неактивен',
  Login: 'Логин',
  Email: 'Электронная почта',
  Verified: 'Подтверждён',
  Comment: 'Комментарий',
  VerifiedOrNot: 'Подтверждён?',
  LastLogin: 'Последний вход',
  NewUser: 'Новый пользователь',
  EditUser: 'Редактировать пользователя',

  // Reports - Отчёты
  Top: 'Топ',
  Flapping: 'Трепыхание',
  Offenders: 'Нарушители',
  Standing: 'Стояние',
  TopFlappingDescription: 'Источники алертов, которые чаще всего изменяли свою степень серьезности.',
  TopOffendersDescription: 'Источники, которые генерировали наибольшее количество алертов и их дубликатов.',
  TopStandingDescription: 'Источники с устаревшими активными алертами.',

  Count: 'Количество',
  DuplCount: 'Кол-во дубликатов',
  Services: 'Сервисы',
  Resources: 'Ресурсы',

  // User Confirm - Подтверждение пользователя
  Thanks: 'Спасибо!',
  YouCanNowLogin1: 'Теперь вы можете',
  YouCanNowLogin2: 'войти.',
  EmailConfirmFailed: 'К сожалению, возникла проблема с подтверждением вашего адреса электронной почты',
  TryAgain: 'Пожалуйста, попробуйте снова',

  // User Forgot - Забыли пароль
  ResetLink: 'Введите свою электронную почту, и мы отправим вам ссылку для сброса',
  AlreadyHaveAccount: 'Уже есть аккаунт?',
  CheckEmail: 'Проверьте свою почту на наличие ссылки для сброса...',
  ReturnSignIn: 'Вернуться ко входу',
  ResetEmailSent: 'Ссылка для сброса успешно отправлена!',

  // User Login - Вход пользователя
  LoginToContinue: 'Войдите, чтобы продолжить',
  Username: 'Пользователь',
  Password: 'Пароль',
  CreateAccount: 'Создать аккаунт',
  ForgotPassword: 'Забыли пароль?',
  UnspecifiedProblem: 'Извините, возникла проблема',
  AuthWith: 'Аутентификация через',
  AuthInProgress: 'Аутентификация...',
  AuthNotPossible: 'Извините, аутентификация невозможна',
  AuthProviderUnknown: 'Неизвестный провайдер аутентификации',

  // User Logout - Выход пользователя
  LoggedOut: 'Вы вышли из системы.',

  // User Reset - Сброс пароля
  ChooseNewPassword: 'Выберите новый пароль',
  ConfirmPassword: 'Подтвердите пароль',
  ResetPassword: 'Сбросить пароль',

  // User Signup - Регистрация пользователя
  CreateAlertaAccount: 'Создайте аккаунт',
  SignUpNotAvailable: 'Извините, регистрация в данный момент недоступна',
  FullName: 'Полное имя',
  Min6Char: 'Минимум 6 символов',
  PasswordNotMatch: 'Пароли не совпадают',

  // Labels - Метки
  scope: 'область',
  role: 'роль',
  customer: 'клиент',
  group: 'группа',

  // General - Общее
  ConfirmDelete: 'Вы уверены, что хотите удалить этот элемент?',
  Error: 'Ошибка',
  Send: 'Отправить',
  Required: 'Обязательно',
  Cancel: 'Отмена',
  Save: 'Сохранить',
  NoDisplay: 'Извините, здесь нечего отображать :(',
  SearchNoResult1: 'Ваш поиск по запросу',
  SearchNoResult2: 'не дал результатов.',
  OK: 'ОК',
  RowsPerPage: 'Лимит строк на странице',
  Of: 'из',

  // Analytics - Аналитика
  Analytics: 'Аналитика',
  Counts: 'Количество',
  'Ack Count': 'Кол-во аков',
  MTTD: 'MTTD (Среднее время до обнаружения)',
  MTTU: 'MTTU (Среднее время до понимания)',
  MTTR: 'MTTR (Среднее время до решения)',
  'Alerts Count': 'Количество алертов',
  'Was Grouped': 'Сгруппировалось',
  'Wasn\'t Grouped': 'Не сгруппировалось',
  Incidents: 'Инциденты',
  Duplicates: 'Дубликаты',
  'False Positives': 'Ложноположительные',
  Flaps: 'Флапы',
  'Ack Percent': 'Процент подтверждения',
  'Ack In SLA': 'Подтверждения в SLA',
  '75thPercentile': '75-й процентиль',
  '90thPercentile': '90-й процентиль',
  '99thPercentile': '99-й процентиль',
  '50thPercentile': '50-й процентиль',
  '75thPercentileFP': '75-й процентиль (ЛП)',
  '90thPercentileFP': '90-й процентиль (ЛП)',
  'Total Alerts': 'Всего алертов',
  'Resolved Alerts': 'Решенные алерты',
  'Resolved Percent': 'Процент решенных',
  Total: 'Всего',
  Critical: 'Критический',
  High: 'Высокий',
  Medium: 'Средний',
  All: 'Все',

  // ENDS. - КОНЕЦ.
}
