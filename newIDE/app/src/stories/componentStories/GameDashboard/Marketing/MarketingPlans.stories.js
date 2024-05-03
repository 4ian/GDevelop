// @flow
import * as React from 'react';

import paperDecorator from '../../../PaperDecorator';
import MarketingPlans from '../../../../MarketingPlans/MarketingPlans';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { MarketingPlansStoreStateProvider } from '../../../../MarketingPlans/MarketingPlansStoreContext';
import {
  fakeAuthenticatedUserWithNoSubscriptionAndCredits,
  fakeGame,
  game2,
} from '../../../../fixtures/GDevelopServicesTestData';
import {
  client as gameApiAxiosClient,
  type GameFeaturing,
} from '../../../../Utils/GDevelopServices/Game';
import MockAdapter from 'axios-mock-adapter';

export default {
  title: 'GameDashboard/Marketing/MarketingPlans',
  component: MarketingPlans,
  decorators: [paperDecorator],
};

const now = Date.now();
const nowMinusOneDay = now - 24 * 60 * 60 * 1000;
const nowPlusOneDay = now + 24 * 60 * 60 * 1000;

const marketingPlans = [
  {
    id: 'featuring-basic',
    nameByLocale: {
      en: 'Basic',
    },
    icon: 'speaker',
    canExtend: true,
    requiresManualContact: false,
    includedFeaturings: ['games-platform-home'],
    gameRequirements: {
      hasThumbnail: true,
      isPublished: true,
      isDiscoverable: true,
    },
    descriptionByLocale: {
      en: 'Perfect to playtest your alpha build and gather information.',
      'fr-FR':
        'Parfait pour tester votre version alpha et collecter des informations.',
      'ar-SA': 'مثالي لاختبار إصدار ألفا الخاص بك وجمع المعلومات.',
      'de-DE':
        'Perfekt, um Ihren Alpha-Build zu testen und Informationen zu sammeln.',
      'es-ES': 'Perfecto para probar su versión alfa y recopilar información.',
      'it-IT':
        'Perfetto per testare la tua versione alpha e raccogliere informazioni.',
      'ja-JP': 'アルファビルドをテストして情報を収集するのに最適です。',
      'ko-KR': '알파 빌드를 테스트하고 정보를 수집하기에 이상적입니다.',
      'pl-PL': 'Idealny do przetestowania wersji alfa i zbierania informacji.',
      'pt-BR': 'Perfeito para testar sua versão alfa e coletar informações.',
      'ru-RU':
        'Идеально подходит для тестирования альфа-версии и сбора информации.',
      'sl-SI': 'Popolno za testiranje alfa različice in zbiranje informacij.',
      'uk-UA':
        'Ідеально підходить для тестування альфа-версії та збору інформації.',
      'zh-CN': '完美的测试您的alpha版本并收集信息。',
    },
    bulletPointsByLocale: [
      {
        en: 'Be promoted on gd.games homepage for 7 days',
        'fr-FR':
          "Être mis en avant sur la page d'accueil de gd.games pendant 7 jours",
        'ar-SA': 'يتم عرضه على الصفحة الرئيسية لـ gd.games لمدة 7 أيام',
        'de-DE':
          '7 Tage lang auf der Startseite von gd.games vorgestellt werden',
        'es-ES': 'Destacado en la página de inicio de gd.games durante 7 días',
        'it-IT': 'In primo piano sulla homepage di gd.games per 7 giorni',
        'ja-JP': 'gd.gamesのホームページで7日間紹介されます',
        'ko-KR': 'gd.games의 홈페이지에서 7 일 동안 소개됩니다.',
        'pl-PL': 'Zostań wyróżniony na stronie głównej gd.games przez 7 dni',
        'pt-BR': 'Destaque na página inicial do gd.games por 7 dias',
        'ru-RU': 'Рекомендуется на главной странице gd.games в течение 7 дней',
        'sl-SI': 'Prikazano na začetni strani gd.games 7 dni',
        'uk-UA': 'Рекомендується на головній сторінці gd.games протягом 7 днів',
        'zh-CN': '在gd.games首页上推广7天',
      },
      {
        en: 'Get more player feedback',
        'fr-FR': 'Obtenez plus de commentaires de joueurs',
        'ar-SA': 'احصل على مزيد من تعليقات اللاعبين',
        'de-DE': 'Mehr Spieler-Feedback erhalten',
        'es-ES': 'Obtenga más comentarios de los jugadores',
        'it-IT': 'Ottieni più feedback dai giocatori',
        'ja-JP': 'より多くのプレイヤーフィードバックを取得する',
        'ko-KR': '더 많은 플레이어 피드백 받기',
        'pl-PL': 'Otrzymaj więcej opinii graczy',
        'pt-BR': 'Obtenha mais feedback dos jogadores',
        'ru-RU': 'Получить больше отзывов игроков',
        'sl-SI': 'Pridobite več povratnih informacij igralcev',
        'uk-UA': 'Отримати більше відгуків гравців',
        'zh-CN': '获得更多玩家反馈',
      },
    ],
    additionalSuccessMessageByLocale: {
      en:
        'Ensure that your game is public and you have configured a thumbnail for gd.games. This can take a few minutes for your game to be visible on the platform.',
      'fr-FR':
        'Assurez-vous que votre jeu est public et que vous avez configuré une miniature pour gd.games. Il peut falloir quelques minutes pour que votre jeu soit visible sur la plateforme.',
      'ar-SA':
        'تأكد من أن لعبتك عامة وأنك قمت بتكوين صورة مصغرة لـ gd.games. قد يستغرق بضع دقائق حتى تظهر لعبتك على المنصة.',
      'de-DE':
        'Stellen Sie sicher, dass Ihr Spiel öffentlich ist und Sie ein Miniaturbild für gd.games konfiguriert haben. Es kann einige Minuten dauern, bis Ihr Spiel auf der Plattform sichtbar ist.',
      'es-ES':
        'Asegúrate de que tu juego es público y has configurado una miniatura para gd.games. Puede tardar unos minutos en que tu juego sea visible en la plataforma.',
      'it-IT':
        'Assicurati che il tuo gioco sia pubblico e che tu abbia configurato un’anteprima per gd.games. Potrebbero essere necessari alcuni minuti affinché il tuo gioco sia visibile sulla piattaforma.',
      'ja-JP':
        'ゲームが公開されており、gd.gamesのサムネイルが設定されていることを確認してください。ゲームがプラットフォーム上で表示されるまで数分かかる場合があります。',
      'ko-KR':
        '게임이 공개되어 있고 gd.games에 대한 썸네일이 구성되어 있는지 확인하십시오. 게임이 플랫폼에서 보이는 데 몇 분 정도 걸릴 수 있습니다.',
      'pl-PL':
        'Upewnij się, że twoja gra jest publiczna i masz skonfigurowany miniaturę dla gd.games. Może minąć kilka minut, zanim twoja gra będzie widoczna na platformie.',
      'pt-BR':
        'Certifique-se de que seu jogo é público e você configurou uma miniatura para o gd.games. Pode levar alguns minutos para que seu jogo seja visível na plataforma.',
      'ru-RU':
        'Убедитесь, что ваша игра является общедоступной и вы настроили миниатюру для gd.games. Это может занять несколько минут, чтобы ваша игра стала видимой на платформе.',
      'sl-SI':
        'Prepričajte se, da je vaša igra javna in da ste konfigurirali sličico za gd.games. Za vašo igro lahko traja nekaj minut, da bo vidna na platformi.',
      'uk-UA':
        'Переконайтеся, що ваша гра є публічною, і ви налаштували мініатюру для gd.games. Це може зайняти кілька хвилин, щоб ваша гра стала видимою на платформі.',
      'zh-CN':
        '确保您的游戏是公开的，并且您已经为gd.games配置了缩略图。您的游戏在平台上可见可能需要几分钟。',
    },
  },
  {
    id: 'featuring-pro',
    nameByLocale: {
      en: 'Pro',
    },
    icon: 'speedometer',
    canExtend: false,
    requiresManualContact: false,
    includedFeaturings: [
      'games-platform-home',
      'games-platform-listing',
      'games-platform-game-page',
    ],
    gameRequirements: {
      hasThumbnail: true,
      isPublished: true,
      isDiscoverable: true,
    },
    descriptionByLocale: {
      en: 'Perfect for advanced creators who want more exposure and feedback',
      'fr-FR':
        'Parfait pour les créateurs avancés qui souhaitent plus de visibilité et de commentaires',
      'ar-SA':
        'مثالي للمبدعين المتقدمين الذين يرغبون في المزيد من التعرض والتعليقات',
      'de-DE':
        'Perfekt für fortgeschrittene Kreative, die mehr Sichtbarkeit und Feedback möchten',
      'es-ES':
        'Perfecto para creadores avanzados que desean más exposición y comentarios',
      'it-IT':
        'Perfetto per creatori avanzati che desiderano maggiore visibilità e feedback',
      'ja-JP': 'より多くの露出とフィードバックを望む上級クリエイターに最適です',
      'ko-KR': '더 많은 노출과 피드백을 원하는 고급 창작자에게 적합합니다.',
      'pl-PL':
        'Idealny dla zaawansowanych twórców, którzy chcą większej ekspozycji i opinii',
      'pt-BR':
        'Perfeito para criadores avançados que desejam mais exposição e feedback',
      'ru-RU':
        'Идеально подходит для опытных создателей, которые хотят большей известности и обратной связи',
      'sl-SI':
        'Popolno za napredne ustvarjalce, ki želijo več izpostavljenosti in povratnih informacij',
      'uk-UA':
        'Ідеально підходить для досвідчених творців, які хочуть більшої відомості та зворотного зв’язку',
      'zh-CN': '适合高级创作者，希望获得更多曝光和反馈',
    },
    bulletPointsByLocale: [
      {
        en: 'Be promoted on gd.games homepage and other game pages for 15 days',
        'fr-FR':
          'Être mis en avant sur la page d’accueil de gd.games et d’autres pages de jeu pendant 15 jours',
        'ar-SA':
          'يتم عرضه على الصفحة الرئيسية لـ gd.games وصفحات الألعاب الأخرى لمدة 15 يومًا',
        'de-DE':
          '15 Tage lang auf der Startseite von gd.games und anderen Spiel-Seiten vorgestellt werden',
        'es-ES':
          'Destacado en la página de inicio de gd.games y otras páginas de juegos durante 15 días',
        'it-IT':
          'In primo piano sulla homepage di gd.games e altre pagine di gioco per 15 giorni',
        'ja-JP': 'gd.gamesのホームページや他のゲームページで15日間紹介されます',
        'ko-KR':
          'gd.games의 홈페이지 및 다른 게임 페이지에서 15 일 동안 소개됩니다.',
        'pl-PL':
          'Zostań wyróżniony na stronie głównej gd.games i innych stronach gier przez 15 dni',
        'pt-BR':
          'Destaque na página inicial do gd.games e outras páginas de jogos por 15 dias',
        'ru-RU':
          'Рекомендуется на главной странице gd.games и других страницах игр в течение 15 дней',
        'sl-SI':
          'Prikazano na začetni strani gd.games in drugih straneh iger 15 dni',
        'uk-UA':
          'Рекомендується на головній сторінці gd.games та інших сторінках ігор протягом 15 днів',
        'zh-CN': '在gd.games首页和其他游戏页面上推广15天',
      },
      {
        en: 'Get more visibility and additional feedback',
        'fr-FR':
          'Obtenez une meilleure visibilité et des commentaires supplémentaires',
        'ar-SA': 'احصل على مزيد من الرؤية والتعليقات الإضافية',
        'de-DE': 'Mehr Sichtbarkeit und zusätzliches Feedback erhalten',
        'es-ES': 'Obtenga más visibilidad y comentarios adicionales',
        'it-IT': 'Ottieni maggiore visibilità e feedback aggiuntivi',
        'ja-JP': 'より多くの可視性と追加のフィードバックを取得する',
        'ko-KR': '더 많은 노출과 추가 피드백 받기',
        'pl-PL': 'Otrzymaj większą widoczność i dodatkowe opinie',
        'pt-BR': 'Obtenha mais visibilidade e feedback adicional',
        'ru-RU': 'Получить больше видимости и дополнительной обратной связи',
        'sl-SI': 'Pridobite več vidnosti in dodatnih povratnih informacij',
        'uk-UA': 'Отримати більше видимості та додаткового зворотного зв’язку',
        'zh-CN': '获得更多曝光和额外反馈',
      },
    ],
    additionalSuccessMessageByLocale: {
      en:
        'Ensure that your game is public and you have configured a thumbnail for gd.games. This can take a few minutes for your game to be visible on the platform.',
      'fr-FR':
        'Assurez-vous que votre jeu est public et que vous avez configuré une miniature pour gd.games. Il peut falloir quelques minutes pour que votre jeu soit visible sur la plateforme.',
      'ar-SA':
        'تأكد من أن لعبتك عامة وأنك قمت بتكوين صورة مصغرة لـ gd.games. قد يستغرق بضع دقائق حتى تظهر لعبتك على المنصة.',
      'de-DE':
        'Stellen Sie sicher, dass Ihr Spiel öffentlich ist und Sie ein Miniaturbild für gd.games konfiguriert haben. Es kann einige Minuten dauern, bis Ihr Spiel auf der Plattform sichtbar ist.',
      'es-ES':
        'Asegúrate de que tu juego es público y has configurado una miniatura para gd.games. Puede tardar unos minutos en que tu juego sea visible en la plataforma.',
      'it-IT':
        'Assicurati che il tuo gioco sia pubblico e che tu abbia configurato un’anteprima per gd.games. Potrebbero essere necessari alcuni minuti affinché il tuo gioco sia visibile sulla piattaforma.',
      'ja-JP':
        'ゲームが公開されており、gd.gamesのサムネイルが設定されていることを確認してください。ゲームがプラットフォーム上で表示されるまで数分かかる場合があります。',
      'ko-KR':
        '게임이 공개되어 있고 gd.games에 대한 썸네일이 구성되어 있는지 확인하십시오. 게임이 플랫폼에서 보이는 데 몇 분 정도 걸릴 수 있습니다.',
      'pl-PL':
        'Upewnij się, że twoja gra jest publiczna i masz skonfigurowany miniaturę dla gd.games. Może minąć kilka minut, zanim twoja gra będzie widoczna na platformie.',
      'pt-BR':
        'Certifique-se de que seu jogo é público e você configurou uma miniatura para o gd.games. Pode levar alguns minutos para que seu jogo seja visível na plataforma.',
      'ru-RU':
        'Убедитесь, что ваша игра является общедоступной и вы настроили миниатюру для gd.games. Это может занять несколько минут, чтобы ваша игра стала видимой на платформе.',
      'sl-SI':
        'Prepričajte se, da je vaša igra javna in da ste konfigurirali sličico za gd.games. Za vašo igro lahko traja nekaj minut, da bo vidna na platformi.',
      'uk-UA':
        'Переконайтеся, що ваша гра є публічною, і ви налаштували мініатюру для gd.games. Це може зайняти кілька хвилин, щоб ваша гра стала видимою на платформі.',
      'zh-CN':
        '确保您的游戏是公开的，并且您已经为gd.games配置了缩略图。您的游戏在平台上可见可能需要几分钟。',
    },
  },
  {
    id: 'featuring-premium',
    nameByLocale: {
      en: 'Premium',
    },
    icon: 'stars',
    canExtend: false,
    requiresManualContact: true,
    includedFeaturings: [
      'games-platform-home',
      'games-platform-listing',
      'games-platform-game-page',
      'socials-newsletter',
      'gdevelop-banner',
    ],
    gameRequirements: {},
    descriptionByLocale: {
      en:
        'Perfect for people with a finished game who want to promote it to the widest audience possible',
      'fr-FR':
        'Parfait pour les personnes ayant un jeu terminé qui souhaitent le promouvoir auprès du plus large public possible',
      'ar-SA':
        'مثالي للأشخاص الذين لديهم لعبة مكتملة ويرغبون في الترويج لها لأوسع جمهور ممكن',
      'de-DE':
        'Perfekt für Personen mit einem fertigen Spiel, die es einem möglichst breiten Publikum vorstellen möchten',
      'es-ES':
        'Perfecto para personas con un juego terminado que desean promocionarlo al público más amplio posible',
      'it-IT':
        'Perfetto per le persone con un gioco finito che desiderano promuoverlo al pubblico più ampio possibile',
      'ja-JP':
        '完成したゲームを持つ人々に最適で、できるだけ幅広い観客に宣伝したい',
      'ko-KR':
        '완성된 게임을 가진 사람들에게 가장 적합하며 가능한 한 넓은 관객에게 홍보하려는 사람들에게 적합합니다.',
      'pl-PL':
        'Idealny dla osób z ukończoną grą, które chcą ją promować w jak najszerszym gronie odbiorców',
      'pt-BR':
        'Perfeito para pessoas com um jogo finalizado que desejam promovê-lo para o público mais amplo possível',
      'ru-RU':
        'Идеально подходит для людей с готовой игрой, которые хотят продвигать ее наиболее широкой аудитории',
      'sl-SI':
        'Popolno za ljudi z dokončano igro, ki jo želijo promovirati čim širši javnosti',
      'uk-UA':
        'Ідеально підходить для людей з готовою грою, які хочуть просувати її найбільш широкій аудиторії',
      'zh-CN': '适合拥有完成游戏并希望将其推广给尽可能广泛的受众的人',
    },
    bulletPointsByLocale: [
      {
        en: 'Be promoted everywhere on gd.games for 30 days',
        'fr-FR': 'Être mis en avant partout sur gd.games pendant 30 jours',
        'ar-SA': 'يتم الترويج في كل مكان على gd.games لمدة 30 يومًا',
        'de-DE': '30 Tage lang überall auf gd.games vorgestellt werden',
        'es-ES': 'Destacado en todas partes en gd.games durante 30 días',
        'it-IT': 'In primo piano ovunque su gd.games per 30 giorni',
        'ja-JP': 'gd.gamesで30日間どこでも紹介されます',
        'ko-KR': 'gd.games에서 30 일 동안 어디서나 소개됩니다.',
        'pl-PL': 'Zostań wyróżniony wszędzie na gd.games przez 30 dni',
        'pt-BR': 'Destaque em todos os lugares no gd.games por 30 dias',
        'ru-RU': 'Рекомендуется везде на gd.games в течение 30 дней',
        'sl-SI': 'Prikazano povsod na gd.games 30 dni',
        'uk-UA': 'Рекомендується скрізь на gd.games протягом 30 днів',
        'zh-CN': '在gd.games上的所有地方推广30天',
      },
      {
        en: 'Get a banner within GDevelop on desktop and the web editor',
        'fr-FR': 'Obtenez une bannière dans GDevelop sur bureau et web',
        'ar-SA': 'احصل على لافتة داخل GDevelop على سطح المكتب ومحرر الويب',
        'de-DE':
          'Erhalten Sie ein Banner in GDevelop auf Desktop und Web-Editor',
        'es-ES':
          'Obtenga un banner dentro de GDevelop en escritorio y el editor web',
        'it-IT':
          "Ottieni un banner all'interno di GDevelop su desktop e l'editor web",
        'ja-JP': 'デスクトップとWebエディターのGDevelop内にバナーを表示します',
        'ko-KR': '데스크톱 및 웹 편집기에서 GDevelop 내 배너 받기',
        'pl-PL': 'Otrzymaj baner w GDevelop na komputerze i edytorze sieci web',
        'pt-BR':
          'Obtenha um banner dentro do GDevelop no desktop e no editor da web',
        'ru-RU':
          'Получите баннер в GDevelop на рабочем столе и в веб-редакторе',
        'sl-SI':
          'Pridobite pasico v GDevelop na namizju in spletnem urejevalniku',
        'uk-UA':
          'Отримайте банер у GDevelop на робочому столі та в веб-редакторі',
        'zh-CN': '在桌面和Web编辑器中的GDevelop中获取横幅',
      },
      {
        en: 'Get featured on newsletter and social media',
        'fr-FR': 'Être mis en avant dans la newsletter et les réseaux sociaux',
        'ar-SA': 'يتم عرضه في النشرة الإخبارية ووسائل التواصل الاجتماعي',
        'de-DE': 'Auf Newsletter und Social Media vorgestellt werden',
        'es-ES': 'Destacado en el boletín y las redes sociales',
        'it-IT': 'In primo piano sulla newsletter e sui social media',
        'ja-JP': 'ニュースレターやソーシャルメディアで紹介されます',
        'ko-KR': '뉴스레터 및 소셜 미디어에 피처링됩니다.',
        'pl-PL': 'Zostań wyróżniony w biuletynie i mediach społecznościowych',
        'pt-BR': 'Destaque na newsletter e nas redes sociais',
        'ru-RU': 'Получить рекомендацию в рассылке и социальных сетях',
        'sl-SI': 'Prikazano v novicah in družbenih omrežjih',
        'uk-UA': 'Отримати рекомендацію в розсилці та соціальних мережах',
        'zh-CN': '在通讯和社交媒体上推广',
      },
    ],
    additionalSuccessMessageByLocale: {
      en:
        'We will get in touch in the next few days to get the campaign up, check your emails!',
      'fr-FR':
        'Nous vous contacterons dans les prochains jours pour lancer la campagne, vérifiez vos e-mails !',
      'ar-SA':
        'سنتصل بك خلال الأيام القليلة القادمة لتشغيل الحملة، تحقق من بريدك الإلكتروني!',
      'de-DE':
        'Wir werden uns in den nächsten Tagen bei Ihnen melden, um die Kampagne zu starten. Überprüfen Sie Ihre E-Mails!',
      'es-ES':
        'Nos pondremos en contacto en los próximos días para poner en marcha la campaña, ¡revisa tus correos electrónicos!',
      'it-IT':
        'Ci metteremo in contatto nei prossimi giorni per avviare la campagna, controlla le tue email!',
      'ja-JP':
        'キャンペーンを開始するために数日以内に連絡しますので、メールをご確認ください！',
      'ko-KR':
        '다음 몇 일 안에 캠페인을 시작하기 위해 연락 드리겠습니다. 이메일을 확인하세요!',
      'pl-PL':
        'Skontaktujemy się w ciągu najbliższych dni, aby uruchomić kampanię, sprawdź swoje e-maile!',
      'pt-BR':
        'Entraremos em contato nos próximos dias para iniciar a campanha, verifique seus e-mails!',
      'ru-RU':
        'Мы свяжемся с вами в ближайшие дни, чтобы запустить кампанию, проверьте свою электронную почту!',
      'sl-SI':
        'V naslednjih dneh se bomo obrnili, da začnemo kampanjo, preverite svoje e-poštne predale!',
      'uk-UA':
        'Ми зв’яжемося в найближчі дні, щоб запустити кампанію, перевірте свою електронну пошту!',
      'zh-CN':
        '我们将在未来几天内与您联系，以启动广告活动，请查看您的电子邮件！',
    },
  },
];

