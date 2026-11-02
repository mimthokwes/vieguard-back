/**
 * Smart Search Engine for VieGuard Products
 * Implements typo tolerance, Levenshtein distance, Indonesian phonetics/slang normalization,
 * and contextual event expansion (e.g., "bju" -> "baju", "baju agustusan" -> "kostum karnaval/nusantara/17 agustus").
 */

interface ExpansionResult {
  originalQuery: string;
  correctedTokens: string[];
  expandedKeywords: string[];
  suggestedQuery: string;
  intention?: string;
}

// Common Indonesian typos and shorthand in uniform & costume domain
const TYPO_DICTIONARY: Record<string, string> = {
  // Baju / Seragam / Kostum
  bju: 'baju',
  bj: 'baju',
  bajuu: 'baju',
  bajuk: 'baju',
  srgm: 'seragam',
  sergm: 'seragam',
  sragam: 'seragam',
  srgn: 'seragam',
  kstm: 'kostum',
  kostume: 'kostum',
  costum: 'kostum',
  costume: 'kostum',
  kustom: 'kostum',
  pakaian: 'kostum',
  busana: 'kostum',

  // Drumband & Marching Band
  drumbnd: 'drumband',
  drumban: 'drumband',
  drumbang: 'drumband',
  dramben: 'drumband',
  dramband: 'drumband',
  drumben: 'drumband',
  drumb: 'drumband',
  marchin: 'marching',
  marchingband: 'marching band',

  // Aksesoris
  tpi: 'topi',
  shako: 'topi shako',
  sako: 'topi shako',
  syako: 'topi shako',
  slmpang: 'selempang',
  selempng: 'selempang',
  slempang: 'selempang',
  selembang: 'selempang',
  slendang: 'selempang',
  selendang: 'selempang',
  sabuk: 'selempang',

  // Tokoh & Kesenian
  myoret: 'mayoret',
  mayor: 'mayoret',
  mayorette: 'mayoret',
  gitapati: 'mayoret',
  reog: 'reog',
  reyog: 'reog',
  wrk: 'warok',
  warok: 'warok',
  ponorogo: 'ponorogo',
  ponorgo: 'ponorogo',

  // Karnaval & Pawai
  krnval: 'karnaval',
  karnavalan: 'karnaval',
  karnapal: 'karnaval',
  pawai: 'pawai',
  prade: 'pawai',
  parade: 'pawai',
  nsntara: 'nusantara',
  nusantoro: 'nusantara',
  tradisional: 'nusantara',
};

// Semantic category & event context expansion
const EVENT_EXPANSIONS: Record<string, { intention: string; keywords: string[] }> = {
  agustusan: {
    intention: 'Acara HUT RI / 17 Agustus',
    keywords: ['karnaval', 'nusantara', 'pawai', 'budaya', 'merah putih', 'reog', 'warok', 'kostum'],
  },
  '17an': {
    intention: 'Acara 17 Agustus',
    keywords: ['karnaval', 'nusantara', 'pawai', 'budaya', 'kostum', 'reog'],
  },
  agustus: {
    intention: 'Peringatan Hari Kemerdekaan',
    keywords: ['karnaval', 'nusantara', 'pawai', 'budaya', 'merah putih', 'kostum'],
  },
  kemerdekaan: {
    intention: 'Perayaan Kemerdekaan RI',
    keywords: ['karnaval', 'nusantara', 'pawai', 'merah putih', 'kostum'],
  },
  karnaval: {
    intention: 'Karnaval & Pawai Budaya',
    keywords: ['nusantara', 'pawai', 'tari', 'kreasi', 'reog', 'warok'],
  },
  pawai: {
    intention: 'Pawai & Parade Budaya',
    keywords: ['karnaval', 'nusantara', 'drumband', 'kostum'],
  },
  tari: {
    intention: 'Busana Tari Tradisional',
    keywords: ['kreasi', 'nusantara', 'karnaval', 'budaya', 'reog'],
  },
  lomba: {
    intention: 'Perlombaan & Parade',
    keywords: ['drumband', 'marching', 'mayoret', 'karnaval'],
  },
};

// Domain-level synonyms
const SYNONYMS: Record<string, string[]> = {
  baju: ['kostum', 'seragam', 'busana', 'stel'],
  kostum: ['baju', 'seragam', 'busana'],
  seragam: ['baju', 'kostum', 'stel'],
  drumband: ['marching', 'gita', 'bahari', 'mayor'],
  topi: ['shako', 'aksesoris', 'selempang'],
  mayoret: ['drumband', 'kostum', 'mayor'],
  karnaval: ['pawai', 'nusantara', 'budaya', 'reog', 'warok'],
};

/**
 * Compute Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];
  for (let i = 0; i <= bl; i++) matrix[i] = [i];
  for (let j = 0; j <= al; j++) matrix[0][j] = j;

  for (let i = 1; i <= bl; i++) {
    for (let j = 1; j <= al; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bl][al];
}

/**
 * Remove vowels to compare consonant skeletons (e.g. "bju" -> "bj", "baju" -> "bj")
 */
function consonantSkeleton(str: string): string {
  return str.replace(/[aiueo]/gi, '');
}

/**
 * Expands a raw user query with typo correction, synonyms, and event context
 */
