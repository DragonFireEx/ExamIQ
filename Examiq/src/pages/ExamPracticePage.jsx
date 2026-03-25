// pages/ExamPracticePage.jsx
// Symulator egzaminu praktycznego INF04 — 3 zadania (konsolowa, desktopowa/mobilna, webowa)
// Monaco Editor + ocena AI (0-100) + wskazówki (0-2) + czas nielimitowany lub 3h łącznie

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { usePageTitle } from '../hooks/usePageTitle';

// ─── STAŁE ────────────────────────────────────────────────────────────────────

const LANG_OPTIONS = [
  { id: 'python',     label: 'Python',     monaco: 'python',     template: '# Twój kod tutaj\n' },
  { id: 'cpp',        label: 'C++',        monaco: 'cpp',        template: '// Twój kod tutaj\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n' },
  { id: 'java',       label: 'Java',       monaco: 'java',       template: '// Twój kod tutaj\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n' },
  { id: 'csharp',     label: 'C#',         monaco: 'csharp',     template: '// Twój kod tutaj\nusing System;\n\nclass Program {\n    static void Main() {\n        \n    }\n}\n' },
];

// Arkusze egzaminacyjne — każdy z 3 zadaniami
const EXAM_SHEETS = [
  {
    id: 'sheet_001',
    title: 'Arkusz 1 — Loteria & RGB',
    description: 'Loteria liczbowa + wzornik kolorów RGB',
    difficulty: 'medium',
    tasks: [
      {
        id: 't1_konsola',
        type: 'konsola',
        label: 'Zadanie 1 — Konsolowa',
        title: 'Loteria liczbowa',
        description: `Napisz program loterii liczbowej w wybranym języku obiektowym (Python, Java, C#, C++).

Założenia:
• Program wczytuje z klawiatury ile zestawów należy wylosować
• Generuje podaną liczbę zestawów złożonych z 6 unikalnych liczb całkowitych ze zbioru <1, 49>
• W jednym zestawie liczby nie mogą się powtarzać
• Program zlicza we wszystkich zestawach ile razy wystąpiła każda liczba od 1 do 49
• Wyświetla zestawy oraz zliczenia wystąpień

Wymagania techniczne:
• Użyj dwuwymiarowej tablicy n×6 (lub odpowiedniej kolekcji)
• Zdefiniuj przynajmniej dwie funkcje:
  - wypełniającą tablicę danymi losowań
  - wyświetlającą wyniki wszystkich losowań
• Brak zmiennych globalnych (w podejściu strukturalnym)
• Znaczące nazwy zmiennych i funkcji

Przykładowe wyjście (dla n=3):
Losowanie 1: 5 12 33 7 49 2
Losowanie 2: 18 3 41 22 9 35
Losowanie 3: 7 19 6 44 31 1
Wystąpienia liczby 1: 1
Wystąpienia liczby 2: 1
...`,
        hints: [
          'Użyj set/HashSet do przechowywania tymczasowego zestawu — gwarantuje unikalność liczb. Losuj dopóki set nie ma 6 elementów.',
          'Tablica wystąpień: utwórz tablicę int[50] (indeksy 1-49). Iteruj po wszystkich zestawach i dla każdej liczby zwiększ counter[liczba]++.',
        ],
        evaluation_criteria: [
          'Program poprawnie wczytuje liczbę zestawów od użytkownika',
          'Generuje zestawy 6 unikalnych liczb z zakresu 1-49',
          'Używa dwuwymiarowej tablicy lub odpowiedniej kolekcji',
          'Zdefiniowane są co najmniej dwie wymagane funkcje',
          'Zliczanie wystąpień każdej liczby działa poprawnie',
          'Wyniki są czytelnie wyświetlane na ekranie',
          'Kod jest czytelny, brak zmiennych globalnych',
        ],
        example_output: 'Ile zestawów? 2\nLosowanie 1: 5 18 33 7 49 2\nLosowanie 2: 18 3 41 22 9 35\nWystąpienia liczby 1: 0\nWystąpienia liczby 2: 1\n...',
      },
      {
        id: 't1_desktop',
        type: 'desktop',
        label: 'Zadanie 2 — Desktopowa',
        title: 'Wzornik kolorów RGB',
        description: `Wykonaj aplikację desktopową wzornika kolorów RGB.

Opis wyglądu:
• Tytuł okna: "Wzornik kolorów RGB. Wykonał [numer zdającego]"
• Tło okna: Cornsilk (#FFF8DC)
• Duży prostokąt z białym tłem (podgląd koloru)
• Napis: "Dobierz kolor suwakami i zapisz przyciskiem:"
• Trzy suwaki R, G, B — zakres 0-255, wartość początkowa 255
• Etykiety z wartością suwaka po prawej stronie (domyślnie "255")
• Przycisk "Pobierz" w kolorze Peru (#CD853F)
• Mały prostokąt z białym tłem i napisem "255, 255, 255"

Działanie:
• Ruch suwakami → zmiana wartości etykiet + kolor dużego prostokąta
• Kliknięcie "Pobierz" → mały prostokąt przyjmuje aktualny kolor RGB i wyświetla wartości
• Dalsze ruchy suwakami NIE zmieniają małego prostokąta — tylko dużego
• Mały prostokąt zmienia się wyłącznie po kliknięciu "Pobierz"

Możesz użyć: WinForms, WPF, JavaFX, Tkinter, Qt lub innego frameworka GUI.
Opisz w kodzie (komentarze) jak uruchomić aplikację.`,
        hints: [
          'W WinForms/C#: użyj TrackBar dla suwaków (Minimum=0, Maximum=255, Value=255). W zdarzeniu Scroll aktualizuj Label i BackColor dużego panelu przez Color.FromArgb(sliderR.Value, sliderG.Value, sliderB.Value).',
          'W Tkinter/Python: użyj ttk.Scale(from_=0, to=255, orient=HORIZONTAL). Callback command=update_color aktualizuje canvas.configure(bg=f"#{r:02x}{g:02x}{b:02x}").',
        ],
        evaluation_criteria: [
          'Aplikacja uruchamia się bez błędów',
          'Okno ma poprawny tytuł i tło Cornsilk',
          'Trzy suwaki R/G/B z zakresem 0-255 i etykietami wartości',
          'Ruch suwakami zmienia kolor dużego prostokąta na bieżąco',
          'Przycisk "Pobierz" kopiuje aktualny kolor do małego prostokąta',
          'Mały prostokąt nie zmienia się przy ruchach suwakami po "Pobierz"',
          'Kod jest czytelny z znaczącymi nazwami zmiennych',
        ],
        example_output: 'Aplikacja GUI — opisz działanie i wklej kod źródłowy.\nW komentarzu: jak uruchomić, jakie biblioteki/framework użyto.',
      },
      {
        id: 't1_web',
        type: 'web',
        label: 'Zadanie 3 — Dokumentacja',
        title: 'Dokumentacja i zrzuty ekranu',
        description: `Wykonaj dokumentację do aplikacji z zadań 1 i 2.

Część A — Komentarz dokumentacyjny funkcji (w kodzie konsolowym):
Dodaj komentarz nagłówkowy do jednej dowolnej funkcji według wzoru:

/**
 * nazwa funkcji: <nazwa>
 * opis funkcji: <co robi>
 * parametry: <nazwa i opis parametru lub "brak">
 * zwracany typ i opis: <typ i opis lub "brak">
 * autor: <numer zdającego>
 */

Część B — Plik egzamin.docx:
Utwórz dokument zawierający:
• Nazwę systemu operacyjnego
• Nazwy środowisk programistycznych
• Nazwy języków programowania

Część C — Zrzuty ekranu:
• konsola1.png — stan początkowy programu konsolowego
• konsola2.png — wynik dla n=3 zestawów
• desktop1.png — stan początkowy aplikacji
• desktop2.png — po zmianie suwaków
• desktop3.png — po kliknięciu "Pobierz"

W tym polu wpisz:
1. Gotowy komentarz dokumentacyjny dla wybranej funkcji z zadania 1
2. Proponowaną treść pliku egzamin (system, środowisko, język)
3. Opis co widać na każdym zrzucie ekranu`,
        hints: [
          'Wzór komentarza jest ściśle określony — zachowaj nazwy pól: "nazwa funkcji:", "opis funkcji:", "parametry:", "zwracany typ i opis:", "autor:". Każde pole w osobnej linii.',
          'Plik egzamin.docx powinien być w edytorze tekstu (Word, LibreOffice Writer). Zapisz informacje systemowe: np. Windows 10, Visual Studio 2022 / PyCharm, Python 3.11 / C#.',
        ],
        evaluation_criteria: [
          'Komentarz dokumentacyjny zawiera wszystkie wymagane pola',
          'Komentarz jest umieszczony przy konkretnej funkcji z kodu',
          'Plik egzamin zawiera nazwę systemu operacyjnego',
          'Plik egzamin zawiera nazwy środowisk programistycznych',
          'Plik egzamin zawiera nazwy języków programowania',
          'Opisano zrzuty ekranu zgodnie z wymaganiami',
        ],
        example_output: '// Przykład dokumentacji:\n/*\n * nazwa funkcji: generujZestaw\n * opis funkcji: Generuje zestaw 6 unikalnych liczb z zakresu 1-49\n * parametry: brak\n * zwracany typ i opis: int[] - tablica 6 unikalnych liczb\n * autor: 00000000000\n */',
      },
    ],
  },
  {
    id: 'sheet_002',
    title: 'Arkusz 2 — Urządzenia domowe',
    description: 'OOP urządzenia + Android XML + dokumentacja',
    difficulty: 'medium',
    tasks: [
      {
        id: 't2_konsola',
        type: 'konsola',
        label: 'Zadanie 1 — Konsolowa',
        title: 'Klasy OOP — Urządzenia domowe',
        description: `Zaimplementuj program z hierarchią klas urządzeń domowych.

Struktura klas:
• Klasa bazowa Urzadzenie:
  - Jedna publiczna metoda wyswietl(komunikat) — wyświetla komunikat, nie zwraca wartości

• Klasa Pralka (dziedziczy po Urzadzenie):
  - Prywatne pole int nrProgramu = 0 (niedostępne w klasach potomnych)
  - Metoda int ustawProgram(int nr) — jeśli nr ∈ <1,12> ustaw pole i zwróć nr, w p.p. ustaw 0 i zwróć 0

• Klasa Odkurzacz (dziedziczy po Urzadzenie):
  - Prywatne pole bool wlaczony = false
  - Metoda on() — włącza TYLKO jeśli wyłączony; ustawia true, wywołuje wyswietl("Odkurzacz włączono")
  - Metoda off() — wyłącza TYLKO jeśli włączony; ustawia false, wywołuje wyswietl("Odkurzacz wyłączono")

Program główny:
• Stwórz obiekt Pralka, przetestuj z wartościami poprawnymi i niepoprawnymi
• Stwórz obiekt Odkurzacz:
  - Wywołaj on() 3 razy (komunikat wyświetli się tylko raz)
  - Wywołaj wyswietl("Odkurzacz wyładował się")
  - Wywołaj off()

Oczekiwane wyjście:
Podaj numer prania 1..12: 11
Program został ustawiony
Podaj numer prania 1..12: 44
Podano niepoprawny numer programu
Odkurzacz włączono
Odkurzacz wyładował się
Odkurzacz wyłączono`,
        hints: [
          'Guard clause w on(): if (wlaczony) return; — dzięki temu wielokrotne wywołanie nie wypisze komunikatu. Analogicznie w off(): if (!wlaczony) return;',
          'W Pythonie prywatne pole symuluj przez __nrProgramu (name mangling). Metoda ustaw_program zwraca self.__nrProgramu po przypisaniu.',
        ],
        evaluation_criteria: [
          'Klasa bazowa Urzadzenie z metodą wyswietl(komunikat)',
          'Klasa Pralka z prywatnym polem nrProgramu i metodą ustawProgram',
          'Metoda ustawProgram poprawnie waliduje zakres 1-12',
          'Klasa Odkurzacz z prywatnym polem bool i metodami on/off',
          'on() działa tylko gdy odkurzacz jest wyłączony',
          'off() działa tylko gdy odkurzacz jest włączony',
          'Program główny testuje wszystkie przypadki zgodnie z treścią',
        ],
        example_output: 'Podaj numer prania 1..12: 11\nProgram został ustawiony\nPodaj numer prania 1..12: 44\nPodano niepoprawny numer programu\nOdkurzacz włączono\nOdkurzacz wyładował się\nOdkurzacz wyłączono',
      },
      {
        id: 't2_mobile',
        type: 'mobile',
        label: 'Zadanie 2 — Mobilna (Android)',
        title: 'Aplikacja mobilna — Urządzenia domowe',
        description: `Wykonaj aplikację Android do obsługi urządzeń domowych.

Elementy UI (XML layout):
• Tło głównego layoutu: LightBlue (#ADD8E6)
• Nagłówek "Urządzenia Domowe" — duża czcionka, wyśrodkowany, margines 5
• Napis "Autor: [numer zdającego]" — wyśrodkowany, margines 5

Sekcja Pralka (LinearLayout poziomy):
• Obraz pralka.jpg (wysokość 150, marginesy L/R/D: 20, góra: 0)
• LinearLayout pionowy:
  - TextView "Pralka" — duża czcionka
  - EditText z podpowiedzią "Podaj nr prania 1..12", inputType=number, tło SkyBlue (#87CEEB), kolor tekstu Navy (#000080)
  - Button "Zatwierdź" — tło RoyalBlue (#4169E1), margines 10
  - TextView "Numer prania: nie podano"

Sekcja Odkurzacz (LinearLayout poziomy):
• Obraz odkurzacz.jpg (wysokość 150, marginesy L/R/D: 20, góra: 0)
• LinearLayout pionowy:
  - TextView "Odkurzacz" — duża czcionka
  - Button "Włącz" — tło RoyalBlue (#4169E1), margines 10
  - TextView "Odkurzacz wyłączony"
  - TextView "Status: naładowany"

Logika (Activity/Fragment):
• "Zatwierdź": pobierz liczbę z EditText, jeśli 1-12 → "Numer prania: X", w p.p. brak zmiany
• "Włącz/Wyłącz": toggle — zmienia tekst przycisku i etykietę stanu

Wklej kod XML layoutu oraz kod Activity (Java lub Kotlin).`,
        hints: [
          'W XML użyj android:inputType="number" dla EditText. W onClick: String val = editText.getText().toString(); int nr = Integer.parseInt(val); if (nr>=1 && nr<=12) labelNr.setText("Numer prania: "+nr);',
          'Toggle w Javie: if (btnWlacz.getText().equals("Włącz")) { btnWlacz.setText("Wyłącz"); labelStatus.setText("Odkurzacz włączony"); } else { btnWlacz.setText("Włącz"); labelStatus.setText("Odkurzacz wyłączony"); }',
        ],
        evaluation_criteria: [
          'Layout XML zawiera wszystkie wymagane elementy UI',
          'Kolory tła są zgodne ze specyfikacją (LightBlue, SkyBlue, RoyalBlue)',
          'EditText ma inputType=number i podpowiedź',
          'Przycisk "Zatwierdź" poprawnie waliduje zakres 1-12',
          'Toggle Włącz/Wyłącz zmienia tekst przycisku i etykiety',
          'Marginesy i rozmiary obrazów zgodne ze specyfikacją',
          'Kod Activity jest czytelny z znaczącymi nazwami',
        ],
        example_output: '<!-- XML layout + kod Activity -->\n<!-- Po kliknięciu Zatwierdź z wartością 4: "Numer prania: 4" -->\n<!-- Po kliknięciu Włącz: przycisk → "Wyłącz", etykieta → "Odkurzacz włączony" -->',
      },
      {
        id: 't2_doc',
        type: 'doc',
        label: 'Zadanie 3 — Dokumentacja',
        title: 'Dokumentacja metody + plik egzamin',
        description: `Wykonaj dokumentację do aplikacji z zadań 1 i 2.

Część A — Komentarz dokumentacyjny metody klasy bazowej:
Dodaj komentarz do metody wyswietl() klasy Urzadzenie według wzoru:

/**
 * nazwa: wyswietl
 * opis: <co robi metoda>
 * parametry: <nazwa i opis parametru>
 * zwracany typ i opis: <typ lub "brak">
 * autor: <numer zdającego>
 */

Część B — Plik egzamin (w edytorze tekstu):
• Nazwa systemu operacyjnego
• Nazwy środowisk programistycznych  
• Nazwa emulatora dla aplikacji mobilnej (np. Pixel 5 API 33)
• Nazwy języków programowania

Część C — Zrzuty ekranu:
• konsola1.png, konsola2.png — działanie programu
• mobile1.png — stan początkowy emulatora
• mobile2.png — po kliknięciu "Zatwierdź" (z poprawną wartością)
• mobile3.png — po kliknięciu "Włącz"
• mobile4.png — po kliknięciu "Wyłącz"

Wpisz gotowy komentarz dokumentacyjny, treść pliku egzamin i opisy zrzutów.`,
        hints: [
          'Wzór dokumentacji dla metody klasy bazowej: nazwa: wyswietl / opis: Wyświetla komunikat w konsoli / parametry: komunikat - treść wyświetlanego tekstu / zwracany typ: brak / autor: [nr]',
          'Plik egzamin zapisz w .docx (Word) lub .odt (LibreOffice). Niezbędne pola: OS (np. Windows 10 22H2), IDE (np. IntelliJ IDEA 2024 + Android Studio), emulator (Pixel 5 API 33), języki (Java / Kotlin, Python/C#/Java).',
        ],
        evaluation_criteria: [
          'Komentarz dokumentacyjny zawiera wszystkie wymagane pola wzoru',
          'Komentarz dotyczy metody klasy bazowej',
          'Plik egzamin zawiera nazwę systemu operacyjnego',
          'Plik egzamin zawiera nazwy środowisk i emulatora',
          'Opisano zrzuty ekranu zgodnie z wymaganiami (konsola + mobile)',
        ],
        example_output: '/*\n * nazwa: wyswietl\n * opis: Wyświetla podany komunikat na standardowym wyjściu\n * parametry: komunikat - tekst do wyświetlenia\n * zwracany typ i opis: brak\n * autor: 00000000000\n */',
      },
    ],
  },
  {
    id: 'sheet_003',
    title: 'Arkusz 3 — Tablica & Galeria',
    description: 'Klasa tablicy + React galeria zdjęć',
    difficulty: 'hard',
    tasks: [
      {
        id: 't3_konsola',
        type: 'konsola',
        label: 'Zadanie 1 — Konsolowa',
        title: 'Klasa operacji na tablicy',
        description: `Zaimplementuj klasę z operacjami na tablicy liczb całkowitych.

Pola klasy (prywatne, niedostępne w klasach potomnych):
• Tablica liczb całkowitych (tradycyjna tablica / lista w Pythonie)
• Liczba elementów (faktyczna, int)

Konstruktor:
• Przyjmuje rozmiar tablicy jako argument
• Ustawia pole liczby elementów na rozmiar
• Wypełnia tablicę pseudolosowymi liczbami z zakresu 1-1000

Metody (wszystkie publiczne):
• wyswietl() — drukuje każdy element jako "<index>: <wartość>", brak zwracanej wartości
• szukaj(wartosc) — zwraca indeks pierwszego wystąpienia lub -1 gdy nie znaleziono
• nieparzyste() — wyświetla liczby nieparzyste i ZWRACA ich liczbę
• srednia() — oblicza i ZWRACA średnią arytmetyczną

Program główny (rozmiar > 20):
• Stwórz obiekt z tablicą większą niż 20 elementów
• Wywołaj wyswietl()
• Wywołaj szukaj() — jeśli znaleziono wyświetl indeks, jeśli nie — nic nie wyświetlaj
• Wywołaj nieparzyste(), wyświetl liczbę nieparzystych z komentarzem
• Wywołaj srednia(), wyświetl wynik

Przykładowe wyjście (fragment):
0: 559
1: 999
...
Liczby nieparzyste:
559
999
...
Razem nieparzystych: 25
Średnia wszystkich elementów: 525`,
        hints: [
          'W Pythonie private pole: self.__tablica = [random.randint(1,1000) for _ in range(rozmiar)]. Metoda szukaj zwraca indeks przez enumerate: for i,v in enumerate(self.__tablica): if v==wartosc: return i. Return -1 na końcu.',
          'Metoda nieparzyste() powinna jednocześnie wyświetlać i zliczać: count=0; for v in self.__tablica: if v%2!=0: print(v); count+=1; return count.',
        ],
        evaluation_criteria: [
          'Klasa z prywatną tablicą i polem liczby elementów',
          'Konstruktor przyjmuje rozmiar i wypełnia tablicę losowymi liczbami 1-1000',
          'Metoda wyswietl() drukuje indeks i wartość każdego elementu',
          'Metoda szukaj() zwraca poprawny indeks lub -1',
          'Metoda nieparzyste() wyświetla i zwraca liczbę nieparzystych',
          'Metoda srednia() poprawnie oblicza i zwraca średnią',
          'Program główny używa tablicy > 20 elementów i testuje wszystkie metody',
        ],
        example_output: '0: 559\n1: 999\n...\nLiczby nieparzyste:\n559\n999\n...\nRazem nieparzystych: 25\nŚrednia wszystkich elementów: 525',
      },
      {
        id: 't3_web',
        type: 'web',
        label: 'Zadanie 2 — Webowa',
        title: 'Galeria zdjęć z kategoriami (React)',
        description: `Wykonaj aplikację React z galerią zdjęć kategoryzowanych.

Dane (skopiuj jako tablicę w komponencie):
[
  { id:1, alt:"mak", filename:"mak.jpg", category:1, downloads:35 },
  { id:2, alt:"bukiet", filename:"bukiet.jpg", category:1, downloads:43 },
  { id:3, alt:"roza", filename:"roza.jpg", category:1, downloads:33 },
  { id:4, alt:"dalmatynczyk", filename:"dalm.jpg", category:2, downloads:2 },
  { id:5, alt:"swinki", filename:"swinki.jpg", category:2, downloads:53 },
  { id:6, alt:"szczeniak", filename:"szcz.jpg", category:2, downloads:43 },
  { id:7, alt:"audi", filename:"audi.jpg", category:3, downloads:10 },
  { id:8, alt:"garbus", filename:"garbus.jpg", category:3, downloads:320 },
]

Kategorie: 1=Kwiaty, 2=Zwierzęta, 3=Samochody

Komponenty i logika:
• Nagłówek h1 "Kategorie zdjęć"
• 3 pola switch (checkbox) domyślnie włączone: Kwiaty, Zwierzęta, Samochody
• Zdjęcia wyświetlane warunkowo — tylko z włączonych kategorii
• Układ siatki (flex-wrap lub grid)
• Każdy blok: zdjęcie + h4 "Pobrań: X" + przycisk "Pobierz"
• Kliknięcie "Pobierz" → downloads++ (aktualizuje stan)
• Zdjęcia: marginesy 5px, zaokrąglone rogi (border-radius 8px)
• Przyciski "Pobierz": tło zielone (#28a745), biały tekst, rounded
• Switche: Bootstrap lub własny styl

Styl switchy i przycisków zgodny z Bootstrap lub własny CSS.
Aplikacja działa dla dowolnej liczby zdjęć (pętle, nie hardcode).`,
        hints: [
          'Stan: const [photos, setPhotos] = useState(initialData); const [active, setActive] = useState({1:true,2:true,3:true}). Filtrowanie: photos.filter(p => active[p.category]).map(p => <PhotoCard .../>)',
          'Increment pobrań: setPhotos(prev => prev.map(p => p.id === id ? {...p, downloads: p.downloads+1} : p)). Dzięki spread operator nie mutujesz oryginalnego obiektu.',
        ],
        evaluation_criteria: [
          'Nagłówek h1 "Kategorie zdjęć" jest widoczny',
          'Trzy przełączniki checkbox domyślnie włączone',
          'Odznaczenie kategorii ukrywa odpowiednie zdjęcia',
          'Każdy blok zdjęcia zawiera obraz, liczbę pobrań i przycisk',
          'Kliknięcie "Pobierz" zwiększa licznik pobrań na bieżąco',
          'Aplikacja używa pętli (map) — nie hardcode bloków',
          'Kod jest czytelny, stan zarządzany przez useState',
        ],
        example_output: '// React — po kliknięciu Pobierz dla garbus.jpg\n// downloads zmienia się z 320 na 321\n// Odznaczenie "Zwierzęta" ukrywa 3 zdjęcia zwierząt',
      },
      {
        id: 't3_doc',
        type: 'doc',
        label: 'Zadanie 3 — Dokumentacja',
        title: 'Dokumentacja metody + plik egzamin',
        description: `Wykonaj dokumentację do aplikacji z zadań 1 i 2.

Część A — Komentarz dokumentacyjny dowolnej metody z klasy z zadania 1:

/**
 * nazwa metody: <nazwa>
 * opis metody: <co robi>
 * parametry: <lub "brak">
 * zwracany typ i opis: <typ i opis lub "brak">
 * autor: <numer zdającego>
 */

Część B — Plik egzamin (edytor tekstu):
• Nazwa systemu operacyjnego
• Nazwy środowisk programistycznych
• Nazwy języków programowania

Część C — Zrzuty ekranu:
• konsola1.png, konsola2.png — działanie programu konsolowego
• web1.png — stan początkowy galerii (wszystkie kategorie)
• web2.png — po odznaczeniu jednej kategorii
• web3.png — po kliknięciu "Pobierz" (zmieniona liczba pobrań)

Wpisz gotowy komentarz dokumentacyjny, treść pliku egzamin i opis zrzutów.`,
        hints: [
          'Wybierz metodę z parametrem, np. szukaj(wartosc) — łatwiej opisać parametry. Wzór: nazwa metody: szukaj / opis: Wyszukuje pierwsze wystąpienie wartości / parametry: wartosc - szukana liczba całkowita / zwracany typ: int - indeks lub -1.',
          'Plik egzamin: Windows 11, PyCharm 2024 / VS Code + node, Python 3.12 / JavaScript (React 18). Dla web: nie ma emulatora — przeglądarka (np. Chrome 124).',
        ],
        evaluation_criteria: [
          'Komentarz dokumentacyjny zawiera wszystkie wymagane pola',
          'Komentarz dotyczy metody z kodu klasy (zadanie 1)',
          'Plik egzamin zawiera wszystkie trzy wymagane informacje',
          'Opisano zrzuty ekranu dla obu aplikacji',
          'Dokumentacja jest kompletna i zgodna z wzorem',
        ],
        example_output: '/*\n * nazwa metody: szukaj\n * opis metody: Wyszukuje pierwsze wystąpienie podanej wartości w tablicy\n * parametry: wartosc - szukana liczba całkowita\n * zwracany typ i opis: int - indeks elementu lub -1 gdy nie znaleziono\n * autor: 00000000000\n */',
      },
    ],
  },
];

