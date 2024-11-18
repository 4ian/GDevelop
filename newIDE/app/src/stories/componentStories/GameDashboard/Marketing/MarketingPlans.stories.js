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
  type MarketingPlan,
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

const marketingPlans: MarketingPlan[] = [
  {
    id: 'featuring-basic',
    nameByLocale: {
      en: 'gd.games Boost',
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
    ownedBulletPointsByLocale: [
      {
        en: `Your game is promoted on gd.games.`,
        'fr-FR': `Votre jeu est mis en avant sur gd.games.`,
        'ar-SA': `يتم الترويج للعبتك على gd.games.`,
        'de-DE': `Ihr Spiel wird auf gd.games beworben.`,
        'es-ES': `Tu juego es promocionado en gd.games.`,
        'it-IT': `Il tuo gioco è promosso su gd.games.`,
        'ja-JP': `あなたのゲームはgd.gamesで宣伝されます。`,
        'ko-KR': `귀하의 게임은 gd.games에서 홍보됩니다.`,
        'pl-PL': `Twoja gra jest promowana na gd.games.`,
        'pt-BR': `Seu jogo é promovido no gd.games.`,
        'ru-RU': `Ваша игра рекламируется на gd.games.`,
        'sl-SI': `Vaša igra je promovirana na gd.games.`,
        'uk-UA': `Ваша гра рекламується на gd.games.`,
        'zh-CN': `您的游戏在gd.games上推广。`,
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
    showExpirationDate: true,
  },
  {
    id: 'featuring-pro',
    nameByLocale: {
      en: 'Super Boost',
    },
    icon: 'speedometer',
    canExtend: false,
    requiresManualContact: false,
    includedFeaturings: [
      'games-platform-home',
      'games-platform-listing',
      'games-platform-game-page',
      'games-platform-guaranteed-sessions',
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
        en: `Active until you get 1000 more players`,
        'fr-FR': `Actif jusqu'à ce que vous obteniez 1000 joueurs supplémentaires`,
        'ar-SA': `نشط حتى تحصل على 1000 لاعبًا آخرين`,
        'de-DE': `Aktiv, bis Sie 1000 weitere Spieler erhalten`,
        'es-ES': `Activo hasta que obtengas 1000 jugadores más`,
        'it-IT': `Attivo fino a quando non ottieni 1000 giocatori in più`,
        'ja-JP': `1000人以上のプレイヤーを獲得するまで有効です`,
        'ko-KR': `1000명 이상의 플레이어를 얻을 때까지 활성화됩니다`,
        'pl-PL': `Aktywny do momentu zdobycia 1000 dodatkowych graczy`,
        'pt-BR': `Ativo até você obter 1000 jogadores adicionais`,
        'ru-RU': `Активно до тех пор, пока вы не получите 1000 дополнительных игроков`,
        'sl-SI': `Aktivno, dokler ne pridobite 1000 dodatnih igralcev`,
        'uk-UA': `Активний, поки ви не отримаєте 1000 додаткових гравців`,
        'zh-CN': `活动直到您获得1000名以上的玩家`,
      },
      {
        en:
          'Immediate impact: Get new players from around the world thanks to ads we run for your game.',
        'fr-FR':
          'Impact immédiat : Obtenez de nouveaux joueurs du monde entier grâce aux publicités que nous diffusons pour votre jeu.',
        'ar-SA':
          'تأثير فوري: احصل على لاعبين جدد من جميع أنحاء العالم بفضل الإعلانات التي نقوم بتشغيلها للعبتك.',
        'de-DE':
          'Sofortige Wirkung: Erhalten Sie neue Spieler aus der ganzen Welt dank der Anzeigen, die wir für Ihr Spiel schalten.',
        'es-ES':
          'Impacto inmediato: Obtén nuevos jugadores de todo el mundo gracias a los anuncios que ejecutamos para tu juego.',
        'it-IT':
          'Impatto immediato: Ottieni nuovi giocatori da tutto il mondo grazie agli annunci che eseguiamo per il tuo gioco.',
        'ja-JP':
          '即時的な影響：私たちがあなたのゲームのために実施する広告のおかげで、世界中から新しいプレイヤーを獲得します。',
        'ko-KR':
          '즉각적인 효과: 광고 덕분에 전 세계의 새로운 플레이어를 얻을 수 있습니다.',
        'pl-PL':
          'Natychmiastowy efekt: Zyskaj nowych graczy z całego świata dzięki reklamom, które prowadzimy dla twojej gry.',
        'pt-BR':
          'Impacto imediato: Obtenha novos jogadores de todo o mundo graças aos anúncios que executamos para o seu jogo.',
        'ru-RU':
          'Немедленное воздействие: Получите новых игроков со всего мира благодаря рекламе, которую мы размещаем для вашей игры.',
        'sl-SI':
          'Takojšnji učinek: Zahvaljujoč oglasom, ki jih objavljamo za vašo igro, pridobite nove igralce z vsega sveta.',
        'uk-UA':
          'Миттєвий вплив: Отримайте нових гравців з усього світу завдяки рекламі, яку ми розміщуємо для вашої гри.',
        'zh-CN':
          '立即影响：通过我们为您的游戏运行的广告，从世界各地获得新玩家。',
      },
      {
        en: `Game promoted everywhere on gd.games for 10 days`,
        'fr-FR': `Jeu promu partout sur gd.games pendant 10 jours`,
        'ar-SA': `ترويج اللعبة في كل مكان على gd.games لمدة 10 أيام`,
        'de-DE': `Spiel wird überall auf gd.games für 10 Tage`,
        'es-ES': `Juego promocionado en todo gd.games durante 10 días`,
        'it-IT': `Gioco promosso ovunque su gd.games per 10 giorni`,
        'ja-JP': `gd.gamesのどこでも10日間ゲームを宣伝し、目標達成まで広告を掲載します。`,
        'ko-KR': `gd.games의 모든 곳에서 10 일 동안 게임을 홍보하고, 목표 달성까지 광고를 게재합니다.`,
        'pl-PL': `Gra promowana wszędzie na gd.games przez 10 dni`,
        'pt-BR': `Jogo promovido em todo o gd.games por 10 dias`,
        'ru-RU': `Игра рекламируется повсюду на gd.games в течение 10 дней`,
        'sl-SI': `Igra je promovirana povsod na gd.games za 10 dni`,
        'uk-UA': `Гра рекламується всюди на gd.games протягом 10 днів`,
        'zh-CN': `在gd.games的所有地方推广游戏10天`,
      },
    ],
    ownedBulletPointsByLocale: [
      {
        en: `Ads are being run for your game until it reaches its boost goal.`,
        'fr-FR': `Des publicités sont diffusées pour votre jeu jusqu'à ce qu'il atteigne son objectif de boost.`,
        'ar-SA': `تتم تشغيل الإعلانات للعبتك حتى تصل إلى هدفها.`,
        'de-DE': `Anzeigen werden für Ihr Spiel geschaltet, bis es sein Ziel erreicht.`,
        'es-ES': `Se están ejecutando anuncios para tu juego hasta que alcance su objetivo de impulso.`,
        'it-IT': `Gli annunci vengono eseguiti per il tuo gioco fino a quando non raggiunge il suo obiettivo di impulso.`,
        'ja-JP': `ゲームが目標に達するまで広告が実施されます。`,
        'ko-KR': `게임이 목표에 도달할 때까지 광고가 게재됩니다.`,
        'pl-PL': `Reklamy są prowadzone dla twojej gry do momentu osiągnięcia celu promocji.`,
        'pt-BR': `Anúncios estão sendo executados para o seu jogo até que ele atinja seu objetivo de destaque.`,
        'ru-RU': `Реклама размещается для вашей игры до достижения цели посиления.`,
        'sl-SI': `Oglasi se izvajajo za vašo igro, dokler ne doseže svojega cilja.`,
        'uk-UA': `Реклама розміщується для вашої гри до досягнення цілі підсилення.`,
        'zh-CN': `广告将一直运行，直到您的游戏达到其目标。`,
      },
      {
        en: `You will receive an email with the results of the featuring.`,
        'fr-FR': `Vous recevrez un e-mail avec les résultats de la mise en avant.`,
        'ar-SA': `ستتلقى بريدًا إلكترونيًا يحتوي على نتائج الترويج.`,
        'de-DE': `Sie erhalten eine E-Mail mit den Ergebnissen der Bewerbung.`,
        'es-ES': `Recibirás un correo electrónico con los resultados de la promoción.`,
        'it-IT': `Riceverai un'email con i risultati della promozione.`,
        'ja-JP': `フィーチャリングの結果を記載したメールが届きます。`,
        'ko-KR': `추천 결과가 포함된 이메일을 받게 됩니다.`,
        'pl-PL': `Otrzymasz e-mail z wynikami promocji.`,
        'pt-BR': `Você receberá um e-mail com os resultados do destaque.`,
        'ru-RU': `Вы получите электронное письмо с результатами рекламы.`,
        'sl-SI': `Prejeli boste e-pošto z rezultati promocije.`,
        'uk-UA': `Ви отримаєте електронний лист з результатами реклами.`,
        'zh-CN': `您将收到一封包含推广结果的电子邮件。`,
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
    showExpirationDate: false,
  },
  {
    id: 'featuring-premium',
    nameByLocale: {
      en: 'Mega Boost',
    },
    icon: 'stars',
    canExtend: false,
    requiresManualContact: true,
    includedFeaturings: [
      'games-platform-home',
      'games-platform-listing',
      'games-platform-game-page',
      'games-platform-guaranteed-sessions',
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
        en: `Active until you get 3000 more players`,
        'fr-FR': `Actif jusqu'à ce que vous obteniez 3000 joueurs supplémentaires`,
        'ar-SA': `نشط حتى تحصل على 3000 لاعبًا آخرين`,
        'de-DE': `Aktiv, bis Sie 3000 weitere Spieler erhalten`,
        'es-ES': `Activo hasta que obtengas 3000 jugadores más`,
        'it-IT': `Attivo fino a quando non ottieni 3000 giocatori in più`,
        'ja-JP': `3000人以上のプレイヤーを獲得するまで有効です`,
        'ko-KR': `3000명 이상의 플레이어를 얻을 때까지 활성화됩니다`,
        'pl-PL': `Aktywny do momentu zdobycia 3000 dodatkowych graczy`,
        'pt-BR': `Ativo até você obter 3000 jogadores adicionais`,
        'ru-RU': `Активно до тех пор, пока вы не получите 3000 дополнительных игроков`,
        'sl-SI': `Aktivno, dokler ne pridobite 3000 dodatnih igralcev`,
        'uk-UA': `Активний, поки ви не отримаєте 3000 додаткових гравців`,
        'zh-CN': `活动直到您获得3000名以上的玩家`,
      },
      {
        en:
          'Immediate impact: Get new players from around the world thanks to ads we run for your game',
        'fr-FR':
          'Impact immédiat : Obtenez de nouveaux joueurs du monde entier grâce aux publicités que nous diffusons pour votre jeu',
        'ar-SA':
          'تأثير فوري: احصل على لاعبين جدد من جميع أنحاء العالم بفضل الإعلانات التي نقوم بتشغيلها للعبتك',
        'de-DE':
          'Sofortige Wirkung: Erhalten Sie neue Spieler aus der ganzen Welt dank der Anzeigen, die wir für Ihr Spiel schalten',
        'es-ES':
          'Impacto inmediato: Obtén nuevos jugadores de todo el mundo gracias a los anuncios que ejecutamos para tu juego',
        'it-IT':
          'Impatto immediato: Ottieni nuovi giocatori da tutto il mondo grazie agli annunci che eseguiamo per il tuo gioco',
        'ja-JP':
          '即時的な影響：私たちがあなたのゲームのために実施する広告のおかげで、世界中から新しいプレイヤーを獲得します。',
        'ko-KR':
          '즉각적인 효과: 광고 덕분에 전 세계의 새로운 플레이어를 얻을 수 있습니다',
        'pl-PL':
          'Natychmiastowy efekt: Zyskaj nowych graczy z całego świata dzięki reklamom, które prowadzimy dla twojej gry',
        'pt-BR':
          'Impacto imediato: Obtenha novos jogadores de todo o mundo graças aos anúncios que executamos para o seu jogo',
        'ru-RU':
          'Немедленное воздействие: Получите новых игроков со всего мира благодаря рекламе, которую мы размещаем для вашей игры',
        'sl-SI':
          'Takojšnji učinek: Zahvaljujoč oglasom, ki jih objavljamo za vašo igro, pridobite nove igralce z vsega sveta',
        'uk-UA':
          'Миттєвий вплив: Отримайте нових гравців з усього світу завдяки рекламі, яку ми розміщуємо для вашої гри',
        'zh-CN':
          '立即影响：通过我们为您的游戏运行的广告，从世界各地获得新玩家。',
      },
      {
        en: `Game promoted everywhere on gd.games for 15 days`,
        'fr-FR': `Jeu promu partout sur gd.games pendant 15 jours`,
        'ar-SA': `ترويج اللعبة في كل مكان على gd.games لمدة 15 يومًا`,
        'de-DE': `Spiel wird überall auf gd.games für 15 Tage`,
        'es-ES': `Juego promocionado en todo gd.games durante 15 días`,
        'it-IT': `Gioco promosso ovunque su gd.games per 15 giorni`,
        'ja-JP': `gd.gamesのどこでも15日間ゲームを宣伝し、目標達成まで広告を掲載します。`,
        'ko-KR': `gd.games의 모든 곳에서 15 일 동안 게임을 홍보하고, 목표 달성까지 광고를 게재합니다.`,
        'pl-PL': `Gra promowana wszędzie na gd.games przez 15 dni`,
        'pt-BR': `Jogo promovido em todo o gd.games por 15 dias`,
        'ru-RU': `Игра рекламируется повсюду на gd.games в течение 15 дней`,
        'sl-SI': `Igra je promovirana povsod na gd.games za 15 dni`,
        'uk-UA': `Гра рекламується всюди на gd.games протягом 15 днів`,
        'zh-CN': `在gd.games的所有地方推广游戏15天`,
      },
    ],
    ownedBulletPointsByLocale: [
      {
        en: `Ads are being run for your game until it reaches its boost goal.`,
        'fr-FR': `Des publicités sont diffusées pour votre jeu jusqu'à ce qu'il atteigne son objectif de boost.`,
        'ar-SA': `تتم تشغيل الإعلانات للعبتك حتى تصل إلى هدفها.`,
        'de-DE': `Anzeigen werden für Ihr Spiel geschaltet, bis es sein Ziel erreicht.`,
        'es-ES': `Se están ejecutando anuncios para tu juego hasta que alcance su objetivo de impulso.`,
        'it-IT': `Gli annunci vengono eseguiti per il tuo gioco fino a quando non raggiunge il suo obiettivo di impulso.`,
        'ja-JP': `ゲームが目標に達するまで広告が実施されます。`,
        'ko-KR': `게임이 목표에 도달할 때까지 광고가 게재됩니다.`,
        'pl-PL': `Reklamy są prowadzone dla twojej gry do momentu osiągnięcia celu promocji.`,
        'pt-BR': `Anúncios estão sendo executados para o seu jogo até que ele atinja seu objetivo de destaque.`,
        'ru-RU': `Реклама размещается для вашей игры до достижения цели посиления.`,
        'sl-SI': `Oglasi se izvajajo za vašo igro, dokler ne doseže svojega cilja.`,
        'uk-UA': `Реклама розміщується для вашої гри до досягнення цілі підсилення.`,
        'zh-CN': `广告将一直运行，直到您的游戏达到其目标。`,
      },
      {
        en: `You will receive an email with the results of the featuring.`,
        'fr-FR': `Vous recevrez un e-mail avec les résultats de la mise en avant.`,
        'ar-SA': `ستتلقى بريدًا إلكترونيًا يحتوي على نتائج الترويج.`,
        'de-DE': `Sie erhalten eine E-Mail mit den Ergebnissen der Bewerbung.`,
        'es-ES': `Recibirás un correo electrónico con los resultados de la promoción.`,
        'it-IT': `Riceverai un'email con i risultati della promozione.`,
        'ja-JP': `フィーチャリングの結果を記載したメールが届きます。`,
        'ko-KR': `추천 결과가 포함된 이메일을 받게 됩니다.`,
        'pl-PL': `Otrzymasz e-mail z wynikami promocji.`,
        'pt-BR': `Você receberá um e-mail com os resultados do destaque.`,
        'ru-RU': `Вы получите электронное письмо с результатами рекламы.`,
        'sl-SI': `Prejeli boste e-pošto z rezultati promocije.`,
        'uk-UA': `Ви отримаєте електронний лист з результатами реклами.`,
        'zh-CN': `您将收到一封包含推广结果的电子邮件。`,
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
    showExpirationDate: false,
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
        {
          gameId: 'complete-game-id',
          featuring: 'games-platform-guaranteed-sessions',
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
        {
          gameId: 'complete-game-id',
          featuring: 'games-platform-guaranteed-sessions',
          createdAt: nowMinusOneDay / 1000,
          updatedAt: nowMinusOneDay / 1000,
          expiresAt: nowPlusOneDay / 1000,
        },
      ]}
    />
  );
};
