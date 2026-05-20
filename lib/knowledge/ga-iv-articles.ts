/** Strukturierte GA-IV-Wissensdatenbank (Prüfregeln pro Artikel). */

export interface GaIvKnowledgeArticle {
  id: string;
  article: string;
  title: string;
  meaning: string;
  check_rule: string;
  keywords: readonly string[];
}

export const GA_IV_KNOWLEDGE_ARTICLES: readonly GaIvKnowledgeArticle[] = [
  {
    id: "1",
    article: "Artikel 1 GA IV",
    title: "Pflicht zur Einhaltung und Durchsetzung",
    meaning:
      "Die Vertragsparteien verpflichten sich, das Abkommen unter allen Umständen einzuhalten und seine Einhaltung durchzusetzen.",
    check_rule:
      "Zu prüfen ist, ob eine Behörde oder Institution das GA IV ignoriert, nicht berücksichtigt oder keine erkennbare Anwendung des Schutzstandards vornimmt.",
    keywords: ["Einhaltung", "Durchsetzung", "Verpflichtung", "Behörde", "Anwendung"],
  },
  {
    id: "4",
    article: "Artikel 4 GA IV",
    title: "Schutzstatus der Zivilperson",
    meaning:
      "Artikel 4 definiert den Kreis der durch das Abkommen geschützten Personen.",
    check_rule:
      "Projektinterne Grundannahme: Die angeschriebene natürliche Person wird als geschützte Zivilperson behandelt.",
    keywords: ["geschützte Person", "Zivilperson", "natürliche Person", "Schutzstatus"],
  },
  {
    id: "7-2",
    article: "Artikel 7 Abs. 2 GA IV",
    title: "Verbot der Entrechtung / Umqualifizierung",
    meaning:
      "Geschützte Personen dürfen nicht auf Rechte verzichten, die ihnen durch das Abkommen gewährt werden.",
    check_rule:
      "Zu markieren, wenn das Schreiben die natürliche Person sprachlich oder formal herabstuft, entrechtet oder projektintern als juristische Person beziehungsweise Sache behandelt. Die Anrede mit „Herr“ oder „Frau“ wird nach projektinterner Prüfregel besonders markiert.",
    keywords: ["Herr", "Frau", "Anrede", "Entrechtung", "Rechtsverlust", "Rechtsabtretung"],
  },
  {
    id: "10",
    article: "Artikel 10 GA IV",
    title: "Schutz durch neutrale Macht",
    meaning:
      "Das Abkommen sieht Schutz durch Schutzmächte oder neutrale Institutionen vor.",
    check_rule:
      "Zu prüfen ist, ob ein Schreiben Maßnahmen enthält, ohne Schutz- oder Beschwerdemöglichkeiten zu nennen, sofern diese im Kontext relevant sind.",
    keywords: ["Schutzmacht", "neutrale Macht", "Schutz", "Beschwerde"],
  },
  {
    id: "27",
    article: "Artikel 27 GA IV",
    title: "Schutz der Ehre, Familie und häuslichen Sphäre",
    meaning:
      "Geschützte Personen haben Anspruch auf Achtung ihrer Person, Ehre, Familienrechte, religiösen Überzeugungen, Gewohnheiten und Gebräuche.",
    check_rule:
      "Zu prüfen ist, ob das Schreiben in die Ehre, Familie, häusliche Sphäre, Wohnung oder persönliche Würde der angeschriebenen Person eingreift.",
    keywords: ["Ehre", "Familie", "Wohnung", "häusliche Sphäre", "Würde"],
  },
  {
    id: "31",
    article: "Artikel 31 GA IV",
    title: "Verbot schädigender Maßnahmen",
    meaning:
      "Gegen geschützte Personen darf kein körperlicher oder moralischer Zwang ausgeübt werden.",
    check_rule:
      "Zu prüfen ist, ob Fristen, Drohungen, Sanktionen oder Druckmittel als Zwang gegenüber der angeschriebenen Person erscheinen.",
    keywords: ["Zwang", "Druck", "Frist", "Drohung", "Sanktion"],
  },
  {
    id: "32",
    article: "Artikel 32 GA IV",
    title: "Verbot von Zwang, Einschüchterung und Schikane",
    meaning:
      "Maßnahmen, die Leiden verursachen oder die geschützte Person körperlich oder gesundheitlich beeinträchtigen, sind verboten.",
    check_rule:
      "Zu prüfen ist, ob das Schreiben Maßnahmen ankündigt, die erhebliche persönliche, wirtschaftliche oder gesundheitliche Belastungen verursachen können.",
    keywords: ["Schaden", "Belastung", "Leiden", "Maßnahme", "Androhung"],
  },
  {
    id: "33",
    article: "Artikel 33 GA IV",
    title: "Verbot kollektiver Bestrafung",
    meaning:
      "Kollektivstrafen sowie Maßnahmen der Einschüchterung oder Schikane sind untersagt.",
    check_rule:
      "Zu prüfen ist, ob das Schreiben einschüchternde, pauschale, schikanöse oder unverhältnismäßig belastende Maßnahmen enthält.",
    keywords: ["Einschüchterung", "Schikane", "Strafe", "Drohung", "Zwangsmaßnahme"],
  },
  {
    id: "34",
    article: "Artikel 34 GA IV",
    title: "Verbot von Geiselnahmen",
    meaning: "Geiselnahme ist verboten.",
    check_rule:
      "Nur zu prüfen, wenn eine Person oder ein Rechtsgut ausdrücklich als Druckmittel gegen eine andere Handlung eingesetzt wird.",
    keywords: ["Geisel", "Druckmittel", "Erpressung"],
  },
  {
    id: "47",
    article: "Artikel 47 GA IV",
    title: "Verbot der Verschlechterung der Rechtsstellung",
    meaning:
      "Geschützte Personen dürfen durch Veränderungen der Rechtslage oder Verwaltung nicht ihrer Rechte aus dem Abkommen beraubt werden.",
    check_rule:
      "Zu prüfen ist, ob das Schreiben eine Verschlechterung der Rechtsstellung, einen Rechtsverlust oder eine Nichtanerkennung des Schutzstatus bewirkt.",
    keywords: ["Rechtsverlust", "Rechtsstellung", "Verschlechterung", "Status"],
  },
  {
    id: "49",
    article: "Artikel 49 GA IV",
    title: "Verbot der Vertreibung / Verbringung",
    meaning:
      "Zwangsweise Verbringungen oder Vertreibungen geschützter Personen sind untersagt.",
    check_rule:
      "Zu prüfen bei Räumung, Zwangsräumung, Entfernung aus Wohnung, Verbringung oder Maßnahmen mit vergleichbarer Wirkung.",
    keywords: ["Räumung", "Zwangsräumung", "Vertreibung", "Verbringung", "Wohnungsverlust"],
  },
  {
    id: "53",
    article: "Artikel 53 GA IV",
    title: "Schutz des Eigentums / Verbot der Beschlagnahme",
    meaning:
      "Die Zerstörung oder Beschlagnahme von Eigentum ist untersagt, soweit sie nicht durch militärische Operationen absolut erforderlich ist.",
    check_rule:
      "Zu prüfen bei Pfändung, Beschlagnahme, Verwertung, Zwangsversteigerung, Eigentumsentzug oder angedrohter Wegnahme.",
    keywords: ["Eigentum", "Beschlagnahme", "Pfändung", "Zwangsversteigerung", "Verwertung"],
  },
  {
    id: "101",
    article: "Artikel 101 GA IV",
    title: "Recht auf wirksame Beschwerde",
    meaning: "Geschützte Personen müssen wirksame Beschwerdemöglichkeiten haben.",
    check_rule:
      "Zu prüfen ist, ob das Schreiben Rechtsbehelfe, Beschwerdemöglichkeiten oder Ansprechpartner nennt oder diese fehlen.",
    keywords: ["Beschwerde", "Rechtsbehelf", "Widerspruch", "Ansprechpartner"],
  },
  {
    id: "131",
    article: "Artikel 131 GA IV",
    title: "Untersuchungspflicht bei Beschwerden",
    meaning: "Beschwerden über Verstöße gegen das Abkommen sind zu untersuchen.",
    check_rule:
      "Zu prüfen, wenn das Schreiben Beschwerden ignoriert, nicht beantwortet oder keine Untersuchung erkennen lässt.",
    keywords: ["Untersuchung", "Beschwerde", "Prüfung", "Nichtbearbeitung"],
  },
  {
    id: "144",
    article: "Artikel 144 GA IV",
    title: "Verbreitungspflicht des Abkommens",
    meaning:
      "Die Vertragsparteien verpflichten sich, den Wortlaut des Abkommens möglichst weit zu verbreiten und insbesondere Behörden und verantwortliche Personen zu unterrichten.",
    check_rule:
      "Zu prüfen ist, ob Behördenhandeln erkennen lässt, dass das GA IV nicht bekannt gemacht, nicht beachtet oder nicht angewendet wurde.",
    keywords: ["Kenntnis", "Verbreitung", "Behörde", "Schulung", "Anwendung"],
  },
] as const;