const TASK_TYPE_ICON = { konsola: '💻', desktop: '🖥️', mobile: '📱', web: '🌐', doc: '📄' };
const TASK_TYPE_LABEL = { konsola: 'Konsolowa', desktop: 'Desktopowa', mobile: 'Mobilna', web: 'Webowa', doc: 'Dokumentacja' };

// ─── TIMER HOOK ───────────────────────────────────────────────────────────────
function useExamTimer(limitMinutes, onExpire) {
  const totalSeconds = limitMinutes ? limitMinutes * 60 : null;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (totalSeconds && next >= totalSeconds) {
          clearInterval(ref.current);
          setRunning(false);
          onExpire?.();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running, totalSeconds]);

  const remaining = totalSeconds ? totalSeconds - elapsed : null;
  const pct = totalSeconds ? (elapsed / totalSeconds) * 100 : 0;

  function fmt(s) {
    const src = s ?? elapsed;
    const h = Math.floor(src / 3600);
    const m = Math.floor((src % 3600) / 60);
    const sec = src % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  const danger  = remaining !== null && remaining < 600;
  const warning = remaining !== null && remaining < 1800;

  return {
    elapsed, remaining, pct, fmt, danger, warning, running,
    pause:  () => setRunning(false),
    resume: () => setRunning(true),
  };
}