const MarketingPlansStory = ({
  gameFeaturings,
  delayResponse,
  errorCode,
  errorMessage,
  incompleteGame,
}: {|
  gameFeaturings: GameFeaturing[],
  delayResponse?: number,
  errorCode?: number,
  errorMessage?: string,
  incompleteGame?: boolean,
|}) => {
  const gameServiceMock = new MockAdapter(gameApiAxiosClient, {
    delayResponse,
  });
  gameServiceMock
    .onGet('/game-featuring')
    .reply(errorCode || 200, errorCode ? errorMessage || null : gameFeaturings)
    .onGet('/marketing-plan')
    .reply(200, marketingPlans)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithNoSubscriptionAndCredits}
    >
      <MarketingPlansStoreStateProvider>
        <MarketingPlans game={incompleteGame ? game2 : fakeGame} />
      </MarketingPlansStoreStateProvider>
    </AuthenticatedUserContext.Provider>
  );
};

export const LoadingAndError = () => {
  return (
    <MarketingPlansStory
      gameFeaturings={[]}
      delayResponse={1000}
      errorCode={500}
      errorMessage="Internal server error"
    />
  );
};

export const Default = () => {
  return <MarketingPlansStory gameFeaturings={[]} delayResponse={1000} />;
};

export const WithOwnedActiveBasicPlanIncompleteGame = () => {
  return (
    <MarketingPlansStory
      gameFeaturings={[
        {
          gameId: 'complete-game-id',
          featuring: 'games-platform-home',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowPlusOneDay / 1000,
        },
      ]}
      incompleteGame
    />
  );
};

