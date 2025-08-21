# Code Compass CLI

Ein kleines CLI-Tool zur Analyse von TypeScript-Code anhand von Metriken wie McCabe-Komplexität und Halstead-Metriken.

## 📦 Installation

```bash
bun install
```

## 🚀 Nutzung

```bash
bun run src/cli/index.ts
```

## 🛠 Ziel

Das Tool soll in der Lage sein, grundlegende Komplexitätsmetriken zu berechnen, um Entwicklern bei API-Migrationen und Refactoring-Entscheidungen zu unterstützen. Es wird im Rahmen einer Bachelorarbeit entwickelt und dient als technischer Prototyp zur Analyse von Codequalität.

## 📚 Geplante Features

- ✅ Einlesen von TypeScript-Dateien
- ✅ AST-Parsing mit Metrikberechnung
- ✅ Halstead- & McCabe-Metriken
- ✅ Möglichkeit zur Analyse ganzer Ordner
- ✅ Ausgabe im CLI oder als JSON

## 🔧 Tech Stack

- Bun – Runtime & Package Manager
- TypeScript
- Custom Parser / AST-Werkzeuge

## 📅 Status: Frühphase – wird aktiv weiterentwickelt

---

# Code Metrics CLI

A small CLI tool for analyzing TypeScript code using metrics such as McCabe complexity and Halstead metrics.

## 📦 Installation

```bash
bun install
```

## 🚀 Usage

```bash
bun run src/cli/index.ts
```

## 🛠 Purpose

The tool is designed to calculate basic code complexity metrics to support developers in API migrations and refactoring decisions. It is developed as part of a bachelor's thesis and serves as a technical prototype for code quality analysis.

## 📚 Planned Features

- ✅ Reading TypeScript files
- ✅ AST parsing with metric computation
- ✅ Halstead & McCabe metrics
- ✅ Ability to analyze entire folders
- ✅ Output inside CLI or as JSON

## 🔧 Tech Stack

- Bun – Runtime & package manager
- TypeScript
- Custom parser / AST utilities

## 📅 Status: Early stage – actively being developed

## TODO:

    - Projektvergleich:
        - Terminal:
            - Aggregierte Daten ✅
            - Detaillierte Daten 🛠 (Problem: Viele Dateien, wird im Terminal nicht angezeigt)
            - Komplette Daten 🛠 (Aggregierte Daten werden oben angezeigt, Detailierte Daten sind zu lang)
        - JSON:
            - Aggregierte Daten ✅
            - Detaillierte Daten ✅
            - Komplette Daten ✅
    - Dateivergleich 🛠
        - Terminal:
            - Aggregierte Daten 🛠
            - Detaillierte Daten 🛠
            - Komplette Daten 🛠
        - JSON:
            - Aggregierte Daten 🛠
            - Detaillierte Daten 🛠
            - Komplette Daten 🛠
        - Dateivergleich wird richtig berechnet, die korrekte Ausgabe ist WIP