// ─── MONACO EDITOR ────────────────────────────────────────────────────────────
function MonacoEditor({ lang, value, onChange, height = '100%' }) {
  const containerRef = useRef(null);
  const editorRef    = useRef(null);

  useEffect(() => {
    if (!window.monaco || editorRef.current) return;
    const monacoLang = LANG_OPTIONS.find(l => l.id === lang)?.monaco || 'plaintext';
    editorRef.current = window.monaco.editor.create(containerRef.current, {
      value,
      language: monacoLang,
      theme: 'vs-dark',
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      padding: { top: 12, bottom: 12 },
      lineNumbers: 'on',
      tabSize: 4,
      insertSpaces: true,
      wordWrap: 'on',
      automaticLayout: true,
    });
    editorRef.current.onDidChangeModelContent(() => {
      onChange?.(editorRef.current.getValue());
    });
    return () => { editorRef.current?.dispose(); editorRef.current = null; };
  }, []);

  useEffect(() => {
    if (!editorRef.current || !window.monaco) return;
    const monacoLang = LANG_OPTIONS.find(l => l.id === lang)?.monaco || 'plaintext';
    const model = editorRef.current.getModel();
    if (model) window.monaco.editor.setModelLanguage(model, monacoLang);
  }, [lang]);

  return <div ref={containerRef} style={{ width: '100%', height }} />;
}