export const WithOwnedActiveBasicPlanFullGame = () => {
  return (
    <MarketingPlansStory
      gameFeaturings={[
        {
          gameId: 'complete-game-id',
          featuring: 'games-platform-home',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowPlusOneDay / 1000,
        },
      ]}
    />
  );
};

export const WithOwnedExpiredBasicPlan = () => {
  return (
    <MarketingPlansStory
      gameFeaturings={[
        {
          gameId: 'complete-game-id',
          featuring: 'games-platform-home',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowMinusOneDay / 1000,
        },
      ]}
    />
  );
};

export const WithOwnedProPlan = () => {
  return (
    <MarketingPlansStory
      gameFeaturings={[
        {
          gameId: 'complete-game-id',
          featuring: 'games-platform-game-page',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowPlusOneDay / 1000,
        },
        {
          gameId: 'complete-game-id',
          featuring: 'games-platform-home',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowPlusOneDay / 1000,
        },
        {
          gameId: 'complete-game-id',
          featuring: 'games-platform-listing',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowPlusOneDay / 1000,
        },
      ]}
    />
  );
};

export const WithOwnedPremiumPlan = () => {
  return (
    <MarketingPlansStory
      gameFeaturings={[
        {
          gameId: 'complete-game-id',
          featuring: 'gdevelop-banner',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowPlusOneDay / 1000,
        },
        {
          gameId: 'complete-game-id',
          featuring: 'socials-newsletter',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowPlusOneDay / 1000,
        },
      ]}
    />
  );
};
