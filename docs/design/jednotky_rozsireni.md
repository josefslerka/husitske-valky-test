# Rozšíření jednotek - Husitské války

Tento dokument obsahuje historické informace a taktické vlastnosti pro jednotky ve hře. Data jsou určena k integraci do `units.js`.

---

## Struktura rozšíření

Každá jednotka by měla mít tyto nové vlastnosti:

```javascript
{
    // Existující vlastnosti...
    
    // HISTORICKÝ FLAVOR
    lore: {
        description: "Podrobný historický popis",
        equipment: "Typická výzbroj a výstroj",
        origin: "Odkud se rekrutovali",
        historicalNote: "Zajímavost nebo citát z dobových pramenů"
    },
    
    // TAKTICKÉ VLASTNOSTI
    tactics: {
        terrain: {
            forest: 0,      // Modifikátor v lese (-20 až +20)
            hill: 0,        // Modifikátor na kopci
            water: 0,       // Modifikátor v brodu/vodě
            road: 0,        // Modifikátor na cestě
            village: 0      // Modifikátor ve vesnici
        },
        weaknesses: [],     // Pole slabin (typy jednotek nebo situace)
        zoc: true/false,    // Má zónu kontroly?
        formationBonus: {}, // Bonusy ve formaci
        canRetreat: true    // Může ustoupit z boje?
    }
}
```

---

## HUSITSKÉ JEDNOTKY

### Pěchota

#### Cepníci (CEPNICI)

**Historický flavor:**
- **Popis:** Ozbrojení sedláci a měšťané tvořící páteř husitských vojsk. Bojový cep, původně zemědělský nástroj, se stal symbolem husitského odporu. Cepníci byli obáváni pro svou zuřivost a schopnost drtit i nejlepší brnění.
- **Výzbroj:** Bojový cep (okovaný, často s železnými hroty), krátký meč nebo tesák jako záložní zbraň, přilba (často jen kožená nebo lehká železná), kabátec s vycpávkou nebo lehká brigantina.
- **Původ:** Rekrutováni z řad sedláků, řemeslníků a městské chudiny. Mnoho z nich přišlo z Tábora a dalších husitských měst.
- **Historická poznámka:** "Cepy bíti uměli tak hrozně, že šlechtický pancíř se jim vyhýbal jako ďábel kříži." - dobová kronika

**Taktické vlastnosti:**
- **Terén:** Les +10 (krytí), Kopec 0, Brod -20 (těžko se bojuje), Cesta 0, Vesnice +10
- **Slabosti:** `['ranged', 'cavalry_charge']` - Zranitelní střelbou a nárazem jízdy
- **ZOC:** Ano
- **Formace:** `{ shieldWall: false, offensive: true }` - Mohou tvořit útočnou formaci (+10% útok, -10% obrana)
- **Ústup:** Ano

---

#### Sudličníci (SUDLICNICI)

**Historický flavor:**
- **Popis:** Pěšáci vyzbrojení dlouhými tyčovými zbraněmi - sudlicemi, kůsami nebo halapartnami. Jejich dosah jim umožňoval zasahovat nepřítele přes řady spolubojovníků nebo přes okraj bojového vozu.
- **Výzbroj:** Sudlice (tyčová zbraň s čepelí a hákem, délka 2-3 metry), krátký nůž, lehká přilba, prošívaný kabátec.
- **Původ:** Městská domobrana a venkovské milice. Tyčové zbraně byly levné a nevyžadovaly dlouhý výcvik.
- **Historická poznámka:** "Sudlicí dobrý muž i rytíře z koně stáhne a k zemi přibije."

**Taktické vlastnosti:**
- **Terén:** Les -10 (dlouhá zbraň překáží), Kopec +10 (dosah z výšky), Brod -15, Cesta 0, Vesnice -5
- **Slabosti:** `['close_combat', 'flanking']` - V boji zblízka a při obchvatu
- **ZOC:** Ano (větší - dosah zbraně)
- **Formace:** `{ behindWagon: true }` - +20% efektivita za vozovou hradbou
- **Ústup:** Ano

---

#### Pavézníci (PAVEZNICI)

