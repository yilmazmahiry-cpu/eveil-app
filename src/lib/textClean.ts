// L'IA peut renvoyer du formatage markdown que l'app n'interprète pas : on le retire à l'affichage.
export function cleanAIText(text: string): string {
  return text
    .replace(/\*+/g, '')
    .replace(/`+/g, '')
    .replace(/^#{1,6}[ \t]*/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}
