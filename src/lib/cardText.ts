export type CardLang = 'en' | 'si';

// Track ids are stored in saved cards and shared links, so never rename or remove one.
export const MUSIC_TRACKS = ['music-box', 'lofi', 'piano', 'guitar', 'jazz', 'strings', 'arcade', 'party', 'island', 'none'] as const;

export type MusicTrack = (typeof MUSIC_TRACKS)[number];

export function isMusicTrack(value: unknown): value is MusicTrack {
  return typeof value === 'string' && (MUSIC_TRACKS as readonly string[]).includes(value);
}

/** Text the recipient sees. It follows the language chosen for the card, not the website language. */
export const CARD_TEXT = {
  en: {
    unableToLoad: 'Unable to Load Card',
    notFound: 'This birthday card could not be found. It may have been deleted or the link is invalid.',
    invalidLink: 'The link contains invalid configuration data.',
    loadError: 'An error occurred while loading this birthday card.',
    createYourOwn: 'Create Your Own Card',
    hello: 'Hello, ',
    happyBirthdayTo: 'Happy Birthday, ',
    gestureDesc: 'A little sweet gesture for you! Make a wish and blow out the candles.',
    happyBirthday: 'Happy Birthday!',
    age: 'Age',
    clickPhoto: 'Tap photo to slide',
    blowAgain: 'Blow Candles Again',
    specialGift: 'You have a special gift!',
    tapToOpen: 'Tap the box to open',
    tapForSong: 'Your birthday song starts when you tap',
    blowAll: 'Blow Out All Candles',
    makeAWish: 'Make a wish!',
    muteMusic: 'Mute music',
    playMusic: 'Play music',
  },
  si: {
    unableToLoad: 'කාඩ්පත පූරණය කිරීමට නොහැකි විය',
    notFound: 'මෙම උපන් දින සුභපැතුම් පත සොයාගත නොහැකි විය. එය මකා දමා තිබිය හැක හෝ සබැඳිය වැරදි විය හැක.',
    invalidLink: 'සබැඳියෙහි දෝෂ සහිත දත්ත අඩංගු වේ.',
    loadError: 'කාඩ්පත පූරණය කිරීමේදී දෝෂයක් සිදු විය.',
    createYourOwn: 'ඔබේම සුභපැතුම් පතක් සාදන්න',
    hello: 'ආයුබෝවන්, ',
    happyBirthdayTo: 'සුභ උපන්දිනයක්, ',
    gestureDesc: 'ඔබ වෙනුවෙන් කුඩා මිහිරි සුභපැතුමක්! ප්‍රාර්ථනාවක් කර ඉටිපන්දම් පිඹ නිවා දමන්න.',
    happyBirthday: 'සුභ උපන්දිනයක්!',
    age: 'වයස',
    clickPhoto: 'ඊළඟ පින්තූරය සඳහා ස්පර්ශ කරන්න',
    blowAgain: 'නැවත ඉටිපන්දම් පිඹින්න',
    specialGift: 'ඔබට විශේෂ තෑග්ගක් තිබේ!',
    tapToOpen: 'විවෘත කිරීමට පෙට්ටිය ස්පර්ශ කරන්න',
    tapForSong: 'ස්පර්ශ කළ විට ඔබේ උපන්දින ගීතය ආරම්භ වේ',
    blowAll: 'සියලු ඉටිපන්දම් පිඹ නිවන්න',
    makeAWish: 'ප්‍රාර්ථනාවක් කරන්න!',
    muteMusic: 'සංගීතය නවත්වන්න',
    playMusic: 'සංගීතය වාදනය කරන්න',
  },
} as const;

export const MUSIC_LABELS: Record<MusicTrack, { en: string; si: string; emoji: string; hint: { en: string; si: string } }> = {
  'music-box': { emoji: '🎁', en: 'Music Box', si: 'සංගීත පෙට්ටිය', hint: { en: 'Classic, nostalgic', si: 'සම්භාව්‍ය, අතීත මතක' } },
  lofi: { emoji: '☕', en: 'Lofi', si: 'ලොෆයි', hint: { en: 'Cozy, chill', si: 'සුවපහසු, සන්සුන්' } },
  piano: { emoji: '🎹', en: 'Piano', si: 'පියානෝව', hint: { en: 'Elegant, emotional', si: 'අලංකාර, හැඟීම්බර' } },
  guitar: { emoji: '🎸', en: 'Acoustic Guitar', si: 'ගිටාරය', hint: { en: 'Warm, strummed', si: 'උණුසුම්, මෘදු' } },
  jazz: { emoji: '🎷', en: 'Swing Jazz', si: 'ස්වින්ග් ජෑස්', hint: { en: 'Sax, bass, cymbals', si: 'සැක්ස්, බේස්, සිම්බල්' } },
  strings: { emoji: '🎻', en: 'Real Violin', si: 'සැබෑ වයලීනය', hint: { en: 'Happy Birthday song', si: 'සුභ උපන්දින ගීතය' } },
  arcade: { emoji: '👾', en: '8-Bit Arcade', si: '8-bit ගේම්', hint: { en: 'Fast video game', si: 'වේගවත් වීඩියෝ ගේම්' } },
  party: { emoji: '🪩', en: 'Party Dance', si: 'සාද නැටුම්', hint: { en: 'DJ beat, big drums', si: 'DJ බීට්, තද බෙර' } },
  island: { emoji: '🌴', en: 'Island Calypso', si: 'දූපත් කැලිප්සෝ', hint: { en: 'Steel pan, congas', si: 'ස්ටීල් පෑන්, කොංගා' } },
  none: { emoji: '🔇', en: 'No Audio', si: 'ශබ්දය රහිත', hint: { en: 'Silent card', si: 'නිහඬ කාඩ්පත' } },
};