**Historický flavor:**
- **Popis:** Specialisté na obranu vyzbrojení velkými pavézami - obdélníkovými štíty vysokými téměř jako muž. Tvořili živé hradby chránící střelce při nabíjení a střelbě.
- **Výzbroj:** Pavéza (velký štít, často malovaný husitskými symboly - kalich, husa), krátký meč nebo palcát, lehká zbroj.
- **Původ:** Speciálně cvičení obránci, často z řad městských cechů. Výroba pavéz byla důležitým řemeslem.
- **Historická poznámka:** "Pavézníci stáli jako zeď, a za nimi kuše zpívaly smrt na Němce."

**Taktické vlastnosti:**
- **Terén:** Les -10 (štít překáží), Kopec +5, Brod -20, Cesta 0, Vesnice +15
- **Slabosti:** `['artillery', 'flanking']` - Dělostřelectvo a obchvat (štít chrání jen zepředu)
- **ZOC:** Ano
- **Formace:** `{ shieldWall: true, protectAdjacent: 'ranged' }` - Chrání sousední střelce (+20% obrana)
- **Ústup:** Ano (ale pomalý)

---

#### Kopiníci - Husité (KOPINICI_HUSITI)

**Historický flavor:**
- **Popis:** Pěšáci s dlouhými kopími, speciálně cvičení k boji proti jízdě. Tvořili obranné čtverce nebo linie, které dokázaly zastavit i těžkou rytířskou jízdu.
- **Výzbroj:** Dlouhé kopí (4-5 metrů), krátký meč, lehká přilba, prošívanice nebo brigantina.
- **Původ:** Zkušenější bojovníci z městských a vesnických milic. Boj s kopím vyžadoval disciplínu a odvahu.
- **Historická poznámka:** "Stůjte pevně, kopí vpřed, a žádný rytíř vás neporazí!" - údajný výrok Jana Žižky

**Taktické vlastnosti:**
- **Terén:** Les -20 (kopí je na překážku), Kopec +15 (obrana z kopce), Brod -10, Cesta 0, Vesnice 0
- **Slabosti:** `['ranged', 'flanking', 'infantry_close']` - Střelba, obchvat, pěchota zblízka
- **ZOC:** Ano (velká - kopí)
- **Formace:** `{ spearWall: true, antiCavalryBonus: 50 }` - V linii +50% proti jízdě
- **Ústup:** Ne (v linii), Ano (samostatně)

---

### Střelci

#### Kušiníci - Husité (KUSINICI_HUSITI)

**Historický flavor:**
- **Popis:** Střelci s kušemi, tvořící důležitou součást husitské palebné síly. Kuše byla přesná a průbojná, schopná prorazit i plátovou zbroj na střední vzdálenost.
- **Výzbroj:** Kuše s ocelovým lukem, toulec se šipkami (bolty), krátký meč nebo tesák, lehká zbroj.
- **Původ:** Měšťané a lovci. Střelba z kuše nevyžadovala takový výcvik jako luky, ale nabíjení bylo pomalé.
- **Historická poznámka:** "Kušiník jeden za deset mužů platí, když má čas nabíti."

**Taktické vlastnosti:**
- **Terén:** Les +10 (krytí), Kopec +15 (dostřel a přehled), Brod -20, Cesta 0, Vesnice +10
- **Slabosti:** `['cavalry', 'close_combat']` - Jízda a boj zblízka
- **ZOC:** Ne
- **Formace:** `{ behindPavise: true, behindWagon: true }` - Bonus za krytem
- **Ústup:** Ano

---

#### Ručničáři (RUCNICARI)

**Historický flavor:**
- **Popis:** Elitní střelci vyzbrojení primitivními palnými zbraněmi - hákovnicemi a píšťalami. Jejich zbraně byly hlučné, nepřesné, ale devastující na krátkou vzdálenost a vyvolávající paniku mezi nepřáteli i koňmi.
- **Výzbroj:** Hákovnice nebo píšťala (ruční palná zbraň), zápalné potřeby, střelný prach, olověné kule, tesák.
- **Původ:** Speciálně cvičení bojovníci, často z řad řemeslníků (kováři, zvonařci). Výroba a obsluha palných zbraní vyžadovala technické znalosti.
- **Historická poznámka:** "Když píšťaly zahřměly, koně se splašili a rytíři padali z nich jako žaludy z dubu."

