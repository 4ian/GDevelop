// @flow
import * as React from 'react';

import paperDecorator from '../../../PaperDecorator';
import MarketingPlans from '../../../../MarketingPlans/MarketingPlans';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { type MarketingPlan } from '../../../../Utils/GDevelopServices/Game';
import {
  fakeAuthenticatedUserWithNoSubscriptionAndCredits,
  fakeGame,
} from '../../../../fixtures/GDevelopServicesTestData';
import { GDevelopGameApi } from '../../../../Utils/GDevelopServices/ApiConfigs';

export default {
  title: 'GameDashboard/Marketing/MarketingPlans',
  component: MarketingPlans,
  decorators: [paperDecorator],
};

const now = Date.now();
const nowMinusOneDay = now - 24 * 60 * 60 * 1000;
const nowPlusOneDay = now + 24 * 60 * 60 * 1000;

const marketingPlans: MarketingPlan[] = [
  {
    id: 'featuring-basic',
    nameByLocale: {
      en: 'Basic',
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
        en: 'Be featured on gd.games',
        'fr-FR': 'Être mis en avant sur gd.games',
        'ar-SA': 'يتم عرضه على gd.games',
        'de-DE': 'Auf gd.games vorgestellt werden',
        'es-ES': 'Ser presentado en gd.games',
        'it-IT': 'Essere presentato su gd.games',
        'ja-JP': 'gd.gamesで紹介される',
        'ko-KR': 'gd.games에 게재',
        'pl-PL': 'Zostać przedstawionym na gd.games',
        'pt-BR': 'Ser apresentado no gd.games',
        'ru-RU': 'Быть представленным на gd.games',
        'sl-SI': 'Predstavitev na gd.games',
        'uk-UA': 'Бути представленим на gd.games',
        'zh-CN': '在gd.games上展示',
      },
      {
        en: 'Get x% more plays',
        'fr-FR': 'Obtenez x% de jeux en plus',
        'ar-SA': 'احصل على x٪ من المزيد من اللعب',
        'de-DE': 'Erhalten Sie x% mehr Spiele',
        'es-ES': 'Obtenga x% más de juegos',
        'it-IT': 'Ottieni x% in più di giochi',
        'ja-JP': 'x%以上の再生',
        'ko-KR': 'x % 이상 재생',
        'pl-PL': 'Otrzymaj x% więcej gier',
        'pt-BR': 'Obtenha x% mais jogos',
        'ru-RU': 'Получите x% больше игр',
        'sl-SI': 'Pridobite x% več iger',
        'uk-UA': 'Отримайте x% більше ігор',
        'zh-CN': '获得x%以上的游戏',
      },
      {
        en: 'Get y% more feedback',
        'fr-FR': 'Obtenez y% de commentaires supplémentaires',
        'ar-SA': 'احصل على y٪ من المزيد من التعليقات',
        'de-DE': 'Erhalten Sie y% mehr Feedback',
        'es-ES': 'Obtenga y% más comentarios',
        'it-IT': 'Ottieni y% di feedback in più',
        'ja-JP': 'y%以上のフィードバックを取得',
        'ko-KR': 'y % 이상의 피드백 받기',
        'pl-PL': 'Otrzymaj y% więcej opinii',
        'pt-BR': 'Obtenha y% mais feedback',
        'ru-RU': 'Получите y% больше отзывов',
        'sl-SI': 'Pridobite y% več povratnih informacij',
        'uk-UA': 'Отримайте y% більше відгуків',
        'zh-CN': '获得y%以上的反馈',
      },
    ],
  },
  {
    id: 'featuring-pro',
    nameByLocale: {
      en: 'Pro',
    },
    descriptionByLocale: {
      en:
        'Perfect if you have a Steam page or similar, and wish to collect both feedback and whishlists.',
      'fr-FR':
        'Parfait si vous avez une page Steam ou similaire et que vous souhaitez collecter à la fois des commentaires et des listes de souhaits.',
      'ar-SA':
        'مثالي إذا كان لديك صفحة Steam أو ما شابه ذلك ، وترغب في جمع كل من التعليقات والقوائم المفضلة.',
      'de-DE':
        'Perfekt, wenn Sie eine Steam-Seite oder ähnliches haben und sowohl Feedback als auch Wunschlisten sammeln möchten.',
      'es-ES':
        'Perfecto si tiene una página de Steam o similar y desea recopilar comentarios y listas de deseos.',
      'it-IT':
        'Perfetto se hai una pagina Steam o simili e desideri raccogliere sia feedback che desideri.',
      'ja-JP':
        'Steamページなどがある場合は完璧で、フィードバックとウィッシュリストの両方を収集したい場合は完璧です。',
      'ko-KR':
        'Steam 페이지 또는 유사한 페이지가 있고 피드백과 위시리스트를 모두 수집하려는 경우 완벽합니다.',
      'pl-PL':
        'Idealny, jeśli masz stronę Steam lub podobną i chcesz zbierać zarówno opinie, jak i listy życzeń.',
      'pt-BR':
        'Perfeito se você tiver uma página Steam ou similar e desejar coletar feedback e listas de desejos.',
      'ru-RU':
        'Идеально, если у вас есть страница Steam или подобная, и вы хотите собирать как отзывы, так и списки желаний.',
      'sl-SI':
        'Popolno, če imate stran Steam ali podobno in želite zbirati tako povratne informacije kot seznam želja.',
      'uk-UA':
        'Ідеально, якщо у вас є сторінка Steam або подібна, і ви хочете збирати як відгуки, так і списки бажань.',
      'zh-CN':
        '如果您有Steam页面或类似页面，并希望收集反馈和愿望清单，则完美无缺。',
    },
    bulletPointsByLocale: [
      {
        en: 'Featured on newsletter',
        'fr-FR': 'Mis en avant dans la newsletter',
        'ar-SA': 'معروض في النشرة الإخبارية',
        'de-DE': 'In Newsletter vorgestellt',
        'es-ES': 'Destacado en el boletín',
        'it-IT': 'In primo piano nella newsletter',
        'ja-JP': 'ニュースレターで紹介',
        'ko-KR': '뉴스 레터에 게재',
        'pl-PL': 'Wyróżniony w biuletynie',
        'pt-BR': 'Destacado no boletim informativo',
        'ru-RU': 'Рекомендуется в информационном бюллетене',
        'sl-SI': 'Predstavljeno v novičniku',
        'uk-UA': 'Рекомендується в інформаційному бюлетені',
        'zh-CN': '在通讯中推荐',
      },
      {
        en: 'Featured on social media',
        'fr-FR': 'Mis en avant sur les réseaux sociaux',
        'ar-SA': 'معروض على وسائل التواصل الاجتماعي',
        'de-DE': 'Auf Social Media vorgestellt',
        'es-ES': 'Destacado en redes sociales',
        'it-IT': 'In primo piano sui social media',
        'ja-JP': 'ソーシャルメディアで紹介',
        'ko-KR': '소셜 미디어에 게재',
        'pl-PL': 'Wyróżniony w mediach społecznościowych',
        'pt-BR': 'Destacado nas redes sociais',
        'ru-RU': 'Рекомендуется в социальных сетях',
        'sl-SI': 'Predstavljeno na družbenih medijih',
        'uk-UA': 'Рекомендується в соціальних мережах',
        'zh-CN': '在社交媒体上推荐',
      },
      {
        en: 'Up to 1500 clicks to your game',
        'fr-FR': "Jusqu'à 1500 clics vers votre jeu",
        'ar-SA': 'ما يصل إلى 1500 نقرة على لعبتك',
        'de-DE': 'Bis zu 1500 Klicks auf Ihr Spiel',
        'es-ES': 'Hasta 1500 clics en tu juego',
        'it-IT': 'Fino a 1500 clic sul tuo gioco',
        'ja-JP': 'ゲームへの最大1500回のクリック',
        'ko-KR': '게임에 최대 1500 번 클릭',
        'pl-PL': 'Do 1500 kliknięć w Twoją grę',
        'pt-BR': 'Até 1500 cliques no seu jogo',
        'ru-RU': 'До 1500 кликов на вашу игру',
        'sl-SI': 'Do 1500 klikov na vašo igro',
        'uk-UA': 'До 1500 кліків на вашу гру',
        'zh-CN': '最多1500次点击到您的游戏',
      },
    ],
  },
  {
    id: 'featuring-premium',
    nameByLocale: {
      en: 'Premium',
    },
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
        en: 'Hundreds of thousands of monthly users',
        'fr-FR': "Des centaines de milliers d'utilisateurs mensuels",
        'ar-SA': 'مئات الآلاف من المستخدمين الشهريين',
        'de-DE': 'Hunderttausende von monatlichen Nutzern',
        'es-ES': 'Cientos de miles de usuarios mensuales',
        'it-IT': 'Centinaia di migliaia di utenti mensili',
        'ja-JP': '数十万人の月間ユーザー',
        'ko-KR': '수십만 명의 월간 사용자',
        'pl-PL': 'Setki tysięcy użytkowników miesięcznie',
        'pt-BR': 'Centenas de milhares de usuários mensais',
        'ru-RU': 'Сотни тысяч ежемесячных пользователей',
        'sl-SI': 'Stotine tisoč mesečnih uporabnikov',
        'uk-UA': 'Сотні тисяч щомісячних користувачів',
        'zh-CN': '数十万月度用户',
      },
    ],
  },
];

