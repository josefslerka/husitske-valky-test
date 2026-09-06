# Playtest Aktu I

Cíl: nechat Akt I projít 3–5 lidmi, kteří neznají kód ani předchozí revizi. Test není zkouška hráče; hledá místa, kde hra nevysvětluje vlastní pravidla nebo historický příběh.

## Příprava

1. V kořeni projektu spusťte `python3 -m http.server 8000`.
2. Tester otevře `http://localhost:8000` v aktuálním Chrome, Firefoxu nebo Safari.
3. Nechte testera začít z hlavního menu bez vysvětlování ovládání. První sezení stačí na Živohošť a případný druhý pokus; delší sezení může pokračovat třemi bitvami Aktu I. Ideálně různí testeři vyzkoušejí všech pět.
4. Tester může používat save/load, měnit jazyk a zvolit začátečnickou obtížnost bez fog of war.
5. Pozorovatel neradí, dokud se tester výslovně nezasekne. Zapíše okamžik, akci a to, co hráč očekával.

Známé limity, které nejsou samy o sobě nálezem: AI je doktrinální, pozdější akty ještě potřebují širší balanc a dotykové ovládání není optimalizované.

Každý tester potřebuje vlastní profil prohlížeče nebo vlastní zařízení, aby nezačínal
s cizím postupem. Nemažte kvůli testu existující save autora. Při lokálním spuštění
znamená `localhost` vždy počítač testera, nikoli počítač organizátora.

## Co sledovat v prvních minutách

- Najde hráč bez pobídky první bitvu a rozkazy? Rozliší podmínku vítězství od bonusu?
- Dokáže vybrat oddíl, vydat rozkaz a ukončit tah? Zapište i chybná očekávání,
  třeba kliknutí na barvu, kterou považoval za něco jiného.
- Všimne si situačního pokynu a stálého cíle nad mapou? Rozumí čekání na protivníka?
- Umí po konci vlastními slovy říct, proč vyhrál či prohrál? Chce zkusit další
  pokus nebo otevřít kroniku? Nevyzývejte ho k tomu předem.

Není nutné vyhrát. Porážka, kterou hráč chápe a chce po ní pokračovat, je cenný
výsledek testu. Automatické testy nenahrazují toto pozorování.

## Pět otázek po hře

1. Kde ses ztratil nebo nevěděl, co udělat dál?
2. Co tě nudilo nebo bylo zbytečně pomalé?
3. Co jsi nepochopil na cíli mise?
4. Co bys chtěl vědět o bitvě a hra ti to neřekla?
5. Který okamžik si budeš pamatovat a chtěl bys hrát další bitvu? Proč?

## Minimální zápis

U každého testera stačí prohlížeč a šířka okna, jazyk, obtížnost, odehrané bitvy,
odpovědi na pět otázek a nejvýše tři pozorované problémy. Zaznamenejte datum či
commit testované verze (`git rev-parse --short HEAD`), aby se nesmíchaly nálezy
z různých úprav. Zápisy slouží týmu; hra žádnou novou telemetrii neodesílá.

```text
Verze / prohlížeč / okno / jazyk / obtížnost:
Bitva a kolo:
Co jsem udělal:
Co jsem čekal:
Co se skutečně stalo:
Opakuje se? Screenshot nebo přesná hláška:
Nejsilnější okamžik / chuť pokračovat:
```

Před testem ověřte `node scripts/check.js` a krátce projděte menu → rozkazy →
první pohyb → uložení/načtení. V malém okně zkuste obě šipky postranních panelů,
jejich opětovné sbalení a změnu velikosti okna; obsah musí zůstat dosažitelný.
Po zpětné vazbě mají přednost pády, ztracený postup
a nesrozumitelné rozhodnutí před novými funkcemi nebo plošným laděním obtížnosti.