**Taktické vlastnosti:**
- **Terén:** Les -10 (kouř, vlhkost), Kopec +10, Brod -30 (prach nesmí zvlhnout!), Cesta 0, Vesnice +5
- **Slabosti:** `['rain', 'close_combat', 'cavalry']` - Déšť (nefungují!), blízký boj, jízda
- **ZOC:** Ne
- **Formace:** `{ volleyFire: true, terrorRadius: 2 }` - Salvová střelba, efekt teroru na 2 hexy
- **Ústup:** Ano
- **Speciální:** Nemohou střílet v dešti nebo po brodění

---

### Dělostřelectvo

#### Houfnice (HOUFNICE)

**Historický flavor:**
- **Popis:** Těžká polní děla schopná devastující plošné palby. Husité byli průkopníky v použití dělostřelectva v polních bitvách, nikoli jen při obléhání.
- **Výzbroj:** Houfnice (krátké dělo velkého kalibru), střelný prach, kamenné nebo železné koule, obsluha 4-6 mužů.
- **Původ:** Děla vyráběná v husitských městech (Praha, Tábor). Obsluhu tvořili specialisté - puškaři.
- **Historická poznámka:** "Houfnice bila do šiku nepřátel jako Hospodinova pěst."

**Taktické vlastnosti:**
- **Terén:** Les -30 (nelze přesunout, nemá výstřel), Kopec +20 (dostřel), Brod - NELZE, Cesta +10, Vesnice 0
- **Slabosti:** `['cavalry', 'flanking', 'close_combat', 'capture']` - Téměř bezbranná zblízka
- **ZOC:** Ne
- **Formace:** `{ inWagenburg: true }` - Ideálně v hradbě vozů
- **Ústup:** Ne (opuštění děla)
- **Speciální:** Příprava k palbě trvá 1 tah, plošný zásah

---

#### Tarasnice (TARASNICE)

**Historický flavor:**
- **Popis:** Lehké mobilní dělo montované na vozíku nebo nosítkách. Tarasnice byla husitským vynálezem umožňujícím palebnou podporu i během manévrů.
- **Výzbroj:** Tarasnice (lehké dělo), střelný prach, menší kule, obsluha 2-3 muži.
- **Původ:** Husitský vynález. Spojovala palebnou sílu s mobilitou.
- **Historická poznámka:** "Tarasnice jezdila s vojskem jako věrný pes a štěkala na nepřítele olovem."

**Taktické vlastnosti:**
- **Terén:** Les -20, Kopec +10, Brod - NELZE, Cesta +15, Vesnice +5
- **Slabosti:** `['cavalry', 'close_combat']`
- **ZOC:** Ne
- **Formace:** `{ mobile: true }` - Může střílet po pohybu (1 hex)
- **Ústup:** Ano (ale ztrácí tah)

---

### Speciální jednotky

#### Bojový vůz (VOZOVA_HRADBA)

**Historický flavor:**
- **Popis:** Srdce husitské vojenské doktríny. Těžké selské vozy upravené pro boj - okované, s dřevěnými štíty po stranách, střílnami pro střelce a háky na spojování. Tvořily mobilní pevnost.
- **Výzbroj:** Samotný vůz (okovaný, s řetězy na spojování), obsluha zahrnuje vozku, 2-4 střelce (kušiníci nebo ručničáři), 2-4 obránce s cepy/sudlicemi.
- **Původ:** Původně běžné selské vozy upravené pro válku. Husité zdokonalili jejich použití na uměleckou úroveň.
- **Historická poznámka:** "Vozová hradba jest jako hrad, který jde za vojskem. A z toho hradu smrt létá na nepřátele Boží pravdy." - připisováno Janu Žižkovi