export const LoadingAndError = () => {
  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithNoSubscriptionAndCredits}
    >
      <MarketingPlans game={fakeGame} />
    </AuthenticatedUserContext.Provider>
  );
};

export const Default = () => {
  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithNoSubscriptionAndCredits}
    >
      <MarketingPlans game={fakeGame} />
    </AuthenticatedUserContext.Provider>
  );
};
Default.parameters = {
  mockData: [
    {
      url: `${
        GDevelopGameApi.baseUrl
      }/game-featuring?userId=indie-user&gameId=complete-game-id`,
      method: 'GET',
      status: 200,
      response: [],
    },
    {
      url: `${GDevelopGameApi.baseUrl}/marketing-plan`,
      method: 'GET',
      status: 200,
      response: marketingPlans,
    },
  ],
};

export const WithOwnedActiveBasicPlan = () => {
  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithNoSubscriptionAndCredits}
    >
      <MarketingPlans game={fakeGame} />
    </AuthenticatedUserContext.Provider>
  );
};
WithOwnedActiveBasicPlan.parameters = {
  mockData: [
    {
      url: `${
        GDevelopGameApi.baseUrl
      }/game-featuring?userId=indie-user&gameId=complete-game-id`,
      method: 'GET',
      status: 200,
      response: [
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
      ],
    },
    {
      url: `${GDevelopGameApi.baseUrl}/marketing-plan`,
      method: 'GET',
      status: 200,
      response: marketingPlans,
    },
  ],
};