export function expandSmartQuery(rawQuery: string): ExpansionResult {
  const clean = (rawQuery || '').toLowerCase().trim();
  if (!clean) {
    return {
      originalQuery: '',
      correctedTokens: [],
      expandedKeywords: [],
      suggestedQuery: '',
    };
  }

  const rawTokens = clean.split(/[\s,./\\_-]+/).filter(Boolean);
  const correctedTokens: string[] = [];
  const expandedSet = new Set<string>();
  let detectedIntention: string | undefined;

  for (const token of rawTokens) {
    // 1. Check exact typo dictionary
    let corrected = TYPO_DICTIONARY[token] || token;

    // 2. If no exact typo match, check consonant skeleton match with typo dictionary keys
    if (corrected === token && token.length >= 2) {
      const skel = consonantSkeleton(token);
      for (const [typoKey, targetVal] of Object.entries(TYPO_DICTIONARY)) {
        if (consonantSkeleton(typoKey) === skel && Math.abs(typoKey.length - token.length) <= 1) {
          corrected = targetVal;
          break;
        }
      }
    }

    correctedTokens.push(corrected);
    expandedSet.add(token);
    expandedSet.add(corrected);

    // Split compound corrected terms (e.g. "topi shako" -> "topi", "shako")
    corrected.split(/\s+/).forEach((w) => expandedSet.add(w));

    // 3. Check event context (e.g. "agustusan")
    if (EVENT_EXPANSIONS[token]) {
      detectedIntention = EVENT_EXPANSIONS[token].intention;
      EVENT_EXPANSIONS[token].keywords.forEach((k) => expandedSet.add(k));
    }
    if (EVENT_EXPANSIONS[corrected]) {
      detectedIntention = EVENT_EXPANSIONS[corrected].intention;
      EVENT_EXPANSIONS[corrected].keywords.forEach((k) => expandedSet.add(k));
    }

    // 4. Check synonyms
    const synList = SYNONYMS[corrected] || SYNONYMS[token];
    if (synList) {
      synList.forEach((s) => expandedSet.add(s));
    }
  }

  const suggestedQuery = correctedTokens.join(' ');

  return {
    originalQuery: rawQuery,
    correctedTokens,
    expandedKeywords: Array.from(expandedSet),
    suggestedQuery,
    intention: detectedIntention,
  };
}

export interface ScoredProduct<T> {
  product: T;
  score: number;
  matchedTerms: string[];
}

/**
 * Ranks and filters products using smart scoring
 */
export function rankProductsWithSmartQuery<T extends { name: string; description?: string | null; category?: { name: string } | null }>(
  products: T[],
  rawQuery: string
): { results: T[]; explanation: { suggestedQuery: string; intention?: string; matchedTerms: string[] } } {
  const expansion = expandSmartQuery(rawQuery);
  const { expandedKeywords, suggestedQuery, intention } = expansion;

  if (expandedKeywords.length === 0) {
    return {
      results: products,
      explanation: { suggestedQuery: rawQuery, intention: undefined, matchedTerms: [] },
    };
  }

  const lowerRaw = rawQuery.toLowerCase().trim();
  const lowerSuggested = suggestedQuery.toLowerCase().trim();

  const scored: ScoredProduct<T>[] = [];
  const allMatchedTermsSet = new Set<string>();

  for (const p of products) {
    const nameLower = (p.name || '').toLowerCase();
    const descLower = (p.description || '').toLowerCase();
    const catLower = (p.category?.name || '').toLowerCase();

    let score = 0;
    const matchedTerms: string[] = [];

    // Exact whole query match (highest weight)
    if (nameLower.includes(lowerRaw) || nameLower.includes(lowerSuggested)) {
      score += 120;
      matchedTerms.push(lowerSuggested);
    }
    if (catLower.includes(lowerRaw) || catLower.includes(lowerSuggested)) {
      score += 80;
      matchedTerms.push(catLower);
    }
    if (descLower.includes(lowerRaw) || descLower.includes(lowerSuggested)) {
      score += 50;
      matchedTerms.push(lowerSuggested);
    }

    // Individual keyword matches
    for (const kw of expandedKeywords) {
      if (!kw || kw.length < 2) continue;

      if (nameLower.includes(kw)) {
        score += 35;
        matchedTerms.push(kw);
      } else if (catLower.includes(kw)) {
        score += 25;
        matchedTerms.push(kw);
      } else if (descLower.includes(kw)) {
        score += 15;
        matchedTerms.push(kw);
      } else {
        // Check Levenshtein fuzzy match on individual words in product name
        const nameWords = nameLower.split(/[\s,.-]+/);
        for (const nw of nameWords) {
          if (nw.length >= 4 && kw.length >= 4) {
            const dist = levenshteinDistance(nw, kw);
            if (dist === 1) {
              score += 20;
              matchedTerms.push(`${kw}~${nw}`);
              break;
            } else if (dist === 2 && (nw.length >= 6 || kw.length >= 6)) {
              score += 10;
              matchedTerms.push(`${kw}~${nw}`);
              break;
            }
          }
        }
      }
    }

    if (score > 0) {
      matchedTerms.forEach((t) => allMatchedTermsSet.add(t));
      scored.push({ product: p, score, matchedTerms });
    }
  }

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  return {
    results: scored.map((s) => s.product),
    explanation: {
      suggestedQuery,
      intention,
      matchedTerms: Array.from(allMatchedTermsSet),
    },
  };
}