**Taktické vlastnosti:**
- **Terén:** Les - NELZE, Kopec -10 (těžko se táhne), Brod - NELZE, Cesta +20, Vesnice +10
- **Slabosti:** `['artillery', 'fire']` - Dělostřelectvo a oheň
- **ZOC:** Ano (velká)
- **Formace:** `{ wagenburg: true, chainBonus: 15 }` - Spojené vozy +15% obrana za každý sousední vůz
- **Ústup:** Ne (vůz se neopouští)
- **Speciální:** Jednotky uvnitř hradby mají +30% obrana

---

#### Lehká jízda - Husité (JIZDA_HUSITI)

**Historický flavor:**
- **Popis:** Husitská jízda byla vždy slabší než rytířská, ale plnila důležité úkoly - průzkum, pronásledování prchajících a rychlé údery na křídla.
- **Výzbroj:** Lehká kopí, meče, kuše z koně (někteří), lehká zbroj nebo jen kožený kabátec.
- **Původ:** Zemanstvo a bohatší měšťané, kteří si mohli dovolit koně. Také přeběhlíci z katolických řad.
- **Historická poznámka:** "Naše jízda nemůže čelit rytířům, ale může je pronásledovat, když utíkají - a to dělá ráda!"

**Taktické vlastnosti:**
- **Terén:** Les -15, Kopec -5, Brod -10, Cesta +20, Vesnice 0
- **Slabosti:** `['heavy_cavalry', 'spears']` - Těžká jízda, kopiníci
- **ZOC:** Ano
- **Formace:** `{ pursuit: true }` - +30% poškození prchajícím jednotkám
- **Ústup:** Ano (rychlý)

---

#### Zvěd (ZVED)

**Historický flavor:**
- **Popis:** Lehcí jezdci specializovaní na průzkum, sledování nepřítele a předávání zpráv. Vyhýbali se boji a jejich hlavní zbraní byla rychlost a oči.
- **Výzbroj:** Lehký meč nebo tesák, možná krátká kuše, žádná zbroj nebo jen kožený kabátec.
- **Původ:** Lovci, hraničáři, synové sedláků, kteří uměli jezdit. Často znali terén lépe než kdokoli jiný.
- **Historická poznámka:** "Dobrý zvěd je jako oči hejtmana. Bez očí je i nejsilnější vojsko slepé."

**Taktické vlastnosti:**
- **Terén:** Les +20 (skrývání), Kopec +15 (rozhled), Brod +5 (zná brody), Cesta +10, Vesnice +10
- **Slabosti:** `['any_combat']` - Jakýkoli přímý boj
- **ZOC:** Ne
- **Formace:** `{ scout: true, visionBonus: 2 }` - +2 hexy viditelnosti
- **Ústup:** Ano (automatický po přežití útoku)
- **Speciální:** Neviditelný v lese/kopcích na vzdálenost větší než 2 hexy

---

## KŘIŽÁCKÉ JEDNOTKY

### Jízda

#### Těžký rytíř (TEZKY_RYTIR)

**Historický flavor:**
- **Popis:** Elita středověkého bojiště. Plně obrněný jezdec na obrněném koni představoval nezastavitelnou sílu - dokud nenarazil na husitské vozy a palné zbraně.
- **Výzbroj:** Plátová zbroj (celková ochrana), kopí (lance), meč, štít s erbem, obrněný kůň (často i s čelenkou).
- **Původ:** Šlechta z celé Evropy - němečtí, uherští, polští, burgundští rytíři. Někteří bojovali za víru, jiní za kořist.
- **Historická poznámka:** "Když rytíř nasedne na koně, není pod nebem síla, která by ho zastavila - kromě zdi vozů a deště olova."

**Taktické vlastnosti:**
- **Terén:** Les - NELZE (kůň neprojde), Kopec -10, Brod -15, Cesta +15, Vesnice -10
- **Slabosti:** `['spears', 'wagenburg', 'firearms', 'terrain']` - Kopí, vozová hradba, palné zbraně, těžký terén
- **ZOC:** Ano (velká)
- **Formace:** `{ charge: true, chargeBonus: 50 }` - Náraz +50% při útoku z pohybu 2+ hexy
- **Ústup:** Ne (rytířská čest)
- **Speciální:** Náraz devastuje pěchotu, ale je zranitelný po zastavení

---

#### Těžkooděnci (TEZKOODENCI)

