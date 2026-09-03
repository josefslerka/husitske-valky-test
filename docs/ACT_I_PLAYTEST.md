# Playtest Aktu I

Cíl: nechat Akt I projít 3–5 lidmi, kteří neznají kód ani předchozí revizi. Test není zkouška hráče; hledá místa, kde hra nevysvětluje vlastní pravidla nebo historický příběh.

## Příprava

1. V kořeni projektu spusťte `python3 -m http.server 8000`.
2. Tester otevře `http://localhost:8000` v aktuálním Chrome, Firefoxu nebo Safari.
3. Začne novou kampaň a hraje alespoň tři bitvy Aktu I. Ideálně různí testeři vyzkoušejí všech pět.
4. Tester může používat save/load, měnit jazyk a zvolit začátečnickou obtížnost bez fog of war.
5. Pozorovatel neradí, dokud se tester výslovně nezasekne. Zapíše okamžik, akci a to, co hráč očekával.

Známé limity, které nejsou samy o sobě nálezem: AI je doktrinální, pozdější akty ještě potřebují širší balanc a dotykové ovládání není optimalizované.

## Čtyři otázky po hře

1. Kde ses ztratil nebo nevěděl, co udělat dál?
2. Co tě nudilo nebo bylo zbytečně pomalé?
3. Co jsi nepochopil na cíli mise?
4. Co bys chtěl vědět o bitvě a hra ti to neřekla?

## Minimální zápis

U každého testera stačí zaznamenat prohlížeč a šířku okna, odehrané bitvy, odpovědi na čtyři otázky a nejvýše tři pozorované problémy se stručným popisem reprodukce.
