// Utilitaires pour la gestion des hashtags
// - Extraction des hashtags depuis le contenu des posts
// - Validation et normalisation des hashtags
// - Fonctions de recherche et de tendances

/**
 * Extrait tous les hashtags d'un texte
 * @param text Le texte à analyser
 * @returns Un tableau des hashtags trouvés (sans le #)
 */
export const extractHashtags = (text: string): string[] => {
    if (!text) return [];

    // Regex pour trouver tous les hashtags (#mot)
    const hashtagRegex = /#([a-zA-Z0-9\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+)/g;
    const matches = text.match(hashtagRegex);

    if (!matches) return [];

    // Retourner les hashtags sans le # et en minuscules pour la normalisation
    return matches.map(hashtag => hashtag.substring(1).toLowerCase());
};

/**
 * Valide un hashtag
 * @param hashtag Le hashtag à valider (sans le #)
 * @returns true si le hashtag est valide
 */
export const isValidHashtag = (hashtag: string): boolean => {
    if (!hashtag || hashtag.length === 0) return false;

    // Un hashtag valide doit :
    // - Avoir entre 1 et 50 caractères
    // - Ne contenir que des lettres, chiffres et caractères accentués
    // - Commencer par une lettre ou un chiffre
    const validHashtagRegex = /^[a-zA-Z0-9\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF][a-zA-Z0-9\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]*$/;

    return hashtag.length <= 50 && validHashtagRegex.test(hashtag);
};

/**
 * Filtre et valide une liste de hashtags
 * @param hashtags Liste des hashtags à filtrer
 * @returns Liste des hashtags valides et uniques
 */
export const filterValidHashtags = (hashtags: string[]): string[] => {
    const validHashtags = hashtags
        .filter(hashtag => isValidHashtag(hashtag))
        .map(hashtag => hashtag.toLowerCase());

    // Retourner les hashtags uniques
    return [...new Set(validHashtags)];
};

/**
 * Formate un hashtag pour l'affichage
 * @param hashtag Le hashtag (sans le #)
 * @returns Le hashtag formaté avec le #
 */
export const formatHashtag = (hashtag: string): string => {
    return `#${hashtag}`;
};

/**
 * Extrait et valide les hashtags d'un texte
 * @param text Le texte à analyser
 * @returns Liste des hashtags valides et uniques
 */
export const extractAndValidateHashtags = (text: string): string[] => {
    const hashtags = extractHashtags(text);
    return filterValidHashtags(hashtags);
};