**Historický flavor:**
- **Popis:** Méně obrněná jízda než těžcí rytíři, ale stále formidabilní síla. Často tvořili druhou vlnu útoku nebo chránili křídla.
- **Výzbroj:** Kroužková nebo částečná plátová zbroj, kopí, meč, štít.
- **Původ:** Nižší šlechta, bohatí měšťané, zkušení žoldnéři s koňmi.
- **Historická poznámka:** "Nejsou to praví rytíři, ale na sedláky stačí," řekl jeden kronikář. Mýlil se.

**Taktické vlastnosti:**
- **Terén:** Les -20, Kopec -5, Brod -10, Cesta +10, Vesnice -5
- **Slabosti:** `['spears', 'wagenburg', 'firearms']`
- **ZOC:** Ano
- **Formace:** `{ charge: true, chargeBonus: 30 }` - Náraz +30%
- **Ústup:** Ano

---

#### Lehká jízda - Křižáci (LEHKA_JIZDA)

**Historický flavor:**
- **Popis:** Rychlá jízda používaná k průzkumu, obchvatům a pronásledování. Uherští husaři a němečtí rejtaři byli obávanými protivníky.
- **Výzbroj:** Lehké kopí, šavle nebo meč, štít, kožená nebo lehká kroužková zbroj.
- **Původ:** Uhersko, Polsko, německé země. Často najímaní žoldnéři specializovaní na jízdní boj.
- **Historická poznámka:** "Lehká jízda jest jako vlk - sama neporazí medvěda, ale uhání ho k smrti."

**Taktické vlastnosti:**
- **Terén:** Les -10, Kopec 0, Brod -5, Cesta +20, Vesnice 0
- **Slabosti:** `['heavy_cavalry', 'spears']`
- **ZOC:** Ano
- **Formace:** `{ pursuit: true, flankBonus: 20 }` - +20% při útoku do boku/zad
- **Ústup:** Ano (rychlý)

---

#### Zvěd - Křižáci (ZVED_KRIZACI)

**Historický flavor:**
- **Popis:** Průzkumníci křižáckého vojska. Často místní šlechtici nebo najatí zvědové, kteří znali terén.
- **Výzbroj:** Lehká zbroj, meč, možná kuše.
- **Původ:** Místní šlechta, žoldnéři, někdy i přeběhlíci.
- **Historická poznámka:** "Najít husity není těžké - jdi za kouřem hořících kostelů."

**Taktické vlastnosti:**
- Stejné jako husitský zvěd

---

### Pěchota

#### Kopiníci - Křižáci (KOPINICI)

**Historický flavor:**
- **Popis:** Disciplinovaná pěchota s dlouhými kopími. Tvořili obrannou linii chránící střelce a dělostřelectvo, nebo formovali čtverce proti jízdě.
- **Výzbroj:** Dlouhé kopí, krátký meč, přilba, gambeson nebo brigantina, někdy pavéza.
- **Původ:** Městské milice z německých říšských měst, žoldnéřské kompanie.
- **Historická poznámka:** "Německý kopiník stojí pevně - dokud neuslyší houfnice."

**Taktické vlastnosti:**
- **Terén:** Les -20, Kopec +10, Brod -10, Cesta 0, Vesnice 0
- **Slabosti:** `['ranged', 'artillery', 'flanking']`
- **ZOC:** Ano
- **Formace:** `{ spearWall: true, antiCavalryBonus: 40 }` - V linii +40% proti jízdě
- **Ústup:** Ne (v linii)

---

#### Halapartníci (HALAPARTNICI)

**Historický flavor:**
- **Popis:** Těžká pěchota vyzbrojená halapartnami - kombinací kopí, sekery a háku. Mohli sekat, bodat i stahovat jezdce z koní.
- **Výzbroj:** Halaparta (2-2.5 metru), krátký meč, přilba, kroužková zbroj nebo brigantina.
- **Původ:** Švýcarští žoldnéři, němečtí landsknechti, městské gardy.
- **Historická poznámka:** "Halaparta je zbraň chytrých mužů - bodne, sekne a stáhne."

