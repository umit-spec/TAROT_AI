// GENERATED — DO NOT EDIT
// Produced by tools/assets/generate_tarot_artwork_registry.py from:
//   - data/cards/*.json (the real CardId catalog the reading engine uses)
//   - assets/tarot-cards-v2/provenance-manifest.json (canonical source hashes)
//   - assets/tarot-cards-v2/derivatives/derivative-manifest.json (production WebP hashes)
//
// This registry is exhaustive over the app's real 22-card Major Arcana
// CardId catalog only (docs/UI_PREMIUM_V1.md FAZ 9). The governed Full Deck
// V2 asset set also includes 56 Minor Arcana cards, but the reading engine
// (src/server/reading-engine/cards.ts) hard-fails unless data/cards contains
// exactly 22 Major Arcana cards - there is no CardId a Minor Arcana card
// could ever be shown for, so none is registered here.

export type CardId =
  | '00-fool'
  | '01-magician'
  | '02-high-priestess'
  | '03-empress'
  | '04-emperor'
  | '05-hierophant'
  | '06-lovers'
  | '07-chariot'
  | '08-strength'
  | '09-hermit'
  | '10-wheel-of-fortune'
  | '11-justice'
  | '12-hanged-man'
  | '13-death'
  | '14-temperance'
  | '15-devil'
  | '16-tower'
  | '17-star'
  | '18-moon'
  | '19-sun'
  | '20-judgement'
  | '21-world';

export type CardArtworkEntry = {
  src: string;
  width: 512;
  height: 768;
  sourceSha256: string;
  derivativeSha256: string;
};