// ─── SETUP SCREEN ─────────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [hints,  setHints]  = useState(1);   // 0 | 1 | 2
  const [timer,  setTimer]  = useState('unlimited'); // 'unlimited' | '180'
  const [lang,   setLang]   = useState('python');

  const canStart = selectedSheet !== null;

  function handleStart() {
    const sheet = EXAM_SHEETS.find(s => s.id === selectedSheet);
    onStart({ sheet, hints, timer, lang });
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f5f3ff 0%,#ede9fe 45%,#e0e7ff 100%)', fontFamily: "'Sora', sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 99, padding: '0.4rem 1.1rem', marginBottom: '1rem',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              📋 Egzamin praktyczny INF04
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.5rem)', fontWeight: 900, color: '#3b0764', margin: '0 0 0.5rem', letterSpacing: '-1px' }}>
            Wybierz arkusz
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            3 zadania na arkusz · ocena AI 0–100 pkt · z wskazówkami lub bez
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(124,58,237,0.12)', borderRadius: 24,
          padding: '2rem', boxShadow: '0 4px 32px rgba(124,58,237,0.08)',
          display: 'flex', flexDirection: 'column', gap: '1.75rem',
        }}>

          {/* Arkusze */}
          <div>
            <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Arkusz egzaminacyjny
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {EXAM_SHEETS.map(sheet => {
                const sel = selectedSheet === sheet.id;
                return (
                  <button key={sheet.id} onClick={() => setSelectedSheet(sheet.id)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                    padding: '1rem 1.25rem', borderRadius: 14, textAlign: 'left',
                    border: sel ? '2px solid #7c3aed' : '1.5px solid rgba(124,58,237,0.12)',
                    background: sel ? 'rgba(124,58,237,0.07)' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer', fontFamily: "'Sora', sans-serif", transition: 'all 0.12s',
                  }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      {sel
                        ? <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</span>
                          </div>
                        : <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.25)' }} />
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: sel ? '#7c3aed' : '#1f2937', marginBottom: '0.25rem' }}>{sheet.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{sheet.description}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {sheet.tasks.map(t => (
                          <span key={t.id} style={{
                            fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem',
                            borderRadius: 6, background: 'rgba(124,58,237,0.08)',
                            color: '#7c3aed', border: '1px solid rgba(124,58,237,0.15)',
                          }}>
                            {TASK_TYPE_ICON[t.type]} {TASK_TYPE_LABEL[t.type]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Język */}
          <div>
            <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Język programowania (zadanie konsolowe)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {LANG_OPTIONS.map(l => (
                <button key={l.id} onClick={() => setLang(l.id)} style={{
                  padding: '0.7rem', borderRadius: 12, textAlign: 'center',
                  border: lang === l.id ? '2px solid #7c3aed' : '2px solid rgba(124,58,237,0.12)',
                  background: lang === l.id ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', fontFamily: "'Sora', sans-serif", transition: 'all 0.12s',
                  fontWeight: 700, fontSize: '0.82rem', color: lang === l.id ? '#7c3aed' : '#6b7280',
                }}>{l.label}</button>
              ))}
            </div>
          </div>

          {/* Wskazówki */}
          <div>
            <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Liczba wskazówek na zadanie
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { val: 0, icon: '🏆', label: '0 wskazówek', sub: 'tryb ekspercki' },
                { val: 1, icon: '💡', label: '1 wskazówka',  sub: 'tryb normalny' },
                { val: 2, icon: '🆘', label: '2 wskazówki', sub: 'tryb pomocniczy' },
              ].map(opt => (
                <button key={opt.val} onClick={() => setHints(opt.val)} style={{
                  padding: '0.85rem', borderRadius: 14, textAlign: 'center',
                  border: hints === opt.val ? '2px solid #7c3aed' : '2px solid rgba(124,58,237,0.12)',
                  background: hints === opt.val ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', fontFamily: "'Sora', sans-serif", transition: 'all 0.12s',
                }}>
                  <div style={{ fontSize: '1.3rem' }}>{opt.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: hints === opt.val ? '#7c3aed' : '#374151', marginTop: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: '0.65rem', color: hints === opt.val ? '#a78bfa' : '#9ca3af', marginTop: 2 }}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Czas */}
          <div>
            <label style={{ display: 'block', color: '#374151', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Limit czasu łącznie
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { val: 'unlimited', icon: '∞', label: 'Bez limitu',   sub: 'nauka własnym tempem' },
                { val: '180',       icon: '⏱️', label: '3 godziny',   sub: 'warunki egzaminacyjne' },
              ].map(opt => (
                <button key={opt.val} onClick={() => setTimer(opt.val)} style={{
                  padding: '0.9rem', borderRadius: 14, textAlign: 'center',
                  border: timer === opt.val ? '2px solid #7c3aed' : '2px solid rgba(124,58,237,0.12)',
                  background: timer === opt.val ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', fontFamily: "'Sora', sans-serif", transition: 'all 0.12s',
                }}>
                  <div style={{ fontSize: '1.5rem' }}>{opt.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: timer === opt.val ? '#7c3aed' : '#374151', marginTop: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: '0.7rem', color: timer === opt.val ? '#a78bfa' : '#9ca3af', marginTop: 2 }}>{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Start */}
          <button onClick={handleStart} disabled={!canStart} style={{
            padding: '1rem', borderRadius: 14, border: 'none',
            background: canStart ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : '#e5e7eb',
            color: canStart ? '#fff' : '#9ca3af',
            fontWeight: 800, fontSize: '1rem', cursor: canStart ? 'pointer' : 'not-allowed',
            fontFamily: "'Sora', sans-serif",
            boxShadow: canStart ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (canStart) e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {canStart ? '🚀 Rozpocznij egzamin →' : 'Wybierz arkusz egzaminacyjny'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EXAM SCREEN ──────────────────────────────────────────────────────────────
function ExamScreen({ sheet, hints: maxHints, timer: timerMode, lang: initialLang, onFinish, onAbort }) {
  const [activeTask,  setActiveTask]  = useState(0);
  const [codes,       setCodes]       = useState(() =>
    Object.fromEntries(sheet.tasks.map(t => [t.id, LANG_OPTIONS.find(l => l.id === initialLang)?.template || '']))
  );
  const [langs,       setLangs]       = useState(() =>
    Object.fromEntries(sheet.tasks.map(t => [t.id, t.type === 'konsola' ? initialLang : 'plaintext']))
  );
  const [scores,      setScores]      = useState({});   // taskId → { score, verdict, details }
  const [submitting,  setSubmitting]  = useState({});
  const [hintsUsed,   setHintsUsed]   = useState(() =>
    Object.fromEntries(sheet.tasks.map(t => [t.id, 0]))
  );
  const [tab, setTab] = useState('zadanie'); // 'zadanie' | 'wskazowki' | 'przyklad'

  const handleExpire = useCallback(() => {}, []);
  const examTimer = useExamTimer(timerMode === '180' ? 180 : null, handleExpire);

  const task = sheet.tasks[activeTask];
  const taskLang = langs[task.id];
  const currentCode = codes[task.id] || '';

  function setCode(val) {
    setCodes(prev => ({ ...prev, [task.id]: val }));
  }

  function revealHint(taskId) {
    setHintsUsed(prev => {
      const used = prev[taskId] || 0;
      const maxForTask = Math.min(maxHints, task.hints?.length || 0);
      if (used >= maxForTask) return prev;
      return { ...prev, [taskId]: used + 1 };
    });
  }

  async function handleSubmitTask() {
    const code = codes[task.id] || '';
    if (!code.trim()) return;
    setSubmitting(prev => ({ ...prev, [task.id]: true }));
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

      const criteriaList = (task.evaluation_criteria || []).map((c, i) => `${i+1}. ${c}`).join('\n');
      const langLabel = LANG_OPTIONS.find(l => l.id === taskLang)?.label || taskLang;

      const prompt = `Jesteś egzaminatorem oceniającym zadanie z egzaminu zawodowego INF.04 (technik programista).

ZADANIE: ${task.title}
TYP: ${TASK_TYPE_LABEL[task.type] || task.type}

TREŚĆ:
${task.description}

KRYTERIA OCENY:
${criteriaList}

PRZYKŁADOWE WYJŚCIE:
${task.example_output || 'Brak'}

KOD/ODPOWIEDŹ UCZNIA (${langLabel}):
\`\`\`
${code}
\`\`\`

Oceń rozwiązanie. Weź pod uwagę że:
- Zadania desktopowe/mobilne/webowe mogą być opisane słownie lub jako pseudokod
- Dla dokumentacji oceniaj kompletność i poprawność wzoru
- Dla zadań konsolowych oceniaj kod ścisłe według kryteriów

Odpowiedz TYLKO w formacie JSON (bez markdown, bez backticks):
{
  "score": <liczba 0-100>,
  "verdict": "<ZALICZONO|CZĘŚCIOWO|NIEZALICZONO>",
  "criteria_results": [
    { "criterion": "<treść kryterium>", "passed": <true|false>, "comment": "<komentarz>" }
  ],
  "general_comment": "<ogólny komentarz po polsku, 2-3 zdania>",
  "improvements": ["<co poprawić 1>", "<co poprawić 2>"]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);
      setScores(prev => ({ ...prev, [task.id]: { ...parsed, submittedAt: Date.now() } }));
    } catch (err) {
      setScores(prev => ({ ...prev, [task.id]: { error: true, message: err.message, score: 0, verdict: 'BŁĄD' } }));
    }
    setSubmitting(prev => ({ ...prev, [task.id]: false }));
  }

  function handleFinish() {
    const results = sheet.tasks.map(t => ({
      task: t,
      code: codes[t.id],
      score: scores[t.id] || null,
    }));
    onFinish(results, examTimer.elapsed);
  }

  const timerColor  = examTimer.danger ? '#dc2626' : examTimer.warning ? '#d97706' : '#7c3aed';
  const timerBg     = examTimer.danger ? 'rgba(220,38,38,0.08)' : examTimer.warning ? 'rgba(217,119,6,0.08)' : 'rgba(124,58,237,0.07)';
  const timerBorder = examTimer.danger ? 'rgba(220,38,38,0.25)' : examTimer.warning ? 'rgba(217,119,6,0.25)' : 'rgba(124,58,237,0.2)';

  const taskScore = scores[task.id];
  const isSubmitting = submitting[task.id];
  const hintsUsedForTask = hintsUsed[task.id] || 0;
  const maxHintsForTask = Math.min(maxHints, task.hints?.length || 0);

  // Determine editor language
  const editorLang = task.type === 'konsola' ? taskLang : 'plaintext';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Sora', sans-serif", background: '#1e1e2e', overflow: 'hidden' }}>

      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem', height: 52, flexShrink: 0,
        background: 'rgba(245,243,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(124,58,237,0.12)',
        boxShadow: '0 2px 12px rgba(124,58,237,0.07)',
        gap: '0.75rem',
      }}>
        {/* Logo + tytuł */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <Link to="/learn/egzamin-praktyczny" onClick={onAbort} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <img src="/landscape_jamiq.png" alt="ExamIQ" style={{ height: 30, width: 'auto' }} />
          </Link>
          <span style={{ color: 'rgba(124,58,237,0.3)', fontSize: '1rem', flexShrink: 0 }}>›</span>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#3b0764', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {sheet.title}
          </span>
        </div>

        {/* Task tabs */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {sheet.tasks.map((t, i) => {
            const s = scores[t.id];
            const done = !!s && !s.error;
            const active = i === activeTask;
            return (
              <button key={t.id} onClick={() => { setActiveTask(i); setTab('zadanie'); }} style={{
                padding: '0.3rem 0.75rem', borderRadius: 8,
                border: active ? '2px solid #7c3aed' : '1.5px solid rgba(124,58,237,0.15)',
                background: active ? 'rgba(124,58,237,0.1)' : done ? 'rgba(22,163,74,0.07)' : 'transparent',
                cursor: 'pointer', fontFamily: "'Sora', sans-serif", transition: 'all 0.12s',
                fontWeight: 700, fontSize: '0.75rem',
                color: active ? '#7c3aed' : done ? '#16a34a' : '#6b7280',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
                {done && <span style={{ fontSize: '0.65rem' }}>✓</span>}
                Zadanie {i + 1}
              </button>
            );
          })}
        </div>

        {/* Timer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: timerBg, border: `1px solid ${timerBorder}`,
          borderRadius: 10, padding: '0.3rem 0.75rem', flexShrink: 0, transition: 'all 0.3s',
        }}>
          {timerMode !== 'unlimited' && (
            <div style={{ width: 36, height: 3, borderRadius: 2, background: 'rgba(124,58,237,0.12)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${100 - examTimer.pct}%`, background: timerColor, borderRadius: 2, transition: 'width 1s linear' }} />
            </div>
          )}
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem', color: timerColor, letterSpacing: 1 }}>
            {timerMode === 'unlimited'
              ? examTimer.fmt(null)
              : examTimer.fmt(examTimer.remaining)}
          </span>
          {timerMode === 'unlimited' && <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>minęło</span>}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
          {task.type === 'konsola' && (
            <select value={taskLang} onChange={e => setLangs(prev => ({ ...prev, [task.id]: e.target.value }))} style={{
              background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(124,58,237,0.18)',
              color: '#374151', borderRadius: 8, padding: '0.28rem 0.55rem',
              fontSize: '0.78rem', fontFamily: "'Sora', sans-serif", cursor: 'pointer', fontWeight: 700, outline: 'none',
            }}>
              {LANG_OPTIONS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          )}
          <button onClick={onAbort} style={{
            background: 'transparent', border: '1.5px solid rgba(124,58,237,0.18)',
            color: '#6b7280', borderRadius: 8, padding: '0.28rem 0.7rem',
            fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif",
          }}>← Wyjdź</button>
          <button onClick={handleSubmitTask} disabled={isSubmitting || !currentCode.trim()} style={{
            background: isSubmitting ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,#7c3aed,#a78bfa)',
            border: 'none', color: '#fff', borderRadius: 8,
            padding: '0.33rem 1rem', fontSize: '0.82rem', fontWeight: 800,
            cursor: isSubmitting || !currentCode.trim() ? 'not-allowed' : 'pointer',
            fontFamily: "'Sora', sans-serif", opacity: !currentCode.trim() ? 0.5 : 1,
          }}>
            {isSubmitting ? '⏳ Oceniam...' : '▶ Oceń zadanie'}
          </button>
          <button onClick={handleFinish} style={{
            background: 'rgba(22,163,74,0.1)', border: '1.5px solid rgba(22,163,74,0.3)',
            color: '#16a34a', borderRadius: 8, padding: '0.28rem 0.8rem',
            fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif",
          }}>Zakończ egzamin ✓</button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT PANEL — treść + feedback */}
        <div style={{
          width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column',
          background: 'rgba(245,243,255,0.97)', borderRight: '1px solid rgba(124,58,237,0.1)',
          overflow: 'hidden',
        }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(124,58,237,0.1)', flexShrink: 0 }}>
            {[
              { id: 'zadanie',    label: 'Zadanie' },
              { id: 'wskazowki', label: `Wskazówki (${hintsUsedForTask}/${maxHintsForTask})` },
              { id: 'przyklad',  label: 'Przykład' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: '0.65rem 0.5rem', background: 'none',
                border: 'none', borderBottom: tab === t.id ? '2.5px solid #7c3aed' : '2.5px solid transparent',
                cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                fontWeight: tab === t.id ? 700 : 500, fontSize: '0.78rem',
                color: tab === t.id ? '#7c3aed' : '#9ca3af', transition: 'all 0.12s',
              }}>{t.label}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>

            {tab === 'zadanie' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{TASK_TYPE_ICON[task.type]}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7c3aed', background: 'rgba(124,58,237,0.08)', padding: '0.2rem 0.55rem', borderRadius: 6, border: '1px solid rgba(124,58,237,0.15)' }}>
                    {task.label}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#3b0764', margin: '0 0 0.75rem', lineHeight: 1.3 }}>{task.title}</h2>
                <pre style={{
                  fontSize: '0.8rem', color: '#374151', lineHeight: 1.7,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  background: 'rgba(124,58,237,0.04)', borderRadius: 10,
                  padding: '1rem', border: '1px solid rgba(124,58,237,0.08)',
                  fontFamily: "'Sora', sans-serif",
                }}>{task.description}</pre>

                {/* Kryteria */}
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                    Kryteria oceny ({task.evaluation_criteria?.length || 0} pkt możliwych)
                  </div>
                  {task.evaluation_criteria?.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.3rem 0', borderBottom: '1px solid rgba(124,58,237,0.05)', fontSize: '0.78rem', color: '#6b7280' }}>
                      <span style={{ color: '#a78bfa', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'wskazowki' && (
              <div>
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(124,58,237,0.06)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.12)', fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.6 }}>
                  {maxHints === 0
                    ? '🏆 Wybrałeś tryb ekspercki — brak wskazówek.'
                    : `Możesz użyć maksymalnie ${maxHints} wskazówek na to zadanie. Każda wskazówka odkrywana jest osobno.`
                  }
                </div>

                {task.hints?.map((hint, i) => {
                  const revealed = i < hintsUsedForTask;
                  const canReveal = !revealed && i === hintsUsedForTask && hintsUsedForTask < maxHintsForTask;
                  return (
                    <div key={i} style={{
                      marginBottom: '0.75rem',
                      background: revealed ? 'rgba(255,255,255,0.9)' : 'rgba(124,58,237,0.04)',
                      border: `1px solid ${revealed ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.1)'}`,
                      borderRadius: 12, overflow: 'hidden',
                    }}>
                      <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa' }}>Wskazówka {i + 1}</span>
                        {!revealed && canReveal && (
                          <button onClick={() => revealHint(task.id)} style={{
                            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                            color: '#7c3aed', borderRadius: 7, padding: '0.25rem 0.65rem',
                            fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                          }}>Odkryj 💡</button>
                        )}
                        {!revealed && !canReveal && maxHints > 0 && (
                          <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                            {i >= maxHintsForTask ? '🔒 limit wskazówek' : '🔒 odkryj poprzednią'}
                          </span>
                        )}
                      </div>
                      {revealed && (
                        <div style={{ padding: '0 1rem 0.85rem', fontSize: '0.8rem', color: '#374151', lineHeight: 1.65 }}>
                          {hint}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'przyklad' && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                  Przykładowe wyjście / format
                </div>
                <pre style={{
                  background: '#1e1e2e', color: '#d4d4d4', borderRadius: 10, padding: '1rem',
                  fontSize: '0.78rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace", margin: 0,
                  border: '1px solid rgba(124,58,237,0.15)',
                }}>{task.example_output}</pre>
              </div>
            )}

            {/* Feedback box */}
            {taskScore && !taskScore.error && (
              <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 14, overflow: 'hidden' }}>
                {/* Score header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: taskScore.score >= 75
                    ? 'linear-gradient(135deg,rgba(22,163,74,0.1),rgba(22,163,74,0.05))'
                    : taskScore.score >= 50
                    ? 'linear-gradient(135deg,rgba(217,119,6,0.1),rgba(217,119,6,0.05))'
                    : 'linear-gradient(135deg,rgba(220,38,38,0.1),rgba(220,38,38,0.05))',
                  borderBottom: '1px solid rgba(124,58,237,0.08)',
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#374151', marginBottom: 2 }}>Wynik AI</div>
                    <div style={{ fontSize: '0.72rem', color: taskScore.score >= 75 ? '#16a34a' : taskScore.score >= 50 ? '#d97706' : '#dc2626', fontWeight: 700 }}>
                      {taskScore.verdict}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '2rem', fontWeight: 900, lineHeight: 1,
                    color: taskScore.score >= 75 ? '#16a34a' : taskScore.score >= 50 ? '#d97706' : '#dc2626',
                  }}>
                    {taskScore.score}<span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.6 }}>/100</span>
                  </div>
                </div>

                {/* Criteria */}
                {taskScore.criteria_results?.map((cr, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.6rem', padding: '0.45rem 1rem', borderBottom: i < taskScore.criteria_results.length - 1 ? '1px solid rgba(124,58,237,0.05)' : 'none', alignItems: 'flex-start' }}>
                    <span style={{ color: cr.passed ? '#16a34a' : '#dc2626', fontWeight: 900, fontSize: '0.8rem', flexShrink: 0, marginTop: 2 }}>{cr.passed ? '✓' : '✗'}</span>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#374151', fontWeight: cr.passed ? 500 : 700 }}>{cr.criterion}</div>
                      {cr.comment && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2 }}>{cr.comment}</div>}
                    </div>
                  </div>
                ))}

                {/* Comment */}
                {taskScore.general_comment && (
                  <div style={{ padding: '0.85rem 1rem', background: 'rgba(124,58,237,0.04)', borderTop: '1px solid rgba(124,58,237,0.08)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Komentarz</div>
                    <div style={{ fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.6 }}>{taskScore.general_comment}</div>
                  </div>
                )}

                {/* Improvements */}
                {taskScore.improvements?.length > 0 && (
                  <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid rgba(124,58,237,0.08)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Co poprawić</div>
                    {taskScore.improvements.map((imp, i) => (
                      <div key={i} style={{ fontSize: '0.77rem', color: '#4b5563', lineHeight: 1.55, marginBottom: 6, paddingLeft: '0.75rem', borderLeft: '2px solid rgba(124,58,237,0.3)' }}>{imp}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {taskScore?.error && (
              <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, fontSize: '0.78rem', color: '#dc2626' }}>
                ⚠️ Błąd oceny: {taskScore.message}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL — Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Editor header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.5rem 1rem', background: '#252526', borderBottom: '1px solid #3e3e42', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                {task.type === 'konsola' ? `main.${taskLang === 'python' ? 'py' : taskLang === 'cpp' ? 'cpp' : taskLang === 'java' ? 'java' : 'cs'}` : 'odpowiedz.txt'}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
              {task.type !== 'konsola' ? '📝 Wpisz kod lub opis rozwiązania' : '💻 Edytor kodu'}
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <MonacoEditor
              lang={task.type === 'konsola' ? taskLang : 'plaintext'}
              value={currentCode}
              onChange={setCode}
              height="100%"
            />
          </div>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.25); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.45); }
      `}</style>
    </div>
  );
}

// ─── SUMMARY SCREEN ───────────────────────────────────────────────────────────
function SummaryScreen({ sheet, results, elapsed, onRestart }) {
  function fmtTime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    return `${m}m ${sec}s`;
  }

  const scoredResults = results.filter(r => r.score);
  const avgScore = scoredResults.length > 0
    ? Math.round(scoredResults.reduce((sum, r) => sum + (r.score?.score || 0), 0) / scoredResults.length)
    : null;

  const passed = avgScore !== null && avgScore >= 75;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f5f3ff 0%,#ede9fe 45%,#e0e7ff 100%)', fontFamily: "'Sora', sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>
            {avgScore === null ? '📋' : passed ? '🎉' : avgScore >= 50 ? '⚠️' : '😓'}
          </div>
          {avgScore !== null ? (
            <>
              <h1 style={{ fontSize: 'clamp(2.5rem,8vw,4rem)', fontWeight: 900, letterSpacing: '-2px', color: passed ? '#166534' : avgScore >= 50 ? '#92400e' : '#991b1b', margin: '0 0 0.25rem' }}>
                {avgScore}%
              </h1>
              <p style={{ color: passed ? '#16a34a' : avgScore >= 50 ? '#d97706' : '#dc2626', fontWeight: 700, fontSize: '1rem' }}>
                {passed ? '✅ Egzamin zaliczony!' : avgScore >= 50 ? '⚠️ Częściowo poprawne' : '❌ Nie zaliczono — spróbuj jeszcze raz'}
              </p>
            </>
          ) : (
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#3b0764', margin: '0 0 0.25rem' }}>Egzamin zakończony</h1>
          )}
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Czas: {fmtTime(elapsed)} · {sheet.title}
          </p>
        </div>

        {/* Wyniki per zadanie */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {results.map((r, i) => {
            const s = r.score;
            const score = s?.score ?? null;
            const hasScore = score !== null && !s?.error;
            return (
              <div key={r.task.id} style={{
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(124,58,237,0.12)', borderRadius: 18,
                padding: '1.25rem', boxShadow: '0 2px 16px rgba(124,58,237,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{TASK_TYPE_ICON[r.task.type]}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#3b0764' }}>{r.task.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{r.task.title}</div>
                    </div>
                  </div>
                  {hasScore ? (
                    <div style={{
                      fontSize: '1.6rem', fontWeight: 900,
                      color: score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626',
                    }}>
                      {score}<span style={{ fontSize: '0.75rem', opacity: 0.5 }}>/100</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>nie oceniono</span>
                  )}
                </div>

                {/* Progress bar */}
                {hasScore && (
                  <div style={{ height: 4, background: 'rgba(124,58,237,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${score}%`,
                      background: score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626',
                      borderRadius: 2, transition: 'width 0.6s ease',
                    }} />
                  </div>
                )}

                {s?.general_comment && (
                  <div style={{ marginTop: '0.65rem', fontSize: '0.77rem', color: '#6b7280', lineHeight: 1.55, fontStyle: 'italic' }}>
                    {s.general_comment}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onRestart} style={{
            padding: '0.9rem 2rem', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
            color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: '0.95rem',
            cursor: 'pointer', fontFamily: "'Sora', sans-serif", boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
          }}>Nowy egzamin →</button>
          <Link to="/exam" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '0.9rem 2rem', background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(124,58,237,0.2)', borderRadius: 14,
              color: '#7c3aed', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              fontFamily: "'Sora', sans-serif",
            }}>Dashboard</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ExamPracticePage() {
  usePageTitle('Egzamin praktyczny');
  const [phase,   setPhase]   = useState('setup');
  const [config,  setConfig]  = useState(null);
  const [results, setResults] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  if (phase === 'setup') {
    return (
      <SetupScreen
        onStart={cfg => { setConfig(cfg); setPhase('exam'); }}
      />
    );
  }

  if (phase === 'exam') {
    return (
      <ExamScreen
        sheet={config.sheet}
        hints={config.hints}
        timer={config.timer}
        lang={config.lang}
        onFinish={(res, el) => { setResults(res); setElapsed(el); setPhase('summary'); }}
        onAbort={() => setPhase('setup')}
      />
    );
  }

  return (
    <SummaryScreen
      sheet={config.sheet}
      results={results}
      elapsed={elapsed}
      onRestart={() => { setConfig(null); setPhase('setup'); }}
    />
  );
}