**Taktické vlastnosti:**
- **Terén:** Les -10, Kopec +5, Brod -10, Cesta 0, Vesnice +5
- **Slabosti:** `['ranged', 'flanking']`
- **ZOC:** Ano
- **Formace:** `{ versatile: true }` - Efektivní proti pěchotě i jízdě
- **Ústup:** Ano

---

#### Pavézníci - Křižáci (PAVEZNICI_KRIZACI)

**Historický flavor:**
- **Popis:** Obránci s velkými štíty chránící střelce. Křižácké pavézy byly často bohatě zdobené erby a náboženskými symboly.
- **Výzbroj:** Pavéza (velká, často malovaná s kříži), krátký meč, lehká zbroj.
- **Původ:** Městské milice, speciálně cvičení žoldnéři.
- **Historická poznámka:** "Za pavézou je kušiník jako za hradbou - dokud se hradba nepohne."

**Taktické vlastnosti:**
- Podobné husitským pavézníkům

---

#### Žoldnéři (ZOLDNERI)

**Historický flavor:**
- **Popis:** Profesionální válečníci bojující za peníze. Zkušení, tvrdí a spolehliví - dokud se platí. Tvořili páteř mnoha křižáckých armád.
- **Výzbroj:** Různorodá - meče, sekery, kopí, štíty. Kvalitní zbroj. Každý měl svůj preferovaný styl.
- **Původ:** Žoldnéřské kompanie z celé Evropy - Němci, Italové, Švýcaři, Angličané.
- **Historická poznámka:** "Žoldnéř se neptá, kdo má pravdu. Ptá se, kdo má zlato."

**Taktické vlastnosti:**
- **Terén:** Les 0, Kopec +5, Brod -5, Cesta +5, Vesnice +10
- **Slabosti:** `['morale_low_pay']` - Morálka klesá bez platby
- **ZOC:** Ano
- **Formace:** `{ veteran: true, disciplined: true }` - Neklesá morálka při ztrátách tak rychle
- **Ústup:** Ano (profesionálové vědí, kdy ustoupit)
- **Speciální:** Vyšší počáteční morálka, ale vyžadují platbu

---

### Střelci

#### Janovští kušiníci (KUSNICI_JANOV)

**Historický flavor:**
- **Popis:** Elitní žoldnéřští střelci z italské Janova, považovaní za nejlepší kušiníky v Evropě. Jejich kuše měly ocelové luky a velkou průbojnost.
- **Výzbroj:** Těžká kuše s ocelovým lukem, toulec s ocelovými bolty, krátký meč, lehká zbroj, někdy pavéza.
- **Původ:** Janovská republika. Kušiníci byli exportním artiklem Janova a sloužili po celé Evropě.
- **Historická poznámka:** "Janovská kuše probije brnění jako nůž máslo - na dvě stě kroků."

**Taktické vlastnosti:**
- **Terén:** Les +5, Kopec +15, Brod -15, Cesta 0, Vesnice +10
- **Slabosti:** `['cavalry', 'close_combat', 'slow_reload']`
- **ZOC:** Ne
- **Formace:** `{ elite: true, armorPiercing: true }` - Ignoruje část zbroje
- **Ústup:** Ano
- **Speciální:** Pomalejší nabíjení, ale větší průbojnost

---

#### Kušiníci - Křižáci (KUSNICI)

**Historický flavor:**
- **Popis:** Běžní kušiníci tvořící střeleckou podporu křižáckých vojsk. Méně elitní než Janované, ale stále efektivní.
- **Výzbroj:** Kuše, toulec, krátká zbraň, lehká zbroj.
- **Původ:** Městské milice, žoldnéřské roty.
- **Historická poznámka:** "Kuše je zbraň zbabělců, říkají rytíři - ale mrtvý rytíř nic neříká."

**Taktické vlastnosti:**
- Podobné husitským kušiníkům, bez bonusu za průbojnost

---

#### Lučištníci (LUCISTNICI)