export const CARD_ARTWORK = {
  '00-fool': {
    src: '/assets/tarot-cards/v2/00_Deli.webp',
    width: 512,
    height: 768,
    sourceSha256: 'bd23ef89aa45f4d70d26e0ac2fc26726a710044b03eef94f77523d9ccd53712a',
    derivativeSha256: '93f2f3062fc67e84e14ab43ecfc457350d28ebea81b589fdc3f9a57cdf271f28',
  },
  '01-magician': {
    src: '/assets/tarot-cards/v2/01_Buyucu.webp',
    width: 512,
    height: 768,
    sourceSha256: '83ffaaef3b9acd5914d299b651be6d0e61037585b710e14996b1ad78c8538dcd',
    derivativeSha256: '282605647762042f0cbc1c1439766df67edd392d1049d2f9434c9d739a201445',
  },
  '02-high-priestess': {
    src: '/assets/tarot-cards/v2/02_Yuksek_Rahibe.webp',
    width: 512,
    height: 768,
    sourceSha256: '016056304fd84226c7de0d11416b9465e94b2a681690b9498f390754174f4b60',
    derivativeSha256: '28ef6ce4f71731976059a5d2cb73d9157c0d7e082ecf7f1fca1aaa6643b29058',
  },
  '03-empress': {
    src: '/assets/tarot-cards/v2/03_Imparatorice.webp',
    width: 512,
    height: 768,
    sourceSha256: '51dd6866cf3bab867077d56b803f973b6b15975a228f2685c02873996174bf51',
    derivativeSha256: '7cb51188dce890fd2f78997c3ba90e095e91a4156188cb2ff813fc48bf62aa61',
  },
  '04-emperor': {
    src: '/assets/tarot-cards/v2/04_Imparator.webp',
    width: 512,
    height: 768,
    sourceSha256: 'a9a646967b8bbc4154cd5be49b908124b13504a9b500172e3202d2d62fa0da8b',
    derivativeSha256: 'e55726cabd8520f09bc6c99ed13442e8d40223f71e794c40a5f6098268c55e31',
  },
  '05-hierophant': {
    src: '/assets/tarot-cards/v2/05_Aziz.webp',
    width: 512,
    height: 768,
    sourceSha256: '525c21678d8ddd83540dad38f66028883c99cc598acbd57c44a241e3038981cb',
    derivativeSha256: 'b8480661a5dbaa705a4984f5a058f22e10f3bc3137c693c1f5d7d98a8b64d621',
  },
  '06-lovers': {
    src: '/assets/tarot-cards/v2/06_Asiklar.webp',
    width: 512,
    height: 768,
    sourceSha256: 'df13adadbfafd67c124353a66ee4a03da624347a4bd0c00448d72e01ec5f4e4b',
    derivativeSha256: '7151e2e1e144399b8dc892cebd5c0f47ba8d4d0c53889b5211ecbc605cc822c8',
  },
  '07-chariot': {
    src: '/assets/tarot-cards/v2/07_Savas_Arabasi.webp',
    width: 512,
    height: 768,
    sourceSha256: 'cbfc0ca5eb7f8212d15ffc8cfcdfae7d4436fea505f94c6a4d76106ab96bc168',
    derivativeSha256: '8d3d1dfbfd36c688abe9972152f8eff464368eaf96c9579668dc97eb93930bef',
  },
  '08-strength': {
    src: '/assets/tarot-cards/v2/08_Guc.webp',
    width: 512,
    height: 768,
    sourceSha256: 'f1d6bfd63e2746a39bde9770fd5f5334e7ad05f8b47575fc111b385d668a91f1',
    derivativeSha256: 'fe62bcc7f52779798a451e3c00ee7997871ec1059fa3b9b39008ad2e6c667f5a',
  },
  '09-hermit': {
    src: '/assets/tarot-cards/v2/09_Ermis.webp',
    width: 512,
    height: 768,
    sourceSha256: 'c9f848e65de98366184a0007adb31280e1197397bd9fb027f8d71ee75900a9d5',
    derivativeSha256: '65f9e33a341d231058768e05eab043a25febfc4c9235668a3990920ccfca0f41',
  },
  '10-wheel-of-fortune': {
    src: '/assets/tarot-cards/v2/10_Kader_Carki.webp',
    width: 512,
    height: 768,
    sourceSha256: '8ad137728d56f6729eaeeaa77bdc8974c5447c8636c929972b6be1a00980de8e',
    derivativeSha256: 'b511ec3ed5d4c5cbf773e0606071afdba3d9ad68e4828785fd69b38b39a4c566',
  },
  '11-justice': {
    src: '/assets/tarot-cards/v2/11_Adalet.webp',
    width: 512,
    height: 768,
    sourceSha256: '89108d542c2de1086c2bc3a59d91de562efdba31b93e825549e109b4ef1d5542',
    derivativeSha256: '7fd12e073e0f75d3496394841d813bb7e48aa209e00d1821593aed269b148471',
  },
  '12-hanged-man': {
    src: '/assets/tarot-cards/v2/12_Asilan_Adam.webp',
    width: 512,
    height: 768,
    sourceSha256: '52ad814f75cc7014665ec2fe977a13ec16f65f5983d7f01fd34c91368eaa7dfa',
    derivativeSha256: 'cc405a7fcc1215888eb3ab412ed3151a2056f1eb989a4117c82edf84adb037f9',
  },
  '13-death': {
    src: '/assets/tarot-cards/v2/13_Olum.webp',
    width: 512,
    height: 768,
    sourceSha256: 'e29beda9e36cf231ee1823d4c1e694c0469fa8fda27f900a45785b80b08c2c01',
    derivativeSha256: '7ed58e6f05465bf17521d202e8f8b5cc3bfde123b734c9f56b80030e34390d49',
  },
  '14-temperance': {
    src: '/assets/tarot-cards/v2/14_Denge.webp',
    width: 512,
    height: 768,
    sourceSha256: 'de3086db3fcf6718c736fdc902518b3e4e44ad4713b3198c969ddb3b02759ea7',
    derivativeSha256: 'b576b9ef12ab7bb9134e5c338bcb8e591e3cc681b7f5f23192fe5d3c6ca1e5a7',
  },
  '15-devil': {
    src: '/assets/tarot-cards/v2/15_Seytan.webp',
    width: 512,
    height: 768,
    sourceSha256: 'ebcb34749262600df837517e8ee31fe1be8b2b19fa708aec2a2ca918f5a7ed92',
    derivativeSha256: '1c3d887bd07748f2f60c7a9db75ff84c683e9c4eab8711e35588a37c9e1f78ce',
  },
  '16-tower': {
    src: '/assets/tarot-cards/v2/16_Kule.webp',
    width: 512,
    height: 768,
    sourceSha256: 'b012756b6f3552c0c672c0b6603cd09dffa267fe8fa13a705eb98de289b8debe',
    derivativeSha256: '536097d6218ca328eb9744064f14fc4837e4c9a1fae2a73b16388b66bf87692a',
  },
  '17-star': {
    src: '/assets/tarot-cards/v2/17_Yildiz.webp',
    width: 512,
    height: 768,
    sourceSha256: '89f66392e2074ab555413da8e20a00bb936a7c655b4ad078fca355cb49dacfd1',
    derivativeSha256: '21266280399854a336270207574adc190b05964b82391747a9f4908c183905d6',
  },
  '18-moon': {
    src: '/assets/tarot-cards/v2/18_Ay.webp',
    width: 512,
    height: 768,
    sourceSha256: 'd996cb42528bea87dbef449f9f231da44e3f71050eb601f16fe380023b94c7af',
    derivativeSha256: '087867ba67f37003338842c37fd3ee4f8c69d020c28fb10f814031096257b7aa',
  },
  '19-sun': {
    src: '/assets/tarot-cards/v2/19_Gunes.webp',
    width: 512,
    height: 768,
    sourceSha256: '0314ada009b3cd7b1fe57f17ecde4eb454ee76b2fff07baf18fe0581b993e648',
    derivativeSha256: 'cc337363bc7f70eda16266641bc322ea0539528db1c976a3e676830e064084e0',
  },
  '20-judgement': {
    src: '/assets/tarot-cards/v2/20_Yargi.webp',
    width: 512,
    height: 768,
    sourceSha256: '9e29427a9fa8447944421175a4f3e67916c7be6f659bc8a66800fe352cf1e02e',
    derivativeSha256: '846eb6d9fa735225d31f6599c659b4006b7ca6d51c43c4987be13325c1c9a285',
  },
  '21-world': {
    src: '/assets/tarot-cards/v2/21_Dunya.webp',
    width: 512,
    height: 768,
    sourceSha256: 'c27f12c5d369e955a33e08550e5a2888b393ae854a6f5872a12cbbaa9cd1d79c',
    derivativeSha256: '4545f255ba3dab30110a248fde0deb76e9b95fdfefa088f1966bef044d86f4fc',
  },
} satisfies Record<CardId, CardArtworkEntry>;

export const CARD_BACK_ARTWORK: CardArtworkEntry = {
  src: '/assets/tarot-cards/v2/Card_Back.webp',
  width: 512,
  height: 768,
  sourceSha256: '90a240e72624e78720001a8088b38e230e7a374b03e526b4d8ff0bee6dbdb0b4',
  derivativeSha256: '0fc8e544a27e737a9181554e6e7239d1ed502a558edc01d7c79fbaea80b85364',
};
