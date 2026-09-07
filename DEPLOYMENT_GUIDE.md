# Nasazení na GitHub Pages

Projekt používá veřejný repozitář
[josefslerka/husitske-valky](https://github.com/josefslerka/husitske-valky).
Cílová adresa hry je
[Husitské války](https://josefslerka.github.io/husitske-valky/).

## Nastavení hostingu

V repozitáři otevřete **Settings → Pages**:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/(root)**

Hra nevyžaduje build, databázi ani serverovou aplikaci. Soubor `.nojekyll` v kořeni
vypíná zpracování Jekyllem; HTML, JavaScript, CSS, překlady a hudba se publikují jako
statické soubory. Relativní cesty fungují i pod prefixem `/husitske-valky/`.

Repozitář, jeho historie a web jsou veřejné. Do commitu nepatří přístupové údaje,
osobní poznámky testerů ani knihy/PDF ze složky `zdroje/`. Gitignore není ochranou
již commitnutých souborů. Ani soukromé repo samo o sobě neznamená neveřejný Pages web.

## Další vydání

V kořeni projektu:

```bash
node scripts/check.js
git status
```

Po úspěšných kontrolách commitněte jen zamýšlené soubory a odešlete je:

```bash
git push origin main
```

Pokud se mění JS, CSS nebo locale, aktualizujte odpovídající `?v=` podle
[pravidel údržby](docs/CODE_STRUCTURE.md). Po pushi zkontrolujte v záložce
**Actions** běh **CI** a samostatný běh **pages build and deployment**.
Nahraná verze nemusí být dostupná okamžitě; konečnou adresu a stav ukazuje také
**Settings → Pages**.

Současné CI provádí kontroly, ale **neblokuje** publikování z větve. Proto musí
kontroly projít už před pushem. Nasazení podmíněné zeleným CI by vyžadovalo změnu
na vlastní publikační workflow.

## Kontrola veřejné verze

- Otevřete HTTPS adresu hry, nikoli lokální `file://` soubor.
- Zkuste české i anglické menu, první briefing a pohyb jednotky.
- Ověřte postranní panely, konec tahu, uložení a načtení.
- Po dokončení bitvy ověřte výsledek a kroniku.
- Pokud chybí překlady nebo assety, ověřte jejich HTTP odpověď a přesnou velikost
  písmen v cestě. Při staré verzi obnovte stránku a zkontrolujte cache verze.

Savy a kroniky z localhostu se na novou adresu automaticky nepřenesou. Jsou uložené
v prohlížeči pro konkrétní původ webu; hra je neposílá na server.
Podklad pro testery je v [docs/ACT_I_PLAYTEST.md](docs/ACT_I_PLAYTEST.md).

## Lokální hraní

```bash
python3 -m http.server 8000
```

Poté otevřete [localhost:8000](http://localhost:8000). Stejný HTTP server je potřeba
i po rozbalení ZIPu; samotné otevření `index.html` může zablokovat načítání překladů.

Nastavení vychází z [dokumentace GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