**Historický flavor:**
- **Popis:** Střelci s luky, schopní rychlejší střelby než kušiníci, ale s menší průbojností. Efektivní proti nezbroj`ené pěchotě.
- **Výzbroj:** Dlouhý luk nebo kompozitní luk, toulec s šípy, krátký nůž, minimální zbroj.
- **Původ:** Angličtí lukostřelci, uherští jízdní lučištníci, němečtí myslivci.
- **Historická poznámka:** "Anglický lukostřelec vystřelí deset šípů, než kušiník nabije jeden - ale jen jeden z deseti probije zbroj."

**Taktické vlastnosti:**
- **Terén:** Les +10, Kopec +10, Brod -10, Cesta 0, Vesnice +5
- **Slabosti:** `['cavalry', 'close_combat', 'armored_targets']`
- **ZOC:** Ne
- **Formace:** `{ rapidFire: true, volleyBonus: 15 }` - 2 útoky za tah, salvy +15%
- **Ústup:** Ano
- **Speciální:** 2 útoky za tah, ale nižší průbojnost

---

### Dělostřelectvo

#### Polní dělo (POLNI_DELO)

**Historický flavor:**
- **Popis:** Těžká děla křižáckých armád. Méně mobilní než husitská, ale stejně devastující. Používána hlavně k obléhání, ale i v polních bitvách.
- **Výzbroj:** Těžké dělo na lafetě, střelný prach, kamenné/železné koule, obsluha 6-8 mužů.
- **Původ:** Zbrojnice říšských měst, burgundské dílny, italští puškaři.
- **Historická poznámka:** "Dělo je král bojiště - pomalý král, ale jeho slovo je konečné."

**Taktické vlastnosti:**
- **Terén:** Les - NELZE, Kopec +15 (ale těžko se tam dostane), Brod - NELZE, Cesta +5, Vesnice 0
- **Slabosti:** `['cavalry', 'close_combat', 'mobility']`
- **ZOC:** Ne
- **Formace:** `{ siege: true }` - Bonus proti budovám a vozům
- **Ústup:** Ne
- **Speciální:** Delší příprava (2 tahy), ale větší poškození

---

## TERÉNNÍ MODIFIKÁTORY - PŘEHLED

| Terén    | Pěchota | Jízda | Střelci | Dělostřelectvo | Vozy |
|----------|---------|-------|---------|----------------|------|
| Les      | +10     | -15   | +10     | -30/NELZE      | NELZE|
| Kopec    | +10     | -5    | +15     | +15            | -10  |
| Brod     | -15     | -10   | -15     | NELZE          | NELZE|
| Cesta    | 0       | +15   | 0       | +10            | +20  |
| Vesnice  | +10     | -5    | +10     | 0              | +10  |

---

## IMPLEMENTAČNÍ POZNÁMKY

### Doporučená struktura v units.js:

```javascript
CEPNICI: {
    // ... existující vlastnosti ...
    
    lore: {
        description: "Ozbrojení sedláci a měšťané tvořící páteř husitských vojsk...",
        equipment: "Bojový cep, krátký meč, přilba, lehká brigantina",
        origin: "Tábor, husitská města",
        historicalNote: "Cepy bíti uměli tak hrozně..."
    },
    
    tactics: {
        terrain: {
            forest: 10,
            hill: 0,
            water: -20,
            road: 0,
            village: 10
        },
        weaknesses: ['ranged', 'cavalry_charge'],
        zoc: true,
        formationBonus: {
            offensive: { attack: 10, defense: -10 }
        },
        canRetreat: true
    }
}
```

### Systém terénních bonusů:

Modifikátory by měly ovlivňovat:
1. **Útok** - terénní bonus/malus k útoku
2. **Obranu** - terénní bonus/malus k obraně  
3. **Pohyb** - cena pohybu přes terén
4. **Viditelnost** - jak daleko jednotka vidí/je viděna

### Systém formací:

Formace by měly vyžadovat:
1. Minimální počet jednotek stejného typu
2. Specifické rozestavení (linie, čtverec, klín)
3. Aktivaci hráčem (akce za tah)

---

## ZDROJE A INSPIRACE

- Vojenská taktika husitských válek
- Výzbroj a zbroj 15. století
- Dobové kroniky (Vavřinec z Březové, Eneáš Silvius)
- Jan Žižka a jeho vojenské reformy
- Vozová hradba jako taktický systém