export const WithOwnedExpiredBasicPlan = () => {
  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithNoSubscriptionAndCredits}
    >
      <MarketingPlans game={fakeGame} />
    </AuthenticatedUserContext.Provider>
  );
};
WithOwnedExpiredBasicPlan.parameters = {
  mockData: [
    {
      url: `${
        GDevelopGameApi.baseUrl
      }/game-featuring?userId=indie-user&gameId=complete-game-id`,
      method: 'GET',
      status: 200,
      response: [
        {
          gameId: 'complete-game-id',
          featuring: 'games-platform-game-page',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowMinusOneDay / 1000,
        },
        {
          gameId: 'complete-game-id',
          featuring: 'games-platform-home',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowMinusOneDay / 1000,
        },
        {
          gameId: 'complete-game-id',
          featuring: 'games-platform-listing',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowMinusOneDay / 1000,
        },
      ],
    },
    {
      url: `${GDevelopGameApi.baseUrl}/marketing-plan`,
      method: 'GET',
      status: 200,
      response: marketingPlans,
    },
  ],
};

export const WithOwnedProPlan = () => {
  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithNoSubscriptionAndCredits}
    >
      <MarketingPlans game={fakeGame} />
    </AuthenticatedUserContext.Provider>
  );
};
WithOwnedProPlan.parameters = {
  mockData: [
    {
      url: `${
        GDevelopGameApi.baseUrl
      }/game-featuring?userId=indie-user&gameId=complete-game-id`,
      method: 'GET',
      status: 200,
      response: [
        {
          gameId: 'complete-game-id',
          featuring: 'socials-newsletter',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowPlusOneDay / 1000,
        },
      ],
    },
    {
      url: `${GDevelopGameApi.baseUrl}/marketing-plan`,
      method: 'GET',
      status: 200,
      response: marketingPlans,
    },
  ],
};

export const WithOwnedPremiumPlan = () => {
  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithNoSubscriptionAndCredits}
    >
      <MarketingPlans game={fakeGame} />
    </AuthenticatedUserContext.Provider>
  );
};
WithOwnedPremiumPlan.parameters = {
  mockData: [
    {
      url: `${
        GDevelopGameApi.baseUrl
      }/game-featuring?userId=indie-user&gameId=complete-game-id`,
      method: 'GET',
      status: 200,
      response: [
        {
          gameId: 'complete-game-id',
          featuring: 'gdevelop-banner',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowPlusOneDay / 1000,
        },
      ],
    },
    {
      url: `${GDevelopGameApi.baseUrl}/marketing-plan`,
      method: 'GET',
      status: 200,
      response: marketingPlans,
    },
  ],
};
