# Calculator de Buget Personal Cashport

Acest pachet livrează un calculator de buget personal independent, realizat în HTML5, CSS3 și JavaScript Vanilla, cu un design premium inspirat vizual din direcția publică a Cashport.ro: fundal închis, accente verzi, carduri elegante și indicatori financiari clari.

## Fișiere livrate

- `index.html` – structura semantică a calculatorului;
- `style.css` – stilurile complete, cu toate clasele prefixate `cashport-budget-`;
- `script.js` – logica de calcul, validare și actualizare instant a indicatorilor și graficelor;
- `README.md` – instrucțiuni de integrare și publicare.

## Ce face calculatorul

- calculează venitul total lunar;
- calculează cheltuielile totale lunare;
- afișează soldul lunar;
- calculează rata economisirii, rata investițiilor, gradul de îndatorare și ponderea cheltuielilor pentru locuință;
- generează status financiar: Excelent, Bun, Atenție sau Critic;
- oferă recomandări automate personalizate;
- include o diagramă circulară pentru distribuția cheltuielilor și o bară comparativă pentru venituri vs. cheltuieli;
- tratează câmpurile goale ca `0` și acceptă doar valori numerice pozitive.

## Integrare în WordPress

### 1. HTML-ul

Copiază conținutul din `index.html` într-un bloc **Custom HTML** din pagina în care vrei să apară calculatorul.

### 2. CSS-ul

Copiază conținutul din `style.css` în una dintre variantele de mai jos:

- **Appearance → Customize → Additional CSS**; sau
- stylesheet-ul temei child / zonei dedicate de CSS custom din website.

### 3. JavaScript-ul

Copiază conținutul din `script.js`:

- într-un bloc HTML separat, între tag-uri `<script>...</script>`; sau
- într-o zonă dedicată pentru JavaScript custom din tema / platforma WordPress.

## Cum îl introduci într-un bloc Custom HTML

1. Deschide pagina dorită în editorul WordPress.
2. Adaugă un bloc **Custom HTML**.
3. Lipește codul din `index.html`.
4. Salvează pagina.
5. Adaugă stilurile din `style.css` în CSS-ul site-ului.
6. Adaugă logica din `script.js` după HTML sau în zona de JavaScript custom.
7. Verifică pagina pe desktop și mobil.

## Recomandări pentru publicarea pe Cashport.ro

- păstrează HTML-ul exact în forma livrată pentru a menține compatibilitatea cu JavaScript-ul;
- dacă tema are deja mod dark/light, lasă CSS-ul actual deoarece folosește variabile și `prefers-color-scheme`;
- dacă tema Cashport încarcă fontul Inter, componenta îl va folosi automat; altfel revine elegant la fonturile system sans-serif;
- testează calculatorul într-o pagină izolată înainte de publicarea finală;
- evită editarea prefixului `cashport-budget-`, deoarece acesta previne conflictele cu stilurile existente din WordPress.

## Disclaimer

Rezultatele sunt estimative și nu reprezintă consultanță financiară.
