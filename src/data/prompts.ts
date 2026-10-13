// Les prompts système de l'IA vivent désormais côté serveur (server/src/prompts.js) : l'app indique seulement
// de quel type de texte il s'agit, et envoie ses consignes complémentaires (style, contexte personnel).
// - 'general'      : lectures (heures miroir, rêves, signes, tarot, thème astral...) — réservées aux abonnés
// - 'carte'        : carte du jour — gratuite
// - 'affirmations' : liste d'affirmations — gratuite
export type PromptType = 'general' | 'carte' | 'affirmations';
